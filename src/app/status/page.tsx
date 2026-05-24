import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const metadata = { title: "Status" };
export const revalidate = 60;

const SERVICES = [
  { name: "Authentication", status: "operational" as const },
  { name: "Forums & Threads", status: "operational" as const },
  { name: "Tickets", status: "operational" as const },
  { name: "Direct Messages", status: "operational" as const },
  { name: "Loader API", status: "operational" as const },
  { name: "Discord Sync", status: "operational" as const },
];

export default function StatusPage() {
  const allUp = SERVICES.every((s) => s.status === "operational");
  return (
    <>
      <NavbarServer />
      <main className="container max-w-3xl pb-20 pt-10">
        <header>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Service health
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Status
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground">
            Live status of all Arnhemia systems. Refreshes every minute.
          </p>
        </header>

        <div
          className={`panel mt-8 flex items-center gap-4 p-6 ${
            allUp ? "border-emerald-400/20" : "border-amber-400/20"
          }`}
        >
          <div
            className={`grid size-10 place-items-center rounded-lg ${
              allUp
                ? "border border-emerald-400/20 bg-emerald-400/[0.06]"
                : "border border-amber-400/20 bg-amber-400/[0.06]"
            }`}
          >
            {allUp ? (
              <CheckCircle2 className="size-5 text-emerald-300" />
            ) : (
              <AlertCircle className="size-5 text-amber-300" />
            )}
          </div>
          <div>
            <h2 className="font-semibold tracking-tight">
              {allUp ? "All systems operational" : "Some systems are degraded"}
            </h2>
            <p className="text-[12.5px] text-muted-foreground">
              Last check {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="panel mt-6 divide-y divide-white/[0.04]">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <span className="text-[14px] font-medium">{s.name}</span>
              <Badge variant={s.status === "operational" ? "success" : "warning"}>
                <span
                  className={`size-1.5 rounded-full ${
                    s.status === "operational" ? "bg-emerald-300" : "bg-amber-300"
                  }`}
                />
                {s.status === "operational" ? "Operational" : "Degraded"}
              </Badge>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
