import { LogoMark, Lockup, Wordmark } from "@/components/brand/logo";

// Internal token preview. Not linked from anywhere; useful to check light/dark.
export const metadata = { title: "Design system", robots: { index: false } };

const swatches = [
  ["bg", "bg-bg"],
  ["surface", "bg-surface"],
  ["sunken", "bg-sunken"],
  ["brand", "bg-brand"],
  ["brand-subtle", "bg-brand-subtle"],
  ["accent", "bg-accent"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["error", "bg-error"],
  ["info", "bg-info"],
  ["chart-1", "bg-chart-1"],
  ["chart-2", "bg-chart-2"],
  ["chart-3", "bg-chart-3"],
  ["chart-4", "bg-chart-4"],
  ["chart-5", "bg-chart-5"],
  ["chart-6", "bg-chart-6"],
] as const;

function Board() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-bg text-fg">
      <div className="flex flex-wrap items-center gap-8">
        <Wordmark className="h-8 text-brand" />
        <Lockup className="h-7 text-fg" />
        <LogoMark className="h-8 text-brand" />
      </div>
      <div className="grid grid-cols-8 gap-2">
        {swatches.map(([name, cls]) => (
          <div key={name} className="flex flex-col gap-1">
            <div className={`h-10 rounded-input border border-line ${cls}`} />
            <span className="text-label text-fg-muted">{name}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          ["Toplam harcama", "₺184.320", "▲ 12,4%", "text-success"],
          ["Ciro", "₺1.246.900", "▼ 3,1%", "text-error"],
          ["ROAS", "6,77", "▲ 0,42", "text-success"],
        ].map(([l, v, d, c]) => (
          <div key={l} className="rounded-card border border-line bg-surface p-4">
            <p className="text-label text-fg-muted">{l}</p>
            <p className="font-display text-kpi num">{v}</p>
            <p className={`text-label num ${c}`}>{d} <span className="text-fg-muted">önceki 30 güne göre</span></p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="h-9 px-4 rounded-button bg-brand text-on-brand font-medium hover:bg-brand-hover transition-colors duration-fast ease-out active:scale-[0.98]">Birincil</button>
        <button className="h-9 px-4 rounded-button border border-line-strong bg-surface text-fg font-medium">İkincil</button>
        <button className="h-9 px-4 rounded-button text-fg-muted hover:bg-sunken font-medium">Hayalet</button>
        <input className="h-9 px-3 rounded-input border border-line-strong bg-surface text-fg placeholder:text-fg-muted" placeholder="E-posta" />
        <span className="px-2 py-0.5 rounded-input bg-brand-subtle text-on-brand-subtle text-label">Seçili</span>
        <span className="px-2 py-0.5 rounded-input bg-warning-subtle text-warning text-label">! Uyarı</span>
      </div>
      <h1 className="font-display text-page">Sayfa başlığı — Ğğ Şş İı Öö Çç Üü</h1>
      <p className="text-body text-fg-muted max-w-prose">Gövde metni IBM Plex Sans. Bütün veriler. Tek gerçek.</p>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="grid xl:grid-cols-2">
      <div data-theme="light">
        <Board />
      </div>
      <div data-theme="dark">
        <Board />
      </div>
    </main>
  );
}
