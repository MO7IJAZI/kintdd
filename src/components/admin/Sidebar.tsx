"use client";

import { Link, usePathname, useRouter } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('Admin');

    const switchLocale = (nextLocale: string) => {
        router.replace(pathname as any, {locale: nextLocale});
    };

    const menuItems = [
        { name: t('dashboard'), href: '/admin', icon: '📊' },
        { name: t('products'), href: '/admin/products', icon: '📦' },
        { name: t('animalTypes'), href: '/admin/animal-types', icon: '🐾' },
        { name: t('cropGuides'), href: '/admin/crops', icon: '🌾' },
        { name: t('expertArticles'), href: '/admin/expert-articles', icon: '🎓' },
        { name: t('blogPosts'), href: '/admin/blog', icon: '📝' },
        { name: t('career'), href: '/admin/career', icon: '💼' },
        { name: t('applications'), href: '/admin/applications', icon: '📬' },
        { name: t('certificates'), href: '/admin/certificates', icon: '🏆' },
        { name: t('awards'), href: '/admin/awards', icon: '🎖️' },
        { name: t('headquarter'), href: '/admin/headquarter', icon: '🏢' },
        { name: t('contactInquiries'), href: '/admin/inquiries', icon: '📧' },
        { name: t('settings'), href: '/admin/settings', icon: '⚙️' },
    ];

    return (
        <aside style={{
            width: '280px',
            backgroundColor: '#0f172a', // Deep Slate instead of pure black
            color: 'white',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
            zIndex: 100
        }}>
            <div style={{ padding: '2.5rem 1.5rem 0.5rem', borderBottom: '1px solid rgba(255,255,1,0.1)', marginBottom: '1rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '40px', height: '40px', backgroundColor: 'var(--primary)',
                        borderRadius: '10px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 900, color: 'white'
                    }}>K</div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '1px' }}>{t('title')}</span>
                </Link>

                <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem' 
                }}>
                    <button 
                        onClick={() => switchLocale('en')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            backgroundColor: locale === 'en' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: '0.3s'
                        }}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => switchLocale('ar')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            backgroundColor: locale === 'ar' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: '0.3s'
                        }}
                    >
                        AR
                    </button>
                </div>
            </div>

            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '0 1.5rem 1.5rem',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent'
            }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href as any}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.25rem',
                                padding: '1rem 1.25rem',
                                borderRadius: '0.75rem',
                                backgroundColor: isActive ? 'rgba(26, 92, 55, 0.2)' : 'transparent',
                                border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                                color: isActive ? 'white' : '#94a3b8',
                                fontWeight: isActive ? '700' : '500',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                letterSpacing: '0.05em'
                            }}
                            className="sidebar-link"
                        >
                            <span style={{ fontSize: '1.25rem', opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
                </nav>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Link
                    href="/"
                    style={{
                        width: '100%',
                        textAlign: 'left',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.25rem',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textTransform: 'uppercase'
                    }}
                >
                    <span>🏠</span> {t('backToSite')}
                </Link>
                <button
                    onClick={() => { }}
                    style={{
                        width: '100%',
                        textAlign: 'left',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        padding: '1rem 1.25rem',
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        textTransform: 'uppercase'
                    }}
                >
                    <span>🚪</span> {t('logout')}
                </button>
            </div>

            <style jsx>{`
                .sidebar-link:hover {
                    background-color: rgba(255,255,255,0.05);
                    color: white;
                    transform: translateX(5px);
                }
            `}</style>
        </aside>
    );
}
