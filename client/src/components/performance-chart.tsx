import { BarChart3 } from "lucide-react";

export default function PerformanceChart() {
  // In a real implementation, this would use a charting library like Recharts or Chart.js
  // For now, we'll show a placeholder that matches the design
  
  return (
    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
        <p className="text-sm font-medium">Revenue Trend Chart</p>
        <p className="text-xs">Chart integration in progress</p>
        <p className="text-xs mt-2 text-gray-400">
          Will display 30-day revenue trends with real data
        </p>
      </div>
    </div>
  );
}
