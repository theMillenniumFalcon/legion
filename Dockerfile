FROM node:14-bullseye-slim AS base

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

USER node

RUN npx prisma db push

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
