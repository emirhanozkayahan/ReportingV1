'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import LoginShell from '@/components/auth/login-shell';

const inputClassName =
  'w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 focus:bg-white transition-all';

const buttonClassName =
  'w-full py-2.5 bg-[#F5403F] text-white hover:bg-[#D93635] font-medium rounded-xl shadow-lg shadow-[#F5403F]/20 hover:shadow-[#F5403F]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 mt-2';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(data.redirect || '/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Giriş başarısız');
      }
    } catch {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginShell
      title="Ajans Girişi"
      subtitle="Marka raporlarına ve admin paneline erişin."
      brandHref="/login"
      error={error}
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@ajans.com"
            autoComplete="email"
            className={inputClassName}
            autoFocus
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Şifre
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className={inputClassName}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={buttonClassName}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Giriş Yap'
          )}
        </button>
      </form>
    </LoginShell>
  );
}
