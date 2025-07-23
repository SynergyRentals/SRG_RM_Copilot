import { useQuery } from "@tanstack/react-query";

interface DashboardData {
  portfolioStats: {
    avgRevpar: number;
    avgAdr: number;
    avgOccupancy: number;
    totalRevenue: number;
  };
  listings: Array<{
    id: number;
    name: string;
    location: string;
    imageUrl?: string;
    revpar: string;
    revparChange: string;
    adr: string;
    occupancy: string;
    aiScore: number;
    status: string;
  }>;
}

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
