import 'server-only';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

// Files live on a mounted volume (spec §3/§6.6). We store a relative key in the
// DB (e.g. "documents/uuid.pdf") and serve bytes only through an auth-checked
// route — never a public directory listing.
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

const ALLOWED = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['application/pdf', 'pdf'],
]);

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export interface StoredFile {
  fileUrl: string; // relative key under UPLOAD_DIR
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export async function saveUpload(file: File, subdir = 'documents'): Promise<StoredFile> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error('শুধু JPG, PNG, WebP বা PDF আপলোড করা যাবে');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('ফাইল ৮ MB এর বেশি হতে পারবে না');

  const key = path.posix.join(subdir, `${randomUUID()}.${ext}`);
  const absPath = path.join(UPLOAD_DIR, key);
  await mkdir(path.dirname(absPath), { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(absPath, bytes);

  return { fileUrl: key, fileName: sanitizeName(file.name), mimeType: file.type, sizeBytes: file.size };
}

export async function readUpload(key: string): Promise<Buffer> {
  // Guard against path traversal — key must stay inside UPLOAD_DIR.
  const absPath = path.resolve(UPLOAD_DIR, key);
  const root = path.resolve(UPLOAD_DIR);
  if (!absPath.startsWith(root + path.sep)) throw new Error('Invalid file path');
  return readFile(absPath);
}

function sanitizeName(name: string): string {
  return name.replace(/[^\w.\-ঀ-৿ ]+/g, '_').slice(0, 120) || 'file';
}
