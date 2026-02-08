/**
 * Compresses an image to a thumbnail for storage
 * @param base64Image - Original base64 image string
 * @param maxWidth - Maximum width of thumbnail (default: 200)
 * @param maxHeight - Maximum height of thumbnail (default: 200)
 * @param quality - JPEG quality 0-1 (default: 0.7)
 * @returns Promise<string> - Compressed base64 image
 */
export const compressImageToThumbnail = (
    base64Image: string,
    maxWidth: number = 200,
    maxHeight: number = 200,
    quality: number = 0.7
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            // Create canvas and draw resized image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Convert to compressed base64
            try {
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = base64Image;
    });
};

/**
 * Estimates the size of a base64 string in KB
 */
export const getBase64Size = (base64String: string): number => {
    const base64Length = base64String.length - (base64String.indexOf(',') + 1);
    const sizeInBytes = (base64Length * 3) / 4;
    return sizeInBytes / 1024; // Return KB
};
