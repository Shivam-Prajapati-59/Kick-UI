import React from "react";
import type { PropItem } from "@/lib/types";

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
                    <thead className="border-b bg-muted/50 font-medium">
                        <tr>
                            <th className="px-4 py-3 text-left ">Property</th>
                            <th className="px-4 py-3 text-left ">Type</th>
                            <th className="px-4 py-3 text-left ">Default</th>
                            <th className="px-4 py-3 text-left ">Description</th>
                        </tr>
                    </thead>

                    <tbody>
                        {propsData.map((prop, index) => (
                            <tr
                                key={index}
                                className="border-b last:border-none hover:bg-muted/40 transition-colors font-sans"
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