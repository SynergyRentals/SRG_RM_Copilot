import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Listings table - property information
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  maxGuests: integer("max_guests").notNull(),
  imageUrl: text("image_url"),
  wheelhouseId: text("wheelhouse_id"),
  guestyId: text("guesty_id"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  pmsId: text("pms_id"), // null for disabled Guesty
  city: text("city"),
  bedroomCount: integer("bedroom_count"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Nightly stats - daily performance data
export const nightlyStats = pgTable("nightly_stats", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  date: timestamp("date").notNull(),
  adr: decimal("adr", { precision: 10, scale: 2 }),
  occupancy: decimal("occupancy", { precision: 5, scale: 2 }),
  revpar: decimal("revpar", { precision: 10, scale: 2 }),
  bookings: integer("bookings").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
  source: text("source"), // 'wheelhouse', 'guesty', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Market stats - comparative market data
export const marketStats = pgTable("market_stats", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  avgAdr: decimal("avg_adr", { precision: 10, scale: 2 }),
  avgOccupancy: decimal("avg_occupancy", { precision: 5, scale: 2 }),
  avgRevpar: decimal("avg_revpar", { precision: 10, scale: 2 }),
  topPercentileRevpar: decimal("top_percentile_revpar", { precision: 10, scale: 2 }),
  source: text("source"), // 'airdna', 'rabbu', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// AI recommendations - ML-generated suggestions
export const aiRecs = pgTable("ai_recs", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  recommendationType: text("recommendation_type").notNull(), // 'price_optimization', 'amenity_update', etc.
  recommendation: jsonb("recommendation").notNull(), // JSON object with recommendation details
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100 confidence score
  potentialImpact: decimal("potential_impact", { precision: 10, scale: 2 }), // Expected revenue impact
  status: text("status").default('pending'), // 'pending', 'applied', 'rejected'
  aiScore: integer("ai_score"), // Overall AI performance score
  createdAt: timestamp("created_at").defaultNow(),
  appliedAt: timestamp("applied_at"),
});

// User actions - track user interactions with recommendations
export const userActions = pgTable("user_actions", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  actionType: text("action_type").notNull(), // 'apply_recommendation', 'reject_recommendation', 'manual_price_change'
  actionData: jsonb("action_data"), // Additional action details
  result: text("result"), // 'success', 'failed', 'partial'
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const listingsRelations = relations(listings, ({ many }) => ({
  nightlyStats: many(nightlyStats),
  aiRecs: many(aiRecs),
  userActions: many(userActions),
}));

export const nightlyStatsRelations = relations(nightlyStats, ({ one }) => ({
  listing: one(listings, {
    fields: [nightlyStats.listingId],
    references: [listings.id],
  }),
}));

export const aiRecsRelations = relations(aiRecs, ({ one }) => ({
  listing: one(listings, {
    fields: [aiRecs.listingId],
    references: [listings.id],
  }),
}));

export const userActionsRelations = relations(userActions, ({ one }) => ({
  listing: one(listings, {
    fields: [userActions.listingId],
    references: [listings.id],
  }),
}));

// Insert schemas
export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNightlyStatsSchema = createInsertSchema(nightlyStats).omit({
  id: true,
  createdAt: true,
});

export const insertMarketStatsSchema = createInsertSchema(marketStats).omit({
  id: true,
  createdAt: true,
});

export const insertAiRecsSchema = createInsertSchema(aiRecs).omit({
  id: true,
  createdAt: true,
  appliedAt: true,
});

export const insertUserActionsSchema = createInsertSchema(userActions).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertNightlyStats = z.infer<typeof insertNightlyStatsSchema>;
export type NightlyStats = typeof nightlyStats.$inferSelect;
export type InsertMarketStats = z.infer<typeof insertMarketStatsSchema>;
export type MarketStats = typeof marketStats.$inferSelect;
export type InsertAiRecs = z.infer<typeof insertAiRecsSchema>;
export type AiRecs = typeof aiRecs.$inferSelect;
export type InsertUserActions = z.infer<typeof insertUserActionsSchema>;
export type UserActions = typeof userActions.$inferSelect;
