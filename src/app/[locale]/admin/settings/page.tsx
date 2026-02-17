import { getTranslations } from 'next-intl/server';

export default async function AdminSettings() {
    const t = await getTranslations('AdminSettings');
    
    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('title')}</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>{t('description')}</p>
            </div>

            <div className="card" style={{ padding: '2rem', maxWidth: '800px' }}>
                <form style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('generalInfo')}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('siteName')}</label>
                                <input className="input" defaultValue="KINT Group" style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('contactEmail')}</label>
                                <input className="input" defaultValue="info@kint-group.com" style={{ width: '100%' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('socialMedia')}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('linkedin')}</label>
                                <input className="input" placeholder="https://linkedin.com/company/..." style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('youtube')}</label>
                                <input className="input" placeholder="https://youtube.com/c/..." style={{ width: '100%' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <button type="button" className="btn btn-primary">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
