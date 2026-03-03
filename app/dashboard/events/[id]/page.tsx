"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarRange,
  MapPin,
  Users,
  ArrowLeft,
  Gauge,
  ClipboardList,
  UserRound,
  Video,
  Trash2,
  Pencil,
  GripVertical,
  ChevronDown,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type EventStatus = "upcoming" | "ongoing" | "completed";

type EventOverview = {
  id: string;
  name: string;
  type: string;
  description: string;
  date: string;
  venue: string;
  participants: number;
  completion: number;
  status: EventStatus;
};

const MOCK_EVENT: EventOverview = {
  id: "spring-fest-night-market",
  name: "Spring Fest Night Market",
  type: "Cultural Fest",
  date: "Mar 28 · 7:00 PM",
  venue: "Central Quad",
  participants: 200,
  completion: 78,
  status: "upcoming",
  description:
    "An after-hours night market featuring student-run stalls, food, live performances, and interactive experiences across campus.",
};

type TaskStatus = "Todo" | "In Progress" | "Done";
type Priority = "Low" | "Medium" | "High";

type Task = {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  priority: Priority;
  status: TaskStatus;
};

type DeadlineState = {
  isOpen: boolean;
  date: string;
};

type Division = {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
};

const TABS = ["Overview", "Tasks", "Participants", "Meetings"] as const;

function getTypeGradient(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes("cultural")) {
    return "from-purple-500 via-fuchsia-500 to-pink-500";
  }
  if (lower.includes("tech")) {
    return "from-indigo-500 via-sky-500 to-blue-500";
  }
  if (lower.includes("sport")) {
    return "from-emerald-500 via-teal-400 to-cyan-400";
  }
  if (lower.includes("conference") || lower.includes("symposium")) {
    return "from-orange-500 via-amber-400 to-yellow-400";
  }
  if (lower.includes("workshop")) {
    return "from-rose-500 via-red-500 to-pink-500";
  }
  return "from-slate-600 via-slate-500 to-slate-400";
}

const getDeadlineDisplay = (deadline: string) => {
  if (!deadline) return { text: "Set deadline", color: "text-slate-400", hasWarning: false };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      text: `Overdue (${Math.abs(diffDays)} days)`,
      color: "text-red-400 font-semibold",
      hasWarning: true
    };
  } else if (diffDays === 0) {
    return {
      text: "Due Today",
      color: "text-amber-400 font-semibold",
      hasWarning: true
    };
  } else if (diffDays <= 3) {
    return {
      text: `Due in ${diffDays} days`,
      color: "text-amber-300",
      hasWarning: true
    };
  } else {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return {
      text: deadlineDate.toLocaleDateString('en-US', options),
      color: "text-slate-300",
      hasWarning: false
    };
  }
};

function divisionPreset(type: string): Division[] {
  const lower = type.toLowerCase();
  if (lower.includes("tech")) {
    return [
      {
        id: "marketing",
        name: "Marketing",
        color: "text-indigo",
        tasks: [
          {
            id: "m1",
            title: "Publish event page on UNIO",
            assignee: "ayaan@unio.app",
            deadline: "Today · 6:00 PM",
            priority: "High",
            status: "In Progress",
          },
          {
            id: "m2",
            title: "Share social assets with design club",
            assignee: "design@campus.edu",
            deadline: "Tomorrow · 10:00 AM",
            priority: "Medium",
            status: "Todo",
          },
        ],
      },
      {
        id: "logistics",
        name: "Logistics",
        color: "text-emerald",
        tasks: [
          {
            id: "l1",
            title: "Confirm AV setup with auditorium",
            assignee: "ops@campus.edu",
            deadline: "Today · 4:00 PM",
            priority: "High",
            status: "In Progress",
          },
          {
            id: "l2",
            title: "Reserve breakout rooms for 1:1s",
            assignee: "",
            deadline: "Tomorrow · 3:00 PM",
            priority: "Medium",
            status: "Todo",
          },
        ],
      },
      {
        id: "technical",
        name: "Technical",
        color: "text-sky-400",
        tasks: [
          {
            id: "t1",
            title: "Set up recording + stream",
            assignee: "media@campus.edu",
            deadline: "Event day · 3:00 PM",
            priority: "High",
            status: "Todo",
          },
        ],
      },
    ];
  }

  return [
    {
      id: "marketing",
      name: "Marketing",
      color: "text-indigo",
      tasks: [
        {
          id: "gm1",
          title: "Announce event to student mailing list",
          assignee: "",
          deadline: "This week",
          priority: "Medium",
          status: "Todo",
        },
      ],
    },
  ];
}

