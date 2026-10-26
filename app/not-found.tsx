import React from "react";
import Link from "next/link";
import { ArrowLeft, Play, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink text-ivory flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Page Not Found</span>
        </div>

        <h1 className="font-serif text-7xl sm:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-gold-mid mb-4">
          404
        </h1>

        <h2 className="font-serif text-2xl font-bold text-ivory mb-3">
          This Page Has Moved or Doesn't Exist
        </h2>

        <p className="text-muted text-sm leading-relaxed mb-8">
          The link you followed may be broken or the URL may have been updated. Head back to the homepage or explore our masterclasses.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="gold-btn w-full sm:w-auto text-xs uppercase tracking-wider font-semibold py-3 px-6">
            <ArrowLeft className="w-4 h-4 text-ink" />
            <span>Return Home</span>
          </Link>

          <Link href="/watch-tutorials" className="secondary-pill w-full sm:w-auto text-xs uppercase tracking-wider font-semibold py-3 px-6">
            <Play className="w-4 h-4 text-gold fill-gold" />
            <span>Watch Tutorials</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
