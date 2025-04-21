
-- This is an RPC function to create a public policy for a storage bucket
-- This function creates a policy allowing anonymous access to files in a bucket
CREATE OR REPLACE FUNCTION create_public_bucket_policy(bucket_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create policy for public read access 
  EXECUTE format('
    CREATE POLICY allow_public_select_bucket_%I ON storage.objects 
    FOR SELECT 
    USING (bucket_id = %L);
  ', bucket_name, bucket_name);
  
  -- Create policy for authenticated users to insert into bucket
  EXECUTE format('
    CREATE POLICY allow_authenticated_insert_bucket_%I ON storage.objects
    FOR INSERT 
    WITH CHECK (bucket_id = %L AND auth.role() = ''authenticated'');
  ', bucket_name, bucket_name);

  -- Create policy for authenticated users to update their own objects
  EXECUTE format('
    CREATE POLICY allow_authenticated_update_bucket_%I ON storage.objects
    FOR UPDATE
    USING (bucket_id = %L AND auth.role() = ''authenticated'' AND (owner = auth.uid()::text));
  ', bucket_name, bucket_name);

  -- Create policy for authenticated users to delete their own objects
  EXECUTE format('
    CREATE POLICY allow_authenticated_delete_bucket_%I ON storage.objects
    FOR DELETE
    USING (bucket_id = %L AND auth.role() = ''authenticated'' AND (owner = auth.uid()::text));
  ', bucket_name, bucket_name);
END;
$$;
