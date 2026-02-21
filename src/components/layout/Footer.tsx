import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
    const t = useTranslations('Footer');
    const tNav = useTranslations('Navigation');
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                                <Image src="/images/logo.png" alt="KINT Logo" width={72} height={72} style={{ objectFit: 'contain' }} />
                            </div>
                        </Link>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '2.5rem', fontSize: '1rem' }}>
                            {t('description')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a 
                                href="https://www.facebook.com/share/1Aa6zbV7A2/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    border: '1px solid rgba(255,255,255,0.2)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    transition: '0.3s',
                                    color: 'white'
                                }}
                                className="hover:bg-primary hover:border-primary"
                            >
                                <Facebook size={20} />
                            </a>
                            <a 
                                href="https://www.instagram.com/kafri.international?igsh=MTZxdjNtYTNkemFncQ==" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    border: '1px solid rgba(255,255,255,0.2)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    transition: '0.3s',
                                    color: 'white'
                                }}
                                className="hover:bg-primary hover:border-primary"
                            >
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '2rem', fontWeight: '700' }}>{tNav('products')}</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li><Link href="/products/plant-wealth" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }} className="hover:text-primary">{tNav('agriculturalProducts')}</Link></li>
                            <li><Link href="/products/plant-wealth/crops" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }} className="hover:text-primary">{tNav('cropGuides')}</Link></li>
                            <li><Link href="/products/livestock" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }} className="hover:text-primary">{tNav('animalProducts')}</Link></li>
                            <li><Link href="/products/livestock/by-animal-type" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }} className="hover:text-primary">{tNav('byAnimalType')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Pages Section */}
                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '2rem', fontWeight: '700' }}>{tNav('contact')}</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li><Link href="/contact/headquarter" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }} className="hover:text-primary">{tNav('companyHeadquarter')}</Link></li>
                            <li><Link href="/contact/export-department" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }} className="hover:text-primary">{tNav('exportDepartment')}</Link></li>
                            <li><Link href="/contact/local-representatives" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }} className="hover:text-primary">{tNav('localRepresentatives')}</Link></li>
                            <li><Link href="/contact" style={{ color: 'rgba(255,255,255,0.6)', transition: '0.3s' }} className="hover:text-primary">{tNav('contactForm')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '2rem', fontWeight: '700' }}>{t('contactUs')}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'rgba(255,255,255,0.6)' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--primary)', marginTop: '4px' }}><MapPin size={20} /></span>
                                <span>{t('address')}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--primary)' }}><Phone size={20} /></span>
                                <a href="tel:+962780547194" dir="ltr" style={{ unicodeBidi: 'plaintext', color: 'inherit', transition: '0.3s' }} className="hover:text-primary">
                                    +962 780 547 194
                                </a>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--primary)' }}><Mail size={20} /></span>
                                <a href="mailto:info@kint-group.com" dir="ltr" style={{ unicodeBidi: 'plaintext', color: 'inherit', transition: '0.3s' }} className="hover:text-primary">
                                    info@kint-group.com
                                </a>
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
