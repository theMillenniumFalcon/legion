declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOCAL_DATABASE_URL: string;
      POSTGRES_URL: string;
      POSTGRES_PRISMA_URL: string;
      POSTGRES_URL_NO_SSL: string;
      POSTGRES_URL_NON_POOLING: string;
      POSTGRES_USER: string;
      POSTGRES_HOST: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DATABASE: string;
      REDIS_URL: string;
      SECRETS_KEY: string;
      SECRETS_IV: string;
    }
  }
}

export { }
