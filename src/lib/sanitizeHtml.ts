export function stripScripts(html: string): string {
  const input = html ?? "";
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

