const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

export async function compressImageForUpload(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType: "image/jpeg" | "image/webp" =
    file.type === "image/webp" ? "image/webp" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, JPEG_QUALITY));
  if (!blob || blob.size >= file.size) return file;

  const base = file.name.replace(/\.[^.]+$/, "");
  const ext = outputType === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${base}.${ext}`, { type: outputType, lastModified: Date.now() });
}
