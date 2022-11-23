declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      REDIS_URL: string;
      SECRETS_KEY: string;
      SECRETS_IV: string;
      NEXT_PUBLIC_MOCK_DEPLOYMENT: string;
    }
  }
}

export {}
