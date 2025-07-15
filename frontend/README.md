# FileShare Frontend - Next.js Application

The frontend application for FileShare, built with Next.js 14, React, TypeScript, and Tailwind CSS. Provides a beautiful, responsive interface for secure file sharing with drag & drop uploads and real-time updates.

![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black)
![React](https://img.shields.io/badge/Library-React-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-cyan)

## 🚀 Features

### 🎨 **User Interface**
- Modern, responsive design that works on all devices
- Dark/Light theme support with system preference detection
- Intuitive drag & drop file upload interface
- Real-time upload progress indicators
- Beautiful file management dashboard

### 🔐 **Authentication**
- Secure JWT-based authentication
- Login and registration forms with validation
- Automatic token management and refresh
- Protected routes and components
- Session persistence across browser sessions

### 📁 **File Management**
- Drag & drop file upload with visual feedback
- File list with metadata (size, date, type)
- One-click share link generation
- File deletion with confirmation
- Upload progress tracking

### 🔗 **File Sharing**
- Public share pages accessible without login
- Share link copying to clipboard
- Download tracking and statistics
- Expiration date display
- Download limit enforcement

### 🏗️ **Architecture**
- Next.js 14 with App Router
- Server-side rendering (SSR) and static generation
- API routes as middleware layer
- React Context for state management
- TypeScript for type safety

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running (NestJS)
- Environment variables configured

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Configure your environment variables (see below)
```

## ⚙️ Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
# Next.js Frontend Configuration
NEXT_PUBLIC_BACKEND_URL=/api

# NestJS Backend URL (for Next.js API routes to communicate with)
NESTJS_BACKEND_URL=http://localhost:8000
```

## 🚀 Running the Application

```bash
# Development mode (default port 3000)
npm run dev

# Development mode on specific port
npm run dev -- --port 3001

# Production build
npm run build
npm run start

# Linting
npm run lint
```

The application will be available at `http://localhost:3000` (or your specified port)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers (middleware)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── files/         # File management endpoints
│   │   └── shares/        # Share management endpoints
│   ├── share/             # Public share pages
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── AuthForm.tsx      # Login/signup form
│   ├── Dashboard.tsx     # Main dashboard
│   ├── FileUpload.tsx    # File upload component
│   ├── FileList.tsx      # File list component
│   ├── SharePage.tsx     # Share access page
│   └── theme-provider.tsx# Theme provider
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility functions
│   └── api.ts           # API client
└── styles/              # Additional styles
```

## 🎨 Components

### **AuthForm**
Login and registration form with:
- Email and password validation
- Loading states and error handling
- Toggle between login/signup modes
- Responsive design

### **Dashboard**
Main application interface featuring:
- User welcome message
- File upload area
- File list with actions
- Logout functionality

### **FileUpload**
Drag & drop file upload with:
- Visual drag feedback
- Click to browse files
- Upload progress indication
- Error handling

### **FileList**
File management interface with:
- File metadata display
- Share link generation
- File deletion
- Loading states

### **SharePage**
Public file access page with:
- File information display
- Download statistics
- Expiration status
- Download button

## 🔌 API Integration

### **API Client (`lib/api.ts`)**
Centralized API client with:
- JWT token management
- Request/response handling
- Error handling
- TypeScript interfaces

### **API Routes (`app/api/`)**
Next.js API routes acting as middleware:
- Authentication proxy
- File management proxy
- Share management proxy
- Error handling and response formatting

## 🎯 User Flow

### **Authentication Flow**
1. User visits the application
2. Sees login/signup form if not authenticated
3. Submits credentials
4. JWT token stored in localStorage
5. Redirected to dashboard

### **File Upload Flow**
1. User drags file or clicks to browse
2. File uploaded via API to backend
3. Progress indicator shows upload status
4. File appears in user's file list
5. Success notification displayed

### **File Sharing Flow**
1. User clicks "Share" on any file
2. Share link generated via API
3. Link automatically copied to clipboard
4. User can share the link with others
5. Recipients access file via public share page

## 🔒 Security Features

- **JWT Token Management** - Secure token storage and automatic refresh
- **Protected Routes** - Authentication required for sensitive pages
- **Input Validation** - Client-side validation for all forms
- **XSS Protection** - React's built-in XSS protection
- **CSRF Protection** - SameSite cookie configuration

## 📱 Responsive Design

- **Mobile-First** - Designed for mobile devices first
- **Breakpoints** - Tailwind CSS responsive breakpoints
- **Touch-Friendly** - Large touch targets for mobile
- **Adaptive Layout** - Layout adapts to screen size
- **Dark Mode** - System preference detection

## 🧪 Testing

```bash
# Run tests (when configured)
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### **Vercel Deployment (Recommended)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Manual Deployment**
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### **Environment Variables for Production**
- Update `NESTJS_BACKEND_URL` to production backend URL
- Configure proper CORS settings
- Set up SSL certificates
- Configure CDN for static assets

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./.next
COPY public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

## 🎨 Styling

### **Tailwind CSS**
- Utility-first CSS framework
- Custom color palette
- Responsive design utilities
- Dark mode support

### **Component Styling**
- Consistent design system
- Reusable component classes
- Hover and focus states
- Loading and error states

## 🔧 Development

### **Code Quality**
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Husky for git hooks (optional)

### **Development Tools**
- Next.js Fast Refresh
- TypeScript IntelliSense
- Tailwind CSS IntelliSense
- React Developer Tools

## 🐛 Troubleshooting

### **Common Issues**

1. **API Connection Issues**
   - Verify `NESTJS_BACKEND_URL` is correct
   - Check if backend server is running
   - Verify CORS configuration

2. **Authentication Issues**
   - Clear localStorage and cookies
   - Check JWT token expiration
   - Verify API endpoints are accessible

3. **File Upload Issues**
   - Check file size limits
   - Verify backend file upload configuration
   - Check network connectivity

4. **Build Issues**
   - Clear `.next` directory
   - Delete `node_modules` and reinstall
   - Check TypeScript errors

## 📦 Dependencies

### **Core Dependencies**
- `next` - Next.js framework
- `react` - React library
- `react-dom` - React DOM renderer
- `typescript` - TypeScript language
- `tailwindcss` - CSS framework

### **Development Dependencies**
- `@types/node` - Node.js type definitions
- `@types/react` - React type definitions
- `eslint` - Code linting
- `eslint-config-next` - Next.js ESLint config
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixes

## 📝 Contributing

1. Follow React and Next.js best practices
2. Use TypeScript for all components
3. Follow the existing component structure
4. Write responsive, accessible components
5. Test on multiple devices and browsers

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the main project README
2. Review Next.js documentation
3. Check React documentation
4. Create an issue with detailed information

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)