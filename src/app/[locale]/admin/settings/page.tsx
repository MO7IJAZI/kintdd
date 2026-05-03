import { getTranslations } from 'next-intl/server';
import { getSettings } from '@/actions/settingsActions';
import SettingsForm from '@/components/admin/SettingsForm';

export default async function AdminSettings() {
    const t = await getTranslations('AdminSettings');
    const settings = await getSettings();

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('title')}</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>{t('description')}</p>
            </div>

            <div className="card" style={{ padding: '2rem', maxWidth: '800px' }}>
                <SettingsForm initialSettings={settings} />
            </div>
        </div>
    );
}
