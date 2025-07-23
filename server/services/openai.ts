import OpenAI from "openai";
import { RM_BRAIN_CONFIG } from "../../src/config/rm-brain";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIRecommendation {
  title: string;
  description: string;
  potentialImpact: number;
  confidence: number;
  recommendationType: 'pricing_optimization' | 'occupancy_strategy' | 'revenue_enhancement' | 'market_positioning';
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
    const prompt = `
You are an expert revenue management AI for short-term rental properties. 

Analyze this property data and provide 2-3 specific, actionable revenue optimization recommendations:

Property: ${listingData.name}
Location: ${listingData.location}
Current Price: $${listingData.currentPrice}

Recent Performance (last ${listingData.recentStats.length} days):
${listingData.recentStats.map((stat, i) => 
  `Day ${i+1}: ADR $${stat.adr}, Occupancy ${stat.occupancy}%, RevPAR $${stat.revpar}`
).join('\n')}

${listingData.marketData ? `
Market Benchmarks:
- Market ADR: $${listingData.marketData.avgAdr}
- Market Occupancy: ${listingData.marketData.avgOccupancy}%
- Market RevPAR: $${listingData.marketData.avgRevpar}
` : ''}

Configuration:
- Weight Cap: ${RM_BRAIN_CONFIG.WEIGHT_CAP_PCT * 100}% vs native Wheelhouse recommendations
- AI Blend Mode: ${RM_BRAIN_CONFIG.AB_MODE}

Please provide recommendations in JSON format with this structure:
{
  "recommendations": [
    {
      "title": "Short, actionable title",
      "description": "Specific implementation details with numbers",
      "potentialImpact": number (estimated monthly revenue impact in dollars),
      "confidence": number (1-100 confidence score),
      "recommendationType": "pricing_optimization" | "occupancy_strategy" | "revenue_enhancement" | "market_positioning"
    }
  ]
}

Focus on:
1. Pricing optimizations based on market position
2. Occupancy strategies for revenue maximization  
3. Revenue enhancement opportunities
4. Market positioning improvements

Keep recommendations within the ${RM_BRAIN_CONFIG.WEIGHT_CAP_PCT * 100}% weight cap constraint.
`;

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
    const recommendations = result.recommendations?.map((rec: any) => ({
      title: rec.title || 'Revenue Optimization',
      description: rec.description || 'Optimize pricing strategy',
      potentialImpact: Math.max(0, Math.min(2000, rec.potentialImpact || 200)),
      confidence: Math.max(50, Math.min(100, rec.confidence || 75)),
      recommendationType: ['pricing_optimization', 'occupancy_strategy', 'revenue_enhancement', 'market_positioning'].includes(rec.recommendationType) 
        ? rec.recommendationType 
        : 'pricing_optimization'
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