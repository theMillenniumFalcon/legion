import Redis, { Redis as RedisType } from 'ioredis';

let client: RedisType = new Redis(process.env.REDIS_URL);

export default client;
