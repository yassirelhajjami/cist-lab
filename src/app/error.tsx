'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('CodeQuest page error:', error.message);
  }, [error]);

  return (
    <main className="quest-world flex min-h-screen items-center justify-center p-6">
      <section className="quest-card w-full max-w-lg p-8 text-center" role="alert">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <p className="quest-kicker mt-5">Quest interrupted</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Something unexpected happened</h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-600">
          Your progress is safe. Retry this screen, and tell a teacher if the problem continues.
        </p>
        <button onClick={reset} className="quest-button mx-auto mt-6 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white">
          <RefreshCw className="h-4 w-4" /> Retry quest
        </button>
        {error.digest && <p className="mt-4 text-[10px] font-bold text-slate-400">Reference: {error.digest}</p>}
      </section>
    </main>
  );
}
