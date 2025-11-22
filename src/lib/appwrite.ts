import { Client, Storage } from "appwrite";

// Initialize Appwrite client
const getAppwriteClient = () => {
  const endpoint = process.env.APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID;

  if (!endpoint || !projectId) {
    const missing = [];
    if (!endpoint) missing.push("APPWRITE_ENDPOINT");
    if (!projectId) missing.push("APPWRITE_PROJECT_ID");
    
    throw new Error(
      `Appwrite configuration missing: ${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required. ` +
      `Please check your .env file and restart the dev server if you just added these variables.`
    );
  }

  const client = new Client();
  client.setEndpoint(endpoint).setProject(projectId);

  // Set API key for server-side operations (REQUIRED for server-side file uploads)
  const apiKey = process.env.APPWRITE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "APPWRITE_API_KEY is required for server-side operations. " +
      "Please add it to your .env file and restart the dev server."
    );
  }
  client.setDevKey(apiKey);

  return client;
};

// Get storage instance
export const getStorage = () => {
  const client = getAppwriteClient();
  return new Storage(client);
};

// Get bucket ID from environment variable
export const getBucketId = (): string => {
  const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID;
  if (!bucketId) {
    throw new Error(
      "Appwrite bucket ID missing: APPWRITE_STORAGE_BUCKET_ID is required. " +
      "Please add it to your .env file and restart the dev server."
    );
  }
  return bucketId;
};

// Get file download URL
export const getFileUrl = (fileId: string): string => {
  const endpoint = process.env.APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const bucketId = getBucketId();

  if (!endpoint || !projectId) {
    const missing = [];
    if (!endpoint) missing.push("APPWRITE_ENDPOINT");
    if (!projectId) missing.push("APPWRITE_PROJECT_ID");
    
    throw new Error(
      `Appwrite configuration missing: ${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required. ` +
      `Please check your .env file and restart the dev server if you just added these variables.`
    );
  }

  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
};

