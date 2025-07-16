# XKA Product Overview

XKA (Xecution Kit for Application flow) is a high-performance, modular, distributed execution engine for building logic-based applications and automation workflows.

## Core Purpose
- Visual workflow builder with drag-and-drop interface
- Distributed worker system for scalable execution
- Alternative to tools like n8n or Make with better performance and control

## Key Components
- **Frontend**: React + React Flow visual builder for creating execution graphs
- **Backend**: Go-based runtime with Redis job queue for ultra-efficient processing
- **Workers**: Lightweight Go workers (10-25MB each) that can be deployed anywhere
- **Storage**: PostgreSQL for workflow persistence and user management

## Target Users
- Developers building automation flows
- Advanced users needing performance and control
- Teams requiring distributed, scalable workflow execution

## Architecture Philosophy
- Separation of concerns: UI decoupled from execution engine
- Horizontal scaling: workers deployable on any infrastructure
- Performance-first: Go backend for speed, React frontend for usability