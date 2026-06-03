import { isAuthenticated } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
