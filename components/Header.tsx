"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { startSmoothNavigation } from "@/components/NavigationProgress";

interface HeaderProps {
  brandName?: string;
  avatarUrl?: string;
  navItems?: Array<{ label: string; url: string; isButton: boolean }>;
}

export default function Header({
  brandName = "Zenvora",
  avatarUrl = "/images/zenvora-logo.png",
  navItems = [
    { label: "Explore Domains", url: "/#domains", isButton: false },
    { label: "Lectures", url: "/watch-tutorials", isButton: false },
    { label: "Developer Tools", url: "/recommended-tools", isButton: false },
    { label: "Opportunities", url: "/opportunities", isButton: false },
    { label: "Notes", url: "/notes", isButton: false },
    { label: "Start Learning", url: "/opportunities", isButton: true },
  ],
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(68); // sensible default
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);

  // Immediate navigation handler — dispatches progress event and lets Next.js Link route instantly
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
      const isExternal = url.startsWith("http");
      const isHashOnly = url.startsWith("/#") || url === "/";
      if (isExternal || isHashOnly) return;

      // Start progress bar visual feedback without delay
      startSmoothNavigation();
    },
    []
  );

  // Only toggle shadow/border on scroll — height/padding never changes
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Measure real header height after mount so the mobile drawer sits flush below it
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const regularLinks = navItems.filter((item) => !item.isButton);
  const buttonItem = navItems.find((item) => item.isButton);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-brand text-white font-medium rounded-md shadow-lg"
      >
        Skip to content
      </a>

      {/* ── Fixed header — py-4 always, only shadow/border animate on scroll ── */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-40 bg-white py-4 border-b transition-shadow duration-200 ${
          scrolled ? "border-slate-100 shadow-sm" : "border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Brand */}
            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-90"
              aria-label="Zenvora Homepage"
            >
              <Image
                src={avatarUrl || "/images/zenvora-logo.png"}
                alt={brandName || "Zenvora"}
                width={134}
                height={38}
                priority
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>

            {/* Center: Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {regularLinks.map((item) => {
                const isExternal = item.url.startsWith("http");
                const isActive =
                  pathname === item.url ||
                  (!item.url.startsWith("/#") &&
                    item.url !== "/" &&
                    pathname.startsWith(item.url + "/"));
                return (
                  <Link
                    key={item.label}
                    href={item.url}
                    prefetch={true}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onClick={(e) => handleNavClick(e, item.url)}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#1D64EC] font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: CTA button */}
            <div className="hidden md:flex items-center">
              {buttonItem && (
                <Link
                  href={buttonItem.url}
                  prefetch={true}
                  onClick={(e) => handleNavClick(e, buttonItem.url)}
                  className="btn-primary"
                >
                  {buttonItem.label}
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6 text-slate-800" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — top is set dynamically from measured header height */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-x-0 bg-white border-b border-slate-200 p-6 shadow-xl animate-in slide-in-from-top-2"
            style={{ top: headerHeight }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col space-y-4">
              {regularLinks.map((item) => {
                const isExternal = item.url.startsWith("http");
                const isActive =
                  pathname === item.url ||
                  (!item.url.startsWith("/#") &&
                    item.url !== "/" &&
                    pathname.startsWith(item.url + "/"));
                return (
                  <Link
                    key={item.label}
                    href={item.url}
                    prefetch={true}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onClick={(e) => handleNavClick(e, item.url)}
                    className={`text-base font-semibold py-2 px-3 rounded-lg ${
                      isActive
                        ? "bg-[#EEF4FF] text-[#1D64EC]"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {buttonItem && (
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={buttonItem.url}
                    onClick={(e) => handleNavClick(e, buttonItem.url)}
                    className="btn-primary w-full text-center block"
                  >
                    {buttonItem.label}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
