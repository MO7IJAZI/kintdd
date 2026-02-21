import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { generateOrganizationSchema } from "@/lib/seoUtils";
import Hero from "@/components/home/Hero";
import FeaturesSection from "@/components/home/FeaturesSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import MissionSection from "@/components/home/MissionSection";
import AgentsMarquee from "@/components/home/AgentsMarquee";
import ArticlesSection from "@/components/home/ArticlesSection";
import WhyUsSection from "@/components/home/WhyUsSection";

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'KINT - Integrated Agricultural Solutions',
  description: 'Transform your agricultural enterprise with KINT\'s premium products and expert guidance for plant and animal wealth.',
  keywords: ['agricultural solutions', 'fertilizers', 'agriculture', 'farming', 'plant care', 'animal health'],
  openGraph: {
    title: 'KINT - Integrated Agricultural Solutions',
    description: 'Transform your agricultural enterprise with KINT\'s premium products and expert guidance.',
    type: 'website',
    locale: 'ar_SA',
    url: 'https://kint.sa'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KINT - Integrated Agricultural Solutions',
    description: 'Transform your agricultural enterprise with KINT\'s premium products and expert guidance.'
  }
};

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  let news: any[] = [];
  let featuredProducts: any[] = [];

  try {
    [news, featuredProducts] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        take: 3
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: { order: 'asc' },
        take: 8,
        include: { category: true }
      })
    ]);
  } catch (error) {
    console.error("Homepage data load failed:", error);
  }

  return (
    <div style={{ direction: isAr ? 'rtl' : 'ltr', overflowX: 'hidden' }}>
      {/* JSON-LD Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema())
        }}
      />

      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Features Section */}
      <FeaturesSection />

      {/* 3. Products Categories & Slider */}
      <CategoriesSection products={featuredProducts} />

      {/* 6. Stats Section Removed */}

      {/* 7. Mission / Video */}
      <MissionSection />

      {/* 8. Articles Section */}
      <ArticlesSection news={news} />

      {/* 9. Why Us Section */}
      <WhyUsSection />

      {/* 11. Agents Section */}
      <AgentsMarquee />
    </div>
  );
}
