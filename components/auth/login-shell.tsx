import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type LoginShellProps = {
  title: string;
  subtitle?: string;
  brandHref?: string;
  alternateLogin?: {
    text: string;
    linkLabel: string;
    href: string;
  };
  navAction?: {
    label: string;
    href: string;
  };
  error?: string;
  children: ReactNode;
};

export default function LoginShell({
  title,
  subtitle,
  brandHref = "/",
  alternateLogin,
  navAction,
  error,
  children,
}: LoginShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAFAFA] overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-[#F5403F]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#E83837]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5403F]/5 blur-3xl" />

      <header className="relative z-10 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href={brandHref} className="flex items-center gap-2.5 group">
            <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-sm group-hover:border-[#F5403F]/30 transition-colors">
              <Image
                src="/favicon.png"
                alt="Veritas Report"
                width={24}
                height={24}
                className="rounded-md"
                priority
              />
            </div>
            <span className="font-semibold text-slate-900 text-sm tracking-tight">
              Veritas Report
            </span>
          </Link>

          {navAction && (
            <Link
              href={navAction.href}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-[#F5403F] text-white hover:bg-[#D93635] shadow-sm shadow-[#F5403F]/20 transition-all"
            >
              {navAction.label}
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[420px]">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-xl shadow-slate-200/60">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F5403F] via-[#E83837] to-[#F5403F]" />

            <div className="px-8 pt-10 pb-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-2xl bg-[#F5403F]/15 blur-xl scale-110" />
                  <div className="relative rounded-2xl border border-[#F5403F]/20 bg-white p-3 shadow-md ring-4 ring-[#F5403F]/5">
                    <Image
                      src="/favicon.png"
                      alt="Veritas Report"
                      width={40}
                      height={40}
                      className="rounded-xl"
                      priority
                    />
                  </div>
                </div>

                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  {title}
                </h1>

                {subtitle && (
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs">
                    {subtitle}
                  </p>
                )}

                {alternateLogin && (
                  <p className="text-sm text-slate-500 mt-4">
                    {alternateLogin.text}{" "}
                    <Link
                      href={alternateLogin.href}
                      className="text-[#F5403F] font-medium hover:text-[#D93635] transition-colors"
                    >
                      {alternateLogin.linkLabel}
                    </Link>
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              {children}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 pb-8 text-center">
        <div className="max-w-xs mx-auto mb-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <p className="text-xs text-slate-400">
          Veritas Dijital — Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}
