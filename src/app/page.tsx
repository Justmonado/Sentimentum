import { AnalyzerShell } from "@/components/analyzer/AnalyzerShell";
import { CrisisBanner } from "@/components/analyzer/CrisisBanner";
import { Disclaimer } from "@/components/analyzer/Disclaimer";

export default function HomePage() {
  return (
    <div className="mx-auto min-h-screen max-w-xl px-6 py-12">
      <header className="mb-10 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <span className="text-xl text-accent" aria-hidden>
            ◆
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Sentimentum</h1>
        </div>
        <p className="text-sm text-text-secondary">
          Análisis local en tu dispositivo · indicadores de apoyo, no diagnóstico
        </p>
      </header>

      <main className="flex flex-col gap-6">
        <AnalyzerShell />
        <Disclaimer />
        <CrisisBanner />
      </main>
    </div>
  );
}
