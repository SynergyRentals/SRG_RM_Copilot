/**
 * Synergy RM Copilot Configuration
 * 
 * This file contains the core configuration for the revenue management system,
 * including weight caps and A/B testing parameters.
 */

// Simple configuration exports as requested
export const WEIGHT_CAP_PCT = 0.10;   // ±10% guard‑rail
export const AB_MODE        = 'all';  // 100% rollout

export const RM_BRAIN_CONFIG = {
  /**
   * Weight Cap Percentage (±10% vs native Wheelhouse recommendations)
   * This ensures AI recommendations stay within acceptable bounds
   * Range: 0.05 (5%) to 0.15 (15%) - default: 0.10 (10%)
   */
  WEIGHT_CAP_PCT: 0.10,
  
  /**
   * A/B Testing Mode Configuration
   * - 'all': 100% of listings use AI blend (current setting)
   * - 'partial': Split testing between AI and native recommendations
   * - 'control': Use native recommendations only (for testing)
   */
  AB_MODE: 'all' as 'all' | 'partial' | 'control',
  
  /**
   * AI Model Configuration
   */
  AI: {
    /**
     * Confidence threshold for applying recommendations automatically
     * Range: 0.7 (70%) to 0.95 (95%) - default: 0.85 (85%)
     */
    CONFIDENCE_THRESHOLD: 0.85,
    
    /**
     * Minimum AI score required for "Excellent" status
     * Range: 85 to 98 - default: 90
     */
    EXCELLENT_SCORE_THRESHOLD: 90,
    
    /**
     * Minimum AI score required for "Optimized" status  
     * Range: 70 to 89 - default: 80
     */
    OPTIMIZED_SCORE_THRESHOLD: 80,
  },
  
  /**
   * Performance Alert Configuration
   */
  ALERTS: {
    /**
     * Z-score threshold for performance alerts
     * Default: -1.5 (1.5 standard deviations below market benchmark)
     */
    Z_SCORE_THRESHOLD: -1.5,
    
    /**
     * Percentage decline threshold for week-over-week alerts
     * Default: -15 (15% decline triggers alert)
     */
    DECLINE_THRESHOLD_PCT: -15,
    
    /**
     * Critical decline threshold (immediate attention required)
     * Default: -25 (25% decline triggers critical alert)
     */
    CRITICAL_DECLINE_PCT: -25,
  },
  
  /**
   * Data Collection Configuration
   */
  DATA: {
    /**
     * Cron schedule for data collection (3am, 11am, 7pm)
     * Format: '0 3,11,19 * * *'
     */
    COLLECTION_SCHEDULE: '0 3,11,19 * * *',
    
    /**
     * Rate limiting for API calls
     */
    RATE_LIMITS: {
      /**
       * Wheelhouse API: Maximum 20 requests per minute
       */
      WHEELHOUSE_RPM: 20,
      
      /**
       * Guesty API: Minimum 60 seconds between requests
       */
      GUESTY_MIN_INTERVAL_MS: 60000,
    },
    
    /**
     * Data retention period (days)
     */
    RETENTION_DAYS: 365,
  },
  
  /**
   * Market Comparison Configuration
   */
  MARKET: {
    /**
     * Minimum market data points required for reliable comparison
     */
    MIN_DATA_POINTS: 10,
    
    /**
     * Market outperformance threshold (property performing better than X% of market)
     */
    OUTPERFORMANCE_PERCENTILE: 0.75, // Top 25%
    
    /**
     * Underperformance threshold (triggers alerts)
     */
    UNDERPERFORMANCE_PERCENTILE: 0.25, // Bottom 25%
  }
} as const;

/**
 * Environment-specific overrides
 * These values can be overridden via environment variables
 */
export const ENV_OVERRIDES = {
  WEIGHT_CAP_PCT: process.env.RM_WEIGHT_CAP_PCT 
    ? parseFloat(process.env.RM_WEIGHT_CAP_PCT) 
    : RM_BRAIN_CONFIG.WEIGHT_CAP_PCT,
    
  AB_MODE: (process.env.RM_AB_MODE as typeof RM_BRAIN_CONFIG.AB_MODE) 
    || RM_BRAIN_CONFIG.AB_MODE,
    
  AI_CONFIDENCE_THRESHOLD: process.env.RM_AI_CONFIDENCE_THRESHOLD
    ? parseFloat(process.env.RM_AI_CONFIDENCE_THRESHOLD)
    : RM_BRAIN_CONFIG.AI.CONFIDENCE_THRESHOLD,
} as const;

/**
 * Validation function to ensure configuration values are within acceptable ranges
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate weight cap
  if (ENV_OVERRIDES.WEIGHT_CAP_PCT < 0.05 || ENV_OVERRIDES.WEIGHT_CAP_PCT > 0.15) {
    errors.push(`Weight cap ${ENV_OVERRIDES.WEIGHT_CAP_PCT} is outside acceptable range (0.05-0.15)`);
  }
  
  // Validate AB mode
  if (!['all', 'partial', 'control'].includes(ENV_OVERRIDES.AB_MODE)) {
    errors.push(`Invalid AB mode: ${ENV_OVERRIDES.AB_MODE}`);
  }
  
  // Validate confidence threshold
  if (ENV_OVERRIDES.AI_CONFIDENCE_THRESHOLD < 0.7 || ENV_OVERRIDES.AI_CONFIDENCE_THRESHOLD > 0.95) {
    errors.push(`AI confidence threshold ${ENV_OVERRIDES.AI_CONFIDENCE_THRESHOLD} is outside acceptable range (0.7-0.95)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Export the final configuration with environment overrides applied
 */
export const CONFIG = {
  ...RM_BRAIN_CONFIG,
  WEIGHT_CAP_PCT: ENV_OVERRIDES.WEIGHT_CAP_PCT,
  AB_MODE: ENV_OVERRIDES.AB_MODE,
  AI: {
    ...RM_BRAIN_CONFIG.AI,
    CONFIDENCE_THRESHOLD: ENV_OVERRIDES.AI_CONFIDENCE_THRESHOLD,
  }
} as const;

// Validate configuration on startup
const validation = validateConfig();
if (!validation.isValid) {
  console.error('❌ Configuration validation errors:');
  validation.errors.forEach(error => console.error(`  - ${error}`));
  throw new Error('Invalid configuration detected');
}

console.log('✅ RM Brain configuration loaded successfully:', {
  weightCap: `±${(CONFIG.WEIGHT_CAP_PCT * 100).toFixed(1)}%`,
  abMode: CONFIG.AB_MODE,
  aiConfidence: `${(CONFIG.AI.CONFIDENCE_THRESHOLD * 100).toFixed(0)}%`
});
