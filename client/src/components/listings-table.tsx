import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";

interface ListingData {
  id: number;
  name: string;
  location: string;
  imageUrl?: string;
  revpar: string;
  revparChange: string;
  adr: string;
  occupancy: string;
  aiScore: number;
  status: string;
}

interface ListingsTableProps {
  listings: ListingData[];
}

export default function ListingsTable({ listings }: ListingsTableProps) {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'default';
      case 'optimized':
        return 'secondary';
      case 'alert':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'text-green-800 bg-green-100';
      case 'optimized':
        return 'text-green-800 bg-green-100';
      case 'alert':
        return 'text-orange-800 bg-orange-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">No properties found</p>
          <p className="text-sm">Add your first property to start tracking performance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Property
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              RevPAR
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ADR
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Occupancy
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              AI Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {listings.map((listing) => {
            const isPositiveChange = parseFloat(listing.revparChange) > 0;
            
            return (
              <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage 
                        src={listing.imageUrl || `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=80&h=80&fit=crop`} 
                        alt={listing.name}
                      />
                      <AvatarFallback>{listing.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {listing.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {listing.location}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${listing.revpar}
                  </div>
                  <div className={`text-sm flex items-center ${
                    isPositiveChange ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositiveChange ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {listing.revparChange}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${listing.adr}</div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{listing.occupancy}%</div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 mr-2">
                      {listing.aiScore}
                    </div>
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          listing.aiScore >= 90 ? 'bg-green-500' : 
                          listing.aiScore >= 80 ? 'bg-green-400' : 
                          'bg-orange-500'
                        }`}
                        style={{ width: `${listing.aiScore}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/listing/${listing.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900 mr-3">
                      View
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    Edit
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