type SortableTaskProps = {
  divisionId: string;
  task: Task;
  onChange: (task: Task) => void;
  onRequestDelete: () => void;
  confirmDeleteOpen: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  priorityMenuOpen: boolean;
  onTogglePriorityMenu: () => void;
  deadlineStates: Record<string, DeadlineState>;
  onToggleDeadlinePicker: (taskKey: string) => void;
  onUpdateDeadline: (taskKey: string, newDate: string) => void;
};

function SortableTask({
  divisionId,
  task,
  onChange,
  onRequestDelete,
  confirmDeleteOpen,
  onConfirmDelete,
  onCancelDelete,
  priorityMenuOpen,
  onTogglePriorityMenu,
  deadlineStates,
  onToggleDeadlinePicker,
  onUpdateDeadline,
}: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${divisionId}:${task.id}` });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
  };

  const priorityConfig =
    task.priority === "High"
      ? {
          dot: "bg-red-400",
          badge: "bg-red-500 text-white border-red-400/50 shadow-lg shadow-red-500/25",
          edge: "border-l-red-400/70 shadow-[inset_3px_0_18px_rgba(248,113,113,0.22)]",
        }
      : task.priority === "Medium"
      ? {
          dot: "bg-amber-300",
          badge: "bg-amber-500 text-navy border-amber-400/50 shadow-lg shadow-amber-500/25",
          edge: "border-l-amber-300/70 shadow-[inset_3px_0_18px_rgba(251,191,36,0.18)]",
        }
      : {
          dot: "bg-emerald-300",
          badge: "bg-emerald-500 text-white border-emerald-400/50 shadow-lg shadow-emerald-500/25",
          edge: "border-l-emerald-300/70 shadow-[inset_3px_0_18px_rgba(52,211,153,0.16)]",
        };

  const isDone = task.status === "Done";

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.18 }}
      className={`group relative flex items-start gap-3 rounded-xl border-l-4 bg-navy/80 px-4 py-3 ring-1 ring-white/10 transition-colors ${priorityConfig.edge} ${
        isDone ? "opacity-70" : "opacity-100"
      }`}
    >
      <button
        type="button"
        onClick={() =>
          onChange({
            ...task,
            status: isDone ? "Todo" : "Done",
          })
        }
        className={`mt-1 grid h-5 w-5 place-items-center rounded border text-xs transition ${
          isDone
            ? "border-emerald bg-emerald text-navy"
            : "border-slate-500/80 bg-black/30 text-transparent hover:border-emerald/80"
        }`}
        aria-label={isDone ? "Mark task as not done" : "Mark task as done"}
      >
        ✓
      </button>

      <div className="mt-0.5 flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 inline-flex items-center justify-center rounded-md p-1 text-slate-400 opacity-0 transition group-hover:opacity-100"
          aria-label="Drag task"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <input
            value={task.title}
            onChange={(e) => onChange({ ...task, title: e.target.value })}
            className={`w-full border-none bg-transparent text-base font-medium text-slate-100 outline-none transition ${
              isDone ? "line-through text-slate-300" : ""
            }`}
          />
          <div className="relative flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTogglePriorityMenu();
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105 ${priorityConfig.badge}`}
              aria-label="Change priority"
            >
              <span className={`h-2 w-2 rounded-full ${priorityConfig.dot}`} />
              {task.priority}
              <ChevronDown className="h-3.5 w-3.5 opacity-80" />
            </button>

            <AnimatePresence>
              {priorityMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-white/15 bg-[#050711]/95 p-1.5 text-xs shadow-[0_16px_40px_rgba(15,23,42,0.95)]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {(["High", "Medium", "Low"] as const).map((p) => {
                    const isSelected = task.priority === p;
                    const optionConfig =
                      p === "High"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : p === "Medium"
                        ? "bg-amber-500 text-navy hover:bg-amber-600"
                        : "bg-emerald-500 text-white hover:bg-emerald-600";
                    
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          onChange({ ...task, priority: p });
                          onTogglePriorityMenu();
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 font-medium transition-colors ${
                          isSelected ? optionConfig : "text-slate-100 hover:bg-white/10"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              p === "High"
                                ? "bg-red-400"
                                : p === "Medium"
                                ? "bg-amber-300"
                                : "bg-emerald-300"
                            }`}
                          />
                          {p}
                        </span>
                        {isSelected ? (
                          <span className="text-white">✓</span>
                        ) : null}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={task.assignee}
            onChange={(e) => onChange({ ...task, assignee: e.target.value })}
            placeholder="Assign by name or email"
            className="min-w-[180px] flex-1 rounded-full bg-black/40 px-3 py-1.5 text-sm text-slate-100 outline-none ring-1 ring-white/15 placeholder:text-slate-400"
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => onToggleDeadlinePicker(`${divisionId}:${task.id}`)}
              className={`rounded-full bg-black/40 px-3 py-1.5 text-sm ring-1 ring-white/15 transition-colors hover:bg-black/60 ${
                getDeadlineDisplay(task.deadline).color
              }`}
            >
              {getDeadlineDisplay(task.deadline).hasWarning && (
                <span className="inline-flex h-2 w-2 rounded-full bg-current mr-1 animate-pulse" />
              )}
              {getDeadlineDisplay(task.deadline).text}
            </button>
            
            <AnimatePresence>
              {deadlineStates[`${divisionId}:${task.id}`]?.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 top-10 z-20 rounded-xl border border-white/15 bg-[#050711]/95 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.95)]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <div className="text-xs font-medium text-slate-200 mb-2">Set deadline</div>
                  <input
                    type="date"
                    value={deadlineStates[`${divisionId}:${task.id}`]?.date || task.deadline}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      // Update local state for the input
                    }}
                    className="w-full rounded-lg bg-black/40 px-2 py-1.5 text-xs text-slate-100 outline-none ring-1 ring-white/15"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleDeadlinePicker(`${divisionId}:${task.id}`)}
                      className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateDeadline(`${divisionId}:${task.id}`, deadlineStates[`${divisionId}:${task.id}`]?.date || task.deadline)}
                      className="rounded-full bg-indigo-500 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* hover controls */}
      <div className="mt-1 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-slate-200 ring-1 ring-white/20 hover:bg-black/60"
          aria-label="Edit task"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-slate-200 ring-1 ring-white/20 hover:bg-black/60"
          aria-label="Delete task"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRequestDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* delete confirmation */}
      <AnimatePresence>
        {confirmDeleteOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancelDelete();
              }}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-[#050711] p-6 text-sm text-slate-100 shadow-[0_28px_80px_rgba(15,17,23,0.98)]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <div className="text-base font-semibold text-white">Delete this task?</div>
                  <div className="mt-1 text-slate-300">
                    This action cannot be undone. The task will be permanently removed.
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onCancelDelete}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Overview");
  const [divisions, setDivisions] = useState<Division[]>(() =>
    divisionPreset(MOCK_EVENT.type)
  );
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<
    "All" | "High" | "Medium" | "Low"
  >("All");
  const [sortByPriority, setSortByPriority] = useState(false);
  const [confirmTaskKey, setConfirmTaskKey] = useState<string | null>(null);
  const [confirmDivisionId, setConfirmDivisionId] = useState<string | null>(
    null
  );
  const [priorityMenuKey, setPriorityMenuKey] = useState<string | null>(null);
  const [deadlineStates, setDeadlineStates] = useState<Record<string, DeadlineState>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const event = useMemo(() => {
    return {
      ...MOCK_EVENT,
      id: typeof params?.id === "string" ? params.id : MOCK_EVENT.id,
    };
  }, [params]);

  const completionColor =
    event.completion >= 90
      ? "from-emerald to-emerald/70"
      : event.completion >= 60
      ? "from-indigo to-emerald"
      : "from-slate-400 to-indigo";

  const totalTasks = divisions.reduce(
    (acc, d) => acc + d.tasks.length,
    0
  );
  const doneTasks = divisions.reduce(
    (acc, d) => acc + d.tasks.filter((t) => t.status === "Done").length,
    0
  );
  const overallProgress = totalTasks
    ? Math.round((doneTasks / totalTasks) * 100)
    : event.completion;

  const recommendations: Task[] = [
    {
      id: "ai-rec-1",
      title: "Draft post-event feedback form",
      assignee: "",
      deadline: "After event",
      priority: "Medium",
      status: "Todo",
    },
    {
      id: "ai-rec-2",
      title: "Confirm on-ground emergency contact",
      assignee: "",
      deadline: "Before event",
      priority: "High",
      status: "Todo",
    },
  ];

  const handleTaskDragEnd = (divisionId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDivisions((prev) =>
      prev.map((div) => {
        if (div.id !== divisionId) return div;
        const ids = div.tasks.map((t) => `${divisionId}:${t.id}`);
        const oldIndex = ids.indexOf(active.id as string);
        const newIndex = ids.indexOf(over.id as string);
        if (oldIndex === -1 || newIndex === -1) return div;
        return { ...div, tasks: arrayMove(div.tasks, oldIndex, newIndex) };
      })
    );
  };

  const getDeadlineDisplay = (deadline: string) => {
    if (!deadline) return { text: "Set deadline", color: "text-slate-400", hasWarning: false };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        text: `Overdue (${Math.abs(diffDays)} days)`,
        color: "text-red-400 font-semibold",
        hasWarning: true
      };
    } else if (diffDays === 0) {
      return {
        text: "Due Today",
        color: "text-amber-400 font-semibold",
        hasWarning: true
      };
    } else if (diffDays <= 3) {
      return {
        text: `Due in ${diffDays} days`,
        color: "text-amber-300",
        hasWarning: true
      };
    } else {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      return {
        text: deadlineDate.toLocaleDateString('en-US', options),
        color: "text-slate-300",
        hasWarning: false
      };
    }
  };

  const priorityRank: Record<Priority, number> = {
    High: 0,
    Medium: 1,
    Low: 2,
  };

  const toggleDeadlinePicker = (taskKey: string) => {
    setDeadlineStates(prev => ({
      ...prev,
      [taskKey]: {
        isOpen: !prev[taskKey]?.isOpen,
        date: prev[taskKey]?.date || ''
      }
    }));
  };

  const updateDeadline = (taskKey: string, newDate: string) => {
    const [divisionId, taskId] = taskKey.split(':');
    setDivisions(prev =>
      prev.map(div =>
        div.id === divisionId
          ? {
              ...div,
              tasks: div.tasks.map(task =>
                task.id === taskId ? { ...task, deadline: newDate } : task
              )
            }
          : div
      )
    );
    setDeadlineStates(prev => ({
      ...prev,
      [taskKey]: { ...prev[taskKey], date: newDate, isOpen: false }
    }));
  };

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link
          href="/dashboard/events"
          className="inline-flex h-7 items-center rounded-full bg-white/5 px-2 pr-3 text-[11px] text-slate-200 ring-1 ring-white/15 hover:bg-white/10"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back to events
        </Link>
        <span className="hidden sm:inline">/</span>
        <span className="hidden truncate text-[11px] sm:inline">
          {event.name}
        </span>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.8, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/12 bg-black/50 shadow-[0_24px_70px_rgba(15,17,23,0.95)]"
      >
        <div
          className={`relative h-40 w-full overflow-hidden bg-gradient-to-br ${getTypeGradient(
            event.type
          )}`}
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            style={{
              backgroundImage:
                "radial-gradient(circle at 0% 0%, rgba(15,23,42,0.4), transparent 55%), radial-gradient(circle at 100% 100%, rgba(15,23,42,0.7), transparent 55%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/60 to-black/70" />
          <div className="relative flex h-full flex-col justify-end px-5 pb-4 pt-6 sm:px-6 sm:pb-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] text-slate-100 ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
              {event.type}
            </div>
            <h1 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
              {event.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-100">
              <span className="inline-flex items-center gap-1.5">
                <CalendarRange className="h-3.5 w-3.5 text-indigo-200" />
                {event.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-100" />
                {event.venue}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-emerald-200" />
                {event.participants.toLocaleString()} expected
              </span>
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-black/70 px-5 pb-3 pt-3 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 uppercase tracking-[0.18em] text-slate-100">
                <Gauge className="h-3 w-3" />
                Overall progress
              </span>
              <div className="hidden h-1.5 w-40 rounded-full bg-white/10 sm:block">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${completionColor}`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span>{overallProgress}% ready</span>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`inline-flex items-center rounded-full px-4 py-2 font-medium transition-all hover:scale-105 ${
                  active
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/50"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.8, 0.3, 1] }}
        className="space-y-4"
      >
        {activeTab === "Overview" && (
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
            <div className="space-y-4">
              <section className="rounded-2xl border border-white/12 bg-black/45 p-4 text-xs text-slate-200 shadow-[0_18px_50px_rgba(15,17,23,0.95)] sm:p-5">
                <h2 className="text-sm font-semibold text-white">
                  Event overview
                </h2>
                <p className="mt-2 leading-relaxed text-slate-200/90">
                  {event.description}
                </p>
              </section>
            </div>

            <section className="space-y-3 rounded-2xl border border-white/12 bg-black/45 p-4 text-xs text-slate-200 shadow-[0_18px_50px_rgba(15,17,23,0.95)] sm:p-5">
              <h3 className="text-sm font-semibold text-white">
                At a glance
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-navy/80 px-3 py-2 ring-1 ring-white/10">
                  <span className="flex items-center gap-2 text-slate-200">
                    <ClipboardList className="h-4 w-4 text-indigo" />
                    Tasks ready
                  </span>
                  <span>
                    {doneTasks}/{totalTasks || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-navy/80 px-3 py-2 ring-1 ring-white/10">
                  <span className="flex items-center gap-2 text-slate-200">
                    <Users className="h-4 w-4 text-emerald" />
                    RSVPs confirmed
                  </span>
                  <span>144 / 200</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-navy/80 px-3 py-2 ring-1 ring-white/10">
                  <span className="flex items-center gap-2 text-slate-200">
                    <Video className="h-4 w-4 text-indigo" />
                    Meetings scheduled
                  </span>
                  <span>3</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "Tasks" && (
          <section className="space-y-3 rounded-2xl border border-white/12 bg-black/45 p-4 text-xs text-slate-200 shadow-[0_18px_50px_rgba(15,17,23,0.95)] sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Tasks</h3>
                <p className="mt-1 text-slate-400">
                  Organize preparation across divisions and keep everyone on
                  track.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
                  {(["All", "High", "Medium", "Low"] as const).map((p) => {
                    const active = priorityFilter === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriorityFilter(p)}
                        className={`rounded-full px-3 py-1 text-[11px] transition ${
                          active
                            ? "bg-white text-navy shadow-[0_12px_30px_rgba(15,23,42,0.85)]"
                            : "text-slate-200 hover:bg-white/10"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setSortByPriority((v) => !v)}
                  className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] text-slate-100 ring-1 ring-white/15 hover:bg-white/10"
                >
                  Sort: {sortByPriority ? "Priority" : "Default"}
                </button>
                <button
                  type="button"
                  onClick={() => setAiOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_12px_32px_rgba(79,70,229,0.8)] ring-1 ring-indigo/60"
                >
                  ✨ AI recommendations
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-navy/80 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-300">
                  Overall checklist progress
                </span>
                <span className="text-[11px] text-slate-100">
                  {doneTasks}/{totalTasks || 0} tasks · {overallProgress}%
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-black/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo via-purple-400 to-emerald"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {divisions.map((division) => {
                const filteredTasks = division.tasks
                  .filter((t) =>
                    priorityFilter === "All" ? true : t.priority === priorityFilter
                  )
                  .toSorted((a, b) =>
                    sortByPriority ? priorityRank[a.priority] - priorityRank[b.priority] : 0
                  );

                const total = division.tasks.length;
                const done = division.tasks.filter((t) => t.status === "Done").length;
                const progress = total
                  ? Math.round((done / total) * 100)
                  : 0;
                const isCollapsed = collapsed.includes(division.id);

                return (
                  <DndContext
                    key={division.id}
                    sensors={sensors}
                    onDragEnd={(e) => handleTaskDragEnd(division.id, e)}
                  >
                    <div className="rounded-2xl bg-black/40 p-3 ring-1 ring-white/10">
                      <div className="group flex w-full items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCollapsed((prev) =>
                              prev.includes(division.id)
                                ? prev.filter((id) => id !== division.id)
                                : [...prev, division.id]
                            )
                          }
                          className="flex flex-1 items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${division.color}`}
                            >
                              {division.name}
                            </span>
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-200">
                              {done}/{total} done
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="hidden h-1.5 w-24 rounded-full bg-white/10 sm:block">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo to-emerald"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-300">
                              {progress}%
                            </span>
                          </div>
                        </button>

                        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => setConfirmDivisionId(division.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-slate-200 ring-1 ring-white/20 hover:bg-black/60"
                            aria-label="Delete division"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {confirmDivisionId === division.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            className="relative mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-[11px] text-slate-100"
                          >
                            <div className="font-semibold text-white">
                              Delete division?
                            </div>
                            <div className="mt-1 text-slate-200/90">
                              This will delete the division and all tasks inside
                              it.
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setConfirmDivisionId(null)}
                                className="rounded-full bg-white/5 px-3 py-1.5 text-slate-100 hover:bg-white/10"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDivisions((prev) =>
                                    prev.filter((d) => d.id !== division.id)
                                  );
                                  setConfirmDivisionId(null);
                                }}
                                className="rounded-full bg-red-500/90 px-3 py-1.5 font-semibold text-white ring-1 ring-red-300/40 hover:brightness-110"
                              >
                                Delete
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3 space-y-2 overflow-hidden"
                          >
                            <SortableContext
                              items={filteredTasks.map((t) => `${division.id}:${t.id}`)}
                              strategy={verticalListSortingStrategy}
                            >
                              <ul className="space-y-2">
                                <AnimatePresence initial={false}>
                                  {filteredTasks.map((task) => {
                                    const taskKey = `${division.id}:${task.id}`;
                                    return (
                                      <SortableTask
                                        key={task.id}
                                        divisionId={division.id}
                                        task={task}
                                        onChange={(updated) =>
                                          setDivisions((prev) =>
                                            prev.map((d) =>
                                              d.id === division.id
                                                ? {
                                                    ...d,
                                                    tasks: d.tasks.map((t) =>
                                                      t.id === task.id
                                                        ? updated
                                                        : t
                                                    ),
                                                  }
                                                : d
                                            )
                                          )
                                        }
                                        onRequestDelete={() =>
                                          setConfirmTaskKey(taskKey)
                                        }
                                        confirmDeleteOpen={confirmTaskKey === taskKey}
                                        onCancelDelete={() => setConfirmTaskKey(null)}
                                        onConfirmDelete={() => {
                                          setDivisions((prev) =>
                                            prev.map((d) =>
                                              d.id === division.id
                                                ? {
                                                    ...d,
                                                    tasks: d.tasks.filter(
                                                      (t) => t.id !== task.id
                                                    ),
                                                  }
                                                : d
                                            )
                                          );
                                          setConfirmTaskKey(null);
                                        }}
                                        priorityMenuOpen={priorityMenuKey === taskKey}
                                        onTogglePriorityMenu={() =>
                                          setPriorityMenuKey((prev) =>
                                            prev === taskKey ? null : taskKey
                                          )
                                        }
                                        deadlineStates={deadlineStates}
                                        onToggleDeadlinePicker={toggleDeadlinePicker}
                                        onUpdateDeadline={updateDeadline}
                                      />
                                    );
                                  })}
                                </AnimatePresence>
                              </ul>
                            </SortableContext>

                            <button
                              type="button"
                              onClick={() =>
                                setDivisions((prev) =>
                                  prev.map((d) =>
                                    d.id === division.id
                                      ? {
                                          ...d,
                                          tasks: [
                                            ...d.tasks,
                                            {
                                              id: `new-${Date.now()}`,
                                              title: "New task",
                                              assignee: "",
                                              deadline: "",
                                              priority: "Medium",
                                              status: "Todo",
                                            },
                                          ],
                                        }
                                      : d
                                  )
                                )
                              }
                              className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-[11px] text-slate-100 ring-1 ring-white/15 hover:bg-white/10"
                            >
                              + Add task
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </DndContext>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                setDivisions((prev) => [
                  ...prev,
                  {
                    id: `division-${Date.now()}`,
                    name: "New division",
                    color: "text-slate-200",
                    tasks: [],
                  },
                ])
              }
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-[11px] text-slate-100 ring-1 ring-white/15 hover:bg-white/10"
            >
              + Add division
            </button>

            <AnimatePresence>
              {aiOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 grid place-items-center bg-black/60 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.96 }}
                    className="w-full max-w-md rounded-2xl border border-white/15 bg-[#050711] p-4 text-xs text-slate-100 shadow-[0_28px_80px_rgba(15,17,23,0.98)] sm:p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
                          AI recommendations
                        </div>
                        <p className="mt-1 text-[11px] text-slate-300">
                          Suggested tasks for {event.name}. Add them to your
                          divisions in one click.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiOpen(false)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-slate-200 hover:bg-white/10"
                      >
                        ×
                      </button>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {recommendations.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center gap-2 rounded-xl bg-navy/80 px-3 py-2 ring-1 ring-white/10"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                          <span>{task.title}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex justify-end gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAiOpen(false)}
                        className="rounded-full bg-white/5 px-3 py-1.5 text-slate-100 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDivisions((prev) => {
                            if (!prev.length) {
                              return [
                                {
                                  id: "ai-division",
                                  name: "AI suggestions",
                                  color: "text-indigo",
                                  tasks: recommendations,
                                },
                              ];
                            }
                            const [first, ...rest] = prev;
                            return [
                              {
                                ...first,
                                tasks: [...first.tasks, ...recommendations],
                              },
                              ...rest,
                            ];
                          });
                          setAiOpen(false);
                        }}
                        className="rounded-full bg-indigo px-4 py-1.5 font-semibold text-white shadow-[0_16px_40px_rgba(79,70,229,0.85)] ring-1 ring-indigo/70 hover:brightness-110"
                      >
                        Add tasks
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {activeTab === "Participants" && (
          <section className="rounded-2xl border border-white/12 bg-black/45 p-4 text-xs text-slate-200 shadow-[0_18px_50px_rgba(15,17,23,0.95)] sm:p-5">
            <h3 className="text-sm font-semibold text-white">Participants</h3>
            <p className="mt-1 text-slate-400">
              This is a placeholder view. Wire it to your participants data to
              see real attendees and check-in stats.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {["Design Club", "Tech Society", "Entrepreneurship Cell"].map(
                (group) => (
                  <div
                    key={group}
                    className="flex items-center gap-2 rounded-xl bg-navy/80 px-3 py-2 ring-1 ring-white/10"
                  >
                    <UserRound className="h-4 w-4 text-indigo" />
                    <div className="flex-1">
                      <div>{group}</div>
                      <div className="text-[11px] text-slate-400">
                        40–60 attendees expected
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {activeTab === "Meetings" && (
          <section className="rounded-2xl border border-white/12 bg-black/45 p-4 text-xs text-slate-200 shadow-[0_18px_50px_rgba(15,17,23,0.95)] sm:p-5">
            <h3 className="text-sm font-semibold text-white">Meetings</h3>
            <p className="mt-1 text-slate-400">
              Keep organizers, faculty, and partners aligned with structured
              touchpoints.
            </p>
            <ul className="mt-3 space-y-2">
              {[
                "Core planning sync · Today · 5:00 PM",
                "Volunteer briefing · Tomorrow · 4:00 PM",
                "Post-event retro · Next Mon · 6:00 PM",
              ].map((meeting) => (
                <li
                  key={meeting}
                  className="flex items-center gap-2 rounded-xl bg-navy/80 px-3 py-2 ring-1 ring-white/10"
                >
                  <Video className="h-4 w-4 text-indigo" />
                  <span>{meeting}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </motion.div>
    </div>
  );
}

