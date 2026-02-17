import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            backgroundColor: '#0a0a0a',
            color: 'white',
            padding: '6rem 0 3rem',
            position: 'relative',
            overflow: 'hidden'
        }} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Subtle background decoration */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: isRtl ? 'auto' : '-100px',
                left: isRtl ? '-100px' : 'auto',
                width: '400px',
                height: '400px',
                backgroundColor: 'var(--primary)',
                opacity: 0.05,
                filter: 'blur(100px)',
                borderRadius: '50%'
            }} />

            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
                    gap: '4rem',
                    marginBottom: '5rem',
                    textAlign: isRtl ? 'right' : 'left'
                }}>
                    {/* Brand Section */}
                    <div>
                        <Link href="/" style={{
                            fontSize: '1.75rem',
                            fontWeight: 900,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '2rem'
                        }}>
                            <div style={{
                                width: '72px',
                                height: '72px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '10px',
                                backgroundColor: 'transparent',
                                overflow: 'hidden'
                            }}>
                                <Image src="/images/logo.png" alt="" width={72} height={72} style={{ objectFit: 'contain' }} />
                            </div>
                        </Link>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '2.5rem', fontSize: '1rem' }}>
                            {t('description')}
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                            <a href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>in</a>
                            <a href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>yt</a>
                            <a href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>fb</a>
                        </div>
                    </div>

                    {/* Quick Selection */}
                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '2rem', fontWeight: '700' }}>{t('productOffer')}</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li><Link href="/product-category/biostimulants" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }}>{t('biostimulants')}</Link></li>
                            <li><Link href="/product-category/activators" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }}>{t('activators')}</Link></li>
                            <li><Link href="/product-category/bioproducts" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }}>{t('bioproducts')}</Link></li>
                            <li><Link href="/product-category/foliar-fertilizers" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }}>{t('foliarFertilizers')}</Link></li>
                            <li><Link href="/product-category/organic-farming" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }}>{t('organicSolutions')}</Link></li>
                        </ul>
                    </div>

                    {/* Helpful Links */}
                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '2rem', fontWeight: '700' }}>{t('resources')}</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li><Link href="/crop-farming" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }}>{t('cropGuides')}</Link></li>
                            <li><Link href="/mixing-table" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }}>{t('mixingTable')}</Link></li>
                            <li><Link href="/about/rd-centre" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }}>{t('rdCentre')}</Link></li>
                            <li><Link href="/experts-forum" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }}>{t('expertForum')}</Link></li>
                            <li><Link href="/about" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }}>{t('companyProfile')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '2rem', fontWeight: '700' }}>{t('contactUs')}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'rgba(255,255,255,0.6)' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <span style={{ color: 'var(--primary)' }}>📍</span>
                                <span>{t('address')}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <span style={{ color: 'var(--primary)' }}>📞</span>
                                <span dir="ltr" style={{ unicodeBidi: 'plaintext' }}>+48 123 456 789</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <span style={{ color: 'var(--primary)' }}>✉️</span>
                                <span dir="ltr" style={{ unicodeBidi: 'plaintext' }}>contact@kint.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    paddingTop: '2rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                        © {currentYear} KINT. {t('rightsReserved')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
