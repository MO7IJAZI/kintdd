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
            <header 
                className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ease-in-out border-b ${
                    isScrolled 
                        ? 'h-16 bg-white/95 backdrop-blur-md shadow-sm border-gray-200/50' 
                        : 'h-24 bg-white border-transparent'
                }`}
            >
                <div className="container h-full mx-auto px-4 lg:px-8 flex items-center justify-between">
                    
                    {/* Logo */}
                    <Link href="/" className="relative z-10 flex items-center group">
                        <div className={`relative transition-all duration-500 ${isScrolled ? 'w-12 h-12' : 'w-16 h-16'}`}>
                            <Image 
                                src="/images/logo.png" 
                                alt="KINT Logo" 
                                fill
                                className="object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1 h-full">
                        {navItems.map((item) => (
                            <div
                                key={item.name}
                                className="relative h-full flex items-center px-1"
                                onMouseEnter={() => handleMouseEnter(item.name)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Link
                                    href={item.href}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full text-[0.95rem] font-medium transition-all duration-300
                                        ${pathname.startsWith(item.href) && item.href !== '/' 
                                            ? 'text-primary bg-primary/5' 
                                            : 'text-slate-700 hover:text-primary hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <span>{item.name}</span>
                                    {item.subItems && (
                                        <ChevronDown 
                                            size={14} 
                                            className={`transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180 text-primary' : 'text-slate-400'}`} 
                                        />
                                    )}
                                </Link>

                                {/* Dropdown Menu */}
                                {item.subItems && (
                                    <div 
                                        className={`
                                            absolute top-full left-1/2 -translate-x-1/2 pt-4 w-max
                                            transition-all duration-300 origin-top
                                            ${activeDropdown === item.name 
                                                ? 'opacity-100 visible translate-y-0 scale-100' 
                                                : 'opacity-0 invisible -translate-y-2 scale-95 pointer-events-none'
                                            }
                                        `}
                                    >
                                        <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden ring-1 ring-slate-900/5 min-w-[280px]">
                                            {/* Dropdown Grid */}
                                            <div className={`grid gap-1 ${item.subItems.length > 6 ? 'grid-cols-2 min-w-[550px]' : 'grid-cols-1'}`}>
                                                {item.subItems.map((sub, idx) => (
                                                    <div 
                                                        key={sub.name} 
                                                        className="relative group/sub"
                                                        onMouseEnter={() => sub.subItems && setActiveNestedDropdown(sub.name)}
                                                        onMouseLeave={() => sub.subItems && setActiveNestedDropdown(null)}
                                                    >
                                                        <Link 
                                                            href={sub.href} 
                                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                                                        >
                                                            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-500 group-hover/sub:bg-primary group-hover/sub:text-white group-hover/sub:rotate-3 transition-all duration-300 shadow-sm">
                                                                {sub.icon || <ChevronRight size={18} />}
                                                            </span>
                                                            <div className="flex-1">
                                                                <span className="block text-sm font-semibold text-slate-700 group-hover/sub:text-primary transition-colors">
                                                                    {sub.name}
                                                                </span>
                                                                {sub.description && (
                                                                    <span className="block text-xs text-slate-400 mt-0.5 line-clamp-1 group-hover/sub:text-slate-500">
                                                                        {sub.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {sub.subItems && (
                                                                <ChevronRight size={14} className="text-slate-300 group-hover/sub:text-primary group-hover/sub:translate-x-1 transition-all" />
                                                            )}
                                                        </Link>

                                                        {/* Nested Dropdown */}
                                                        {sub.subItems && (
                                                            <div 
                                                                className={`
                                                                    absolute left-[calc(100%-10px)] top-0 ml-4 p-2 w-[240px]
                                                                    bg-white rounded-xl shadow-xl border border-slate-100 ring-1 ring-slate-900/5
                                                                    transition-all duration-300 origin-left
                                                                    ${activeNestedDropdown === sub.name 
                                                                        ? 'opacity-100 visible translate-x-0' 
                                                                        : 'opacity-0 invisible -translate-x-2 pointer-events-none'
                                                                    }
                                                                `}
                                                                style={{ zIndex: 50 }}
                                                            >
                                                                {sub.subItems.map((nested) => (
                                                                    <Link 
                                                                        key={nested.name} 
                                                                        href={nested.href} 
                                                                        className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors"
                                                                    >
                                                                        {nested.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Header Actions */}
                    <div className="flex items-center gap-3 lg:gap-4">
                        <button 
                            className="p-2.5 rounded-full text-slate-600 hover:bg-slate-100 hover:text-primary transition-all duration-300 hidden lg:flex" 
                            onClick={() => setIsSearchOpen(true)}
                            aria-label="Search"
                        >
                            <Search size={20} strokeWidth={2.5} />
                        </button>
                        
                        <div className="hidden lg:flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                            <button 
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${locale === 'en' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
                                onClick={() => switchLocale('en')}
                            >EN</button>
                            <button 
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${locale === 'ar' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
                                onClick={() => switchLocale('ar')}
                            >AR</button>
                        </div>

                        <Link 
                            href="/contact" 
                            className="hidden lg:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <span>{t('contact')}</span>
                            <ChevronRight size={16} />
                        </Link>

                        <button 
                            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" 
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Menu"
                        >
                            <Menu size={28} strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <div 
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1001] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
                onClick={() => setMobileMenuOpen(false)}
            />
            <div 
                className={`fixed inset-y-0 right-0 w-[300px] sm:w-[360px] bg-white z-[1002] shadow-2xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-5 flex items-center justify-between border-b border-slate-100">
                    <span className="text-lg font-bold text-slate-800">{t('menu') || "Menu"}</span>
                    <button 
                        className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors" 
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Search in Mobile */}
                    <div className="relative">
                        <button 
                            className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-500 text-sm hover:border-primary/30 transition-colors"
                            onClick={() => {
                                setMobileMenuOpen(false);
                                setIsSearchOpen(true);
                            }}
                        >
                            <Search size={18} />
                            <span>{t('searchPlaceholder') || "Search..."}</span>
                        </button>
                    </div>

                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <div key={item.name} className="border-b border-slate-50 last:border-0 pb-2 mb-2 last:mb-0 last:pb-0">
                                {item.subItems ? (
                                    <>
                                        <button 
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${mobileExpanded[item.name] ? 'bg-primary/5 text-primary' : 'text-slate-700 hover:bg-slate-50'}`}
                                            onClick={() => toggleMobileItem(item.name)}
                                        >
                                            <span className="flex items-center gap-3 font-semibold">
                                                {item.icon && <span className={`text-lg ${mobileExpanded[item.name] ? 'text-primary' : 'text-slate-400'}`}>{item.icon}</span>}
                                                {item.name}
                                            </span>
                                            <ChevronDown size={18} className={`transition-transform duration-300 ${mobileExpanded[item.name] ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div 
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileExpanded[item.name] ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="pl-4 border-l-2 border-slate-100 ml-4 space-y-1">
                                                {item.subItems.map((sub) => (
                                                    <div key={sub.name}>
                                                        <Link 
                                                            href={sub.href} 
                                                            className="block py-2 px-3 rounded-lg text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors"
                                                            onClick={() => setMobileMenuOpen(false)}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                        {sub.subItems && (
                                                            <div className="pl-4 mt-1 mb-2 space-y-1">
                                                                {sub.subItems.map(nested => (
                                                                    <Link 
                                                                        key={nested.name}
                                                                        href={nested.href}
                                                                        className="block py-1.5 px-3 text-xs text-slate-500 hover:text-primary transition-colors border-l border-slate-200"
                                                                        onClick={() => setMobileMenuOpen(false)}
                                                                    >
                                                                        {nested.name}
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
                                        className="flex items-center gap-3 p-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.icon && <span className="text-slate-400 text-lg">{item.icon}</span>}
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 mb-4 shadow-sm">
                        <button 
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${locale === 'en' ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`} 
                            onClick={() => switchLocale('en')}
                        >English</button>
                        <button 
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${locale === 'ar' ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`} 
                            onClick={() => switchLocale('ar')}
                        >العربية</button>
                    </div>
                    <Link 
                        href="/admin" 
                        className="block w-full py-3 text-center rounded-xl border-2 border-primary/20 text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300"
                    >
                        Customer Portal
                    </Link>
                </div>
            </div>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}