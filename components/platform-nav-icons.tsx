import type { ReactNode } from "react";

type PlatformIconProps = {
  className?: string;
  colored?: boolean;
  bordered?: boolean;
};

export function MetaLogo({ className = "w-[18px] h-[18px]", colored, bordered }: PlatformIconProps) {
  const fill = colored ? "#0866FF" : "currentColor";

  const svg = (
    <svg
      className={bordered ? "w-[58%] h-[58%]" : className}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill={fill}
        d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-.994 1.201-1.554 1.602-2.047.471-.587 1.066-.992 1.8-.992.732 0 1.327.405 1.798.992.4.493.842 1.053 1.602 2.047 1.332 1.773 2.468 2.444 3.965 2.444 1.775 0 2.897-.768 3.593-1.927a5.236 5.236 0 0 0 .371-.761c.112-.278.21-.576.265-.86.14-.604.21-1.267.21-1.973 0-2.566-.704-5.241-2.044-7.306C18.683 5.31 16.968 4.03 15 4.03c-1.585 0-2.985.916-4.085 2.186C10.815 4.946 9.415 4.03 7.83 4.03h-.915z"
      />
    </svg>
  );

  if (!bordered) return svg;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {svg}
    </span>
  );
}

function BorderedLogoWrap({
  className,
  bordered,
  children,
}: {
  className: string;
  bordered?: boolean;
  children: ReactNode;
}) {
  if (!bordered) return <>{children}</>;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export function GoogleAdsLogo({ className = "w-[18px] h-[18px]", colored, bordered }: PlatformIconProps) {
  const svgClass = bordered ? "w-[58%] h-[58%]" : className;

  const svg = !colored ? (
    <svg className={svgClass} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  ) : (
    <svg className={svgClass} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  return (
    <BorderedLogoWrap className={className} bordered={bordered}>
      {svg}
    </BorderedLogoWrap>
  );
}

export function GoogleAnalyticsLogo({ className = "w-[18px] h-[18px]", colored, bordered }: PlatformIconProps) {
  const bar1 = colored ? "#F9AB00" : "currentColor";
  const bar2 = colored ? "#E37400" : "currentColor";
  const svgClass = bordered ? "w-[58%] h-[58%]" : className;

  const svg = (
    <svg className={svgClass} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="12" width="4" height="9" rx="1.5" fill={bar1} />
      <rect x="10" y="7" width="4" height="14" rx="1.5" fill={bar2} />
      <rect x="17" y="3" width="4" height="18" rx="1.5" fill={bar1} />
    </svg>
  );

  return (
    <BorderedLogoWrap className={className} bordered={bordered}>
      {svg}
    </BorderedLogoWrap>
  );
}
