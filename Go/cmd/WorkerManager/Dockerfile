#---- Build stage
FROM golang:1.24.4-alpine AS builder

WORKDIR /app
COPY . .
WORKDIR /app/cmd/WorkerManager
RUN go build -ldflags="-s -w" -o /worker-manager

#---- Runtime stage
FROM alpine:3.20

COPY --from=builder /worker-manager /worker-manager

WORKDIR /app/cmd/WorkerManager
EXPOSE 8080

ENTRYPOINT ["/worker-manager"]
