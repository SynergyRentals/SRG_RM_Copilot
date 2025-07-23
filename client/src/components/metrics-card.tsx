import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon?: LucideIcon;
  description?: string;
  size?: "sm" | "default";
}

export default function MetricsCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  description,
  size = "default" 
}: MetricsCardProps) {
  const isPositive = trend === "up";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardContent className={cn("p-6", size === "sm" && "p-4")}>
        <div className="flex items-center justify-between">
          <div>
            <p className={cn(
              "font-medium text-gray-600",
              size === "sm" ? "text-xs" : "text-sm"
            )}>
              {title}
            </p>
            <p className={cn(
              "font-bold text-gray-900 mt-1",
              size === "sm" ? "text-xl" : "text-3xl"
            )}>
              {value}
            </p>
            {change && (
              <div className="flex items-center mt-2">
                <TrendIcon className={cn(
                  "mr-1",
                  size === "sm" ? "h-3 w-3" : "h-4 w-4",
                  isPositive ? "text-green-500" : "text-red-500"
                )} />
                <span className={cn(
                  "font-medium",
                  size === "sm" ? "text-xs" : "text-sm",
                  isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {change}
                </span>
                {description && (
                  <span className={cn(
                    "text-gray-500 ml-1",
                    size === "sm" ? "text-xs" : "text-sm"
                  )}>
                    {description}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "rounded-lg flex items-center justify-center",
              size === "sm" ? "w-10 h-10" : "w-12 h-12",
              isPositive ? "bg-green-50" : "bg-primary-50"
            )}>
              <Icon className={cn(
                size === "sm" ? "h-5 w-5" : "h-6 w-6",
                isPositive ? "text-green-600" : "text-primary-600"
              )} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
