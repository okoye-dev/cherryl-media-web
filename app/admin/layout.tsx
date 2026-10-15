import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0E0F12] text-zinc-100 antialiased selection:bg-brand-red selection:text-white">
      <AdminHeader />
      <main className="mx-auto w-full max-w-[96rem] p-4 sm:p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
