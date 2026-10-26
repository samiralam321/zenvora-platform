import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zenvora Admin Panel",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#1D64EC] selection:text-white">
      {children}
    </div>
  );
}
