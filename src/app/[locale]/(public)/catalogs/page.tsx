import prisma from "@/lib/prisma";
import { getTranslations, getLocale } from 'next-intl/server';
import {
    FileDown, BookOpen, Download, Table,
    Leaf, FileText, Layers, MoreHorizontal, Eye, Wrench
} from 'lucide-react';

export const revalidate = 3600;

/* ═══════════════════════════════════════════════════════════
   Color scheme resolver
   primary  → rose/pink  (#e9496c)
   secondary → navy/dark  (#142346)
═══════════════════════════════════════════════════════════ */
type ColorScheme = 'primary' | 'secondary';

function getSchemeColors(scheme: ColorScheme) {
    if (scheme === 'secondary') {
        return {
            main:    '#142346',
            hover:   '#1c2f5d',
            light:   '#e8ecf5',
            iconBg:  '#dde3f0',
        };
    }
    return {
        main:    '#e9496c',
        hover:   '#d93e60',
        light:   '#fde8ee',
        iconBg:  '#fce0e8',
    };
}

/* ═══════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════ */
export default async function CatalogsPage() {
    const locale = await getLocale();
    const t = await getTranslations('Catalogs');
    const isAr = locale === 'ar';

    let catalogs: any[] = [];
    let mixingTable: any = null;
    let documents: any[] = [];

    try {
        catalogs = await prisma.catalog.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });

        mixingTable = await prisma.document.findFirst({
            where: { category: 'mixing-table', isActive: true },
        });

        documents = await prisma.document.findMany({
            where: { isActive: true, category: { not: 'mixing-table' } },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        console.error('Failed to fetch catalogs:', error);
    }

    const agriCatalogs      = catalogs.filter(c => c.category === 'agricultural');
    const animalCatalogs    = catalogs.filter(c => c.category === 'animal');
    const technicalCatalogs = catalogs.filter(c => c.category === 'technical');

    const groupedDocuments = documents.reduce((acc, doc) => {
        if (!acc[doc.category]) acc[doc.category] = [];
        acc[doc.category].push(doc);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div style={{ direction: isAr ? 'rtl' : 'ltr', minHeight: '100vh', backgroundColor: '#fcfcfc' }}>

            {/* ── Hero ── */}
            <section style={{
                padding: '8rem 0 6rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                        marginBottom: '1.5rem',
                        fontWeight: 900,
                        color: '#0f172a',
                        letterSpacing: '-0.02em',
                    }}>
                        {t('title')}
                    </h1>
                    <p style={{
                        color: '#64748b',
                        fontSize: '1.25rem',
                        maxWidth: '700px',
                        margin: '0 auto',
                        lineHeight: 1.6,
                        fontWeight: 500,
                    }}>
                        {t('subtitle')}
                    </p>
                </div>
                <div style={{
                    position: 'absolute', top: '-10%', right: '-5%',
                    width: '400px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(233,73,108,0.05) 0%, rgba(255,255,255,0) 70%)',
                }} />
            </section>

            {/* ── Catalog sections ── */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container">

                    {/* Agricultural — primary (pink) */}
                    <div style={{ marginBottom: '6rem' }}>
                        <SectionHeader
                            icon={<BookOpen size={32} color="#e9496c" />}
                            title={t('agricultural')}
                            accentColor="#e9496c"
                        />
                        {agriCatalogs.length > 0 ? (
                            <CatalogGrid>
                                {agriCatalogs.map(catalog => (
                                    <CatalogCard
                                        key={catalog.id}
                                        catalog={catalog}
                                        t={t}
                                        isAr={isAr}
                                        locale={locale}
                                        colorScheme="primary"
                                    />
                                ))}
                            </CatalogGrid>
                        ) : (
                            <EmptyState label={t('noCatalogs')} />
                        )}
                    </div>

                    {/* Animal — secondary (navy) */}
                    <div style={{ marginBottom: '6rem' }}>
                        <SectionHeader
                            icon={<BookOpen size={32} color="#142346" />}
                            title={t('animal')}
                            accentColor="#142346"
                        />
                        {animalCatalogs.length > 0 ? (
                            <CatalogGrid>
                                {animalCatalogs.map(catalog => (
                                    <CatalogCard
                                        key={catalog.id}
                                        catalog={catalog}
                                        t={t}
                                        isAr={isAr}
                                        locale={locale}
                                        colorScheme="secondary"
                                    />
                                ))}
                            </CatalogGrid>
                        ) : (
                            <EmptyState label={t('noCatalogs')} />
                        )}
                    </div>

                    {/* Technical — primary (pink) */}
                    <div style={{ marginBottom: '6rem' }}>
                        <SectionHeader
                            icon={<Wrench size={32} color="#e9496c" />}
                            title={t('technical')}
                            accentColor="#e9496c"
                        />
                        {technicalCatalogs.length > 0 ? (
                            <CatalogGrid>
                                {technicalCatalogs.map(catalog => (
                                    <CatalogCard
                                        key={catalog.id}
                                        catalog={catalog}
                                        t={t}
                                        isAr={isAr}
                                        locale={locale}
                                        colorScheme="primary"
                                    />
                                ))}
                            </CatalogGrid>
                        ) : (
                            <EmptyState label={t('noCatalogs')} />
                        )}
                    </div>

                    {/* Mixing Table — secondary (navy) */}
                    {mixingTable && (
                        <div style={{ marginBottom: '6rem' }}>
                            <SectionHeader
                                icon={<Table size={32} color="#142346" />}
                                title={t('mixingTable')}
                                accentColor="#142346"
                            />
                            <CatalogGrid>
                                <DocCard
                                    icon={<Table size={26} />}
                                    title={isAr ? (mixingTable.title_ar || mixingTable.title) : mixingTable.title}
                                    description={isAr ? (mixingTable.description_ar || mixingTable.description) : mixingTable.description}
                                    viewHref={`/${locale}/catalogs/viewer?source=${encodeURIComponent(mixingTable.filePath)}&title=${encodeURIComponent(isAr ? (mixingTable.title_ar || mixingTable.title) : mixingTable.title)}`}
                                    downloadHref={mixingTable.filePath}
                                    updatedAt={mixingTable.updatedAt}
                                    t={t}
                                    colorScheme="secondary"
                                />
                            </CatalogGrid>
                        </div>
                    )}

                    {/* Additional document categories — alternating colors */}
                    {Object.entries(groupedDocuments).map(([category, docs]: [string, any], idx) => {
                        if (!docs || docs.length === 0) return null;
                        const scheme: ColorScheme = idx % 2 === 0 ? 'primary' : 'secondary';
                        const accentHex = scheme === 'primary' ? '#e9496c' : '#142346';

                        return (
                            <div key={category} style={{ marginBottom: '6rem' }}>
                                <SectionHeader
                                    icon={getCategoryIcon(category, accentHex)}
                                    title={t(`categories.${category}`)}
                                    accentColor={accentHex}
                                />
                                <CatalogGrid>
                                    {docs.map((doc: any) => (
                                        <DocCard
                                            key={doc.id}
                                            icon={
                                                category === 'optimum-conditions' ? <Leaf size={26} /> :
                                                category === 'technical-guides'   ? <FileText size={26} /> :
                                                category === 'product-catalogs'   ? <Layers size={26} /> :
                                                                                    <MoreHorizontal size={26} />
                                            }
                                            title={isAr ? (doc.title_ar || doc.title) : doc.title}
                                            description={isAr ? (doc.description_ar || doc.description) : doc.description}
                                            viewHref={`/${locale}/catalogs/viewer?source=${encodeURIComponent(doc.filePath)}&title=${encodeURIComponent(isAr ? (doc.title_ar || doc.title) : doc.title)}`}
                                            downloadHref={doc.filePath}
                                            updatedAt={doc.updatedAt}
                                            t={t}
                                            colorScheme={scheme}
                                        />
                                    ))}
                                </CatalogGrid>
                            </div>
                        );
                    })}

                </div>
            </section>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Layout helpers
═══════════════════════════════════════════════════════════ */
function CatalogGrid({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2.5rem',
        }}>
            {children}
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem', fontSize: '1.1rem' }}>
            {label}
        </p>
    );
}

function SectionHeader({
    icon, title, accentColor,
}: {
    icon: React.ReactNode;
    title: string;
    accentColor: string;
}) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2.5rem',
            paddingBottom: '1rem',
            borderBottom: `2px solid ${accentColor}2a`,
        }}>
            {icon}
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{title}</h2>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Catalog Card  (from catalog table)
═══════════════════════════════════════════════════════════ */
function CatalogCard({
    catalog, t, isAr, locale, colorScheme,
}: {
    catalog: any;
    t: any;
    isAr: boolean;
    locale: string;
    colorScheme: ColorScheme;
}) {
    const title       = isAr ? (catalog.title_ar       || catalog.title)       : catalog.title;
    const description = isAr ? (catalog.description_ar || catalog.description) : catalog.description;
    const fileUrl     = (isAr && catalog.fileUrl_ar)   ? catalog.fileUrl_ar    : catalog.fileUrl;
    const c           = getSchemeColors(colorScheme);
    const viewerUrl   = `/${locale}/catalogs/viewer?source=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(title)}`;

    return (
        <div className="card" style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
            border: `1px solid ${c.light}`,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
        }}>
            {/* top accent stripe */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: `linear-gradient(90deg, ${c.main}, ${c.hover})`,
            }} />

            {/* icon badge */}
            <div style={{
                width: '52px', height: '52px', borderRadius: '0.875rem',
                backgroundColor: c.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.2rem', color: c.main,
            }}>
                {catalog.category === 'technical' ? <Wrench size={24} /> : <FileDown size={24} />}
            </div>

            <h3 style={{
                fontSize: '1.1rem', fontWeight: 700,
                marginBottom: '0.5rem', color: '#1e293b', lineHeight: 1.35,
            }}>
                {title}
            </h3>

            {description && (
                <p style={{
                    color: '#64748b', fontSize: '0.93rem',
                    lineHeight: 1.55, marginBottom: '1.5rem', flex: 1,
                }}>
                    {description}
                </p>
            )}

            {/* ── action buttons ── */}
            <div style={{ marginTop: 'auto' }}>
                <ActionRow
                    viewHref={viewerUrl}
                    downloadHref={fileUrl}
                    downloadAttr
                    viewLabel={t('view')}
                    downloadTitle={t('download')}
                    c={c}
                />
                <div style={{ marginTop: '0.75rem', fontSize: '0.77rem', color: '#94a3b8', textAlign: 'center' }}>
                    {t('lastUpdated')}: {fmtDate(catalog.createdAt)}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Document Card  (mixing-table / extra doc categories)
