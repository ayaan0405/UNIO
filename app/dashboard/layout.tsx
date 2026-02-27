"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarRange,
  CheckSquare,
  Video,
  Users,
  Award,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Events", href: "/dashboard/events", icon: CalendarRange },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Meetings", href: "/dashboard/meetings", icon: Video },
  { name: "Participants", href: "/dashboard/participants", icon: Users },
  { name: "Certificates", href: "/dashboard/certificates", icon: Award },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-navy text-slate-100">
      {/* sidebar - desktop */}
      <aside className="hidden w-64 flex-col border-r border-white/5 bg-[#050711]/95 px-4 py-5 lg:flex">
        <div className="flex items-center gap-2 px-1">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.55),transparent_55%)]" />
            <span className="relative text-sm font-semibold text-white/90">
              U
            </span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            UNIO
            <span className="ml-1 text-xs font-normal text-white/50">
              Dashboard
            </span>
          </span>
        </div>

        <nav className="mt-8 space-y-1 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition ${
                  active
                    ? "bg-indigo text-navy shadow-[0_10px_30px_rgba(99,102,241,0.45)]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    active ? "text-navy" : "text-indigo/80"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Snapshot
          </div>
          <p className="leading-relaxed text-slate-300/90">
            See RSVPs, check-ins, and engagement across all events in one view.
          </p>
        </div>
      </aside>

      {/* mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-64 bg-[#050711]/98 px-4 py-5 shadow-xl ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative grid h-8 w-8 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.55),transparent_55%)]" />
                  <span className="relative text-xs font-semibold text-white/90">
                    U
                  </span>
                </div>
                <span className="text-sm font-semibold text-white/90">
                  UNIO
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-200 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-6 space-y-1 text-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition ${
                      active
                        ? "bg-indigo text-navy shadow-[0_10px_30px_rgba(99,102,241,0.45)]"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        active ? "text-navy" : "text-indigo/80"
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      )}

      {/* main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 bg-[#050711]/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-200 ring-1 ring-white/10 hover:bg-white/10"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold tracking-tight text-white/90">
              UNIO
            </span>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              UNIO
            </span>
            <span className="mx-2 h-4 w-px bg-slate-700" />
            <span className="text-xs text-slate-400">Campus Operations</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-xs text-slate-400 sm:block">
              <div className="text-[11px] uppercase tracking-[0.18em]">
                Signed in as
              </div>
              <div className="mt-0.5 text-xs text-slate-200">Ayaan</div>
            </div>
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-indigo to-emerald ring-2 ring-white/10">
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-navy">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-gradient-to-b from-[#050711] to-[#050711] px-4 pb-6 pt-4 sm:px-6 sm:pt-6">
          <div className="mx-auto h-full w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

