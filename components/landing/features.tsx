import { LayoutGrid, RefreshCw, Users, MessageSquareText } from "lucide-react";
import { PlatformIcon } from "./platforms";

const icon = { size: 20, strokeWidth: 1.75, "aria-hidden": true } as const;

function Card({
  className = "",
  title,
  icon: Icon,
  children,
  text,
}: {
  className?: string;
  title: string;
  icon: React.ReactNode;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <article className={`flex min-w-0 flex-col rounded-card border border-line bg-bg p-6 ${className}`}>
      <span className="text-brand">{Icon}</span>
      <h3 className="mt-4 font-display text-section text-fg">{title}</h3>
      <p className="mt-2 max-w-[52ch] text-body text-fg-muted">{text}</p>
      {children}
    </article>
  );
}

const MINI_ROWS = [
  { n: "Defne Kozmetik", r: "6,77", d: "▲ %12,4", up: true },
  { n: "Atölye Mobilya", r: "4,50", d: "▼ %3,1", up: false },
  { n: "Kuru Kahve Co.", r: "6,75", d: "▲ %2,2", up: true },
];

export function Features() {
  return (
    <section id="ozellikler" aria-labelledby="ozellikler-baslik" className="scroll-mt-14 bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <h2
          id="ozellikler-baslik"
          className="max-w-[22ch] font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-fg md:text-[40px]"
        >
          Dağınık sayılar yerine tek bir görünüm.
        </h2>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3 lg:gap-6">
          <Card
            className="lg:col-span-2"
            icon={<LayoutGrid {...icon} />}
            title="Tek panel"
            text="Meta, Google Ads, Google Analytics 4 ve e-ticaret altyapınız aynı yerde. Harcama, ciro, ROAS ve sipariş, markaya göre yan yana."
          >
            <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
              {MINI_ROWS.map((r, i) => (
                <div
                  key={r.n}
                  className={`flex h-11 items-center justify-between gap-3 px-3 text-body ${i > 0 ? "border-t border-line" : ""}`}
                >
                  <span className="truncate font-medium text-fg">{r.n}</span>
                  <span className="flex items-center gap-4">
                    <span className="num text-fg">ROAS {r.r}</span>
                    <span className={`num w-20 text-right text-label ${r.up ? "text-success" : "text-error"}`}>{r.d}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            icon={<RefreshCw {...icon} />}
            title="Günlük otomatik senkronizasyon"
            text="Veriler her gün kendiliğinden güncellenir. Son senkronizasyon zamanı her ekranda görünür."
          >
            <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-input bg-sunken px-2 py-1 text-label text-fg-muted">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
              Son senkronizasyon: <span className="num text-fg">12 dk önce</span>
            </p>
          </Card>

          <Card
            icon={<Users {...icon} />}
            title="Müşteriye şeffaf portal"
            text="Her marka yalnızca kendi verisini gören bir panele girer. PDF gönderme, ay sonunu bekleme yok."
          />

          <Card
            className="lg:col-span-2"
            icon={<MessageSquareText {...icon} />}
            title="Veriyi açıklayan asistan"
            text="Sayının neden değiştiğini sorun. Cevap, hangi metrikten söz ettiğini her zaman gösterir."
          >
            <div className="mt-6 flex flex-wrap items-center gap-2 text-body text-fg">
              <span className="rounded-card bg-sunken px-3 py-2">Meta ROAS&apos;ı neden düştü?</span>
              <span className="inline-flex h-7 items-center gap-2 rounded-input bg-brand-subtle px-2 text-label text-on-brand-subtle">
                <PlatformIcon id="meta" className="h-3.5 w-3.5" />
                Meta ROAS <span className="num text-error">▼ 0,8</span>
              </span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
