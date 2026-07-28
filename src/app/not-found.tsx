import Link from 'next/link';
import { Map, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="quest-world flex min-h-screen items-center justify-center p-6">
      <section className="quest-card w-full max-w-lg p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><Map className="h-8 w-8" /></div>
        <p className="quest-kicker mt-5">Map location missing</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">This path does not exist</h1>
        <p className="mt-3 text-sm font-medium text-slate-600">Return to Basecamp and choose another coding adventure.</p>
        <Link href="/dashboard" className="quest-button mx-auto mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white">
          <ArrowLeft className="h-4 w-4" /> Return to Basecamp
        </Link>
      </section>
    </main>
  );
}
