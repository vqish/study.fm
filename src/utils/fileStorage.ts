import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from './db';

export type StoredFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: number;
  preview?: string; // thumbnail URL or base64
  url?: string;     // download URL
  storagePath: string;
};

export async function saveFile(file: File, userUid: string): Promise<StoredFile> {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const storagePath = `users/${userUid}/notes/${fileId}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  // Upload to Storage
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  let preview: string | undefined;
  if (file.type.startsWith('image/')) {
    preview = downloadURL;
  }

  const stored: StoredFile = {
    id: fileId,
    name: file.name,
    type: file.type,
    size: file.size,
    uploadDate: Date.now(),
    preview,
    url: downloadURL,
    storagePath
  };

  // Save metadata to Firestore
  await db.saveFileMetadata(userUid, stored);

  return stored;
}

export async function getAllFiles(userUid: string): Promise<StoredFile[]> {
  const metadata = await db.getFileMetadata(userUid);
  return metadata as StoredFile[];
}

export async function deleteFile(file: StoredFile, userUid: string): Promise<void> {
  // Delete from Storage
  const storageRef = ref(storage, file.storagePath);
  await deleteObject(storageRef).catch(err => console.error("Storage delete failed:", err));

  // Delete from Firestore
  await db.deleteFileMetadata(userUid, file.id);
}

export function downloadFile(file: StoredFile) {
  if (file.url) {
    window.open(file.url, '_blank');
  } else {
    alert("Download link unavailable.");
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

