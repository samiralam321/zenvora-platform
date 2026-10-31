"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  Settings,
  Navigation,
  Layers,
  Youtube,
  Wrench,
  BookOpen,
  Users,
  MessageSquare,
  FileText,
  Database,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Code2,
  Trophy,
  NotebookPen,
  GraduationCap,
} from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Domains & Stacks", href: "/admin/domains", icon: Code2 },
  { label: "Lectures & Videos", href: "/admin/tutorials", icon: Youtube },
  { label: "Opportunities", href: "/admin/opportunities", icon: Trophy },
  { label: "Scholarships", href: "/admin/scholarships", icon: GraduationCap },
  { label: "Developer Tools", href: "/admin/tools", icon: Wrench },
  { label: "Notes Management", href: "/admin/notes", icon: NotebookPen },
  { label: "Home Page Builder", href: "/admin/sections", icon: Layers },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
  { label: "Learner Signups", href: "/admin/leads", icon: Users },
  { label: "Student Inquiries", href: "/admin/enquiries", icon: MessageSquare },
  { label: "Navigation", href: "/admin/navigation", icon: Navigation },
  { label: "Legal Pages", href: "/admin/pages", icon: FileText },
  { label: "Backup & Restore", href: "/admin/backup", icon: Database },
];

export default function AdminSidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-900 border border-slate-200 p-0.5">
            <Image
              src="/images/zenvora-icon.png"
              alt="Zenvora"
              width={32}
              height={32}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="font-bold text-slate-900 text-base">Zenvora</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-900 border border-slate-200 shrink-0 p-0.5">
                <Image
                  src="/images/zenvora-icon.png"
                  alt="Zenvora"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="min-w-0">
                <span className="text-base font-bold text-slate-900 tracking-tight block truncate">
                  Zenvora
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#1D64EC] font-bold block">
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Nav links list */}
          <nav className="p-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#EEF4FF] text-[#1D64EC] shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#1D64EC]" : "text-slate-400"
                    }`}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-[#1D64EC] p-2 rounded-lg hover:bg-slate-50 transition"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
              {userEmail || "admin@zenvora.com"}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
