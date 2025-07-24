# Synergy RM Copilot - Revenue Management Platform

## Overview

Synergy RM Copilot is a full-stack TypeScript revenue management platform designed for short-term rental properties. The application provides AI-powered recommendations, automated data collection, and real-time performance monitoring to optimize revenue for property managers.

## User Preferences

Preferred communication style: Simple, everyday language.
Working on: Git version control, OpenAI integration enhancements, understanding Git migration instructions.

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

## Recent Changes (January 2025)

### Git Version Control Enhancement
- **Enhanced .gitignore**: Added comprehensive ignore patterns for TypeScript, Python, database files, and IDE configurations
- **Git Workflow Documentation**: Created GIT_WORKFLOW.md with branch strategies, commit conventions, and best practices
- **Integration Ready**: Set up for CI/CD pipeline integration

### OpenAI Integration Enhancements
- **Extended Recommendation Types**: Added 3 new AI recommendation categories:
  - `seasonal_strategy`: Season-specific pricing and availability optimizations
  - `competitive_intelligence`: Market positioning and differentiation strategies
  - `event_based_pricing`: Dynamic pricing for local events and holidays
- **Enhanced AI Prompts**: Improved context with performance trends, seasonal analysis, and market positioning
- **Recommendation Metadata**: Added timeframe (immediate/short_term/long_term) and priority (high/medium/low) fields
- **Performance Analysis**: Added helper functions for occupancy trend analysis and seasonal detection

### OpenAI SDK Migration (GitHub Actions)
- **Migrated Python Script**: Updated `.github/scripts/codex_generate.py` from OpenAI SDK v0.x to v1.x
- **API Changes**: Replaced deprecated `Completion.create()` with new `chat.completions.create()` API
- **Model Update**: Switched from deprecated `code-davinci-002` to modern `gpt-4o-mini` model
- **Dependencies**: Updated OpenAI package to version >=1.0.0
- **Error Handling**: Improved error handling and added markdown code block stripping

### Documentation Updates
- **Created GIT_WORKFLOW.md**: Comprehensive Git usage guide for the team
- **Created OPENAI_MIGRATION_EXPLAINED.md**: Explanation of OpenAI SDK v0.x to v1.x migration
- **Created AI_ENHANCEMENTS.md**: Roadmap for future AI capabilities and optimization strategies
- **PR_INSTRUCTIONS.md**: Contains detailed instructions for creating the migration pull request

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
  - AirDNA free market data
  - Rabbu market insights
  - Guesty integration: DISABLED

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

1. **Data Collection**: Cron jobs fetch data from external APIs (Wheelhouse, AirDNA, Rabbu)
2. **Storage**: Raw data is processed and stored in PostgreSQL tables
3. **Analysis**: AI recommendations are generated using OpenAI API with historical performance data
4. **Dashboard**: React frontend queries the Express API for dashboard data
5. **Alerts**: Performance monitoring runs continuous analysis and triggers alerts when thresholds are breached
6. **User Actions**: All user interactions are logged for audit trails and system improvement

## External Dependencies

### Third-Party APIs
- **OpenAI API**: AI recommendation generation
- **Wheelhouse Demand API**: Property performance data (includes listings sync via POST /api/admin/syncListings)
- **Guesty Open API**: DISABLED (was: Property management integration)
- **AirDNA**: Market data and competitive analysis
- **Rabbu**: Additional market insights

### Admin Endpoints (Added)
- **POST /api/admin/syncListings**: Fetches and upserts listings from Wheelhouse API
- **POST /api/admin/refreshNow**: Manual data refresh for all listings across Wheelhouse and market APIs

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