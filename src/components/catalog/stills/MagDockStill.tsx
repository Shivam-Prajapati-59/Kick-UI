import { Activity, Home, Mail, Trash2, XCircle } from "lucide-react";

const items = [Home, Mail, XCircle, Trash2, Activity];

export function MagDockStill() {
  return (
    <div className="flex size-full items-center justify-center px-3" aria-hidden="true">
      <div className="border-border bg-background/80 flex max-w-full items-end gap-1.5 rounded-2xl border px-2.5 py-2 shadow-lg">
        {items.map((Icon, index) => (
          <span
            key={index}
            className={`bg-secondary text-foreground flex shrink-0 items-center justify-center rounded-xl border border-border shadow-sm ${index === 2 ? "size-12" : "size-9"}`}
          >
            <Icon className={index === 2 ? "size-5" : "size-4"} strokeWidth={1.75} />
          </span>
        ))}
      </div>
    </div>
  );
}
