import { NextRequest, NextResponse } from "next/server";

type TranslateBody = {
  q: string | string[];
  source?: string;
  target?: string;
  format?: "text" | "html";
};

const MAX_QUERY_CHARS = 450;

function splitByLength(text: string, maxLen: number) {
  if (text.length <= maxLen) return [text];
  const out: string[] = [];
  for (let i = 0; i < text.length; i += maxLen) {
    out.push(text.slice(i, i + maxLen));
  }
  return out;
}

async function translateTextInChunks(args: {
  endpoints: string[];
  q: string;
  source: string;
  target: string;
}) {
  const chunks = splitByLength(args.q, MAX_QUERY_CHARS);
  if (chunks.length === 1) {
    return translateOne({
      endpoints: args.endpoints,
      q: args.q,
      source: args.source,
      target: args.target,
      format: "text",
    });
  }
  const translatedChunks: string[] = [];
  for (const chunk of chunks) {
    translatedChunks.push(
      await translateOne({
        endpoints: args.endpoints,
        q: chunk,
        source: args.source,
        target: args.target,
        format: "text",
      })
    );
  }
  return translatedChunks.join("");
}

async function translateHtmlSafe(args: {
  endpoints: string[];
  q: string;
  source: string;
  target: string;
}) {
  if (args.q.length <= MAX_QUERY_CHARS) {
    return translateOne({
      endpoints: args.endpoints,
      q: args.q,
      source: args.source,
      target: args.target,
      format: "html",
    });
  }
  const plain = stripHtmlToText(args.q);
  if (!plain) return "";
  const translated = await translateTextInChunks({
    endpoints: args.endpoints,
    q: plain,
    source: args.source,
    target: args.target,
  });
  const safe = escapeHtml(translated).replace(/\n/g, "<br/>");
  return `<p>${safe}</p>`;
}

async function translateWithGoogle(args: {
  q: string | string[];
  source: string;
  target: string;
  format: "text" | "html";
}) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const url = new URL("https://translation.googleapis.com/language/translate/v2");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: args.q,
        source: args.source,
        target: args.target,
        format: args.format,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const json = (await res.json().catch(() => null)) as
      | {
          data?: { translations?: Array<{ translatedText?: string }> };
          error?: { message?: string };
        }
      | null;

    if (!res.ok) {
      const msg = json?.error?.message || `HTTP ${res.status}`;
      throw new Error(`[google] ${msg}`);
    }

    const translations = json?.data?.translations;
    if (!Array.isArray(translations)) {
      throw new Error("[google] Invalid response from translation service");
    }

    const out = translations.map((t) => t.translatedText || "");
    return Array.isArray(args.q) ? out : out[0] || "";
  } finally {
    clearTimeout(timeout);
  }
}

async function translateWithEndpoint(args: {
  endpoint: string;
  q: string;
  source: string;
  target: string;
  format: "text" | "html";
}) {
  const apiKey = process.env.LIBRETRANSLATE_API_KEY;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const body = {
    q: args.q,
    source: args.source,
    target: args.target,
    format: args.format,
    api_key: apiKey || undefined,
  };

  try {
    const res = await fetch(args.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    const json = (await res.json().catch(() => null)) as
      | { translatedText?: string; error?: string }
      | null;

    if (!res.ok) {
      const msg =
        (json && ("error" in json ? json.error : undefined)) ||
        `HTTP ${res.status}`;
      throw new Error(`[${args.endpoint}] ${msg}`);
    }

    if (!json || typeof json.translatedText !== "string") {
      throw new Error(`[${args.endpoint}] Invalid response from translation service`);
    }

    return json.translatedText;
  } finally {
    clearTimeout(timeout);
  }
}

async function translateWithMyMemory(args: {
  q: string;
  source: string;
  target: string;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", args.q);
    url.searchParams.set("langpair", `${args.source}|${args.target}`);
    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    const json = (await res.json().catch(() => null)) as
      | { responseData?: { translatedText?: string } }
      | null;
    const translatedText = json?.responseData?.translatedText;
    if (!res.ok || typeof translatedText !== "string") {
      throw new Error(`[mymemory] HTTP ${res.status}`);
    }
    return translatedText;
  } finally {
    clearTimeout(timeout);
  }
}

function stripHtmlToText(html: string) {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|h[1-6])\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "- ")
    .replace(/<\/\s*li\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function translateOne(args: {
  endpoints: string[];
  q: string;
  source: string;
  target: string;
  format: "text" | "html";
}) {
  let lastError: unknown = null;
  try {
    const g = await translateWithGoogle({
      q: args.q,
      source: args.source,
      target: args.target,
      format: args.format,
    });
    if (typeof g === "string") return g;
  } catch (e) {
    lastError = e;
  }
  for (const endpoint of args.endpoints) {
    try {
      return await translateWithEndpoint({
        endpoint,
        q: args.q,
        source: args.source,
        target: args.target,
        format: args.format,
      });
    } catch (e) {
      lastError = e;
    }
  }
  if (args.format === "text") {
    try {
      return await translateWithMyMemory({
        q: args.q,
        source: args.source,
        target: args.target,
      });
    } catch (e) {
      lastError = e;
    }
  }

  if (args.format === "html") {
    try {
      const plain = stripHtmlToText(args.q);
      if (!plain) return "";
      const translated = await translateWithMyMemory({
        q: plain,
        source: args.source,
        target: args.target,
      });
      const safe = escapeHtml(translated).replace(/\n/g, "<br/>");
      return `<p>${safe}</p>`;
    } catch (e) {
      lastError = e;
    }
  }

  const tail = lastError instanceof Error ? lastError.message : "Translation failed";
  throw new Error(tail);
}

function getEndpoints() {
  const fromEnv = process.env.LIBRETRANSLATE_URLS || process.env.LIBRETRANSLATE_URL;
  const envEndpoints = fromEnv
    ? fromEnv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const defaults = [
    "https://translate.astian.org/translate",
    "https://libretranslate.de/translate",
    "https://libretranslate.com/translate",
    "http://localhost:5000/translate",
  ];

  return [...envEndpoints, ...defaults].filter(Boolean);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TranslateBody;

    const q = body?.q;
    const source = body?.source || "ar";
    const target = body?.target || "en";
    const format = body?.format || "text";

    if (!q || (Array.isArray(q) && q.length === 0)) {
      return NextResponse.json({ error: "Missing q" }, { status: 400 });
    }

    const endpoints = getEndpoints();

    if (Array.isArray(q)) {
      try {
        const g = await translateWithGoogle({ q, source, target, format });
        if (Array.isArray(g)) {
          return NextResponse.json({ translatedText: g });
        }
      } catch {
      }
      const translated = await Promise.all(
        q.map((item) => {
          if (format === "html") {
            return translateHtmlSafe({ endpoints, q: item, source, target });
          }
          if (item.length > MAX_QUERY_CHARS) {
            return translateTextInChunks({ endpoints, q: item, source, target });
          }
          return translateOne({ endpoints, q: item, source, target, format });
        })
      );
      return NextResponse.json({ translatedText: translated });
    }

    const translatedText =
      format === "html"
        ? await translateHtmlSafe({ endpoints, q, source, target })
        : q.length > MAX_QUERY_CHARS
          ? await translateTextInChunks({ endpoints, q, source, target })
          : await translateOne({ endpoints, q, source, target, format });

    return NextResponse.json({ translatedText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to translate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
