import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";
import { isAdminAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  return (
    <div className="section-pad mx-auto max-w-6xl">
      <AdminPanel initiallyAuthed={authed} />
    </div>
  );
}
