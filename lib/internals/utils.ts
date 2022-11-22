import { NextApiResponse } from 'next';
import type { OutgoingHttpHeaders } from 'http';

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
    Object.entries(headers).forEach(([key, value]) => {
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