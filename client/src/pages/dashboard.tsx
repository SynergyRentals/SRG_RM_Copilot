import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Percent,
  RefreshCw,
  Bell,
  Download,
  ChevronRight
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import MetricsCard from "@/components/metrics-card";
import ListingsTable from "@/components/listings-table";
import PerformanceChart from "@/components/performance-chart";

export default function Dashboard() {
  const { data, isLoading, refetch } = useDashboardData();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Data refreshed",
        description: "Dashboard data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your data export is being prepared and will download shortly.",
    });
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Portfolio Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1">Real-time revenue management insights</p>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-500 mb-4">Unable to load dashboard data. This could be due to:</p>
                <ul className="text-sm text-gray-500 text-left max-w-md mx-auto mb-6">
                  <li>• No listings have been added yet</li>
                  <li>• Data collection is still in progress</li>
                  <li>• API connections need to be configured</li>
                </ul>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { portfolioStats, listings } = data;

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Portfolio Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time revenue management insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {/* Alert indicator */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            
            <Button onClick={handleRefresh} className="bg-primary-600 hover:bg-primary-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricsCard
            title="Portfolio RevPAR"
            value={`$${portfolioStats.avgRevpar.toFixed(2)}`}
            change="+8.3%"
            trend="up"
            icon={DollarSign}
            description="vs last month"
          />
          
          <MetricsCard
            title="Average ADR" 
            value={`$${portfolioStats.avgAdr.toFixed(2)}`}
            change="+4.7%"
            trend="up"
            icon={BarChart3}
            description="vs last month"
          />
          
          <MetricsCard
            title="Occupancy Rate"
            value={`${portfolioStats.avgOccupancy.toFixed(1)}%`}
            change="-2.1%"
            trend="down"
            icon={Percent}
            description="vs last month"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Revenue Trend (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Market Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Market Comparison Chart</p>
                  <p className="text-xs">Chart integration in progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Property Performance</CardTitle>
              <div className="flex items-center space-x-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="top">Top Performers</SelectItem>
                    <SelectItem value="under">Underperforming</SelectItem>
                    <SelectItem value="new">New Listings</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ListingsTable listings={listings} />
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{listings.length}</span> of <span className="font-medium">{listings.length}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button size="sm" className="bg-primary-600 text-white">1</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
