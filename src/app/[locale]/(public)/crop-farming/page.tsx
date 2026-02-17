import prisma from "@/lib/prisma";
import CropGuidesList from "@/components/CropGuidesList";

export const revalidate = 300;

export default async function CropFarmingPage() {
    // Fetch all active crops from DB
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
            image: true
        }
    });

    return <CropGuidesList initialCrops={crops} />;
}
