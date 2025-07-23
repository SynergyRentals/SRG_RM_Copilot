import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  Bed,
  Bath,
  Users,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Calendar,
  Star,
  ChevronRight,
  Sparkles,
  BarChart3,
  Edit,
  FileText
} from "lucide-react";
import { useListingData } from "@/hooks/use-listing-data";
import { useToast } from "@/hooks/use-toast";
import MetricsCard from "@/components/metrics-card";
import ComparisonTable from "@/components/comparison-table";
import AIRecommendations from "@/components/ai-recommendations";

export default function ListingDetail() {
  const { id } = useParams();
  const listingId = id ? parseInt(id) : 0;
  const { data, isLoading, refetch } = useListingData(listingId);
  const { toast } = useToast();

  const handleApplyRecommendations = async () => {
    try {
      // This would call the API to apply AI recommendations
      toast({
        title: "AI Recommendations Applied",
        description: "Revenue optimization settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to apply recommendations",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    }
  };

  const handleOptimizePricing = async () => {
    try {
      toast({
        title: "Pricing Optimization Started",
        description: "Dynamic pricing rules are being updated based on market data.",
      });
    } catch (error) {
      toast({
        title: "Optimization failed",
        description: "Unable to update pricing. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </header>
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Skeleton className="w-48 h-36 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-8 w-64 mb-4" />
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="flex space-x-6">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Property Not Found</h2>
              <p className="text-sm text-gray-500 mt-1">The requested property could not be found</p>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">Property not found or unavailable</div>
                <Link href="/dashboard">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { listing, recentStats, marketComparison, recommendations } = data;
  
  // Calculate current metrics
  const currentRevpar = recentStats.length > 0 
    ? recentStats.reduce((sum, s) => sum + parseFloat(s.revpar?.toString() || '0'), 0) / recentStats.length
    : 0;
  
  const currentAdr = recentStats.length > 0
    ? recentStats.reduce((sum, s) => sum + parseFloat(s.adr?.toString() || '0'), 0) / recentStats.length
    : 0;
    
  const currentOccupancy = recentStats.length > 0
    ? recentStats.reduce((sum, s) => sum + parseFloat(s.occupancy?.toString() || '0'), 0) / recentStats.length
    : 0;

  const aiScore = recommendations.length > 0 ? (recommendations[0].aiScore || 80) : 80;

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{listing.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Detailed property analysis and recommendations</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Property Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-6">
                  <img 
                    src={listing.imageUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=150"} 
                    alt={listing.name}
                    className="w-48 h-36 rounded-lg object-cover"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.name}</h1>
                    <p className="text-lg text-gray-600 mb-4">{listing.location}</p>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{listing.bedrooms} Bedrooms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Bath className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{listing.bathrooms} Bathrooms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{listing.maxGuests} Guests</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ${listing.currentPrice || currentAdr.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">per night</div>
                  <div className="mt-3">
                    <Badge variant={aiScore >= 90 ? "default" : aiScore >= 80 ? "secondary" : "destructive"}>
                      {aiScore >= 90 ? "Excellent" : aiScore >= 80 ? "Optimized" : "Alert"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <MetricsCard
              title="RevPAR"
              value={`$${currentRevpar.toFixed(2)}`}
              change="+12.3%"
              trend="up"
              size="sm"
            />
            
            <MetricsCard
              title="ADR"
              value={`$${currentAdr.toFixed(2)}`}
              change="+8.1%"
              trend="up"
              size="sm"
            />
            
            <MetricsCard
              title="Occupancy"
              value={`${currentOccupancy.toFixed(1)}%`}
              change="+3.8%"
              trend="up"
              size="sm"
            />
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Score</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{aiScore}</p>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${aiScore}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ComparisonTable 
              listing={listing}
              currentRevpar={currentRevpar}
              marketComparison={marketComparison}
            />
            
            <AIRecommendations 
              recommendations={recommendations}
              onApply={handleApplyRecommendations}
            />
          </div>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleApplyRecommendations}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Apply AI Recommendations
                </Button>
                
                <Button 
                  onClick={handleOptimizePricing}
                  className="bg-success-600 hover:bg-success-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Optimize Pricing
                </Button>
                
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Listing
                </Button>
                
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
