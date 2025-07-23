import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Listing, MarketStats } from "@shared/schema";

interface ComparisonTableProps {
  listing: Listing;
  currentRevpar: number;
  marketComparison: MarketStats[];
}

export default function ComparisonTable({ 
  listing, 
  currentRevpar, 
  marketComparison 
}: ComparisonTableProps) {
  
  const marketAvgRevpar = marketComparison.length > 0
    ? marketComparison.reduce((sum, m) => sum + parseFloat(m.avgRevpar?.toString() || '0'), 0) / marketComparison.length
    : 0;
    
  const topPercentileRevpar = marketComparison.length > 0
    ? Math.max(...marketComparison.map(m => parseFloat(m.topPercentileRevpar?.toString() || '0')))
    : 0;

  const comparisonData = [
    {
      title: "Your Property",
      subtitle: "Current Performance",
      value: currentRevpar,
      bgColor: "bg-gray-50"
    },
    {
      title: "Market Average",
      subtitle: "Similar Properties",
      value: marketAvgRevpar,
      bgColor: "bg-primary-50"
    },
    {
      title: "Top Performers",
      subtitle: "95th Percentile",
      value: topPercentileRevpar,
      bgColor: "bg-green-50"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Market Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comparisonData.map((item, index) => (
            <div key={index} className={`flex items-center justify-between p-4 ${item.bgColor} rounded-lg`}>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  ${item.value > 0 ? item.value.toFixed(2) : '0.00'}
                </p>
                <p className="text-xs text-gray-500">RevPAR</p>
              </div>
            </div>
          ))}
        </div>
        
        {currentRevpar > 0 && marketAvgRevpar > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Performance:</span>{' '}
              {currentRevpar > marketAvgRevpar ? (
                <span className="text-green-700">
                  +{(((currentRevpar - marketAvgRevpar) / marketAvgRevpar) * 100).toFixed(1)}% above market
                </span>
              ) : (
                <span className="text-red-700">
                  {(((currentRevpar - marketAvgRevpar) / marketAvgRevpar) * 100).toFixed(1)}% below market
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
