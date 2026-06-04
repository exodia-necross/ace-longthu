import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-md bg-court-blue/10 text-court-blue">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-mutedForeground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
