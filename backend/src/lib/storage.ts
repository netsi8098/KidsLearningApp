import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// ── Storage Provider Interface ─────────────────────────────
export interface StorageProvider {
  upload(key: string, data: Buffer, contentType: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  exists(key: string): Promise<boolean>;
}

// ── Local Filesystem Provider ──────────────────────────────
class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async upload(key: string, data: Buffer, _contentType: string): Promise<string> {
    const filePath = path.join(this.basePath, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return `/uploads/${key}`;
  }

  async download(key: string): Promise<Buffer> {
    const filePath = path.join(this.basePath, key);
    return fs.readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    await fs.unlink(filePath).catch(() => {});
  }

  async getSignedUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.basePath, key));
      return true;
    } catch {
      return false;
    }
  }
}

// ── S3-Compatible Provider (stub — plug in aws-sdk when needed) ──
class S3StorageProvider implements StorageProvider {
  async upload(key: string, _data: Buffer, _contentType: string): Promise<string> {
    throw new Error(`S3 upload not configured for key: ${key}`);
  }
  async download(key: string): Promise<Buffer> {
    throw new Error(`S3 download not configured for key: ${key}`);
  }
  async delete(key: string): Promise<void> {
    throw new Error(`S3 delete not configured for key: ${key}`);
  }
  async getSignedUrl(key: string): Promise<string> {
    throw new Error(`S3 getSignedUrl not configured for key: ${key}`);
  }
  async exists(_key: string): Promise<boolean> {
    return false;
  }
}

// ── Factory ────────────────────────────────────────────────
export function createStorage(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  if (provider === 's3') {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider(process.env.STORAGE_LOCAL_PATH || './uploads');
}

export const storage = createStorage();

// ── Helpers ────────────────────────────────────────────────
export function generateStorageKey(prefix: string, filename: string): string {
  const ext = path.extname(filename);
  const id = randomUUID();
  return `${prefix}/${id}${ext}`;
}
