"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveSettings, GlobalSettings } from "@/actions/settingsActions";
import { useTranslations } from "next-intl";

interface SettingsFormProps {
  initialSettings: GlobalSettings;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const t = useTranslations("AdminSettings");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await saveSettings(formData);
        setMessage(t("settingsSaved"));
      } catch (error) {
        setMessage(t("saveError"));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h3 style={{ marginBottom: '1.5rem' }}>{t('generalInfo')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('siteName')}</label>
            <input name="siteName" className="input" defaultValue={initialSettings.siteName} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('contactEmail')}</label>
            <input name="contactEmail" className="input" defaultValue={initialSettings.contactEmail} style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>{t('socialMedia')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('facebook')}</label>
            <input name="facebookUrl" className="input" defaultValue={initialSettings.facebookUrl} placeholder="https://facebook.com/..." style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('instagram')}</label>
            <input name="instagramUrl" className="input" defaultValue={initialSettings.instagramUrl} placeholder="https://instagram.com/..." style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {message ? (
        <div style={{ color: isPending ? 'inherit' : '#0f5132', backgroundColor: '#d1e7dd', border: '1px solid #badbcc', borderRadius: '0.75rem', padding: '1rem' }}>
          {message}
        </div>
      ) : null}

      <div style={{ marginTop: '1rem' }}>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? t('saving') : t('save')}
        </button>
      </div>
    </form>
  );
}
