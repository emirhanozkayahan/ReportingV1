"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, Plug, TriangleAlert } from "lucide-react";
import { PlatformIcon } from "./platforms";

type TabId = "ajans" | "marka" | "entegrasyon" | "asistan";

const TABS: { id: TabId; label: string }[] = [
  { id: "ajans", label: "Ajans paneli" },
  { id: "marka", label: "Marka paneli" },
  { id: "entegrasyon", label: "Entegrasyonlar" },
  { id: "asistan", label: "Asistan" },
];

/* ---------- Demo data (fictional) ---------- */

const BRANDS = [
  { name: "Defne Kozmetik", spend: "₺48.200", revenue: "₺326.400", roas: "6,77", delta: "%12,4", up: true, sync: "12 dk önce" },
  { name: "Atölye Mobilya", spend: "₺31.750", revenue: "₺142.900", roas: "4,50", delta: "%3,1", up: false, sync: "12 dk önce" },
  { name: "Mavi Kıyı Giyim", spend: "₺64.900", revenue: "₺311.500", roas: "4,80", delta: "%6,8", up: true, sync: "1 sa önce" },
  { name: "Kuru Kahve Co.", spend: "₺12.400", revenue: "₺83.700", roas: "6,75", delta: "%2,2", up: true, sync: "12 dk önce" },
  { name: "Nova Pet Shop", spend: "₺22.600", revenue: "₺79.100", roas: "3,50", delta: "%9,7", up: false, sync: "3 sa önce" },
  { name: "Lale Organik", spend: "₺18.900", revenue: "₺64.600", roas: "3,42", delta: "%1,4", up: true, sync: "12 dk önce" },
];

const KPIS = [
  { label: "Harcama", value: "₺48.200", delta: "%8,1", up: true },
  { label: "Ciro", value: "₺326.400", delta: "%12,4", up: true },
  { label: "ROAS", value: "6,77", delta: "%3,9", up: true },
  { label: "Sipariş", value: "1.284", delta: "%5,6", up: true },
];

// 30 daily revenue points (thousand ₺), deterministic.
const SERIES = [
  7.2, 8.1, 7.6, 9.0, 8.4, 9.8, 10.9, 9.7, 10.2, 11.4, 10.6, 9.9, 11.8, 12.6, 11.9, 10.8, 12.2,
  13.1, 12.4, 11.6, 13.4, 14.2, 13.0, 12.1, 14.6, 15.3, 14.1, 13.6, 15.8, 16.4,
];

const INTEGRATIONS = [
  { id: "meta", name: "Meta Ads", account: "Defne Kozmetik · Reklam hesabı", ok: true, sync: "12 dk önce" },
  { id: "google-ads", name: "Google Ads", account: "Defne Kozmetik · Müşteri hesabı", ok: false, sync: "2 gün önce" },
  { id: "ga4", name: "Google Analytics 4", account: "Defne Kozmetik · Mülk", ok: true, sync: "12 dk önce" },
  { id: "ikas", name: "ikas", account: "defnekozmetik.com", ok: true, sync: "12 dk önce" },
];

/* ---------- Small pieces ---------- */

function Delta({ value, up }: { value: string; up: boolean }) {
  return (
    <span className={`num inline-flex items-center gap-1 text-label ${up ? "text-success" : "text-error"}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      <span className="sr-only">{up ? "Artış" : "Düşüş"}</span>
      {value}
    </span>
  );
}

function PanelHeader({ title, sync }: { title: string; sync: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3 className="font-display text-section text-fg">{title}</h3>
      <p className="text-label text-fg-muted">Son senkronizasyon: {sync}</p>
    </div>
  );
}

/* ---------- Panels ---------- */

function AgencyPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="Tüm markalar" sync="12 dk önce" />
      <div className="overflow-hidden rounded-card border border-line">
        <table className="w-full border-collapse text-body">
          <thead>
            <tr className="bg-sunken text-left text-label text-fg-muted">
              <th scope="col" className="h-9 px-3 font-medium">Marka</th>
              <th scope="col" className="hidden h-9 px-3 text-right font-medium sm:table-cell">Harcama</th>
              <th scope="col" className="hidden h-9 px-3 text-right font-medium sm:table-cell">Ciro</th>
              <th scope="col" className="h-9 px-3 text-right font-medium">ROAS</th>
              <th scope="col" className="h-9 px-3 text-right font-medium">Önceki döneme göre</th>
              <th scope="col" className="hidden h-9 px-3 text-right font-medium lg:table-cell">Son senk.</th>
            </tr>
          </thead>
          <tbody>
            {BRANDS.map((b) => (
              <tr key={b.name} className="h-11 border-t border-line transition-colors duration-fast ease-out hover:bg-sunken">
                <th scope="row" className="px-3 text-left font-medium text-fg">{b.name}</th>
                <td className="num hidden px-3 text-right sm:table-cell">{b.spend}</td>
                <td className="num hidden px-3 text-right sm:table-cell">{b.revenue}</td>
                <td className="num px-3 text-right">{b.roas}</td>
                <td className="px-3 text-right"><Delta value={b.delta} up={b.up} /></td>
                <td className="num hidden px-3 text-right text-fg-muted lg:table-cell">{b.sync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AreaChart() {
  const W = 640;
  const H = 180;
  const padL = 52;
  const padB = 22;
  const max = 18;
  const x = (i: number) => padL + (i * (W - padL - 8)) / (SERIES.length - 1);
  const y = (v: number) => 8 + ((max - v) / max) * (H - padB - 8);
  const line = SERIES.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(SERIES.length - 1).toFixed(1)} ${H - padB} L${x(0).toFixed(1)} ${H - padB} Z`;
  const ticks = [0, 6, 12, 18];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Son 30 günde günlük ciro grafiği, 7 bin liradan 16 bin liraya yükseliyor"
      className="h-auto max-h-[220px] w-full"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - 8} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="num fill-fg-muted" fontSize="11">
            {t === 0 ? "0" : `₺${t} bin`}
          </text>
        </g>
      ))}
      <path d={area} className="fill-chart-1/10" />
      <path d={line} className="stroke-chart-1" fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <text x={padL} y={H - 6} className="num fill-fg-muted" fontSize="11">1 Eki</text>
      <text x={W - 8} y={H - 6} textAnchor="end" className="num fill-fg-muted" fontSize="11">30 Eki</text>
    </svg>
  );
}

function BrandPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="Defne Kozmetik" sync="12 dk önce" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-card border border-line bg-surface p-4">
            <p className="text-label text-fg-muted">{k.label}</p>
            <p className="num mt-1 font-display text-[22px] font-semibold leading-8 text-fg sm:text-kpi sm:leading-[38px]">
              {k.value}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2">
              <Delta value={k.delta} up={k.up} />
              <span className="text-label text-fg-muted">önceki 30 güne göre</span>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-card border border-line bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-card text-fg">Günlük ciro</p>
          <p className="text-label text-fg-muted">Son 30 gün</p>
        </div>
        <AreaChart />
      </div>
    </div>
  );
}

function IntegrationsPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="Bağlı platformlar" sync="12 dk önce" />
      <ul className="overflow-hidden rounded-card border border-line">
        {INTEGRATIONS.map((p, i) => (
          <li
            key={p.id}
            className={`flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 ${i > 0 ? "border-t border-line" : ""}`}
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-input border border-line bg-white">
              <PlatformIcon id={p.id} className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium text-fg">{p.name}</p>
              <p className="truncate text-label text-fg-muted">{p.account}</p>
            </div>
            <p className="hidden text-label text-fg-muted sm:block">Son senk.: {p.sync}</p>
            {p.ok ? (
              <span className="inline-flex h-6 items-center gap-1 rounded-input bg-success-subtle px-2 text-label text-success">
                <Check size={14} strokeWidth={1.75} aria-hidden="true" />
                Bağlı
              </span>
            ) : (
              <span className="inline-flex h-6 items-center gap-1 rounded-input bg-warning-subtle px-2 text-label text-warning">
                <TriangleAlert size={14} strokeWidth={1.75} aria-hidden="true" />
                Yeniden yetkilendir
              </span>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="inline-flex h-9 items-center gap-2 rounded-button border border-line-strong bg-surface px-3 text-body text-fg"
      >
        <Plug size={16} strokeWidth={1.75} aria-hidden="true" />
        Platform bağla
      </button>
    </div>
  );
}

function AssistantPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="Asistan" sync="12 dk önce" />
      <div className="space-y-3 rounded-card border border-line bg-surface p-4">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-card bg-sunken px-3 py-2 text-body text-fg">
            Meta ROAS&apos;ı bu hafta neden düştü?
          </p>
        </div>
        <div className="max-w-[92%] space-y-3">
          <p className="text-body text-fg">
            Meta ROAS&apos;ı geçen haftaya göre düştü. Harcamanın <span className="num">%62</span>&apos;si iki
            kampanyada toplanmış ve bu kampanyaların dönüşüm oranı aynı dönemde azalmış.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex h-7 items-center gap-2 rounded-input bg-brand-subtle px-2 text-label text-on-brand-subtle">
              <PlatformIcon id="meta" className="h-3.5 w-3.5" />
              Meta ROAS
              <span className="num text-error">▼ 0,8</span>
            </span>
            <span className="inline-flex h-7 items-center gap-2 rounded-input bg-brand-subtle px-2 text-label text-on-brand-subtle">
              Harcama payı
              <span className="num">%62</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex h-10 items-center rounded-input border border-line-strong bg-surface px-3 text-body text-fg-muted">
        Bir soru sorun…
      </div>
    </div>
  );
}

const PANELS: Record<TabId, ReactNode> = {
  ajans: <AgencyPanel />,
  marka: <BrandPanel />,
  entegrasyon: <IntegrationsPanel />,
  asistan: <AssistantPanel />,
};

/* ---------- Tabs ---------- */

export function ProductPreview() {
  const [active, setActive] = useState<TabId>("ajans");
  const baseId = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = TABS.findIndex((t) => t.id === active);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    setActive(TABS[next].id);
    refs.current[TABS[next].id]?.focus();
  }

  return (
    <div className="mx-auto max-w-[1040px]">
      <div
        role="tablist"
        aria-label="Ürün önizlemesi"
        onKeyDown={onKeyDown}
        className="no-scrollbar mb-3 flex gap-1 overflow-x-auto"
      >
        {TABS.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-button px-3 text-body font-medium transition-[background-color,color,transform] duration-fast ease-out active:scale-[0.98] md:h-9 ${
                selected ? "bg-surface text-fg ring-1 ring-line" : "text-fg-muted hover:bg-sunken hover:text-fg"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-accent" : "bg-transparent"}`}
              />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-modal border border-line bg-surface">
        <div className="flex h-10 items-center gap-2 border-b border-line bg-sunken px-4" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
        </div>
        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${active}`}
          tabIndex={0}
          className="min-h-[320px] p-4 md:min-h-[400px] md:p-6"
        >
          <div
            key={active}
            className="transition-[opacity,transform] duration-base ease-out starting:translate-y-1 starting:opacity-0"
          >
            {PANELS[active]}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-label text-fg-muted">Demo verilerle gösterilmiştir.</p>
    </div>
  );
}
