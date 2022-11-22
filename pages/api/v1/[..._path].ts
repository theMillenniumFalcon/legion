import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiMethod } from '@prisma/client';
import axios from 'axios';
import { URL } from 'url';

import { middlewareRatelimit, middlewareRestriction } from '../../../lib/middlewares';
import type { QueryParams, ExpandedHeaders } from './_types';

import getApiRoute from '../../../lib/internals/get-api-route';
import { sendResponse } from '../../../lib/internals/send-response';
import { addQueryParams, expandObjectEntries, mergeHeaders } from '../../../lib/internals/utils';

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Function): Promise<any> => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                res.status(500).send(result.message)
                return
            }

            return resolve(result)
        })
    })
}

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Get ApiRoute object from database
    const { apiRoute, path } = await runMiddleware(req, res, getApiRoute)

    console.log(req.method)

    if (req.method !== "OPTIONS" && req.method !== apiRoute.method) {
        res.status(405).send("Method not allowed")
        return
    }

    // Middleware plugins
    await runMiddleware(req, res, middlewareRestriction(apiRoute))
    await runMiddleware(req, res, middlewareRatelimit(apiRoute))

    // Request preparation
    const requestUrl = new URL(`${apiRoute.apiUrl}/${path.join('/')}`)
    const currentQueryParams = expandObjectEntries(req.query)
    // Add query params
    addQueryParams(requestUrl, apiRoute.queryParams as QueryParams)
    addQueryParams(requestUrl, currentQueryParams)

    // Add request headers
    delete req.headers.host
    const currentHeaders: ExpandedHeaders = expandObjectEntries(req.headers)
    const requestHeaders = mergeHeaders(apiRoute.headers as ExpandedHeaders, currentHeaders)

    // Request made
    try {
        const apiResponse = await axios.request({
            method: apiRoute.method,
            url: requestUrl.toString(),
            headers: requestHeaders,

            // Get response as stream and prevent its decoding as proxy does not consume the result
            decompress: false,
            responseType: 'stream',

            data: apiRoute.method === ApiMethod.GET ? undefined : req.body,
        })

        // Response preparation
        sendResponse(res, apiResponse)
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.log("Axios error", err)
            sendResponse(res, err.response)
        } else {
            console.log("An error occurred!", err)
            res.status(500).send("Error occurred")
        }
    }
}