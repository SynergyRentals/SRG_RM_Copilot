import { 
  listings, 
  nightlyStats, 
  marketStats, 
  aiRecs, 
  userActions,
  type Listing, 
  type InsertListing,
  type NightlyStats,
  type InsertNightlyStats,
  type MarketStats,
  type InsertMarketStats,
  type AiRecs,
  type InsertAiRecs,
  type UserActions,
  type InsertUserActions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Listings
  getListings(): Promise<Listing[]>;
  getListing(id: number): Promise<Listing | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing>;
  
  // Nightly Stats
  getNightlyStats(listingId: number, startDate?: Date, endDate?: Date): Promise<NightlyStats[]>;
  createNightlyStats(stats: InsertNightlyStats): Promise<NightlyStats>;
  getPortfolioStats(startDate?: Date, endDate?: Date): Promise<{
    avgRevpar: number;
    avgAdr: number;
    avgOccupancy: number;
    totalRevenue: number;
  }>;
  
  // Market Stats
  getMarketStats(location: string, startDate?: Date, endDate?: Date): Promise<MarketStats[]>;
  createMarketStats(stats: InsertMarketStats): Promise<MarketStats>;
  
  // AI Recommendations
  getAiRecs(listingId: number): Promise<AiRecs[]>;
  createAiRec(rec: InsertAiRecs): Promise<AiRecs>;
  updateAiRecStatus(id: number, status: string): Promise<AiRecs>;
  
  // User Actions
  createUserAction(action: InsertUserActions): Promise<UserActions>;
  getUserActions(listingId: number): Promise<UserActions[]>;
  
  // Analytics
  getListingPerformanceWithComparison(listingId: number): Promise<{
    listing: Listing;
    recentStats: NightlyStats[];
    marketComparison: MarketStats[];
    recommendations: AiRecs[];
  } | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Listings
  async getListings(): Promise<Listing[]> {
    return await db.select().from(listings).where(eq(listings.isActive, true));
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing || undefined;
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const [listing] = await db
      .insert(listings)
      .values(insertListing)
      .returning();
    return listing;
  }

  async upsertListing(insertListing: any): Promise<Listing> {
    // Try to find existing listing by wheelhouseId first
    if (insertListing.wheelhouseId) {
      const existing = await db.select().from(listings).where(eq(listings.wheelhouseId, insertListing.wheelhouseId));
      
      if (existing.length > 0) {
        // Update existing listing
        const [listing] = await db
          .update(listings)
          .set({
            name: insertListing.name,
            city: insertListing.city,
            bedroomCount: insertListing.bedroomCount,
            updatedAt: new Date()
          })
          .where(eq(listings.wheelhouseId, insertListing.wheelhouseId))
          .returning();
        return listing;
      }
    }
    
    // Insert new listing
    const [listing] = await db
      .insert(listings)
      .values(insertListing)
      .returning();
    return listing;
  }

  async updateListing(id: number, insertListing: Partial<InsertListing>): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ ...insertListing, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  // Nightly Stats
  async getNightlyStats(listingId: number, startDate?: Date, endDate?: Date): Promise<NightlyStats[]> {
    let conditions = [eq(nightlyStats.listingId, listingId)];
    
    if (startDate && endDate) {
      conditions.push(gte(nightlyStats.date, startDate));
      conditions.push(lte(nightlyStats.date, endDate));
    }
    
    return await db.select()
      .from(nightlyStats)
      .where(and(...conditions))
      .orderBy(desc(nightlyStats.date));
  }

  async createNightlyStats(stats: InsertNightlyStats): Promise<NightlyStats> {
    const [nightlyStatsRecord] = await db
      .insert(nightlyStats)
      .values(stats)
      .returning();
    return nightlyStatsRecord;
  }

  async getPortfolioStats(startDate?: Date, endDate?: Date): Promise<{
    avgRevpar: number;
    avgAdr: number;
    avgOccupancy: number;
    totalRevenue: number;
  }> {
    let conditions = [];
    
    if (startDate && endDate) {
      conditions.push(gte(nightlyStats.date, startDate));
      conditions.push(lte(nightlyStats.date, endDate));
    }

    let query = db
      .select({
        avgRevpar: sql<number>`AVG(${nightlyStats.revpar})`,
        avgAdr: sql<number>`AVG(${nightlyStats.adr})`,
        avgOccupancy: sql<number>`AVG(${nightlyStats.occupancy})`,
        totalRevenue: sql<number>`SUM(${nightlyStats.revenue})`,
      })
      .from(nightlyStats);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const [result] = await query;
    return {
      avgRevpar: parseFloat(result.avgRevpar?.toString() || '0'),
      avgAdr: parseFloat(result.avgAdr?.toString() || '0'),
      avgOccupancy: parseFloat(result.avgOccupancy?.toString() || '0'),
      totalRevenue: parseFloat(result.totalRevenue?.toString() || '0'),
    };
  }

  // Market Stats
  async getMarketStats(location: string, startDate?: Date, endDate?: Date): Promise<MarketStats[]> {
    let conditions = [eq(marketStats.location, location)];
    
    if (startDate && endDate) {
      conditions.push(gte(marketStats.date, startDate));
      conditions.push(lte(marketStats.date, endDate));
    }
    
    return await db.select()
      .from(marketStats)
      .where(and(...conditions))
      .orderBy(desc(marketStats.date));
  }

  async createMarketStats(stats: InsertMarketStats): Promise<MarketStats> {
    const [marketStatsRecord] = await db
      .insert(marketStats)
      .values(stats)
      .returning();
    return marketStatsRecord;
  }

  // AI Recommendations
  async getAiRecs(listingId: number): Promise<AiRecs[]> {
    return await db
      .select()
      .from(aiRecs)
      .where(eq(aiRecs.listingId, listingId))
      .orderBy(desc(aiRecs.createdAt));
  }

  async createAiRec(rec: InsertAiRecs): Promise<AiRecs> {
    const [aiRec] = await db
      .insert(aiRecs)
      .values(rec)
      .returning();
    return aiRec;
  }

  async updateAiRecStatus(id: number, status: string): Promise<AiRecs> {
    const [aiRec] = await db
      .update(aiRecs)
      .set({ status, appliedAt: status === 'applied' ? new Date() : undefined })
      .where(eq(aiRecs.id, id))
      .returning();
    return aiRec;
  }

  // User Actions
  async createUserAction(action: InsertUserActions): Promise<UserActions> {
    const [userAction] = await db
      .insert(userActions)
      .values(action)
      .returning();
    return userAction;
  }

  async getUserActions(listingId: number): Promise<UserActions[]> {
    return await db
      .select()
      .from(userActions)
      .where(eq(userActions.listingId, listingId))
      .orderBy(desc(userActions.createdAt));
  }

  // Analytics
  async getListingPerformanceWithComparison(listingId: number): Promise<{
    listing: Listing;
    recentStats: NightlyStats[];
    marketComparison: MarketStats[];
    recommendations: AiRecs[];
  } | undefined> {
    const listing = await this.getListing(listingId);
    if (!listing) return undefined;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentStats, marketComparison, recommendations] = await Promise.all([
      this.getNightlyStats(listingId, thirtyDaysAgo),
      this.getMarketStats(listing.location, thirtyDaysAgo),
      this.getAiRecs(listingId)
    ]);

    return {
      listing,
      recentStats,
      marketComparison,
      recommendations: recommendations.slice(0, 5) // Latest 5 recommendations
    };
  }
}

export const storage = new DatabaseStorage();
