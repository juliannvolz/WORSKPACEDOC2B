import { CRMApp } from "@/components/crm";
import { ensureSeeded, getIdentity, getWorkspaceData } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeeded();
  const identity = await getIdentity();
  const initialData = identity ? await getWorkspaceData(identity) : null;
  return <CRMApp initialData={initialData} />;
}
