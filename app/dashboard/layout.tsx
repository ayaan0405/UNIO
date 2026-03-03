"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    accent: "#6366F1",
  },
  {
    id: "events",
    label: "Events",
    href: "/dashboard/events",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5.5 1.5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12.5 1.5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M1.5 7.5H16.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5.5 11H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12.5" cy="12.5" r="1" fill="currentColor"/>
      </svg>
    ),
    accent: "#818CF8",
  },
  {
    id: "tasks",
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2.5 9L6.5 13L15.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: "#10B981",
  },
  {
    id: "meetings",
    label: "Meetings",
    href: "/dashboard/meetings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="6.5" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="13" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 15.5C1 12.7386 3.46243 11 6.5 11C9.53757 11 12 12.7386 12 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 10.5C15.2091 10.5 17 11.8431 17 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    accent: "#F59E0B",
  },
  {
    id: "participants",
    label: "Participants",
    href: "/dashboard/participants",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2.5 16C2.5 12.6863 5.46243 10 9 10C12.5376 10 15.5 12.6863 15.5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    accent: "#EC4899",
  },
  {
    id: "certificates",
    label: "Certificates",
    href: "/dashboard/certificates",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1.5" y="3" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5.5 7H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5.5 10H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 13V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6.5 16.5H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    accent: "#14B8A6",
  },
];

const BOTTOM_ITEMS = [
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.7 3.3L11.6 4.4M4.4 11.6L3.3 12.7M12.7 12.7L11.6 11.6M4.4 4.4L3.3 3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "help",
    label: "Help",
    href: "/dashboard/help",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M6 6.2C6 5.09543 6.89543 4.2 8 4.2C9.10457 4.2 10 5.09543 10 6.2C10 7.30457 9.10457 8.2 8 8.2V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const activeItem = NAV_ITEMS.find((item) => getActive(item.href));

  const hours = time.getHours();
  const greeting = hours < 12 ? "Morning" : hours < 18 ? "Afternoon" : "Evening";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0F1117",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          background: "linear-gradient(180deg, #0D0F18 0%, #0A0C14 100%)",
          borderRight: "1px solid rgba(99,102,241,0.12)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          overflow: "hidden",
        }}
      >
        {/* Top glow line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)",
          }}
        />

        {/* Logo Area */}
        <div
          style={{
            padding: collapsed ? "20px 0" : "20px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            minHeight: 64,
          }}
        >
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                {/* Logo mark */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "white",
                    letterSpacing: "-0.5px",
                    boxShadow: "0 0 20px rgba(99,102,241,0.4)",
                    flexShrink: 0,
                  }}
                >
                  U
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "white",
                      letterSpacing: "0.04em",
                      lineHeight: 1,
                    }}
                  >
                    UNIO
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "rgba(99,102,241,0.8)",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      marginTop: 2,
                    }}
                  >
                    Campus Events
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "white",
                  boxShadow: "0 0 20px rgba(99,102,241,0.4)",
                }}
              >
                U
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse toggle */}
          {!collapsed && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(true)}
              style={{
                width: 24,
                height: 24,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          )}

          {collapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(false)}
              style={{
                position: "absolute",
                top: 20,
                right: -12,
                width: 24,
                height: 24,
                background: "#1A1D2E",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(99,102,241,0.8)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          )}
        </div>

        {/* User greeting strip */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Avatar */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366F1, #10B981)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                    boxShadow: "0 0 12px rgba(99,102,241,0.3)",
                  }}
                >
                  A
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.02em" }}>
                    Good {greeting}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.9)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Ayaan
                  </div>
                </div>
                {/* Online dot */}
                <div
                  style={{
                    marginLeft: "auto",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#10B981",
                    boxShadow: "0 0 6px rgba(16,185,129,0.6)",
                    flexShrink: 0,
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active page indicator strip */}
        <AnimatePresence>
          {!collapsed && activeItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                margin: "12px 16px 0",
                padding: "6px 10px",
                background: `linear-gradient(135deg, ${activeItem.accent}15, ${activeItem.accent}08)`,
                border: `1px solid ${activeItem.accent}25`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: activeItem.accent,
                  boxShadow: `0 0 6px ${activeItem.accent}`,
                }}
              />
              <span style={{ fontSize: 10, color: activeItem.accent, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                {activeItem.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav label */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: "16px 20px 6px",
                fontSize: 9,
                fontWeight: 700,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Navigation
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: collapsed ? "12px 0" : "0 10px", overflowY: "auto" }}>
          {NAV_ITEMS.map((item, index) => {
            const isActive = getActive(item.href);
            const isHovered = hoveredItem === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                style={{ marginBottom: collapsed ? 4 : 2 }}
              >
                <Link href={item.href} style={{ textDecoration: "none", display: "block" }}>
                  <motion.div
                    onHoverStart={() => setHoveredItem(item.id)}
                    onHoverEnd={() => setHoveredItem(null)}
                    whileHover={{ x: collapsed ? 0 : 2 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: collapsed ? "10px 0" : "9px 12px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: 10,
                      cursor: "pointer",
                      position: "relative",
                      background: isActive
                        ? `linear-gradient(135deg, ${item.accent}20, ${item.accent}0a)`
                        : isHovered
                        ? "rgba(255,255,255,0.04)"
                        : "transparent",
                      border: isActive
                        ? `1px solid ${item.accent}30`
                        : "1px solid transparent",
                      transition: "background 0.2s, border-color 0.2s",
                    }}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "20%",
                          bottom: "20%",
                          width: 3,
                          borderRadius: 2,
                          background: item.accent,
                          boxShadow: `0 0 8px ${item.accent}`,
                        }}
                      />
                    )}

                    {/* Icon container */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: isActive ? item.accent : isHovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                        background: isActive
                          ? `${item.accent}18`
                          : isHovered
                          ? "rgba(255,255,255,0.06)"
                          : "transparent",
                        transition: "all 0.2s",
                        position: "relative",
                      }}
                    >
                      {item.icon}
                      {/* Glow effect on active */}
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 9,
                            background: `radial-gradient(circle at center, ${item.accent}20, transparent)`,
                          }}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            fontSize: 13.5,
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? "rgba(255,255,255,0.95)" : isHovered ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            transition: "color 0.2s",
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip when collapsed */}
                    {collapsed && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          position: "fixed",
                          left: 80,
                          background: "#1A1D2E",
                          border: `1px solid ${item.accent}40`,
                          borderRadius: 8,
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "white",
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                          zIndex: 100,
                          boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${item.accent}20`,
                        }}
                      >
                        {item.label}
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Divider */}
        <div
          style={{
            margin: collapsed ? "8px auto" : "8px 16px",
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            width: collapsed ? 32 : "auto",
          }}
        />

        {/* Bottom items */}
        <div style={{ padding: collapsed ? "4px 0 16px" : "4px 10px 16px" }}>
          {BOTTOM_ITEMS.map((item) => (
            <Link key={item.id} href={item.href} style={{ textDecoration: "none", display: "block" }}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "8px 0" : "8px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: hoveredItem === item.id ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
                  transition: "color 0.2s",
                  marginBottom: 2,
                }}
              >
                {item.icon}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}

          {/* Version tag */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 8,
                  padding: "0 12px",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.15)",
                  letterSpacing: "0.06em",
                }}
              >
                UNIO v0.2.0 — Beta
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main content */}
      <motion.main
        animate={{ marginLeft: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flex: 1,
          minHeight: "100vh",
          background: "#0F1117",
          position: "relative",
        }}
      >
        {children}
      </motion.main>
    </div>
  );
}