import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertListingSchema, insertUserActionsSchema } from "@shared/schema";
import { generateAIRecommendations } from "./services/openai";
import { checkPerformanceAlerts } from "./services/alerts";
import { seedSampleData } from "./seed-data";
import { fetchWheelhouseListings, fetchWheelhouseData, fetchAirDNAData, fetchRabbuData } from "./services/apis";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard endpoint - portfolio overview
  app.get("/api/dashboard", async (req, res) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [listings, portfolioStats] = await Promise.all([
        storage.getListings(),
        storage.getPortfolioStats(thirtyDaysAgo)
      ]);

      // Get recent stats for each listing to calculate changes
      const listingsWithStats = await Promise.all(
        listings.map(async (listing) => {
          const stats = await storage.getNightlyStats(listing.id, thirtyDaysAgo);
          const recentStats = stats.slice(0, 7); // Last 7 days
          const previousStats = stats.slice(7, 14); // Previous 7 days
          
          const currentRevpar = recentStats.length > 0 
            ? recentStats.reduce((sum, s) => sum + parseFloat(s.revpar?.toString() || '0'), 0) / recentStats.length
            : 0;
          const previousRevpar = previousStats.length > 0
            ? previousStats.reduce((sum, s) => sum + parseFloat(s.revpar?.toString() || '0'), 0) / previousStats.length
            : 0;
          
          const revparChange = previousRevpar > 0 
            ? ((currentRevpar - previousRevpar) / previousRevpar) * 100
            : 0;

          const aiRecs = await storage.getAiRecs(listing.id);
          const aiScore = aiRecs.length > 0 ? aiRecs[0].aiScore || 0 : 0;

          return {
            ...listing,
            revpar: currentRevpar.toFixed(2),
            revparChange: revparChange.toFixed(1),
            adr: recentStats.length > 0 
              ? (recentStats.reduce((sum, s) => sum + parseFloat(s.adr?.toString() || '0'), 0) / recentStats.length).toFixed(2)
              : '0',
            occupancy: recentStats.length > 0
              ? (recentStats.reduce((sum, s) => sum + parseFloat(s.occupancy?.toString() || '0'), 0) / recentStats.length).toFixed(1)
              : '0',
            aiScore,
            status: aiScore >= 90 ? 'Excellent' : aiScore >= 80 ? 'Optimized' : 'Alert'
          };
        })
      );

      res.json({
        portfolioStats,
        listings: listingsWithStats
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ message: 'Failed to load dashboard data' });
    }
  });

  // Listing detail endpoint
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const data = await storage.getListingPerformanceWithComparison(listingId);
      
      if (!data) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      
      res.json(data);
    } catch (error) {
      console.error('Listing detail error:', error);
      res.status(500).json({ message: 'Failed to load listing data' });
    }
  });

  // Create listing endpoint
  app.post("/api/listings", async (req, res) => {
    try {
      const listingData = insertListingSchema.parse(req.body);
      const listing = await storage.createListing(listingData);
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid listing data', errors: error.errors });
      }
      console.error('Create listing error:', error);
      res.status(500).json({ message: 'Failed to create listing' });
    }
  });

  // AI suggestions endpoint
  app.post("/api/ai/suggest", async (req, res) => {
    try {
      const { listingId } = req.body;
      
      if (!listingId) {
        return res.status(400).json({ message: 'Listing ID is required' });
      }

      const data = await storage.getListingPerformanceWithComparison(listingId);
      if (!data) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      const recommendations = await generateAIRecommendations(data);
      
      // Store AI recommendations
      for (const rec of recommendations) {
        await storage.createAiRec({
          listingId,
          recommendationType: rec.type,
          recommendation: rec,
          confidence: rec.confidence || 85,
          potentialImpact: rec.potentialImpact || 0,
          aiScore: rec.aiScore || 80
        });
      }

      res.json({ recommendations });
    } catch (error) {
      console.error('AI suggestion error:', error);
      res.status(500).json({ message: 'Failed to generate AI suggestions' });
    }
  });

  // Apply AI recommendation endpoint
  app.post("/api/ai/apply/:recId", async (req, res) => {
    try {
      const recId = parseInt(req.params.recId);
      const aiRec = await storage.updateAiRecStatus(recId, 'applied');
      
      // Log user action
      await storage.createUserAction({
        listingId: aiRec.listingId,
        actionType: 'apply_recommendation',
        actionData: aiRec.recommendation as any,
        result: 'success'
      });

      res.json({ message: 'Recommendation applied successfully', recommendation: aiRec });
    } catch (error) {
      console.error('Apply recommendation error:', error);
      res.status(500).json({ message: 'Failed to apply recommendation' });
    }
  });

  // Performance alerts endpoint
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await checkPerformanceAlerts();
      res.json({ alerts });
    } catch (error) {
      console.error('Alerts error:', error);
      res.status(500).json({ message: 'Failed to check alerts' });
    }
  });

  // User action logging endpoint
  app.post("/api/actions", async (req, res) => {
    try {
      const actionData = insertUserActionsSchema.parse(req.body);
      const action = await storage.createUserAction(actionData);
      res.status(201).json(action);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid action data', errors: error.errors });
      }
      console.error('Create action error:', error);
      res.status(500).json({ message: 'Failed to log action' });
    }
  });

  // Seed sample data endpoint (for development/demo)
  app.post("/api/seed-data", async (req, res) => {
    try {
      const result = await seedSampleData();
      res.json({
        message: 'Sample data seeded successfully',
        result
      });
    } catch (error) {
      console.error('Seed data error:', error);
      res.status(500).json({ message: 'Failed to seed sample data' });
    }
  });

  // Admin endpoint: Sync listings from Wheelhouse
  app.post("/api/admin/syncListings", async (req, res) => {
    try {
      console.log('🔄 Starting Wheelhouse listings sync...');
      
      const wheelhouseListings = await fetchWheelhouseListings();
      let syncedCount = 0;
      
      for (const whListing of wheelhouseListings) {
        await storage.upsertListing({
          wheelhouseId: whListing.id,
          name: whListing.name,
          city: whListing.city,
          bedroomCount: whListing.bedroom_count,
          bedrooms: whListing.bedroom_count,
          bathrooms: whListing.bathroom_count || 1,
          maxGuests: whListing.max_guests || 4,
          location: whListing.city,
          pmsId: null, // Guesty disabled
          isActive: true
        });
        syncedCount++;
      }
      
      console.log(`✅ Synced ${syncedCount} listings from Wheelhouse`);
      
      res.json({
        message: 'Listings sync completed',
        syncedCount,
        totalListings: wheelhouseListings.length
      });
      
    } catch (error) {
      console.error('Sync listings error:', error);
      res.status(500).json({ message: 'Failed to sync listings' });
    }
  });

  // Admin endpoint: Manual data refresh
  app.post("/api/admin/refreshNow", async (req, res) => {
    try {
      console.log('🔄 Starting manual data refresh...');
      
      const listings = await storage.getListings();
      let wheelhouseRows = 0;
      let marketRows = 0;
      
      for (const listing of listings) {
        try {
          // Fetch data from all sources
          const [wheelhouseData, airDNAData, rabbuData] = await Promise.allSettled([
            fetchWheelhouseData([listing.wheelhouseId].filter(Boolean)),
            fetchAirDNAData([listing.city || listing.location]),
            fetchRabbuData([listing.city || listing.location])
          ]);
          
          // Process Wheelhouse data
          if (wheelhouseData.status === 'fulfilled' && wheelhouseData.value.length > 0) {
            const data = wheelhouseData.value[0];
            await storage.createNightlyStats({
              listingId: listing.id,
              date: new Date(),
              adr: data.adr?.toString() || '0',
              occupancy: ((data.occupancy || 0) * 100).toString(),
              revpar: data.revpar?.toString() || '0',
              bookings: data.bookings || 1,
              revenue: ((data.revpar || 0) * 1.2).toString(),
              source: 'wheelhouse'
            });
            wheelhouseRows++;
          }
          
          // Process market data (AirDNA)
          if (airDNAData.status === 'fulfilled' && airDNAData.value.length > 0) {
            const data = airDNAData.value[0];
            await storage.createMarketStats({
              location: listing.city || listing.location,
              date: new Date(),
              avgAdr: data.marketAdr?.toString() || '0',
              avgOccupancy: ((data.marketOccupancy || 0) * 100).toString(),
              avgRevpar: data.marketRevpar?.toString() || '0',
              topPercentileRevpar: ((data.marketRevpar || 0) * 1.4).toString(),
              source: 'airdna'
            });
            marketRows++;
          }
          
          // Process market data (Rabbu)
          if (rabbuData.status === 'fulfilled' && rabbuData.value.length > 0) {
            const data = rabbuData.value[0];
            await storage.createMarketStats({
              location: listing.city || listing.location,
              date: new Date(),
              avgAdr: data.marketAdr?.toString() || '0',
              avgOccupancy: ((data.marketOccupancy || 0) * 100).toString(),
              avgRevpar: data.marketRevpar?.toString() || '0',
              topPercentileRevpar: ((data.marketRevpar || 0) * 1.4).toString(),
              source: 'rabbu'
            });
            marketRows++;
          }
          
        } catch (error) {
          console.error(`Error refreshing data for listing ${listing.id}:`, error);
        }
      }
      
      console.log(`✅ Manual refresh completed: ${wheelhouseRows} Wheelhouse rows, ${marketRows} market rows`);
      
      res.json({
        message: 'Manual refresh completed',
        wheelhouseRows,
        marketRows,
        listingsSynced: listings.length
      });
      
    } catch (error) {
      console.error('Manual refresh error:', error);
      res.status(500).json({ message: 'Failed to refresh data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
