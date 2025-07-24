import OpenAI from "openai";
import { RM_BRAIN_CONFIG } from "../../src/config/rm-brain";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper function to determine current season
function getSeason(date: Date): string {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}

// Helper function to analyze occupancy trend
function getOccupancyTrend(stats: { occupancy: string }[]): string {
  if (stats.length < 2) return 'Insufficient data';
  
  const occupancies = stats.map(s => parseFloat(s.occupancy));
  const firstHalf = occupancies.slice(0, Math.floor(occupancies.length / 2));
  const secondHalf = occupancies.slice(Math.floor(occupancies.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 5) return `Improving (+${change.toFixed(1)}%)`;
  if (change < -5) return `Declining (${change.toFixed(1)}%)`;
  return 'Stable';
}

export interface AIRecommendation {
  title: string;
  description: string;
  potentialImpact: number;
  confidence: number;
  recommendationType: 'pricing_optimization' | 'occupancy_strategy' | 'revenue_enhancement' | 'market_positioning' | 'seasonal_strategy' | 'competitive_intelligence' | 'event_based_pricing';
  timeframe?: 'immediate' | 'short_term' | 'long_term'; // When to implement
  priority?: 'high' | 'medium' | 'low'; // Urgency level
}

export async function generateAIRecommendations(listingData: {
  id: number;
  name: string;
  location: string;
  currentPrice: string;
  recentStats: {
    adr: string;
    occupancy: string;
    revpar: string;
  }[];
  marketData?: {
    avgAdr: string;
    avgOccupancy: string;
    avgRevpar: string;
  };
}): Promise<AIRecommendation[]> {
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️ OpenAI API key not configured - generating fallback recommendations');
    return generateFallbackRecommendations(listingData);
  }

  try {
    // Calculate performance trends
    const avgOccupancy = listingData.recentStats.length > 0 
      ? listingData.recentStats.reduce((sum, stat) => sum + parseFloat(stat.occupancy), 0) / listingData.recentStats.length
      : 0;
    
    const avgRevpar = listingData.recentStats.length > 0
      ? listingData.recentStats.reduce((sum, stat) => sum + parseFloat(stat.revpar), 0) / listingData.recentStats.length
      : 0;

    // Get current month and season for seasonal recommendations
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentSeason = getSeason(new Date());

    const prompt = `
You are an expert revenue management AI for short-term rental properties with deep knowledge of pricing strategy, market dynamics, and seasonal optimization.

Analyze this property data comprehensively and provide 3-4 specific, actionable revenue optimization recommendations:

PROPERTY DETAILS:
- Name: ${listingData.name}
- Location: ${listingData.location}
- Current Base Price: $${listingData.currentPrice}/night
- Current Month: ${currentMonth} (${currentSeason} season)

RECENT PERFORMANCE (last ${listingData.recentStats.length} days):
${listingData.recentStats.map((stat, i) => 
  `Day ${i+1}: ADR $${stat.adr}, Occupancy ${stat.occupancy}%, RevPAR $${stat.revpar}`
).join('\n')}

PERFORMANCE SUMMARY:
- Average Occupancy: ${avgOccupancy.toFixed(1)}%
- Average RevPAR: $${avgRevpar.toFixed(2)}
- Occupancy Trend: ${getOccupancyTrend(listingData.recentStats)}

${listingData.marketData ? `
MARKET BENCHMARKS:
- Market ADR: $${listingData.marketData.avgAdr} (You: ${((parseFloat(listingData.currentPrice) / parseFloat(listingData.marketData.avgAdr) - 1) * 100).toFixed(1)}% difference)
- Market Occupancy: ${listingData.marketData.avgOccupancy}% (You: ${(avgOccupancy - parseFloat(listingData.marketData.avgOccupancy)).toFixed(1)}% difference)
- Market RevPAR: $${listingData.marketData.avgRevpar} (You: ${((avgRevpar / parseFloat(listingData.marketData.avgRevpar) - 1) * 100).toFixed(1)}% difference)
` : ''}

CONSTRAINTS:
- Weight Cap: ±${RM_BRAIN_CONFIG.WEIGHT_CAP_PCT * 100}% vs native recommendations
- Confidence Threshold: ${RM_BRAIN_CONFIG.AI.CONFIDENCE_THRESHOLD * 100}% for auto-apply

Please provide recommendations in JSON format:
{
  "recommendations": [
    {
      "title": "Short, actionable title (max 50 chars)",
      "description": "Detailed implementation steps with specific numbers and dates",
      "potentialImpact": number (estimated monthly revenue impact in dollars),
      "confidence": number (50-100 based on data quality and market conditions),
      "recommendationType": "pricing_optimization" | "occupancy_strategy" | "revenue_enhancement" | "market_positioning" | "seasonal_strategy" | "competitive_intelligence" | "event_based_pricing",
      "timeframe": "immediate" | "short_term" | "long_term",
      "priority": "high" | "medium" | "low"
    }
  ]
}

RECOMMENDATION FOCUS AREAS:
1. PRICING OPTIMIZATION: Dynamic pricing adjustments based on demand patterns
2. OCCUPANCY STRATEGY: Minimum stay, booking window, and availability management
3. SEASONAL STRATEGY: ${currentSeason} season-specific optimizations
4. COMPETITIVE INTELLIGENCE: Position vs similar properties in the market
5. EVENT-BASED PRICING: Local events or holidays in the next 30-60 days
6. REVENUE ENHANCEMENT: Ancillary revenue opportunities and rate optimization

Consider:
- Day-of-week pricing patterns (weekday vs weekend)
- Seasonal demand shifts for ${currentSeason}
- Lead time pricing (last-minute vs advance bookings)
- Length-of-stay discounts or premiums
- Market saturation and competitive positioning

Ensure all rate recommendations stay within the ±${RM_BRAIN_CONFIG.WEIGHT_CAP_PCT * 100}% weight cap.
Be specific with numbers, dates, and implementation steps.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert revenue management AI for vacation rentals. Provide specific, actionable recommendations with quantified impacts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    
    // Validate and format recommendations
    const validTypes = ['pricing_optimization', 'occupancy_strategy', 'revenue_enhancement', 'market_positioning', 'seasonal_strategy', 'competitive_intelligence', 'event_based_pricing'];
    const validTimeframes = ['immediate', 'short_term', 'long_term'];
    const validPriorities = ['high', 'medium', 'low'];
    
    const recommendations = result.recommendations?.map((rec: any) => ({
      title: rec.title || 'Revenue Optimization',
      description: rec.description || 'Optimize pricing strategy',
      potentialImpact: Math.max(0, Math.min(5000, rec.potentialImpact || 200)),
      confidence: Math.max(50, Math.min(100, rec.confidence || 75)),
      recommendationType: validTypes.includes(rec.recommendationType) 
        ? rec.recommendationType 
        : 'pricing_optimization',
      timeframe: validTimeframes.includes(rec.timeframe) ? rec.timeframe : 'short_term',
      priority: validPriorities.includes(rec.priority) ? rec.priority : 'medium'
    })) || [];

    console.log(`🤖 Generated ${recommendations.length} AI recommendations for ${listingData.name}`);
    return recommendations;

  } catch (error) {
    console.error('OpenAI API error:', error);
    console.log('⚠️ Falling back to rule-based recommendations');
    return generateFallbackRecommendations(listingData);
  }
}

function generateFallbackRecommendations(listingData: any): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  
  const currentPrice = parseFloat(listingData.currentPrice);
  const avgOccupancy = listingData.recentStats.length > 0 
    ? listingData.recentStats.reduce((sum: number, stat: any) => sum + parseFloat(stat.occupancy), 0) / listingData.recentStats.length
    : 70;

  // Rule-based recommendation logic
  if (avgOccupancy > 85) {
    recommendations.push({
      title: 'Increase Weekend Rates',
      description: `High occupancy (${avgOccupancy.toFixed(1)}%) suggests pricing power. Consider increasing Friday-Sunday rates by 8-12% within the ${RM_BRAIN_CONFIG.WEIGHT_CAP_PCT * 100}% weight cap.`,
      potentialImpact: Math.floor(currentPrice * 0.1 * 8), // ~10% impact on 8 days/month
      confidence: 82,
      recommendationType: 'pricing_optimization'
    });
  }
  
  if (avgOccupancy < 65) {
    recommendations.push({
      title: 'Optimize Minimum Stay',
      description: `Lower occupancy (${avgOccupancy.toFixed(1)}%) indicates rate resistance. Reduce minimum stay requirements and consider 5-8% rate adjustment for weekdays.`,
      potentialImpact: Math.floor(currentPrice * 0.15 * 6), // More bookings at slightly lower rate
      confidence: 78,
      recommendationType: 'occupancy_strategy'
    });
  }

  // Market positioning recommendation
  if (listingData.marketData) {
    const marketAdr = parseFloat(listingData.marketData.avgAdr);
    const pricingPosition = currentPrice / marketAdr;
    
    if (pricingPosition > 1.15) {
      recommendations.push({
        title: 'Market Position Analysis',
        description: `Currently priced ${((pricingPosition - 1) * 100).toFixed(1)}% above market average. Consider value-add amenities or strategic rate adjustment.`,
        potentialImpact: Math.floor(currentPrice * 0.08 * 10),
        confidence: 75,
        recommendationType: 'market_positioning'
      });
    }
  }

  // Always provide at least one recommendation
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Revenue Optimization Review',
      description: 'Monitor performance trends and consider seasonal pricing adjustments based on demand patterns.',
      potentialImpact: Math.floor(currentPrice * 0.06 * 5),
      confidence: 70,
      recommendationType: 'revenue_enhancement'
    });
  }

  return recommendations.slice(0, 3); // Limit to 3 recommendations
}