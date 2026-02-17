import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

export default async function StaticPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
    const { slug, locale } = await params;
    const isRtl = locale === 'ar';

    const page = await prisma.page.findUnique({
        where: { slug }
    });

    if (!page) {
        notFound();
    }

    const title = (isRtl && page.title_ar) ? page.title_ar : page.title;
    const content = (isRtl && page.content_ar) ? page.content_ar : page.content;

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Page Header */}
            <section style={{
                backgroundColor: 'var(--foreground)',
                padding: '6rem 0',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{title}</h1>
                </div>
            </section>

            <section className="section">
                <div className="container" style={{ maxWidth: '900px' }}>
                    <div
                        style={{
                            fontSize: '1.2rem',
                            lineHeight: '1.8',
                            color: 'var(--foreground)',
                            whiteSpace: 'pre-wrap'
                        }}
                        dangerouslySetInnerHTML={{ __html: content || '' }}
                    />
                </div>
            </section>
        </div>
    );
}
