package pg_client

import (
	"XKA/ent"
	"context"
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"sync"
	"time"

	"XKA/pkg/logger"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

var (
	instance *Client
	once     sync.Once
)

// Config holds database configuration
type Config struct {
	Host            string
	Port            string
	User            string
	Password        string
	DB              string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	EnableDebug     bool
}

// Client wraps the Ent client with additional functionality
type Client struct {
	ent    *ent.Client
	config *Config
}

// GetClient returns the singleton database client instance
func GetClient() *Client {
	once.Do(func() {
		config := loadConfig()
		entClient := initializeClient(config)

		instance = &Client{
			ent:    entClient,
			config: config,
		}

		logger.Log.Info("PostgreSQL client initialized",
			zap.String("host", config.Host),
			zap.String("db", config.DB))
	})

	return instance
}

// NewClient creates a new database client (useful for testing)
func NewClient(config *Config) (*Client, error) {
	entClient := initializeClient(config)
	return &Client{
		ent:    entClient,
		config: config,
	}, nil
}

// loadConfig loads configuration from environment variables
func loadConfig() *Config {
	return &Config{
		Host:            getEnv("POSTGRES_HOST", "localhost"),
		Port:            getEnv("POSTGRES_PORT", "5432"),
		User:            getEnv("POSTGRES_USER", "postgres"),
		Password:        getEnv("POSTGRES_PASSWORD", ""),
		DB:              getEnv("POSTGRES_DB", "xka"),
		MaxOpenConns:    getEnvInt("POSTGRES_MAX_OPEN_CONNS", 25),
		MaxIdleConns:    getEnvInt("POSTGRES_MAX_IDLE_CONNS", 5),
		ConnMaxLifetime: time.Duration(getEnvInt("POSTGRES_CONN_MAX_LIFETIME_MINUTES", 5)) * time.Minute,
		EnableDebug:     getEnvBool("POSTGRES_DEBUG", false),
	}
}

// initializeClient initializes the Ent client with proper connection pooling
func initializeClient(config *Config) *ent.Client {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.Host, config.Port, config.User, config.Password, config.DB,
	)

	// Open database connection with proper configuration
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		logger.Log.Fatal("Failed to open database connection", zap.Error(err))
	}

	// Configure connection pool
	db.SetMaxOpenConns(config.MaxOpenConns)
	db.SetMaxIdleConns(config.MaxIdleConns)
	db.SetConnMaxLifetime(config.ConnMaxLifetime)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		logger.Log.Fatal("Failed to ping database", zap.Error(err))
	}

	// Create Ent client with SQL driver
	drv := entsql.OpenDB(dialect.Postgres, db)
	client := ent.NewClient(ent.Driver(drv))

	if config.EnableDebug {
		client = client.Debug()
	}

	// Create schema with timeout
	schemaCtx, schemaCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer schemaCancel()

	if err := client.Schema.Create(schemaCtx); err != nil {
		logger.Log.Fatal("Failed to create database schema", zap.Error(err))
	}

	return client
}

// === Core Methods ===

// Ping tests the database connection
func (c *Client) Ping(ctx context.Context) error {
	_, err := c.ent.Workflow.Query().Count(ctx)
	return err
}

// Close closes the database connection
func (c *Client) Close() error {
	return c.ent.Close()
}

// Ent returns the raw Ent client for advanced operations
func (c *Client) Ent() *ent.Client {
	return c.ent
}

// Tx executes a function within a database transaction
func (c *Client) Tx(ctx context.Context, fn func(*ent.Tx) error) error {
	tx, err := c.ent.Tx(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}

	defer func() {
		if v := recover(); v != nil {
			tx.Rollback()
			panic(v)
		}
	}()

	if err := fn(tx); err != nil {
		if rerr := tx.Rollback(); rerr != nil {
			logger.Log.Error("Failed to rollback transaction", zap.Error(rerr))
		}
		return err
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// === Utility Functions ===

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value, exists := os.LookupEnv(key); exists {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}
