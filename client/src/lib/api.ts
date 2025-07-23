import { apiRequest } from "./queryClient";

export interface AlertData {
  listingId: number;
  listingName: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentValue: number;
  benchmarkValue: number;
  deviation: number;
  recommendedAction: string;
  createdAt: Date;
}

export interface AIRecommendationRequest {
  listingId: number;
}

export interface AIRecommendationResponse {
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    potentialImpact: number;
    confidence: number;
    aiScore: number;
    actionable: boolean;
    priority: 'high' | 'medium' | 'low';
    data: any;
  }>;
}

// Generate AI recommendations for a listing
export async function generateAIRecommendations(data: AIRecommendationRequest): Promise<AIRecommendationResponse> {
  const response = await apiRequest('POST', '/api/ai/suggest', data);
  return await response.json();
}

// Apply an AI recommendation
export async function applyAIRecommendation(recId: number): Promise<{ message: string; recommendation: any }> {
  const response = await apiRequest('POST', `/api/ai/apply/${recId}`, {});
  return await response.json();
}

// Get performance alerts
export async function getPerformanceAlerts(): Promise<{ alerts: AlertData[] }> {
  const response = await apiRequest('GET', '/api/alerts', undefined);
  return await response.json();
}

// Log user action
export async function logUserAction(action: {
  listingId: number;
  actionType: string;
  actionData?: any;
  result?: string;
}): Promise<any> {
  const response = await apiRequest('POST', '/api/actions', action);
  return await response.json();
}

// Trigger manual data collection (for testing)
export async function triggerDataCollection(): Promise<{ message: string }> {
  const response = await apiRequest('POST', '/api/admin/trigger-collection', {});
  return await response.json();
}

// Export dashboard data
export async function exportDashboardData(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
  const response = await apiRequest('GET', `/api/export/dashboard?format=${format}`, undefined);
  return await response.blob();
}
