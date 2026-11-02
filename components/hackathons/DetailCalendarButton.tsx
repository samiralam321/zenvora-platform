"use client";

import React, { useState } from "react";
import { Calendar, Bell } from "lucide-react";
import AddToCalendarModal from "./AddToCalendarModal";

interface DetailCalendarButtonProps {
  slug: string;
  title: string;
  organization: string;
  officialPortal?: string;
}

export default function DetailCalendarButton({
  slug,
  title,
  organization,
  officialPortal,
}: DetailCalendarButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-white hover:bg-slate-50 border-2 border-[#1D64EC]/30 text-[#1D64EC] text-sm font-bold rounded-2xl transition shadow-2xs hover:shadow-xs"
      >
        <Calendar className="w-4 h-4 text-[#1D64EC]" />
        Add to Calendar &amp; Set Reminders
      </button>

      <AddToCalendarModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        hackathonSlug={slug}
        hackathonTitle={title}
        organization={organization}
        officialPortal={officialPortal}
      />
    </>
  );
}
