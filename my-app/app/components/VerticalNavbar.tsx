"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  Sun,
  ChartLine,
  BookOpen,
  Timer,
  type LucideIcon,
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  caption: string;
  icon: LucideIcon;
};

const links: NavLink[] = [
  {
    href: "/checklist",
    label: "Daily Flow",
    caption: "Plan, tasks, and journal",
    icon: BookOpen,
  },
  {
    href: "/work-session",
    label: "Work Sprint",
    caption: "Timer + focus logging",
    icon: Timer,
  },
  {
    href: "/timeline",
    label: "Timeline",
    caption: "Progress across days",
    icon: ChartLine,
  },
];

export default function VerticalNavbar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:sticky lg:top-6 lg:w-64">
      <div className="glass-panel flex h-full flex-col rounded-3xl px-6 py-7 shadow-[0_30px_60px_-40px_rgba(212,79,0,0.7)]">
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-[1.75rem] bg-[color:var(--brand-100)] p-3 text-[color:var(--brand-700)] shadow-inner">
            <Sun className="h-6 w-6" />
          </div>
          <div>
            <p className="text-md font-semibold uppercase tracking-[0.45em] text-[color:var(--brand-500)]">
              Daylight
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map(({ href, label, caption, icon: Icon }) => {
            const active =
              pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                  active
                    ? "border-[color:var(--brand-400)] bg-[color:var(--brand-100)] shadow-[0_15px_35px_-25px_rgba(230,88,12,0.9)]"
                    : "border-transparent hover:border-[color:var(--brand-200)] hover:bg-white/70"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-[color:var(--brand-600)] ${
                    active ? "bg-white" : "bg-white/70"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[color:var(--foreground)]">
                    {label}
                  </span>
                  <span className="text-xs text-gray-500">{caption}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