═══════════════════════════════════════════════════════════ */
function DocCard({
    icon, title, description, viewHref, downloadHref, updatedAt, t, colorScheme,
}: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    viewHref: string;
    downloadHref: string;
    updatedAt: string | Date;
    t: any;
    colorScheme: ColorScheme;
}) {
    const c = getSchemeColors(colorScheme);

    return (
        <div className="card" style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
            border: `1px solid ${c.light}`,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: `linear-gradient(90deg, ${c.main}, ${c.hover})`,
            }} />

            <div style={{
                width: '52px', height: '52px', borderRadius: '0.875rem',
                backgroundColor: c.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.2rem', color: c.main,
            }}>
                {icon}
            </div>

            <h3 style={{
                fontSize: '1.1rem', fontWeight: 700,
                marginBottom: '0.5rem', color: '#1e293b', lineHeight: 1.35,
            }}>
                {title}
            </h3>

            {description && (
                <p style={{
                    color: '#64748b', fontSize: '0.93rem',
                    lineHeight: 1.55, marginBottom: '1.5rem', flex: 1,
                }}>
                    {description}
                </p>
            )}

            <div style={{ marginTop: 'auto' }}>
                <ActionRow
                    viewHref={viewHref}
                    downloadHref={downloadHref}
                    downloadAttr={false}
                    viewLabel={t('view')}
                    downloadTitle={t('download')}
                    c={c}
                />
                <div style={{ marginTop: '0.75rem', fontSize: '0.77rem', color: '#94a3b8', textAlign: 'center' }}>
                    {t('lastUpdated')}: {fmtDate(updatedAt)}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Action Row
   Layout:  [⬇ small square icon]  [👁 wide view button]
