import { getTranslations } from "next-intl/server";
import { updateCategory, getCategories } from "@/actions/categoryActions";
import prisma from "@/lib/prisma";
import ImageUploadInput from "@/components/admin/ImageUploadInput";
import { redirect } from "next/navigation";
import { isProtectedCategorySlug } from "@/lib/data";
import Link from "next/link";

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id, locale } = await params;
  const t = await getTranslations("AdminDashboard");
  
  const category = await prisma.category.findUnique({
      where: { id }
  });

  if (!category) {
      redirect(`/${locale}/admin/categories`);
  }

  const allCategories = await getCategories();
  const rootCategories = allCategories.filter(c => !c.parentId && c.id !== category.id);
  const isProtected = isProtectedCategorySlug(category.slug);

  const handleSubmit = async (formData: FormData) => {
    "use server";
    await updateCategory(category.id, formData);
    redirect(`/${locale}/admin/categories`);
  };

  return (
    <div className="admin-dashboard">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>Edit Category</h1>
          <p>Update category details, images, and icons.</p>
        </div>
        <Link href={`/${locale}/admin/categories`} className="btn btn-outline">
            Back to Categories
        </Link>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <form action={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="pf-label">English Name</label>
                <input name="name" className="input" defaultValue={category.name} required />
              </div>
              <div dir="rtl">
                <label className="pf-label">Arabic Name</label>
                <input name="name_ar" className="input" defaultValue={category.name_ar || ""} required />
              </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="pf-label">Slug (URL)</label>
                <input name="slug" className="input" defaultValue={category.slug} disabled={isProtected} />
                {isProtected && <input type="hidden" name="slug" value={category.slug} />}
              </div>
              <div>
                <label className="pf-label">Parent Category</label>
                <select name="parentId" defaultValue={category.parentId || ""} className="input" disabled={isProtected}>
                  <option value="">{t("rootSectionOption")}</option>
                  {rootCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {isProtected && <input type="hidden" name="parentId" value={category.parentId || ""} />}
              </div>
          </div>

          <label className="pf-label w-full mt-2">English Description</label>
          <textarea name="description" className="input" defaultValue={category.description || ""} rows={3} />
          
          <label className="pf-label w-full mt-2 text-right">Arabic Description</label>
          <textarea name="description_ar" className="input text-right" defaultValue={category.description_ar || ""} rows={3} dir="rtl" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <ImageUploadInput name="image" label="Category Image / Banner" initialValue={category.image || ""} />
              <ImageUploadInput name="icon" label="Category Icon SVG/Image" initialValue={category.icon || ""} />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">
                Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
