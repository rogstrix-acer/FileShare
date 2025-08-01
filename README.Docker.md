# Docker Setup for FileShare Application

This document explains how to run the FileShare application using Docker.

## Prerequisites

- Docker
- Docker Compose

## Environment Variables

Make sure you have the following environment files configured:

### Backend (.env)
```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_USER_COLLECTION_ID=your_user_collection_id
APPWRITE_FILES_COLLECTION_ID=your_files_collection_id
APPWRITE_SHARES_COLLECTION_ID=your_shares_collection_id
APPWRITE_BUCKET_ID=your_bucket_id
JWT_SECRET=your_jwt_secret
BASE_URL=http://localhost:3000
```

### Frontend (.env)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NESTJS_BACKEND_URL=http://backend:8000
```

## Production Deployment

### Build and run the application:
```bash
docker-compose up --build
```

### Run in detached mode:
```bash
docker-compose up -d --build
```

### Stop the application:
```bash
docker-compose down
```

## Development Mode

### Build and run in development mode:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Run in detached mode:
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

### Stop development containers:
```bash
docker-compose -f docker-compose.dev.yml down
```

## Individual Services

### Build and run backend only:
```bash
cd backend
docker build -t fileshare-backend .
docker run -p 8000:8000 --env-file .env fileshare-backend
```

### Build and run frontend only:
```bash
cd frontend
docker build -t fileshare-frontend .
docker run -p 3000:3000 --env-file .env fileshare-frontend
```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Troubleshooting

### View logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs backend
```

### Rebuild without cache:
```bash
docker-compose build --no-cache
```

### Remove all containers and volumes:
```bash
docker-compose down -v --remove-orphans
```

## Notes

- The production build uses multi-stage builds for optimized image sizes
- Development mode includes hot reloading with volume mounts
- Both frontend and backend run as non-root users for security
- The frontend uses Next.js standalone output for better Docker performance