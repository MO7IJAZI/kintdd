import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import prisma from "@/lib/prisma";

export default async function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let productCategories: any[] = [];

    try {
        productCategories = await prisma.category.findMany({
            where: { 
                isActive: true, 
                parentId: null,
                NOT: {
                    slug: {
                        in: ['animal', 'vet', 'crop-guides', 'by-animal']
                    }
                }
            },
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
            select: {
                id: true,
                name: true,
                name_ar: true,
                slug: true,
                description: true,
                description_ar: true,
                children: {
                    where: { isActive: true },
                    orderBy: [{ order: 'asc' }, { name: 'asc' }],
                    select: {
                        id: true,
                        name: true,
                        name_ar: true,
                        slug: true,
                    }
                }
            }
        });
    } catch (error) {
        console.error("Public layout categories load failed:", error);
    }

    return (
        <>
            <Header productCategories={productCategories} />
            <main style={{ minHeight: 'calc(100vh - 350px)', paddingTop: '80px' }}>
                {children}
            </main>
            <Footer />
        </>
    );
}
