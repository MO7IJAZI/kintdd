import prisma from "@/lib/prisma";
import CropGuidesList from "@/components/CropGuidesList";

export const revalidate = 300;

export default async function CropsPage() {
    const crops = await prisma.crop.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            name_ar: true,
            slug: true,
            metaTitle: true,
            description: true,
            description_ar: true,
            image: true,
            category: true,
            category_ar: true
        }
    });

    return <CropGuidesList initialCrops={crops} />;
}
