"use client";

import React, { useState } from "react";
import { X, Check, Copy, ExternalLink, QrCode, Heart, Coffee, ShieldCheck } from "lucide-react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyMeACoffeeUrl?: string;
  upiId?: string;
  creatorName?: string;
}

export default function SupportModal({
  isOpen,
  onClose,
  buyMeACoffeeUrl = "https://buymeacoffee.com/samiralam",
  upiId = "sa8103339@okaxis",
  creatorName = "Samir Alam",
}: SupportModalProps) {
  const [activeTab, setActiveTab] = useState<"bmac" | "upi">("bmac");
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentAmount = customAmount ? parseFloat(customAmount) || selectedAmount : selectedAmount;

  // Generate standard UPI deep link & QR Code URL
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    creatorName
  )}&am=${encodeURIComponent(currentAmount)}&cu=INR&tn=${encodeURIComponent(
    "Support Zenvora Education"
  )}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiPayUrl
  )}`;

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-5 text-slate-900 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-slate-900 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/90 shadow-sm flex items-center justify-center text-amber-600">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-950 flex items-center gap-1.5">
                Support Zenvora <Heart className="w-4 h-4 fill-rose-600 text-rose-600 inline" />
              </h3>
              <p className="text-xs text-slate-800 font-medium">
                Keep roadmaps, lectures &amp; templates 100% free
              </p>
            </div>
          </div>
        </div>

        {/* Payment Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 border-b border-slate-100 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("bmac")}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "bmac"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            Buy Me a Coffee (Cards/Global)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upi")}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "upi"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            UPI / QR (India &amp; GPay)
          </button>
        </div>

        {/* Tab 1: Buy Me a Coffee (Global Cards, Apple Pay, Google Pay) */}
        {activeTab === "bmac" && (
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-amber-50 rounded-full text-amber-700">
              <Coffee className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 text-base">
                Support via Buy Me a Coffee
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Accepts Credit/Debit Cards (Visa, Mastercard, Amex), Apple Pay, Google Pay &amp; PayPal worldwide.
              </p>
            </div>

            {/* Official BMC Action Button */}
            <a
              href={buyMeACoffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-xl bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <svg
                width="20"
                height="24"
                viewBox="0 0 760 1093"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-auto"
              >
                <path
                  d="M729.833 440.091C713.882 321.492 632.744 290.79 617.279 285.501C588.667 275.698 554.407 268.082 516.427 263.149C523.504 227.18 528.271 184.288 528.271 138.877C528.271 62.1558 409.897 0 264.135 0C118.374 0 0 62.1558 0 138.877C0 184.288 4.76751 227.18 11.8445 263.149C6.67807 263.821 1.96827 264.67 0.0559795 265.419C-0.347781 265.578 -0.0116671 266.19 0.407262 266.246L11.8445 267.795C17.6521 297.025 25.8016 324.965 35.8859 351.04C49.919 387.29 67.8767 419.645 89.0437 447.166C93.0729 452.398 97.2872 457.422 101.666 462.247C105.77 466.772 109.967 471.077 114.254 475.163C155.679 514.653 207.039 537.494 264.135 537.494C321.232 537.494 372.592 514.653 414.017 475.163C418.304 471.077 422.501 466.772 426.605 462.247C430.984 457.422 435.198 452.398 439.227 447.166C449.654 433.608 459.208 418.899 467.788 403.179C472.049 423.868 477.568 443.435 484.27 461.737C491.547 481.597 500.413 499.782 510.686 516.14C524.382 537.947 540.852 555.772 559.674 569.177C578.497 582.583 599.284 591.312 621.503 595.148C630.947 596.778 640.643 597.432 650.415 597.105C667.575 596.531 685.228 591.688 701.321 581.423C724.819 566.435 741.056 542.449 746.853 513.785C752.65 485.122 747.531 454.499 729.833 440.091ZM649.387 544.757C632.41 544.757 615.938 538.163 603.629 526.436C590.224 513.666 580.457 495.952 574.654 474.965C568.851 453.978 567.247 430.647 569.882 407.249C570.627 400.638 571.745 394.075 573.224 387.587C589.658 392.42 607.037 398.243 624.964 405.029C647.784 413.67 667.652 424.314 682.493 436.425C691.031 443.393 695.539 454.004 694.755 464.912C693.97 475.82 688.006 485.459 678.89 491.272C670.36 496.709 660.106 500.086 649.387 500.086V544.757Z"
                  fill="currentColor"
                />
              </svg>
              <span>Proceed to Buy Me a Coffee</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
            </a>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure checkout processed by Buy Me A Coffee</span>
            </div>
          </div>
        )}

        {/* Tab 2: UPI / QR Code (Zero Fees for India) */}
        {activeTab === "upi" && (
          <div className="p-6 space-y-4">
            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Contribution Amount (INR):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      currentAmount === amt && !customAmount
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ₹{amt} {amt === 50 ? "☕" : amt === 100 ? "☕☕" : "🚀"}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="Scan to pay via UPI"
                width={170}
                height={170}
                className="w-40 h-40 rounded-lg bg-white p-2 shadow-sm border border-slate-200"
              />
              <span className="text-[11px] text-slate-500 mt-2 font-medium">
                Scan with GPay &bull; PhonePe &bull; Paytm &bull; BHIM
              </span>
            </div>

            {/* Copyable UPI ID */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Or pay directly to UPI ID:</span>
                <span className="text-emerald-600 font-medium">0% Platform Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={upiId}
                  className="w-full text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="shrink-0 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile UPI Deep Link */}
            <a
              href={upiPayUrl}
              className="sm:hidden block w-full py-2.5 text-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
            >
              Open in UPI App (GPay / PhonePe)
            </a>
          </div>
        )}

        {/* Footer note */}
        <div className="bg-slate-50 border-t border-slate-100 p-3 text-center">
          <p className="text-[11px] text-slate-500">
            Thank you for helping us keep tech education free for everyone! ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
