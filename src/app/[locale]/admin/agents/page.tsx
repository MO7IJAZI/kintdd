import AgentsManager from "@/components/admin/AgentsManager";
import { getAgents } from "@/actions/agentActions";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const agents = await getAgents();

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>الوكلاء</h1>
        <p style={{ color: "var(--muted-foreground)" }}>
          إضافة أو حذف شعارات الوكلاء والتحكم في ترتيبها.
        </p>
      </div>
      <AgentsManager initialAgents={agents} />
    </div>
  );
}
