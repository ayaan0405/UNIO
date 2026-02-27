"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarRange,
  MapPin,
  Users,
  MoreHorizontal,
  CheckCircle2,
  Clock3,
  BadgeCheck,
} from "lucide-react";

type EventStatus = "upcoming" | "ongoing" | "completed";

type EventType =
  | "Cultural"
  | "Tech"
  | "Sports"
  | "Workshop"
  | "Conference"
  | "Other";

type Event = {
  id: string;
  name: string;
  type: EventType;
  description: string;
  date: string;
  venue: string;
  participants: number;
  completion: number;
  status: EventStatus;
  coverUrl?: string;
  tasksDone: number;
  tasksTotal: number;
  daysRemaining: number;
  assignees: string[];
};

const MOCK_EVENTS: Event[] = [
  {
    id: "spring-fest-night-market",
    name: "Spring Fest Night Market",
    type: "Cultural",
    description:
      "Night market featuring food stalls, performances, and club showcases across the quad.",
    date: "Mar 28 · 7:00 PM",
    venue: "Central Quad",
    participants: 200,
    completion: 78,
    status: "upcoming",
    tasksDone: 12,
    tasksTotal: 16,
    daysRemaining: 5,
    assignees: ["AK", "MS", "JR"],
  },
  {
    id: "ai-campus-panel",
    name: "AI in Campus Life Panel",
    type: "Conference",
    description:
      "Faculty, founders, and students discuss the role of AI on campus life.",
    date: "Today · 5:30 PM",
    venue: "Auditorium A",
    participants: 160,
    completion: 92,
    status: "ongoing",
    tasksDone: 18,
    tasksTotal: 20,
    daysRemaining: 0,
    assignees: ["RS", "LT", "NP"],
  },
  {
    id: "founders-pitch-night",
    name: "Founders Club Pitch Night",
    type: "Tech",
    description:
      "Student founders pitch to alumni, angels, and faculty mentors.",
    date: "Tomorrow · 7:00 PM",
    venue: "Innovation Hub",
    participants: 120,
    completion: 54,
    status: "upcoming",
    tasksDone: 7,
    tasksTotal: 13,
    daysRemaining: 1,
    assignees: ["AK", "DL", "HS"],
  },
  {
    id: "intramural-sports-meet",
    name: "Intramural Sports Meet",
    type: "Sports",
    description:
      "Full-day track and field meet bringing together intramural teams.",
    date: "Apr 6 · 9:00 AM",
    venue: "Main Stadium",
    participants: 340,
    completion: 100,
    status: "completed",
    tasksDone: 20,
    tasksTotal: 20,
    daysRemaining: 0,
    assignees: ["CG", "VK", "RM"],
  },
];

const FILTERS = ["All", "Upcoming", "Ongoing", "Completed"] as const;

function statusConfig(status: EventStatus) {
  if (status === "upcoming") {
    return {
      label: "Upcoming",
      color: "text-indigo bg-indigo/15 ring-indigo/40",
      icon: Clock3,
    };
  }
  if (status === "ongoing") {
    return {
      label: "Ongoing",
      color: "text-emerald bg-emerald/15 ring-emerald/40",
      icon: BadgeCheck,
    };
  }
  return {
    label: "Completed",
    color: "text-slate-300 bg-white/5 ring-white/20",
    icon: CheckCircle2,
  };
}