═══════════════════════════════════════════════════════════ */
function ActionRow({
    viewHref, downloadHref, downloadAttr, viewLabel, downloadTitle, c,
}: {
    viewHref: string;
    downloadHref: string;
    downloadAttr: boolean;
    viewLabel: string;
    downloadTitle: string;
    c: ReturnType<typeof getSchemeColors>;
}) {
    return (
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'stretch' }}>

            {/* Download — small square */}
            <a
                href={downloadHref}
                {...(downloadAttr ? { download: true } : { target: '_blank', rel: 'noopener noreferrer' })}
                title={downloadTitle}
                aria-label={downloadTitle}
                style={{
                    width: '46px',
                    minWidth: '46px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0.55rem',
                    backgroundColor: c.light,
                    color: c.main,
                    border: `1.5px solid ${c.main}38`,
                    textDecoration: 'none',
                    transition: 'background-color 0.2s, color 0.2s',
                    flexShrink: 0,
                    cursor: 'pointer',
                }}
            >
                <Download size={18} strokeWidth={2.2} />
            </a>

            {/* View — wide rectangle */}
            <a
                href={viewHref}
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    height: '46px',
                    borderRadius: '0.55rem',
                    backgroundColor: c.main,
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.93rem',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s, transform 0.15s',
                    letterSpacing: '0.01em',
                    cursor: 'pointer',
                }}
            >
                <Eye size={16} strokeWidth={2.2} />
                {viewLabel}
            </a>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════ */
function fmtDate(value: string | Date) {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function getCategoryIcon(category: string, color: string) {
    switch (category) {
        case 'optimum-conditions': return <Leaf         size={32} color={color} />;
        case 'technical-guides':   return <FileText     size={32} color={color} />;
        case 'product-catalogs':   return <Layers       size={32} color={color} />;
        default:                   return <MoreHorizontal size={32} color={color} />;
    }
}
