# Project Structure & Organization

## Root Level Organization
```
├── app/                    # Next.js App Router frontend
├── Go/                     # Go backend services
├── .kiro/                  # Kiro AI assistant configuration
├── .github/                # GitHub workflows and templates
├── public/                 # Static assets
├── node_modules/           # Frontend dependencies
└── [config files]          # Various configuration files
```

## Frontend Structure (`app/`)
- **App Router**: Uses Next.js 13+ app directory structure
- **Layout**: `layout.tsx` contains root layout with Dashboard component
- **Pages**: `page.tsx` files define routes
- **Components**: 
  - `Dashboard/` - Main dashboard component
  - `lib/` - Shared utilities and helpers
  - `test_/` - Test components and experimental features
- **Styling**: `globals.css` with Tailwind CSS and CSS custom properties

## Backend Structure (`Go/`)
```
Go/
├── cmd/                    # Application entry points
│   ├── WorkerManager/      # Worker manager service
│   └── worker/             # Individual worker service
├── internal/               # Private application code
├── pkg/                    # Public library code
├── go.mod                  # Go module definition
└── go.sum                  # Go module checksums
```

## Configuration Files
- **Package Management**: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`
- **TypeScript**: `tsconfig.json` with path mapping (`@/*` → root)
- **Next.js**: `next.config.ts`, `next-env.d.ts`
- **Styling**: `postcss.config.mjs` for Tailwind CSS
- **Linting**: `eslint.config.mjs`
- **Docker**: `docker-compose.yml` for multi-service setup
- **Environment**: `.env` for configuration variables

## Data Structures
- **Workflows**: Node-based execution graphs with `nodeMap` structure
- **Nodes**: Each node has `id`, `type`, `data`, `nextIds`, `previousIds`
- **Node Types**: `manualStartNode`, `waitingNode`, `httpRequestNode`, etc.
- **Execution Results**: Detailed logs, timing, and status for each node

## Naming Conventions
- **Files**: camelCase for TypeScript/React, lowercase for Go packages
- **Components**: PascalCase React components
- **Directories**: camelCase for app routes, lowercase for Go packages
- **IDs**: UUID format for workflow and node identification

## Import Patterns
- Use `@/` path alias for imports from project root
- Relative imports for local components
- External dependencies imported by package name