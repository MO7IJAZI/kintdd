import fs from 'fs/promises';
import path from 'path';

export interface CustomFont {
    name: string;
    url: string;
}

const FONTS_FILE = path.join(process.cwd(), 'public', 'custom-fonts.json');

export async function getCustomFonts(): Promise<CustomFont[]> {
    try {
        const data = await fs.readFile(FONTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export async function saveCustomFont(font: CustomFont): Promise<CustomFont[]> {
    const fonts = await getCustomFonts();
    const updated = [...fonts.filter(f => f.name !== font.name), font];
    await fs.mkdir(path.dirname(FONTS_FILE), { recursive: true });
    await fs.writeFile(FONTS_FILE, JSON.stringify(updated, null, 2));
    return updated;
}

export async function deleteCustomFont(name: string): Promise<CustomFont[]> {
    const fonts = await getCustomFonts();
    const updated = fonts.filter(f => f.name !== name);
    await fs.writeFile(FONTS_FILE, JSON.stringify(updated, null, 2));
    return updated;
}
