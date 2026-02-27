"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarRange,
  Code2,
  PartyPopper,
  Dumbbell,
  GraduationCap,
  Wand2,
  StickyNote,
} from "lucide-react";

type EventTypeId =
  | "cultural"
  | "tech"
  | "sports"
  | "workshop"
  | "conference"
  | "other";

type EventTypeOption = {
  id: EventTypeId;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
};

type TaskItem = {
  id: string;
  label: string;
  done: boolean;
};

const EVENT_TYPES: EventTypeOption[] = [
  {
    id: "cultural",
    label: "Cultural Fest",
    description: "Fests, nights, performances, and campus celebrations.",
    icon: PartyPopper,
    gradient: "from-indigo-500/80 via-violet-500/80 to-pink-500/80",
  },
  {
    id: "tech",
    label: "Tech Symposium",
    description: "Hackathons, demos, talks, and showcases.",
    icon: Code2,
    gradient: "from-sky-500/80 via-indigo-500/80 to-emerald-500/80",
  },
  {
    id: "sports",
    label: "Sports Meet",
    description: "Tournaments, leagues, and athletic events.",
    icon: Dumbbell,
    gradient: "from-emerald-500/80 via-teal-400/80 to-cyan-400/80",
  },
  {
    id: "workshop",
    label: "Workshop",
    description: "Hands-on, high-intent learning sessions.",
    icon: Wand2,
    gradient: "from-purple-500/80 via-fuchsia-500/80 to-rose-400/80",
  },
  {
    id: "conference",
    label: "Conference",
    description: "Multi-track conferences and symposiums.",
    icon: GraduationCap,
    gradient: "from-amber-400/90 via-orange-500/80 to-rose-500/80",
  },
  {
    id: "other",
    label: "Other",
    description: "Anything else your campus dreams up.",
    icon: StickyNote,
    gradient: "from-slate-500/80 via-slate-400/80 to-slate-300/80",
  },
];

const TASK_PRESETS: Record<EventTypeId, string[]> = {
  cultural: [
    "Lock venue and timings",
    "Book performers / clubs",
    "Design posters and social assets",
    "Set up RSVP and ticketing",
    "Plan food stalls and logistics",
  ],
  tech: [
    "Finalize agenda and speakers",
    "Set up registration + track signups",
    "Coordinate with tech partners",
    "Confirm AV + live-stream setup",
    "Prepare judging criteria / rubrics",
  ],
  sports: [
    "Reserve fields and courts",
    "Publish tournament brackets",
    "Arrange referees and volunteers",
    "Check equipment and safety gear",
    "Coordinate medical support",
  ],
  workshop: [
    "Confirm facilitator and topic",
    "Share pre-work or requirements",
    "Arrange materials or lab access",
    "Limit capacity and waitlist rules",
  ],
  conference: [
    "Plan tracks and sessions",
    "Invite keynote speakers",
    "Publish website and schedule",
    "Coordinate sponsors and booths",
    "Organize check-in and badges",
  ],
  other: [
    "Define event goals and format",
    "Set RSVP / sign-up flow",
    "Share details with marketing",
    "Align on operations and safety",
  ],
};

type EventDetails = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  headcount: string;
  coverName?: string;
};

const STEPS = [
  "Type",
  "Checklist",
  "Details",
  "Review",
] as const;

