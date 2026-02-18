"use client";

import Image from "next/image";
import { Link, usePathname, useRouter } from "@/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import styles from "./Header.module.css";
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Factory,
  FileText,
  Globe,
  Mail,
  Menu,
  Microscope,
  Phone,
  Search,
  Sprout,
  Truck,
  Users,
  X,
} from "lucide-react";
import SearchModal from "../ui/SearchModal";

type NavSubItem = {
  name: string;
  href: any;
  description?: string;
  icon?: ReactNode;
  subItems?: NavSubItem[];
};

type NavItem = {
  name: string;
  href: any;
  icon?: ReactNode;
  subItems?: NavSubItem[];
};

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
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isRtl = locale === "ar";

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeNestedDropdown, setActiveNestedDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLocale = (nextLocale: string) => {
    router.replace(pathname as any, { locale: nextLocale });
  };

  const getLocalized = <T extends Record<string, any>>(obj: T, key: string): string => {
    const base = obj?.[key];
    if (locale === "ar") {
      const ar = obj?.[`${key}_ar`];
      return (ar || base || "") as string;
    }
    return (base || "") as string;
  };

  const productSubItems: NavSubItem[] = (productCategories ?? []).map((category) => {
    const name = getLocalized(category as any, "name");
    const description = getLocalized(category as any, "description");

    const children = category.children ?? [];
    const subItems = children.length
      ? children.map((child) => ({
          name: getLocalized(child as any, "name"),
          href: `/product-category/${child.slug}` as any,
          icon: <Sprout size={16} />,
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

  const navItems: NavItem[] = [
    {
      name: t("productOffer"),
      href: "/products",
      icon: <Award size={18} />,
      subItems: productSubItems,
    },
    {
      name: t("about"),
      href: "/about",
      icon: <Users size={18} />,
      subItems: [
        { name: t("about"), href: "/about", icon: <Users size={18} />, description: t("about") },
        { name: t("rdCentre"), href: "/about/rd-centre", icon: <Microscope size={18} /> },
        { name: t("productionPlants"), href: "/about/production-plants", icon: <Factory size={18} /> },
        { name: t("logisticsCentre"), href: "/about/logistics-centre", icon: <Truck size={18} /> },
        { name: t("companyData"), href: "/about/company-data", icon: <FileText size={18} /> },
        { name: t("career"), href: "/about/career", icon: <Users size={18} /> },
        { name: t("certificates"), href: "/about/certificates", icon: <Award size={18} /> },
        { name: t("awards"), href: "/about/awards", icon: <Award size={18} /> },
      ],
    },
    { name: t("news"), href: "/blog", icon: <BookOpen size={18} /> },
    { name: t("catalogs"), href: "/catalogs", icon: <FileText size={18} /> },
    {
      name: t("contact"),
      href: "/contact",
      icon: <Phone size={18} />,
      subItems: [
        { name: t("companyHeadquarter"), href: "/contact/headquarter", icon: <Factory size={18} /> },
        { name: t("exportDepartment"), href: "/contact/export-department", icon: <Globe size={18} /> },
        { name: t("localRepresentatives"), href: "/contact/local-representatives", icon: <Users size={18} /> },
        { name: t("contactForm"), href: "/contact", icon: <Mail size={18} /> },
      ],
    },
  ];

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setActiveNestedDropdown(null);
    }, 120);
  };

  const toggleMobileItem = (name: string) => {
    setMobileExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActivePath = (href: any) => {
    const url = String(href ?? "");
    if (!url.startsWith("/")) return false;
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <>
      <header
        className={[
          "sticky top-0 z-[1000] border-b transition-colors duration-200",
          isScrolled ? "bg-white/85 backdrop-blur-xl border-slate-200/60" : "bg-white border-transparent",
          styles.header,
          styles.bar,
          isScrolled ? styles.barScrolled : "",
          isScrolled ? styles.headerScrolled : "",
        ].join(" ")}
      >
        <div className={["mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", styles.container].join(" ")}>
          <div className={["flex items-center justify-between py-3 sm:py-4", styles.row].join(" ")}>
            <div className={["flex items-center gap-3", styles.brand].join(" ")}>
              <Link href="/" className={["group", styles.logoLink].join(" ")}>
                <div className={[styles.logoWrap, isScrolled ? styles.logoWrapScrolled : ""].join(" ")}>
                  <Image
                    src="/images/logo.png"
                    alt="KINT Logo"
                    fill
                    priority
                    className={styles.logoImg}
                  />
                </div>
              </Link>
            </div>

            <nav className={["hidden xl:flex items-center gap-1", styles.navDesktop].join(" ")}>
              {navItems.map((item) => {
                const open = activeDropdown === item.name;
                const hasDropdown = !!item.subItems?.length;
                const active = isActivePath(item.href);
                const dropdownCount = item.subItems?.length ?? 0;
                const gridCols =
                  dropdownCount > 18 ? "xl:grid-cols-3" : dropdownCount > 10 ? "xl:grid-cols-2" : "grid-cols-1";

                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={item.href}
                      className={[
                        "group flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                        active ? "text-primary bg-primary/8" : "text-slate-700 hover:text-primary hover:bg-slate-100/70",
                        styles.navLink,
                        active ? styles.navLinkActive : "",
                      ].join(" ")}
                      aria-haspopup={hasDropdown ? "menu" : undefined}
                      aria-expanded={hasDropdown ? open : undefined}
                    >
                      <span className="whitespace-nowrap">{item.name}</span>
                      {hasDropdown && (
                        <ChevronDown
                          size={14}
                          className={[
                            "transition-transform duration-200",
                            open ? "rotate-180 text-primary" : "text-slate-400 group-hover:text-primary",
                          ].join(" ")}
                        />
                      )}
                    </Link>

                    {hasDropdown && (
                      <div
                        className={[
                          "absolute top-full mt-2 min-w-[280px] max-w-[calc(100vw-2rem)]",
                          isRtl ? "right-0" : "left-0",
                          "transition-all duration-200 origin-top",
                          open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none",
                          open ? styles.dropdownOpen : "",
                        ].join(" ")}
                      >
                        <div className={["rounded-2xl border border-slate-200/60 bg-white shadow-xl ring-1 ring-slate-900/5 overflow-hidden", styles.dropdownPanel].join(" ")}>
                          <div className={["max-h-[70vh] overflow-auto p-2", styles.dropdownScroller].join(" ")}>
                            <div className={["grid gap-1", gridCols, styles.dropdownGrid].join(" ")}>
                              {item.subItems!.map((sub) => {
                                const nestedOpen = activeNestedDropdown === sub.name;
                                const hasNested = !!sub.subItems?.length;

                                return (
                                  <div
                                    key={sub.name}
                                    className="relative"
                                    onMouseEnter={() => hasNested && setActiveNestedDropdown(sub.name)}
                                    onMouseLeave={() => hasNested && setActiveNestedDropdown(null)}
                                  >
                                    <Link
                                      href={sub.href}
                                      className={[
                                        "group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-100/70",
                                        styles.dropdownItem,
                                      ].join(" ")}
                                    >
                                      <span className={["mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all group-hover:bg-primary group-hover:text-white", styles.dropdownIcon].join(" ")}>
                                        {sub.icon || <ChevronRight size={18} />}
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span className={["block text-sm font-bold text-slate-800 group-hover:text-primary", styles.dropdownTitle].join(" ")}>
                                          {sub.name}
                                        </span>
                                        {sub.description && (
                                          <span className={["mt-0.5 block text-xs text-slate-500 line-clamp-2", styles.dropdownDesc].join(" ")}>
                                            {sub.description}
                                          </span>
                                        )}
                                      </span>
                                      {hasNested && (
                                        <ChevronRight
                                          size={14}
                                          className={[
                                            "mt-1 text-slate-300 transition-all",
                                            isRtl ? "rotate-180" : "",
                                            "group-hover:text-primary",
                                          ].join(" ")}
                                        />
                                      )}
                                    </Link>

                                    {hasNested && (
                                      <div
                                        className={[
                                          "absolute top-0 w-[260px] p-2 rounded-2xl border border-slate-200/60 bg-white shadow-xl ring-1 ring-slate-900/5",
                                          isRtl ? "right-full mr-3 origin-right" : "left-full ml-3 origin-left",
                                          "transition-all duration-200",
                                          nestedOpen ? "opacity-100 visible translate-x-0" : "opacity-0 invisible pointer-events-none",
                                          isRtl ? "translate-x-2" : "-translate-x-2",
                                          nestedOpen ? styles.nestedOpen : "",
                                        ].join(" ")}
                                      >
                                        <div className={styles.nestedPanel}>
                                          {sub.subItems!.map((nested) => (
                                          <Link
                                            key={nested.name}
                                            href={nested.href}
                                            className={[
                                              "block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100/70 hover:text-primary",
                                              styles.nestedLink,
                                            ].join(" ")}
                                          >
                                            {nested.name}
                                          </Link>
                                        ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className={["flex items-center gap-2 sm:gap-3", styles.actions].join(" ")}>
              <button
                type="button"
                className={[
                  "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 p-2 text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-primary",
                  styles.iconBtn,
                ].join(" ")}
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>

              <div className={["hidden sm:flex items-center rounded-full border border-slate-200 bg-white/70 p-1 shadow-sm", styles.langSwitch].join(" ")}>
                <button
                  type="button"
                  className={[
                    "px-3 py-1 rounded-full text-xs font-extrabold transition-all",
                    styles.langBtn,
                    locale === "en" ? styles.langBtnActive : styles.langBtnInactive,
                  ].join(" ")}
                  onClick={() => switchLocale("en")}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={[
                    "px-3 py-1 rounded-full text-xs font-extrabold transition-all",
                    styles.langBtn,
                    locale === "ar" ? styles.langBtnActive : styles.langBtnInactive,
                  ].join(" ")}
                  onClick={() => switchLocale("ar")}
                >
                  AR
                </button>
              </div>

              <button
                type="button"
                className={[
                  "xl:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 p-2.5 text-slate-800 shadow-sm transition-all hover:bg-slate-50",
                  styles.burger,
                ].join(" ")}
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Menu"
              >
                <Menu size={22} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-[1001] bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200 xl:hidden",
          mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible",
          styles.mobileOverlay,
          mobileMenuOpen ? styles.mobileOverlayVisible : "",
          mobileMenuOpen ? styles.mobileOverlayOpen : "",
        ].join(" ")}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={[
          "fixed inset-y-0 z-[1002] w-[320px] sm:w-[380px] bg-white shadow-2xl transition-transform duration-200 ease-out xl:hidden flex flex-col",
          isRtl ? "left-0" : "right-0",
          styles.mobileDrawer,
          mobileMenuOpen ? styles.mobileDrawerOpenState : "",
          mobileMenuOpen ? styles.mobileDrawerOpen : "",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={styles.mobileLogoWrap}>
              <Image src="/images/logo.png" alt="KINT Logo" fill className={styles.mobileLogoImg} />
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 hover:text-red-600"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className={["flex-1 overflow-y-auto px-5 py-5", styles.mobileBody].join(" ")}>
          <button
            type="button"
            className={[
              "w-full flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-primary/30",
              styles.mobileSearchBtn,
            ].join(" ")}
            onClick={() => {
              setMobileMenuOpen(false);
              setIsSearchOpen(true);
            }}
          >
            <Search size={18} strokeWidth={2.5} />
            <span>{t("searchPlaceholder") || "Search..."}</span>
          </button>

          <div className={["mt-5 space-y-2", styles.mobileList].join(" ")}>
            {navItems.map((item) => {
              const hasDropdown = !!item.subItems?.length;
              const expanded = !!mobileExpanded[item.name];

              if (!hasDropdown) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={[
                      "flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-800 transition-colors hover:bg-slate-50",
                      styles.mobileCard,
                      styles.mobileLink,
                    ].join(" ")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-slate-400">{item.icon}</span>
                      {item.name}
                    </span>
                    <ChevronRight size={16} className={isRtl ? "rotate-180 text-slate-300" : "text-slate-300"} />
                  </Link>
                );
              }

              return (
                <div key={item.name} className={["rounded-2xl border border-slate-200 bg-white overflow-hidden", styles.mobileCard].join(" ")}>
                  <div className={["flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50", styles.mobileGroupHeader].join(" ")}>
                    <Link
                      href={item.href}
                      className="flex min-w-0 flex-1 items-center gap-3 text-sm font-extrabold text-slate-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-slate-400">{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                    <button
                      type="button"
                      className={[
                        "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 p-2 text-slate-700 shadow-sm transition-colors hover:bg-white",
                        styles.mobileToggleBtn,
                      ].join(" ")}
                      onClick={() => toggleMobileItem(item.name)}
                      aria-expanded={expanded}
                      aria-label="Toggle"
                    >
                      <ChevronDown
                        size={18}
                        className={["transition-transform duration-200", expanded ? "rotate-180" : ""].join(" ")}
                      />
                    </button>
                  </div>
                  <div className={["grid transition-all duration-200", expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"].join(" ")}>
                    <div className={["overflow-hidden px-3 pb-3", styles.mobileSubWrap].join(" ")}>
                      <div className={["mt-1 space-y-1", styles.mobileSubList].join(" ")}>
                        {item.subItems!.map((sub) => (
                          <div key={sub.name}>
                            <Link
                              href={sub.href}
                              className={[
                                "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary",
                                styles.mobileSubLink,
                              ].join(" ")}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-slate-400">{sub.icon}</span>
                                {sub.name}
                              </span>
                              <ChevronRight size={14} className={isRtl ? "rotate-180 text-slate-300" : "text-slate-300"} />
                            </Link>
                            {sub.subItems?.length ? (
                              <div className={["mt-1 space-y-1", isRtl ? "pr-4" : "pl-4", styles.mobileNestedList].join(" ")}>
                                {sub.subItems.map((nested) => (
                                  <Link
                                    key={nested.name}
                                    href={nested.href}
                                    className={[
                                      "block rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary",
                                      styles.mobileNestedLink,
                                    ].join(" ")}
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {nested.name}
                                  </Link>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-5">
          <div className={["flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm", styles.mobileLangSwitch].join(" ")}>
            <button
              type="button"
              className={[
                "flex-1 py-2 rounded-xl text-sm font-extrabold transition-all",
                styles.mobileLangBtn,
                locale === "en" ? styles.mobileLangBtnActive : styles.mobileLangBtnInactive,
              ].join(" ")}
              onClick={() => switchLocale("en")}
            >
              English
            </button>
            <button
              type="button"
              className={[
                "flex-1 py-2 rounded-xl text-sm font-extrabold transition-all",
                styles.mobileLangBtn,
                locale === "ar" ? styles.mobileLangBtnActive : styles.mobileLangBtnInactive,
              ].join(" ")}
              onClick={() => switchLocale("ar")}
            >
              العربية
            </button>
          </div>

        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
