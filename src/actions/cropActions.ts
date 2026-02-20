"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { generateUniqueSlug } from "@/lib/slugUtils";

const MAX_QUERY_CHARS = 450;

async function translateMyMemory(q: string, source: string, target: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const url = new URL("https://api.mymemory.translated.net/get");
        url.searchParams.set("q", q);
        url.searchParams.set("langpair", `${source}|${target}`);
        const res = await fetch(url.toString(), { method: "GET", cache: "no-store", signal: controller.signal });
        const json = (await res.json().catch(() => null)) as { responseData?: { translatedText?: string } } | null;
        const out = json?.responseData?.translatedText;
        if (!res.ok || typeof out !== "string") throw new Error(`HTTP ${res.status}`);
        return out;
    } catch {
        return "";
    } finally {
        clearTimeout(timeout);
    }
}

function splitByLength(text: string, maxLen: number) {
    if (text.length <= maxLen) return [text];
    const out: string[] = [];
    for (let i = 0; i < text.length; i += maxLen) {
        out.push(text.slice(i, i + maxLen));
    }
    return out;
}

async function translateTextInChunks(q: string, source: string, target: string) {
    const chunks = splitByLength(q, MAX_QUERY_CHARS);
    if (chunks.length === 1) {
        return (await translateMyMemory(q, source, target)) || "";
    }
    let out = "";
    for (const chunk of chunks) {
        out += (await translateMyMemory(chunk, source, target)) || "";
    }
    return out;
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

async function translateHtmlSafe(q: string, source: string, target: string) {
    const plain = stripHtmlToText(q);
    if (!plain) return "";
    const translated =
        plain.length > MAX_QUERY_CHARS
            ? await translateTextInChunks(plain, source, target)
            : await translateMyMemory(plain, source, target);
    if (!translated) return "";
    const safe = escapeHtml(translated).replace(/\n/g, "<br/>");
    return `<p>${safe}</p>`;
}

async function translateTextSafe(q: string, source: string, target: string) {
    if (q.length > MAX_QUERY_CHARS) {
        return await translateTextInChunks(q, source, target);
    }
    return (await translateMyMemory(q, source, target)) || "";
}

interface StageInput {
    name: string;
    name_ar?: string;
    description?: string;
    description_ar?: string;
    products: string[];
}

export async function createCrop(formData: FormData) {
    const rawName = formData.get("name");
    const rawNameAr = formData.get("name_ar");
    const rawSlug = formData.get("slug");
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const name_ar = typeof rawNameAr === "string" ? rawNameAr.trim() : "";
    const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";
    const category = formData.get("category") as string;
    let category_ar = formData.get("category_ar") as string;
    const rawDesc = formData.get("description");
    const rawDescAr = formData.get("description_ar");
    const description = typeof rawDesc === "string" ? rawDesc : "";
    const description_ar = typeof rawDescAr === "string" ? rawDescAr : "";
    const harvestSeason_ar_raw = formData.get("harvestSeason_ar");
    const harvestSeason_ar = typeof harvestSeason_ar_raw === "string" && harvestSeason_ar_raw.trim() ? harvestSeason_ar_raw : null;
    const image = formData.get("image") as string;
    const pdfUrl = formData.get("pdfUrl") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaTitle_ar = formData.get("metaTitle_ar") as string;
    
    const productIdsStr = formData.get("productIds") as string;
    const productIds = productIdsStr ? (JSON.parse(productIdsStr) as string[]) : [];

    const stagesStr = formData.get("stages") as string;
    const stages = stagesStr ? (JSON.parse(stagesStr) as StageInput[]) : [];

    const CATEGORY_AR_MAP: Record<string, string> = {
        vegetables: "الخضروات",
        fruits: "الفواكه",
        legumes: "البقوليات",
        cereals: "الحبوب",
        industrial: "الصناعية",
        herbs: "الأعشاب",
    };
    category_ar = category_ar || CATEGORY_AR_MAP[category] || null as any;

    const finalName = name || name_ar || "Untitled Crop";
    const finalNameAr = name_ar || null;
    let finalDesc = description || "";
    let finalDescAr = description_ar || "";

    if (finalDesc && !finalDescAr) {
        finalDescAr = await translateHtmlSafe(finalDesc, "en", "ar");
    } else if (finalDescAr && !finalDesc) {
        finalDesc = await translateHtmlSafe(finalDescAr, "ar", "en");
    }
    if (!finalDesc) finalDesc = null as any;
    if (!finalDescAr) finalDescAr = null as any;

    const safeSlug = await generateUniqueSlug(slug || finalName, async (s) => {
        const found = await prisma.crop.findUnique({ where: { slug: s }, select: { id: true } });
        return !!found;
    });

    let finalSlug = safeSlug;
    try {
        await prisma.crop.create({
            data: {
                name: finalName,
                name_ar: finalNameAr,
                slug: finalSlug,
                category,
                category_ar,
                description: finalDesc,
                description_ar: finalDescAr,
                harvestSeason_ar,
                image,
                pdfUrl,
                metaTitle,
                metaTitle_ar,
                recommendedProducts: {
                    connect: productIds.map((id: string) => ({ id }))
                },
                stages: {
                    create: await Promise.all(
                        stages.map(async (s, index) => {
                            let n = s.name || "";
                            let nAr = s.name_ar || "";
                            if (n && !nAr) nAr = await translateTextSafe(n, "en", "ar");
                            else if (nAr && !n) n = await translateTextSafe(nAr, "ar", "en");
                            let d = s.description || "";
                            let dAr = s.description_ar || "";
                            if (d && !dAr) dAr = await translateHtmlSafe(d, "en", "ar");
                            else if (dAr && !d) d = await translateHtmlSafe(dAr, "ar", "en");
                            return {
                                name: n,
                                name_ar: nAr || null,
                                description: d || null,
                                description_ar: dAr || null,
                                order: index,
                                recommendation: { products: s.products },
                            };
                        })
                    )
                }
            },
        });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            let counter = 1;
            while (await prisma.crop.findUnique({ where: { slug: `${finalSlug}-${counter}` }, select: { id: true } })) {
                counter++;
            }
            finalSlug = `${finalSlug}-${counter}`;
            await prisma.crop.create({
                data: {
                    name: finalName,
                    name_ar: finalNameAr,
                    slug: finalSlug,
                    category,
                    category_ar,
                    description: finalDesc,
                    description_ar: finalDescAr,
                    harvestSeason_ar,
                    image,
                    pdfUrl,
                    metaTitle,
                    metaTitle_ar,
                    recommendedProducts: {
                        connect: productIds.map((id: string) => ({ id }))
                    },
                    stages: {
                        create: await Promise.all(
                            stages.map(async (s, index) => {
                                let n = s.name || "";
                                let nAr = s.name_ar || "";
                                if (n && !nAr) nAr = await translateTextSafe(n, "en", "ar");
                                else if (nAr && !n) n = await translateTextSafe(nAr, "ar", "en");
                                let d = s.description || "";
                                let dAr = s.description_ar || "";
                                if (d && !dAr) dAr = await translateHtmlSafe(d, "en", "ar");
                                else if (dAr && !d) d = await translateHtmlSafe(dAr, "ar", "en");
                                return {
                                    name: n,
                                    name_ar: nAr || null,
                                    description: d || null,
                                    description_ar: dAr || null,
                                    order: index,
                                    recommendation: { products: s.products },
                                };
                            })
                        )
                    }
                },
            });
        } else {
            throw error;
        }
    }

    revalidatePath("/admin/crops");
    revalidatePath("/crop-farming");
    revalidateTag("crops", { expire: 0 });
}

