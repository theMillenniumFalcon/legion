import cors, { CorsOptions } from "cors";
import { IpFilter } from 'express-ipfilter';

const createCorsOptions = (apiRoute: any): CorsOptions => {
    return {
        origin(origin: string, callback: Function) {
            if (apiRoute.allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(new Error("Not allowed by CORS"), false)
            }
        },
        methods: apiRoute.method
    }
}

// Restricts the IP addresses that can make requests to the endpoint
export const middlewareRestriction = (apiRoute: any): Function => {
    if (!apiRoute.restriction) return cors()

    switch (apiRoute.restriction) {
        case 'IP':
            return IpFilter(apiRoute.allowedIps, { mode: 'allow' })
        case 'HTTP':
            return cors(createCorsOptions(apiRoute))
        default:
            throw new Error("Invalid restriction type")
    }
}