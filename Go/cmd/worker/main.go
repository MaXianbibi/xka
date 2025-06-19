package main

import (
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"
	"go.uber.org/zap"

	"XKA/pkg/RedisClient"
	"XKA/pkg/logger"
)

func main() {
	logger.Init() 
	defer logger.Log.Sync() 
	logger.Log.Info("Démarrage du workers")

	envPath := filepath.Join("..", "..", "..", ".env")
	err := godotenv.Load(envPath)
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


	client := RedisClient.GetClient()
	if client == nil {
		logger.Log.Fatal("Failed to initialize Redis client")
		os.Exit(1)
	}

	logger.Log.Info("Redis client initialized successfully",
		zap.String("version", "1.0.0"),
		zap.Time("start_time", time.Now()),
	)

	
	for {
		if client.Ping() != nil {
			// ajouter un max de tentatives pour éviter une boucle infinie
			logger.Log.Error("Redis client ping failed, retrying in 5 seconds",
				zap.Error(client.Ping()),
			)
			time.Sleep(5 * time.Second)
			continue
		}

		job, err := client.BRPop( 5 * time.Second, "workflows")
		if err != nil {
			logger.Log.Error("Failed to pop job from Redis",
				zap.Error(err),
			)
			time.Sleep(5 * time.Second) // Wait before retrying
			continue
		}

		if job == nil {
			logger.Log.Info("No job found, waiting for new jobs",
				zap.Duration("wait_time", 5*time.Second),
			)
			time.Sleep(5 * time.Second) // Wait before checking again
			continue
		}

		logger.Log.Info("Job popped from Redis",
			zap.String("job", job[1]),
			zap.String("queue", job[0]),
		)
	}
}