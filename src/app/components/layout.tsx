import Container from "@/components/common/Container";
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
            className={`${montserrat.variable} [font-family:var(--font-montserrat)] flex-1 items-start lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10`}
        >
            <aside className="fixed top-24 z-30 -ml-2 hidden h-[calc(100vh-6rem)] w-full shrink-0 lg:sticky lg:block">
                <div className="h-full pr-6 overflow-y-auto scrollbar-hide w-full">
                    <Sidebar />
                </div>
            </aside>
            <main className="relative py-6 lg:gap-10 lg:py-8 scrollbar-hide">
                {children}
            </main>
        </Container>
    );
}
