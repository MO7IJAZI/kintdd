import prisma from "@/lib/prisma";
import { getTranslations, getLocale } from 'next-intl/server';
import { FileDown, BookOpen, Download, Table, Leaf, FileText, Layers, MoreHorizontal, Eye, Wrench } from 'lucide-react';

export const revalidate = 3600; // Cache for 1 hour

export default async function CatalogsPage() {
    const locale = await getLocale();
    const t = await getTranslations('Catalogs');
    const isAr = locale === 'ar';

    let catalogs: any[] = [];
    let mixingTable: any = null;
    let documents: any[] = [];

    try {
        catalogs = await prisma.catalog.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                order: 'asc'
            }
        });

        mixingTable = await prisma.document.findFirst({
            where: {
                category: 'mixing-table',
                isActive: true
            }
        });

        documents = await prisma.document.findMany({
            where: {
                isActive: true,
                category: {
                    not: 'mixing-table'
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch (error) {
        console.error('Failed to fetch catalogs:', error);
        // Fallback to empty array or handle gracefully
    }

    const agriCatalogs = catalogs.filter(c => c.category === 'agricultural');
    const animalCatalogs = catalogs.filter(c => c.category === 'animal');
    const technicalCatalogs = catalogs.filter(c => c.category === 'technical');

    const groupedDocuments = documents.reduce((acc, doc) => {
        if (!acc[doc.category]) {
            acc[doc.category] = [];
        }
        acc[doc.category].push(doc);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div style={{ direction: isAr ? 'rtl' : 'ltr', minHeight: '100vh', backgroundColor: '#fcfcfc' }}>
            {/* Hero Section */}
            <section style={{ 
                padding: '8rem 0 6rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
                        marginBottom: '1.5rem', 
                        fontWeight: 900,
                        color: '#0f172a',
                        letterSpacing: '-0.02em'
                    }}>
                        {t('title')}
                    </h1>
                    <p style={{ 
                        color: '#64748b', 
                        fontSize: '1.25rem', 
                        maxWidth: '700px', 
                        margin: '0 auto', 
                        lineHeight: 1.6,
                        fontWeight: 500
                    }}>
                        {t('subtitle')}
                    </p>
                </div>
                {/* Abstract Background Elements */}
                <div style={{
                    position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(255,255,255,0) 70%)'
                }}></div>
            </section>

            <section style={{ padding: '5rem 0' }}>
                <div className="container">
                    {/* Agricultural Section */}
                    <div style={{ marginBottom: '6rem' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            marginBottom: '2.5rem',
                            borderBottom: '2px solid #e2e8f0',
                            paddingBottom: '1rem'
                        }}>
                            <BookOpen size={32} color="var(--primary)" />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{t('agricultural')}</h2>
                        </div>

                        {agriCatalogs.length > 0 ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                gap: '2.5rem' 
                            }}>
                                {agriCatalogs.map((catalog) => (
                                    <CatalogCard key={catalog.id} catalog={catalog} t={t} isAr={isAr} locale={locale} />
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem', fontSize: '1.1rem' }}>{t('noCatalogs')}</p>
                        )}
                    </div>

                    {/* Animal Section */}
                    <div style={{ marginBottom: '6rem' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            marginBottom: '2.5rem',
                            borderBottom: '2px solid #e2e8f0',
                            paddingBottom: '1rem'
                        }}>
                            <BookOpen size={32} color="var(--secondary)" />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{t('animal')}</h2>
                        </div>

                        {animalCatalogs.length > 0 ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                gap: '2.5rem' 
                            }}>
                                {animalCatalogs.map((catalog) => (
                                    <CatalogCard key={catalog.id} catalog={catalog} t={t} isAr={isAr} locale={locale} />
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem', fontSize: '1.1rem' }}>{t('noCatalogs')}</p>
                        )}
                    </div>

                    {/* Technical Section */}
                    <div style={{ marginBottom: '6rem' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            marginBottom: '2.5rem',
                            borderBottom: '2px solid #e2e8f0',
                            paddingBottom: '1rem'
                        }}>
                            <Wrench size={32} color="var(--primary)" />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{t('technical')}</h2>
                        </div>

                        {technicalCatalogs.length > 0 ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                gap: '2.5rem' 
                            }}>
                                {technicalCatalogs.map((catalog) => (
                                    <CatalogCard key={catalog.id} catalog={catalog} t={t} isAr={isAr} locale={locale} />
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem', fontSize: '1.1rem' }}>{t('noCatalogs')}</p>
                        )}
                    </div>
                    {mixingTable && (
                        <div style={{ marginTop: '6rem' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem', 
                                marginBottom: '2.5rem',
                            borderBottom: '2px solid #e2e8f0',
                            paddingBottom: '1rem'
                        }}>
                            <Table size={32} color="var(--secondary)" />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{t('mixingTable')}</h2>
                        </div>

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                gap: '2.5rem' 
                            }}>
                                <div className="card" style={{ 
                                    backgroundColor: 'white',
                                    borderRadius: '1.5rem',
                                    padding: '2rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    transition: 'all 0.3s ease',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div>
                                        <div style={{ 
                                            width: '60px', 
                                            height: '60px', 
                                            borderRadius: '1rem', 
                                            backgroundColor: '#f3e8ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '1.5rem',
                                            color: 'var(--secondary)'
                                        }}>
                                            <Table size={30} />
                                        </div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>
                                            {isAr ? (mixingTable.title_ar || mixingTable.title) : mixingTable.title}
                                        </h3>
                                        {(isAr ? (mixingTable.description_ar || mixingTable.description) : mixingTable.description) && (
                                            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                                                {isAr ? (mixingTable.description_ar || mixingTable.description) : mixingTable.description}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div style={{ marginTop: 'auto' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            <a
                                                href={`/${locale}/catalogs/viewer?source=${encodeURIComponent(mixingTable.filePath)}&title=${encodeURIComponent(isAr ? (mixingTable.title_ar || mixingTable.title) : mixingTable.title)}`}
                                                className="btn"
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    borderRadius: '0.75rem',
                                                    padding: '0.8rem',
                                                    fontWeight: 600,
                                                    textDecoration: 'none',
                                                    backgroundColor: '#f3e8ff',
                                                    color: 'var(--secondary)',
                                                    border: '1px solid #ddd6fe'
                                                }}
                                            >
                                                <Eye size={17} />
                                                {t('view')}
                                            </a>
                                            <a
                                                href={mixingTable.filePath}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn"
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    borderRadius: '0.75rem',
                                                    padding: '0.8rem',
                                                    fontWeight: 600,
                                                    textDecoration: 'none',
                                                    backgroundColor: 'var(--secondary)',
                                                    color: 'white'
                                                }}
                                            >
                                                <Download size={17} />
                                                {t('download')}
                                            </a>
                                        </div>
                                        <div style={{ 
                                            marginTop: '1rem', 
                                            fontSize: '0.8rem', 
                                            color: '#94a3b8', 
                                            textAlign: 'center' 
                                        }}>
                                            {t('lastUpdated')}: {formatCatalogDate(mixingTable.updatedAt, isAr)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Document Categories */}
                    {Object.entries(groupedDocuments).map(([category, docs]: [string, any]) => {
                        if (docs.length === 0) return null;
                        
                        return (
                            <div key={category} style={{ marginTop: '6rem' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1rem', 
                                    marginBottom: '2.5rem',
                                    borderBottom: '2px solid #e2e8f0',
                                    paddingBottom: '1rem'
                                }}>
                                    {getCategoryIcon(category)}
                                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>
                                        {t(`categories.${category}`)}
                                    </h2>
                                </div>

                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                    gap: '2.5rem' 
                                }}>
                                    {docs.map((doc: any) => (
                                        <div key={doc.id} className="card" style={{ 
                                            backgroundColor: 'white',
                                            borderRadius: '1.5rem',
                                            padding: '2rem',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            transition: 'all 0.3s ease',
                                            border: '1px solid #f1f5f9',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            height: '100%',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div>
                                                <div style={{ 
                                                    width: '60px', 
                                                    height: '60px', 
                                                    borderRadius: '1rem', 
                                                    backgroundColor: getCategoryBgColor(category),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '1.5rem',
                                                    color: getCategoryColor(category)
                                                }}>
                                                    {category === 'optimum-conditions' ? <Leaf size={30} /> :
                                                     category === 'technical-guides' ? <FileText size={30} /> :
                                                     category === 'product-catalogs' ? <Layers size={30} /> :
                                                     <MoreHorizontal size={30} />}
                                                </div>
                                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>
                                                    {isAr ? (doc.title_ar || doc.title) : doc.title}
                                                </h3>
                                                {(isAr ? (doc.description_ar || doc.description) : doc.description) && (
                                                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                                                        {isAr ? (doc.description_ar || doc.description) : doc.description}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <div style={{ marginTop: 'auto' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                    <a
                                                        href={`/${locale}/catalogs/viewer?source=${encodeURIComponent(doc.filePath)}&title=${encodeURIComponent(isAr ? (doc.title_ar || doc.title) : doc.title)}`}
                                                        className="btn"
                                                        style={{
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem',
                                                            borderRadius: '0.75rem',
                                                            padding: '0.8rem',
                                                            fontWeight: 600,
                                                            textDecoration: 'none',
                                                            backgroundColor: getCategoryBgColor(category),
                                                            color: getCategoryColor(category),
                                                            border: `1px solid ${getCategoryColor(category)}33`
                                                        }}
                                                    >
                                                        <Eye size={17} />
                                                        {t('view')}
                                                    </a>
                                                    <a
                                                        href={doc.filePath}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn"
                                                        style={{
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem',
                                                            borderRadius: '0.75rem',
                                                            padding: '0.8rem',
                                                            fontWeight: 600,
                                                            textDecoration: 'none',
                                                            backgroundColor: getCategoryColor(category),
                                                            color: 'white'
                                                        }}
                                                    >
                                                        <Download size={17} />
                                                        {t('download')}
                                                    </a>
                                                </div>
                                                <div style={{ 
                                                    marginTop: '1rem', 
                                                    fontSize: '0.8rem', 
                                                    color: '#94a3b8', 
                                                    textAlign: 'center' 
                                                }}>
                                                    {t('lastUpdated')}: {formatCatalogDate(doc.updatedAt, isAr)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Animal Section - Removed duplicate */}

                </div>
            </section>
        </div>
    );
}

function formatCatalogDate(value: string | Date, isAr: boolean) {
    return new Date(value).toLocaleDateString(isAr ? 'ar-EG-u-nu-latn' : 'en-US-u-nu-latn', {
        year: 'numeric',
        month: 'long'
    });
}

function getCategoryIcon(category: string) {
    switch (category) {
        case 'optimum-conditions':
            return <Leaf size={32} color="var(--primary)" />;
        case 'technical-guides':
            return <FileText size={32} color="var(--secondary)" />;
        case 'product-catalogs':
            return <Layers size={32} color="var(--primary)" />;
        default:
            return <MoreHorizontal size={32} color="#64748b" />;
    }
}

function getCategoryBgColor(category: string) {
    switch (category) {
        case 'optimum-conditions':
            return '#ecfdf5';
        case 'technical-guides':
            return '#eff6ff';
        case 'product-catalogs':
            return '#f3e8ff';
        default:
            return '#f1f5f9';
    }
}

function getCategoryColor(category: string) {
    switch (category) {
        case 'optimum-conditions':
            return 'var(--primary)';
        case 'technical-guides':
            return 'var(--secondary)';
        case 'product-catalogs':
            return 'var(--primary)';
        default:
            return '#64748b';
    }
}

function CatalogCard({ catalog, t, isAr, locale }: { catalog: any, t: any, isAr: boolean, locale: string }) {
    const title = isAr ? (catalog.title_ar || catalog.title) : catalog.title;
    const description = isAr ? (catalog.description_ar || catalog.description) : catalog.description;
    const fileUrl = (isAr && catalog.fileUrl_ar) ? catalog.fileUrl_ar : catalog.fileUrl;

    return (
        <div className="card" style={{ 
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div>
                <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '1rem', 
                    backgroundColor: catalog.category === 'agricultural' ? '#ecfdf5' : 
                                   catalog.category === 'animal' ? '#eff6ff' :
                                   '#fff7ed', // Orange for technical
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    color: catalog.category === 'agricultural' ? 'var(--primary)' : 
                           catalog.category === 'animal' ? 'var(--secondary)' :
                           'var(--primary)' // Primary for technical
                }}>
                    {catalog.category === 'technical' ? <Wrench size={30} /> : <FileDown size={30} />}
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>{title}</h3>
                {description && (
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                        {description}
                    </p>
                )}
            </div>
            
            <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <a
                        href={`/${locale}/catalogs/viewer?source=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(title)}`}
                        className={`btn ${catalog.category === 'agricultural' ? 'btn-secondary' : 'btn-outline'}`}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            borderRadius: '0.75rem',
                            padding: '0.8rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                        }}
                    >
                        <Eye size={17} />
                        {t('view')}
                    </a>
                    <a
                        href={fileUrl}
                        download
                        className={`btn ${catalog.category === 'agricultural' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            borderRadius: '0.75rem',
                            padding: '0.8rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                        }}
                    >
                        <Download size={17} />
                        {t('download')}
                    </a>
                </div>
                <div style={{ 
                    marginTop: '1rem', 
                    fontSize: '0.8rem', 
                    color: '#94a3b8', 
                    textAlign: 'center' 
                }}>
                    {t('lastUpdated')}: {formatCatalogDate(catalog.createdAt, isAr)}
                </div>
            </div>
        </div>
    );
}
