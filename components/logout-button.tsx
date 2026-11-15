'use client';

export default function LogoutButton() {
  return (
    <button 
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.reload();
      }}
      className="px-4 py-2.5 text-slate-700 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors border border-slate-200 bg-white shadow-sm"
    >
      Çıkış Yap
    </button>
  );
}
