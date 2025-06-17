package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"worker-managers/logger"
	"worker-managers/workflow"
	"worker-managers/workflow/parser"

	"go.uber.org/zap"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// Server configuration constants
const (
	DefaultPort         = "8080"
	ShutdownTimeout     = 30 * time.Second
	ReadTimeout         = 15 * time.Second
	WriteTimeout        = 15 * time.Second
	IdleTimeout         = 60 * time.Second
	MaxRequestBodySize  = 10 << 20 // 10MB
)

// APIResponse represents a standardized API response structure
type APIResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// WorkflowRequest represents the expected workflow payload structure
type WorkflowRequest struct {
	Nodes []interface{} `json:"nodes" validate:"required,min=1"`
	Edges []interface{} `json:"edges" validate:"required"`
}

// Server wraps the HTTP server with additional context and dependencies
type Server struct {
	router *chi.Mux
	logger *zap.Logger
	port   string
}

// NewServer creates a new server instance with proper configuration
func NewServer() *Server {
	return &Server{
		logger: logger.Log,
		port:   getPort(),
	}
}

// getPort retrieves the server port from environment or uses default
func getPort() string {
	if port := os.Getenv("PORT"); port != "" {
		return port
	}
	return DefaultPort
}

// setupRoutes configures all HTTP routes and middleware
func (s *Server) setupRoutes() {
	r := chi.NewRouter()

	// Essential middleware stack for production readiness
	r.Use(middleware.RequestID)     // Adds request ID for tracing
	r.Use(middleware.RealIP)        // Gets real client IP
	r.Use(middleware.Logger)        // Structured request logging
	r.Use(middleware.Recoverer)     // Graceful panic recovery
	r.Use(middleware.Heartbeat("/health")) // Health check endpoint
	
	// Security and performance middleware
	r.Use(middleware.AllowContentType("application/json"))
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Limit request body size to prevent abuse
			r.Body = http.MaxBytesReader(w, r.Body, MaxRequestBodySize)
			next.ServeHTTP(w, r)
		})
	})

	// API routes with versioning
	r.Route("/api", func(r chi.Router) {
		r.Route("/v1", func(r chi.Router) {
			r.Post("/workflow", s.handleWorkflowSubmission)
			r.Post("/workflow/validate", s.handleWorkflowValidation)
		})
	})

	// Root and utility routes
	r.Get("/", s.handleRoot)
	r.Get("/version", s.handleVersion)

	s.router = r
}

// handleRoot provides a welcome message and basic server info
func (s *Server) handleRoot(w http.ResponseWriter, r *http.Request) {
	response := APIResponse{
		Status:  "success",
		Message: "Worker Manager API Server",
		Data: map[string]interface{}{
			"version":   "1.0.0",
			"endpoints": []string{"/api/v1/workflow", "/health", "/version"},
			"docs":      "Visit /api/v1/workflow for workflow processing",
		},
	}
	
	s.writeJSONResponse(w, http.StatusOK, response)
}

// handleVersion returns server version information
func (s *Server) handleVersion(w http.ResponseWriter, r *http.Request) {
	response := APIResponse{
		Status: "success",
		Data: map[string]string{
			"version":    "1.0.0",
			"build_time": time.Now().Format(time.RFC3339),
			"go_version": runtime.Version(),
		},
	}
	
	s.writeJSONResponse(w, http.StatusOK, response)
}

// handleWorkflowSubmission processes workflow parsing requests
func (s *Server) handleWorkflowSubmission(w http.ResponseWriter, r *http.Request) {
	// Extract request ID for correlation
	requestID := middleware.GetReqID(r.Context())
	
	s.logger.Info("Processing workflow submission",
		zap.String("request_id", requestID),
		zap.String("client_ip", r.RemoteAddr),
	)

	// Parse and validate request payload
	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		s.logger.Warn("Invalid JSON payload received",
			zap.String("request_id", requestID),
			zap.Error(err),
		)
		
		s.writeErrorResponse(w, http.StatusBadRequest, "Invalid JSON payload", err.Error())
		return
	}

	// Basic payload validation
	if err := s.validateWorkflowPayload(payload); err != nil {
		s.logger.Warn("Workflow payload validation failed",
			zap.String("request_id", requestID),
			zap.Error(err),
		)
		
		s.writeErrorResponse(w, http.StatusBadRequest, "Invalid workflow payload", err.Error())
		return
	}

	// Parse workflow using the parser package
	parsedWorkflow, err := parser.ParseWorkflow(payload)
	if err != nil {
		s.logger.Error("Workflow parsing failed",
			zap.String("request_id", requestID),
			zap.Error(err),
		)
		
		s.writeErrorResponse(w, http.StatusUnprocessableEntity, "Failed to parse workflow", err.Error())
		return
	}

	// Log successful parsing with metrics
	s.logger.Info("Workflow parsed successfully",
		zap.String("request_id", requestID),
		zap.Int("node_count", len(parsedWorkflow.Nodes)),
		zap.Int("edge_count", len(parsedWorkflow.Edges)),
	)

	// TODO: Here you would typically:

	workflow.InitWorkflow(parsedWorkflow)

	// 1. Validate workflow business logic
	// 2. Save to database
	// 3. Queue for execution
	// 4. Return execution ID

	// Return success response with workflow summary
	response := APIResponse{
		Status:  "success",
		Message: "Workflow parsed and queued successfully",
		Data: map[string]interface{}{
			"request_id":  requestID,
			"node_count":  len(parsedWorkflow.Nodes),
			"edge_count":  len(parsedWorkflow.Edges),
			"created_at":  time.Now().UTC().Format(time.RFC3339),
			// "execution_id": "uuid-here", // TODO: Add when implementing execution
		},
	}

	s.writeJSONResponse(w, http.StatusCreated, response)
}

