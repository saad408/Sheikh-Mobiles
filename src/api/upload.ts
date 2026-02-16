import { getApiBaseUrl } from '@/lib/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadProductImageResponse {
  success: true;
  url: string;
  filename: string;
}

/** Upload a product image; returns the URL to store in product.image. Do not set Content-Type (browser sets multipart boundary). */
export async function uploadProductImage(
  token: string,
  file: File
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${getApiBaseUrl()}/api/upload/product-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    const message =
      (data && typeof data.error === 'string' && data.error) || 'Upload failed';
    throw new Error(message);
  }
  return { url: (data as UploadProductImageResponse).url };
}

export const UPLOAD_LIMITS = {
  maxFileSize: MAX_FILE_SIZE,
  maxFileSizeMB: 5,
  acceptTypes: ACCEPT_TYPES,
  acceptString: 'image/jpeg,image/png,image/webp,image/gif',
} as const;

/** Client-side validation before upload. Returns error message or null if valid. */
export function validateProductImageFile(file: File): string | null {
  if (!ACCEPT_TYPES.includes(file.type)) {
    return 'Allowed types: JPEG, PNG, WebP, GIF';
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File must be 5MB or less (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
  }
  return null;
}
