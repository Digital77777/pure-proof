UPDATE storage.buckets 
SET file_size_limit = 524288000,
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif',
      'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska'
    ]
WHERE id = 'media';