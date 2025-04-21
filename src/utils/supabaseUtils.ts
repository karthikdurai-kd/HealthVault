import { supabase } from "@/integrations/supabase/client";


// Check if the bucket exists
export async function ensurePublicBucket(bucketName: string) {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error(`Error listing buckets:`, error);
      return false;
    }
    
    const existingBucket = buckets?.find(b => b.name === bucketName);
    return !!existingBucket; // Return true if bucket exists
  } catch (error) {
    console.error(`Error checking bucket ${bucketName}:`, error);
    return false;
  }
}

// Upload file to bucket
export async function uploadFileToBucket(
  file: File, 
  bucketName: string, 
  filePrefix: string = ""
): Promise<string | null> {
  try {
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
      return null;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
      
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`Error uploading file to ${bucketName}:`, error);
    return null;
  }
}

// Delete file from bucket
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
