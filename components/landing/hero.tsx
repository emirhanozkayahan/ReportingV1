import Link from "next/link";
import { PLATFORMS, PlatformIcon } from "./platforms";

// Scattered tiles (lg+). `starting:` plays once on first paint: the tile drifts a few pixels
// toward the preview below. Transform + opacity only, 600ms, ease-out. Reduced motion is
// neutralised by the global rule in globals.css.
const SCATTER: Record<string, string> = {
  meta: "left-[3%] top-[8%] starting:-translate-x-3",
  "google-ads": "left-[14%] top-[36%] starting:-translate-x-3",
  ga4: "left-[2%] top-[60%] starting:-translate-x-3",
  tsoft: "left-[12%] top-[84%] starting:-translate-x-3",
  ikas: "right-[10%] top-[5%] starting:translate-x-3",
  shopify: "right-[2%] top-[30%] starting:translate-x-3",
  ticimax: "right-[14%] top-[54%] starting:translate-x-3",
  ideasoft: "right-[3%] top-[76%] starting:translate-x-3",
  wordpress: "right-[17%] top-[90%] starting:translate-x-3",
};

function Tile({ id, small }: { id: string; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-card border border-line bg-white ${
        small ? "h-11 w-11" : "h-14 w-14"
      }`}
    >
      <PlatformIcon id={id} className={small ? "h-5 w-5" : "h-6 w-6"} />
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative pt-14 pb-10 md:pt-24 md:pb-14">
      <div className="relative mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Decorative scattered tiles; platform names live in the integrations section. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
          {PLATFORMS.map((p) => (
            <span
              key={p.id}
              className={`absolute transition-[transform,opacity] duration-[600ms] ease-out starting:-translate-y-3 starting:opacity-0 ${SCATTER[p.id]}`}
            >
              <Tile id={p.id} />
            </span>
          ))}
        </div>

        <div className="relative mx-auto flex max-w-[720px] flex-col items-center text-center">
          <p className="text-label text-fg-muted">Ajanslar için performans raporlama</p>

          <h1 className="mt-4 font-display text-[clamp(2rem,9vw,2.5rem)] font-bold leading-[1.14] tracking-[-0.02em] text-fg sm:text-[52px] lg:text-[68px] lg:leading-[1.1]">
            <span className="block">Bütün veriler.</span>
            <span className="mt-2 block">
              <span className="rounded-[6px] bg-brand-subtle px-2 text-on-brand-subtle [box-decoration-break:clone]">
                Tek gerçek.
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-[60ch] text-[16px] leading-[26px] text-fg-muted md:text-[18px] md:leading-[28px]">
            Orvalot; Meta, Google ve e-ticaret verilerini her gün tek bir panelde toplar. Ajansınız
            tüm markaları bir bakışta görür, müşterileriniz de kendi panellerini ay sonunu
            beklemeden açar.
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-button bg-brand px-5 text-body font-medium text-on-brand transition-[background-color,transform] duration-fast ease-out hover:bg-brand-hover active:scale-[0.98] md:h-10"
            >
              Panele giriş yap
            </Link>
            <a
              href="#nasil-calisir"
              className="inline-flex h-11 items-center justify-center rounded-button border border-line-strong bg-surface px-5 text-body font-medium text-fg transition-[background-color,transform] duration-fast ease-out hover:bg-sunken active:scale-[0.98] md:h-10"
            >
              Nasıl çalışır?
            </a>
          </div>

          {/* Mobile / tablet: reduced, tidy version of the scattered logos */}
          <ul aria-hidden="true" className="mt-10 flex flex-wrap justify-center gap-2 lg:hidden">
            {PLATFORMS.map((p) => (
              <li key={p.id}>
                <Tile id={p.id} small />
              </li>
            ))}
          </ul>
        </div>

        {/* gives the scatter area breathing room on desktop */}
        <div aria-hidden="true" className="hidden h-24 lg:block" />
      </div>
    </section>
  );
}
