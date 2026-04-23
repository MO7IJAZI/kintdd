import fs from 'fs/promises';
import path from 'path';
import prisma from './prisma';

// Prisma client sometimes lacks freshly generated model typings in the TS server.
// Use a local `db` alias typed as `any` to access model delegates without editor errors.
const db = prisma as unknown as any;

export interface CustomFont {
    id?: string;
    name: string;
    url: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    displayName?: string;
    isActive?: boolean;
}

export interface CustomFontResponse {
    name: string;
    url: string;
    displayName?: string;
}

/**
 * Get all active custom fonts from the database
 */
export async function getCustomFonts(): Promise<CustomFontResponse[]> {
    try {
        const fonts = await db.customFont.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
        
        return fonts.map((f: typeof fonts[number]) => ({
            name: f.name,
            url: f.url,
            displayName: f.displayName || f.name,
        }));
    } catch (error) {
        console.error('Failed to fetch custom fonts:', error);
        return [];
    }
}

/**
 * Save a custom font to the database
 */
export async function saveCustomFont(font: CustomFont): Promise<CustomFontResponse[]> {
    try {
        console.log('Saving custom font to DB:', font);
        // Check if font already exists
        const existing = await db.customFont.findUnique({
            where: { name: font.name },
        });

        if (existing) {
            console.log('Updating existing font:', font.name);
            // Update existing font
            await db.customFont.update({
                where: { name: font.name },
                data: {
                    url: font.url,
                    fileName: font.fileName || existing.fileName,
                    fileSize: font.fileSize !== undefined ? Number(font.fileSize) : existing.fileSize,
                    mimeType: font.mimeType || existing.mimeType,
                    displayName: font.displayName || existing.displayName,
                    isActive: font.isActive !== undefined ? font.isActive : true,
                    updatedAt: new Date(),
                },
            });
        } else {
            console.log('Creating new font entry:', font.name);
            // Create new font
            await db.customFont.create({
                data: {
                    name: font.name,
                    url: font.url,
                    fileName: font.fileName || '',
                    fileSize: font.fileSize !== undefined ? Number(font.fileSize) : 0,
                    mimeType: font.mimeType || 'font/ttf',
                    displayName: font.displayName || font.name,
                    isActive: true,
                },
            });
        }

        return getCustomFonts();
    } catch (error) {
        console.error('Failed to save font to database:', error);
        throw error;
    }
}

/**
 * Delete a custom font from the database and its file from storage
 */
export async function deleteCustomFont(name: string): Promise<CustomFontResponse[]> {
    try {
        const fontToDelete = await db.customFont.findUnique({
            where: { name },
        });

        if (!fontToDelete) {
            return getCustomFonts();
        }

        // Delete the font file from storage
        if (fontToDelete.url.startsWith('/')) {
            try {
                const filePath = path.join(process.cwd(), 'public', fontToDelete.url);
                await fs.unlink(filePath);
            } catch (error) {
                console.error(`Failed to delete font file: ${fontToDelete.url}`, error);
                // Continue with database deletion even if file deletion fails
            }
        }

        // Delete from database
        await db.customFont.delete({
            where: { name },
        });

        return getCustomFonts();
    } catch (error) {
        console.error('Failed to delete font:', error);
        throw error;
    }
}

/**
 * Get font CSS @font-face declarations for server-side rendering
 */
export async function getFontCssDeclarations(): Promise<string> {
    try {
        const fonts = await db.customFont.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
        });

        return fonts
            .map((f: typeof fonts[number]) => {
                const fontFamily = f.displayName || f.name;
                return `@font-face {
    font-family: '${fontFamily}';
    src: url('${f.url}') format('${getFontFormat(f.mimeType)}');
    font-display: swap;
}`;
            })
            .join('\n');
    } catch (error) {
        console.error('Failed to generate font CSS:', error);
        return '';
    }
}

/**
 * Determine the CSS font format from MIME type
 */
function getFontFormat(mimeType: string): string {
    const formats: Record<string, string> = {
        'font/ttf': 'truetype',
        'font/otf': 'opentype',
        'font/woff': 'woff',
        'font/woff2': 'woff2',
        'application/font-ttf': 'truetype',
        'application/font-otf': 'opentype',
        'application/font-woff': 'woff',
        'application/font-woff2': 'woff2',
    };
    return formats[mimeType] || 'truetype';
}
