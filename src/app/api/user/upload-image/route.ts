import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getStorage, getBucketId, getFileUrl } from "@/lib/appwrite";
import { randomBytes } from "crypto";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
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
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only image files (JPEG, PNG, GIF, WebP) are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${Math.round(MAX_IMAGE_SIZE / 1024 / 1024)}MB.`,
        },
        { status: 400 }
      );
    }

    // Upload to Appwrite
    const storage = getStorage();
    const bucketId = getBucketId();

    // Generate unique file ID for profile image
    // Appwrite requires: max 36 chars, only a-z, A-Z, 0-9, period, hyphen, underscore, can't start with special char
    // Format: first 12 chars of userId (alphanumeric only) + timestamp (last 8 digits) + random (4 hex chars) = max 24 chars
    const userIdClean = session.user.id.replace(/[^a-zA-Z0-9]/g, "").substring(0, 12);
    const timestamp = Date.now().toString().slice(-8);
    const random = randomBytes(2).toString("hex");
    const fileId = `${userIdClean}${timestamp}${random}`.substring(0, 36);

    // Delete old profile images (optional - can be done periodically via cleanup job)
    // For now, we'll just upload the new one

    // Upload file
    const uploadedFile = await storage.createFile(bucketId, fileId, file);

    // Get file URL
    const fileUrl = getFileUrl(fileId);

    return NextResponse.json({
      success: true,
      fileUrl,
      fileId: uploadedFile.$id,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload image",
      },
      { status: 500 }
    );
  }
}

