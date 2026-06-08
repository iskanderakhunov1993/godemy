FROM mirror.gcr.io/library/golang:1.26-alpine

RUN addgroup -g 10001 -S runner \
    && adduser -u 10001 -S runner -G runner

WORKDIR /workspace
USER runner

ENV HOME=/tmp \
    GOCACHE=/tmp/go-cache \
    GOTMPDIR=/tmp/go-tmp \
    GOPATH=/tmp/go

CMD ["go", "version"]
