# XKA — Xecution Kit for Application flow

**XKA** is a high-performance, modular, distributed execution engine built to prototype, run, and scale logic-based applications and automation flows.

It provides a visual builder frontend (React + React Flow) decoupled from an ultra-efficient Go-based runtime.  
Designed for developers, builders, and advanced users who need more control, less bloat, and better performance than tools like n8n or Make.

---

## 🚀 Key Features

- ⚙️ **Distributed, Scalable Worker System**
  - Built in Go for extreme performance and low memory usage (10–25MB per worker)
  - Horizontal scaling: deploy workers anywhere — locally, on VPS, edge, or cloud
  - Smart concurrency control via goroutines

- 🧱 **Visual Workflow Builder**
  - React + React Flow powered interface
  - Drag-and-drop nodes to build execution graphs
  - Node palette for easy addition of workflow components
  - Persisted workflows via PostgreSQL

- 🧠 **Separation of Concerns**
  - Next.js frontend (auth, user dashboard, DB)
  - Go backend (job queue API, task management)
  - Independent deployments (host UI on Vercel, workers on custom infra)

- 🔐 **Authentication & User Management**
  - Powered by NextAuth.js
  - PostgreSQL for sessions, user data, and stored flows

- ⚡ **Redis-backed Job Queue**
  - Fast and reliable queueing layer
  - Priority routing and per-type worker targeting (LLM, HTTP, compute, etc.)