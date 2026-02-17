"use client";

import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/navigation';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
    ChevronDown, 
    ChevronRight, 
    Mail, 
    Menu, 
    X,
    Sprout,
    FlaskConical,
    Microscope,
    Factory,
    Truck,
    Award,
    FileText,
    Users,
    Globe,
    BookOpen
} from 'lucide-react';

interface SubItem {
    name: string;
    href: any;
    subItems?: SubItem[];
    description?: string;
    icon?: React.ReactNode;
    subLink?: { name: string; href: any };
}

interface NavItem {
    name: string;
    href: any;
    subItems?: SubItem[];
}

type ProductCategoryNavChild = {
    id: string;
    name: string;
    name_ar: string | null;
    slug: string;
};

type ProductCategoryNav = {
    id: string;
    name: string;
    name_ar: string | null;
    slug: string;
    description: string | null;
    description_ar: string | null;
    children?: ProductCategoryNavChild[];
};

type HeaderProps = {
    productCategories: ProductCategoryNav[];
};

export default function Header({ productCategories }: HeaderProps) {
    const t = useTranslations('Navigation');
    const locale = useLocale();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [activeNestedDropdown, setActiveNestedDropdown] = useState<string | null>(null);
    const [activeMobileSub, setActiveMobileSub] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        handleScroll(); // Initial check
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const switchLocale = (nextLocale: string) => {
        router.replace(pathname, {locale: nextLocale});
    };

    const productOfferSubItems: SubItem[] = (productCategories ?? []).map((category) => {
        const name = locale === 'ar' ? (category.name_ar || category.name) : category.name;
        const description = locale === 'ar'
            ? (category.description_ar || category.description)
            : category.description;

        const children = category.children ?? [];
        const subItems = children.length
            ? children.map((child) => ({
                name: locale === 'ar' ? (child.name_ar || child.name) : child.name,
                href: `/product-category/${child.slug}` as any,
            }))
            : undefined;

        return {
            name,
            href: `/product-category/${category.slug}` as any,
            description: description || undefined,
            icon: <Sprout size={18} />,
            subItems,
        };
    });

    const animalProductsSubItems: SubItem[] = [
        { name: t('poultry'), href: '/products-for-animals/poultry', icon: <ChevronRight size={14} /> },
        { name: t('ruminants'), href: '/products-for-animals/ruminants', icon: <ChevronRight size={14} /> },
        { name: t('swine'), href: '/products-for-animals/swine', icon: <ChevronRight size={14} /> },
    ];

    const navItems: NavItem[] = [
        {
            name: t('agriculturalProducts'),
            href: '/product-category/agricultural',
            subItems: [
                { 
                    name: t('agriculturalProducts'), 
                    href: '/product-category/agricultural',
                    subItems: productOfferSubItems.length ? productOfferSubItems : undefined,
                    icon: <Sprout size={18} />
                },
                { 
                    name: t('cropGuides'), 
                    href: '/product-category/crop-guides', 
                    description: t('cropGuidesDesc'), 
                    icon: <FileText size={18} /> 
                },
                { 
                    name: t('treatmentEfficacy'), 
                    href: '/treatment-efficacy/optimum-conditions', 
                    description: t('provenTreatmentResults'), 
                    icon: <Microscope size={18} />,
                    subLink: { name: t('optimumConditions'), href: '/treatment-efficacy/optimum-conditions' }
                },
                { name: t('mixingTable'), href: '/mixing-table', description: t('mixingTableDesc'), icon: <FlaskConical size={18} /> },
            ]
        },
        {
            name: t('animalProducts'),
            href: '/product-category/animal',
            subItems: [
                { name: t('veterinaryProducts'), href: '/product-category/veterinary', icon: <Microscope size={18} /> },
                { 
                    name: t('byAnimalType'), 
                    href: '/product-category/by-animal', 
                    icon: <Users size={18} />,
                    subItems: animalProductsSubItems
                }
            ]
        },
        {
            name: t('about'),
            href: '/about',
            subItems: [
                { name: t('about'), href: '/about', icon: <Users size={18} /> },
                { name: t('rdCentre'), href: '/about/rd-centre', icon: <Microscope size={18} /> },
                { name: t('productionPlants'), href: '/about/production-plants', icon: <Factory size={18} /> },
                { name: t('logisticsCentre'), href: '/about/logistics-centre', icon: <Truck size={18} /> },
                { name: t('companyData'), href: '/about/company-data', icon: <FileText size={18} /> },
                { name: t('career'), href: '/about/career', icon: <Users size={18} /> },
                { name: t('certificates'), href: '/about/certificates', icon: <Award size={18} /> },
                { name: t('awards'), href: '/about/awards', icon: <Award size={18} /> },
            ]
        },
        { name: t('news'), href: '/blog' },
        {
            name: t('catalogs'),
            href: '/catalogs',
        },
        {
            name: t('contact'),
            href: '/contact',
            subItems: [
                { name: t('companyHeadquarter'), href: '/contact/headquarter', icon: <Factory size={18} /> },
                { name: t('exportDepartment'), href: '/contact/export-department', icon: <Globe size={18} /> },
                { name: t('localRepresentatives'), href: '/contact/local-representatives', icon: <Users size={18} /> },
                { name: t('contactForm'), href: '/contact', icon: <Mail size={18} /> },
            ]
        }
    ];

    return (
        <>
            <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container header-container">
                    <Link href="/" className="brand-logo">
                        <div className="brand-icon">
                            <Image src="/images/logo.png" alt="" width={72} height={72} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    </Link>

                    <nav className="desktop-nav">
                        <div className="nav-hover-indicator"></div>
                        {navItems.map((item) => (
                            <div
                                key={item.name}
                                className="nav-item-group"
                                onMouseEnter={(e) => {
                                    setActiveDropdown(item.name);
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                                    if (parentRect) {
                                        const indicator = e.currentTarget.parentElement?.querySelector('.nav-hover-indicator') as HTMLElement;
                                        if (indicator) {
                                            indicator.style.width = `${rect.width}px`;
                                            indicator.style.transform = `translateX(${rect.left - parentRect.left}px)`;
                                            indicator.style.opacity = '1';
                                        }
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    setActiveDropdown(null);
                                    setActiveNestedDropdown(null);
                                    const indicator = e.currentTarget.parentElement?.querySelector('.nav-hover-indicator') as HTMLElement;
                                    if (indicator) {
                                        indicator.style.opacity = '0';
                                    }
                                }}
                            >
                                <Link
                                    href={item.href}
                                    className={`nav-link ${pathname.startsWith(item.href) && item.href !== '/' ? 'active' : ''}`}
                                >
                                    <span className="link-text">{item.name}</span>
                                    {item.subItems && (
                                        <ChevronDown 
                                            size={14} 
                                            className={`chevron ${activeDropdown === item.name ? 'rotated' : ''}`} 
                                        />
                                    )}
                                </Link>

                                {item.subItems && (
                                    <div className={`dropdown-panel ${activeDropdown === item.name ? 'open' : ''}`}>
                                        <div className="dropdown-bridge"></div>
                                        <div className="dropdown-content">
                                            {item.subItems.map((sub, idx) => (
                                                <div
                                                    key={sub.name}
                                                    className="dropdown-item-wrapper"
                                                    onMouseEnter={() => sub.subItems && setActiveNestedDropdown(sub.name)}
                                                    onMouseLeave={() => sub.subItems && setActiveNestedDropdown(null)}
                                                    style={{ animationDelay: `${idx * 0.03}s` }}
                                                >
                                                    {sub.subLink ? (
                                                        <div className="dropdown-item has-sublink">
                                                            <div className="item-icon">{sub.icon}</div>
                                                            <div className="item-info">
                                                                <Link href={sub.href} className="item-name-link">
                                                                    {sub.name}
                                                                </Link>
                                                                {sub.description && <div className="item-desc">{sub.description}</div>}
                                                                <Link 
                                                                    href={sub.subLink.href} 
                                                                    className="item-sublink"
                                                                >
                                                                    <ChevronRight size={12} />
                                                                    {sub.subLink.name}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Link href={sub.href} className="dropdown-item">
                                                            <div className="item-icon">{sub.icon}</div>
                                                            <div className="item-info">
                                                                <div className="item-name">{sub.name}</div>
                                                                {sub.description && <div className="item-desc">{sub.description}</div>}
                                                            </div>
                                                            {sub.subItems && <ChevronRight size={14} className="item-chevron" />}
                                                        </Link>
                                                    )}

                                                    {sub.subItems && (
                                                        <div className={`nested-panel ${activeNestedDropdown === sub.name ? 'open' : ''}`}>
                                                            {sub.subItems.map((nested) => (
                                                                <Link key={nested.name} href={nested.href} className="nested-link">
                                                                    {nested.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="header-actions">
                        <div className="lang-switcher">
                            <button 
                                className={locale === 'en' ? 'active' : ''} 
                                onClick={() => switchLocale('en')}
                            >
                                EN
                            </button>
                            <button 
                                className={locale === 'ar' ? 'active' : ''} 
                                onClick={() => switchLocale('ar')}
                            >
                                AR
                            </button>
                        </div>
                        <Link href="/admin" className="btn-ghost">
                            <span>Portal</span>
                        </Link>
                        <Link href="/contact" className="btn-solid">
                            <span>{t('contact')}</span>
                            <div className="btn-glow"></div>
                        </Link>
                    </div>

                    <button className="mobile-burger" onClick={() => setMobileMenuOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={(e) => {
                if (e.target === e.currentTarget) setMobileMenuOpen(false);
            }}>
                <div className="mobile-drawer">
                    <div className="drawer-header">
                        <div className="brand-logo mobile">
                            <div className="brand-icon">
                                <Image src="/images/logo.png" alt="" width={56} height={56} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="drawer-content">
                        {navItems.map((item) => (
                            <div key={item.name} className="drawer-item">
                                {item.subItems ? (
                                    <>
                                        <div 
                                            className="drawer-link has-sub" 
                                            onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                                        >
                                            {item.name}
                                            <ChevronDown 
                                                size={16} 
                                                className={`drawer-chevron ${activeDropdown === item.name ? 'rotated' : ''}`}
                                            />
                                        </div>
                                        <div className={`drawer-sub ${activeDropdown === item.name ? 'expanded' : ''}`}>
                                            {item.subItems.map((sub) => (
                                                <div key={sub.name} className="drawer-sub-item">
                                                    {sub.subItems ? (
                                                        <>
                                                            <div 
                                                                className="drawer-sub-link has-nested"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMobileSub(activeMobileSub === sub.name ? null : sub.name);
                                                                }}
                                                            >
                                                                {sub.name}
                                                                <ChevronDown 
                                                                    size={14} 
                                                                    className={`drawer-chevron small ${activeMobileSub === sub.name ? 'rotated' : ''}`}
                                                                />
                                                            </div>
                                                            <div className={`drawer-nested ${activeMobileSub === sub.name ? 'expanded' : ''}`}>
                                                                {sub.subItems.map((nested) => (
                                                                    <Link 
                                                                        key={nested.name} 
                                                                        href={nested.href} 
                                                                        className="drawer-nested-link"
                                                                        onClick={() => setMobileMenuOpen(false)}
                                                                    >
                                                                        {nested.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </>
                                                    ) : sub.subLink ? (
                                                        <>
                                                            <Link 
                                                                href={sub.href} 
                                                                className="drawer-sub-link"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                            <Link 
                                                                href={sub.subLink.href} 
                                                                className="drawer-nested-link sublink-mobile"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                <ChevronRight size={12} />
                                                                {sub.subLink.name}
                                                            </Link>
                                                        </>
                                                    ) : (
                                                        <Link 
                                                            href={sub.href} 
                                                            className="drawer-sub-link"
                                                            onClick={() => setMobileMenuOpen(false)}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <Link 
                                        href={item.href} 
                                        className="drawer-link"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="drawer-footer">

                        <Link href="/admin" className="btn-ghost full">Customer Portal</Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* --- VARIABLES --- */
                :global(:root) {
                    --c-primary: #e9496c;
                    --c-primary-dark: #d63d5c;
                    --c-primary-light: #fce4e9;
                    --c-text-main: #0f172a;
                    --c-text-muted: #64748b;
                    --c-bg-glass: rgba(255, 255, 255, 0.75);
                    --c-border: rgba(255, 255, 255, 0.5);
                    --shadow-sm: 0 4px 6px -1px rgba(0,0,0,0.02);
                    --shadow-lg: 0 25px 50px -12px rgba(0,0,0,0.15);
                    --ease-elastic: cubic-bezier(0.34, 1.56, 0.64, 1);
                    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* --- ANIMATIONS --- */
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                }
                
                /* --- ACTIONS --- */
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }
                .lang-switcher {
                    display: flex;
                    gap: 0.25rem;
                    background: rgba(0,0,0,0.03);
                    padding: 0.25rem;
                    border-radius: 10px;
                }
                .lang-switcher button {
                    background: none;
                    border: none;
                    padding: 0.35rem 0.6rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--c-text-muted);
                    cursor: pointer;
                    border-radius: 7px;
                    transition: all 0.2s;
                }
                .lang-switcher button.active {
                    background: white;
                    color: var(--c-primary);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .search-trigger {
                    color: var(--c-text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    transition: all 0.2s;
                }
                .search-trigger:hover {
                    background: var(--c-primary-light);
                    color: var(--c-primary);
                }
                .btn-ghost {
                    padding: 0.6rem 1.25rem;
                    color: var(--c-text-main);
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-decoration: none;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .btn-ghost:hover {
                    background: rgba(0,0,0,0.03);
                }
                .btn-solid {
                    background: linear-gradient(135deg, var(--c-primary), var(--c-primary-dark));
                    color: white;
                    padding: 0.7rem 1.5rem;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 8px 20px -6px rgba(233, 73, 108, 0.4);
                    transition: all 0.3s var(--ease-out);
                }
                .btn-solid:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px -8px rgba(233, 73, 108, 0.5);
                }
                .btn-glow {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.2) 0%, transparent 100%);
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .btn-solid:hover .btn-glow {
                    opacity: 1;
                }

                /* --- MAIN HEADER --- */
                .main-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    height: 80px;
                    background: #ffffff;
                    border-bottom: 1px solid #e2e8f0;
                    transition: all 0.3s ease;
                }
                .main-header.scrolled {
                    height: 64px;
                    background: #ffffff;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }
                .header-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                /* --- BRAND --- */
                .brand-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: var(--c-text-main);
                }
                .brand-icon {
                    width: 72px;
                    height: 72px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    position: relative;
                    overflow: hidden;
                    box-shadow: none;
                    transition: transform 0.3s var(--ease-elastic);
                }
                .brand-logo.mobile {
                    gap: 0;
                }
                .brand-logo:hover .brand-icon {
                    transform: rotate(-5deg) scale(1.05);
                }
                .shine-effect {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.6), transparent);
                    transform: translateX(-100%);
                    transition: transform 0.5s;
                }
                .brand-logo:hover .shine-effect {
                    transform: translateX(100%);
                }
                .brand-name {
                    font-size: 1.5rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }

                /* --- NAVIGATION --- */
                .desktop-nav {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    height: 100%;
                    position: relative;
                }
                .nav-hover-indicator {
                    position: absolute;
                    bottom: 15px;
                    left: 0;
                    height: 35px;
                    background: rgba(16, 185, 129, 0.08);
                    border-radius: 12px;
                    pointer-events: none;
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                    opacity: 0;
                    z-index: 0;
                }
                .nav-item-group {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    position: relative;
                }
                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    color: var(--c-text-main);
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.3s;
                    padding: 0.5rem 0.75rem;
                    border-radius: 10px;
                    position: relative;
                    z-index: 1;
                }
                .nav-link:hover {
                    color: var(--c-primary-dark);
                }
                .nav-link.active {
                    color: var(--c-primary);
                }
                .nav-link.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 50%;
                    transform: translateX(-50%);
                width: 4px;
                    height: 4px;
                    background: var(--c-primary);
                    border-radius: 50%;
                }
                .chevron {
                    transition: transform 0.3s var(--ease-elastic);
                    opacity: 0.5;
                }
                .chevron.rotated {
                    transform: rotate(180deg);
                    opacity: 1;
                    color: var(--c-primary);
                }

                /* --- DROPDOWNS --- */
                .dropdown-panel {
                    position: absolute;
                    top: calc(100% - 10px);
                    left: 50%;
                    transform: translateX(-50%) translateY(15px);
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(24px) saturate(200%);
                    -webkit-backdrop-filter: blur(24px) saturate(200%);
                    border-radius: 24px;
                    box-shadow: 
                        0 0 0 1px rgba(0,0,0,0.03),
                        0 20px 40px -10px rgba(0,0,0,0.12),
                        0 10px 20px -5px rgba(0,0,0,0.05);
                    padding: 1rem;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 100;
                    min-width: 280px;
                    pointer-events: none;
                }
                
                /* Smart alignment for items near screen edges */
                .nav-item-group:nth-last-child(-n+2) .dropdown-panel {
                    left: auto;
                    right: -20px;
                    transform: translateX(0) translateY(15px);
                }
                .nav-item-group:nth-last-child(-n+2) .dropdown-panel.open {
                    transform: translateX(0) translateY(0);
                }

                .dropdown-panel.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) translateY(0);
                    pointer-events: all;
                }

                /* Ensure the first and last panels don't use the -50% translateX */
                .nav-item-group:nth-last-child(-n+2) .dropdown-panel.open {
                    transform: translateX(0) translateY(0);
                }
                .dropdown-bridge {
                    position: absolute;
                    top: -20px;
                    left: 0;
                    right: 0;
                    height: 20px;
                }
                .dropdown-content {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 0.5rem;
                    max-height: calc(100vh - 140px);
                    overflow-y: auto;
                    padding: 0.5rem;
                    scrollbar-width: thin;
                    scrollbar-color: var(--c-primary) transparent;
                }
                .dropdown-content::-webkit-scrollbar {
                    width: 4px;
                }
                .dropdown-content::-webkit-scrollbar-thumb {
                    background: var(--c-primary);
                    border-radius: 10px;
                }
                /* Two columns for larger menus */
                .nav-item-group:first-child .dropdown-content,
                .nav-item-group:nth-child(2) .dropdown-content,
                .nav-item-group:nth-child(3) .dropdown-content {
                    min-width: 520px;
                    grid-template-columns: repeat(2, 1fr);
                }
                
                /* Ensure dropdown doesn't overflow viewport */
                .nav-item-group:first-child .dropdown-panel {
                    left: 0;
                    transform: translateX(0) translateY(15px);
                    max-width: calc(100vw - 2rem);
                }
                .nav-item-group:first-child .dropdown-panel.open {
                    transform: translateX(0) translateY(0);
                }
                
                .dropdown-item-wrapper {
                    position: relative;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .dropdown-panel.open .dropdown-item-wrapper {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.85rem 1rem;
                    text-decoration: none;
                    border-radius: 16px;
                    transition: all 0.25s var(--ease-out);
                    border: 1px solid transparent;
                }
                .dropdown-item:hover {
                    background: #ffffff;
                    border-color: rgba(16, 185, 129, 0.1);
                    box-shadow: 0 4px 12px -2px rgba(0,0,0,0.04);
                    transform: scale(1.02);
                }
                .item-icon {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--c-primary-light);
                    color: var(--c-primary);
                    border-radius: 12px;
                    transition: all 0.3s;
                    flex-shrink: 0;
                }
                .dropdown-item:hover .item-icon {
                    background: var(--c-primary);
                    color: white;
                    transform: rotate(-8deg) scale(1.1);
                }
                .item-info {
                    flex: 1;
                    min-width: 0;
                }
                .item-name {
                    display: block;
                    font-weight: 700;
                    color: var(--c-text-main);
                    font-size: 0.95rem;
                    margin-bottom: 0.15rem;
                    transition: color 0.2s ease;
                }
                .dropdown-item:hover .item-name {
                    color: var(--c-primary);
                }
                .item-desc {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--c-text-muted);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 180px;
                    transition: color 0.2s ease;
                }
                .dropdown-item:hover .item-desc {
                    color: var(--c-text-main);
                }
                .item-sublink {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    margin-top: 0.5rem;
                    padding: 0.35rem 0.6rem;
                    background: linear-gradient(135deg, var(--c-primary-light), rgba(16, 185, 129, 0.08));
                    color: var(--c-primary-dark);
                    font-size: 0.75rem;
                    font-weight: 600;
                    border-radius: 6px;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    border: 1px solid rgba(16, 185, 129, 0.15);
                }
                .item-sublink:hover {
                    background: var(--c-primary);
                    color: white;
                    transform: translateX(2px);
                    border-color: var(--c-primary);
                }
                .item-name-link {
                    display: block;
                    font-weight: 700;
                    color: var(--c-text-main);
                    font-size: 0.95rem;
                    margin-bottom: 0.15rem;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                .item-name-link:hover {
                    color: var(--c-primary);
                }
                .dropdown-item.has-sublink {
                    cursor: default;
                }
                .dropdown-item.has-sublink:hover {
                    background: #ffffff;
                    border-color: rgba(16, 185, 129, 0.1);
                    box-shadow: 0 4px 12px -2px rgba(0,0,0,0.04);
                    transform: scale(1.02);
                }
                .dropdown-item.has-sublink:hover .item-icon {
                    background: var(--c-primary);
                    color: white;
                    transform: rotate(-8deg) scale(1.1);
                }
                .item-chevron {
                    color: var(--c-text-muted);
                    opacity: 0.3;
                    transition: all 0.3s;
                }
                .dropdown-item:hover .item-chevron {
                    opacity: 1;
                    transform: translateX(3px);
                    color: var(--c-primary);
                }

                /* Nested Panel */
                .nested-panel {
                    position: absolute;
                    left: 100%; 
                    top: 0;
                    margin-left: 10px; /* Safe gap from parent */
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(24px);
                    border-radius: 20px;
                    box-shadow: 
                        0 15px 35px -5px rgba(0,0,0,0.1),
                        0 0 0 1px rgba(0,0,0,0.03);
                    min-width: 240px;
                    padding: 0.75rem;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    transform: translateX(15px);
                    z-index: 110;
                    pointer-events: none;
                    max-height: calc(100vh - 160px);
                    overflow-y: auto;
                    scrollbar-width: none;
                }
                .nested-panel::-webkit-scrollbar {
                    display: none;
                }

                /* Open nested panel to the left if parent dropdown is near right edge */
                .nav-item-group:nth-last-child(-n+2) .nested-panel {
                    left: auto;
                    right: 100%;
                    margin-left: 0;
                    margin-right: 10px;
                    transform: translateX(-15px);
                }

                .nested-panel.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(0);
                    pointer-events: all;
                }

                /* Override transform for right-side nested panels when open */
                .nav-item-group:nth-last-child(-n+2) .nested-panel.open {
                    transform: translateX(0);
                }
                .nested-panel::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, var(--c-primary), var(--c-primary-dark));
                    border-radius: 20px 20px 0 0;
                }
                .nested-panel::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -20px;
                    width: 20px;
                    height: 100%;
                }
                .nav-item-group:nth-last-child(-n+2) .nested-panel::after {
                    left: auto;
                    right: -20px;
                }
                .nested-link {
                    display: block;
                    padding: 0.75rem 1rem;
                    text-decoration: none;
                    color: var(--c-text-muted);
                    font-size: 0.9rem;
                    font-weight: 600;
                    border-radius: 12px;
                    transition: all 0.25s;
                }
                .nested-link:hover {
                    background: var(--c-primary-light);
                    color: var(--c-primary-dark);
                    padding-left: 1.25rem;
                }

                /* --- BUTTONS --- */
                .btn-solid {
                    background: var(--c-primary);
                    color: white;
                    padding: 0.65rem 1.25rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s var(--ease-out);
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
                    position: relative;
                    overflow: hidden;
                }
                .btn-solid:hover {
                    background: var(--c-primary-dark);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
                }
                .btn-ghost {
                    color: var(--c-text-main);
                    padding: 0.65rem 1.1rem;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-decoration: none;
                    transition: all 0.3s;
                    border: 1px solid transparent;
                }
                .btn-ghost:hover {
                    background: rgba(0,0,0,0.04);
                    color: var(--c-primary);
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .lang-switcher {
                    background: #f1f5f9;
                    padding: 0.25rem;
                    border-radius: 10px;
                    display: flex;
                    gap: 0.1rem;
                }
                .lang-switcher button {
                    background: transparent;
                    border: none;
                    color: var(--c-text-muted);
                    font-size: 0.7rem;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 0.35rem 0.6rem;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .lang-switcher button.active {
                    background: white;
                    color: var(--c-primary);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .lang-switcher button:hover:not(.active) {
                    color: var(--c-text-main);
                }

                .btn-solid:hover .btn-glow {
                    animation: shimmer 1.5s infinite;
                }
                .btn-glow {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transform: translateX(-100%) skewX(-15deg);
                }

                /* --- MOBILE MENU --- */
                .mobile-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(8px);
                    z-index: 2000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.4s;
                }
                .mobile-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                .mobile-drawer {
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: 100%;
                    max-width: 360px;
                    background: white;
                    transform: translateX(100%);
                    transition: transform 0.4s var(--ease-out);
                    display: flex;
                    flex-direction: column;
                    box-shadow: -10px 0 40px rgba(0,0,0,0.1);
                }
                .mobile-overlay.active .mobile-drawer {
                    transform: translateX(0);
                }
                .drawer-header {
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #f1f5f9;
                }
                .drawer-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                }
                .drawer-item {
                    margin-bottom: 0.5rem;
                }
                .drawer-link {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    color: var(--c-text-main);
                    font-weight: 700;
                    font-size: 1.1rem;
                    text-decoration: none;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .drawer-link:hover {
                    background: #f8fafc;
                    color: var(--c-primary);
                }
                .drawer-sub {
                    max-height: 0;
                    overflow: hidden;
                    transition: all 0.3s var(--ease-out);
                    padding-left: 1rem;
                }
                .drawer-sub.expanded {
                    max-height: 500px;
                    margin-top: 0.5rem;
                    margin-bottom: 1rem;
                }
                .drawer-sub-link {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1rem;
                    color: var(--c-text-muted);
                    font-weight: 600;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    cursor: pointer;
                }
                .drawer-sub-link:hover {
                    color: var(--c-primary);
                    background: var(--c-primary-light);
                }
                .drawer-nested {
                    max-height: 0;
                    overflow: hidden;
                    transition: all 0.3s var(--ease-out);
                    padding-left: 1.5rem;
                }
                .drawer-nested.expanded {
                    max-height: 300px;
                    margin-bottom: 0.5rem;
                }
                .drawer-nested-link {
                    display: block;
                    padding: 0.5rem 1rem;
                    color: var(--c-text-muted);
                    font-weight: 500;
                    text-decoration: none;
                    font-size: 0.9rem;
                    border-radius: 6px;
                }
                .drawer-nested-link:hover {
                    color: var(--c-primary);
                    background: var(--c-primary-light);
                }
                .drawer-nested-link.sublink-mobile {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    margin-left: 1rem;
                    margin-top: 0.25rem;
                    padding: 0.5rem 0.75rem;
                    background: linear-gradient(135deg, var(--c-primary-light), rgba(16, 185, 129, 0.08));
                    color: var(--c-primary-dark);
                    font-size: 0.8rem;
                    font-weight: 600;
                    border-radius: 8px;
                    border: 1px solid rgba(16, 185, 129, 0.15);
                }
                .drawer-nested-link.sublink-mobile:hover {
                    background: var(--c-primary);
                    color: white;
                    border-color: var(--c-primary);
                }
                .drawer-chevron.small {
                    opacity: 0.5;
                }
                .drawer-footer {
                    padding: 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: grid;
                    gap: 0.75rem;
                }
                .btn-solid.full, .btn-ghost.full {
                    justify-content: center;
                    width: 100%;
                }
                .mobile-burger {
                    display: none;
                    background: #f1f5f9;
                    border: none;
                    width: 42px;
                    height: 42px;
                    border-radius: 10px;
                    align-items: center;
                    justify-content: center;
                    color: var(--c-text-main);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .mobile-burger:hover {
                    background: var(--c-primary-light);
                    color: var(--c-primary);
                }

                @media (max-width: 1024px) {
                    .desktop-nav, .header-actions {
                        display: none;
                    }
                    .mobile-burger {
                        display: flex;
                    }
                }
                @media (max-width: 768px) {
                    .main-header {
                        height: 72px;
                    }
                    .header-container {
                        padding: 0 1rem;
                    }
                    .brand-icon {
                        width: 56px;
                        height: 56px;
                    }
                    .mobile-burger {
                        width: 38px;
                        height: 38px;
                    }
                    .drawer-header {
                        padding: 1rem;
                    }
                    .drawer-content {
                        padding: 0.75rem;
                    }
                    .drawer-link {
                        font-size: 1rem;
                    }
                }
            `}</style>
        </>
    );
}
