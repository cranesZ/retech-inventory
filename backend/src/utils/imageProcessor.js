import sharp from 'sharp';

/**
 * Optimize image for web storage
 * - Resize if too large
 * - Convert to WebP for better compression
 * - Maintain aspect ratio
 */
export async function optimizeImage(buffer, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 85,
    format = 'webp'
  } = options;

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Resize if image is too large
    let resizeOptions = {};
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      resizeOptions = {
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      };
    }

    // Process image
    const processed = await image
      .resize(resizeOptions)
      .toFormat(format, { quality })
      .toBuffer();

    return {
      buffer: processed,
      metadata: {
        format,
        width: metadata.width,
        height: metadata.height,
        size: processed.length
      }
    };
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(buffer, size = 300) {
  try {
    const thumbnail = await sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .toFormat('webp', { quality: 80 })
      .toBuffer();

    return thumbnail;
  } catch (error) {
    throw new Error(`Thumbnail creation failed: ${error.message}`);
  }
}

/**
 * Get image metadata without processing
 */
export async function getImageMetadata(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation
    };
  } catch (error) {
    throw new Error(`Failed to read image metadata: ${error.message}`);
  }
}
