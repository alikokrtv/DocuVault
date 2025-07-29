import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Building, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Settings,
  HelpCircle,
  LogOut,
  Upload
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const { user } = useAuth();

  // Fetch pending count for admin
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    enabled: user?.role === 'admin',
  });

  const isAdmin = user?.role === 'admin';

  const navigationItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/",
      active: true,
    },
    ...(isAdmin ? [
      {
        icon: Building,
        label: "Departments",
        href: "#",
        active: false,
      },
      {
        icon: FileText,
        label: "All Files",
        href: "#",
        active: false,
      },
      {
        icon: Clock,
        label: "Pending Approval",
        href: "#",
        active: false,
        badge: stats?.pendingFiles > 0 ? stats.pendingFiles : undefined,
      },
      {
        icon: CheckCircle,
        label: "Approved Files",
        href: "#",
        active: false,
      },
      {
        icon: XCircle,
        label: "Rejected Files",
        href: "#",
        active: false,
      },
    ] : [
      {
        icon: Upload,
        label: "Upload Files",
        href: "#",
        active: false,
      },
      {
        icon: FileText,
        label: "My Files",
        href: "#",
        active: false,
      },
      {
        icon: Clock,
        label: "Pending Review",
        href: "#",
        active: false,
      },
    ]),
  ];

  const supportItems = [
    {
      icon: Settings,
      label: "Settings",
      href: "#",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      href: "#",
    },
    {
      icon: LogOut,
      label: "Logout",
      href: "/api/logout",
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-16">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start ${
                item.active 
                  ? "bg-pk-green hover:bg-pk-dark-green text-white" 
                  : "text-gray-700 hover:bg-pk-light-green hover:text-pk-dark-green"
              }`}
              onClick={() => {
                if (item.href === '/api/logout') {
                  window.location.href = item.href;
                } else if (item.href !== '#') {
                  window.location.href = item.href;
                }
              }}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
              {item.badge && (
                <Badge className="ml-auto bg-pk-orange text-white">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
          
          <div className="pt-4 border-t border-gray-200 space-y-2">
            {supportItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:bg-pk-light-green hover:text-pk-dark-green"
                onClick={() => {
                  if (item.href === '/api/logout') {
                    window.location.href = item.href;
                  } else if (item.href !== '#') {
                    window.location.href = item.href;
                  }
                }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
