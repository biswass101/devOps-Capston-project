# Docker Containerization

## Frontend image design
The frontend uses a **multi-stage build**:

- **Build stage:** Node.js 20 Alpine installs dependencies and runs `vite build`
- **Runtime stage:** NGINX Alpine serves the static `dist/` files

### Benefits
- Small final image
- Faster startup
- NGINX is efficient for static frontend delivery
- Clear separation between build tools and runtime

## Backend image design
The backend uses a production-focused Node.js Alpine image.

### Optimization techniques used
- Install only production dependencies
- Run as a non-root user
- Add a health check against `/health`
- Keep build context clean with `.dockerignore`

## Local development with Docker Compose
The included `docker-compose.yml` runs:

- frontend
- backend
- PostgreSQL
- Redis

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

## Notes
- The frontend is exposed on port `8080`
- The backend is exposed on port `3000`
- PostgreSQL is exposed on port `5432`
- Redis is exposed on port `6379`
