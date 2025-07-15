# FileShare Backend - NestJS API

The backend service for FileShare, built with NestJS, TypeScript, and Appwrite integration. Provides secure file management, user authentication, and share link functionality.

![NestJS](https://img.shields.io/badge/Framework-NestJS-red)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![JWT](https://img.shields.io/badge/Auth-JWT-green)
![Appwrite](https://img.shields.io/badge/Database-Appwrite-pink)

## 🚀 Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication with Passport.js
- User registration and login
- Protected routes with guards
- Token refresh functionality
- Session management

### 📁 **File Management**
- File upload with Multer integration
- Appwrite storage integration
- File metadata management
- User-specific file access control
- File deletion with cleanup

### 🔗 **Share Management**
- Secure share link generation
- Expiration date handling
- Download count tracking
- Access validation
- Share link revocation

### 🏗️ **Architecture**
- Modular NestJS architecture
- Dependency injection
- Configuration management
- Error handling middleware
- Logging and monitoring

## 📋 Prerequisites

- Node.js 18+ and npm
- Appwrite account and project
- Environment variables configured

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your environment variables (see below)
```

## ⚙️ Environment Configuration

Create a `.env` file in the backend directory:

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_USER_COLLECTION_ID=users
APPWRITE_FILES_COLLECTION_ID=files
APPWRITE_SHARES_COLLECTION_ID=shares
APPWRITE_BUCKET_ID=your_bucket_id

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
BASE_URL=http://localhost:8000
PORT=8000
```

## 🚀 Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### **Authentication Endpoints**

#### POST `/auth/signup`
Register a new user
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### POST `/auth/login`
Authenticate user and get JWT token
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### GET `/auth/me`
Get current user information (requires JWT)

#### POST `/auth/logout`
Logout user (requires JWT)

#### POST `/auth/refresh`
Refresh JWT token (requires JWT)

### **File Management Endpoints**

#### POST `/files/upload`
Upload a file (requires JWT)
- Content-Type: `multipart/form-data`
- Field name: `file`

#### GET `/files/my-files`
Get user's files (requires JWT)

#### GET `/files/:fileId`
Get file information (requires JWT)

#### DELETE `/files/:fileId`
Delete a file (requires JWT)

#### POST `/files/:fileId/share`
Create a share link for a file (requires JWT)
```json
{
  "expiresAt": "2024-12-31T23:59:59Z",
  "maxDownloads": 10
}
```

### **Share Management Endpoints**

#### GET `/shares/:shareToken`
Get shared file information (public)

#### POST `/shares/:shareToken/download`
Download shared file (public)

#### GET `/shares/:shareToken/stats`
Get share statistics (public)

#### DELETE `/shares/:shareToken`
Delete share link (requires JWT, owner only)

## 🏗️ Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   ├── auth.module.ts      # Auth module definition
│   ├── jwt.strategy.ts     # JWT strategy
│   ├── jwt-auth.guard.ts   # JWT guard
│   └── public.decorator.ts # Public route decorator
├── files/                  # File management module
│   ├── files.controller.ts # File endpoints
│   ├── files.service.ts    # File business logic
│   └── files.module.ts     # File module definition
├── shares/                 # Share management module
│   ├── shares.controller.ts# Share endpoints
│   ├── shares.service.ts   # Share business logic
│   └── shares.module.ts    # Share module definition
├── appwrite/              # Appwrite integration
│   ├── appwrite.service.ts # Appwrite client
│   └── appwrite.module.ts  # Appwrite module
├── config/                # Configuration
│   └── appwrite.config.ts  # Appwrite config
├── app.module.ts          # Root module
└── main.ts               # Application entry point
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Route Guards** - Protected endpoints with role-based access
- **Input Validation** - Request validation with class-validator
- **Error Handling** - Comprehensive error handling and logging
- **CORS Configuration** - Secure cross-origin resource sharing
- **Rate Limiting** - Protection against abuse (can be added)

## 📦 Dependencies

### **Core Dependencies**
- `@nestjs/core` - NestJS core framework
- `@nestjs/common` - Common NestJS utilities
- `@nestjs/jwt` - JWT integration
- `@nestjs/passport` - Passport authentication
- `@nestjs/platform-express` - Express platform
- `@nestjs/config` - Configuration management
- `node-appwrite` - Appwrite SDK
- `passport-jwt` - JWT passport strategy
- `multer` - File upload handling

### **Development Dependencies**
- `@nestjs/testing` - Testing utilities
- `@types/*` - TypeScript type definitions
- `jest` - Testing framework
- `supertest` - HTTP testing
- `eslint` - Code linting
- `prettier` - Code formatting

## 🚀 Deployment

### **Production Build**
```bash
npm run build
npm run start:prod
```

### **Environment Variables for Production**
- Set strong `JWT_SECRET`
- Configure production `APPWRITE_*` credentials
- Set appropriate `BASE_URL`
- Configure logging levels
- Set up monitoring and health checks

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

## 🐛 Troubleshooting

### **Common Issues**

1. **Appwrite Connection Issues**
   - Verify `APPWRITE_ENDPOINT` and `APPWRITE_PROJECT_ID`
   - Check API key permissions
   - Ensure collections exist with correct IDs

2. **JWT Token Issues**
   - Verify `JWT_SECRET` is set
   - Check token expiration settings
   - Ensure proper Authorization header format

3. **File Upload Issues**
   - Check Appwrite bucket permissions
   - Verify `APPWRITE_BUCKET_ID` is correct
   - Ensure sufficient storage quota

## 📝 Contributing

1. Follow NestJS coding conventions
2. Write tests for new features
3. Update documentation
4. Use TypeScript strictly
5. Follow the existing project structure

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the main project README
2. Review the API documentation
3. Check Appwrite documentation
4. Create an issue with detailed information