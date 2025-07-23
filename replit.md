# Synergy RM Copilot - Revenue Management Platform

## Overview

Synergy RM Copilot is a full-stack TypeScript revenue management platform designed for short-term rental properties. The application provides AI-powered recommendations, automated data collection, and real-time performance monitoring to optimize revenue for property managers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better development experience
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first styling with custom color variables for the revenue management domain
- **UI Components**: Shadcn/ui component library providing a consistent design system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching

**Rationale**: This stack provides a modern, performant frontend with excellent developer experience. Vite offers faster builds than traditional bundlers, while Tailwind ensures consistent styling. The component library reduces development time while maintaining design consistency.

### Backend Architecture
- **Runtime**: Node.js with Express.js for the web server
- **Language**: TypeScript for type safety across the entire stack
- **Database**: PostgreSQL with Neon serverless database hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Process Management**: Built-in Node.js clustering for production scalability

**Rationale**: Express.js provides a mature, well-documented framework for API development. PostgreSQL offers robust data consistency for financial data, while Drizzle provides excellent TypeScript integration without the complexity of heavier ORMs.

### Data Storage Solutions
- **Primary Database**: PostgreSQL for transactional data including listings, performance metrics, and AI recommendations
- **Schema Design**: Normalized structure with separate tables for:
  - `listings`: Property information and metadata
  - `nightlyStats`: Daily performance metrics (ADR, occupancy, RevPAR)
  - `marketStats`: Comparative market data
  - `aiRecs`: AI-generated recommendations
  - `userActions`: Audit trail for user interactions

**Rationale**: PostgreSQL was chosen for its ACID compliance, which is crucial for financial data integrity. The normalized schema prevents data duplication while enabling efficient queries for dashboard analytics.

## Key Components

### AI-Powered Recommendations Engine
- **Provider**: OpenAI GPT-4o for generating revenue optimization suggestions
- **Configuration**: Configurable weight caps (±10% vs native Wheelhouse recommendations)
- **Coverage**: 100% AI blend coverage for all listings
- **Scoring**: Confidence scoring and impact estimation for each recommendation

### Automated Data Collection System
- **Scheduling**: Node-cron for automated data collection 3 times daily (3am, 11am, 7pm)
- **Rate Limiting**: Built-in rate limiting for external API compliance
- **Data Sources**:
  - Wheelhouse Demand API (≤20 requests/minute)
  - Guesty Open API (60-second intervals)
  - AirDNA free market data
  - Rabbu market insights

### Performance Monitoring & Alerts
- **Analysis**: Z-score analysis (1.5σ below benchmark triggers alerts)
- **Notifications**: Real-time performance notifications
- **Detection**: Automated underperformance detection
- **Escalation**: Critical alert escalation system

### Dashboard & Analytics
- **Metrics**: Real-time portfolio performance (RevPAR, ADR, Occupancy)
- **Visualization**: Interactive property performance tables with AI scores
- **Comparison**: Market benchmarking and competitive analysis
- **Trends**: Performance trend visualization over time

## Data Flow

1. **Data Collection**: Cron jobs fetch data from external APIs (Wheelhouse, Guesty, AirDNA, Rabbu)
2. **Storage**: Raw data is processed and stored in PostgreSQL tables
3. **Analysis**: AI recommendations are generated using OpenAI API with historical performance data
4. **Dashboard**: React frontend queries the Express API for dashboard data
5. **Alerts**: Performance monitoring runs continuous analysis and triggers alerts when thresholds are breached
6. **User Actions**: All user interactions are logged for audit trails and system improvement

## External Dependencies

### Third-Party APIs
- **OpenAI API**: AI recommendation generation
- **Wheelhouse Demand API**: Property performance data
- **Guesty Open API**: Property management integration
- **AirDNA**: Market data and competitive analysis
- **Rabbu**: Additional market insights

### Infrastructure Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Authentication**: Built-in session management (ready for external auth providers)

### Development Tools
- **Replit**: Development environment with hot reloading
- **ESBuild**: Production bundling for server code
- **TypeScript**: Compilation and type checking

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with Express.js middleware mode
- **Database**: Neon development database with automatic migrations
- **Environment Variables**: Managed through Replit secrets

### Production Deployment
- **Build Process**: 
  - Frontend: Vite builds React app to `dist/public`
  - Backend: ESBuild bundles server code to `dist/index.js`
- **Server**: Single Node.js process serving both API and static files
- **Database**: Production Neon PostgreSQL instance
- **Migrations**: Drizzle-kit for database schema management

### Configuration Management
- **Central Config**: `src/config/rm-brain.ts` contains all system parameters
- **Validation**: Startup validation ensures all required configuration is present
- **Environment-Specific**: Database URLs and API keys managed via environment variables

**Deployment Rationale**: The monolithic approach simplifies deployment while maintaining clear separation between frontend and backend code. Neon's serverless PostgreSQL reduces operational overhead, while the single-process deployment model works well for the expected scale.