import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    quality?: number;
}

const defaultOptions: CompressionOptions = {
    maxSizeMB: 0.2, // Maximum file size in MB (200KB)
    maxWidthOrHeight: 1920, // Maximum width (16:9 = 1920x1080)
    useWebWorker: true,
    quality: 0.7, // Quality between 0 and 1 (reduced for smaller file size)
};

// Standard 16:9 image dimensions
export const IMAGE_DIMENSIONS = {
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
};

export interface CompressionResult {
    file: File;
    originalSize: number;
    compressedSize: number;
}

/**
 * Compresses an image file before uploading
 * @param file - The image file to compress
 * @param options - Optional compression settings
 * @param productName - Optional product name to use as filename
 * @returns Compression result with compressed file and size information
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {},
    productName?: string
): Promise<CompressionResult> {
    const originalSize = file.size;
    
    try {
        const compressionOptions = { ...defaultOptions, ...options };
        
        // Compress the image
        const compressedFile = await imageCompression(file, compressionOptions);
        
        // Rename file with product name if provided
        let finalFile = compressedFile;
        if (productName) {
            const sanitizedName = productName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            const fileExtension = file.name.split('.').pop() || 'jpg';
            const newFileName = `${sanitizedName}.${fileExtension}`;
            
            // Create a new File object with the product name
            finalFile = new File([compressedFile], newFileName, {
                type: compressedFile.type,
                lastModified: Date.now(),
            });
        }
        
        const compressedSize = finalFile.size;
        
        return {
            file: finalFile,
            originalSize,
            compressedSize,
        };
    } catch (error) {
        console.error('Image compression error:', error);
        // Fallback to original file if compression fails
        return {
            file: file,
            originalSize,
            compressedSize: originalSize,
        };
    }
}

/**
 * Get file size in a human-readable format
 */
export function getFileSize(file: File | number): string {
    const size = typeof file === 'number' ? file : file.size;
    const sizeInMB = size / (1024 * 1024);
    if (sizeInMB < 1) {
        return `${(size / 1024).toFixed(2)} KB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
}
