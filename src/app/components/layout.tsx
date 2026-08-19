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
            className={`${montserrat.variable} [font-family:var(--font-montserrat)] flex-1 items-start lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-5`}
        >
            <aside className="fixed top-20 z-30 hidden h-[calc(100vh-5rem)] w-full shrink-0 lg:sticky lg:block">
                <div className="h-full pr-6 overflow-y-auto scrollbar-hide w-full">
                    <Sidebar />
                </div>
            </aside>
            <main className="relative py-4">
                {children}
            </main>
        </Container>
    );
}
