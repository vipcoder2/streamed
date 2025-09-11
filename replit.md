# Sports Live Streaming Website

## Overview

This is a modern sports live streaming website built with React, TypeScript, and Express.js. The application provides a comprehensive platform for viewing live sports matches with streaming capabilities. It features a dark-themed glassmorphism design, sports categorization, match scheduling, and real-time streaming through multiple sources. The platform integrates with the Streamed API to provide sports data, match information, and streaming links across various sports categories including football, basketball, baseball, and motor sports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application uses a modern React stack with TypeScript for type safety. The architecture follows a component-based design pattern with reusable UI components built using Radix UI primitives and styled with Tailwind CSS. The application uses Vite as the build tool for fast development and optimized production builds.

**State Management**: TanStack Query (React Query) is used for server state management, providing caching, background updates, and optimistic updates for API data.

**Routing**: Wouter library provides lightweight client-side routing with support for dynamic routes and URL parameters.

**Styling**: Tailwind CSS with a custom dark theme implementation using CSS variables. The design system includes glassmorphism effects, smooth animations, and responsive layouts.

### Backend Architecture
The server uses Express.js with TypeScript in ESM module format. The architecture implements a minimal REST API structure with route registration and middleware support.

**Server Structure**: Modular route registration system with centralized error handling and request logging middleware.

**Storage Layer**: Abstracted storage interface supporting both in-memory storage (development) and database operations through the IStorage interface pattern.

**Development Setup**: Hot module replacement through Vite integration for seamless development experience.

### Component Architecture
The UI follows atomic design principles with a comprehensive component library:

**Base Components**: Built on Radix UI primitives for accessibility and keyboard navigation
**Composite Components**: Match cards, navigation bars, and section containers with glassmorphism styling
**Page Components**: Full-page layouts for home, schedule, sports listing, and match details
**Utility Components**: Loading skeletons, error boundaries, and responsive containers

### Data Flow Architecture
The application implements a unidirectional data flow pattern:

**API Layer**: Centralized API client with error handling and response transformation
**Query Management**: TanStack Query for caching strategies and background synchronization
**Component Props**: Typed interfaces for all component interactions and data passing

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity optimized for serverless environments
- **drizzle-orm**: Type-safe SQL query builder with PostgreSQL dialect support
- **@tanstack/react-query**: Server state management and caching layer

### UI Framework
- **@radix-ui/***: Complete set of accessible UI primitives including dialogs, dropdowns, navigation menus, and form components
- **tailwindcss**: Utility-first CSS framework with custom design tokens
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Modern icon library with consistent design language

### Development Tools
- **vite**: Fast build tool with HMR and optimized production builds
- **typescript**: Static type checking and enhanced developer experience
- **wouter**: Minimalist client-side routing library

### External API Integration
- **Streamed API (streamed.pk)**: Primary data source for sports information, match schedules, and streaming links
  - Sports categories endpoint for navigation
  - Match data with real-time status updates
  - Stream sources with multiple quality options
  - Team and competition metadata

### Form Handling
- **react-hook-form**: Performant form library with validation support
- **@hookform/resolvers**: Validation resolver integration
- **zod**: Runtime type validation and schema definition

### Date and Utility Libraries
- **date-fns**: Modern date manipulation and formatting
- **clsx**: Conditional className utility for dynamic styling
- **nanoid**: URL-safe unique identifier generation