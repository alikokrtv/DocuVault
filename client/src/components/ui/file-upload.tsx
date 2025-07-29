import { useCallback, useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (files: FileList) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.mp4', '.docx', '.xlsx'],
  maxFileSize = 50 * 1024 * 1024, // 50MB
  multiple = false,
  disabled = false,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [disabled]);

  const handleFiles = (files: FileList) => {
    setSelectedFiles(files);
    onFileSelect(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const clearFiles = () => {
    setSelectedFiles(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-pk-green bg-pk-light-green/20" : "border-gray-300",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-pk-green cursor-pointer"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedFileTypes.join(',')}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <Upload className={cn(
            "mx-auto h-12 w-12 mb-4",
            dragActive ? "text-pk-green" : "text-gray-400"
          )} />
          
          <div className="text-sm text-gray-600">
            <span className="font-medium text-pk-green">Click to upload</span> or drag and drop
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            {acceptedFileTypes.join(', ')} up to {formatFileSize(maxFileSize)}
          </p>
        </div>
      </div>
      
      {selectedFiles && (
        <div className="mt-4 space-y-2">
          {Array.from(selectedFiles).map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={clearFiles}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}