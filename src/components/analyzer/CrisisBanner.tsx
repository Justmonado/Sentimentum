const CRISIS_LINES = [
  {
    label: "Línea de la Vida",
    href: "tel:8009112000",
    detail: "800 911 2000 · 24 h",
  },
  {
    label: "SAPTEL",
    href: "tel:5552500123",
    detail: "55 5250 0123 · 24 h",
  },
] as const;

export function CrisisBanner() {
  return (
    <aside
      className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-text-secondary"
      aria-label="Recursos de apoyo en crisis"
    >
      <p className="mb-2 font-medium text-amber-200/90">
        Si necesitas hablar con alguien ahora
      </p>
      <ul className="flex flex-col gap-1">
        {CRISIS_LINES.map((line) => (
          <li key={line.label}>
            <a
              href={line.href}
              className="text-accent-hover underline-offset-2 hover:underline"
            >
              {line.label}
            </a>
            <span className="text-text-muted"> — {line.detail}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
