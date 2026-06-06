# Docker-based Go code runner image for production isolation
FROM golang:1.23-alpine

WORKDIR /sandbox

RUN addgroup -S runner && adduser -S runner -G runner
USER runner

CMD ["sh", "-c", "echo 'Runner image ready'"]
