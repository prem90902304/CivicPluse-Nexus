import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Crumb {
  label: string;
  to?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-border/80 bg-background/70">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-6 py-6 md:flex-row md:items-end md:justify-between">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              className="mb-2 flex items-center text-xs text-muted-foreground"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{crumb.label}</span>
                  )}

                  {index < breadcrumbs.length - 1 && <ChevronRight className="mx-1 h-3 w-3" />}
                </span>
              ))}
            </nav>
          )}

          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>

          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
