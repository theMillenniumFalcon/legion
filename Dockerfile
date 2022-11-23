FROM node:14-alpine

WORKDIR /app
COPY ./ ./

RUN npm install
RUN npm run build

EXPOSE 3000

COPY ./scripts/start.sh ./
RUN chmod +x ./scripts/start.sh

CMD ["sh", "./scripts/start.sh"]