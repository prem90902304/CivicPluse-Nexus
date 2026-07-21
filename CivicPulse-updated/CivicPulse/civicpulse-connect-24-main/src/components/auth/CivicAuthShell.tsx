import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BellRing, ClipboardList, ShieldCheck } from "lucide-react";

interface CivicAuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function CivicAuthShell({ title, subtitle, children, footer }: CivicAuthShellProps) {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="flex items-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-flex items-center">
            <img
              src="/government-of-india-logo.png"
              alt="Government of India"
              className="h-16 w-auto object-contain object-left"
            />
          </Link>

          <div className="mt-12">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
              Secure access
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-7 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </section>

      <aside
        className="relative hidden overflow-hidden text-white lg:block"
        style={{
          backgroundImage: "url('/civic-india-hero.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/65 to-blue-950/45" />

        <div className="relative flex h-full flex-col px-12 py-14 xl:px-16 xl:py-16">
          <div className="my-auto max-w-lg">
            <p className="mb-5 inline-flex rounded-full border border-white/25 bg-slate-950/35 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100 backdrop-blur">
              CivicPulse Nexus
            </p>

            <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Simple, transparent
              <br />
              civic services.
            </h2>

            <p className="mt-5 max-w-md text-base leading-7 text-slate-100">
              Report issues, track progress, and receive updates from the departments responsible
              for resolving them.
            </p>

            <div className="mt-10 space-y-5">
              <Feature
                icon={ClipboardList}
                title="Track every complaint"
                description="Follow each stage from filing to resolution."
              />
              <Feature
                icon={BellRing}
                title="Stay informed"
                description="Receive timely progress and resolution updates."
              />
              <Feature
                icon={ShieldCheck}
                title="Secure and accountable"
                description="Role-based access with a complete service trail."
              />
            </div>
          </div>

          <div className="border-t border-white/25 pt-5 text-xs text-slate-100">
            © {new Date().getFullYear()} CivicPulse Nexus · Smart City Mission
          </div>
        </div>
      </aside>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ClipboardList;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10 text-blue-300">
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
