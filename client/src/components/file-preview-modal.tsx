import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Check, X, Mail, MessageCircle } from "lucide-react";

interface FilePreviewModalProps {
  file: any;
  isOpen: boolean;
  onClose: () => void;
  onShare: (file: any) => void;
  onWhatsAppShare: (file: any) => void;
  isAdmin: boolean;
  onStatusUpdate: (status: string) => void;
}

export default function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onShare,
  onWhatsAppShare,
  isAdmin,
  onStatusUpdate,
}: FilePreviewModalProps) {
  const renderPreview = () => {
    if (!file) return null;

    if (file.mimeType.includes('image')) {
      return (
        <img
          src={`/uploads/${file.storedFilename}`}
          alt={file.title}
          className="max-w-full max-h-[60vh] object-contain mx-auto"
        />
      );
    }

    if (file.mimeType.includes('video')) {
      return (
        <video
          src={`/uploads/${file.storedFilename}`}
          controls
          className="max-w-full max-h-[60vh] mx-auto"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (file.mimeType.includes('pdf')) {
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <i className="fas fa-file-pdf text-red-600 text-6xl mb-4"></i>
          <p className="text-gray-600 mb-4">PDF Preview</p>
          <p className="text-sm text-gray-500">Click download to view the full PDF</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <i className="fas fa-file text-gray-600 text-6xl mb-4"></i>
        <p className="text-gray-600 mb-4">File Preview</p>
        <p className="text-sm text-gray-500">Preview not available for this file type</p>
      </div>
    );
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{file.title}</h3>
              <p className="text-sm text-gray-600">{file.description || 'No description'}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {renderPreview()}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-3">
            {isAdmin && file.status === 'pending' && (
              <>
                <Button
                  onClick={() => onStatusUpdate('approved')}
                  className="bg-pk-green text-white hover:bg-pk-dark-green"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                
                <Button
                  onClick={() => onStatusUpdate('rejected')}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            
            <Button
              onClick={() => window.open(`/uploads/${file.storedFilename}`, '_blank')}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          
          {isAdmin && (
            <div className="flex space-x-2">
              <Button
                onClick={() => onShare(file)}
                className="bg-pk-orange text-white hover:bg-pk-orange-dark"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              
              <Button
                onClick={() => onWhatsAppShare(file)}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}