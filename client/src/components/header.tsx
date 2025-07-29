import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Moon, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img 
              src="https://pluskitchen.com.tr/images/logo.png" 
              alt="Plus Kitchen Logo" 
              className="h-8 w-auto"
            />
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900">Dokumanet</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
              <Moon className="h-4 w-4" />
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-gray-500 hover:text-gray-900">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-pk-orange text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName || user?.lastName 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : user?.email?.split('@')[0] || 'User'
                  }
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ''} />
                    <AvatarFallback className="bg-pk-green text-white">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
