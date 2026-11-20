import React from "react";
import type { PropItem } from "@/lib/types";

interface PropsTableProps {
  propsData?: PropItem[];
}

const PropsTable: React.FC<PropsTableProps> = ({ propsData }) => {
  if (!propsData || propsData.length === 0) return null;

  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold tracking-tight">Props</h2>
      <div className="bg-background w-full overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Property</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Default</th>
              <th className="px-4 py-3 text-left">Description</th>
            </tr>
          </thead>

          <tbody>
            {propsData.map((prop, index) => (
              <tr
                key={index}
                className="hover:bg-muted/40 border-b font-sans transition-colors last:border-none"
              >
                <td className="px-4 py-3 font-mono">{prop.name}</td>

                <td className="text-muted-foreground px-4 py-3 font-mono">
                  {prop.type}
                </td>

                <td className="px-4 py-3 font-mono">{prop.default}</td>

                <td className="text-muted-foreground px-4 py-3">
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
