"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Bell,
  CalendarCheck,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Smart RSVPs + waitlists",
    description:
      "Manage capacity automatically with clean RSVP flows, confirmations, and waitlist promotion.",
    accent: "indigo" as const,
  },
  {
    icon: Bell,
    title: "Real-time updates",
    description:
      "Last-minute location changes and reminders land instantly—no more missed events.",
    accent: "indigo" as const,
  },
  {
    icon: QrCode,
    title: "Fast QR check-in",
    description:
      "Scan, verify, and track attendance in seconds with a frictionless entry experience.",
    accent: "emerald" as const,
  },
  {
    icon: Users,
    title: "Built for clubs & admins",
    description:
      "Role-based tools for organizers, moderators, and campus staff—everyone stays in sync.",
    accent: "indigo" as const,
  },
  {
    icon: BarChart3,
    title: "Insights that matter",
    description:
      "See what’s working: turnout trends, peak times, and engagement—present it in minutes.",
    accent: "emerald" as const,
  },
  {
    icon: ShieldCheck,
    title: "Trusted & secure",
    description:
      "Designed with privacy and safety in mind for student communities and campus operations.",
    accent: "indigo" as const,
  },
];

export default function Home() {
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
    visible: { opacity: 1, y: 0 },
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.26),transparent)] blur-3xl" />
        <div className="absolute -bottom-52 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.16),transparent)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_18%,transparent_78%,rgba(255,255,255,0.03))]" />
      </div>

      <header className="relative z-10">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
              <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.55),transparent_55%)]" />
              <span className="relative text-sm text-white/90">U</span>
            </span>
            <span className="text-base text-white/90">
              UNIO{" "}
              <span className="font-medium text-white/50 group-hover:text-white/70">
                Campus
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-white/70 sm:flex">
            <a href="#features" className="hover:text-white/90">
              Features
            </a>
            <a href="#why" className="hover:text-white/90">
              Why UNIO
            </a>
            <a href="#get-started" className="hover:text-white/90">
              Get started
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#get-started"
              className="hidden rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/8 hover:text-white sm:inline-flex"
            >
              Contact
            </a>
            <a
              href="#get-started"
              className="inline-flex items-center justify-center rounded-full bg-indigo px-4 py-2 text-sm font-semibold text-navy shadow-[0_10px_35px_rgba(99,102,241,0.22)] ring-1 ring-white/10 transition hover:brightness-110"
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto w-full max-w-6xl px-5 pb-10 pt-10 sm:px-8 sm:pb-16 sm:pt-16">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12"
          >
            <div className="max-w-xl">
              <motion.div variants={fadeUp}>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/75 ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                  Built for campus clubs, admins, and students
                </div>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl"
              >
                Event Management,{" "}
                <span className="bg-[linear-gradient(90deg,rgba(99,102,241,1),rgba(16,185,129,0.95))] bg-clip-text text-transparent">
                  Reimagined
                </span>{" "}
                for Campus
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-4 text-pretty text-base leading-7 text-white/70 sm:text-lg"
              >
                UNIO helps you launch, promote, and run college events with
                modern RSVPs, QR check-ins, and real-time updates—so your campus
                shows up.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <a
                  href="#get-started"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-indigo px-6 text-sm font-semibold text-navy shadow-[0_12px_40px_rgba(99,102,241,0.26)] ring-1 ring-white/10 transition hover:brightness-110"
                >
                  Create your first event
                </a>
                <a
                  href="#features"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-white/5 px-6 text-sm font-semibold text-white/85 ring-1 ring-white/10 transition hover:bg-white/8"
                >
                  Explore features
                </a>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/55"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  QR-ready check-ins
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  Waitlists + capacity
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  Analytics & insights
                </span>
              </motion.div>
            </div>

            <motion.div
              variants={fadeUp}
              className="relative mx-auto w-full max-w-xl"
            >
              <div className="relative overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(99,102,241,0.35),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_70%,rgba(16,185,129,0.20),transparent_55%)]" />

                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white/85">
                      UNIO Event Hub
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-white/25" />
                      <span className="h-2 w-2 rounded-full bg-white/25" />
                      <span className="h-2 w-2 rounded-full bg-white/25" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl bg-navy/50 p-4 ring-1 ring-white/10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs text-white/55">
                            Featured event
                          </div>
                          <div className="mt-1 text-sm font-semibold text-white/90">
                            Spring Fest Night Market
                          </div>
                          <div className="mt-1 text-xs text-white/60">
                            7:00 PM · Central Quad
                          </div>
                        </div>
                        <div className="rounded-full bg-emerald/15 px-3 py-1 text-xs font-semibold text-emerald ring-1 ring-emerald/25">
                          RSVP open
                        </div>
                      </div>
                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[72%] rounded-full bg-emerald" />
                      </div>
                      <div className="mt-2 text-xs text-white/55">
                        144 / 200 seats filled
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                        <div className="text-xs text-white/55">Check-ins</div>
                        <div className="mt-1 text-2xl font-semibold text-white">
                          312
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          via QR scan
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                        <div className="text-xs text-white/55">Updates</div>
                        <div className="mt-1 text-2xl font-semibold text-white">
                          Live
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          instant notifications
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 -z-10 rounded-[36px] bg-[radial-gradient(closest-side,rgba(99,102,241,0.22),transparent)] blur-2xl"
              />
            </motion.div>
          </motion.div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col gap-10"
          >
            <div className="max-w-2xl">
              <motion.h2
                variants={fadeUp}
                className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl"
              >
                Everything you need to run unforgettable campus events
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-3 text-pretty text-sm leading-6 text-white/65 sm:text-base"
              >
                A dark, focused interface powered by UNIO’s navy, indigo, and
                emerald palette—built to feel fast, modern, and reliable.
              </motion.p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => {
                const Icon = f.icon;
                const iconClass =
                  f.accent === "emerald" ? "text-emerald" : "text-indigo";

                return (
                  <motion.div
                    key={f.title}
                    variants={fadeUp}
                    className="group relative overflow-hidden rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 transition hover:bg-white/7"
                  >
                    <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                      <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-indigo/12 blur-2xl" />
                      <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-emerald/10 blur-2xl" />
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy/50 ring-1 ring-white/10">
                          <Icon className={`h-5 w-5 ${iconClass}`} />
                        </span>
                        <h3 className="text-sm font-semibold text-white/90">
                          {f.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/65">
                        {f.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section
          id="why"
          className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24"
        >
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Designed for momentum
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/65 sm:text-base">
                  UNIO keeps the critical moments crisp—launch, RSVP, check-in,
                  and follow-up. Everything looks and feels consistent, because
                  your campus moves fast.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Navy-first dark UI",
                    "Indigo primary actions",
                    "Emerald progress states",
                    "Motion with restraint",
                  ].map((pill) => (
                    <span
                      key={pill}
                      className="inline-flex items-center rounded-full bg-navy/50 px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-white/10"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-navy/50 p-5 ring-1 ring-white/10">
                  <div className="text-xs text-white/55">Primary accent</div>
                  <div className="mt-2 inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-indigo" />
                    <span className="text-sm font-semibold text-white/85">
                      Indigo
                    </span>
                    <span className="text-xs text-white/50">#6366F1</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-navy/50 p-5 ring-1 ring-white/10">
                  <div className="text-xs text-white/55">Success/progress</div>
                  <div className="mt-2 inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald" />
                    <span className="text-sm font-semibold text-white/85">
                      Emerald
                    </span>
                    <span className="text-xs text-white/50">#10B981</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="get-started"
          className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8"
        >
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[linear-gradient(135deg,rgba(99,102,241,0.18),rgba(16,185,129,0.10))] p-6 ring-1 ring-white/10 sm:flex-row sm:items-center sm:p-10">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold tracking-wide text-white/70">
                Ready to launch your next campus event?
              </div>
              <div className="mt-2 text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Start building with UNIO today.
              </div>
              <div className="mt-2 text-sm leading-6 text-white/65">
                Hook up your auth and data next—this design system is ready for
                real screens.
              </div>
            </div>
            <a
              href="#"
              className="inline-flex h-11 items-center justify-center rounded-full bg-indigo px-6 text-sm font-semibold text-navy shadow-[0_12px_40px_rgba(99,102,241,0.26)] ring-1 ring-white/10 transition hover:brightness-110"
            >
              Get Started
            </a>
          </div>
          <footer className="mt-10 text-xs text-white/45">
            © {new Date().getFullYear()} UNIO. Built for campus.
          </footer>
        </section>
      </main>
    </div>
  );
}
