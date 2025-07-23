import { db } from './db';
import { storage } from './storage';

export async function seedSampleData() {
  console.log('🌱 Seeding sample data...');
  
  try {
    // Create sample listings
    const listing1 = await storage.createListing({
      name: 'Downtown Luxury Loft',
      location: 'San Francisco, CA',
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      wheelhouseId: 'wh_12345',
      guestyId: 'gu_12345',
      currentPrice: '285.00',
      isActive: true
    });

    const listing2 = await storage.createListing({
      name: 'Cozy Beach House',
      location: 'Santa Monica, CA',
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      wheelhouseId: 'wh_12346',
      guestyId: 'gu_12346',
      currentPrice: '450.00',
      isActive: true
    });

    const listing3 = await storage.createListing({
      name: 'Mountain Cabin Retreat',
      location: 'Lake Tahoe, CA',
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      wheelhouseId: 'wh_12347',
      guestyId: 'gu_12347',
      currentPrice: '380.00',
      isActive: true
    });

    console.log('✅ Sample listings created');

    // Create sample nightly stats for the past 30 days
    const listings = [listing1, listing2, listing3];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (const listing of listings) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Generate realistic performance data with some variation
        const baseAdr = parseFloat(listing.currentPrice || '200');
        const occupancyRate = 0.65 + (Math.random() * 0.3); // 65-95% occupancy
        const adr = baseAdr + (Math.random() * 50) - 25; // ±$25 variation
        const revpar = adr * occupancyRate;
        const revenue = revpar * 1.2; // Approximate monthly revenue factor

        await storage.createNightlyStats({
          listingId: listing.id,
          date: date,
          adr: adr.toFixed(2),
          occupancy: (occupancyRate * 100).toFixed(2),
          revpar: revpar.toFixed(2),
          bookings: Math.floor(Math.random() * 3) + 1,
          revenue: revenue.toFixed(2),
          source: i % 2 === 0 ? 'wheelhouse' : 'guesty'
        });
      }
    }

    console.log('✅ Sample nightly stats created');

    // Create sample market stats
    const locations = ['San Francisco, CA', 'Santa Monica, CA', 'Lake Tahoe, CA'];
    
    for (const location of locations) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const marketAdr = 200 + (Math.random() * 100);
        const marketOccupancy = 0.70 + (Math.random() * 0.25);
        const marketRevpar = marketAdr * marketOccupancy;
        
        await storage.createMarketStats({
          location: location,
          date: date,
          avgAdr: marketAdr.toFixed(2),
          avgOccupancy: (marketOccupancy * 100).toFixed(2),
          avgRevpar: marketRevpar.toFixed(2),
          topPercentileRevpar: (marketRevpar * 1.4).toFixed(2),
          source: i % 2 === 0 ? 'airdna' : 'rabbu'
        });
      }
    }

    console.log('✅ Sample market stats created');

    // Create sample AI recommendations
    for (const listing of listings) {
      await storage.createAiRec({
        listingId: listing.id,
        recommendationType: 'pricing_optimization',
        recommendation: {
          title: 'Optimize Weekend Pricing',
          description: 'Increase rates by 8% for Friday-Sunday to match demand patterns',
          potentialImpact: 312
        },
        confidence: 85,
        potentialImpact: 312,
        status: 'pending',
        aiScore: 92
      });

      await storage.createAiRec({
        listingId: listing.id,
        recommendationType: 'occupancy_strategy',
        recommendation: {
          title: 'Adjust Minimum Stay',
          description: 'Reduce minimum stay to 2 nights during off-peak periods',
          potentialImpact: 185
        },
        confidence: 78,
        potentialImpact: 185,
        status: 'pending',
        aiScore: 88
      });
    }

    console.log('✅ Sample AI recommendations created');
    console.log('🎉 Sample data seeding completed successfully!');

    return {
      listingsCreated: listings.length,
      statsCreated: listings.length * 30,
      marketStatsCreated: locations.length * 30,
      aiRecsCreated: listings.length * 2
    };

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
}

// Manual trigger for seeding data
export async function triggerDataSeed() {
  return await seedSampleData();
}