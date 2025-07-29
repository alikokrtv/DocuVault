# Dokumanet - Document Management System

## Overview

This is a full-featured document and media management web application called "Dokumanet" built for Plus Kitchen. The system allows departments to upload and manage documents while enabling administrators to review, comment, and approve submissions. The application follows a modern tech stack with React frontend, Express backend, and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite for development and bundling
- **State Management**: TanStack Query for server state management

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with session-based authentication
- **File Storage**: Local file system storage in `/uploads` directory
- **API**: RESTful API design

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Users**: Stores user information with roles (admin/department)
- **Departments**: Organizational units within the system
- **Files**: Document metadata and file information
- **Comments**: Admin comments on uploaded files
- **Sessions**: Session storage for authentication

## Key Components

### Authentication System
- **Provider**: Replit Auth integration for user authentication
- **Session Management**: PostgreSQL-backed session storage
- **Role-based Access**: Two main roles - department users and administrators
- **Security**: Session-based authentication with secure cookies

### File Management
- **Upload System**: Multer-based file upload with size and type restrictions
- **Supported Formats**: PDF, JPG, PNG, MP4, DOCX, XLSX (up to 50MB)
- **Storage**: Local file system storage with UUID-based filenames
- **Metadata**: Title, description, category, and status tracking

### User Interface
- **Design System**: shadcn/ui components with Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Brand Integration**: Plus Kitchen branding with custom color scheme
- **Component Architecture**: Modular component structure with proper separation

### Admin Features
- **Dashboard**: Overview of all department uploads and statistics
- **File Review**: Ability to preview, approve, reject files
- **Comment System**: Add comments and feedback on submissions
- **Department Management**: View and manage different departments
- **Sharing**: Email and WhatsApp sharing capabilities

### Department Features
- **File Upload**: Drag-and-drop interface for document submission
- **Progress Tracking**: View status of submitted documents
- **Comment Viewing**: Read administrator feedback
- **File Management**: Basic CRUD operations for own files

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Upload Flow**: Files uploaded to local storage, metadata stored in database
3. **Review Flow**: Admins review files, update status, add comments
4. **Notification Flow**: Status changes and comments visible to department users

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL) via `@neondatabase/serverless`
- **Authentication**: Replit Auth integration
- **File Processing**: Multer for file uploads
- **UI Components**: Radix UI primitives via shadcn/ui

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **Type Safety**: TypeScript throughout the stack
- **Code Quality**: ESLint and other development tools

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon Database connection for development
- **File Storage**: Local uploads directory

### Production
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Static Assets**: Frontend assets served from `/dist/public`
- **File Serving**: Express static middleware for uploaded files
- **Environment**: Replit deployment with environment variables

### Configuration
- **Environment Variables**: `DATABASE_URL`, `SESSION_SECRET`, etc.
- **Database Migrations**: Drizzle Kit for schema management
- **Asset Management**: Vite handles asset optimization and bundling

The application is designed to be deployed on Replit with minimal configuration, leveraging Replit's built-in authentication and database provisioning systems.