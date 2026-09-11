import dotenv from 'dotenv';
dotenv.config();

export const storageConfig = {
  resumesBucket: process.env.SUPABASE_STORAGE_BUCKET_RESUMES || 'resumes',
  maxFileSizeMB: Number(process.env.MAX_FILE_SIZE_MB || 10),
  allowedMimeTypes: ['application/pdf'],
};
