import { ApiRoute } from '@prisma/client';
import { PartialQueryOptions } from '@/lib/middlewares/partial-query';
import { CachingOptions } from '@/lib/middlewares/cache';
import { RateLimitingOptions } from '@/lib/middlewares/rate-limit';
import { RestrictionOptions } from '@/lib/middlewares/restriction';

export type QueryParams = [string, string][]

export type ExpandedHeaders = [string, string][]

export type ApiRouteWithMiddlewares = Omit<ApiRoute, 'restriction' | 'rateLimiting' | 'caching' | 'partialQuery'> & {
    restriction: RestrictionOptions
    rateLimiting: RateLimitingOptions
    caching: CachingOptions
    partialQuery: PartialQueryOptions
}

