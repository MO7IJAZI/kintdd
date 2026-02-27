import fs from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

type UploadableFile = File | Buffer | { name?: string; buffer: Buffer };

function isBufferedFile(value: UploadableFile): value is { name?: string; buffer: Buffer } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'buffer' in value &&
        Buffer.isBuffer((value as { buffer?: unknown }).buffer)
    );
}

export async function uploadFile(file: UploadableFile, folder: string = 'uploads'): Promise<string> {
    try {
        // Convert file data to Buffer
        let buffer: Buffer;
        if (Buffer.isBuffer(file)) {
            buffer = file;
        } else if (isBufferedFile(file)) {
            buffer = file.buffer;
        } else {
            buffer = Buffer.from(await file.arrayBuffer());
        }

        // Check if Cloudinary credentials are set
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: folder,
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        if (!result) return reject(new Error('Cloudinary upload failed'));
                        resolve(result.secure_url);
                    }
                );
                uploadStream.end(buffer);
            });
        }

    // Fallback to local file system
    // In standalone mode (production), process.cwd() is the root where server.js runs.
    // We want to store uploads in a persistent directory, ideally outside .next/standalone/public if possible,
    // or ensure we copy them. But for now, let's put them in 'public/uploads' relative to CWD.
    const uploadDir = path.join(process.cwd(), 'public', folder);
    
    // Ensure directory exists
    try {
        await fs.mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }

    // Generate unique filename
    const timestamp = Date.now();
    // Safely get name
    let originalName = 'file';
    if ('name' in file && typeof file.name === 'string') {
        originalName = file.name;
    }
    
    const extension = path.extname(originalName) || '.bin';
    const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9]/g, '-');
    const uniqueName = `${baseName}-${timestamp}${extension}`;
    
    const filePath = path.join(uploadDir, uniqueName);
    
    // The relative path stored in DB should be handled by our custom route handler
    // If we store "/uploads/image.jpg", Next.js default static handler might miss it in standalone mode
    // if the file wasn't there at build time.
    // So we use our custom route /uploads/[...filename] to serve it dynamically from disk.
    const relativePath = `/${folder}/${uniqueName}`;

    // Write file
    await fs.writeFile(filePath, buffer);

    return relativePath;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
}

export async function deleteFile(filePath: string): Promise<void> {
    try {
        // Check if it's a Cloudinary URL
        if (filePath.includes('cloudinary.com')) {
            if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
                // Extract public_id from URL
                // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
                const parts = filePath.split('/');
                const filenameWithExt = parts.pop();
                const folder = parts.pop(); // This might need adjustment depending on URL structure
                // Ideally, we should store public_id, but here we try to guess it
                if (filenameWithExt && folder) {
                    const publicId = `${folder}/${filenameWithExt.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                }
            }
            return;
        }

        // Local file deletion
        if (filePath.startsWith('/')) {
            const fullPath = path.join(process.cwd(), 'public', filePath.substring(1));
            await fs.unlink(fullPath).catch(() => {
                // Ignore errors if file doesn't exist
            });
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file');
    }
}
