import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Download, Check, X, Share, MessageSquare, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import FilePreviewModal from "./file-preview-modal";
import CommentModal from "./comment-modal";

interface FileTableProps {
  files: any[];
  isLoading: boolean;
  isAdmin: boolean;
  onFileUpdate?: () => void;
}

export default function FileTable({ files, isLoading, isAdmin, onFileUpdate }: FileTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ fileId, status }: { fileId: number; status: string }) => {
      await apiRequest('PATCH', `/api/files/${fileId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      if (onFileUpdate) onFileUpdate();
      toast({
        title: "Success",
        description: "File status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await apiRequest('DELETE', `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      if (onFileUpdate) onFileUpdate();
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'fas fa-file-pdf text-red-600';
    if (mimeType.includes('word')) return 'fas fa-file-word text-blue-600';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'fas fa-file-excel text-green-600';
    if (mimeType.includes('image')) return 'fas fa-image text-purple-600';
    if (mimeType.includes('video')) return 'fas fa-video text-orange-600';
    return 'fas fa-file text-gray-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Check className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePreview = (file: any) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  const handleComment = (file: any) => {
    setSelectedFile(file);
    setIsCommentOpen(true);
  };

  const handleDownload = (file: any) => {
    window.open(`/uploads/${file.storedFilename}`, '_blank');
  };

  const handleShare = (file: any) => {
    const url = `${window.location.origin}/uploads/${file.storedFilename}`;
    
    // Email share
    const emailSubject = `File Shared: ${file.title}`;
    const emailBody = `Hi,\n\nI'm sharing a file with you: ${file.title}\n\nDescription: ${file.description || 'No description'}\n\nDownload: ${url}\n\nBest regards`;
    window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  };

  const handleWhatsAppShare = (file: any) => {
    const url = `${window.location.origin}/uploads/${file.storedFilename}`;
    const message = `File Shared: ${file.title}\n\n${file.description || 'No description'}\n\nDownload: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4 p-4">
            <div className="rounded-lg bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <i className="fas fa-folder-open text-6xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
        <p className="text-gray-600">Upload your first file to get started.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File</TableHead>
            {isAdmin && <TableHead>Department</TableHead>}
            <TableHead>Upload Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  {file.mimeType.includes('image') ? (
                    <img
                      src={`/uploads/${file.storedFilename}`}
                      alt={file.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <i className={getFileIcon(file.mimeType)}></i>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{file.title}</div>
                    <div className="text-sm text-gray-500">{file.description || 'No description'}</div>
                  </div>
                </div>
              </TableCell>
              
              {isAdmin && (
                <TableCell>
                  <Badge variant="outline">{file.department?.name || 'Unknown'}</Badge>
                </TableCell>
              )}
              
              <TableCell className="text-sm text-gray-900">
                {formatDate(file.createdAt)}
              </TableCell>
              
              <TableCell>
                {getStatusBadge(file.status)}
              </TableCell>
              
              <TableCell className="text-sm text-gray-900">
                {formatFileSize(file.size)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(file)}
                    className="text-pk-green hover:text-pk-dark-green"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {isAdmin && (
                    <>
                      {file.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ fileId: file.id, status: 'approved' })}
                            className="text-pk-green hover:text-pk-dark-green"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ fileId: file.id, status: 'rejected' })}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleComment(file)}
                        className="text-pk-orange hover:text-orange-600"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(file)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {!isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFileMutation.mutate(file.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedFile && (
        <>
          <FilePreviewModal
            file={selectedFile}
            isOpen={isPreviewOpen}
            onClose={() => {
              setIsPreviewOpen(false);
              setSelectedFile(null);
            }}
            onShare={handleShare}
            onWhatsAppShare={handleWhatsAppShare}
            isAdmin={isAdmin}
            onStatusUpdate={(status) => {
              updateStatusMutation.mutate({ fileId: selectedFile.id, status });
              setIsPreviewOpen(false);
            }}
          />

          <CommentModal
            file={selectedFile}
            isOpen={isCommentOpen}
            onClose={() => {
              setIsCommentOpen(false);
              setSelectedFile(null);
            }}
          />
        </>
      )}
    </>
  );
}
