import type { Metadata } from "next";
import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { requireViewer } from "@/lib/auth";
import { getAdminData } from "@/lib/data";

export const metadata: Metadata = { title: "Administration" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const viewer = await requireViewer("admin");
  const data = await getAdminData(viewer);
  return <AdminWorkspace initialData={data} viewer={viewer} />;
}
