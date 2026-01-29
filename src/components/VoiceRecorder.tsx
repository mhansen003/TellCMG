"use client";

interface VoiceRecorderProps {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
}

export default function VoiceRecorder({
  isListening,
  isSupported,
  interimTranscript,
  onStart,
  onStop,
}: VoiceRecorderProps) {
  if (!isSupported) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={isListening ? onStop : onStart}
        className={`
          relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer group
          ${
            isListening
              ? "bg-gradient-to-br from-cmg-blue to-cmg-deep mic-recording scale-110"
              : "bg-bg-card hover:bg-bg-elevated border-2 border-cmg-blue/40 hover:border-cmg-blue shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] animate-pulse-glow"
          }
        `}
        aria-label={isListening ? "Stop recording" : "Start recording"}
        title={isListening ? "Tap to stop recording" : "Tap to speak your idea"}
      >
        {!isListening && (
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cmg-blue/30 to-cmg-deep/30 blur-sm animate-pulse" />
        )}

        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-cmg-blue/30 animate-pulse_ring" />
            <span className="absolute inset-0 rounded-full bg-cmg-blue/20 animate-pulse_ring" style={{ animationDelay: "0.5s" }} />
            <span className="absolute inset-0 rounded-full bg-cmg-blue/10 animate-pulse_ring" style={{ animationDelay: "1s" }} />
          </>
        )}

        <svg
          className={`w-8 h-8 sm:w-10 sm:h-10 relative z-10 transition-all ${
            isListening ? "text-white scale-90" : "text-text-secondary group-hover:text-cmg-blue"
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {isListening ? (
            <rect x="6" y="6" width="12" height="12" rx="2" />
          ) : (
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          )}
        </svg>
      </button>

      <p className="text-xs font-semibold text-text-muted">
        {isListening ? (
          <span className="flex items-center gap-1.5 text-cmg-blue">
            <span className="w-1.5 h-1.5 bg-cmg-blue rounded-full animate-pulse" />
            Listening...
          </span>
        ) : (
          "Speak"
        )}
      </p>
    </div>
  );
}
