FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . /app

RUN npx prisma db push

RUN npm run build

EXPOSE 3000

CMD ["./app"]
USER node