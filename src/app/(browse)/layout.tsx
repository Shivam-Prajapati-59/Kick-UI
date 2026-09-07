import Container from "@/components/common/Container";
import Sidebar from "@/components/navs/Sidebar";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

/**
 * Shared docs-browsing chrome for /components/* and /docs/*. One layout
 * instance persists across section switches, so the sidebar, container
 * and their entrance animations mount once instead of replaying like a
 * full page reload on every docs<->components navigation.
 */
export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container
      className={`${montserrat.variable} flex-1 items-start [font-family:var(--font-montserrat)] lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-5`}
    >
      <aside className="fixed top-(--navbar-height) z-30 hidden h-[calc(100vh-var(--navbar-height))] w-full shrink-0 lg:sticky lg:block">
        <div className="h-full w-full pr-6">
          <Sidebar />
        </div>
      </aside>
      <main className="relative">{children}</main>
    </Container>
  );
}
