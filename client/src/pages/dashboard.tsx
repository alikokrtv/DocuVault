import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import DepartmentCard from "@/components/department-card";
import FileTable from "@/components/file-table";
import { Search, FileText, Clock, Building, HardDrive } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedFileType, setSelectedFileType] = useState<string>("");

  // Fetch stats
  const { data: stats } = useQuery<{
    totalFiles: number;
    pendingFiles: number;
    approvedFiles: number;
    rejectedFiles: number;
    totalSize: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: user?.role === 'admin',
  });

  // Fetch departments
  const { data: departments } = useQuery<any[]>({
    queryKey: ["/api/departments"],
  });

  // Fetch files with filters
  const { data: files, isLoading } = useQuery({
    queryKey: ["/api/files", selectedDepartment, selectedStatus, selectedFileType, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('departmentId', selectedDepartment);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedFileType) params.append('category', selectedFileType);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/files?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      return response.json();
    },
  });

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
              <p className="text-gray-600 mt-1">Manage documents and files across all departments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Files</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalFiles || 0}</p>
                    </div>
                    <div className="p-3 bg-pk-light-green rounded-lg">
                      <FileText className="h-6 w-6 text-pk-green" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-pk-green font-medium">
                      {stats?.totalSize ? formatFileSize(stats.totalSize) : '0 KB'}
                    </span>
                    <span className="text-gray-600 ml-1">total storage</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.pendingFiles || 0}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="h-6 w-6 text-pk-orange" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-pk-orange font-medium">
                      {stats?.pendingFiles > 0 ? 'Need attention' : 'All caught up'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Departments</p>
                      <p className="text-3xl font-bold text-gray-900">{departments?.length || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-blue-600 font-medium">All active</span>
                    <span className="text-gray-600 ml-1">this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved Files</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.approvedFiles || 0}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <HardDrive className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium">
                      {((stats?.approvedFiles || 0) / Math.max(stats?.totalFiles || 1, 1) * 100).toFixed(0)}%
                    </span>
                    <span className="text-gray-600 ml-1">approval rate</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search files, departments, or keywords..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Departments</SelectItem>
                        {departments?.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="document">Documents</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Cards */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {departments?.map((department: any) => (
                  <DepartmentCard key={department.id} department={department} />
                ))}
              </div>
            </div>

            {/* Recent Files Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Files</CardTitle>
              </CardHeader>
              <CardContent>
                <FileTable files={files || []} isLoading={isLoading} isAdmin={true} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
