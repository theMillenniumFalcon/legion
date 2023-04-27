declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      REDIS_URL: string;
      SECRETS_KEY: string;
      SECRETS_IV: string;
    }
  }
}

export { }
