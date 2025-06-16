package main

import (
	"encoding/json"
	"net/http"


	"worker-managers/logger"
	"go.uber.org/zap"


	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
    logger.Init()
	logger.Log.Info("Starting worker server...")


	r := chi.NewRouter()

	// Middleware utiles
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.AllowContentType("application/json"))

	// Routes
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Welcome to your Go server 👋"))
	})

	r.Post("/v1/workflow", func(w http.ResponseWriter, r *http.Request) {
		var payload map[string]interface{}

		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
		
		// Log or process your data here
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "received"})
		
		logger.Log.Info("Received workflow data", zap.Any("data", payload))
	})

	// Lancer le serveur
	http.ListenAndServe(":8080", r)
}
