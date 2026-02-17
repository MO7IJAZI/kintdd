import { getCatalogs } from "@/actions/catalogActions";
import CatalogsManager from "@/components/admin/CatalogsManager";
import { getTranslations } from "next-intl/server";

export default async function CatalogsAdminPage() {
    const t = await getTranslations("Admin");
    const catalogs = await getCatalogs();

    return (
        <div style={{ padding: "0 2rem" }}>
            <div style={{ marginBottom: "3rem" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    {t("catalogs") || "Catalogs"} <span style={{ color: "var(--primary)" }}>Management</span>
                </h1>
                <nav style={{ fontSize: "0.875rem", opacity: 0.6 }}>
                    Admin / Catalogs
                </nav>
            </div>

            <CatalogsManager initialCatalogs={catalogs} />
        </div>
    );
}
