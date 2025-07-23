import { useQuery } from "@tanstack/react-query";
import type { Listing, NightlyStats, MarketStats, AiRecs } from "@shared/schema";

interface ListingDetailData {
  listing: Listing;
  recentStats: NightlyStats[];
  marketComparison: MarketStats[];
  recommendations: AiRecs[];
}

export function useListingData(listingId: number) {
  return useQuery<ListingDetailData>({
    queryKey: ['/api/listings', listingId],
    enabled: listingId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
