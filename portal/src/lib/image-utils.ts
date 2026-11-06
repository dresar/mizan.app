
/**
 * Compresses and converts an image file to WebP format.
 * 
 * @param file The original image file
 * @param quality Quality factor (0.0 to 1.0)
 * @param maxWidth Maximum width for resizing (default 1920)
 * @returns A Promise resolving to the processed File
 */
export async function compressAndConvertToWebP(file: File, quality = 0.8, maxWidth = 1920): Promise<File> {
    // Skip non-images or files that shouldn't be converted
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            
            let width = img.width;
            let height = img.height;

            // Resize logic
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Canvas context not available'));
            }

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to WebP blob
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create new file with .webp extension
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    const newFile = new File([blob], newFileName, {
                        type: 'image/webp',
                        lastModified: Date.now()
                    });
                    resolve(newFile);
                } else {
                    reject(new Error('Canvas to Blob failed'));
                }
            }, 'image/webp', quality);
        };

        img.onerror = (error) => {
            URL.revokeObjectURL(url);
            reject(error);
        };

        img.src = url;
    });
}
