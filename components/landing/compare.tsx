import { Check, Minus } from "lucide-react";

const BEFORE = [
  "Rapor ay sonunda, PDF olarak gelir",
  "Her müşteri için sayılar elle derlenir",
  "Rakamlar okunduğunda zaten eskimiştir",
  "Sorular e-posta zincirinde cevaplanır",
];

const AFTER = [
  "Veriler her gün otomatik güncellenir",
  "Tüm markalar ajans panelinde tek ekranda",
  "Müşteri kendi paneline istediği an girer",
  "Asistan, sayıyı bağlı olduğu metrikle açıklar",
];

export function Compare() {
  return (
    <section aria-labelledby="fark-baslik" className="pt-20 pb-16 md:pt-28 md:pb-20">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <h2
          id="fark-baslik"
          className="max-w-[20ch] font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-fg md:text-[40px]"
        >
          Raporu beklemek yerine paneli açın.
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
          <div className="rounded-modal border border-line bg-bg p-6 md:p-8">
            <h3 className="font-display text-section text-fg-muted">Ay sonu PDF raporu</h3>
            <ul className="mt-5 space-y-3">
              {BEFORE.map((t) => (
                <li key={t} className="flex gap-3 text-body text-fg-muted">
                  <Minus size={20} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-modal border border-line bg-brand-subtle p-6 md:p-8">
            <h3 className="font-display text-section text-on-brand-subtle">Her an açık panel</h3>
            <ul className="mt-5 space-y-3">
              {AFTER.map((t) => (
                <li key={t} className="flex gap-3 text-body text-fg">
                  <Check size={20} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0 text-on-brand-subtle" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
