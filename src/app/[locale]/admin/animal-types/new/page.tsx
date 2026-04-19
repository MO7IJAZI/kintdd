import AnimalTypeForm from "@/components/admin/AnimalTypeForm";
import { getTranslations } from "next-intl/server";
import { getProducts } from "@/actions/productActions";

export default async function NewAnimalTypePage() {
  const t = await getTranslations("AnimalTypeForm");
  const products = await getProducts();
  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>{t('NewTitle')}</h1>
          <p>{t('NewDescription')}</p>
        </div>
      </div>
      <div className="card">
        <AnimalTypeForm products={products} />
      </div>
    </div>
  );
}
