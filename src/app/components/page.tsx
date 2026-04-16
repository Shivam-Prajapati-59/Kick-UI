import React from 'react';
import Container from "@/components/common/Container";
import { getAllComponents } from "@/lib/component-registry";
import { Link } from 'next-view-transitions';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ComponentsPage() {
    const components = getAllComponents();

    return (
        <Container className="py-10">
            <div className="mb-10 max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Components</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Beautifully designed components that you can copy and paste into your apps.
                    Accessible. Customizable. Open Source.
                </p>
                <hr className="border-border" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
                {components.map((component) => (
                    <Link key={component.slug} href={`/components/${component.slug}`}>
                        <Card className="h-full transition-all hover:bg-muted/50 hover:shadow-md cursor-pointer border-border/50">
                            <CardHeader>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl flex items-center justify-between">
                                        {component.name}
                                    </CardTitle>
                                    <Badge variant="secondary" className="w-fit text-xs px-2 py-0.5 mt-2 mb-3">
                                        {component.category}
                                    </Badge>
                                </div>
                                <CardDescription className="text-sm pt-2 line-clamp-2">
                                    {component.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            {components.length === 0 && (
                <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
                    No components found.
                </div>
            )}
        </Container>
    );
}