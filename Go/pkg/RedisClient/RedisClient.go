package RedisClient

import (


	"context"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"


	
	"XKA/pkg/logger"
)

// Client encapsule le client Redis avec des méthodes utilitaires
type Client struct {
	rdb *redis.Client
	ctx context.Context
}

var (
	instance *Client
	once     sync.Once
)

// GetClient retourne l'instance singleton du client Redis
func GetClient() *Client {
	once.Do(func() {
		instance = &Client{
			ctx: context.Background(),
		}
		instance.initClient()
	})
	return instance
}

// initClient initialise la connexion Redis
func (c *Client) initClient() {
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "localhost:6379" // valeur par défaut
	}

	password := os.Getenv("REDIS_PASSWORD")
	dbStr := os.Getenv("REDIS_DB")
	
	db := 0 // base par défaut
	if dbStr != "" {
		fmt.Sscanf(dbStr, "%d", &db)
	}

	// Configuration avec timeouts et pool de connexions optimisés
	c.rdb = redis.NewClient(&redis.Options{
		Addr:         host,
		Password:     password,
		DB:           db,
		PoolSize:     10,                // nombre de connexions dans le pool
		MinIdleConns: 5,                 // connexions inactives minimum
		MaxRetries:   3,                 // nombre de tentatives de reconnexion
		DialTimeout:  5 * time.Second,   // timeout de connexion
		ReadTimeout:  3 * time.Second,   // timeout de lecture
		WriteTimeout: 3 * time.Second,   // timeout d'écriture
		PoolTimeout:  4 * time.Second,   // timeout pour obtenir une connexion du pool
	})

	// Test de connexion avec timeout
	ctx, cancel := context.WithTimeout(c.ctx, 5*time.Second)
	defer cancel()

	if err := c.rdb.Ping(ctx).Err(); err != nil {
		logger.Log.Error("Échec de connexion à Redis", 
			zap.String("host", host), 
			zap.Error(err))
		panic(fmt.Sprintf("Redis connection failed: %v", err))
	}

	logger.Log.Info("Client Redis initialisé avec succès", 
		zap.String("host", host), 
		zap.Int("db", db))
}

// Set stocke une valeur avec une clé et une expiration optionnelle
func (c *Client) Set(key string, value interface{}, expiration time.Duration) error {
	err := c.rdb.Set(c.ctx, key, value, expiration).Err()
	if err != nil {
		logger.Log.Error("Erreur lors de l'écriture Redis", 
			zap.String("key", key), 
			zap.Error(err))
		return fmt.Errorf("failed to set key %s: %w", key, err)
	}
	return nil
}

// Get récupère une valeur par sa clé
func (c *Client) Get(key string) (string, error) {
	val, err := c.rdb.Get(c.ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", fmt.Errorf("key %s not found", key)
		}
		logger.Log.Error("Erreur lors de la lecture Redis", 
			zap.String("key", key), 
			zap.Error(err))
		return "", fmt.Errorf("failed to get key %s: %w", key, err)
	}
	return val, nil
}

// Exists vérifie si une clé existe
func (c *Client) Exists(key string) (bool, error) {
	result, err := c.rdb.Exists(c.ctx, key).Result()
	if err != nil {
		logger.Log.Error("Erreur lors de la vérification d'existence", 
			zap.String("key", key), 
			zap.Error(err))
		return false, fmt.Errorf("failed to check existence of key %s: %w", key, err)
	}
	return result > 0, nil
}

// Delete supprime une ou plusieurs clés
func (c *Client) Delete(keys ...string) error {
	if len(keys) == 0 {
		return fmt.Errorf("no keys provided for deletion")
	}
	
	err := c.rdb.Del(c.ctx, keys...).Err()
	if err != nil {
		logger.Log.Error("Erreur lors de la suppression", 
			zap.Strings("keys", keys), 
			zap.Error(err))
		return fmt.Errorf("failed to delete keys: %w", err)
	}
	return nil
}

// SetExpire définit une expiration sur une clé existante
func (c *Client) SetExpire(key string, expiration time.Duration) error {
	err := c.rdb.Expire(c.ctx, key, expiration).Err()
	if err != nil {
		logger.Log.Error("Erreur lors de la définition d'expiration", 
			zap.String("key", key), 
			zap.Duration("expiration", expiration),
			zap.Error(err))
		return fmt.Errorf("failed to set expiration for key %s: %w", key, err)
	}
	return nil
}

// GetTTL récupère le temps de vie restant d'une clé
func (c *Client) GetTTL(key string) (time.Duration, error) {
	ttl, err := c.rdb.TTL(c.ctx, key).Result()
	if err != nil {
		logger.Log.Error("Erreur lors de la récupération du TTL", 
			zap.String("key", key), 
			zap.Error(err))
		return 0, fmt.Errorf("failed to get TTL for key %s: %w", key, err)
	}
	return ttl, nil
}

// === OPÉRATIONS DE LISTES POUR JOBS/WORKERS ===

