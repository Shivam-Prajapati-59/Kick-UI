import React from "react";
import { PropItem } from "@/lib/component-registry";

interface PropsTableProps {
    propsData?: PropItem[];
}

const PropsTable: React.FC<PropsTableProps> = ({ propsData }) => {
    if (!propsData || propsData.length === 0) return null;

    return (
        <div>
            <h1 className="mb-5 text-2xl font-bold tracking-tight">
                Props
            </h1>
            <div className="w-full overflow-x-auto rounded-xl border bg-background">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Property</th>
                            <th className="px-4 py-3 text-left font-medium">Type</th>
                            <th className="px-4 py-3 text-left font-medium">Default</th>
                            <th className="px-4 py-3 text-left font-medium">Description</th>
                        </tr>
                    </thead>

                    <tbody>
                        {propsData.map((prop, index) => (
                            <tr
                                key={index}
                                className="border-b last:border-none hover:bg-muted/40 transition-colors"
                            >
                                <td className="px-4 py-3 font-mono">
                                    {prop.name}
                                </td>

                                <td className="px-4 py-3 font-mono text-muted-foreground">
                                    {prop.type}
                                </td>

                                <td className="px-4 py-3 font-mono">
                                    {prop.default}
                                </td>

                                <td className="px-4 py-3 text-muted-foreground">
                                    {prop.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PropsTable;