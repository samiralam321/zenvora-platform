"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Bell,
  Star,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Info,
} from "lucide-react";
import {
  HACKATHON_SCHEDULES,
  getAllUpcomingEvents,
  generateGoogleCalendarUrl,
  generateIcsContent,
  downloadIcsFile,
  HackathonEvent,
  HackathonSchedule,
} from "@/lib/hackathonSchedule";
import AddToCalendarModal from "./AddToCalendarModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  registration_open: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  registration_deadline: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  event_start: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  announcement: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  results: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

export default function HackathonCalendarView() {
  const [activeTab, setActiveTab] = useState<"monthly" | "annual" | "upcoming" | "saved">("monthly");
  const [currentDate, setCurrentDate] = useState(() => new Date(2027, 5, 1)); // Start at mid-2027 where many hackathons cycle
  const [selectedDayEvents, setSelectedDayEvents] = useState<Array<HackathonEvent & { hackathonTitle: string; hackathonSlug: string; organization: string }> | null>(null);
  const [savedHackathons, setSavedHackathons] = useState<string[]>([]);
  const [activeModalSlug, setActiveModalSlug] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string>("default");

  // Load saved hackathons from LocalStorage
  const refreshSaved = () => {
    try {
      const raw = localStorage.getItem("zenvora_saved_hackathons");
      setSavedHackathons(raw ? JSON.parse(raw) : []);
    } catch {}
  };

  useEffect(() => {
    refreshSaved();
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const allEvents = useMemo(() => getAllUpcomingEvents(), []);

  // Events filtered for current month in the monthly calendar
  const currentMonthEvents = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return allEvents.filter((ev) => {
      const d = new Date(ev.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [allEvents, currentDate]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{ dayNumber: number; isCurrentMonth: boolean; dateStr: string; events: typeof allEvents }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().slice(0, 10);
      days.push({
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateStr,
        events: allEvents.filter((e) => e.date === dateStr),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(year, month, d);
      const dateStr = currDate.toISOString().slice(0, 10);
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr,
        events: allEvents.filter((e) => e.date === dateStr),
      });
    }

    // Next month padding to reach multiple of 7
    const remaining = 42 - days.length; // 6 rows * 7 columns
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = nextDate.toISOString().slice(0, 10);
      days.push({
        dayNumber: d,
        isCurrentMonth: false,
        dateStr,
        events: allEvents.filter((e) => e.date === dateStr),
      });
    }

    return days;
  }, [currentDate, allEvents]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayEvents(null);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayEvents(null);
  };

  // Export all saved hackathons
  const handleExportSavedIcs = () => {
    if (savedHackathons.length === 0) return;
    const payload: Array<{ event: HackathonEvent; hackathon: { title: string; organization: string; officialPortal: string; slug: string } }> = [];

    savedHackathons.forEach((slug) => {
      const schedule = HACKATHON_SCHEDULES[slug];
      if (schedule) {
        schedule.events.forEach((ev) => {
          payload.push({
            event: ev,
            hackathon: {
              title: schedule.title,
              organization: schedule.organization,
              officialPortal: schedule.officialPortal,
              slug: schedule.slug,
            },
          });
        });
      }
    });

    const ics = generateIcsContent(payload, "Zenvora Saved Hackathons Calendar");
    downloadIcsFile("zenvora-saved-hackathons.ics", ics);
  };

  // Request browser notification
  const handleRequestNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const res = await Notification.requestPermission();
    setNotificationStatus(res);
    if (res === "granted") {
      new Notification("Zenvora Hackathon Reminders Active!", {
        body: "You will receive reminders before upcoming registration deadlines and events.",
        icon: "/favicon.ico",
      });
    }
  };

  const modalHackathon = activeModalSlug ? HACKATHON_SCHEDULES[activeModalSlug] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-12">
      {/* ── Top Bar with View Tabs ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D64EC]">
              <Sparkles className="w-3.5 h-3.5" />
              Annual Tracker &amp; Schedule
            </span>
            <span className="text-xs text-slate-400 font-medium">&bull; 13 Tracked Programs</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Hackathon Calendar &amp; Smart Reminders
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Track historical cycles, plan ahead for upcoming editions, add events to Google Calendar or .ics, and get deadline alerts.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: "monthly", label: "Monthly Calendar", icon: Calendar },
            { id: "annual", label: "Annual Schedule", icon: Clock },
            { id: "upcoming", label: "Upcoming Events", icon: ArrowRight },
            { id: "saved", label: `My Calendar (${savedHackathons.length})`, icon: Bookmark },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedDayEvents(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Disclaimer Banner ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-6 py-2.5 bg-amber-50/70 border-b border-amber-200/50 text-[11px] text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Provisional Schedule Notice:</strong> Dates marked <em>(Expected)</em> are estimated based on past editions to help students plan ahead. Verify confirmed dates on official organizers&apos; portals.
        </span>
      </div>

      {/* ── View 1: Monthly Calendar ─────────────────────────────────────────── */}
      {activeTab === "monthly" && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {currentMonthEvents.length} Important Dates
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(2027, 5, 1))}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Mid 2027
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
              {calendarDays.map((day, idx) => {
                const hasEvents = day.events.length > 0;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (hasEvents) {
                        setSelectedDayEvents(day.events as any);
                      }
                    }}
                    className={`min-h-[75px] sm:min-h-[90px] p-1.5 sm:p-2 transition flex flex-col justify-between ${
                      day.isCurrentMonth ? "bg-white" : "bg-slate-50/50 text-slate-300"
                    } ${hasEvents ? "cursor-pointer hover:bg-blue-50/30" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          hasEvents
                            ? "bg-[#1D64EC] text-white"
                            : day.isCurrentMonth
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                      {hasEvents && (
                        <span className="text-[10px] font-bold text-[#1D64EC] hidden sm:inline">
                          {day.events.length} event{day.events.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Event pills on day */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {day.events.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className="text-[10px] truncate font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-[#1D64EC] border border-blue-100"
                          title={`${ev.hackathonTitle}: ${ev.label}`}
                        >
                          {ev.hackathonTitle}
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <span className="text-[9px] font-bold text-slate-400 pl-1">
                          +{day.events.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Event Drawer */}
          {selectedDayEvents && (
            <div className="bg-blue-50/40 border border-blue-200/80 rounded-xl p-4 sm:p-5 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1D64EC]" />
                  Events on {selectedDayEvents[0]?.date}
                </h4>
                <button
                  onClick={() => setSelectedDayEvents(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{ev.hackathonTitle}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {ev.organization}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#1D64EC] mb-1">{ev.label}</p>
                      <p className="text-[11px] text-slate-500 leading-snug">{ev.description}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                      <Link
                        href={`/opportunities/${ev.hackathonSlug}`}
                        className="text-[11px] font-bold text-[#1D64EC] hover:underline flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => setActiveModalSlug(ev.hackathonSlug)}
                        className="ml-auto text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded bg-slate-100"
                      >
                        <Calendar className="w-3 h-3 text-[#1D64EC]" />
                        Add to Calendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── View 2: Annual Schedule Matrix ───────────────────────────────────── */}
      {activeTab === "annual" && (
        <div className="p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Annual Hackathon Season Roadmap (Jan &ndash; Dec)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Plan your academic year. Most national hackathons repeat in consistent annual cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(HACKATHON_SCHEDULES).map((item) => (
              <div
                key={item.slug}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.organization}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1D64EC]">
                      {item.dateConfidence}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug mb-3">
                    {item.title}
                  </h4>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Announced:</span>
                      <span className="font-semibold text-slate-800">{item.typicalAnnouncementMonth}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Registration:</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {item.typicalRegistrationMonth}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Hackathon Event:</span>
                      <span className="font-semibold text-slate-800">{item.typicalEventMonth}</span>
                    </div>
                  </div>

                  {/* Past Edition Cycle */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Historical Consistency
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      {item.historicalEditions.map((h) => (
                        <span key={h.year} className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px]">
                          {h.year} &bull; {h.eventDate.slice(5, 7)}/{h.eventDate.slice(0, 4)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <Link
                    href={`/opportunities/${item.slug}`}
                    className="text-xs font-bold text-[#1D64EC] hover:underline"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => setActiveModalSlug(item.slug)}
                    className="ml-auto flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#1D64EC]" />
                    Set Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── View 3: Upcoming Deadlines & Events Timeline ─────────────────────── */}
      {activeTab === "upcoming" && (
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Chronological Hackathon Milestones
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Key dates across all 13 verified competitions ordered by execution date.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {allEvents.map((ev) => {
              const typeStyle = EVENT_TYPE_COLORS[ev.type] || EVENT_TYPE_COLORS.registration_open;
              return (
                <div
                  key={ev.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex flex-col items-center justify-center shrink-0 border border-slate-200 font-mono">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {new Date(ev.date).toLocaleString("default", { month: "short" })}
                      </span>
                      <span className="text-base font-extrabold leading-none text-slate-900">
                        {new Date(ev.date).getDate()}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{ev.hackathonTitle}</span>
                        <span className="text-[10px] text-slate-400">&bull; {ev.organization}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                          {ev.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">{ev.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      onClick={() => setActiveModalSlug(ev.hackathonSlug)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#1D64EC]" />
                      Add to Calendar
                    </button>
                    <Link
                      href={`/opportunities/${ev.hackathonSlug}`}
                      className="p-2 rounded-lg bg-[#EEF4FF] hover:bg-blue-100 text-[#1D64EC] transition"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── View 4: My Calendar / Saved Hackathons ───────────────────────────── */}
      {activeTab === "saved" && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Personal Saved Hackathons ({savedHackathons.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved competitions are stored in your browser. Download combined calendar feeds or configure reminders.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {notificationStatus !== "granted" && (
                <button
                  onClick={handleRequestNotification}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Enable Alerts
                </button>
              )}
              {savedHackathons.length > 0 && (
                <button
                  onClick={handleExportSavedIcs}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#1D64EC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export All (.ics)
                </button>
              )}
            </div>
          </div>

          {savedHackathons.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No hackathons saved yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Click &ldquo;Add to Calendar&rdquo; on any hackathon card to save it to your personal tracking board.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedHackathons.map((slug) => {
                const schedule = HACKATHON_SCHEDULES[slug];
                if (!schedule) return null;

                return (
                  <div
                    key={slug}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {schedule.organization}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          Tracking Active
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2">{schedule.title}</h4>
                      <p className="text-xs text-slate-500 mb-3">
                        Next cycle: <strong className="text-slate-800">{schedule.expectedNextEdition}</strong>
                      </p>

                      <div className="space-y-1 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {schedule.events.map((e) => (
                          <div key={e.id} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 font-medium truncate">{e.label}:</span>
                            <span className="font-mono text-slate-800 shrink-0">{e.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Link
                        href={`/opportunities/${slug}`}
                        className="text-xs font-bold text-[#1D64EC] hover:underline"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => setActiveModalSlug(slug)}
                        className="ml-auto text-xs font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
                      >
                        Edit Reminders
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Active Add to Calendar Modal ─────────────────────────────────────── */}
      {modalHackathon && (
        <AddToCalendarModal
          isOpen={!!activeModalSlug}
          onClose={() => setActiveModalSlug(null)}
          hackathonSlug={modalHackathon.slug}
          hackathonTitle={modalHackathon.title}
          organization={modalHackathon.organization}
          officialPortal={modalHackathon.officialPortal}
          onSavedChange={refreshSaved}
        />
      )}
    </div>
  );
}
