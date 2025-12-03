import type { ReactNode } from "react";
import VerticalNavbar from "./VerticalNavbar";

type Props = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function PageShell({
  title,
  description,
  actions,
  className = "space-y-8",
  children,
}: Props) {
  const contentClassName = [`min-w-0`, className].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen w-full px-4 py-6 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-6 lg:flex-row">
        <VerticalNavbar />
        <main className="flex-1 min-w-0">
          {(title || description || actions) && (
            <header className="mb-8 rounded-3xl border border-[color:var(--muted-border)] bg-white/80 p-6 shadow-[0_25px_60px_-35px_rgba(204,94,0,0.5)] backdrop-blur">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  {title && (
                    <>
                      <h1 className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">
                        {title}
                      </h1>
                    </>
                  )}
                  {description && (
                    <p className="mt-2 max-w-3xl text-base text-gray-600">
                      {description}
                    </p>
                  )}
                </div>
                {actions && <div className="mt-3 lg:mt-0">{actions}</div>}
              </div>
            </header>
          )}
          <div className={contentClassName}>{children}</div>
        </main>
      </div>
    </div>
  );
}
