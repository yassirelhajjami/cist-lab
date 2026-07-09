// src/app/login/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Mail, Lock, ShieldCheck, Zap } from 'lucide-react';

function LoginContent() {
  const { login, profile, user } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password'); // Default password for ease
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '';

  // Redirect if already logged in
  useEffect(() => {
    if (profile) {
      if (redirectTo) {
        router.replace(decodeURIComponent(redirectTo));
      } else if (profile.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [profile, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your CIST email address.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
      // Success. Redirect is handled by the useEffect above
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex flex-col bg-navy-dark text-white items-center justify-center p-4 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-maple-red/10 blur-3xl"></div>
      <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-gold-accent/10 blur-3xl"></div>

      <div className="w-full max-w-md bg-navy-deep rounded-2xl border border-navy-light/25 shadow-2xl p-8 relative z-10">
        
        {/* School Logo Title */}
        <div className="text-center mb-8">
          <img src="/cist.png" alt="CIST Logo" className="inline-block h-16 w-16 object-contain rounded-2xl shadow-xl border-2 border-gold-accent/40 bg-white p-0.5 mb-3" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white leading-none">
            CIST <span className="text-gold-accent">CodeQuest</span>
          </h2>
          <p className="text-[10px] tracking-widest text-gray-400 uppercase mt-1">
            Canadian International School Tangier
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-lg bg-maple-red/15 border border-maple-red/35 p-3.5 text-xs text-maple-light font-medium flex items-center space-x-2">
            <span className="text-sm">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              School Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="email"
                placeholder="username@cist.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-navy-dark border border-navy-light/30 py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-accent transition"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-navy-dark border border-navy-light/30 py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-accent transition"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 rounded-xl bg-maple-red py-3.5 font-bold uppercase text-sm text-white transition hover:bg-maple-light active:scale-98 shadow-md shadow-maple-red/15 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Zap className="h-4.5 w-4.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Enter CodeQuest</span>
            )}
          </button>
        </form>



      </div>

      <div className="mt-8 text-center text-xs text-gray-500 font-semibold tracking-wide uppercase">
        Canadian International School Tangier • CodeQuest
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-navy-dark text-white">
        <div className="animate-spin rounded-full border-4 border-gold-accent border-t-transparent h-10 w-10"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
