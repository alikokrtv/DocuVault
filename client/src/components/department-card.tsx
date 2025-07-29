import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface DepartmentCardProps {
  department: {
    id: number;
    name: string;
    description?: string;
    icon: string;
    color: string;
  };
}

export default function DepartmentCard({ department }: DepartmentCardProps) {
  // Fetch department stats
  const { data: stats } = useQuery({
    queryKey: [`/api/departments/${department.id}/stats`],
  });

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-pk-light-green text-pk-green';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'orange':
        return 'bg-orange-100 text-pk-orange';
      case 'red':
        return 'bg-red-100 text-red-600';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-600';
      case 'gray':
        return 'bg-gray-100 text-gray-600';
      case 'teal':
        return 'bg-teal-100 text-teal-600';
      default:
        return 'bg-pk-light-green text-pk-green';
    }
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-pk-green';
      case 'blue':
        return 'bg-blue-600';
      case 'purple':
        return 'bg-purple-600';
      case 'orange':
        return 'bg-pk-orange';
      case 'red':
        return 'bg-red-600';
      case 'indigo':
        return 'bg-indigo-600';
      case 'gray':
        return 'bg-gray-600';
      case 'teal':
        return 'bg-teal-600';
      default:
        return 'bg-pk-green';
    }
  };

  const storagePercentage = Math.min((stats?.totalSize || 0) / (10 * 1024 * 1024) * 100, 100); // Assume 10MB limit per department

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${getColorClasses(department.color)}`}>
            <i className={`${department.icon} text-xl`}></i>
          </div>
          {stats?.pendingCount > 0 && (
            <Badge className="bg-pk-orange text-white">
              {stats.pendingCount} new
            </Badge>
          )}
        </div>
        
        <h4 className="font-semibold text-gray-900 mb-1">{department.name}</h4>
        <p className="text-sm text-gray-600 mb-4">
          {stats?.fileCount || 0} files • {formatFileSize(stats?.totalSize || 0)}
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full ${getProgressColor(department.color)}`}
            style={{ width: `${storagePercentage}%` }}
          ></div>
        </div>
        
        <p className="text-xs text-gray-500">
          Storage: {storagePercentage.toFixed(0)}% used
        </p>
      </CardContent>
    </Card>
  );
}
