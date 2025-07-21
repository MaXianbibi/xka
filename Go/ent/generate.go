//go:build ignore
// +build ignore

package main

import (
    "entgo.io/ent/entc"
    "entgo.io/ent/entc/gen"
    "log"
)

func main() {
    opts := []entc.Option{
        entc.FeatureNames("sql/uuid"), // Active le support UUID
    }

    if err := entc.Generate("./schema", &gen.Config{
        Target:  "./ent",
        Package: "github.com/votre-projet/ent",
    }, opts...); err != nil {
        log.Fatalf("running ent codegen: %v", err)
    }
}
