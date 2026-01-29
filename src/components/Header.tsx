"use client";

interface HeaderProps {
  onAboutClick: () => void;
}

export default function Header({ onAboutClick }: HeaderProps) {
  return (
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

        {/* About */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button
            onClick={onAboutClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent border border-white/20 text-text-muted hover:text-cmg-blue hover:border-cmg-blue/40 transition-all text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">About</span>
          </button>
        </div>
      </div>
    </header>
  );
}