export default function NewEventPage() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<EventTypeOption | null>(
    null
  );
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [details, setDetails] = useState<EventDetails>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    venue: "",
    headcount: "",
  });
  const [created, setCreated] = useState(false);

  useEffect(() => {
    if (step === 2 && selectedType && tasks.length === 0) {
      const preset = TASK_PRESETS[selectedType.id] ?? [];
      setTasks(
        preset.map((label, index) => ({
          id: `${selectedType.id}-${index}`,
          label,
          done: false,
        }))
      );
    }
  }, [step, selectedType, tasks.length]);

  const currentStepLabel = STEPS[step - 1];

  const canGoNext =
    (step === 1 && selectedType !== null) ||
    (step === 2 && tasks.length > 0) ||
    (step === 3 &&
      !!details.name &&
      !!details.startDate &&
      !!details.endDate &&
      !!details.venue);

  const handleNext = () => {
    if (step === 4) {
      setCreated(true);
      setTimeout(() => {
        setCreated(false);
      }, 2000);
      return;
    }
    if (!canGoNext) return;
    setStep((s) => Math.min(4, s + 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Create new event
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            A guided flow to help you stand up high quality campus events
            quickly.
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 shadow-[0_18px_45px_rgba(15,17,23,0.95)]">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
              Step {step} of 4
            </span>
            <span className="text-slate-400/90">{currentStepLabel}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {STEPS.map((label, index) => {
            const stepIndex = index + 1;
            const active = stepIndex === step;
            const complete = stepIndex < step;
            return (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={`grid h-6 w-6 flex-none place-items-center rounded-full text-[11px] ${
                    complete
                      ? "bg-emerald text-navy"
                      : active
                      ? "bg-indigo text-white"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  {stepIndex}
                </div>
                {index < STEPS.length - 1 && (
                  <div className="h-0.5 flex-1 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        complete
                          ? "bg-gradient-to-r from-emerald to-indigo"
                          : active
                          ? "bg-white/30"
                          : "bg-transparent"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {EVENT_TYPES.map((option) => {
                const Icon = option.icon;
                const selected = selectedType?.id === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedType(option)}
                    className={`group relative overflow-hidden rounded-2xl border p-4 text-left shadow-[0_18px_45px_rgba(15,17,23,0.95)] transition-transform ${
                      selected
                        ? "border-indigo bg-black/50"
                        : "border-white/15 bg-black/40 hover:-translate-y-0.5 hover:border-indigo/60"
                    }`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-45 transition-opacity duration-500 group-hover:opacity-80`}
                    />
                    <div className="relative flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 text-white ring-1 ring-white/40">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">
                            {option.label}
                          </p>
                          {selected && (
                            <span className="rounded-full bg-emerald px-2 py-0.5 text-[10px] font-semibold text-navy">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-100/85">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-white/15 bg-black/40 p-4 shadow-[0_18px_45px_rgba(15,17,23,0.95)] sm:p-5"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Recommended checklist
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Toggle tasks and tweak the wording to match your event.
                  </p>
                </div>
                {selectedType && (
                  <div className="mt-2 rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-200 ring-1 ring-white/20 sm:mt-0">
                    Based on <span className="font-semibold">{selectedType.label}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2 rounded-xl bg-navy/80 px-3 py-2 ring-1 ring-white/10"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setTasks((prev) =>
                          prev.map((t) =>
                            t.id === task.id ? { ...t, done: !t.done } : t
                          )
                        )
                      }
                      className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                        task.done
                          ? "border-emerald bg-emerald text-navy"
                          : "border-slate-500 bg-black/30 text-transparent"
                      }`}
                    >
                      ✓
                    </button>
                    <input
                      value={task.label}
                      onChange={(e) =>
                        setTasks((prev) =>
                          prev.map((t) =>
                            t.id === task.id
                              ? { ...t, label: e.target.value }
                              : t
                          )
                        )
                      }
                      className="flex-1 border-none bg-transparent text-xs text-slate-100 outline-none"
                    />
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-xs text-slate-400">
                    No tasks yet. You can add them later from the Tasks tab.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-white/15 bg-black/40 p-4 shadow-[0_18px_45px_rgba(15,17,23,0.95)] sm:p-5"
            >
              <h2 className="text-sm font-semibold text-white">
                Event details
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Fill out the essentials. You can always refine these later.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300">
                      Event name
                    </label>
                    <input
                      value={details.name}
                      onChange={(e) =>
                        setDetails((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald/0 focus:ring-2"
                      placeholder="Eg. Spring Fest Night Market"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300">
                      Description
                    </label>
                    <textarea
                      value={details.description}
                      onChange={(e) =>
                        setDetails((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald/0 focus:ring-2"
                      rows={4}
                      placeholder="What makes this event special?"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-300">
                        Start date & time
                      </label>
                      <input
                        type="datetime-local"
                        value={details.startDate}
                        onChange={(e) =>
                          setDetails((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald/0 focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300">
                        End date & time
                      </label>
                      <input
                        type="datetime-local"
                        value={details.endDate}
                        onChange={(e) =>
                          setDetails((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald/0 focus:ring-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300">Venue</label>
                    <input
                      value={details.venue}
                      onChange={(e) =>
                        setDetails((prev) => ({
                          ...prev,
                          venue: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald/0 focus:ring-2"
                      placeholder="Eg. Central Quad"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-300">
                        Expected headcount
                      </label>
                      <input
                        value={details.headcount}
                        onChange={(e) =>
                          setDetails((prev) => ({
                            ...prev,
                            headcount: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald/0 focus:ring-2"
                        placeholder="Eg. 200"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300">
                        Cover image
                      </label>
                      <label className="mt-1 flex h-[38px] cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-500/70 bg-black/40 px-3 text-xs text-slate-200 hover:border-emerald/70">
                        <span className="truncate">
                          {details.coverName || "Upload image (optional)"}
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                          Browse
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            setDetails((prev) => ({
                              ...prev,
                              coverName: file ? file.name : undefined,
                            }));
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-white/15 bg-black/40 p-4 shadow-[0_18px_45px_rgba(15,17,23,0.95)] sm:p-5">
                <h2 className="text-sm font-semibold text-white">
                  Review event
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Confirm the key details before you create this event.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 text-xs text-slate-200">
                    <div>
                      <div className="text-slate-400">Type</div>
                      <div className="mt-0.5">
                        {selectedType?.label ?? "Not set"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Name</div>
                      <div className="mt-0.5">
                        {details.name || "Not set"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Venue</div>
                      <div className="mt-0.5">
                        {details.venue || "Not set"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Dates</div>
                      <div className="mt-0.5">
                        {details.startDate || details.endDate
                          ? `${details.startDate || "?"} → ${
                              details.endDate || "?"
                            }`
                          : "Not set"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-slate-200">
                    <div>
                      <div className="text-slate-400">Expected headcount</div>
                      <div className="mt-0.5">
                        {details.headcount || "Not set"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Cover image</div>
                      <div className="mt-0.5">
                        {details.coverName || "Not uploaded"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Description</div>
                      <div className="mt-0.5 text-slate-200/90">
                        {details.description || "No description yet."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-black/40 p-4 shadow-[0_18px_45px_rgba(15,17,23,0.95)] sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Checklist summary
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {tasks.filter((t) => t.done).length} of {tasks.length}{" "}
                      tasks marked ready.
                    </p>
                  </div>
                </div>
                <div className="mt-3 max-h-40 space-y-1.5 overflow-y-auto pr-2 text-xs">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 rounded-lg bg-navy/80 px-2 py-1 ring-1 ring-white/10"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          task.done ? "bg-emerald" : "bg-slate-500"
                        }`}
                      />
                      <span
                        className={
                          task.done ? "text-slate-100" : "text-slate-300"
                        }
                      >
                        {task.label}
                      </span>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-slate-400">
                      No checklist configured for this event.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-slate-300 sm:flex-row">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <CalendarRange className="h-3.5 w-3.5 text-indigo/80" />
          Your progress is stored locally until you create the event.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[11px] font-medium text-slate-100 disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className="inline-flex items-center justify-center rounded-full bg-indigo px-4 py-1.5 text-[11px] font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.8)] ring-1 ring-indigo/60 disabled:opacity-40"
          >
            {step === 4 ? "Create event" : "Next"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {created && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-xs font-semibold text-navy shadow-[0_18px_50px_rgba(16,185,129,0.8)]"
          >
            <Wand2 className="h-4 w-4" />
            Event created (mock) – wire this up to your backend next.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

