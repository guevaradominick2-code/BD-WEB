import type { Metadata } from "next";
import { ExperienceShell } from "@/components/experience/experience-shell";
import { requireViewer } from "@/lib/auth";
import { getExperienceData } from "@/lib/data";

export const metadata: Metadata = { title: "Your Universe" };
export const dynamic = "force-dynamic";

export default async function UniversePage() {
  const viewer = await requireViewer();
  const data = await getExperienceData(viewer);
  return <ExperienceShell data={data} viewer={viewer} />;
}
