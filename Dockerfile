# Многостадийная сборка для полного приложения
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Бэкенд на Go
FROM golang:1.21-alpine AS backend-builder

WORKDIR /backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN go build -o main .

# Финальный образ
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Копируем бинарник бэкенда
COPY --from=backend-builder /backend/main .

# Копируем собранный фронтенд
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 8080

CMD ["./main"]
