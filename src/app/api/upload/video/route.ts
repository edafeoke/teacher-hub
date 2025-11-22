import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getStorage, getBucketId, getFileUrl } from "@/lib/appwrite";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const MAX_DURATION = 180; // 3 minutes in seconds
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];

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
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only video files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${Math.round(MAX_SIZE / 1024 / 1024)}MB.`,
        },
        { status: 400 }
      );
    }

    // Note: Video duration validation would require server-side video processing
    // For now, we'll rely on client-side validation. This can be enhanced later.

    // Upload to Appwrite
    const storage = getStorage();
    const bucketId = getBucketId();

    // Use userId as the file ID (as requested)
    const fileId = session.user.id;

    // Delete old file if it exists (since we use userId as fileId, we replace the existing file)
    try {
      await storage.deleteFile(bucketId, fileId);
    } catch (error) {
      // Log but don't fail if deletion fails (file might not exist)
      console.warn("Failed to delete old file (this is okay if file doesn't exist):", error);
    }

    // Upload file (file from FormData is already a File object)
    const uploadedFile = await storage.createFile(bucketId, fileId, file);

    // Get file URL using userId (which is the fileId)
    const fileUrl = getFileUrl(fileId);

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.$id,
      fileUrl,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload video",
      },
      { status: 500 }
    );
  }
}

// Handle file deletion
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Delete file from Appwrite
    const storage = getStorage();
    const bucketId = getBucketId();

    await storage.deleteFile(bucketId, fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete video",
      },
      { status: 500 }
    );
  }
}

