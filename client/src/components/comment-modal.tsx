import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare } from "lucide-react";

interface CommentModalProps {
  file: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentModal({ file, isOpen, onClose }: CommentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  // Fetch comments for this file
  const { data: comments, isLoading } = useQuery({
    queryKey: [`/api/files/${file?.id}/comments`],
    enabled: isOpen && !!file,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest('POST', `/api/files/${file.id}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/files/${file.id}/comments`] });
      setCommentText("");
      toast({
        title: "Success",
        description: "Comment added successfully",
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText);
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comments for {file.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Comment (Admin only) */}
          {user?.role === 'admin' && (
            <div>
              <Textarea
                placeholder="Enter your comment or feedback for the department..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                className="w-full"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  className="bg-pk-green text-white hover:bg-pk-dark-green"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {Array.isArray(comments) && comments?.length > 0 ? 'Comments' : 'No comments yet'}
            </h4>
            
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : Array.isArray(comments) && comments?.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.author?.firstName || comment.author?.lastName 
                          ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim()
                          : comment.author?.email?.split('@')[0] || 'Admin'
                        }
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No comments on this file yet.</p>
                {user?.role === 'admin' && (
                  <p className="text-sm mt-1">Be the first to leave feedback!</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}