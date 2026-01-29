"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PromptModeId, DetailLevelId, OutputFormatId } from "@/lib/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useClipboard } from "@/hooks/useClipboard";
import Header from "@/components/Header";
import BrowserWarning from "@/components/BrowserWarning";
import VoiceRecorder from "@/components/VoiceRecorder";
import TranscriptEditor, { Attachment } from "@/components/TranscriptEditor";
import PromptModeSelector from "@/components/PromptModeSelector";
import ModifierCheckboxes from "@/components/ModifierCheckboxes";
import DetailLevelSelector from "@/components/DetailLevelSelector";
import OutputFormatSelector from "@/components/OutputFormatSelector";
import ContextInput from "@/components/ContextInput";
import UrlInput, { UrlReference } from "@/components/UrlInput";
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
  const [detailLevel, setDetailLevel] = useState<DetailLevelId>("balanced");
  const [outputFormat, setOutputFormat] = useState<OutputFormatId>("structured");
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [contextInfo, setContextInfo] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [urlReferences, setUrlReferences] = useState<UrlReference[]>([]);

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

  // Options collapse
  const [optionsExpanded, setOptionsExpanded] = useState(false);

  // Edit mode for output
  const [isEditingOutput, setIsEditingOutput] = useState(false);

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
        if (settings.detailLevel) setDetailLevel(settings.detailLevel);
        if (settings.outputFormat) setOutputFormat(settings.outputFormat);
        if (settings.modifiers) setModifiers(settings.modifiers);
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
        detailLevel,
        outputFormat,
        modifiers,
      }));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [modes, detailLevel, outputFormat, modifiers]);

  // Sync speech transcript
  useEffect(() => {
    if (speechTranscript) {
      setTranscript(speechTranscript);
    }
  }, [speechTranscript]);

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

      // Prepare URL references for API
      const urlData = urlReferences.map(r => ({
        title: r.title,
        content: r.content,
        type: r.type,
        url: r.url,
      }));

      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript.trim(),
          modes,
          detailLevel,
          outputFormat,
          modifiers,
          contextInfo,
          attachments: attachmentData,
          urlReferences: urlData,
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
  }, [transcript, modes, detailLevel, outputFormat, modifiers, contextInfo, attachments, urlReferences, isGenerating, isListening, stopListening, addToHistory]);

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
    setModifiers([]);
    setContextInfo("");
    setAttachments([]);
    setUrlReferences([]);
    setModes([]);
    setDetailLevel("balanced");
    setOutputFormat("structured");
    setActiveHistoryId(null);
    setIsEditingOutput(false);
    setToast("Ready for a new idea!");
    setTimeout(() => setToast(null), 2000);
  }, [isListening, stopListening, resetTranscript]);

  // Step progress logic
  const steps = [
    { step: 1, label: "Describe", done: transcript.trim().length > 0 },
    { step: 2, label: "Categorize", done: transcript.trim().length > 0 && modes.length > 0 },
    { step: 3, label: "Customize", done: optionsExpanded || detailLevel !== "balanced" || outputFormat !== "structured" || contextInfo.trim().length > 0 },
    { step: 4, label: "Structure", done: generatedPrompt.length > 0 },
  ];

  const isStepActive = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return !!transcript.trim();
    if (step === 3) return modes.length > 0;
    if (step === 4) return !!transcript.trim();
    return false;
  };

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

            {/* Content with Left Rail + Two-Column Grid */}
            <div className="flex gap-4 sm:gap-6 items-start">

            {/* Vertical Progress Rail */}
            <aside className="hidden lg:flex flex-col items-center gap-0 sticky top-24 self-start pt-1 pr-2">
              {steps.map((item, idx) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      item.done
                        ? "bg-accent-green text-white"
                        : isStepActive(item.step)
                          ? "bg-gradient-to-br from-cmg-blue to-cmg-deep text-white"
                          : "bg-bg-elevated text-text-muted border border-border-subtle"
                    }`}
                  >
                    {item.done ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      item.step
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                    item.done ? "text-accent-green" : isStepActive(item.step) ? "text-cmg-blue" : "text-text-muted"
                  }`}>
                    {item.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <div className={`w-0.5 h-8 my-1 rounded-full transition-colors ${
                      item.done ? "bg-accent-green" : "bg-border-subtle"
                    }`} />
                  )}
                </div>
              ))}
            </aside>

            {/* Two-Column Grid */}
            <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">

              {/* LEFT COLUMN */}
              <div className="space-y-3">

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
                    value={transcript}
                    onChange={setTranscript}
                    onClear={handleClear}
                    isListening={isListening}
                    attachments={attachments}
                    onAttachmentsChange={setAttachments}
                  />
                </div>

                {/* Mobile Action Buttons */}
                <div className="lg:hidden space-y-2">
                  <span className="text-sm font-semibold text-text-secondary">Structure Your Idea</span>
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
                          className="h-14 px-4 rounded-xl bg-bg-card border-2 border-accent-rose/50 text-accent-rose font-semibold text-sm transition-all hover:bg-accent-rose/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleGenerate}
                          disabled={!transcript.trim()}
                          className={`flex-1 h-14 rounded-xl bg-gradient-to-r from-cmg-blue to-cmg-deep text-white font-bold text-sm transition-all hover:brightness-110 hover:shadow-lg hover:shadow-cmg-blue/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                            transcript.trim() ? "animate-pulse-glow shadow-[0_0_20px_rgba(37,99,235,0.4)]" : ""
                          }`}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Structure My Idea
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Category + Modifiers Card */}
                <div className="bg-bg-card rounded-2xl border border-border-subtle p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-secondary">Choose Category & Modifiers</span>
                    <TooltipIcon
                      content="Select categories to tag your idea. LOS & Tech for system improvements, Pipeline for workflow, Marketing for CRM/campaigns, Products for new offerings."
                      position="left"
                    />
                  </div>
                  <PromptModeSelector selected={modes} onChange={setModes} />
                  <div className="border-t border-border-subtle pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-muted">+ Add Modifiers</span>
                      <TooltipIcon
                        content="Add specific analysis to your idea submission. Check options to include ROI estimates, compliance considerations, affected teams, and more."
                        position="left"
                      />
                    </div>
                    <ModifierCheckboxes selected={modifiers} onChange={setModifiers} />
                  </div>
                </div>

                {/* Customize Output Card */}
                <div className="bg-bg-card rounded-2xl border border-border-subtle p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setOptionsExpanded(!optionsExpanded)}
                      className="flex-1 flex items-center justify-between py-1 group"
                    >
                      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2 cursor-pointer">
                        Customize Output
                        {(detailLevel !== "balanced" || outputFormat !== "structured") && (
                          <span className="px-2 py-0.5 rounded-full bg-accent-teal/20 text-accent-teal text-xs font-semibold">
                            Custom
                          </span>
                        )}
                      </label>
                      <svg
                        className={`w-5 h-5 text-text-muted transition-transform duration-200 ${optionsExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="ml-2">
                      <TooltipIcon
                        content="Customize how your idea submission is structured. Choose detail level, output format, and add extra context about your role or team."
                        position="left"
                      />
                    </div>
                  </div>

                  {!optionsExpanded && (
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-text-muted">
                      <span className="px-2 py-1 rounded bg-bg-elevated/50">{detailLevel === "comprehensive" ? "Detailed" : detailLevel === "concise" ? "Concise" : "Balanced"}</span>
                      <span className="px-2 py-1 rounded bg-bg-elevated/50">{outputFormat === "bullet-points" ? "Bullets" : outputFormat === "conversational" ? "Natural" : "Structured"}</span>
                    </div>
                  )}

                  {optionsExpanded && (
                    <div className="space-y-4 mt-3 pt-3 border-t border-border-subtle animate-fade_in">
                      <div className="space-y-3">
                        <DetailLevelSelector selected={detailLevel} onChange={setDetailLevel} />
                        <OutputFormatSelector selected={outputFormat} onChange={setOutputFormat} />
                      </div>
                      <div className="border-t border-border-subtle pt-3">
                        <ContextInput value={contextInfo} onChange={setContextInfo} />
                      </div>
                      <div className="border-t border-border-subtle pt-3">
                        <UrlInput references={urlReferences} onReferencesChange={setUrlReferences} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="flex flex-col gap-3">
                {/* Desktop Action Buttons */}
                <div className="hidden lg:block flex-shrink-0 space-y-2">
                  <span className="text-sm font-semibold text-text-secondary">Structure Your Idea</span>
                </div>
                <div className="hidden lg:flex gap-2 flex-shrink-0">
                  {isGenerating ? (
                    <>
                      <div className="flex-1 h-14 sm:h-12 rounded-xl bg-gradient-to-r from-cmg-blue to-cmg-deep text-white font-bold text-sm flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Structuring...
                      </div>
                      <button
                        onClick={handleCancelGeneration}
                        className="h-14 sm:h-12 px-5 rounded-xl bg-bg-card border-2 border-accent-rose/50 text-accent-rose font-semibold text-sm transition-all hover:bg-accent-rose/10 hover:border-accent-rose active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        title="Cancel generation"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleGenerate}
                        disabled={!transcript.trim()}
                        className={`flex-1 h-14 sm:h-12 rounded-xl bg-gradient-to-r from-cmg-blue to-cmg-deep text-white font-bold text-sm transition-all hover:brightness-110 hover:shadow-lg hover:shadow-cmg-blue/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none cursor-pointer ${
                          transcript.trim() ? "animate-pulse-glow shadow-[0_0_20px_rgba(37,99,235,0.4)]" : ""
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Structure My Idea
                        </span>
                      </button>
                    </>
                  )}
                </div>

                {/* Output Panel */}
                <div className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden flex flex-col h-[500px] lg:h-[calc(100vh-280px)] lg:max-h-[700px] lg:min-h-[400px]">
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
                      <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                        <div className="relative w-16 h-16 mb-4">
                          <div className="absolute inset-0 rounded-full border-4 border-cmg-blue/20" />
                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cmg-blue animate-spin" />
                        </div>
                        <p className="text-sm font-medium">AI is structuring your idea...</p>
                      </div>
                    ) : generatedPrompt ? (
                      <div className="relative h-full">
                        {isEditingOutput ? (
                          <textarea
                            value={generatedPrompt}
                            onChange={(e) => setGeneratedPrompt(e.target.value)}
                            className="w-full h-full min-h-[300px] p-4 rounded-xl bg-bg-elevated border-2 border-accent-purple/30 text-text-primary font-mono text-sm resize-none focus:outline-none focus:border-accent-purple/50 transition-colors"
                            placeholder="Edit your submission..."
                          />
                        ) : (
                          <FormattedPrompt content={generatedPrompt} />
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-text-muted py-8">
                        <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium mb-1">Your structured idea will appear here</p>
                        <p className="text-xs mb-6">Speak or type your idea, then click Structure</p>

                        <div className="w-full max-w-xs border-t border-border-subtle pt-4">
                          <h3 className="text-xs font-semibold text-text-muted mb-3 flex items-center justify-center gap-1.5">
                            <span className="text-cmg-blue">🚀</span> Quick Start Guide
                          </h3>
                          <ul className="text-xs text-text-muted space-y-2 text-left">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cmg-blue/20 text-cmg-blue text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                              <span><strong>Describe</strong> your idea using voice or text</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cmg-blue/20 text-cmg-blue text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                              <span><strong>Choose</strong> a category that matches your idea</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cmg-blue/20 text-cmg-blue text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                              <span><strong>Customize</strong> options for more control</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cmg-blue/20 text-cmg-blue text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
                              <span><strong>Structure</strong> and share your idea</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
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
