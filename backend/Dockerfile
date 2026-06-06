FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build in image build step and limit parallelism to reduce memory usage.
RUN CGO_ENABLED=0 go build -p=1 -o /app/server main.go

FROM alpine:3.21

WORKDIR /app

COPY --from=builder /app/server /app/server

EXPOSE 8080

CMD ["/app/server"]
