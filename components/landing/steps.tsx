const STEPS = [
  { n: "01", title: "Bağla", text: "Reklam, analitik ve e-ticaret hesaplarını yetkilendir." },
  { n: "02", title: "Senkronize et", text: "Veriler her gün otomatik güncellenir." },
  { n: "03", title: "Paylaş", text: "Müşterine kendi panelini aç." },
];

export function Steps() {
  return (
    <section id="nasil-calisir" aria-labelledby="nasil-baslik" className="scroll-mt-14 py-20 md:py-32">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <h2
          id="nasil-baslik"
          className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-fg md:text-[40px]"
        >
          Nasıl çalışır?
        </h2>

        <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* thin connecting line (desktop) */}
          <span aria-hidden="true" className="absolute left-0 right-0 top-[22px] hidden h-px bg-line md:block" />
          {STEPS.map((s) => (
            <li key={s.n} className="relative">
              <span className="relative inline-block bg-bg pr-4 font-display text-[28px] font-semibold leading-[44px] text-brand num">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-section text-fg">{s.title}</h3>
              <p className="mt-2 max-w-[34ch] text-body text-fg-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
