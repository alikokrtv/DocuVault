import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import FileTable from "@/components/file-table";
import UploadModal from "@/components/upload-modal";
import { FileText, Clock, CheckCircle, XCircle, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

export default function DepartmentDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  // Fetch user's files
  const { data: files = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ["/api/files"],
    enabled: !!user,
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  // Calculate stats from files
  const stats = files ? {
    totalFiles: files.length,
    pendingFiles: files.filter((f: any) => f.status === 'pending').length,
    approvedFiles: files.filter((f: any) => f.status === 'approved').length,
    rejectedFiles: files.filter((f: any) => f.status === 'rejected').length,
    totalSize: files.reduce((sum: number, f: any) => sum + f.size, 0),
  } : {
    totalFiles: 0,
    pendingFiles: 0,
    approvedFiles: 0,
    rejectedFiles: 0,
    totalSize: 0,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pk-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
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
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
                <p className="text-gray-600 mt-1">
                  Department: {user?.departmentName || 'Not assigned'}
                </p>
              </div>
              <Button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-pk-green hover:bg-pk-dark-green text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">My Files</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalFiles}</p>
                    </div>
                    <div className="p-3 bg-pk-light-green rounded-lg">
                      <FileText className="h-6 w-6 text-pk-green" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-pk-green font-medium">
                      {formatFileSize(stats.totalSize)}
                    </span>
                    <span className="text-gray-600 ml-1">total size</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Review</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.pendingFiles}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="h-6 w-6 text-pk-orange" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-pk-orange font-medium">
                      {stats.pendingFiles > 0 ? 'Awaiting approval' : 'All reviewed'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.approvedFiles}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium">
                      {stats.totalFiles > 0 ? `${(stats.approvedFiles / stats.totalFiles * 100).toFixed(0)}%` : '0%'}
                    </span>
                    <span className="text-gray-600 ml-1">approval rate</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.rejectedFiles}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-red-600 font-medium">
                      {stats.rejectedFiles > 0 ? 'Need revision' : 'None rejected'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Files Table */}
            <Card>
              <CardHeader>
                <CardTitle>My Files</CardTitle>
              </CardHeader>
              <CardContent>
                <FileTable 
                  files={files || []} 
                  isLoading={isLoading} 
                  isAdmin={false}
                  onFileUpdate={() => refetch()}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          refetch();
          setIsUploadModalOpen(false);
        }}
      />
    </div>
  );
}
