export function stripScripts(html: string): string {
  const input = html ?? "";
  const withoutScripts = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  return withoutScripts.replace(
    /<([a-z0-9-]+)([^>]*?)\sdata-mce-style=(["'])(.*?)\3([^>]*)>/gi,
    (_full, tag, before, _quote, mceStyle, after) => {
      const attrs = `${before}${after}`;
      if (/style\s*=/i.test(attrs)) {
        const merged = attrs.replace(
          /style=(["'])(.*?)\1/i,
          (_styleFull, styleQuote, styleValue) => {
            const base = String(styleValue || '').trim();
            const sep = base.endsWith(';') || base.length === 0 ? '' : ';';
            return `style=${styleQuote}${base}${sep} ${mceStyle}${styleQuote}`;
          }
        );
        return `<${tag}${merged}>`;
      }
      return `<${tag}${before} style="` + mceStyle + `"${after}>`;
    }
  );
}
