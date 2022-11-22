import type { NextApiResponse } from 'next';
import type { OutgoingHttpHeaders } from 'http';
import { render } from 'micromustache';
import type { ApiRoute } from '@prisma/client';

import { QueryParams, ExpandedHeaders } from "../../pages/api/v1/_types";

// add query params to the URL object
export const addQueryParams = (url: URL, query: QueryParams) => {
    for (const [key, value] of query) {
        url.searchParams.append(key, value)
    }
}

// merge different header objects into a single object
export const mergeHeaders = (...manyHeaders: ExpandedHeaders[]): Record<string, string> => {
    const result = new Headers()

    for (const headers of manyHeaders) {
        for (const [key, value] of headers) {
            result.append(key, value)
        }
    }

    return Object.fromEntries(result)
}

// apply all headers to the response object
export const setAllHeaders = (res: NextApiResponse, headers: OutgoingHttpHeaders) => {
    Object.entries(headers)
        .filter(([key]) => {
            // Remove access-control headers from API response as custom ones will be added by "Restriction" middleware
            return !key.toLowerCase().startsWith('access-control-');
        })
        .forEach(([key, value]) => {
            value && res.setHeader(key, value)
        })
}

// return all object entries with values as arrays
export function expandObjectEntries(object: { [key: string]: string | string[] }) {
    const result: [string, string][] = []
    for (const [key, value] of Object.entries(object)) {
        const arrayValue = Array.isArray(value) ? value : [value]
        arrayValue.forEach((value) => {
            result.push([key, value])
        })
    }

    return result
}

// calcuulate a moving average
export const movingAverage = (apiRoute: ApiRoute, timeTaken: number) => {
    return Math.round((apiRoute.avgResponseMs * (apiRoute.successes) + timeTaken) / (apiRoute.successes + 1))
}

// Substitues the values of secrets in the query params or headers
export const substituteSecrets = (query: QueryParams | ExpandedHeaders, secrets: Record<string, string>) => {
    for (const entry of query) {
        entry[1] = render(entry[1], secrets)
    }

    return query
}