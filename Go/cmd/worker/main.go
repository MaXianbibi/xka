package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"go.uber.org/zap"

	"XKA/internal/shared/builder"
	"XKA/internal/worker/runner"
	"XKA/pkg/RedisClient"
	"XKA/pkg/logger"

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
	env := os.Getenv("ENV") // "production", "dev", "local", "test"...
	
	if env != "production" {
		envPath := filepath.Join(".env")
		err := godotenv.Load(".env")
		if err != nil {
			logger.Log.Warn("No .env file found, using default environment variables",
				zap.String("path", envPath),
				zap.Error(err),
			)
		} else {
			logger.Log.Info(".env file loaded successfully",
				zap.String("path", envPath),
			)
		}
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
	wRes, err := runner.Run(workflow, testID)
	if err != nil {
		logger.Log.Error("Failed to run workflow", zap.Error(err))
	}

	jsonData, err := json.Marshal(wRes)
	if err != nil {
		logger.Log.Error("Failed to marshal workflow result to JSON", zap.Error(err))
	}

	fmt.Println("Workflow Result:", string(jsonData))

	return nil
}