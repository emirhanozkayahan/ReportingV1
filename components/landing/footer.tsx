import { Lockup } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-6">
        <Lockup className="h-5 w-auto text-fg" />
        <div className="flex flex-col gap-1 text-label text-fg-muted md:items-end">
          <p>© 2026 Orvalot</p>
          <p>
            Orvalot,{" "}
            <a
              href="https://github.com/emirhanozkayahan"
              target="_blank"
              rel="noopener"
              className="rounded-input text-fg underline underline-offset-4 transition-colors duration-fast ease-out hover:text-brand"
            >
              Emirhan Özkayahan
            </a>{" "}
            tarafından tasarlanıp geliştirildi.
          </p>
        </div>
      </div>
    </footer>
  );
}
