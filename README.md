# TeacherHub

TeacherHub is a smart, modern platform designed to seamlessly connect students with the perfect teachers—anytime, anywhere. Whether you’re looking for academic tutoring, skill-based learning, or professional guidance, TeacherHub makes the process simple and transparent.

With powerful search tools, detailed teacher profiles, verified reviews, and flexible online or in-person options, students can confidently find the right tutor for their needs. Teachers gain access to a steady stream of motivated learners, easy scheduling tools, and a professional space to showcase their expertise.

Built with trust, convenience, and quality at its core, TeacherHub transforms the way students learn and how teachers grow their careers—making education more accessible, personalized, and effective for everyone.

## Environment Variables

### Appwrite Configuration

The following environment variables are required for Appwrite storage integration (used for intro video uploads):

- `NEXT_PUBLIC_APPWRITE_ENDPOINT` - Your Appwrite server endpoint URL (e.g., `https://cloud.appwrite.io/v1`)
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - Your Appwrite project ID
- `NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID` - The bucket ID where intro videos will be stored (configurable for future changes)

**Note:** These variables use the `NEXT_PUBLIC_` prefix because uploads are performed client-side. No API key is required.

### Example `.env` file

```env
# Appwrite Configuration (Client-side uploads)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=your-bucket-id
```

**Important Notes:**
- Videos are uploaded directly from the browser (client-side), so no API key is needed
- The file name in Appwrite storage uses the user's ID (userId)
- The video URL is stored in the database in the `introVideoUrl` field
- Make sure your Appwrite bucket has the appropriate permissions configured (CREATE and READ permissions for authenticated users or anonymous users, depending on your setup)
