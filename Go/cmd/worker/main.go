package main

import (
	"context"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"go.uber.org/zap"

	"XKA/pkg/RedisClient"
	"XKA/pkg/logger"

	"XKA/internal/shared/builder"

	"XKA/internal/worker/runner"
)

const (
	maxRetries = 3
	retryDelay = 5 * time.Second
	queueName  = "workflows"
	popTimeout = 5 * time.Second
)

func main() {
	// Initialize logger
	logger.Init()
	defer logger.Log.Sync()
	logger.Log.Info("Starting worker")

	// Load environment variables
	if err := loadEnv(); err != nil {
		logger.Log.Warn("Failed to load .env file", zap.Error(err))
	}

	// Initialize Redis client with retry
	client, err := initRedisWithRetry()
	if err != nil {
		logger.Log.Fatal("Failed to initialize Redis client", zap.Error(err))
	}

	// Setup graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go handleShutdown(cancel)

	logger.Log.Info("Worker started successfully")

	// Main worker loop
	runWorker(ctx, client)

	logger.Log.Info("Worker stopped gracefully")
}

func loadEnv() error {
	envPath := filepath.Join("..", "..", "..", ".env")
	return godotenv.Load(envPath)
}

func initRedisWithRetry() (*RedisClient.Client, error) {
	var client *RedisClient.Client
	var err error

	for i := 0; i < maxRetries; i++ {
		client = RedisClient.GetClient()
		if client != nil && client.Ping() == nil {
			logger.Log.Info("Redis client initialized successfully")
			return client, nil
		}

		logger.Log.Warn("Redis connection failed, retrying...",
			zap.Int("attempt", i+1),
			zap.Int("max_retries", maxRetries),
		)

		if i < maxRetries-1 {
			time.Sleep(retryDelay)
		}
	}

	return nil, err
}

func handleShutdown(cancel context.CancelFunc) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	sig := <-sigChan
	logger.Log.Info("Shutdown signal received", zap.String("signal", sig.String()))
	cancel()
}

func runWorker(ctx context.Context, client *RedisClient.Client) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
			if err := processJob(client); err != nil {
				// logger.Log.Error("Failed to process job", zap.Error(err))
				// time.Sleep(retryDelay)
			}
		}
	}
}

func processJob(client *RedisClient.Client) error {
	// Check Redis connection
	if err := client.Ping(); err != nil {
		return err
	}

	// Pop job from queue (blocking operation)
	job, err := client.BRPop(popTimeout, queueName)
	if err != nil {
		return err
	}

	// No job available (timeout)
	if job == nil {
		// logger.Log.Debug("No job available, continuing...")
		return nil
	}

	// Job found
	logger.Log.Debug("Job received",
		zap.String("queue", job[0]),
		zap.String("job", job[1]),
	)

	// TODO: Process job here
	// processJobData(job[1])

	workflow, err := builder.ParseWorkflowFromJSON( job[1])
	if err != nil {
		logger.Log.Error("Failed to parse workflow from JSON", zap.Error(err))
		return err
	}

	testID := "test_" + time.Now().Format("20060102150405")
	err = runner.Run(workflow, testID)
	if err != nil {
		logger.Log.Error("Failed to run workflow", zap.Error(err))
	}

	return nil
}