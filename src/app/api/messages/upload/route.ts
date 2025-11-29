import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getStorage, getBucketId, getFileUrl } from "@/lib/appwrite";
import { randomBytes } from "crypto";

// File size limits (in bytes)
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed MIME types
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/aac",
  "audio/m4a",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/avi",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain",
  "text/csv",
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const fileType = file.type;
    const isAudio = ALLOWED_AUDIO_TYPES.includes(fileType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);
    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
    const isDocument = ALLOWED_DOCUMENT_TYPES.includes(fileType);

    if (!isAudio && !isVideo && !isImage && !isDocument) {
      return NextResponse.json(
        { error: "Invalid file type. Only audio, video, image, and document files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size based on type
    let maxSize: number;
    if (isAudio) {
      maxSize = MAX_AUDIO_SIZE;
    } else if (isVideo) {
      maxSize = MAX_VIDEO_SIZE;
    } else if (isImage) {
      maxSize = MAX_IMAGE_SIZE;
    } else {
      maxSize = MAX_FILE_SIZE;
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024);
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${maxSizeMB}MB for ${isAudio ? "audio" : isVideo ? "video" : isImage ? "image" : "document"} files.`,
        },
        { status: 400 }
      );
    }

    // Upload to Appwrite
    const storage = getStorage();
    const bucketId = getBucketId();

    // Generate unique file ID
    const fileId = `${session.user.id}_${Date.now()}_${randomBytes(8).toString("hex")}`;

    // Upload file
    const uploadedFile = await storage.createFile(bucketId, fileId, file);

    // Get file URL
    const fileUrl = getFileUrl(fileId);

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.$id,
      fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}

