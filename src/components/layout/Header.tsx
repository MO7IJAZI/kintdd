"use client";

import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/navigation';
import { useState, useEffect, useRef } from 'react';
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
    BookOpen,
    Search,
    Phone,
    MapPin
} from 'lucide-react';
import SearchModal from '../ui/SearchModal';

// --- Types ---

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
    icon?: React.ReactNode;
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

// --- Component ---

export default function Header({ productCategories }: HeaderProps) {
    const t = useTranslations('Navigation');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    // State
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [activeNestedDropdown, setActiveNestedDropdown] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Refs for hover timeout management
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Locale Switcher
    const switchLocale = (nextLocale: string) => {
        router.replace(pathname as any, {locale: nextLocale});
    };

    // --- Navigation Data Construction ---

    // Helper to get localized text
    const getLocalized = (obj: any, key: string) => {
        if (locale === 'ar') {
            return obj[`${key}_ar`] || obj[key];
        }
        return obj[key];
    };

    // Map Product Categories to Nav Structure
    const productNavItems: NavItem[] = (productCategories ?? [])
        .map((category) => {
            const name = getLocalized(category, 'name');
            const description = getLocalized(category, 'description');
            
            const children = category.children ?? [];
            const subItems = children.length
                ? children.map((child) => ({
                    name: getLocalized(child, 'name'),
                    href: `/product-category/${child.slug}` as any,
                    icon: <Sprout size={16} />
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

    // Full Nav Configuration
    const navItems: NavItem[] = [
        {
            name: t('productOffer'),
            href: '/products',
            icon: <Award size={18} />,
            subItems: productNavItems as unknown as SubItem[]
        },
        {
            name: t('about'),
            href: '/about',
            icon: <Users size={18} />,
            subItems: [
                { name: t('about'), href: '/about', icon: <Users size={18} />, description: t('about') },
                { name: t('rdCentre'), href: '/about/rd-centre', icon: <Microscope size={18} /> },
                { name: t('productionPlants'), href: '/about/production-plants', icon: <Factory size={18} /> },
                { name: t('logisticsCentre'), href: '/about/logistics-centre', icon: <Truck size={18} /> },
                { name: t('companyData'), href: '/about/company-data', icon: <FileText size={18} /> },
                { name: t('career'), href: '/about/career', icon: <Users size={18} /> },
                { name: t('certificates'), href: '/about/certificates', icon: <Award size={18} /> },
                { name: t('awards'), href: '/about/awards', icon: <Award size={18} /> },
            ]
        },
        { 
            name: t('news'), 
            href: '/blog',
            icon: <BookOpen size={18} /> 
        },
        {
            name: t('catalogs'),
            href: '/catalogs',
            icon: <FileText size={18} />
        },
        {
            name: t('contact'),
            href: '/contact',
            icon: <Phone size={18} />,
            subItems: [
                { name: t('companyHeadquarter'), href: '/contact/headquarter', icon: <Factory size={18} /> },
                { name: t('exportDepartment'), href: '/contact/export-department', icon: <Globe size={18} /> },
                { name: t('localRepresentatives'), href: '/contact/local-representatives', icon: <Users size={18} /> },
                { name: t('contactForm'), href: '/contact', icon: <Mail size={18} /> },
            ]
        }
    ];

    // --- Handlers ---

    const handleMouseEnter = (name: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveDropdown(name);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
            setActiveNestedDropdown(null);
        }, 150); // Small delay for better UX
    };

    const toggleMobileItem = (name: string) => {
        setMobileExpanded(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    return (
        <>
            <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container header-container">
                    
                    {/* Logo */}
                    <Link href="/" className="brand-logo">
                        <div className="brand-icon">
                            <Image 
                                src="/images/logo.png" 
                                alt="KINT Logo" 
                                width={isScrolled ? 60 : 72} 
                                height={isScrolled ? 60 : 72} 
                                className="logo-img"
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        {navItems.map((item) => (
                            <div
                                key={item.name}
                                className="nav-item-group"
                                onMouseEnter={() => handleMouseEnter(item.name)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Link
                                    href={item.href}
                                    className={`nav-link ${pathname.startsWith(item.href) && item.href !== '/' ? 'active' : ''}`}
                                >
                                    <span>{item.name}</span>
                                    {item.subItems && (
                                        <ChevronDown 
                                            size={14} 
                                            className={`chevron ${activeDropdown === item.name ? 'rotated' : ''}`} 
                                        />
                                    )}
                                </Link>

                                {/* Dropdown Menu */}
                                {item.subItems && (
                                    <div className={`dropdown-menu ${activeDropdown === item.name ? 'visible' : ''}`}>
                                        <div className="dropdown-bridge"></div>
                                        <div className="dropdown-inner">
                                            {item.subItems.map((sub, idx) => (
                                                <div 
                                                    key={sub.name} 
                                                    className="dropdown-item-wrapper"
                                                    style={{ '--delay': `${idx * 0.05}s` } as any}
                                                    onMouseEnter={() => sub.subItems && setActiveNestedDropdown(sub.name)}
                                                    onMouseLeave={() => sub.subItems && setActiveNestedDropdown(null)}
                                                >
                                                    <Link href={sub.href} className="dropdown-link">
                                                        <span className="icon-box">
                                                            {sub.icon || <ChevronRight size={16} />}
                                                        </span>
                                                        <div className="text-content">
                                                            <span className="title">{sub.name}</span>
                                                            {sub.description && <span className="desc">{sub.description}</span>}
                                                        </div>
                                                        {sub.subItems && <ChevronRight size={14} className="nested-chevron" />}
                                                    </Link>

                                                    {/* Nested Dropdown */}
                                                    {sub.subItems && (
                                                        <div className={`nested-menu ${activeNestedDropdown === sub.name ? 'visible' : ''}`}>
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

                    {/* Header Actions */}
                    <div className="header-actions">
                        <button 
                            className="action-btn search-btn" 
                            onClick={() => setIsSearchOpen(true)}
                            aria-label="Search"
                        >
                            <Search size={20} />
                        </button>
                        
                        <div className="lang-toggle">
                            <button 
                                className={locale === 'en' ? 'active' : ''} 
                                onClick={() => switchLocale('en')}
                            >EN</button>
                            <span className="divider">/</span>
                            <button 
                                className={locale === 'ar' ? 'active' : ''} 
                                onClick={() => switchLocale('ar')}
                            >AR</button>
                        </div>

                        <Link href="/contact" className="cta-btn">
                            {t('contact')}
                        </Link>

                        <button 
                            className="mobile-toggle" 
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Menu"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <div className={`mobile-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
            <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <span className="drawer-title">Menu</span>
                    <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                
                <div className="drawer-content">
                    <div className="drawer-search">
                        <button className="mobile-search-trigger" onClick={() => {
                            setMobileMenuOpen(false);
                            setIsSearchOpen(true);
                        }}>
                            <Search size={18} />
                            <span>{t('searchPlaceholder') || "Search..."}</span>
                        </button>
                    </div>

                    <div className="drawer-nav">
                        {navItems.map((item) => (
                            <div key={item.name} className="drawer-group">
                                {item.subItems ? (
                                    <>
                                        <button 
                                            className={`drawer-item has-sub ${mobileExpanded[item.name] ? 'active' : ''}`}
                                            onClick={() => toggleMobileItem(item.name)}
                                        >
                                            <span className="item-label">
                                                {item.icon && <span className="item-icon">{item.icon}</span>}
                                                {item.name}
                                            </span>
                                            <ChevronDown size={16} className={`arrow ${mobileExpanded[item.name] ? 'rotated' : ''}`} />
                                        </button>
                                        <div className={`drawer-submenu ${mobileExpanded[item.name] ? 'expanded' : ''}`}>
                                            <div className="submenu-inner">
                                                {item.subItems.map((sub) => (
                                                    <div key={sub.name}>
                                                        <Link 
                                                            href={sub.href} 
                                                            className="drawer-sublink"
                                                            onClick={() => setMobileMenuOpen(false)}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                        {sub.subItems && (
                                                            <div className="drawer-nested-list">
                                                                {sub.subItems.map(nested => (
                                                                    <Link 
                                                                        key={nested.name}
                                                                        href={nested.href}
                                                                        className="drawer-nested-link"
                                                                        onClick={() => setMobileMenuOpen(false)}
                                                                    >
                                                                        - {nested.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Link 
                                        href={item.href} 
                                        className="drawer-item"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="item-label">
                                            {item.icon && <span className="item-icon">{item.icon}</span>}
                                            {item.name}
                                        </span>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="drawer-footer">
                        <div className="mobile-lang">
                            <button 
                                className={locale === 'en' ? 'active' : ''} 
                                onClick={() => switchLocale('en')}
                            >English</button>
                            <button 
                                className={locale === 'ar' ? 'active' : ''} 
                                onClick={() => switchLocale('ar')}
                            >العربية</button>
                        </div>
                        <Link href="/admin" className="portal-link">
                            Customer Portal
                        </Link>
                    </div>
                </div>
            </div>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <style jsx>{`
                /* --- VARIABLES --- */
                :global(:root) {
                    --header-height: 80px;
                    --header-height-scrolled: 64px;
                    --c-primary: #e9496c;
                    --c-primary-dark: #d63d5c;
                    --c-primary-light: #fff0f3;
                    --c-text: #1e293b;
                    --c-text-light: #64748b;
                    --c-bg: #ffffff;
                    --c-border: #e2e8f0;
                    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    --radius: 12px;
                }

                /* --- HEADER LAYOUT --- */
                .main-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: var(--header-height);
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid transparent;
                    z-index: 1000;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .main-header.scrolled {
                    height: var(--header-height-scrolled);
                    background: rgba(255, 255, 255, 0.98);
                    border-bottom-color: var(--c-border);
                    box-shadow: var(--shadow-sm);
                }
                .header-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                /* --- LOGO --- */
                .brand-logo {
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    z-index: 10;
                }
                .logo-img {
                    width: auto;
                    height: 100%;
                    object-fit: contain;
                    transition: all 0.3s ease;
                }

                /* --- DESKTOP NAV --- */
                .desktop-nav {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    height: 100%;
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
                    gap: 0.35rem;
                    padding: 0.5rem 0.85rem;
                    color: var(--c-text);
                    font-weight: 500;
                    font-size: 0.95rem;
                    text-decoration: none;
                    border-radius: var(--radius);
                    transition: all 0.2s;
                }
                .nav-link:hover, .nav-link.active {
                    color: var(--c-primary);
                    background: var(--c-primary-light);
                }
                .chevron {
                    transition: transform 0.2s;
                    opacity: 0.5;
                }
                .chevron.rotated {
                    transform: rotate(180deg);
                }

                /* --- DROPDOWNS --- */
                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(10px);
                    padding-top: 10px; /* Bridge area */
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    pointer-events: none;
                }
                .dropdown-menu.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) translateY(0);
                    pointer-events: all;
                }
                
                /* Smart Alignment for edges */
                .nav-item-group:first-child .dropdown-menu {
                    left: 0;
                    transform: translateX(0) translateY(10px);
                }
                .nav-item-group:first-child .dropdown-menu.visible {
                    transform: translateX(0) translateY(0);
                }
                .nav-item-group:last-child .dropdown-menu {
                    left: auto;
                    right: 0;
                    transform: translateX(0) translateY(10px);
                }
                .nav-item-group:last-child .dropdown-menu.visible {
                    transform: translateX(0) translateY(0);
                }

                .dropdown-inner {
                    background: #ffffff;
                    border: 1px solid var(--c-border);
                    border-radius: 16px;
                    padding: 0.5rem;
                    box-shadow: var(--shadow-lg);
                    min-width: 260px;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2px;
                }
                /* Wide layout for items with many children */
                .nav-item-group:has(.dropdown-inner > :nth-child(6)) .dropdown-inner {
                    min-width: 500px;
                    grid-template-columns: 1fr 1fr;
                }

                .dropdown-item-wrapper {
                    position: relative;
                }
                .dropdown-link {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1rem;
                    text-decoration: none;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .dropdown-link:hover {
                    background: #f8fafc;
                }
                .dropdown-link:hover .icon-box {
                    background: var(--c-primary);
                    color: white;
                    transform: scale(1.1) rotate(-5deg);
                }
                .dropdown-link:hover .title {
                    color: var(--c-primary);
                }
                .icon-box {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f1f5f9;
                    color: var(--c-text-light);
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }
                .text-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .title {
                    font-weight: 600;
                    color: var(--c-text);
                    font-size: 0.95rem;
                    transition: color 0.2s;
                }
                .desc {
                    font-size: 0.8rem;
                    color: var(--c-text-light);
                    margin-top: 2px;
                }
                .nested-chevron {
                    opacity: 0.3;
                    transition: transform 0.2s;
                }
                .dropdown-link:hover .nested-chevron {
                    opacity: 1;
                    transform: translateX(3px);
                    color: var(--c-primary);
                }

                /* --- NESTED MENU --- */
                .nested-menu {
                    position: absolute;
                    left: 100%;
                    top: 0;
                    margin-left: 10px;
                    background: white;
                    border: 1px solid var(--c-border);
                    border-radius: 16px;
                    padding: 0.5rem;
                    min-width: 220px;
                    box-shadow: var(--shadow-lg);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateX(-10px);
                    transition: all 0.3s ease;
                }
                .nav-item-group:last-child .nested-menu,
                .nav-item-group:nth-last-child(2) .nested-menu {
                    left: auto;
                    right: 100%;
                    margin-left: 0;
                    margin-right: 10px;
                    transform: translateX(10px);
                }
                .nested-menu.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(0);
                }
                .nested-link {
                    display: block;
                    padding: 0.6rem 1rem;
                    color: var(--c-text);
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .nested-link:hover {
                    background: var(--c-primary-light);
                    color: var(--c-primary);
                }

                /* --- HEADER ACTIONS --- */
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .action-btn {
                    background: transparent;
                    border: none;
                    color: var(--c-text);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .action-btn:hover {
                    background: #f1f5f9;
                    color: var(--c-primary);
                }
                .lang-toggle {
                    display: flex;
                    align-items: center;
                    background: #f8fafc;
                    padding: 0.3rem 0.6rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    border: 1px solid var(--c-border);
                }
                .lang-toggle button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--c-text-light);
                    padding: 0 0.3rem;
                    transition: color 0.2s;
                    font-weight: inherit;
                }
                .lang-toggle button.active {
                    color: var(--c-primary);
                }
                .lang-toggle .divider {
                    color: #cbd5e1;
                    font-size: 0.7rem;
                }
                .cta-btn {
                    background: var(--c-primary);
                    color: white;
                    padding: 0.6rem 1.25rem;
                    border-radius: 50px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                    box-shadow: 0 4px 10px rgba(233, 73, 108, 0.3);
                }
                .cta-btn:hover {
                    background: var(--c-primary-dark);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 15px rgba(233, 73, 108, 0.4);
                }
                .mobile-toggle {
                    display: none;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--c-text);
                }

                /* --- MOBILE DRAWER --- */
                .mobile-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 1001;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s;
                    backdrop-filter: blur(4px);
                }
                .mobile-backdrop.open {
                    opacity: 1;
                    visibility: visible;
                }
                .mobile-drawer {
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 320px;
                    background: white;
                    z-index: 1002;
                    transform: translateX(100%);
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    flex-direction: column;
                }
                .mobile-drawer.open {
                    transform: translateX(0);
                }
                .drawer-header {
                    padding: 1.25rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--c-border);
                }
                .drawer-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                }
                .close-btn {
                    background: #f1f5f9;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--c-text);
                    transition: all 0.2s;
                }
                .close-btn:hover {
                    background: var(--c-primary-light);
                    color: var(--c-primary);
                    transform: rotate(90deg);
                }
                .drawer-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .mobile-search-trigger {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: #f8fafc;
                    border: 1px solid var(--c-border);
                    padding: 0.8rem 1rem;
                    border-radius: 12px;
                    color: var(--c-text-light);
                    font-size: 0.95rem;
                    cursor: pointer;
                }
                .drawer-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .drawer-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 0.9rem;
                    background: transparent;
                    border: none;
                    text-decoration: none;
                    color: var(--c-text);
                    font-weight: 600;
                    font-size: 1.05rem;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .drawer-item:hover, .drawer-item.active {
                    background: #f8fafc;
                    color: var(--c-primary);
                }
                .item-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .arrow {
                    transition: transform 0.3s;
                }
                .arrow.rotated {
                    transform: rotate(180deg);
                }
                .drawer-submenu {
                    overflow: hidden;
                    max-height: 0;
                    transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .drawer-submenu.expanded {
                    max-height: 500px;
                }
                .submenu-inner {
                    padding: 0.5rem 0 0.5rem 1.5rem;
                    border-left: 2px solid #f1f5f9;
                    margin-left: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .drawer-sublink {
                    display: block;
                    padding: 0.6rem;
                    text-decoration: none;
                    color: var(--c-text-light);
                    font-weight: 500;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .drawer-sublink:hover {
                    color: var(--c-primary);
                    background: var(--c-primary-light);
                }
                .drawer-nested-list {
                    padding-left: 1rem;
                    margin-top: 0.25rem;
                }
                .drawer-nested-link {
                    display: block;
                    padding: 0.4rem;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    text-decoration: none;
                }
                .drawer-nested-link:hover {
                    color: var(--c-primary);
                }

                .drawer-footer {
                    margin-top: auto;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--c-border);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .mobile-lang {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    background: #f8fafc;
                    padding: 0.5rem;
                    border-radius: 12px;
                }
                .mobile-lang button {
                    flex: 1;
                    padding: 0.5rem;
                    border: none;
                    background: none;
                    font-weight: 600;
                    color: var(--c-text-light);
                    border-radius: 8px;
                    cursor: pointer;
                }
                .mobile-lang button.active {
                    background: white;
                    color: var(--c-primary);
                    box-shadow: var(--shadow-sm);
                }
                .portal-link {
                    text-align: center;
                    padding: 0.8rem;
                    color: var(--c-primary);
                    font-weight: 600;
                    text-decoration: none;
                    border: 1px solid var(--c-primary);
                    border-radius: 50px;
                    transition: all 0.2s;
                }
                .portal-link:hover {
                    background: var(--c-primary-light);
                }

                /* --- RESPONSIVE --- */
                @media (max-width: 1024px) {
                    .desktop-nav, .cta-btn, .lang-toggle, .search-btn {
                        display: none;
                    }
                    .mobile-toggle {
                        display: block;
                    }
                }
            `}</style>
        </>
    );
}