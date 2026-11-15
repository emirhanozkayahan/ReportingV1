"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Lockup } from "@/components/brand/logo";

const LINKS = [
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#nasil-calisir", label: "Nasıl çalışır" },
  { href: "#entegrasyonlar", label: "Entegrasyonlar" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" aria-label="Orvalot ana sayfa" className="rounded-input">
          <Lockup className="h-6 w-auto text-fg" />
        </Link>

        <nav aria-label="Ana gezinme" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex h-9 items-center rounded-button px-3 text-body text-fg-muted transition-colors duration-fast ease-out hover:bg-sunken hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-button border border-line-strong bg-surface px-4 text-body font-medium text-fg transition-[background-color,transform] duration-fast ease-out hover:bg-sunken active:scale-[0.98] md:h-9"
          >
            Giriş yap
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-button text-fg transition-colors duration-fast ease-out hover:bg-sunken md:hidden"
            aria-expanded={open}
            aria-controls="mobil-menu"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobil-menu"
          aria-label="Mobil gezinme"
          className="border-t border-line bg-bg px-4 py-2 md:hidden"
        >
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center rounded-button px-2 text-body text-fg hover:bg-sunken"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
