export default function AuthWidgetFallback({ label }: { label: string }) {
  return (
    <div className="w-full space-y-4" role="status" aria-label={label} aria-busy="true">
      <p className="text-sm font-semibold text-falla-ink/55">{label}</p>
      <div className="h-12 animate-pulse rounded-xl border-2 border-falla-ink/10 bg-falla-sand/20" />
      <div className="h-12 animate-pulse rounded-xl border-2 border-falla-ink/10 bg-falla-sand/20" />
      <div className="h-12 animate-pulse rounded-xl bg-falla-fire/20" />
    </div>
  );
}
