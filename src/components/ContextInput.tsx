"use client";

import { TooltipIcon } from "@/components/Tooltip";

interface ContextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ContextInput({ value, onChange }: ContextInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
          Additional Context
          <span className="text-xs text-text-muted font-normal">(optional)</span>
        </label>
        <TooltipIcon
          content="Add extra context like your role, branch, team, or specific constraints that should be considered."
          position="left"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Retail lending, branch operations, compliance team..."
        className="w-full px-4 py-3 rounded-xl bg-bg-card border-2 border-border-subtle focus:border-cmg-blue/50 text-text-primary placeholder:text-text-muted text-sm focus:outline-none transition-all"
      />
    </div>
  );
}
