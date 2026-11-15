import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-baslik" className="bg-brand py-20 text-on-brand md:py-28">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-4 md:flex-row md:items-end md:justify-between md:px-6">
        <div>
          <Wordmark className="h-8 w-auto text-brand-subtle" />
          <h2
            id="cta-baslik"
            className="mt-8 max-w-[20ch] font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[48px]"
          >
            Müşteriniz ay sonunu beklemesin.
          </h2>
          <p className="mt-4 max-w-[48ch] text-[16px] leading-[26px] opacity-90">
            Ajans panelinizi açın; bütün markalarınızın güncel durumu tek ekranda.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-button bg-surface px-6 text-body font-medium text-brand transition-[opacity,transform] duration-fast ease-out hover:opacity-90 active:scale-[0.98] sm:w-auto md:h-10"
        >
          Panele giriş yap
        </Link>
      </div>
    </section>
  );
}
