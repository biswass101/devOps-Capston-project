# Docker Containerization

## Overview
This project uses separate production-oriented Docker images for the frontend and backend, plus a root-level `docker-compose.yml` for local integration testing. The images are designed to keep runtime layers small, improve cache reuse during rebuilds, and avoid running application processes as root where possible.

## Frontend Dockerfile
Path: `frontend/Dockerfile`

The frontend image uses a multi-stage build:

1. `build` stage
   - Uses `node:20-alpine`
   - Copies `package.json` and `package-lock.json` first to maximize dependency-layer caching
   - Installs dependencies with `npm ci`
   - Copies only the Vite source/config files required for the build
   - Runs `npm run build`

2. `runtime` stage
   - Uses `nginx:1.27-alpine`
   - Copies the compiled `dist/` bundle only
   - Uses a custom `nginx.conf` to support SPA routing
   - Exposes port `80`
   - Includes a `HEALTHCHECK` against `/healthz`

## Backend Dockerfile
Path: `backend/Dockerfile`

The backend image uses a two-stage production build:

1. `deps` stage
   - Uses `node:20-alpine`
   - Copies `package.json` and `package-lock.json` first
   - Installs production dependencies only with `npm ci --omit=dev`

2. `runtime` stage
   - Uses `node:20-alpine`
   - Copies only `package*.json`, `src/`, and production `node_modules`
   - Runs as the non-root `node` user
   - Exposes port `3000`
   - Includes a `HEALTHCHECK` against `/health`

## Image Optimization Techniques
The following techniques are used across both images:

- Multi-stage builds to keep build tools out of runtime images
- `npm ci` for deterministic installs
- Dependency manifests copied before application code to improve cache hits
- Runtime stages copy only the files needed to run the app
- `.dockerignore` files exclude `node_modules`, Git metadata, coverage output, test assets, and local environment files
- Health checks are defined for both services
- The backend runs as a non-root user

## .dockerignore Files
Both application directories include `.dockerignore` files:

- `backend/.dockerignore`
- `frontend/.dockerignore`

These files reduce build context size and help avoid accidentally copying local dependencies, secrets, or development-only files into container builds.

## Docker Compose For Local Testing
Path: `docker-compose.yml`

The compose stack runs:

- `postgres`
- `backend`
- `frontend`

The services are connected so the frontend can call the backend and the backend can connect to PostgreSQL using the internal Docker network.

### Start the stack
```bash
docker compose up --build -d
```

### Stop the stack
```bash
docker compose down
```

### Rebuild after code changes
```bash
docker compose up --build -d
```

### Stop the stack and remove containers
```bash
docker compose down
```

## Build And Run Images Manually
### Backend
```bash
docker build -t bmi-health-backend:local ./backend
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e FRONTEND_URL=http://localhost:8080 \
  -e DATABASE_URL=postgresql://bmi_user:strongpassword@host.docker.internal:5432/bmidb \
  bmi-health-backend:local
```

### Frontend
```bash
docker build -t bmi-health-frontend:local ./frontend
docker run --rm -p 8080:80 bmi-health-frontend:local
```

## Port Mapping
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Notes And Assumptions
- The backend container requires a reachable PostgreSQL instance through `DATABASE_URL`.
- `host.docker.internal` works out of the box on Docker Desktop; on Linux you may prefer running the full compose stack instead of the standalone backend container.
- The compose file is intended for local development and validation, not as a production orchestrator.
