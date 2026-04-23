/**
 * Font Styles Manager
 * Utility for managing and applying custom font styles to rendered HTML content
 * This ensures custom fonts are properly available when displaying rich text content
 */

import { getFontCssDeclarations } from './fontManager'

/**
 * Get all custom font CSS declarations
 * Used for server-side rendering and styling
 */
export async function getCustomFontStyles(): Promise<string> {
    return await getFontCssDeclarations()
}

/**
 * Wrap content with font styles for a complete styled HTML document
 * Useful for generating styled PDFs or standalone HTML documents
 */
export async function wrapContentWithFontStyles(html: string): Promise<string> {
    const fontStyles = await getCustomFontStyles()
    
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        ${fontStyles}
        body {
            font-family: Inter, system-ui, sans-serif;
            line-height: 1.7;
            color: #334155;
            padding: 20px;
        }
        img, video, iframe {
            max-width: 100%;
            height: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            border: 1px solid #64748b;
        }
        table th, table td {
            padding: 10px 12px;
            border: 1px solid #64748b;
        }
        table th {
            background: #f8fafc;
            font-weight: 700;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`
}

/**
 * Get font list as CSS font-family options
 * Used for form select options in admin panels
 */
export async function getFontOptions(): Promise<{ value: string; label: string }[]> {
    const { prisma } = await import('./prisma')
    
    try {
        const fonts = await prisma.customFont.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
            select: { name: true, displayName: true },
        })
        
        return fonts.map(f => ({
            value: f.name,
            label: f.displayName || f.name,
        }))
    } catch (error) {
        console.error('Failed to fetch font options:', error)
        return []
    }
}

/**
 * Verify that all fonts in content are available in the database
 * Returns missing fonts if any
 */
export async function verifyContentFonts(html: string): Promise<string[]> {
    const { prisma } = await import('./prisma')
    
    // Extract font families used in the HTML
    const fontRegex = /font-family\s*:\s*['"]?([^'";\n]+)['"]?[;]/g
    const foundFonts = new Set<string>()
    let match
    
    while ((match = fontRegex.exec(html)) !== null) {
        const fontName = match[1].trim().replace(/^['"]|['"]$/g, '')
        foundFonts.add(fontName)
    }
    
    if (foundFonts.size === 0) {
        return []
    }
    
    // Check which fonts are in the database
    const dbFonts = await prisma.customFont.findMany({
        where: { isActive: true },
        select: { name: true },
    })
    
    const dbFontNames = new Set(dbFonts.map(f => f.name))
    const missingFonts = Array.from(foundFonts).filter(f => !dbFontNames.has(f))
    
    return missingFonts
}
