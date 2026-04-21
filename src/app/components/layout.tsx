import Container from "@/components/common/Container";
import Sidebar from "@/components/navs/Sidebar";

export default function ComponentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Container className="flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
            <aside className="fixed top-24 z-30 -ml-2 hidden h-[calc(100vh-6rem)] w-full shrink-0 md:sticky md:block">
                <div className="h-full pr-6 overflow-y-auto w-full">
                    <Sidebar />
                </div>
            </aside>
            <main className="relative py-6 lg:gap-10 lg:py-8">
                {children}
            </main>
        </Container>
    );
}
