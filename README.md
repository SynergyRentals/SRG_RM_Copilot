# Synergy RM Copilot - Revenue Management Platform

A full-stack TypeScript revenue management platform for short-term rental properties with AI-powered recommendations, automated data collection, and real-time performance monitoring.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4o for revenue optimization recommendations
- **Scheduling**: Node-cron for automated data collection
- **UI Components**: Shadcn/ui component library

## 🚀 Features

### Dashboard & Analytics
- Real-time portfolio performance metrics (RevPAR, ADR, Occupancy)
- Interactive property performance table with AI scores
- Market comparison and benchmarking
- Performance trend visualization

### AI-Powered Recommendations
- OpenAI-generated revenue optimization suggestions
- Configurable weight caps (±10% vs native Wheelhouse recommendations)
- 100% AI blend coverage for all listings
- Confidence scoring and impact estimation

### Automated Data Collection
- **Cron Schedule**: 3 times daily (3am, 11am, 7pm local time)
- **Read-only API integrations**:
  - Wheelhouse Demand API (≤20 requests/minute)
  - Guesty Open API (60-second intervals)
  - AirDNA free market data
  - Rabbu market insights

## API Usage

⚠️ This app is **read‑only** with Wheelhouse and Guesty. All HTTP requests are GET.

## Manual Admin Endpoints

### Sync Listings from Wheelhouse
```bash
POST /api/admin/syncListings
```

Fetches all listings from Wheelhouse API and upserts them into the database. Uses the `X-Integration-Api-Key` header for authentication (read-only access).

**Response:**
```json
{
  "message": "Listings sync completed",
  "syncedCount": 12,
  "totalListings": 12
}
```

### Manual Data Refresh
```bash
POST /api/admin/refreshNow
```

Immediately triggers data collection for all listings in the database. Fetches performance data from Wheelhouse and market data from AirDNA/Rabbu.

**Response:**
```json
{
  "message": "Manual refresh completed",
  "wheelhouseRows": 12,
  "marketRows": 8,
  "listingsSynced": 12
}
```

Both endpoints require admin access and are designed for operational maintenance.

### Performance Monitoring & Alerts
- Z-score analysis (1.5σ below benchmark triggers alerts)
- Real-time performance notifications
- Automated underperformance detection
- Critical alert escalation system

## 🔧 Configuration

The platform uses `src/config/rm-brain.ts` for core configuration:

```typescript
export const RM_BRAIN_CONFIG = {
  WEIGHT_CAP_PCT: 0.10,        // ±10% weight cap
  AB_MODE: 'all',              // 100% AI blend coverage
  AI: {
    CONFIDENCE_THRESHOLD: 0.85,
    EXCELLENT_SCORE_THRESHOLD: 90,
    OPTIMIZED_SCORE_THRESHOLD: 80,
  },
  ALERTS: {
    Z_SCORE_THRESHOLD: -1.5,   // 1.5σ below benchmark
    DECLINE_THRESHOLD_PCT: -15,
    CRITICAL_DECLINE_PCT: -25,
  }
};


## Automated AI Code Generation Pipeline

Our repository includes an automated pipeline that leverages OpenAI Codex to generate code for issues labelled `ai-task`. The workflow listens for GitHub issues with the `ai-task` label, invokes Codex to produce code based on the issue description, commits the generated code to a feature branch, runs tests and linting via `make check`, and opens a pull request for review.

```mermaid
flowchart TD
    A[GitHub Issue labelled 'ai-task'] --> B[GitHub Actions: codex_worker.yml]
    B --> C[Codex generation script]
    C --> D[Create branch ai/<issue-id> and commit code]
    D --> E[Run make check (black, ruff, mypy, pytest)]
    E --> F[Open Pull Request]
    F --> G[Merge to main on approval]
    G --> H[Replit deployment via replit-deploy.json]
```

**Workflow Steps**

1. **Issue creation** – When a new issue is labelled `ai-task`, the `codex_worker` workflow is triggered.
2. **Codex invocation** – The workflow calls the `codex_generate.py` script with the issue body, using your `OPENAI_API_KEY` to request code from OpenAI.
3. **Branch & commit** – Generated code is written to `ai_tasks/<issue-id>/main.py` on a new branch (`ai/<issue-id>`), and a commit is made using a conventional commit message.
4. **CI checks** – The workflow runs `make check`, which formats the code, lints it, performs static type checking, and runs unit tests.
5. **Pull request** – If checks pass, the workflow opens a pull request back to `main` for review.
6. **Deployment** – Merging to `main` triggers Replit deployment via `replit-deploy.json`, automatically pulling the latest code and restarting the app.
