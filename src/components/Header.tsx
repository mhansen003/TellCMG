"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const TELLCMG_URL = "https://tell-cmg.cmgfinancial.ai/";

interface HeaderProps {
  onAboutClick: () => void;
}

export default function Header({ onAboutClick }: HeaderProps) {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <header className="bg-bg-elevated shadow-[0_2px_10px_rgba(0,0,0,0.15)] relative z-20">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4">
          {/* Logo - CMG FINANCIAL text style */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex flex-col leading-tight">
              <span className="text-2xl md:text-[1.75rem] font-bold text-cmg-blue tracking-tight">
                CMG
              </span>
              <span className="text-xs md:text-sm font-semibold text-text-muted tracking-[0.5px] uppercase">
                Financial
              </span>
            </div>
            <div className="w-px h-9 bg-white/15 hidden sm:block" />
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-semibold text-white leading-tight">
                TellCMG
              </h1>
              <p className="text-[10px] md:text-xs text-text-muted">
                Voice Your Ideas
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="hidden lg:block text-text-secondary text-sm leading-snug flex-1">
            Speak your ideas. Help shape the future of{" "}
            <span className="text-cmg-blue font-semibold">CMG&apos;s tools and processes</span>.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent border border-white/20 text-text-muted hover:text-cmg-blue hover:border-cmg-blue/40 transition-all text-sm font-semibold cursor-pointer"
              title="Show QR code to share TellCMG"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm14 3h.01M17 14h.01M14 14h3v3h-3v-3zm3 3h3v3h-3v-3zm-7 0h.01" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={onAboutClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent border border-white/20 text-text-muted hover:text-cmg-blue hover:border-cmg-blue/40 transition-all text-sm font-semibold cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">About</span>
            </button>
          </div>
        </div>
      </header>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowQR(false)}
          />
          <div className="relative bg-bg-card border border-border-cmg rounded-2xl shadow-2xl shadow-cmg-blue/20 max-w-sm w-full animate-fade_in overflow-hidden">
            {/* Green accent bar */}
            <div className="h-1 bg-gradient-to-r from-cmg-blue to-cmg-deep" />

            <div className="p-6 sm:p-8 text-center">
              {/* QR Code */}
              <div className="inline-flex p-4 rounded-2xl bg-white mb-5">
                <QRCodeSVG
                  value={TELLCMG_URL}
                  size={200}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#2b3e50"
                />
              </div>

              <h2 className="text-lg font-bold text-text-primary mb-1">
                Share TellCMG
              </h2>
              <p className="text-sm text-text-secondary mb-1">
                Scan to open on any device
              </p>
              <p className="text-xs text-cmg-blue font-mono font-semibold mb-5 break-all">
                {TELLCMG_URL}
              </p>

              <button
                onClick={() => setShowQR(false)}
                className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary font-semibold text-sm hover:text-text-primary hover:border-text-muted/30 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
