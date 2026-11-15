import { PLATFORMS, PlatformIcon } from "./platforms";

export function Integrations() {
  return (
    <section
      id="entegrasyonlar"
      aria-labelledby="entegrasyon-baslik"
      className="scroll-mt-14 bg-surface py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <h2
          id="entegrasyon-baslik"
          className="max-w-[24ch] font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-fg md:text-[40px]"
        >
          Kullandığınız platformlarla çalışır.
        </h2>

        <ul className="mt-10 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-card border border-line bg-bg p-4"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-card border border-line bg-white">
                <PlatformIcon id={p.id} className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-card text-fg">{p.name}</p>
                <p className="text-label text-fg-muted">{p.category}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
