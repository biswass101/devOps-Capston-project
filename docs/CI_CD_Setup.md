# CI/CD Setup

## CI/CD Tool
This project uses **GitHub Actions**. It is the best fit for this phase because the deliverables explicitly require workflow files under `.github/workflows/`, and GitHub Actions provides native support for pull request validation, container publishing, and manual workflow runs.

## Pipeline Architecture
The repository contains two independent pipelines:

- `/.github/workflows/frontend-ci.yml`
- `/.github/workflows/backend-ci.yml`

Both workflows follow the same high-level release path:

1. Checkout the repository.
2. Set up Node.js 20 with npm caching.
3. Install dependencies with `npm ci`.
4. Run linting and code quality checks.
5. Run unit tests.
6. Run integration tests.
7. Build the application artifact.
8. Build and push a Docker image when the event is not a pull request.

This split keeps pull requests fast and safe while still allowing branch pushes and manual runs to publish deployable container images.

## Frontend Pipeline Stages
Workflow file: `/.github/workflows/frontend-ci.yml`

### 1. Dependency installation
The workflow installs frontend dependencies from `frontend/package-lock.json` using `npm ci` for deterministic builds.

### 2. Lint and code quality
`npm run lint` executes ESLint against the Vite/React codebase.

### 3. Unit tests
`npm run test:unit` runs Vitest unit tests for isolated UI behavior such as the measurement form submission flow.

### 4. Integration tests
`npm run test:integration` runs Vitest integration tests for the main application shell and API-driven rendering behavior.

### 5. Build stage
`npm run build` generates the production-ready Vite bundle in `frontend/dist`.

### 6. Docker image publish
For `push` and `workflow_dispatch` events, the workflow logs in to Docker Hub, creates image tags from branch names and commit SHA values, and pushes the frontend image built from `frontend/Dockerfile`.

## Backend Pipeline Stages
Workflow file: `/.github/workflows/backend-ci.yml`

### 1. Dependency installation
The workflow installs backend dependencies from `backend/package-lock.json` using `npm ci`.

### 2. PostgreSQL service container
The backend job starts a PostgreSQL 16 service container so the pipeline can validate database connectivity and run SQL migrations.

### 3. Database migrations
The workflow applies:

- `backend/migrations/001_create_measurements.sql`
- `backend/migrations/002_add_measurement_date.sql`
- `backend/migrations/003_seed_measurements.sql`

This ensures the schema used in CI matches the application code.

### 4. Lint and code quality
`npm run lint` runs repository-local static checks for backend JavaScript sources and tests.

### 5. Unit tests
`npm run test:unit` validates core calculation logic such as BMI/BMR output.

### 6. Integration tests
`npm run test:integration` starts the Express application in-process and validates endpoint behavior such as `/health` and 404 handling.

### 7. Build stage
The workflow performs a Docker build locally as a build validation step, confirming that the backend container can be assembled successfully before any push occurs.

### 8. Docker image publish
For `push` and `workflow_dispatch` events, the workflow logs in to Docker Hub and pushes the backend image built from `backend/Dockerfile`.

## Required Repository Secrets
Add these GitHub repository secrets before running image publishing stages:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## How To Trigger The Pipelines
The workflows can be triggered in three ways:

- Push changes to `main` or `develop`.
- Open or update a pull request targeting `main` or `develop`.
- Manually start a run from the **Actions** tab using `workflow_dispatch`.

## How To Monitor The Pipelines
1. Open the repository on GitHub.
2. Select the **Actions** tab.
3. Choose either `Frontend CI/CD` or `Backend CI/CD`.
4. Open a workflow run to inspect each stage, logs, artifacts, and Docker publish status.

## Container Image Naming
The workflows publish the following Docker Hub images:

- `${DOCKERHUB_USERNAME}/bmi-health-frontend`
- `${DOCKERHUB_USERNAME}/bmi-health-backend`

Each publish run tags images using the branch name, commit SHA, and `latest` on the default branch.

## Notes And Assumptions
- Docker image publishing is skipped for pull requests by design.
- The frontend build does not require backend availability because Vite proxies API requests only in local development.
- The backend integration tests bypass the startup database connectivity check because those tests validate HTTP behavior rather than persistence.
- The backend CI database is seeded with demo measurements so the SQL migration chain matches local Docker behavior.
