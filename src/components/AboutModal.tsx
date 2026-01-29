"use client";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-bg-secondary border-2 border-cmg-blue/30 rounded-2xl shadow-2xl shadow-cmg-blue/10 overflow-hidden animate-fade_in flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-cmg-blue/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cmg-blue to-cmg-deep flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">How to Use TellCMG</h2>
              <p className="text-xs text-text-muted">Voice your ideas to improve CMG</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-6">
          <div className="p-4 rounded-xl bg-cmg-glow border border-cmg-blue/20">
            <h3 className="text-sm font-bold text-cmg-blue mb-2 flex items-center gap-2">
              <span>💡</span> What is TellCMG?
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              TellCMG lets you speak or type your ideas for improving CMG&apos;s tools, processes, and systems.
              AI transforms your rough idea into a well-structured submission that leadership and product teams can evaluate.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cmg-blue/20 text-cmg-blue flex items-center justify-center text-xs font-bold">?</span>
              How It Works
            </h3>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cmg-blue to-cmg-deep flex items-center justify-center text-white font-bold text-sm">1</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-text-primary mb-1">Speak or Type Your Idea</h4>
                <p className="text-xs text-text-muted leading-relaxed">Click the mic to speak, or type directly. Don&apos;t worry about being polished — just describe what you&apos;d like to see improved.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cmg-blue to-cmg-deep flex items-center justify-center text-white font-bold text-sm">2</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-text-primary mb-1">Choose a Category</h4>
                <p className="text-xs text-text-muted leading-relaxed">Select from <strong>LOS & Tech</strong>, <strong>Pipeline & Ops</strong>, <strong>Marketing & CRM</strong>, or <strong>Products & Growth</strong> to tag your idea.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cmg-blue to-cmg-deep flex items-center justify-center text-white font-bold text-sm">3</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-text-primary mb-1">Add Modifiers (Optional)</h4>
                <p className="text-xs text-text-muted leading-relaxed">Want ROI estimates? Compliance considerations? Check the modifiers to include specific analysis in your submission.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cmg-blue to-cmg-deep flex items-center justify-center text-white font-bold text-sm">4</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-text-primary mb-1">Generate & Share</h4>
                <p className="text-xs text-text-muted leading-relaxed">Click &quot;Structure My Idea&quot; and AI will transform your input into a professional, actionable submission ready for leadership review.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
            <h3 className="text-sm font-bold text-accent-purple mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Interview Mode
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Not sure how to describe your idea? Click <strong>Interview</strong> and an AI assistant will ask you smart questions to help you articulate and refine your idea.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="text-cmg-gold">💡</span> Tips
            </h3>
            <ul className="text-xs text-text-muted space-y-2">
              <li className="flex items-start gap-2"><span className="text-accent-green">✓</span><span>Describe the pain point first, then your idea for fixing it</span></li>
              <li className="flex items-start gap-2"><span className="text-accent-green">✓</span><span>Mention which systems or teams are involved</span></li>
              <li className="flex items-start gap-2"><span className="text-accent-green">✓</span><span>Use &quot;ROI Impact&quot; modifier to add business case estimates</span></li>
              <li className="flex items-start gap-2"><span className="text-accent-green">✓</span><span>Your submission history is saved — revisit past ideas anytime</span></li>
            </ul>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-text-muted">
              Powered by <span className="text-cmg-gold font-semibold">AI</span> — helping CMG loan officers turn ideas into action
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 p-4 border-t border-border-subtle bg-bg-card/50">
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-gradient-to-r from-cmg-blue to-cmg-deep text-white font-bold text-sm hover:brightness-110 transition-all">
            Got it, let&apos;s go!
          </button>
        </div>
      </div>
    </div>
  );
}
