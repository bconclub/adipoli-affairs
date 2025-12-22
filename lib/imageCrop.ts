/**
 * Creates a cropped image based on the crop area pixels
 */
export async function getCroppedImg(
    imageSrc: string,
    croppedAreaPixels: { x: number; y: number; width: number; height: number },
    aspectRatio: number
): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    // Target dimensions (16:9)
    const maxWidth = 1920;
    const maxHeight = Math.round(maxWidth / aspectRatio);
    
    // Set canvas size to final output size
    canvas.width = maxWidth;
    canvas.height = maxHeight;

    // Use the cropped area pixels directly from react-easy-crop
    const { x, y, width, height } = croppedAreaPixels;

    // Draw the cropped image, scaling to target size
    ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        maxWidth,
        maxHeight
    );

    // Convert to blob then to data URL
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            },
            'image/jpeg',
            0.95
        );
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });
}

