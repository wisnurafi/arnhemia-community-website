import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/supabase/database.types";
import { Crown, Shield, Code, User } from "lucide-react";

export function RoleBadge({ role }: { role: Role }) {
  const map: Record<
    Role,
    {
      label: string;
      variant: React.ComponentProps<typeof Badge>["variant"];
      Icon: React.ComponentType<{ className?: string }>;
    }
  > = {
    owner: { label: "Owner", variant: "owner", Icon: Crown },
    "co-owner": { label: "Co-Owner", variant: "coowner", Icon: Shield },
    devs: { label: "Developer", variant: "devs", Icon: Code },
    member: { label: "Member", variant: "muted", Icon: User },
  };
  const cfg = map[role];
  return (
    <Badge variant={cfg.variant} className="gap-1.5">
      <cfg.Icon className="size-3" />
      {cfg.label}
    </Badge>
  );
}
