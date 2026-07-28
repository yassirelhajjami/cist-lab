export default function GlobalLoading() {
  return (
    <main className="quest-world flex min-h-screen items-center justify-center p-6" aria-busy="true" aria-live="polite">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-[6px] border-emerald-200 border-t-emerald-600" />
        <p className="mt-4 text-sm font-black uppercase tracking-[.18em] text-emerald-800">Preparing your quest</p>
      </div>
    </main>
  );
}
