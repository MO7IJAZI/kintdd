/**
 * Remove only CSS properties that cause overlapping/z-index issues
 * Keep all other styling intact, but remove custom properties and complex flexbox
 */
function removeDangerousCssProperties(
  styleStr: string,
  opts?: { preserveImageSizes?: boolean; allowPositioning?: boolean; preserveDisplay?: boolean }
): string {
  if (!styleStr || typeof styleStr !== 'string') return '';
  
  const preserveImageSizes = !!opts?.preserveImageSizes
  const allowPositioning = !!opts?.allowPositioning
  const preserveDisplay = !!opts?.preserveDisplay

  // List of dangerous properties to remove
  let dangerousProperties = [
    'z-index',
    'position',
    'top',
    'bottom',
    'left',
    'right',
    'pointer-events',
    ...(preserveDisplay ? [] : ['display']),
    'flex',
    'flex-direction',
    'flex-wrap',
    'justify-content',
    'align-items',
    'align-content',
    'gap',
    'order',
    'align-self',
    'flex-grow',
    'flex-shrink',
    'flex-basis',
    'transform',
    'transition'
  ];

  if (allowPositioning) {
    dangerousProperties = dangerousProperties.filter(p =>
      p !== 'z-index' && p !== 'position' && p !== 'top' && p !== 'bottom' && p !== 'left' && p !== 'right'
    );
  }

  if (!preserveImageSizes) {
    dangerousProperties.push(
      'height', // Remove fixed heights that cause overlapping
      'min-height',
      'max-height',
      'width', // Remove widths that might overflow
      'min-width',
      'max-width'
    );
  }
  
  // Split by semicolon and process each property
  const styles: Record<string, string> = {};
  
  styleStr.split(';').forEach(pair => {
    const colonIndex = pair.indexOf(':');
    if (colonIndex > -1) {
      const key = pair.substring(0, colonIndex).trim().toLowerCase();
      const value = pair.substring(colonIndex + 1).trim();
      
      if (key && value) {
        // Skip CSS custom properties (--variable-name)
        if (key.startsWith('--')) {
          return;
        }
        
        // Skip dangerous properties
        if (dangerousProperties.includes(key)) {
          return;
        }
        
        // Also remove negative margins and paddings
        if (key.startsWith('margin') || key.startsWith('padding')) {
          if (value.startsWith('-')) {
            return;
          }
        }
        
        // Remove transform and other complex properties
        if (key === 'transform' || key === 'transition') {
          return;
        }
        
        styles[key] = value;
      }
    }
  });
  
  // Reconstruct the style string
  return Object.entries(styles)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
    .trim();
}

export function stripScripts(html: string): string {
  const input = html ?? "";
  
  // First: Remove script tags
  let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Second: Remove style tags
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, (match) => {
    const hasKintMarker =
      /\bdata-kint-rte\s*=\s*(["'])1\1/i.test(match) ||
      /kint-wrap-|kint-behind-container|data-kint-rte/i.test(match)
    return hasKintMarker ? match : ""
  });
  
  // Third: Remove iframes and other dangerous elements
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, (match) => {
    const srcMatch = match.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)
    const src = srcMatch?.[2] ?? ""
    const isAllowed =
      /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{6,}/i.test(src) ||
      /^https:\/\/(www\.)?youtube-nocookie\.com\/embed\/[a-zA-Z0-9_-]{6,}/i.test(src) ||
      /^https:\/\/player\.vimeo\.com\/video\/[0-9]+/i.test(src)
    return isAllowed ? match : ""
  });
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  cleaned = cleaned.replace(/<embed\b[^<]*(\/?)>/gi, "");
  
  // Fourth: Remove all Elementor/builder-specific attributes except class names
  cleaned = cleaned.replace(/\s+data-(?!kint-rte\b)(?!float\b)[a-z-]*\s*=\s*(["'].*?["']|[^\s>]+)/gi, '');
  
  // Fifth: Clean dangerous style properties while keeping styling
  cleaned = cleaned.replace(/<([a-zA-Z][^>\s]*)\b([^>]*)\sstyle\s*=\s*(["'])(.*?)\3([^>]*)>/gi,
    (match, tagName, before, quote, styleValue, after) => {
      const lowerTag = tagName.toLowerCase()
      const isImg = lowerTag === 'img';
      const isMedia = lowerTag === 'img' || lowerTag === 'video' || lowerTag === 'iframe'
      const isTableish = lowerTag === 'table' || lowerTag === 'tr' || lowerTag === 'td' || lowerTag === 'th' || lowerTag === 'col' || lowerTag === 'colgroup'
      const attrs = `${before ?? ""} ${after ?? ""}`
      const allowPositioning =
        /\bclass\s*=\s*(["'])[^"']*\bkint-wrap-behind\b[^"']*\1/i.test(attrs) ||
        /\bclass\s*=\s*(["'])[^"']*\bkint-behind-container\b[^"']*\1/i.test(attrs)
      const cleanedStyle = removeDangerousCssProperties(styleValue, {
        preserveImageSizes: isMedia || isTableish,
        preserveDisplay: isMedia || isTableish,
        allowPositioning,
      });
      if (!cleanedStyle) {
        return `<${tagName}${before}${after}>`;
      }
      return `<${tagName}${before} style="${cleanedStyle}"${after}>`;
    }
  );
  
  // Sixth: Clean data-mce-style attributes
  cleaned = cleaned.replace(/\s+data-mce-style\s*=\s*(["'])(.*?)\1/gi, (match, quote, styleValue) => {
    const cleanedStyle = removeDangerousCssProperties(styleValue);
    return cleanedStyle ? ` style="${cleanedStyle}"` : '';
  });
  
  // Seventh: Remove potentially dangerous event handlers
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(["'].*?["']|[^\s>]+)/gi, '');
  
  // Eighth: Remove invalid image height attributes such as height="auto"
  cleaned = cleaned.replace(/<img\b([^>]*?)\sheight=(['"])auto\1([^>]*?)>/gi, '<img$1$2$3>');
  cleaned = cleaned.replace(/<img\b([^>]*?)\swidth=(['"])auto\1([^>]*?)>/gi, '<img$1$2$3>');
  
  return cleaned;
}
