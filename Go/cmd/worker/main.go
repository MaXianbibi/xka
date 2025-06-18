package main

import (
	"XKA/pkg/logger"
)

func main() {

	logger.Init() // Initialisation du logger

	logger.Log.Info("Démarrage du worker manager")
	// ...
}