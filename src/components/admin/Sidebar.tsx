"use client";

import { Link, usePathname, useRouter } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { logout } from '@/actions/authActions';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('Admin');

    const switchLocale = (nextLocale: string) => {
        // Get the current path from the browser URL
        const currentPath = window.location.pathname;
        // Replace the current locale in the pathname with the new locale
        // pathname is like '/ar/admin/products' - we replace 'ar' or 'en' at the start
        const newPath = currentPath.replace(/^\/[^\/]+/, '/' + nextLocale);
        window.location.href = newPath;
    };

    const menuItems = [
        { name: t('dashboard'), href: '/admin', icon: '📊' },
        { name: t('products'), href: '/admin/products', icon: '📦' },
        { name: t('animalTypes'), href: '/admin/animal-types', icon: '🐾' },
        { name: t('cropGuides'), href: '/admin/crops', icon: '🌾' },
        { name: t('expertArticles'), href: '/admin/expert-articles', icon: '🎓' },
        { name: t('blogPosts'), href: '/admin/blog', icon: '📝' },
        { name: t('catalogs'), href: '/admin/catalogs', icon: '📚' },
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
            width: '100%',
            height: '100%',
            backgroundColor: '#0f172a', // Deep Slate instead of pure black
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
        }}>
            <div style={{ padding: '2.5rem 1.5rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '40px', height: '40px', backgroundColor: 'var(--primary)',
                        borderRadius: '10px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 900, color: 'white'
                    }}>K</div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '1px' }}>{t('title')}</span>
                </div>

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
                padding: '0 1.5rem 1.5rem',
            }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {menuItems.map((item) => {
                        // Fix: Ensure we correctly identify active links
                        // Dashboard is exact match, others are prefix matches
                        const isActive = item.href === '/admin' 
                            ? pathname === '/admin'
                            : pathname.startsWith(item.href);
                        
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
                                    backgroundColor: isActive ? 'rgba(233, 73, 108, 0.15)' : 'transparent', // Use primary color with opacity
                                    border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                                    color: isActive ? 'white' : '#94a3b8',
                                    fontWeight: isActive ? '700' : '500',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.05em',
                                    textDecoration: 'none'
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
                        textTransform: 'uppercase',
                        textDecoration: 'none'
                    }}
                >
                    <span>🏠</span> {t('backToSite')}
                </Link>
                <button
                    onClick={async () => {
                        await logout();
                        window.location.href = '/';
                    }}
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
                        textTransform: 'uppercase',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    className="sidebar-link"
                >
                    <span>🚪</span> {t('logout')}
                </button>
            </div>

            <style jsx>{`
                .sidebar-link:hover {
                    background-color: rgba(255,255,255,0.05) !important;
                    color: white !important;
                    transform: translateX(5px);
                }
            `}</style>
        </aside>
    );
}
