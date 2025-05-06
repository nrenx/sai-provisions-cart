
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Camera, Image } from 'lucide-react';

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
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Start camera stream
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setShowCamera(true);
        }
      } else {
        console.error("getUserMedia is not supported");
        alert("Camera access is not supported by your browser");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions and try again.");
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && streamRef.current) {
      // Create a canvas element to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw the video frame to the canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob and then to File
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-capture-${Date.now()}.png`, { type: 'image/png' });
            onFileChange(file);
            stopCamera();
          }
        }, 'image/png');
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4">
        {showCamera ? (
          <div className="relative w-full max-w-md">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              className="w-full rounded-md border"
            />
            <div className="flex justify-center mt-2 gap-2">
              <Button 
                onClick={capturePhoto}
                type="button"
              >
                Capture Photo
              </Button>
              <Button 
                variant="outline" 
                onClick={stopCamera}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : imagePreview ? (
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
          <>
            <div className="flex justify-center gap-2 w-full mb-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={startCamera}
                className="flex gap-2"
              >
                <Camera className="h-4 w-4" />
                Use Camera
              </Button>
              <Button
                variant="outline"
                type="button"
                className="flex gap-2"
                {...getRootProps()}
              >
                <Image className="h-4 w-4" />
                Select File
                <input {...getInputProps()} />
              </Button>
            </div>
            
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-md p-6 w-full cursor-pointer text-center transition-colors ${
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
                    : "Drag & drop an image here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or WebP (max 5MB)
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
