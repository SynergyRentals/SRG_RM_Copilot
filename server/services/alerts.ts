// Performance monitoring and alerting system
// Uses z-score analysis (1.5σ below benchmark) to trigger alerts

export interface PerformanceAlert {
  listingId: number;
  alertType: 'underperformance' | 'critical_drop' | 'market_lag' | 'occupancy_concern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  currentValue: number;
  benchmarkValue: number;
  zScore: number;
  suggestedAction: string;
  timestamp: Date;
}

const Z_SCORE_THRESHOLD = 1.5; // 1.5 standard deviations below benchmark triggers alert

export async function checkPerformanceAlerts(
  listingData: {
    id: number;
    name: string;
    recentStats: Array<{
      adr: string;
      occupancy: string;
      revpar: string;
      revenue: string;
    }>;
    marketData?: {
      avgAdr: string;
      avgOccupancy: string;
      avgRevpar: string;
    };
  }[]
): Promise<PerformanceAlert[]> {
  
  const alerts: PerformanceAlert[] = [];
  
  console.log(`🔍 Checking performance alerts for ${listingData.length} listings...`);
  
  for (const listing of listingData) {
    if (listing.recentStats.length < 3) {
      continue; // Need at least 3 data points for meaningful analysis
    }
    
    // Calculate current performance metrics
    const currentMetrics = calculateCurrentMetrics(listing.recentStats);
    
    // Check against market benchmarks if available
    if (listing.marketData) {
      const marketAlerts = analyzeMarketPerformance(listing, currentMetrics, listing.marketData);
      alerts.push(...marketAlerts);
    }
    
    // Check for trend-based alerts
    const trendAlerts = analyzeTrendPerformance(listing, listing.recentStats);
    alerts.push(...trendAlerts);
    
    // Check for critical thresholds
    const criticalAlerts = analyzeCriticalThresholds(listing, currentMetrics);
    alerts.push(...criticalAlerts);
  }
  
  console.log(`🚨 Performance analysis completed: ${alerts.length} alerts generated`);
  
  // Sort alerts by severity
  alerts.sort((a, b) => {
    const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
  
  return alerts;
}

function calculateCurrentMetrics(recentStats: Array<{ adr: string; occupancy: string; revpar: string; revenue: string }>) {
  const recent = recentStats.slice(-7); // Last 7 days
  
  return {
    avgAdr: recent.reduce((sum, stat) => sum + parseFloat(stat.adr), 0) / recent.length,
    avgOccupancy: recent.reduce((sum, stat) => sum + parseFloat(stat.occupancy), 0) / recent.length,
    avgRevpar: recent.reduce((sum, stat) => sum + parseFloat(stat.revpar), 0) / recent.length,
    totalRevenue: recent.reduce((sum, stat) => sum + parseFloat(stat.revenue), 0)
  };
}

function analyzeMarketPerformance(
  listing: { id: number; name: string },
  currentMetrics: any,
  marketData: { avgAdr: string; avgOccupancy: string; avgRevpar: string }
): PerformanceAlert[] {
  
  const alerts: PerformanceAlert[] = [];
  const marketAdr = parseFloat(marketData.avgAdr);
  const marketOccupancy = parseFloat(marketData.avgOccupancy);
  const marketRevpar = parseFloat(marketData.avgRevpar);
  
  // Z-score calculations (assuming market standard deviation of ~15% for each metric)
  const adrZScore = (currentMetrics.avgAdr - marketAdr) / (marketAdr * 0.15);
  const occupancyZScore = (currentMetrics.avgOccupancy - marketOccupancy) / (marketOccupancy * 0.15);
  const revparZScore = (currentMetrics.avgRevpar - marketRevpar) / (marketRevpar * 0.15);
  
  // ADR underperformance alert
  if (adrZScore < -Z_SCORE_THRESHOLD) {
    alerts.push({
      listingId: listing.id,
      alertType: 'market_lag',
      severity: adrZScore < -2.5 ? 'critical' : adrZScore < -2.0 ? 'high' : 'medium',
      message: `ADR significantly below market average (${currentMetrics.avgAdr.toFixed(0)} vs $${marketAdr.toFixed(0)})`,
      metric: 'adr',
      currentValue: currentMetrics.avgAdr,
      benchmarkValue: marketAdr,
      zScore: adrZScore,
      suggestedAction: 'Consider competitive rate analysis and pricing optimization',
      timestamp: new Date()
    });
  }
  
  // Occupancy underperformance alert
  if (occupancyZScore < -Z_SCORE_THRESHOLD) {
    alerts.push({
      listingId: listing.id,
      alertType: 'occupancy_concern',
      severity: occupancyZScore < -2.5 ? 'critical' : occupancyZScore < -2.0 ? 'high' : 'medium',
      message: `Occupancy significantly below market (${currentMetrics.avgOccupancy.toFixed(1)}% vs ${marketOccupancy.toFixed(1)}%)`,
      metric: 'occupancy',
      currentValue: currentMetrics.avgOccupancy,
      benchmarkValue: marketOccupancy,
      zScore: occupancyZScore,
      suggestedAction: 'Review minimum stay requirements and pricing strategy',
      timestamp: new Date()
    });
  }
  
  // RevPAR underperformance alert
  if (revparZScore < -Z_SCORE_THRESHOLD) {
    alerts.push({
      listingId: listing.id,
      alertType: 'underperformance',
      severity: revparZScore < -2.5 ? 'critical' : revparZScore < -2.0 ? 'high' : 'medium',
      message: `RevPAR significantly below market ($${currentMetrics.avgRevpar.toFixed(0)} vs $${marketRevpar.toFixed(0)})`,
      metric: 'revpar',
      currentValue: currentMetrics.avgRevpar,
      benchmarkValue: marketRevpar,
      zScore: revparZScore,
      suggestedAction: 'Immediate revenue optimization review recommended',
      timestamp: new Date()
    });
  }
  
  return alerts;
}

function analyzeTrendPerformance(
  listing: { id: number; name: string },
  recentStats: Array<{ adr: string; occupancy: string; revpar: string; revenue: string }>
): PerformanceAlert[] {
  
  const alerts: PerformanceAlert[] = [];
  
  if (recentStats.length < 7) return alerts;
  
  // Calculate 7-day moving trends
  const recent = recentStats.slice(-7);
  const previous = recentStats.slice(-14, -7);
  
  if (previous.length < 7) return alerts;
  
  const recentAvgRevpar = recent.reduce((sum, stat) => sum + parseFloat(stat.revpar), 0) / recent.length;
  const previousAvgRevpar = previous.reduce((sum, stat) => sum + parseFloat(stat.revpar), 0) / previous.length;
  
  const revparChange = (recentAvgRevpar - previousAvgRevpar) / previousAvgRevpar;
  
  // Alert for significant downward trends
  if (revparChange < -0.2) { // 20% decline
    alerts.push({
      listingId: listing.id,
      alertType: 'critical_drop',
      severity: revparChange < -0.35 ? 'critical' : 'high',
      message: `Significant RevPAR decline: ${(revparChange * 100).toFixed(1)}% drop over past week`,
      metric: 'revpar_trend',
      currentValue: recentAvgRevpar,
      benchmarkValue: previousAvgRevpar,
      zScore: revparChange / 0.1, // Normalize trend as z-score
      suggestedAction: 'Urgent review of pricing and market conditions needed',
      timestamp: new Date()
    });
  }
  
  return alerts;
}

function analyzeCriticalThresholds(
  listing: { id: number; name: string },
  currentMetrics: any
): PerformanceAlert[] {
  
  const alerts: PerformanceAlert[] = [];
  
  // Critical occupancy threshold
  if (currentMetrics.avgOccupancy < 30) {
    alerts.push({
      listingId: listing.id,
      alertType: 'occupancy_concern',
      severity: 'critical',
      message: `Critically low occupancy: ${currentMetrics.avgOccupancy.toFixed(1)}%`,
      metric: 'occupancy',
      currentValue: currentMetrics.avgOccupancy,
      benchmarkValue: 70, // Expected baseline
      zScore: (currentMetrics.avgOccupancy - 70) / 15,
      suggestedAction: 'Immediate pricing and marketing review required',
      timestamp: new Date()
    });
  }
  
  // Critical ADR threshold
  if (currentMetrics.avgAdr < 50) {
    alerts.push({
      listingId: listing.id,
      alertType: 'underperformance',
      severity: 'high',
      message: `Very low ADR: $${currentMetrics.avgAdr.toFixed(0)}`,
      metric: 'adr',
      currentValue: currentMetrics.avgAdr,
      benchmarkValue: 150, // Expected baseline
      zScore: (currentMetrics.avgAdr - 150) / 30,
      suggestedAction: 'Review property positioning and value proposition',
      timestamp: new Date()
    });
  }
  
  return alerts;
}