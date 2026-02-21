'use server';

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { auth } from "@/auth";

const getCompanyDataCached = unstable_cache(
    async () => {
        const companyData = await prisma.companyData.findFirst();

        if (!companyData) {
            return prisma.companyData.create({
                data: {
                    companyName: "KINT Kafri International",
                    companyName_ar: "KINT Kafri International",
                    ncrNumber: "0000100441",
                    vatNumber: "PL 637-011-20-65",
                    capital: "PLN 177 000",
                    capital_ar: "PLN 177 000",
                },
            });
        }

        return companyData;
    },
    ["company-data:single"],
    { revalidate: 30, tags: ["company-data"] }
);

export async function getCompanyData() {
    try {
        return await getCompanyDataCached();
    } catch (error) {
        console.error("Error fetching company data:", error);
        throw new Error("Failed to fetch company data");
    }
}

export async function updateCompanyData(data: {
    id: string;
    companyName: string;
    companyName_ar?: string | null;
    address?: string | null;
    address_ar?: string | null;
    courtInfo?: string | null;
    courtInfo_ar?: string | null;
    ncrNumber?: string | null;
    vatNumber?: string | null;
    capital?: string | null;
    capital_ar?: string | null;
}) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    try {
        const { id, ...updateData } = data;
        
        await prisma.companyData.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/about/company-data');
        revalidatePath('/ar/about/company-data');
        revalidatePath('/en/about/company-data');
        revalidateTag("company-data", { expire: 0 });
        
        return { success: true };
    } catch (error) {
        console.error("Error updating company data:", error);
        return { success: false, error: "Failed to update company data" };
    }
}
