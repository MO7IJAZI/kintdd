'use client'

import { useEffect, useState } from 'react'

interface CustomFontData {
  name: string
  url: string
  displayName?: string
}

/**
 * Loads custom fonts from the database and injects them as @font-face CSS
 * This component should be placed in the app layout for global font availability
 */
export default function CustomFontsLoader() {
  const [css, setCss] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const response = await fetch('/api/fonts')
        if (!response.ok) throw new Error('Failed to fetch fonts')
        
        const data = (await response.json()) as CustomFontData[]
        
        if (Array.isArray(data) && data.length > 0) {
          // Generate @font-face CSS with proper font format detection
          const fontFaceCss = data
            .map(f => {
              const fontFamily = f.displayName || f.name
              const fontFormat = detectFontFormat(f.url)
              return `@font-face {
  font-family: '${fontFamily}';
  src: url('${f.url}') format('${fontFormat}');
  font-display: swap;
}`
            })
            .join('\n')
          
          setCss(fontFaceCss)
        }
      } catch (err) {
        console.error('Error loading custom fonts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load fonts')
      }
    }

    loadFonts()
  }, [])

  if (error) {
    console.warn(`CustomFontsLoader: ${error}`)
  }

  if (!css) return null

  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      suppressHydrationWarning
    />
  )
}

/**
 * Detect font format from file extension
 */
function detectFontFormat(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase()
  const formats: Record<string, string> = {
    'ttf': 'truetype',
    'otf': 'opentype',
    'woff': 'woff',
    'woff2': 'woff2',
    'eot': 'embedded-opentype',
  }
  return formats[ext || 'ttf'] || 'truetype'
}
