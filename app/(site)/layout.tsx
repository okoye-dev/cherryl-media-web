import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div id="top" className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <div id="page">
        <main>{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
