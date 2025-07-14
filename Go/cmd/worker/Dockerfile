FROM golang:1.24.4-alpine AS builder

WORKDIR /app
COPY . .
WORKDIR /app/cmd/worker
RUN go build -ldflags="-s -w" -o /worker

# --- 2ème phase : image légère pour exécution
FROM alpine:3.20

COPY --from=builder /worker /worker
WORKDIR /app/cmd/worker
EXPOSE 8080

ENTRYPOINT ["/worker"]