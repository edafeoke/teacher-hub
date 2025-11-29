"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Video, Square, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoRecorderProps {
  onRecordingComplete: (videoBlob: Blob, duration: number) => void;
  onUploadProgress?: (progress: number) => void;
}

export function VideoRecorder({
  onRecordingComplete,
  onUploadProgress,
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [videoChunks, setVideoChunks] = React.useState<Blob[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      const recorder = new MediaRecorder(mediaStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : MediaRecorder.isTypeSupported("video/mp4")
          ? "video/mp4"
          : "",
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const videoBlob = new Blob(chunks, { type: recorder.mimeType });
        setVideoChunks([]);

        // Stop all tracks
        mediaStream.getTracks().forEach((track) => track.stop());

        // Calculate duration
        const video = document.createElement("video");
        video.src = URL.createObjectURL(videoBlob);
        video.onloadedmetadata = () => {
          const videoDuration = Math.round(video.duration);
          onRecordingComplete(videoBlob, videoDuration);
          setIsOpen(false);
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
      setStream(mediaStream);
      setIsRecording(true);
      setDuration(0);

      // Start duration counter
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording. Please check camera permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsRecording(false);
    setIsOpen(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Video className="h-5 w-5" />
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {isRecording && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {formatDuration(duration)}
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              {!isRecording ? (
                <Button onClick={startRecording} className="w-full">
                  Start Recording
                </Button>
              ) : (
                <>
                  <Button
                    variant="destructive"
                    onClick={stopRecording}
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelRecording}
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

