
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Camera, Image } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMobile = useIsMobile();

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
    setIsCameraLoading(true);
    setIsCameraReady(false);
    setShowCamera(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("Requesting camera access...");

        // Different constraints for mobile vs desktop
        const constraints = isMobile
          ? {
              video: {
                facingMode: "environment", // Use back camera on mobile
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            }
          : {
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            };

        console.log("Using camera constraints for", isMobile ? "mobile" : "desktop", constraints);

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Camera access granted, stream obtained");

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          // Set up a promise to detect when video can play
          const playPromise = videoRef.current.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Video playback started successfully");
                // Wait a moment to ensure video is actually rendering frames
                setTimeout(() => {
                  setIsCameraReady(true);
                  setIsCameraLoading(false);
                }, 500);
              })
              .catch(playError => {
                console.error("Error playing video:", playError);
                throw new Error("Failed to start video playback");
              });
          }
        } else {
          console.error("Video reference is not available");
          throw new Error("Video element not found");
        }
      } else {
        console.error("getUserMedia is not supported");
        alert("Camera access is not supported by your browser");
        setShowCamera(false);
        setIsCameraLoading(false);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions and try again.");
      // Reset camera state
      stopCamera();
      setIsCameraLoading(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Reset all camera-related states
    setShowCamera(false);
    setIsCameraLoading(false);
    setIsCameraReady(false);

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Handle video element events
  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement && showCamera) {
      const handleLoadedMetadata = () => {
        console.log("Video metadata loaded, dimensions:",
          videoElement.videoWidth, "x", videoElement.videoHeight);
      };

      const handleCanPlay = () => {
        console.log("Video can now play");
        // Set camera as ready when it can play
        setTimeout(() => {
          setIsCameraReady(true);
          setIsCameraLoading(false);
        }, 300);
      };

      const handlePlaying = () => {
        console.log("Video is now playing");
        setIsCameraReady(true);
        setIsCameraLoading(false);
      };

      const handleError = (e: Event) => {
        console.error("Video error:", e);
        setIsCameraLoading(false);
        alert("There was an error with the camera. Please try again.");
        stopCamera();
      };

      // Add event listeners
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('playing', handlePlaying);
      videoElement.addEventListener('error', handleError);

      // Clean up event listeners
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('playing', handlePlaying);
        videoElement.removeEventListener('error', handleError);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCamera]);

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
    try {
      if (!videoRef.current || !streamRef.current) {
        console.error("Video or stream reference is missing");
        alert("Camera is not ready. Please try again.");
        return;
      }

      // Check if video is actually playing and has dimensions
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        console.error("Video dimensions are not available yet");
        alert("Camera stream is not ready. Please wait a moment and try again.");
        return;
      }

      // Create a canvas element to capture the frame
      const canvas = document.createElement('canvas');

      // Set canvas dimensions to match video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error("Could not get canvas context");
        alert("Failed to capture photo. Your browser may not support this feature.");
        return;
      }

      // Draw the video frame to the canvas
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and then to File
      canvas.toBlob((blob) => {
        if (blob) {
          console.log("Photo captured successfully, size:", blob.size);
          const file = new File([blob], `camera-capture-${Date.now()}.png`, { type: 'image/png' });
          onFileChange(file);
          stopCamera();
        } else {
          console.error("Failed to create blob from canvas");
          alert("Failed to process the captured image. Please try again.");
        }
      }, 'image/png', 0.9); // 0.9 quality for better file size
    } catch (error) {
      console.error("Error capturing photo:", error);
      alert("An error occurred while capturing the photo. Please try again.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4">
        {showCamera ? (
          <div className="relative w-full max-w-md">
            <div className="bg-black rounded-md overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded-md ${isCameraLoading ? 'opacity-50' : ''}`}
                style={{ minHeight: '300px' }}
              />

              {/* Camera UI overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-white border-opacity-50 rounded-md">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-white border-opacity-70 rounded-md"></div>
                </div>
              </div>

              {/* Loading overlay */}
              {isCameraLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-white mx-auto mb-2" />
                    <p className="text-white text-sm">Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera status indicator */}
            <div className="absolute top-2 left-2 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isCameraReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span className="text-xs text-white drop-shadow-md">
                {isCameraReady ? 'Camera ready' : 'Preparing camera...'}
              </span>
            </div>

            <div className="flex justify-center mt-4 gap-3">
              <Button
                onClick={capturePhoto}
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white px-6"
                size="lg"
                disabled={!isCameraReady || isCameraLoading}
              >
                <Camera className="mr-2 h-4 w-4" />
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
