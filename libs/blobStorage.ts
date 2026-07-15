// src/libs/blobStorage.ts
import { API } from "../config";

/**
 * Helper to upload a file to Blob Storage.
 * It reads the file, converts it to base64, and POSTs to the /api/BlobStorage/upload endpoint.
 *
 * @param file The File object to upload
 * @returns A promise resolving to an object containing the uploaded file's path/URL
 */
export async function uploadToBlobStorage(file: File): Promise<{ filePath: string }> {
  // Convert file to base64 string
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip off the "data:*/*;base64," header prefix
      const commaIdx = result.indexOf(",");
      if (commaIdx !== -1) {
        resolve(result.substring(commaIdx + 1));
      } else {
        resolve(result);
      }
    };
    reader.onerror = (error) => reject(error);
  });

  const url = API.BLOB_UPLOAD;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      base64Data,
      fileName: file.name,
      contentType: file.type,
    }),
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let errMessage = `HTTP ${response.status}`;
    try {
      const json = JSON.parse(text);
      if (json?.message) errMessage = json.message;
    } catch {
      if (text) errMessage = text;
    }
    throw new Error(errMessage);
  }

  return response.json();
}
