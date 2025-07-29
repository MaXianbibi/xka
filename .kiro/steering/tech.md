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

## Frontend Development Patterns

### Component Architecture
- **Location**: Primary frontend code organized in `app/` directory
- **Structure**: 
  - `app/page.tsx` - Main dashboard page
  - `app/workflow/page.tsx` - Workflow builder page with React Flow integration
  - `app/components/flow/` - React Flow node implementations (HttpRequestNode, ManuelStartNode, WaitingNode, WrapperNode)
  - `app/components/MainView/` - Dashboard components (DashboardHeader, ExecutionHistory, WorkflowCard, StatsOverview, etc.)
  - `app/components/workflow/` - Workflow-specific UI (LogsFilter, NodePalette, WorkflowControls, WorkflowMetrics, etc.)
  - `app/components/ui/` - Reusable UI components (Switch)
  - `app/lib/` - Utilities, hooks, types, and business logic

### React Patterns
- **Hooks**: Custom hooks located in `app/lib/hooks/`
  - `pooling.ts` - Real-time workflow status updates and polling logic
  - `useWorkflowExecution.ts` - Workflow execution control
  - `useWorkflowLogs.ts` - Log filtering and processing
- **State Management**: React hooks with `useNodesState`, `useEdgesState` from React Flow
- **Memoization**: Heavy use of `useMemo`, `useCallback`, and `memo` for performance
- **Component Composition**: Wrapper pattern for node components (`WrapperNode.tsx`)

### Styling Conventions
- **Tailwind Classes**: Extensive use of utility classes with consistent patterns
- **Color Scheme**: Dark theme with zinc/gray palette
- **Status Colors**: 
  - Green (success): `text-green-400`, `border-green-400`
  - Red (error): `text-red-400`, `border-red-400` 
  - Yellow (running): `text-yellow-400`, `border-yellow-400`
  - Zinc (default): `text-zinc-400`, `border-zinc-600`
- **Animations**: `animate-pulse` for live indicators, `transition-all` for smooth interactions

### Code Organization
- **Constants**: Centralized in `app/lib/Constants/constants.ts`
- **Types**: All TypeScript interfaces in `app/lib/types/types.ts`
- **Utilities**: Organized by purpose in `app/lib/utils/`
  - `classNames.ts` - CSS class utilities (likely using clsx)
  - `dateUtils.ts` - Date formatting and manipulation
  - `workflow-utils.ts` - Workflow-specific utility functions
- **HTTP Client**: Centralized in `app/lib/httpClient/httpClient.ts`
- **Error Handling**: Graceful degradation with null checks and fallbacks
- **Performance**: Memoized calculations, extracted sub-components, parallel tool calls

### React Flow Integration
- **Node Types**: Custom node implementations in `app/components/flow/`
  - `HttpRequestNode.tsx` - HTTP request execution nodes
  - `ManuelStartNode.tsx` - Manual trigger nodes
  - `WaitingNode.tsx` - Delay/waiting nodes
  - `WrapperNode.tsx` - Base wrapper for all node types
- **Edge Handling**: Custom edge deletion logic in `canDeleteEdge.tsx`
- **Real-time Updates**: Live status updates reflected in node appearance
- **Controls**: Workflow execution controls in `app/components/workflow/WorkflowControls.tsx`
- **Node Palette**: Drag-and-drop node creation in `app/components/workflow/NodePalette.tsx`

### Data Flow Patterns
- **Polling**: Real-time status updates with conditional polling
- **State Synchronization**: Workflow status reflected across multiple components
- **Event Handling**: Callback-based event system for user interactions
- **Data Transformation**: Memoized data processing for logs and metrics

## Configuration
- Environment variables in `.env` file
- TypeScript path mapping: `@/*` points to project root
- Tailwind CSS with inline theme configuration
- Dark/light mode support via CSS custom properties