'use client';

import { authenticate } from '@/actions/authActions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';

export default function LoginForm() {
  const t = useTranslations('Admin');
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

  return (
    <form 
      action={dispatch} 
      className="w-full bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden group"
    >
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" />

      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] rounded-2xl blur-lg opacity-40 animate-pulse-slow" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg transform rotate-3 transition-transform group-hover:rotate-0 duration-500">
            K
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--secondary)] tracking-tight">{t('loginTitle')}</h1>
        <p className="text-[var(--muted-foreground)] mt-2 font-medium">{t('loginSubtitle')}</p>
      </div>

      <div className="space-y-6">
        <div className="group/input">
          <label
            className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within/input:text-[var(--primary)]"
            htmlFor="email"
          >
            {t('email')}
          </label>
          <div className="relative">
            <input
              className="w-full px-5 py-4 bg-[var(--input)]/50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all duration-300 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 font-medium"
              id="email"
              type="email"
              name="email"
              placeholder="name@company.com"
              required
              autoComplete="email"
            />
          </div>
        </div>
        
        <div className="group/input">
          <label
            className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within/input:text-[var(--primary)]"
            htmlFor="password"
          >
            {t('password')}
          </label>
          <div className="relative">
            <input
              className="w-full px-5 py-4 bg-[var(--input)]/50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all duration-300 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 font-medium tracking-widest"
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>
        </div>
      </div>

      <div className="pt-8">
        <LoginButton />
      </div>

      <div
        className="mt-6 min-h-[2rem]"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && (
          <div className="w-full p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-center justify-center animate-shake">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errorMessage}
          </div>
        )}
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('Admin');
 
  return (
    <button
      className="group w-full relative overflow-hidden rounded-xl shadow-lg shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/50 transition-all duration-300 transform active:scale-[0.98]"
      aria-disabled={pending}
      disabled={pending}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-300 group-hover:scale-110" />
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
      
      <div className="relative py-4 px-6 flex items-center justify-center text-white font-bold text-lg tracking-wide">
        {pending ? (
          <span className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('loggingIn')}...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {t('loginButton')}
            <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
}
