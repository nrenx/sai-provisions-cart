
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  imagePreview: string | null;
  onFileChange: (file: File | null) => void;
  uploading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  imagePreview, 
  onFileChange,
  uploading
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });
  
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4">
        {imagePreview ? (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Product preview" 
              className="w-32 h-32 object-cover rounded-md border"
            />
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemoveImage}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-md p-8 w-full cursor-pointer text-center transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "Drop the image here"
                  : "Drag & drop an image here, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG or WebP (max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
