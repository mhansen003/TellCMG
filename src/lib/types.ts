// Prompt Mode Types — Mortgage / Loan Officer Categories
export type PromptModeId =
  // LOS & Tech modes
  | "los-enhancement"
  | "automation"
  | "macro-script"
  | "integration"
  | "dashboard"
  | "ui-ux"
  | "doc-mgmt"
  | "mobile"
  | "ai-feature"
  | "data-quality"
  | "security"
  | "api-webhook"
  // Pipeline & Ops modes
  | "pipeline-view"
  | "workflow"
  | "bottleneck"
  | "milestone"
  | "task-mgmt"
  | "handoff"
  | "qc-audit"
  | "closing"
  | "rate-lock"
  | "conditions"
  | "exceptions"
  | "sla"
  // Marketing & CRM modes
  | "lead-gen"
  | "crm-feature"
  | "email-campaign"
  | "social-media"
  | "borrower-portal"
  | "referral"
  | "brand-content"
  | "co-marketing"
  | "reviews"
  | "pre-approval"
  | "listing-alerts"
  | "retention"
  // Products & Growth modes
  | "new-product"
  | "pricing"
  | "guidelines"
  | "compliance"
  | "training"
  | "onboarding"
  | "vendor"
  | "cost-savings"
  | "revenue"
  | "risk"
  | "investor"
  | "policy";

export type DetailLevelId = "concise" | "balanced" | "comprehensive";

export type OutputFormatId = "structured" | "conversational" | "bullet-points";

export interface PromptModeOption {
  id: PromptModeId;
  label: string;
  description: string;
  icon: string;
  color: string;
  category: "los-tech" | "pipeline-ops" | "marketing-crm" | "products-growth";
}

export interface DetailLevelOption {
  id: DetailLevelId;
  label: string;
  icon: string;
}

export interface OutputFormatOption {
  id: OutputFormatId;
  label: string;
  description: string;
}

// Modifier checkboxes
export interface PromptModifier {
  id: string;
  label: string;
  description: string;
  promptAddition: string;
}

export interface PromptGenerationRequest {
  transcript: string;
  modes: PromptModeId[];
  detailLevel: DetailLevelId;
  outputFormat: OutputFormatId;
  modifiers: string[];
  contextInfo: string;
}
