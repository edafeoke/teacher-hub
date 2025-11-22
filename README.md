# TeacherHub

TeacherHub is a smart, modern platform designed to seamlessly connect students with the perfect teachers—anytime, anywhere. Whether you’re looking for academic tutoring, skill-based learning, or professional guidance, TeacherHub makes the process simple and transparent.

With powerful search tools, detailed teacher profiles, verified reviews, and flexible online or in-person options, students can confidently find the right tutor for their needs. Teachers gain access to a steady stream of motivated learners, easy scheduling tools, and a professional space to showcase their expertise.

Built with trust, convenience, and quality at its core, TeacherHub transforms the way students learn and how teachers grow their careers—making education more accessible, personalized, and effective for everyone.

## Environment Variables

### Appwrite Configuration

The following environment variables are required for Appwrite storage integration (used for intro video uploads):

- `APPWRITE_ENDPOINT` - Your Appwrite server endpoint URL (e.g., `https://cloud.appwrite.io/v1`)
- `APPWRITE_PROJECT_ID` - Your Appwrite project ID
- `APPWRITE_API_KEY` - API key for server-side operations (with Storage permissions)
- `APPWRITE_STORAGE_BUCKET_ID` - The bucket ID where intro videos will be stored (configurable for future changes)

**Note:** Uploads are performed server-side via API route to avoid CORS issues. The API key is required for server-side operations.

### Example `.env` file

```env
# Appwrite Configuration (Server-side uploads)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_STORAGE_BUCKET_ID=your-bucket-id
```

**Important Notes:**
- Videos are uploaded via server-side API route (no CORS issues)
- The file name in Appwrite storage uses the user's ID (userId)
- The video URL is stored in the database in the `introVideoUrl` field
- Make sure your Appwrite bucket has the appropriate permissions configured
- The API key must have Storage permissions for the bucket
