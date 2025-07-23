import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Building, 
  LineChart, 
  Bot, 
  Settings, 
  User,
  TrendingUp 
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Listings', href: '/listings', icon: Building },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'AI Recommendations', href: '/ai-recommendations', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Synergy RM</h1>
            <p className="text-sm text-gray-500">Copilot Builder</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href === '/dashboard' && location === '/');
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                    isActive 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">John Manager</p>
            <p className="text-xs text-gray-500">Revenue Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
