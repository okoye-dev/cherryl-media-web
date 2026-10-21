import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root min-h-screen bg-[#0E0F12] text-zinc-100 antialiased selection:bg-brand-red selection:text-white">
      <AdminHeader />
      <main className="mx-auto w-full max-w-[96rem] px-4 py-5 sm:px-6 sm:py-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
