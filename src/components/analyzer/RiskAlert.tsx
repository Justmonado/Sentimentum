interface RiskAlertProps {
  flags: string[];
}

export function RiskAlert({ flags }: RiskAlertProps) {
  if (flags.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-negative/30 bg-negative/10 px-4 py-3 text-sm text-red-200/90"
    >
      <p className="font-medium">
        Detectamos expresiones que podrían indicar malestar intenso
      </p>
      <p className="mt-1 text-xs text-text-secondary">
        Este resultado no es un diagnóstico. Si lo necesitas, usa los recursos
        de apoyo al final de la página o habla con un profesional de confianza.
      </p>
    </div>
  );
}
