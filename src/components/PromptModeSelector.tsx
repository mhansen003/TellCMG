"use client";

import { PromptModeId } from "@/lib/types";
import { PROMPT_MODE_OPTIONS } from "@/lib/constants";

interface PromptModeSelectorProps {
  selected: PromptModeId[];
  onChange: (modes: PromptModeId[]) => void;
}

// Top 20 most common categories across all groups
const TOP_MODE_IDS: PromptModeId[] = [
  // LOS & Tech
  "los-enhancement",
  "automation",
  "integration",
  "dashboard",
  "ui-ux",
  "ai-feature",
  // Pipeline & Ops
  "workflow",
  "bottleneck",
  "task-mgmt",
  "closing",
  "conditions",
  // Marketing & CRM
  "lead-gen",
  "crm-feature",
  "borrower-portal",
  "email-campaign",
  "retention",
  // Products & Growth
  "new-product",
  "training",
  "compliance",
  "cost-savings",
];

const TOP_MODES = TOP_MODE_IDS
  .map(id => PROMPT_MODE_OPTIONS.find(m => m.id === id))
  .filter(Boolean);

export default function PromptModeSelector({
  selected,
  onChange,
}: PromptModeSelectorProps) {

  const handleToggle = (modeId: PromptModeId) => {
    if (selected.includes(modeId)) {
      onChange(selected.filter(id => id !== modeId));
    } else {
      onChange([...selected, modeId]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const hasSelections = selected.length > 0;

  return (
    <div>
      {hasSelections && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">
            {selected.length} selected
          </span>
          <button
            onClick={handleClearAll}
            className="px-2 py-0.5 rounded-full bg-accent-rose/15 text-accent-rose text-[10px] font-bold hover:bg-accent-rose/25 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
        {TOP_MODES.map((mode) => {
          if (!mode) return null;
          const isSelected = selected.includes(mode.id);
          return (
            <button
              key={mode.id}
              onClick={() => handleToggle(mode.id)}
              className={`
                relative px-2 py-2 rounded-lg text-left transition-all duration-200
                border cursor-pointer group min-w-0
                ${
                  isSelected
                    ? "bg-cmg-glow border-cmg-blue text-text-primary"
                    : "bg-bg-card border-border-subtle hover:border-cmg-blue/30 text-text-secondary hover:text-text-primary"
                }
              `}
              title={mode.description}
            >
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-sm flex-shrink-0">{mode.icon}</span>
                <span className={`text-xs font-semibold truncate ${isSelected ? "text-cmg-blue" : ""}`}>
                  {mode.label}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cmg-blue" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
