import prisma from "@/lib/prisma";
import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import { unstable_cache } from "next/cache";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams?: Promise<{ q?: string }>;
}

const getAdminDashboardStats = unstable_cache(
    async () => {
        const rows = await prisma.$queryRaw<Array<{
            products: bigint | number;
            categories: bigint | number;
            animalTypes: bigint | number;
            blogs: bigint | number;
            inquiries: bigint | number;
            crops: bigint | number;
            expertArticles: bigint | number;
            jobOffers: bigint | number;
            jobApplications: bigint | number;
            headquarter: bigint | number;
            catalogs: bigint | number;
        }>>`
            SELECT
                (SELECT COUNT(*) FROM \`products\`) AS products,
                (SELECT COUNT(*) FROM \`categories\`) AS categories,
                (SELECT COUNT(*) FROM \`animal_types\`) AS animalTypes,
                (SELECT COUNT(*) FROM \`blog_posts\`) AS blogs,
                (SELECT COUNT(*) FROM \`contact_submissions\` WHERE \`isRead\` = 0) AS inquiries,
                (SELECT COUNT(*) FROM \`crops\`) AS crops,
                (SELECT COUNT(*) FROM \`expert_articles\`) AS expertArticles,
                (SELECT COUNT(*) FROM \`job_offers\`) AS jobOffers,
                (SELECT COUNT(*) FROM \`job_applications\` WHERE \`status\` = 'pending') AS jobApplications,
                (SELECT COUNT(*) FROM \`headquarters\`) AS headquarter,
                (SELECT COUNT(*) FROM \`catalogs\`) AS catalogs
        `;

        const row = rows[0];
        return {
            products: Number(row?.products ?? 0),
            categories: Number(row?.categories ?? 0),
            animalTypes: Number(row?.animalTypes ?? 0),
            blogs: Number(row?.blogs ?? 0),
            inquiries: Number(row?.inquiries ?? 0),
            crops: Number(row?.crops ?? 0),
            expertArticles: Number(row?.expertArticles ?? 0),
            jobOffers: Number(row?.jobOffers ?? 0),
            jobApplications: Number(row?.jobApplications ?? 0),
            headquarter: Number(row?.headquarter ?? 0),
            catalogs: Number(row?.catalogs ?? 0),
        };
    },
    ["admin-dashboard-stats"],
    { revalidate: 15 }
);

export default async function AdminDashboard({ searchParams }: PageProps) {
    const t = await getTranslations('AdminDashboard');
    const params = (await searchParams) || {};
    const query = (params.q || '').trim().toLowerCase();

    let stats = {
        products: 0,
        categories: 0,
        animalTypes: 0,
        blogs: 0,
        inquiries: 0,
        crops: 0,
        expertArticles: 0,
        jobOffers: 0,
        jobApplications: 0,
        headquarter: 0,
        catalogs: 0,
    };

    try {
        stats = await getAdminDashboardStats();
    } catch {
        console.log("Database not connected yet, showing empty stats");
    }

    const statCards = [
        { label: t('totalProducts'), value: stats.products, icon: '📦', color: '#10b981', href: '/admin/products' },
        { label: t('animalTypes'), value: stats.animalTypes, icon: '🐾', color: '#6366f1', href: '/admin/animal-types' },
        { label: t('cropGuides'), value: stats.crops, icon: '🌾', color: '#22c55e', href: '/admin/crops' },
        { label: t('expertArticles'), value: stats.expertArticles, icon: '🎓', color: '#8b5cf6', href: '/admin/expert-articles' },
        { label: t('blogPosts'), value: stats.blogs, icon: '📝', color: '#f59e0b', href: '/admin/blog' },
        { label: t('catalogs'), value: stats.catalogs, icon: '📚', color: '#3b82f6', href: '/admin/catalogs' },
        { label: t('jobOffers'), value: stats.jobOffers, icon: '💼', color: '#ec4899', href: '/admin/career' },
        { label: t('newApplications'), value: stats.jobApplications, icon: '📬', color: '#ef4444', href: '/admin/applications' },
        { label: t('companyHeadquarter'), value: stats.headquarter, icon: '🏢', color: '#14b8a6', href: '/admin/headquarter' },
        { label: t('contactInquiries'), value: stats.inquiries, icon: '📧', color: '#06b6d4', href: '/admin/inquiries' },
    ].filter((stat) => !query || stat.label.toLowerCase().includes(query));

    const quickActions = [
        { href: '/admin/products/new', icon: '📦', label: t('addProduct') },
        { href: '/admin/crops/new', icon: '🌾', label: t('addCropGuide') },
        { href: '/admin/expert-articles/new', icon: '🎓', label: t('addArticle') },
        { href: '/admin/blog/new', icon: '📝', label: t('writeBlogPost') },
        { href: '/admin/career', icon: '💼', label: t('manageJobs') },
        { href: '/admin/catalogs/new', icon: '📚', label: t('addCatalog') },
        { href: '/admin/animal-types/new', icon: '🐾', label: t('addAnimalType') },
        { href: '/admin/categories', icon: '🧩', label: t('manageCompanySections') },
    ].filter((action) => !query || action.label.toLowerCase().includes(query));

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>{t('overview')}</h1>
                    <p>{t('welcome')}</p>
                    <form action="/admin" method="get" style={{ marginTop: '1rem', maxWidth: '420px' }}>
                        <input
                            type="search"
                            name="q"
                            defaultValue={params.q || ''}
                            className="input"
                            style={{ width: '100%' }}
                            placeholder={t('dashboardSearchPlaceholder')}
                        />
                    </form>
                </div>
                <div className="header-actions">
                    <Link href="/" target="_blank" className="btn-view-site">
                        🌐 {t('viewWebsite')}
                    </Link>
                </div>
            </div>

            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <Link key={index} href={stat.href as any} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <p>{stat.label}</p>
                            <h3>{stat.value}</h3>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="card quick-actions">
                    <h3>{t('quickActions')}</h3>
                    <div className="actions-grid">
                        {quickActions.map((action, index) => (
                            <Link key={index} href={action.href as any} className="action-btn">
                                <span className="action-icon">{action.icon}</span>
                                <span>{action.label}</span>
                            </Link>
                        ))}
                        {quickActions.length === 0 && (
                            <p className="empty-message">{t('dashboardSearchNoResults')}</p>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h3>{t('recentInquiries')}</h3>
                        <div className="inquiries-list">
                            {stats.inquiries > 0 ? (
                                <Link href="/admin/inquiries" className="inquiry-item">
                                    <span className="inquiry-count">{stats.inquiries}</span>
                                    <span>{t('unreadInquiries')}</span>
                                    <span className="arrow">→</span>
                                </Link>
                            ) : (
                                <p className="empty-message">{t('noInquiries')}</p>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <h3>{t('jobApplications')}</h3>
                        <div className="inquiries-list">
                            {stats.jobApplications > 0 ? (
                                <Link href="/admin/applications" className="inquiry-item">
                                    <span className="inquiry-count">{stats.jobApplications}</span>
                                    <span>{t('newApps')}</span>
                                    <span className="arrow">→</span>
                                </Link>
                            ) : (
                                <p className="empty-message">{t('noApps')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
