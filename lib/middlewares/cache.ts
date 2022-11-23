import { ApiMethod, ApiRoute } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { OutgoingHttpHeaders } from 'http';
import getStream from 'get-stream';
import { Readable } from 'stream';

import { client } from '../redis';
import { setAllHeaders } from '../internals/utils';

export type CachingOptions = {
    duration: number
}

// Caches the result and headers from the API and
export const cache = (apiRoute: ApiRoute) => {
    return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
        const cachingOpts = apiRoute.caching as CachingOptions
        // Caching is only supported on GET requests
        if (Object.keys(cachingOpts).length === 0 || apiRoute.method !== ApiMethod.GET) {
            next()
            return
        }

        const key = `cache:${apiRoute.method}:${req.url}`

        const [[cachedHeadersError, cachedHeaders], [cacheAgeError, cacheAge], [cachedResultError, cachedResult]] = await client.pipeline()
            .get(`${key}:headers`)
            .ttl(`${key}:headers`)
            .getBuffer(`${key}:response`)
            .exec()

        if (!cachedHeadersError && !cacheAgeError && !cachedResultError && cachedHeaders) {
            console.log("Cache middleware: HIT!")
            const headers: OutgoingHttpHeaders = JSON.parse(cachedHeaders as string)

            setAllHeaders(res, headers)
            res
                .setHeader('cache-control', `max-age=${Math.max(0, cacheAge as number)}`)
                .status(200)
            Readable.from(cachedResult as string).pipe(res)
            return
        }

        // Listen to data piped into response
        res.on('pipe', async (apiData) => {
            // Cache the data only if the request was a success
            if (res.statusCode === 200) {
                const { duration } = cachingOpts
                res.setHeader('cache-control', `max-age=${Math.max(0, duration)}`)

                const headers = JSON.stringify(res.getHeaders())
                const buffer = await getStream.buffer(apiData)

                await client
                    .pipeline()
                    .setex(`${key}:headers`, duration, headers)
                    .setex(`${key}:response`, duration, buffer)
                    .exec()

                console.log("Cache middleware: Added to cache")
            }
        })

        next()
    }
}