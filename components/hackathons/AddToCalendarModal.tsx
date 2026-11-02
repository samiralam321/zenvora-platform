"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Download, Check, Bell, ExternalLink, AlertCircle, Bookmark } from "lucide-react";
import {
  getHackathonSchedule,
  generateGoogleCalendarUrl,
  generateIcsContent,
  downloadIcsFile,
  HackathonEvent,
  HackathonSchedule,
} from "@/lib/hackathonSchedule";

interface AddToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathonSlug: string;
  hackathonTitle: string;
  organization: string;
  officialPortal?: string;
  onSavedChange?: () => void;
}

const REMINDER_OPTIONS = [
  { label: "On event day", days: 0 },
  { label: "1 day before", days: 1 },
  { label: "3 days before", days: 3 },
  { label: "7 days before", days: 7 },
  { label: "14 days before", days: 14 },
  { label: "30 days before", days: 30 },
];

export default function AddToCalendarModal({
  isOpen,
  onClose,
  hackathonSlug,
  hackathonTitle,
  organization,
  officialPortal = "https://unstop.com/",
  onSavedChange,
}: AddToCalendarModalProps) {
  const schedule: HackathonSchedule | null = getHackathonSchedule(hackathonSlug);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [selectedReminders, setSelectedReminders] = useState<number[]>([1, 7]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  // Load saved state on mount or when hackathonSlug changes
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    try {
      const savedRaw = localStorage.getItem("zenvora_saved_hackathons");
      const savedList: string[] = savedRaw ? JSON.parse(savedRaw) : [];
      setIsSaved(savedList.includes(hackathonSlug));

      const remindersRaw = localStorage.getItem(`zenvora_reminders_${hackathonSlug}`);
      if (remindersRaw) {
        setSelectedReminders(JSON.parse(remindersRaw));
      }
    } catch {}

    // Default select all events
    if (schedule && schedule.events.length > 0) {
      setSelectedEventIds(schedule.events.map((e) => e.id));
    }
  }, [isOpen, hackathonSlug, schedule]);

  if (!isOpen) return null;

  const events: HackathonEvent[] = schedule?.events || [
    {
      id: "default-event",
      type: "registration_open",
      label: "Annual Registration Cycle (Expected)",
      date: "2027-06-15",
      isEstimated: true,
      description: `Annual edition expected for ${hackathonTitle}. Verify on official portal.`,
    },
  ];

  const handleToggleEvent = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllEvents = () => {
    if (selectedEventIds.length === events.length) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(events.map((e) => e.id));
    }
  };

  const handleToggleReminder = (days: number) => {
    setSelectedReminders((prev) =>
      prev.includes(days) ? prev.filter((d) => d !== days) : [...prev, days]
    );
  };

  // Google Calendar handler
  const handleGoogleCalendar = (singleEvent?: HackathonEvent) => {
    const targetEvent = singleEvent || events.find((e) => selectedEventIds.includes(e.id)) || events[0];
    const url = generateGoogleCalendarUrl(targetEvent, {
      title: hackathonTitle,
      organization,
      officialPortal: schedule?.officialPortal || officialPortal,
      slug: hackathonSlug,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Download .ics handler
  const handleDownloadIcs = () => {
    const selectedEvents = events.filter((e) => selectedEventIds.includes(e.id));
    if (selectedEvents.length === 0) return;

    const payload = selectedEvents.map((ev) => ({
      event: ev,
      hackathon: {
        title: hackathonTitle,
        organization,
        officialPortal: schedule?.officialPortal || officialPortal,
        slug: hackathonSlug,
      },
    }));

    const icsContent = generateIcsContent(payload, `${hackathonTitle} Schedule`);
    downloadIcsFile(`${hackathonSlug}-calendar.ics`, icsContent);
  };

  // Save to My Calendar
  const handleSaveToMyCalendar = async () => {
    try {
      // 1. Update saved list
      const savedRaw = localStorage.getItem("zenvora_saved_hackathons");
      const savedList: string[] = savedRaw ? JSON.parse(savedRaw) : [];
      let nextList: string[];
      if (isSaved) {
        nextList = savedList.filter((s) => s !== hackathonSlug);
        setIsSaved(false);
      } else {
        nextList = Array.from(new Set([...savedList, hackathonSlug]));
        setIsSaved(true);
      }
      localStorage.setItem("zenvora_saved_hackathons", JSON.stringify(nextList));

      // 2. Save custom reminder intervals
      localStorage.setItem(
        `zenvora_reminders_${hackathonSlug}`,
        JSON.stringify(selectedReminders)
      );

      // 3. Request browser notifications if not granted and user is saving
      if (!isSaved && typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          const perm = await Notification.requestPermission();
          setNotificationPermission(perm);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onSavedChange) onSavedChange();
    } catch (e) {
      console.error("Error saving hackathon:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Add to Calendar &amp; Reminders
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {hackathonTitle} &bull; {organization}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Estimated Schedule Info */}
          {schedule && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Typical Annual Cycle:</span>
                <span className="font-bold text-slate-800">{schedule.typicalRegistrationMonth}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Next Edition:</span>
                <span className="font-bold text-[#1D64EC]">{schedule.expectedNextEdition}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Schedule Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {schedule.dateConfidence} Confidence (Provisional)
                </span>
              </div>
            </div>
          )}

          {/* Select Events */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Important Dates
              </label>
              <button
                type="button"
                onClick={handleSelectAllEvents}
                className="text-xs font-semibold text-[#1D64EC] hover:underline"
              >
                {selectedEventIds.length === events.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="space-y-2">
              {events.map((ev) => {
                const isChecked = selectedEventIds.includes(ev.id);
                return (
                  <div
                    key={ev.id}
                    onClick={() => handleToggleEvent(ev.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition ${
                      isChecked
                        ? "bg-[#EEF4FF]/40 border-[#1D64EC]/40"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleEvent(ev.id)}
                      className="mt-1 h-4 w-4 rounded text-[#1D64EC] focus:ring-[#1D64EC] border-slate-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{ev.label}</span>
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                          {ev.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{ev.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reminder Preferences */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                Custom Reminder Alerts
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Notify before deadline</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {REMINDER_OPTIONS.map((opt) => {
                const active = selectedReminders.includes(opt.days);
                return (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => handleToggleReminder(opt.days)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition text-center ${
                      active
                        ? "bg-[#1D64EC] text-white border-[#1D64EC]"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disclaimer Callout */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Estimated Dates Disclaimer:</strong> Projected dates are calculated from previous
              annual editions. Always confirm final deadlines and eligibility on the official portal.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Google Calendar Link */}
            <button
              onClick={() => handleGoogleCalendar()}
              disabled={selectedEventIds.length === 0}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition disabled:opacity-50"
            >
              <Calendar className="w-3.5 h-3.5 text-[#1D64EC]" />
              Google Calendar
            </button>

            {/* Download .ics */}
            <button
              onClick={handleDownloadIcs}
              disabled={selectedEventIds.length === 0}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Download .ics
            </button>
          </div>

          {/* Save to My Calendar (with instant LocalStorage sync) */}
          <button
            onClick={handleSaveToMyCalendar}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-xl transition shadow-sm ${
              isSaved
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-[#1D64EC] hover:bg-blue-700 text-white"
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                {isSaved ? "Saved to My Calendar & Alerts Configured!" : "Removed from My Calendar"}
              </>
            ) : isSaved ? (
              <>
                <Bookmark className="w-4 h-4 fill-white" />
                Saved in My Calendar (Click to Remove)
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                Save to My Calendar &amp; Enable Reminders
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
