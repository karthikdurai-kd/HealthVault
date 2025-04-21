
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a bucket if it doesn't exist and sets it to public
 */
export async function ensurePublicBucket(bucketName: string, fileSizeLimit: number = 10485760) {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const existingBucket = buckets?.find(b => b.name === bucketName);
    
    if (!existingBucket) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: fileSizeLimit
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        throw createError;
      }
      
      console.log(`Created ${bucketName} bucket`);
      
      // Try to set up public access policies
      try {
        // This is a placeholder for a Supabase RPC function that would set public policies
        // You'd need to create this function in Supabase Studio if it doesn't exist
        await supabase.rpc('create_public_bucket_policy', { bucket_name: bucketName });
      } catch (policyError) {
        console.error(`Error setting public policy for ${bucketName}:`, policyError);
        // This may not be fatal if the bucket was created with public:true
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error ensuring public bucket ${bucketName}:`, error);
    return false;
  }
}

/**
 * Uploads a file to a Supabase storage bucket
 */
export async function uploadFileToBucket(
  file: File, 
  bucketName: string, 
  filePrefix: string = ""
): Promise<string | null> {
  try {
    // Ensure bucket exists
    const bucketExists = await ensurePublicBucket(bucketName);
    if (!bucketExists) {
      throw new Error(`Storage bucket ${bucketName} is not available`);
    }
    
    // Generate file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${filePrefix}${Date.now()}.${fileExt}`;
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { 
        cacheControl: "3600", 
        upsert: true 
      });
      
    if (error) {
      console.error(`Error uploading to ${bucketName}:`, error);
      throw error;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
      
    console.log(`File uploaded successfully to ${bucketName}:`, publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`Error uploading file to ${bucketName}:`, error);
    return null;
  }
}

/**
 * Deletes a file from a Supabase storage bucket
 */
export async function deleteFileFromBucket(fileUrl: string, bucketName: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const filePathMatch = fileUrl.match(new RegExp(`/storage/v1/object/public/${bucketName}/(.*)`));
    if (!filePathMatch || !filePathMatch[1]) {
      console.error("Could not extract file path from URL:", fileUrl);
      return false;
    }
    
    const filePath = decodeURIComponent(filePathMatch[1]);
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) {
      console.error(`Error deleting file from ${bucketName}:`, error);
      return false;
    }
    
    console.log(`File deleted successfully from ${bucketName}:`, filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file from ${bucketName}:`, error);
    return false;
  }
}
