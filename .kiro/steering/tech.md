# Technology Stack & Build System

## Frontend Stack
- **Framework**: Next.js 15.4.0 (canary) with React 19.1.0
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **UI Components**: 
  - React Flow (@xyflow/react) for visual workflow builder
  - React Icons for iconography
  - XTerm.js for terminal interfaces
- **Data Fetching**: SWR for client-side data fetching, Axios for HTTP requests
- **Package Manager**: pnpm (v10.12.4)

## Backend Stack
- **Language**: Go 1.24.2
- **HTTP Router**: Chi v5 for REST API routing
- **Queue System**: Redis (go-redis/v9) for job queuing
- **Logging**: Uber Zap for structured logging
- **Environment**: godotenv for configuration management

## Development Tools
- **TypeScript**: v5 with strict mode enabled
- **ESLint**: v9 with Next.js configuration
- **Build Tool**: Next.js with Turbopack for development

## Common Commands

### Frontend Development
```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### Backend Development
```bash
# Run from Go directory
cd Go

# Run worker manager
go run ./cmd/WorkerManager

# Run worker
go run ./cmd/worker

# Build binaries
go build ./cmd/WorkerManager
go build ./cmd/worker
```

### Docker Development
```bash
# Start full stack with Redis
docker-compose up

# Build and start specific services
docker-compose up worker-manager worker redis
```

## Configuration
- Environment variables in `.env` file
- TypeScript path mapping: `@/*` points to project root
- Tailwind CSS with inline theme configuration
- Dark/light mode support via CSS custom properties