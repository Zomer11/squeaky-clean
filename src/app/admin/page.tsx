import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPanel } from "@/components/AdminPanel";
import { adminRequestAllowed, isAdminAuthenticated, totpRequired } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await adminRequestAllowed())) notFound();
  const authed = await isAdminAuthenticated();
  return (
    <div className="section-pad mx-auto max-w-6xl">
      <AdminPanel initiallyAuthed={authed} needsCode={totpRequired()} />
    </div>
  );
}
