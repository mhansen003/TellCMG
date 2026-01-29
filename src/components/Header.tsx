"use client";

interface HeaderProps {
  onAboutClick: () => void;
}

export default function Header({ onAboutClick }: HeaderProps) {
  return (
    <header className="pt-4 pb-2 md:pt-6 md:pb-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-cmg-blue via-cmg-deep to-cmg-navy flex items-center justify-center shadow-lg shadow-cmg-blue/30 animate-float cmg-logo">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-cmg-blue via-cmg-gold to-cmg-light bg-clip-text text-transparent leading-tight">
              TellCMG
            </h1>
            <p className="text-text-muted text-[10px] md:text-xs font-medium tracking-wide uppercase">
              Voice Your Ideas
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="hidden md:block text-text-secondary text-sm leading-snug flex-1">
          Speak your ideas. Help shape the future of{" "}
          <span className="text-cmg-gold font-semibold">CMG&apos;s tools and processes</span>.
        </p>

        {/* Version & About */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <span className="text-xs text-text-muted font-mono">v1.0.0</span>
          <button
            onClick={onAboutClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card/80 border border-border-subtle text-text-muted hover:text-cmg-blue hover:border-cmg-blue/30 transition-all text-sm font-medium"
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
