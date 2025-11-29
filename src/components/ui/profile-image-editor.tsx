"use client";

import * as React from "react";
import { useState, useCallback, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Upload,
  Camera,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";
import { getCroppedImg, type ImageTransform } from "@/lib/image-processing";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileImageEditorProps {
  currentImageUrl?: string | null;
  onImageUpdate: (imageUrl: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ProfileImageEditor({
  currentImageUrl,
  onImageUpdate,
  trigger,
}: ProfileImageEditorProps) {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setFlipHorizontal(false);
        setFlipVertical(false);
        setGrayscale(false);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog closes
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlipHorizontal(false);
      setFlipVertical(false);
      setGrayscale(false);
    } else if (currentImageUrl && !imageSrc) {
      // Load current image when opening
      setImageSrc(currentImageUrl);
    }
  };

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error("Please select an image first");
      return;
    }

    setIsProcessing(true);
    try {
      // croppedAreaPixels from react-easy-crop is already in pixel coordinates
      // and accounts for rotation internally
      const pixelCrop = {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      };

      const transform: ImageTransform = {
        rotation, // Note: rotation is handled by react-easy-crop, but we keep it for reference
        flipHorizontal,
        flipVertical,
        grayscale,
      };

      const blob = await getCroppedImg(imageSrc, pixelCrop, transform);

      // Upload to server
      setIsProcessing(false);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", blob, "profile-image.jpg");

      const response = await fetch("/api/user/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await response.json();
      
      // Update user image
      await onImageUpdate(data.fileUrl);
      
      toast.success("Profile image updated successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process image");
    } finally {
      setIsProcessing(false);
      setIsUploading(false);
    }
  };

  const rotate90 = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const rotate90CCW = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const displayImage = imageSrc || currentImageUrl;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={displayImage || undefined} alt="Profile" />
              <AvatarFallback>
                <ImageIcon className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <Button type="button" variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile Image</DialogTitle>
          <DialogDescription>
            Upload or capture a new photo, then crop and adjust it to your liking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload/Capture Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing || isUploading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
            {imageSrc && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setImageSrc(null);
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setRotation(0);
                  setFlipHorizontal(false);
                  setFlipVertical(false);
                  setGrayscale(false);
                }}
                disabled={isProcessing || isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Crop Area */}
          {imageSrc && (
            <div className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: {
                    width: "100%",
                    height: "100%",
                  },
                }}
              />
            </div>
          )}

          {/* Controls */}
          {imageSrc && (
            <div className="space-y-4">
              {/* Zoom Slider */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Zoom</label>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setZoom(value[0])}
                  disabled={isProcessing || isUploading}
                />
              </div>

              {/* Rotation Controls */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={rotate90CCW}
                  disabled={isProcessing || isUploading}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rotate Left
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={rotate90}
                  disabled={isProcessing || isUploading}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Rotate Right
                </Button>
              </div>

              {/* Flip Controls */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipHorizontal(!flipHorizontal)}
                  disabled={isProcessing || isUploading}
                  className={flipHorizontal ? "bg-primary text-primary-foreground" : ""}
                >
                  <FlipHorizontal className="h-4 w-4 mr-2" />
                  Flip H
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipVertical(!flipVertical)}
                  disabled={isProcessing || isUploading}
                  className={flipVertical ? "bg-primary text-primary-foreground" : ""}
                >
                  <FlipVertical className="h-4 w-4 mr-2" />
                  Flip V
                </Button>
              </div>

              {/* Grayscale Toggle */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGrayscale(!grayscale)}
                  disabled={isProcessing || isUploading}
                  className={grayscale ? "bg-primary text-primary-foreground" : ""}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {grayscale ? "Color" : "Black & White"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isProcessing || isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={!imageSrc || isProcessing || isUploading}
          >
            {(isProcessing || isUploading) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