// LPush ajoute un ou plusieurs éléments au début d'une liste (pour publier des jobs)
func (c *Client) LPush(key string, values ...interface{}) (int64, error) {
	if len(values) == 0 {
		return 0, fmt.Errorf("no values provided for LPUSH")
	}
	
	result, err := c.rdb.LPush(c.ctx, key, values...).Result()
	if err != nil {
		logger.Log.Error("Erreur lors du LPUSH", 
			zap.String("key", key), 
			zap.Int("count", len(values)),
			zap.Error(err))
		return 0, fmt.Errorf("failed to LPUSH to key %s: %w", key, err)
	}
	
	logger.Log.Debug("Job ajouté à la queue", 
		zap.String("queue", key), 
		zap.Int64("new_length", result))
	
	return result, nil
}

// RPop retire et retourne le dernier élément d'une liste (pour consommer des jobs)
func (c *Client) RPop(key string) (string, error) {
	result, err := c.rdb.RPop(c.ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", fmt.Errorf("queue %s is empty", key)
		}
		logger.Log.Error("Erreur lors du RPOP", 
			zap.String("key", key), 
			zap.Error(err))
		return "", fmt.Errorf("failed to RPOP from key %s: %w", key, err)
	}
	return result, nil
}

// BRPop retire et retourne le dernier élément d'une liste avec timeout (bloquant)
// Utilisé par les workers pour attendre des jobs
func (c *Client) BRPop(timeout time.Duration, keys ...string) ([]string, error) {
	if len(keys) == 0 {
		return nil, fmt.Errorf("no keys provided for BRPOP")
	}
	
	result, err := c.rdb.BRPop(c.ctx, timeout, keys...).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, fmt.Errorf("timeout reached, no jobs available")
		}
		logger.Log.Error("Erreur lors du BRPOP", 
			zap.Strings("keys", keys), 
			zap.Duration("timeout", timeout),
			zap.Error(err))
		return nil, fmt.Errorf("failed to BRPOP from keys %v: %w", keys, err)
	}
	return result, nil
}

// LLen retourne la longueur d'une liste (nombre de jobs en attente)
func (c *Client) LLen(key string) (int64, error) {
	result, err := c.rdb.LLen(c.ctx, key).Result()
	if err != nil {
		logger.Log.Error("Erreur lors du LLEN", 
			zap.String("key", key), 
			zap.Error(err))
		return 0, fmt.Errorf("failed to get length of key %s: %w", key, err)
	}
	return result, nil
}

// LRange retourne une portion d'une liste (pour monitoring)
func (c *Client) LRange(key string, start, stop int64) ([]string, error) {
	result, err := c.rdb.LRange(c.ctx, key, start, stop).Result()
	if err != nil {
		logger.Log.Error("Erreur lors du LRANGE", 
			zap.String("key", key), 
			zap.Int64("start", start),
			zap.Int64("stop", stop),
			zap.Error(err))
		return nil, fmt.Errorf("failed to get range from key %s: %w", key, err)
	}
	return result, nil
}

// Increment incrémente une valeur numérique
func (c *Client) Increment(key string) (int64, error) {
	val, err := c.rdb.Incr(c.ctx, key).Result()
	if err != nil {
		logger.Log.Error("Erreur lors de l'incrémentation", 
			zap.String("key", key), 
			zap.Error(err))
		return 0, fmt.Errorf("failed to increment key %s: %w", key, err)
	}
	return val, nil
}

// IncrementBy incrémente une valeur numérique d'un montant spécifique
func (c *Client) IncrementBy(key string, value int64) (int64, error) {
	val, err := c.rdb.IncrBy(c.ctx, key, value).Result()
	if err != nil {
		logger.Log.Error("Erreur lors de l'incrémentation par valeur", 
			zap.String("key", key), 
			zap.Int64("value", value),
			zap.Error(err))
		return 0, fmt.Errorf("failed to increment key %s by %d: %w", key, value, err)
	}
	return val, nil
}

// GetRawClient retourne le client Redis brut pour des opérations avancées
func (c *Client) GetRawClient() *redis.Client {
	return c.rdb
}

// Close ferme la connexion Redis
func (c *Client) Close() error {
	if c.rdb != nil {
		err := c.rdb.Close()
		if err != nil {
			logger.Log.Error("Erreur lors de la fermeture de la connexion Redis", zap.Error(err))
			return fmt.Errorf("failed to close Redis connection: %w", err)
		}
		logger.Log.Info("Connexion Redis fermée")
	}
	return nil
}

// Ping teste la connexion Redis
func (c *Client) Ping() error {
	ctx, cancel := context.WithTimeout(c.ctx, 2*time.Second)
	defer cancel()
	
	err := c.rdb.Ping(ctx).Err()
	if err != nil {
		logger.Log.Error("Échec du ping Redis", zap.Error(err))
		return fmt.Errorf("redis ping failed: %w", err)
	}
	return nil
}

func (c *Client) RGet(key string) (string, error) {
    result, err := c.rdb.LIndex(c.ctx, key, -1).Result()
    if err != nil {
        if err == redis.Nil {
            return "", fmt.Errorf("queue %s is empty", key)
        }
        logger.Log.Error("Erreur lors du LINDEX", 
            zap.String("key", key), 
            zap.Error(err))
        return "", fmt.Errorf("failed to get last element from key %s: %w", key, err)
    }
    return result, nil
}
