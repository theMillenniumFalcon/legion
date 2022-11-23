import type { NextApiRequest, NextApiResponse } from "next";
import requestIp from 'request-ip';

import { client } from '../redis';

export type RateLimitingOptions = {
    windowSize: number,
    maxRequests: number
}

// rate limits the number of requests
export const rateLimit = (apiRoute: any) => {
    return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
        const rateLimiting = apiRoute.rateLimiting as RateLimitingOptions
        if (Object.keys(rateLimiting).length === 0) {
            next()
            return
        }

        const key = `${apiRoute.id}:${requestIp.getClientIp(req)}`
        const requests = await client.incr(key)

        if (requests === 1) {
            await client.expire(key, rateLimiting.windowSize)
        }

        if (requests > rateLimiting.maxRequests) {
            res.status(503).send("Too many requests made")
            return
        }

        next()
    }
}