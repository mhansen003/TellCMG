"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { PromptModeId } from "@/lib/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useClipboard } from "@/hooks/useClipboard";
import Header from "@/components/Header";
import BrowserWarning from "@/components/BrowserWarning";
import VoiceRecorder from "@/components/VoiceRecorder";
import TranscriptEditor, { Attachment } from "@/components/TranscriptEditor";
import PromptModeSelector from "@/components/PromptModeSelector";
import InterviewModal from "@/components/InterviewModal";
import AboutModal from "@/components/AboutModal";
import FormattedPrompt from "@/components/FormattedPrompt";
import PromptHistory, { HistoryItem } from "@/components/PromptHistory";
import { TooltipIcon } from "@/components/Tooltip";

const HISTORY_STORAGE_KEY = "tellcmg-history";
const SETTINGS_STORAGE_KEY = "tellcmg-settings";

export default function Home() {
  // Speech recognition
  const {
    isListening,
    transcript: speechTranscript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Editable transcript
  const [transcript, setTranscript] = useState("");

  // Prompt settings
  const [modes, setModes] = useState<PromptModeId[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Email identification
  const [email, setEmail] = useState("");

  // Generated prompt
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Interview modal
  const [showInterview, setShowInterview] = useState(false);

  // About modal
  const [showAbout, setShowAbout] = useState(false);

  // Edit mode for output
  const [isEditingOutput, setIsEditingOutput] = useState(false);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Clipboard
  const { copied, copyToClipboard } = useClipboard();

  // AbortController for cancelling generation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  }, [history]);

  // Load saved settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.modes) setModes(settings.modes);
        else if (settings.mode) setModes([settings.mode]); // migrate old single mode
        if (settings.email) setEmail(settings.email);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
        modes,
        email,
      }));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [modes, email]);

  // Sync speech transcript (final results only)
  useEffect(() => {
    if (speechTranscript) {
      setTranscript(speechTranscript);
    }
  }, [speechTranscript]);

  // Live display value: shows interim words immediately while recording
  const displayTranscript = isListening && interimTranscript
    ? (transcript ? transcript + " " : "") + interimTranscript
    : transcript;

  // Browser support check
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);
  useEffect(() => {
    setShowBrowserWarning(!isSupported);
  }, [isSupported]);

  // Add to history
  const addToHistory = useCallback((transcriptText: string, promptText: string, modeIds: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      transcript: transcriptText,
      prompt: promptText,
      mode: modeIds,
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
    setActiveHistoryId(newItem.id);
  }, []);

  // Generate prompt using API
  const handleGenerate = useCallback(async () => {
    if (!transcript.trim() || isGenerating) return;

    if (isListening) {
      stopListening();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    setIsGenerating(true);
    setIsEditingOutput(false);

    try {
      // Prepare attachments for API (just name and content)
      const attachmentData = attachments.map(a => ({
        name: a.name,
        content: a.content,
      }));

      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript.trim(),
          modes,
          email: email.trim() || undefined,
          attachments: attachmentData,
        }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (data.prompt) {
        setGeneratedPrompt(data.prompt);
        addToHistory(transcript.trim(), data.prompt, modes.join(","));
        setToast("Idea structured successfully!");
        setTimeout(() => setToast(null), 3000);
      } else {
        throw new Error("No prompt returned");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setToast("Generation cancelled");
        setTimeout(() => setToast(null), 2000);
      } else {
        console.error("Generation failed:", error);
        setToast("Failed to generate. Please try again.");
        setTimeout(() => setToast(null), 3000);
      }
    }

    abortControllerRef.current = null;
    setIsGenerating(false);
  }, [transcript, modes, email, attachments, isGenerating, isListening, stopListening, addToHistory]);

  // Cancel generation
  const handleCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Handle interview completion
  const handleInterviewComplete = useCallback((enhancedPrompt: string) => {
    setGeneratedPrompt(enhancedPrompt);
    addToHistory(transcript.trim(), enhancedPrompt, modes.join(","));
    setToast("Enhanced idea ready!");
    setTimeout(() => setToast(null), 3000);
  }, [transcript, modes, addToHistory]);

  // Select from history
  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setTranscript(item.transcript);
    setGeneratedPrompt(item.prompt);
    setActiveHistoryId(item.id);
    setModes(item.mode ? item.mode.split(",").filter(Boolean) as PromptModeId[] : []);
    setToast("Loaded from history");
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Delete from history
  const handleHistoryDelete = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
  }, [activeHistoryId]);

  // Clear all history
  const handleHistoryClear = useCallback(() => {
    setHistory([]);
    setActiveHistoryId(null);
  }, []);

  // Copy prompt
  const handleCopy = useCallback(async () => {
    if (generatedPrompt) {
      const success = await copyToClipboard(generatedPrompt);
      if (success) {
        setToast("Copied to clipboard!");
        setTimeout(() => setToast(null), 3000);
      }
    }
  }, [generatedPrompt, copyToClipboard]);

  // Submit idea via email
  const handleSubmit = useCallback(async () => {
    if (!generatedPrompt || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: generatedPrompt,
          categories: modes,
          submitterEmail: email.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSubmitConfirm(true);
      } else {
        throw new Error(data.error || "Submission failed");
      }
    } catch (error) {
      console.error("Submit failed:", error);
      setToast("Failed to submit. Please try again.");
      setTimeout(() => setToast(null), 4000);
    }

    setIsSubmitting(false);
  }, [generatedPrompt, modes, email, isSubmitting]);

  // Clear transcript
  const handleClear = useCallback(() => {
    setTranscript("");
    resetTranscript();
  }, [resetTranscript]);

  // Reset everything
  const handleReset = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    setTranscript("");
    resetTranscript();
    setGeneratedPrompt("");
    setAttachments([]);
    setModes([]);
    setActiveHistoryId(null);
    setIsEditingOutput(false);
    setToast("Ready for a new idea!");
    setTimeout(() => setToast(null), 2000);
  }, [isListening, stopListening, resetTranscript]);


  // Loading slides for generation animation
  const loadingSlides = useMemo(() => [
    {
      icon: "🧠",
      title: "Analyzing Your Idea",
      subtitle: "Understanding the context and identifying key themes...",
    },
    {
      icon: "🏦",
      title: "Applying Mortgage Expertise",
      subtitle: "Connecting your idea to CMG's tools, workflows, and teams...",
    },
    {
      icon: "📐",
      title: "Structuring the Submission",
      subtitle: "Organizing into clear sections with actionable details...",
    },
    {
      icon: "🔍",
      title: "Identifying Stakeholders",
      subtitle: "Mapping affected departments, systems, and decision-makers...",
    },
    {
      icon: "📊",
      title: "Assessing Impact",
      subtitle: "Evaluating benefits for efficiency, borrower experience, and growth...",
    },
    {
      icon: "🚀",
      title: "Finalizing Your Submission",
      subtitle: "Polishing language and adding implementation considerations...",
    },
    {
      icon: "✨",
      title: "Almost There!",
      subtitle: "Putting the finishing touches on your structured idea...",
    },
  ], []);

  const [loadingSlide, setLoadingSlide] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setLoadingSlide(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingSlide((prev) => (prev + 1) % loadingSlides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isGenerating, loadingSlides.length]);

  return (
    <div className="relative z-10 min-h-screen">
      {/* History Sidebar */}
      <PromptHistory
        history={history}
        activeId={activeHistoryId}
        onSelect={handleHistorySelect}
        onDelete={handleHistoryDelete}
        onClear={handleHistoryClear}
        isOpen={historyOpen}
        onToggle={() => setHistoryOpen(!historyOpen)}
      />

      {/* Header */}
      <Header onAboutClick={() => setShowAbout(true)} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-6 sm:pb-8">

        {/* Browser Warning */}
        {showBrowserWarning && <BrowserWarning />}

        {/* Mic Hero Section */}
        <section className="flex flex-col items-center py-1 sm:py-3 mb-3 sm:mb-5">
          <div className="flex items-center gap-6 sm:gap-10">
            <VoiceRecorder
              isListening={isListening}
              isSupported={isSupported}
              interimTranscript={interimTranscript}
              onStart={startListening}
              onStop={stopListening}
            />
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setShowInterview(true)}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer group bg-bg-card hover:bg-bg-elevated border-2 border-accent-purple/40 hover:border-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                aria-label="Start AI interview"
                title="AI-assisted interview — refine your idea through conversation"
              >
                <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent-purple/30 to-accent-purple/20 blur-sm animate-pulse" />
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 relative z-10 text-text-secondary group-hover:text-accent-purple transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <p className="text-xs font-semibold text-text-muted">Interview</p>
            </div>
          </div>
        </section>

        {/* Two-Column: Form Left, Output Right (on demand) */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">

          {/* LEFT COLUMN — Form */}
          <div className={`space-y-3 transition-all duration-300 ${
            (isGenerating || generatedPrompt) ? "w-full lg:w-1/2 lg:flex-shrink-0" : "w-full max-w-2xl mx-auto"
          }`}>

            {/* Email Identification Card */}
            <div className="bg-bg-card rounded-2xl border border-border-subtle p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                  <svg className="w-4 h-4 text-cmg-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Identify Yourself
                </span>
                <TooltipIcon
                  content="Enter your CMG email so your idea is attributed to you. This is saved locally for convenience."
                  position="left"
                />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@cmgfi.com"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-sm placeholder:text-text-muted/60 focus:outline-none focus:border-cmg-blue/50 focus:ring-1 focus:ring-cmg-blue/30 transition-all"
              />
            </div>

            {/* Your Idea Card */}
            <div className="bg-bg-card rounded-2xl border border-border-subtle p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-secondary">Your Idea</span>
                <TooltipIcon
                  content="Type your idea directly, or use the microphone above to speak. Your voice is converted to text in real-time."
                  position="left"
                />
              </div>
              <TranscriptEditor
                value={displayTranscript}
                onChange={setTranscript}
                onClear={handleClear}
                isListening={isListening}
                attachments={attachments}
                onAttachmentsChange={setAttachments}
              />
            </div>

            {/* Structure My Idea Button */}
            <div className="flex gap-2">
              {isGenerating ? (
                <>
                  <div className="flex-1 h-14 rounded-xl bg-gradient-to-r from-cmg-blue to-cmg-deep text-white font-bold text-sm flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Structuring...
                  </div>
                  <button
                    onClick={handleCancelGeneration}
                    className="h-14 px-5 rounded-xl bg-bg-card border-2 border-accent-rose/50 text-accent-rose font-semibold text-sm transition-all hover:bg-accent-rose/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={!transcript.trim()}
                  className={`flex-1 h-14 rounded-xl bg-gradient-to-r from-cmg-blue to-cmg-deep text-white font-bold text-sm transition-all hover:brightness-110 hover:shadow-lg hover:shadow-cmg-blue/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                    transcript.trim() ? "animate-pulse-glow shadow-[0_0_20px_rgba(155,197,61,0.4)]" : ""
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Structure My Idea
                  </span>
                </button>
              )}
            </div>

            {/* Category Card */}
            <div className="bg-bg-card rounded-2xl border border-border-subtle p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text-secondary">Choose Any Categories That Apply</span>
                <TooltipIcon
                  content="Select categories to tag your idea. LOS & Tech for system improvements, Pipeline for workflow, Marketing for CRM/campaigns, Products for new offerings."
                  position="left"
                />
              </div>
              <PromptModeSelector selected={modes} onChange={setModes} />
            </div>
          </div>

          {/* RIGHT COLUMN — Output (only when generating or has content) */}
          {(isGenerating || generatedPrompt) && (
            <div className="hidden lg:block w-1/2 flex-shrink-0 animate-fade_in sticky top-4">
            <div className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[calc(100vh-100px)]">
              <div className="flex-shrink-0 px-5 py-4 border-b border-border-subtle bg-gradient-to-r from-cmg-blue/10 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cmg-blue to-cmg-deep flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-text-primary">Structured Idea</h2>
                      <p className="text-xs text-text-muted">Powered by AI</p>
                    </div>
                  </div>
                  {generatedPrompt && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSubmitting
                            ? "bg-accent-blue/50 text-white cursor-wait"
                            : "bg-accent-blue text-white hover:brightness-110 shadow-md shadow-accent-blue/30 animate-pulse-glow-blue"
                        }`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Submit
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setIsEditingOutput(!isEditingOutput)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isEditingOutput
                            ? "bg-accent-purple text-white"
                            : "bg-bg-elevated text-text-secondary hover:text-accent-purple"
                        }`}
                      >
                        {isEditingOutput ? "View" : "Edit"}
                      </button>
                      <button
                        onClick={handleCopy}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          copied
                            ? "bg-accent-green text-white"
                            : "bg-bg-elevated text-text-secondary hover:text-cmg-blue"
                        }`}
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-3 py-1.5 rounded-lg bg-bg-elevated text-text-secondary hover:text-accent-rose text-xs font-semibold transition-all"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                    {/* Spinner */}
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-cmg-blue/10" />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cmg-blue animate-spin" />
                      <span className="absolute inset-0 flex items-center justify-center text-3xl">
                        {loadingSlides[loadingSlide].icon}
                      </span>
                    </div>

                    {/* Slide text */}
                    <div key={loadingSlide} className="text-center animate-fade_in">
                      <p className="text-base font-bold text-text-primary mb-1">
                        {loadingSlides[loadingSlide].title}
                      </p>
                      <p className="text-sm text-text-secondary max-w-xs">
                        {loadingSlides[loadingSlide].subtitle}
                      </p>
                    </div>

                    {/* Progress dots */}
                    <div className="flex gap-2 mt-6">
                      {loadingSlides.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            idx === loadingSlide
                              ? "w-6 bg-cmg-blue"
                              : idx < loadingSlide
                                ? "w-1.5 bg-cmg-blue/40"
                                : "w-1.5 bg-border-subtle"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : generatedPrompt ? (
                  <div className="relative">
                    {isEditingOutput ? (
                      <textarea
                        value={generatedPrompt}
                        onChange={(e) => setGeneratedPrompt(e.target.value)}
                        className="w-full min-h-[300px] p-4 rounded-xl bg-bg-elevated border-2 border-accent-purple/30 text-text-primary font-mono text-sm resize-none focus:outline-none focus:border-accent-purple/50 transition-colors"
                        placeholder="Edit your submission..."
                      />
                    ) : (
                      <FormattedPrompt content={generatedPrompt} />
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            </div>
          )}

          {/* Mobile Output — below form on small screens */}
          {(isGenerating || generatedPrompt) && (
            <div className="lg:hidden w-full bg-bg-card rounded-2xl border border-border-subtle overflow-hidden animate-fade_in">
              <div className="flex-shrink-0 px-4 py-3 border-b border-border-subtle bg-gradient-to-r from-cmg-blue/10 to-transparent">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cmg-blue to-cmg-deep flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-text-primary leading-tight">Structured Idea</h2>
                      <p className="text-[10px] text-text-muted">Powered by AI</p>
                    </div>
                  </div>
                  {generatedPrompt && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={handleSubmit} disabled={isSubmitting} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${isSubmitting ? "bg-accent-blue/50 text-white cursor-wait" : "bg-accent-blue text-white hover:brightness-110 animate-pulse-glow-blue"}`}>
                        {isSubmitting ? "..." : "Submit"}
                      </button>
                      <button onClick={handleCopy} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${copied ? "bg-accent-green text-white" : "bg-bg-elevated text-text-secondary"}`}>
                        {copied ? "✓" : "Copy"}
                      </button>
                      <button onClick={handleReset} className="px-3 py-2 rounded-lg bg-bg-elevated text-text-secondary hover:text-accent-rose text-xs font-semibold transition-all min-h-[36px]">
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-cmg-blue/10" />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cmg-blue animate-spin" />
                      <span className="absolute inset-0 flex items-center justify-center text-2xl">{loadingSlides[loadingSlide].icon}</span>
                    </div>
                    <div key={loadingSlide} className="text-center animate-fade_in px-2">
                      <p className="text-sm font-bold text-text-primary mb-1">{loadingSlides[loadingSlide].title}</p>
                      <p className="text-xs text-text-secondary">{loadingSlides[loadingSlide].subtitle}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {loadingSlides.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === loadingSlide ? "w-6 bg-cmg-blue" : idx < loadingSlide ? "w-1.5 bg-cmg-blue/40" : "w-1.5 bg-border-subtle"}`} />
                      ))}
                    </div>
                  </div>
                ) : generatedPrompt ? (
                  <FormattedPrompt content={generatedPrompt} />
                ) : null}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Interview Modal */}
      <InterviewModal
        isOpen={showInterview}
        onClose={() => setShowInterview(false)}
        onComplete={handleInterviewComplete}
        initialTranscript={transcript}
        mode={modes.join(",")}
        existingPrompt={generatedPrompt}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSubmitConfirm(false)}
          />
          <div className="relative bg-bg-card border border-border-cmg rounded-2xl shadow-2xl shadow-cmg-blue/20 max-w-md w-full animate-fade_in overflow-hidden">
            {/* Green accent bar */}
            <div className="h-1 bg-gradient-to-r from-cmg-blue to-cmg-deep" />

            <div className="p-6 sm:p-8 text-center">
              {/* Success icon */}
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-cmg-blue/15 flex items-center justify-center">
                <svg className="w-8 h-8 text-cmg-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-text-primary mb-2">
                Idea Submitted!
              </h2>
              <p className="text-sm text-text-secondary mb-1">
                Your idea has been sent successfully.
              </p>
              <p className="text-xs text-text-muted mb-6">
                Thank you for helping shape the future of CMG Financial.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary font-semibold text-sm hover:text-text-primary hover:border-text-muted/30 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    handleReset();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cmg-blue to-cmg-deep text-white font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-cmg-blue/20"
                >
                  Start New Idea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-fade_in">
          <div className="bg-bg-card border border-cmg-blue/30 text-text-primary px-5 py-3 rounded-xl shadow-xl shadow-cmg-blue/10 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-cmg-blue rounded-full" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
