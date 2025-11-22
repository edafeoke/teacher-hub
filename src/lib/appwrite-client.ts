"use client";

import { Client, Storage, ID } from "appwrite";

// Client-side Appwrite configuration
// These can be public since they're needed in the browser
const getClient = () => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

  if (!endpoint || !projectId) {
    throw new Error(
      "Appwrite client configuration missing: NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID are required"
    );
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  return client;
};

// Get storage instance for client-side
export const getClientStorage = () => {
  const client = getClient();
  return new Storage(client);
};

// Get bucket ID from environment variable
export const getClientBucketId = (): string => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID;
  if (!bucketId) {
    throw new Error(
      "Appwrite bucket ID missing: NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID is required"
    );
  }
  return bucketId;
};

// Get file download URL
export const getClientFileUrl = (fileId: string): string => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const bucketId = getClientBucketId();

  if (!endpoint || !projectId) {
    throw new Error(
      "Appwrite client configuration missing: NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID are required"
    );
  }

  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
};

// Export ID for generating unique file IDs
export { ID };

