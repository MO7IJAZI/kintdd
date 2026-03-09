import ProductCardsManager from "@/components/admin/ProductCardsManager";
import { getProductCardsForAdmin } from "@/actions/productCardActions";

export const dynamic = "force-dynamic";

export default async function AdminProductCardsPage() {
  const cards = await getProductCardsForAdmin();

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>بطاقات صفحات المنتجات</h1>
        <p style={{ color: "var(--muted-foreground)" }}>
          من هنا يمكن تعديل الصورة والأيقونة لبطاقات صفحات الثروة النباتية والثروة الحيوانية.
        </p>
      </div>
      <ProductCardsManager initialCards={cards} />
    </div>
  );
}