export default function EventsPage() {
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTERS)[number]>("All");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const events = MOCK_EVENTS;

  const filteredEvents = useMemo(() => {
    if (activeFilter === "All") return events;
    const normalized = activeFilter.toLowerCase() as EventStatus;
    return events.filter((e) => e.status === normalized);
  }, [activeFilter, events]);

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Events
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Plan, track, and analyze every event happening on campus.
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center justify-center rounded-full bg-indigo px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.8)] ring-1 ring-indigo/60 hover:brightness-110 sm:text-sm"
        >
          <CalendarRange className="mr-2 h-4 w-4" />
          Create new event
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 shadow-[0_18px_45px_rgba(15,17,23,0.9)] sm:px-4">
        <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px]">
          {FILTERS.map((filter) => {
            const active = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`inline-flex items-center rounded-full px-3 py-1.5 transition ${
                  active
                    ? "bg-white text-navy shadow-[0_12px_32px_rgba(15,23,42,0.9)]"
                    : "bg-white/10 text-slate-100 ring-1 ring-white/15 hover:bg-white/15"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
        <div className="text-[11px] text-slate-400">
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1 ? "event" : "events"} visible
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-600/50 bg-black/40 px-6 py-12 text-center shadow-[0_18px_45px_rgba(15,17,23,0.95)]"
        >
          <div className="relative mb-4 h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.8),transparent_60%)] blur-lg" />
            <div className="relative grid h-full w-full place-items-center rounded-full border border-white/20 bg-black/40">
              <CalendarRange className="h-8 w-8 text-indigo" />
            </div>
          </div>
          <h2 className="text-base font-semibold text-white">
            No events yet
          </h2>
          <p className="mt-2 max-w-md text-xs text-slate-400 sm:text-sm">
            Start by creating your first campus event. You can always come back
            to manage RSVPs, tasks, and follow-ups from this page.
          </p>
          <Link
            href="/dashboard/events/new"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-indigo px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.8)] ring-1 ring-indigo/60 hover:brightness-110"
          >
            <CalendarRange className="mr-2 h-4 w-4" />
            Create an event
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.06, delayChildren: 0.04 },
            },
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          {filteredEvents.map((event) => {
            const status = statusConfig(event.status);
            const StatusIcon = status.icon;
            const dimmed = hoveredId !== null && hoveredId !== event.id;

            const typeGradient =
              event.type === "Cultural"
                ? "from-purple-500 via-fuchsia-500 to-pink-500"
                : event.type === "Tech"
                ? "from-indigo-500 via-sky-500 to-blue-500"
                : event.type === "Sports"
                ? "from-emerald-500 via-teal-400 to-cyan-400"
                : event.type === "Conference"
                ? "from-orange-500 via-amber-400 to-yellow-400"
                : event.type === "Workshop"
                ? "from-rose-500 via-red-500 to-pink-500"
                : "from-slate-600 via-slate-500 to-slate-400";

            return (
              <Link key={event.id} href={`/dashboard/events/${event.id}`} className="block">
                <motion.article
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.35,
                        ease: [0.25, 0.8, 0.3, 1],
                      },
                    },
                  }}
                  onMouseEnter={() => setHoveredId(event.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_55px_rgba(15,17,23,0.95)] backdrop-blur-sm transition ${
                    dimmed ? "opacity-60" : "opacity-100"
                  }`}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${typeGradient}`}
                    style={
                      event.coverUrl
                        ? {
                            backgroundImage: `url(${event.coverUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-black"
                    initial={{ opacity: 0.6 }}
                    whileHover={{ opacity: 0.45 }}
                    transition={{ duration: 0.25 }}
                  />

                  <div className="relative flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-white">
                          {event.name}
                        </h2>
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                          {event.type}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-slate-100 ring-1 ring-white/40 hover:bg-black/60"
                            aria-label="Change cover image"
                          >
                            <CalendarRange className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenu((prev) =>
                                prev === event.id ? null : event.id
                              );
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-slate-100 ring-1 ring-white/40 hover:bg-black/60"
                            aria-label="Event menu"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] ring-1 ${status.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </div>
                      </div>

                      <AnimatePresence>
                        {openMenu === event.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="absolute right-2 top-10 z-20 w-32 rounded-xl border border-white/15 bg-[#050711]/95 p-1 text-[11px] text-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.95)]"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <button
                              type="button"
                              className="flex w-full items-center rounded-lg px-2 py-1.5 hover:bg-white/10"
                            >
                              Edit
                            </button>
                            <Link
                              href={`/dashboard/events/${event.id}`}
                              className="flex w-full items-center rounded-lg px-2 py-1.5 hover:bg-white/10"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              className="flex w-full items-center rounded-lg px-2 py-1.5 text-red-300 hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-100">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarRange className="h-3 w-3 text-indigo-200" />
                        {event.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-slate-100" />
                        {event.venue}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-emerald-200" />
                        {event.participants.toLocaleString()} participants
                      </span>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: hoveredId === event.id ? 1 : 0,
                        height: hoveredId === event.id ? "auto" : 0,
                      }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden text-[11px] text-slate-100"
                    >
                      <div className="mt-3 rounded-2xl bg-black/40 p-3 ring-1 ring-white/15">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-300">
                            Task progress
                          </span>
                          <span className="text-[11px] text-slate-100">
                            {event.completion}% · {event.tasksDone}/
                            {event.tasksTotal} tasks
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${event.completion}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300"
                          />
                        </div>

                        <p className="mt-2 line-clamp-2 text-[11px] text-slate-100/90">
                          {event.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                              <span>
                                {event.participants.toLocaleString()} registered
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo" />
                              <span>
                                {event.daysRemaining > 0
                                  ? `${event.daysRemaining} days remaining`
                                  : event.status === "completed"
                                  ? "Completed"
                                  : "Happening today"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {event.assignees.map((initials) => (
                              <div
                                key={initials}
                                className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[10px] font-semibold text-navy shadow-[0_6px_16px_rgba(15,23,42,0.9)]"
                              >
                                {initials}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.article>
              </Link>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

