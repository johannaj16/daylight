'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const { signUp, signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email to confirm your account!');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[color:var(--background)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,200,154,0.35),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(255,190,200,0.28),transparent_45%)]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-[color:var(--muted-border)] bg-white/90 p-8 text-[color:var(--foreground)] shadow-[0_30px_70px_-40px_rgba(212,79,0,0.9)]">
          <h1 className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--brand-500)]">
            Daylight
          </h1>
          <h2 className="mb-6 text-center text-2xl font-semibold text-[color:var(--foreground)]">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[color:var(--brand-600)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-[color:var(--muted-border)] bg-white/80 px-4 py-3 text-[color:var(--foreground)] placeholder:text-[color:var(--brand-300)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-200)]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[color:var(--brand-600)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-2xl border border-[color:var(--muted-border)] bg-white/80 px-4 py-3 text-[color:var(--foreground)] placeholder:text-[color:var(--brand-300)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-200)]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-500">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-[color:var(--accent-green)]/40 bg-[color:var(--accent-green)]/10 px-4 py-2 text-sm text-[color:var(--accent-green)]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[color:var(--brand-600)] py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_25px_40px_-30px_rgba(230,88,12,0.9)] transition hover:-translate-y-0.5 hover:bg-[color:var(--brand-700)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-200)] disabled:cursor-not-allowed disabled:bg-[color:var(--brand-300)]"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-sm font-medium text-[color:var(--brand-600)] underline hover:text-[color:var(--brand-700)]"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
