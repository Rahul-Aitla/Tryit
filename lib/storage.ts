import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GCS_BUCKET_NAME || '';
const bucket = storage.bucket(bucketName);

export default storage;

export const uploadToGCS = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: 'outfits' | 'references' | 'generated'
) => {
  try {
    const destination = `ai-outfit-tool/${folder}/${Date.now()}-${fileName}`;
    const file = bucket.file(destination);

    await file.save(fileBuffer, {
      contentType,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Note: Individual file.makePublic() is removed because it conflicts with 
    // "Uniform bucket-level access". To make images visible in the gallery:
    // 1. Go to GCS Console -> your bucket -> Permissions
    // 2. Click "Grant Access"
    // 3. Add principal "allUsers" with role "Storage Object Viewer"

    return `https://storage.googleapis.com/${bucketName}/${destination}`;
  } catch (error) {
    console.error(`Error uploading to GCS (${folder}):`, error);
    throw error;
  }
};
