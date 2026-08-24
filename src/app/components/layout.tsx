import Container from "@/components/common/Container";
import StripedSeparator from "@/components/common/StripedSeparator";
import Sidebar from "@/components/navs/Sidebar";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container
      className={`${montserrat.variable} flex-1 items-start [font-family:var(--font-montserrat)] lg:grid lg:grid-cols-[250px_auto_minmax(0,1fr)] lg:gap-5`}
    >
      <aside className="fixed top-20 z-30 hidden h-[calc(100vh-5rem)] w-full shrink-0 lg:sticky lg:block">
        <div className="scrollbar-hide h-full w-full overflow-y-auto pr-6">
          <Sidebar />
        </div>
      </aside>
      <StripedSeparator
        orientation="vertical"
        className="hidden self-stretch lg:block"
      />
      <main className="relative py-4">{children}</main>
    </Container>
  );
}
