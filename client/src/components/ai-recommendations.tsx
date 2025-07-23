import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Calendar, Star, DollarSign } from "lucide-react";
import type { AiRecs } from "@shared/schema";

interface AIRecommendationsProps {
  recommendations: AiRecs[];
  onApply: () => void;
}

export default function AIRecommendations({ recommendations, onApply }: AIRecommendationsProps) {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'pricing_optimization':
        return DollarSign;
      case 'occupancy_strategy':
        return Calendar;
      case 'amenity_optimization':
        return Star;
      default:
        return Lightbulb;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'pricing_optimization':
        return 'border-blue-500 bg-blue-50';
      case 'occupancy_strategy':
        return 'border-orange-500 bg-orange-50';
      case 'amenity_optimization':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-primary-500 bg-primary-50';
    }
  };

  const getPriorityColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-100 text-gray-800';
    
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 80) return 'bg-blue-100 text-blue-800';
    if (confidence >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Sample recommendations if none provided
  const displayRecommendations = recommendations.length > 0 ? recommendations : [
    {
      id: 1,
      listingId: 1,
      recommendationType: 'pricing_optimization',
      recommendation: {
        title: 'Optimize Weekend Pricing',
        description: 'Increase rates by 8% for Friday-Sunday to match demand patterns',
        potentialImpact: 312
      },
      confidence: 85,
      potentialImpact: 312,
      status: 'pending',
      aiScore: 92,
      createdAt: new Date()
    },
    {
      id: 2,
      listingId: 1,
      recommendationType: 'occupancy_strategy',
      recommendation: {
        title: 'Adjust Minimum Stay',
        description: 'Reduce minimum stay to 2 nights during off-peak periods',
        potentialImpact: 185
      },
      confidence: 78,
      potentialImpact: 185,
      status: 'pending',
      aiScore: 88,
      createdAt: new Date()
    },
    {
      id: 3,
      listingId: 1,
      recommendationType: 'amenity_optimization',
      recommendation: {
        title: 'Amenity Optimization',
        description: 'Highlight kitchen amenities in listing - 23% booking increase observed',
        potentialImpact: 0
      },
      confidence: 92,
      potentialImpact: 0,
      status: 'pending',
      aiScore: 95,
      createdAt: new Date()
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayRecommendations.slice(0, 3).map((rec) => {
            const recData = typeof rec.recommendation === 'object' ? rec.recommendation : {};
            const IconComponent = getRecommendationIcon(rec.recommendationType);
            const borderColor = getRecommendationColor(rec.recommendationType);
            
            return (
              <div 
                key={rec.id} 
                className={`p-4 rounded-lg border-l-4 ${borderColor}`}
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className={`mt-1 h-5 w-5 ${
                    rec.recommendationType === 'pricing_optimization' ? 'text-blue-600' :
                    rec.recommendationType === 'occupancy_strategy' ? 'text-orange-600' :
                    rec.recommendationType === 'amenity_optimization' ? 'text-green-600' :
                    'text-primary-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {recData.title || 'AI Recommendation'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {recData.description || 'Detailed recommendation description'}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`ml-2 ${getPriorityColor(rec.confidence)}`}
                      >
                        {rec.confidence}% confidence
                      </Badge>
                    </div>
                    
                    {rec.potentialImpact && rec.potentialImpact > 0 && (
                      <p className="text-xs font-medium mt-2 text-green-600">
                        Potential Revenue: +${rec.potentialImpact}/month
                      </p>
                    )}
                    
                    {rec.recommendationType === 'amenity_optimization' && (
                      <p className="text-xs font-medium mt-2 text-green-600">
                        Implementation: Update listing
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {displayRecommendations.length > 3 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Recommendations ({displayRecommendations.length})
            </Button>
          </div>
        )}
        
        {displayRecommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button onClick={onApply} className="w-full">
              Apply All Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
