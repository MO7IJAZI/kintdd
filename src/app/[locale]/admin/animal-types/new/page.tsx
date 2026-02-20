'use client';
import AnimalTypeForm from "@/components/admin/AnimalTypeForm";
import { useTranslations } from "next-intl";

export default function NewAnimalTypePage() {
  const t = useTranslations("AnimalTypeForm");
  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>{t('NewTitle')}</h1>
          <p>{t('NewDescription')}</p>
        </div>
      </div>
      <div className="card">
        <AnimalTypeForm />
      </div>
    </div>
  );
}
