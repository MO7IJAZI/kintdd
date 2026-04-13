import { getTranslations } from "next-intl/server";
import { createCategory, getCategories } from "@/actions/categoryActions";
import DeleteButton from "@/components/admin/DeleteButton";
import { isProtectedCategorySlug } from "@/lib/data";
import ImageUploadInput from "@/components/admin/ImageUploadInput";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ q?: string }>;
}

export default async function CategoriesAdminPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("AdminDashboard");
  const searchParamsValue = (await searchParams) || {};
  const query = (searchParamsValue.q || "").trim().toLowerCase();
  const categories = await getCategories();
  const filteredCategories = categories.filter((category) =>
    !query
      ? true
      : `${category.name} ${category.name_ar || ""} ${category.slug}`.toLowerCase().includes(query)
  );
  const rootCategories = categories.filter((category) => !category.parentId);

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>{t("manageCompanySections")}</h1>
          <p>{t("manageCompanySectionsDesc")}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>{t("addCompanySection")}</h3>
        <form action={createCategory} style={{ display: "grid", gap: "0.75rem" }}>
          <input name="name" className="input" placeholder={t("sectionNameEn")} required />
          <input name="name_ar" className="input" placeholder={t("sectionNameAr")} dir="rtl" />
          <input name="slug" className="input" placeholder={t("optionalSlug")} />
          <select name="parentId" defaultValue="" className="input">
            <option value="">{t("rootSectionOption")}</option>
            {rootCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <textarea name="description" className="input" placeholder={t("optionalDescriptionEn")} rows={2} />
          <textarea name="description_ar" className="input" placeholder={t("optionalDescriptionAr")} rows={2} dir="rtl" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <ImageUploadInput name="image" label="Category Image / Banner" />
              <ImageUploadInput name="icon" label="Category Icon SVG/Image" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>
            {t("addCompanySection")}
          </button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <h3>{t("categories")}</h3>
          <form action="/admin/categories" method="get" style={{ width: "320px", maxWidth: "100%" }}>
            <input
              type="search"
              name="q"
              defaultValue={searchParamsValue.q || ""}
              className="input"
              style={{ width: "100%" }}
              placeholder={t("dashboardSearchPlaceholder")}
            />
          </form>
        </div>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "0.65rem",
                padding: "0.85rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>
                  {category.name} {category.name_ar ? ` / ${category.name_ar}` : ""}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {category.slug}
                  {category.parent ? ` · ${t("parentLabel")}: ${category.parent.name}` : ` · ${t("rootSectionOption")}`}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {isProtectedCategorySlug(category.slug) || isProtectedCategorySlug(category.parent?.slug) ? (
                  <span style={{ color: "#0f766e", fontWeight: 600, fontSize: "0.85rem" }}>أساسي / Core</span>
                ) : null}
                <a 
                  href={`/${locale}/admin/categories/${category.id}`} 
                  className="btn btn-outline" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  تعديل / Edit
                </a>
                {!isProtectedCategorySlug(category.slug) && !isProtectedCategorySlug(category.parent?.slug) && (
                  <DeleteButton id={category.id} type="category" />
                )}
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && <p className="empty-message">{t("dashboardSearchNoResults")}</p>}
        </div>
      </div>
    </div>
  );
}
