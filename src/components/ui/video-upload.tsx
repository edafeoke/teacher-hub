"use client";

import * as React from "react";
import { startTransition } from "react";
import { Upload, X, Video, VideoOff, Play, Pause, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  maxDuration?: number; // in seconds, default 180 (3 minutes)
  maxSize?: number; // in bytes, default 50MB
}

const MAX_DURATION = 180; // 3 minutes in seconds
const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes

// Extract file ID from Appwrite URL
const extractFileIdFromUrl = (url: string): string | null => {
  try {
    const match = url.match(/\/files\/([^\/]+)\//);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

export function VideoUpload({
  value,
  onChange,
  className,
  maxDuration = MAX_DURATION,
  maxSize = MAX_SIZE,
}: VideoUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [hasVideo, setHasVideo] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const streamRef = React.useRef<MediaStream | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const session = authClient.useSession();
  const userId = session.data?.user?.id;

  React.useEffect(() => {
    if (value) {
      setHasVideo(true);
    }
  }, [value]);

  React.useEffect(() => {
    return () => {
      // Cleanup: stop recording and release media stream
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const validateVideo = async (file: File): Promise<boolean> => {
    // Check file size first (synchronous, fast)
    if (file.size > maxSize) {
      startTransition(() => {
        setError(`Video file is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
      });
      return false;
    }

    // Check video duration (async, defer to avoid blocking)
    return new Promise((resolve) => {
      // Use setTimeout to defer heavy work off the main thread
      setTimeout(() => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const duration = video.duration;
          if (duration > maxDuration) {
            startTransition(() => {
              setError(`Video is too long. Maximum duration is ${formatTime(maxDuration)}.`);
            });
            resolve(false);
          } else {
            resolve(true);
          }
        };
        video.onerror = () => {
          startTransition(() => {
            setError("Invalid video file.");
          });
          resolve(false);
        };
        video.src = URL.createObjectURL(file);
      }, 0);
    });
  };

  const uploadVideo = async (file: File | Blob, fileName: string = "video.webm") => {
    if (!userId) {
      startTransition(() => {
        setError("You must be logged in to upload videos");
      });
      return;
    }

    // Batch state updates to avoid multiple renders
    startTransition(() => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
    });

    try {
      // Convert blob to File if needed
      const fileToUpload = file instanceof File 
        ? file 
        : new File([file], fileName, { type: file.type || "video/webm" });

      // Create form data for server-side upload
      const formData = new FormData();
      formData.append("file", fileToUpload);

      // Upload with progress tracking using XMLHttpRequest for better progress support
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<{ fileUrl: string; fileId: string }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            // Use requestAnimationFrame to batch progress updates
            requestAnimationFrame(() => {
              setUploadProgress(percentComplete);
            });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve({ fileUrl: response.fileUrl, fileId: response.fileId });
            } else {
              reject(new Error(response.error || "Upload failed"));
            }
          } else {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.error || "Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.open("POST", "/api/upload/video");
        xhr.send(formData);
      });

      const result = await uploadPromise;
      
      // Batch state updates
      startTransition(() => {
        // Store URL in database via onChange callback
        onChange(result.fileUrl);
        setHasVideo(true);
        setUploadProgress(100);
      });
    } catch (err) {
      console.error("Upload error:", err);
      startTransition(() => {
        setError(err instanceof Error ? err.message : "Failed to upload video");
        setIsUploading(false);
      });
    } finally {
      // Defer final state update
      setTimeout(() => {
        startTransition(() => {
          setIsUploading(false);
          setUploadProgress(0);
        });
      }, 100);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Quick synchronous check first
    if (!file.type.startsWith("video/")) {
      startTransition(() => {
        setError("Please select a valid video file.");
      });
      return;
    }

    // Defer heavy validation and upload to avoid blocking UI
    startTransition(async () => {
      const isValid = await validateVideo(file);
      if (!isValid) return;

      await uploadVideo(file, file.name);
    });
  };

  const startRecording = async () => {
    try {
      startTransition(() => {
        setError(null);
      });
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        
        // Stop all tracks first (non-blocking)
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        
        // Check blob size
        if (blob.size > maxSize) {
          startTransition(() => {
            setError(`Recorded video is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
          });
          return;
        }

        // Upload the recorded video (defer to avoid blocking)
        startTransition(async () => {
          await uploadVideo(blob, userId + ".webm");
          setIsDialogOpen(false);
        });
      };

      mediaRecorder.start();
      startTransition(() => {
        setIsRecording(true);
        setRecordingTime(0);
      });

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            startTransition(() => {
              setError(`Maximum recording duration of ${formatTime(maxDuration)} reached.`);
            });
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      console.error("Error accessing camera:", err);
      startTransition(() => {
        setError("Unable to access camera. Please check permissions.");
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Batch state updates
    startTransition(() => {
      setIsRecording(false);
      setRecordingTime(0);
    });
  };

  const handleRemove = () => {
    // Delete file from Appwrite via API route (defer to avoid blocking)
    if (value) {
      const fileId = extractFileIdFromUrl(value);
      if (fileId) {
        // Defer deletion to avoid blocking UI
        startTransition(async () => {
          try {
            await fetch(`/api/upload/video?fileId=${fileId}`, {
              method: "DELETE",
            });
          } catch (err) {
            // Log but don't fail - file might not exist or already deleted
            console.warn("Error deleting file (this is okay if file doesn't exist):", err);
          }
        });
      }
    }

    // Batch state updates
    startTransition(() => {
      onChange("");
      setHasVideo(false);
      setError(null);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {hasVideo && value ? (
        <div className="relative w-full max-w-md">
          <video
            src={value}
            controls
            className="w-full rounded-lg border"
            style={{ maxHeight: "400px" }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-lg">
          <Video className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            No intro video uploaded yet
          </p>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading video...</span>
            <span className="text-muted-foreground">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            // Defer to avoid blocking UI
            requestAnimationFrame(() => {
              fileInputRef.current?.click();
            });
          }}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </>
          )}
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={isUploading}>
              <Video className="h-4 w-4 mr-2" />
              Record Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Intro Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full max-h-[400px]"
                />
                {!isRecording && !hasVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoOff className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Recording: {formatTime(recordingTime)} / {formatTime(maxDuration)}</span>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                {!isRecording ? (
                  <Button
                    type="button"
                    onClick={startRecording}
                    disabled={!!streamRef.current}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={stopRecording}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Maximum duration: {formatTime(maxDuration)} | Maximum size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </DialogContent>
        </Dialog>
        {hasVideo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <p className="text-muted-foreground text-xs text-center">
        Upload or record a short intro video (max {formatTime(maxDuration)}, {Math.round(maxSize / 1024 / 1024)}MB)
      </p>
    </div>
  );
}