const getCropsCached = unstable_cache(
    async () =>
        prisma.crop.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: {
                        stages: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
    ["crops:list"],
    { revalidate: 10, tags: ["crops"] }
);

const getCropBySlugCached = unstable_cache(
    async (slug: string) =>
        prisma.crop.findUnique({
            where: { slug },
            include: {
                stages: {
                    orderBy: { order: "asc" },
                },
                recommendedProducts: true,
            },
        }),
    ["crops:by-slug"],
    { revalidate: 10, tags: ["crops"] }
);

const getCropByIdCached = unstable_cache(
    async (id: string) =>
        prisma.crop.findUnique({
            where: { id },
            include: {
                stages: { orderBy: { order: "asc" } },
                recommendedProducts: true,
            },
        }),
    ["crops:by-id"],
    { revalidate: 10, tags: ["crops"] }
);

export async function getCrops() {
    return getCropsCached();
}

export async function getCropBySlug(slug: string) {
    return getCropBySlugCached(slug);
}
export async function getCropById(id: string) {
    return getCropByIdCached(id);
}

export async function updateCrop(id: string, formData: FormData) {
    const rawName = formData.get("name");
    const rawNameAr = formData.get("name_ar");
    const rawSlug = formData.get("slug");
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const name_ar = typeof rawNameAr === "string" ? rawNameAr.trim() : "";
    const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";
    const category = formData.get("category") as string;
    let category_ar = formData.get("category_ar") as string;
    const rawDesc = formData.get("description");
    const rawDescAr = formData.get("description_ar");
    const description = typeof rawDesc === "string" ? rawDesc : "";
    const description_ar = typeof rawDescAr === "string" ? rawDescAr : "";
    const harvestSeason_ar_raw = formData.get("harvestSeason_ar");
    const harvestSeason_ar = typeof harvestSeason_ar_raw === "string" && harvestSeason_ar_raw.trim() ? harvestSeason_ar_raw : null;
    const image = formData.get("image") as string;
    const pdfUrl = formData.get("pdfUrl") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaTitle_ar = formData.get("metaTitle_ar") as string;
    
    const productIdsStr = formData.get("productIds") as string;
    const productIds = productIdsStr ? (JSON.parse(productIdsStr) as string[]) : [];

    const stagesStr = formData.get("stages") as string;
    const stages = stagesStr ? (JSON.parse(stagesStr) as StageInput[]) : [];

    const CATEGORY_AR_MAP: Record<string, string> = {
        vegetables: "الخضروات",
        fruits: "الفواكه",
        legumes: "البقوليات",
        cereals: "الحبوب",
        industrial: "الصناعية",
        herbs: "الأعشاب",
    };
    category_ar = category_ar || CATEGORY_AR_MAP[category] || null as any;

    const finalName = name || name_ar || "Untitled Crop";
    const finalNameAr = name_ar || null;
    let finalDesc = description || "";
    let finalDescAr = description_ar || "";

    if (finalDesc && !finalDescAr) {
        finalDescAr = await translateHtmlSafe(finalDesc, "en", "ar");
    } else if (finalDescAr && !finalDesc) {
        finalDesc = await translateHtmlSafe(finalDescAr, "ar", "en");
    }
    if (!finalDesc) finalDesc = null as any;
    if (!finalDescAr) finalDescAr = null as any;

    const safeSlug = await generateUniqueSlug(slug || finalName, async (s) => {
        const found = await prisma.crop.findUnique({ where: { slug: s }, select: { id: true } });
        return !!found && found.id !== id;
    });

    await prisma.crop.update({
        where: { id },
        data: {
            name: finalName,
            name_ar: finalNameAr,
            slug: safeSlug,
            category,
            category_ar,
            description: finalDesc,
            description_ar: finalDescAr,
            harvestSeason_ar,
            image,
            pdfUrl,
            metaTitle,
            metaTitle_ar,
            recommendedProducts: {
                set: productIds.map((id: string) => ({ id }))
            },
            stages: {
                deleteMany: {},
                create: await Promise.all(
                    stages.map(async (s, index) => {
                        let n = s.name || "";
                        let nAr = s.name_ar || "";
                        if (n && !nAr) nAr = await translateTextSafe(n, "en", "ar");
                        else if (nAr && !n) n = await translateTextSafe(nAr, "ar", "en");
                        let d = s.description || "";
                        let dAr = s.description_ar || "";
                        if (d && !dAr) dAr = await translateHtmlSafe(d, "en", "ar");
                        else if (dAr && !d) d = await translateHtmlSafe(dAr, "ar", "en");
                        return {
                            name: n,
                            name_ar: nAr || null,
                            description: d || null,
                            description_ar: dAr || null,
                            order: index,
                            recommendation: { products: s.products },
                        };
                    })
                )
            }
        },
    });

    revalidatePath("/admin/crops");
    revalidatePath("/crop-farming");
    revalidatePath(`/crops/${safeSlug}`);
    revalidateTag("crops", { expire: 0 });
}

export async function deleteCrop(id: string) {
    await prisma.crop.delete({
        where: { id },
    });

    revalidatePath("/admin/crops");
    revalidatePath("/crop-farming");
    revalidateTag("crops", { expire: 0 });
}
