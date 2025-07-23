import cron from 'node-cron';
import { 
  fetchWheelhouseData, 
  fetchGuestyData, 
  fetchAirDNAData, 
  fetchRabbuData 
} from './apis';
import { storage } from '../storage';
import { checkPerformanceAlerts } from './alerts';

// Cron schedule: 3am, 11am, 7pm daily (0 3,11,19 * * *)
// Queues Wheelhouse fetches at ≤20 req/min and enforces a 60-second gap for Guesty calls
const CRON_SCHEDULE = '0 3,11,19 * * *';

export function initializeCronJobs() {
  console.log('🕐 Initializing cron jobs for data collection...');
  
  // Main data collection job - runs 3 times daily
  cron.schedule(CRON_SCHEDULE, async () => {
    console.log('🚀 Starting scheduled data collection...');
    
    try {
      const listings = await storage.getListings();
      
      // Process listings in batches to respect rate limits
      const batchSize = 5; // Process 5 listings at a time
      
      for (let i = 0; i < listings.length; i += batchSize) {
        const batch = listings.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (listing) => {
          try {
            // Fetch data from all sources with rate limiting
            const [wheelhouseData, guestyData, airDNAData, rabbuData] = await Promise.allSettled([
              fetchWheelhouseData(listing),
              fetchGuestyData(listing),
              fetchAirDNAData(listing.location),
              fetchRabbuData(listing.location)
            ]);

            // Process Wheelhouse data (if successful)
            if (wheelhouseData.status === 'fulfilled' && wheelhouseData.value) {
              await storage.createNightlyStats({
                listingId: listing.id,
                date: new Date(),
                adr: wheelhouseData.value.adr?.toString(),
                occupancy: wheelhouseData.value.occupancy?.toString(),
                revpar: wheelhouseData.value.revpar?.toString(),
                bookings: wheelhouseData.value.bookings || 0,
                revenue: wheelhouseData.value.revenue?.toString(),
                source: 'wheelhouse'
              });
            }

            // Process Guesty data (if successful)
            if (guestyData.status === 'fulfilled' && guestyData.value) {
              await storage.createNightlyStats({
                listingId: listing.id,
                date: new Date(),
                adr: guestyData.value.adr?.toString(),
                occupancy: guestyData.value.occupancy?.toString(),
                revpar: guestyData.value.revpar?.toString(),
                bookings: guestyData.value.bookings || 0,
                revenue: guestyData.value.revenue?.toString(),
                source: 'guesty'
              });
            }

            // Process market data (AirDNA)
            if (airDNAData.status === 'fulfilled' && airDNAData.value) {
              await storage.createMarketStats({
                location: listing.location,
                date: new Date(),
                avgAdr: airDNAData.value.avgAdr?.toString(),
                avgOccupancy: airDNAData.value.avgOccupancy?.toString(),
                avgRevpar: airDNAData.value.avgRevpar?.toString(),
                topPercentileRevpar: airDNAData.value.topPercentileRevpar?.toString(),
                source: 'airdna'
              });
            }

            // Process market data (Rabbu)
            if (rabbuData.status === 'fulfilled' && rabbuData.value) {
              await storage.createMarketStats({
                location: listing.location,
                date: new Date(),
                avgAdr: rabbuData.value.avgAdr?.toString(),
                avgOccupancy: rabbuData.value.avgOccupancy?.toString(),
                avgRevpar: rabbuData.value.avgRevpar?.toString(),
                topPercentileRevpar: rabbuData.value.topPercentileRevpar?.toString(),
                source: 'rabbu'
              });
            }
            
          } catch (error) {
            console.error(`❌ Error processing listing ${listing.id}:`, error);
          }
        }));

        // Wait between batches to respect rate limits
        if (i + batchSize < listings.length) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
        }
      }

      // Check for performance alerts after data collection
      await checkPerformanceAlerts();
      
      console.log('✅ Data collection completed successfully');
      
    } catch (error) {
      console.error('❌ Error in scheduled data collection:', error);
    }
  }, {
    timezone: "America/Los_Angeles" // Adjust timezone as needed
  });

  console.log(`✅ Cron jobs initialized. Next run: ${cron.validate(CRON_SCHEDULE) ? 'Valid schedule' : 'Invalid schedule'}`);
}

// Manual trigger for testing
export async function triggerDataCollection() {
  console.log('🧪 Manual data collection triggered...');
  
  try {
    const listings = await storage.getListings();
    
    for (const listing of listings.slice(0, 3)) { // Test with first 3 listings
      try {
        const wheelhouseData = await fetchWheelhouseData(listing);
        
        if (wheelhouseData) {
          await storage.createNightlyStats({
            listingId: listing.id,
            date: new Date(),
            adr: wheelhouseData.adr?.toString(),
            occupancy: wheelhouseData.occupancy?.toString(),
            revpar: wheelhouseData.revpar?.toString(),
            bookings: wheelhouseData.bookings || 0,
            revenue: wheelhouseData.revenue?.toString(),
            source: 'wheelhouse'
          });
        }
        
      } catch (error) {
        console.error(`❌ Error in manual collection for listing ${listing.id}:`, error);
      }
    }
    
    console.log('✅ Manual data collection completed');
    
  } catch (error) {
    console.error('❌ Error in manual data collection:', error);
    throw error;
  }
}
