export function AppFooter() {
  return (
    <footer className="border-t border-border/80 bg-background px-6 py-4 text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-1 md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} CivicPulse Nexus · Smart City Civic Services Platform</p>

        <p>
          A Government of India Initiative · Ministry of Housing & Urban Affairs · Smart Cities
          Mission
        </p>
      </div>
    </footer>
  );
}
