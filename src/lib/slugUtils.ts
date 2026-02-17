// Utility function to generate URL-friendly slugs with Arabic support
export function generateSlug(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        // Handle Arabic characters by transliterating to Latin equivalents
        .replace(/[أإآ]/g, 'a')         // Arabic alef variations
        .replace(/ب/g, 'b')
        .replace(/ت/g, 't')
        .replace(/ث/g, 'th')
        .replace(/ج/g, 'j')
        .replace(/ح/g, 'h')
        .replace(/خ/g, 'kh')
        .replace(/د/g, 'd')
        .replace(/ذ/g, 'dh')
        .replace(/ر/g, 'r')
        .replace(/ز/g, 'z')
        .replace(/س/g, 's')
        .replace(/ش/g, 'sh')
        .replace(/ص/g, 's')
        .replace(/ض/g, 'd')
        .replace(/ط/g, 't')
        .replace(/ظ/g, 'z')
        .replace(/ع/g, 'a')
        .replace(/غ/g, 'gh')
        .replace(/ف/g, 'f')
        .replace(/ق/g, 'q')
        .replace(/ك/g, 'k')
        .replace(/ل/g, 'l')
        .replace(/م/g, 'm')
        .replace(/ن/g, 'n')
        .replace(/ه/g, 'h')
        .replace(/و/g, 'w')
        .replace(/ي/g, 'y')
        .replace(/ة/g, 'h')             // Ta marbuta
        .replace(/ى/g, 'a')             // Alif maqsura
        .replace(/ئ/g, 'e')
        .replace(/ء/g, 'a')
        .replace(/ؤ/g, 'w')
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

// Check if slug exists - tries to append numbers if needed
export async function generateUniqueSlug(text: string, checkExists: (slug: string) => Promise<boolean>): Promise<string> {
    const baseSlug = generateSlug(text);
    let slug = baseSlug;
    let counter = 1;

    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

// Auto-generate slug based on language preference (Arabic or English)
export function generateAutoSlug(titleEn: string, titleAr?: string, currentLang: string = 'en'): string {
    // Use Arabic title if available and current language is Arabic
    if (currentLang === 'ar' && titleAr && titleAr.trim()) {
        return generateSlug(titleAr);
    }
    // Fallback to English title
    return generateSlug(titleEn);
}

// Auto-generate unique slug with language support
export async function generateAutoUniqueSlug(
    titleEn: string, 
    titleAr: string = '', 
    currentLang: string = 'en', 
    checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
    const baseSlug = generateAutoSlug(titleEn, titleAr, currentLang);
    let slug = baseSlug;
    let counter = 1;

    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}
