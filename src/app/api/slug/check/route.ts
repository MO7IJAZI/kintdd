import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug");
    const type = searchParams.get("type"); // blog, product, category, crop, page, expert-article
    const excludeId = searchParams.get("excludeId"); // For editing, exclude current item

    if (!slug || !type) {
        return NextResponse.json({ error: "Missing slug or type" }, { status: 400 });
    }

    let exists = false;

    switch (type) {
        case "blog":
            exists = await prisma.blogPost.findFirst({
                where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
            }) !== null;
            break;
        case "product":
            exists = await prisma.product.findFirst({
                where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
            }) !== null;
            break;
        case "category":
            exists = await prisma.category.findFirst({
                where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
            }) !== null;
            break;
        case "crop":
            exists = await prisma.crop.findFirst({
                where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
            }) !== null;
            break;
        case "page":
            exists = await prisma.page.findFirst({
                where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
            }) !== null;
            break;
        case "expert-article":
            exists = await prisma.expertArticle.findFirst({
                where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
            }) !== null;
            break;
        default:
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ exists });
}
