import type { NextApiRequest, NextApiResponse } from 'next';
import requestIp from 'request-ip';
import { ApiRouteWithMiddlewares } from '../../pages/api/v1/_types';

import { client } from '../redis';

export interface RateLimitingOptions extends MiddlewareOptions {
    windowSize: number,
    maxRequests: number
}

// Limits the number of requests that can be made within a specified time interval
export function rateLimit(apiRoute: ApiRouteWithMiddlewares) {
    return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
        const rateLimiting = apiRoute.rateLimiting as RateLimitingOptions
        if (!rateLimiting.enabled) {
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