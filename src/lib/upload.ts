import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || "5")) * 1024 * 1024;
const WEBP_QUALITY = parseInt(process.env.WEBP_QUALITY || "80");

export interface ProcessedImage {
  originalName: string;
  webpBuffer: Buffer;
  thumbnailBuffer: Buffer;
  fileName: string;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, WebP, and AVIF images are allowed" };
  }
  return { valid: true };
}

export async function processImage(file: File): Promise<ProcessedImage> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = "webp";
  const fileName = `${uuidv4()}.${ext}`;

  const webpBuffer = await sharp(buffer)
    .webp({ quality: WEBP_QUALITY })
    .withMetadata({ exif: undefined })
    .toBuffer();

  const thumbnailBuffer = await sharp(buffer)
    .resize(100, 100, { fit: "cover" })
    .webp({ quality: 60 })
    .toBuffer();

  return {
    originalName: file.name,
    webpBuffer,
    thumbnailBuffer,
    fileName,
  };
}
