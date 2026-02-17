'use client';

interface CompanyData {
    companyName: string;
    companyName_ar?: string | null;
    address?: string | null;
    address_ar?: string | null;
    courtInfo?: string | null;
    courtInfo_ar?: string | null;
    ncrNumber?: string | null;
    vatNumber?: string | null;
    capital?: string | null;
    capital_ar?: string | null;
}

interface CompanyDataViewProps {
    companyData: CompanyData;
    translations: {
        title: string;
        subtitle: string;
        ncr: string;
        vat: string;
        capital: string;
        addressFallback: string;
        courtFallback: string;
    };
    isRtl: boolean;
}

export default function CompanyDataView({ companyData, translations, isRtl }: CompanyDataViewProps) {
    const companyName = (isRtl && companyData.companyName_ar) ? companyData.companyName_ar : companyData.companyName;
    const address = (isRtl && companyData.address_ar) ? companyData.address_ar : (companyData.address || translations.addressFallback);
    const courtInfo = (isRtl && companyData.courtInfo_ar) ? companyData.courtInfo_ar : (companyData.courtInfo || translations.courtFallback);
    const capital = (isRtl && companyData.capital_ar) ? companyData.capital_ar : companyData.capital;

    return (
        <div className="about-page" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">{translations.title}</h1>
                        <p className="hero-subtitle">
                            {translations.subtitle}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="section">
                <div className="container">
                    <div className="data-card">
                        <div className="company-name">{companyName}</div>
                        <div className="company-address">
                            {address}
                        </div>
                        
                        <div className="register-info">
                            {courtInfo}
                        </div>
                        
                        <div className="registration-details">
                            <div className="detail-item">
                                <span className="detail-label">{translations.ncr}</span>
                                <span className="detail-value">{companyData.ncrNumber}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">{translations.vat}</span>
                                <span className="detail-value">{companyData.vatNumber}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">{translations.capital}</span>
                                <span className="detail-value">{capital}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .hero-section {
                    position: relative;
                    min-height: 40vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #142346 0%, #1a2f5c 100%);
                    color: white;
                    text-align: center;
                    padding: 4rem 0;
                }
                
                .hero-content {
                    position: relative;
                    z-index: 2;
                }
                
                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    font-family: var(--font-heading);
                }
                
                .hero-subtitle {
                    font-size: 1.3rem;
                    opacity: 0.9;
                }

                .section {
                    padding: 4rem 0;
                }

                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .data-card {
                    background: white;
                    border-radius: 1.5rem;
                    padding: 3rem;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
                }

                .company-name {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #142346;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 2px solid #e9496c;
                }

                .company-address {
                    font-size: 1.2rem;
                    line-height: 1.8;
                    color: #4a5568;
                    margin-bottom: 2rem;
                    white-space: pre-line;
                }

                .register-info {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: #f8fafc;
                    border-radius: 1rem;
                    white-space: pre-line;
                }

                .register-info p {
                    font-size: 1rem;
                    color: #4a5568;
                    line-height: 1.6;
                    margin-bottom: 0.5rem;
                }

                .register-info p:last-child {
                    margin-bottom: 0;
                }

                .registration-details {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 1rem;
                    background: linear-gradient(135deg, #fce4e9 0%, #f8d7e1 100%);
                    border-radius: 0.75rem;
                }

                .detail-label {
                    font-weight: 600;
                    color: #142346;
                }

                .detail-value {
                    font-weight: 700;
                    color: #e9496c;
                }

                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2.5rem;
                    }

                    .data-card {
                        padding: 2rem;
                    }

                    .company-name {
                        font-size: 1.4rem;
                    }

                    .detail-item {
                        flex-direction: column;
                        gap: 0.25rem;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}
