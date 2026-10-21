import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div id="top" className="relative min-h-screen overflow-x-clip bg-paper text-ink">
      <SiteHeader />
      <div id="page" className="relative z-10">
        <main>{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
