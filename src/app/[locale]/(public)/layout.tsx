import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCachedProductCategories } from "@/lib/data";

export default async function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const productCategories = await getCachedProductCategories();

    return (
        <>
            <Header productCategories={productCategories} />
            <main style={{ minHeight: 'calc(100vh - 350px)' }}>
                {children}
            </main>
            <Footer />
        </>
    );
}