// handleWorkflowValidation validates workflow without processing it
func (s *Server) handleWorkflowValidation(w http.ResponseWriter, r *http.Request) {
	// This endpoint can be used to validate workflows without processing them
	// Useful for frontend validation or testing
	
	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		s.writeErrorResponse(w, http.StatusBadRequest, "Invalid JSON payload", err.Error())
		return
	}

	// Validate using parser (dry run)
	_, err := parser.ParseWorkflow(payload)
	if err != nil {
		s.writeErrorResponse(w, http.StatusUnprocessableEntity, "Workflow validation failed", err.Error())
		return
	}

	response := APIResponse{
		Status:  "success",
		Message: "Workflow validation passed",
	}

	s.writeJSONResponse(w, http.StatusOK, response)
}

// validateWorkflowPayload performs basic payload structure validation
func (s *Server) validateWorkflowPayload(payload map[string]interface{}) error {
	// Check for required top-level fields
	if _, exists := payload["nodes"]; !exists {
		return fmt.Errorf("missing required field: nodes")
	}
	
	if _, exists := payload["edges"]; !exists {
		return fmt.Errorf("missing required field: edges")
	}

	// Validate nodes is an array
	if nodes, ok := payload["nodes"].([]interface{}); !ok {
		return fmt.Errorf("nodes must be an array")
	} else if len(nodes) == 0 {
		return fmt.Errorf("workflow must contain at least one node")
	}

	// Validate edges is an array
	if _, ok := payload["edges"].([]interface{}); !ok {
		return fmt.Errorf("edges must be an array")
	}

	return nil
}

// writeJSONResponse writes a standardized JSON response
func (s *Server) writeJSONResponse(w http.ResponseWriter, statusCode int, response APIResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(statusCode)
	
	if err := json.NewEncoder(w).Encode(response); err != nil {
		s.logger.Error("Failed to encode JSON response", zap.Error(err))
	}
}

// writeErrorResponse writes a standardized error response
func (s *Server) writeErrorResponse(w http.ResponseWriter, statusCode int, message, detail string) {
	response := APIResponse{
		Status:  "error",
		Message: message,
		Error:   detail,
	}
	
	s.writeJSONResponse(w, statusCode, response)
}

// Start launches the HTTP server with graceful shutdown support
func (s *Server) Start() error {
	s.setupRoutes()

	// Create HTTP server with production-ready timeouts
	server := &http.Server{
		Addr:         ":" + s.port,
		Handler:      s.router,
		ReadTimeout:  ReadTimeout,
		WriteTimeout: WriteTimeout,
		IdleTimeout:  IdleTimeout,
	}

	// Channel to listen for interrupt signals
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Start server in a goroutine
	go func() {
		s.logger.Info("Starting HTTP server",
			zap.String("port", s.port),
			zap.String("address", "http://localhost:"+s.port),
		)
		
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			s.logger.Fatal("Server failed to start", zap.Error(err))
		}
	}()

	// Wait for interrupt signal
	<-stop

	s.logger.Info("Shutting down server gracefully...")

	// Create shutdown context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), ShutdownTimeout)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		s.logger.Error("Server forced to shutdown", zap.Error(err))
		return err
	}

	s.logger.Info("Server stopped gracefully")
	return nil
}

// main is the application entry point with proper error handling
func main() {
	// Initialize logging system first
	logger.Init()
	defer logger.Log.Sync() // Ensure logs are flushed

	logger.Log.Info("Initializing Worker Manager API Server",
		zap.String("version", "1.0.0"),
		zap.Time("start_time", time.Now()),
	)

	// Create and start server
	server := NewServer()
	
	// Start server with graceful shutdown
	if err := server.Start(); err != nil {
		logger.Log.Fatal("Server startup failed", zap.Error(err))
		os.Exit(1)
	}
}