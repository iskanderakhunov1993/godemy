FROM mirror.gcr.io/library/node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_BACKEND_URL=""
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

RUN npm run build
RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
