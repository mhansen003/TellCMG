import { PromptModeOption, DetailLevelOption, OutputFormatOption, PromptModifier } from "./types";

export const PROMPT_MODE_OPTIONS: PromptModeOption[] = [
  // ── LOS & Tech ─────────────────────────────
  { id: "los-enhancement", label: "LOS Enhancement", description: "Improvements to the loan origination system", icon: "🏦", color: "bg-cmg-blue", category: "los-tech" },
  { id: "automation", label: "Automation", description: "Automate manual tasks and repetitive processes", icon: "⚙️", color: "bg-cmg-blue", category: "los-tech" },
  { id: "macro-script", label: "Macro / Script", description: "Custom macros, scripts, and shortcuts", icon: "📜", color: "bg-cmg-blue", category: "los-tech" },
  { id: "integration", label: "Integration", description: "Connect systems, tools, and data sources", icon: "🔗", color: "bg-cmg-blue", category: "los-tech" },
  { id: "dashboard", label: "Dashboard", description: "New reports, dashboards, and analytics", icon: "📊", color: "bg-cmg-blue", category: "los-tech" },
  { id: "ui-ux", label: "UI / UX Fix", description: "Interface and usability improvements", icon: "🎨", color: "bg-cmg-blue", category: "los-tech" },
  { id: "doc-mgmt", label: "Doc Management", description: "Document handling, e-sign, and storage", icon: "📁", color: "bg-cmg-blue", category: "los-tech" },
  { id: "mobile", label: "Mobile App", description: "Mobile features for on-the-go origination", icon: "📱", color: "bg-cmg-blue", category: "los-tech" },
  { id: "ai-feature", label: "AI Feature", description: "AI-powered tools for underwriting, pricing, or analysis", icon: "🤖", color: "bg-cmg-blue", category: "los-tech" },
  { id: "data-quality", label: "Data Quality", description: "Data accuracy, validation, and deduplication", icon: "✅", color: "bg-cmg-blue", category: "los-tech" },
  { id: "security", label: "Security", description: "Security, permissions, and access control", icon: "🔒", color: "bg-cmg-blue", category: "los-tech" },
  { id: "api-webhook", label: "API / Webhook", description: "System connectivity and real-time notifications", icon: "🔌", color: "bg-cmg-blue", category: "los-tech" },

  // ── Pipeline & Ops ─────────────────────────
  { id: "pipeline-view", label: "Pipeline View", description: "Pipeline visualization and filtering", icon: "📈", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "workflow", label: "Workflow", description: "Streamline loan workflows and processes", icon: "🔄", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "bottleneck", label: "Bottleneck Fix", description: "Identify and fix processing delays", icon: "🚧", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "milestone", label: "Milestones", description: "Loan milestone and status tracking", icon: "🏁", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "task-mgmt", label: "Task Mgmt", description: "Task assignment, reminders, and follow-ups", icon: "✏️", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "handoff", label: "Handoff", description: "Team-to-team handoff improvements", icon: "🤝", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "qc-audit", label: "QC / Audit", description: "Quality control and audit improvements", icon: "🔍", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "closing", label: "Closing", description: "Closing and funding improvements", icon: "🏠", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "rate-lock", label: "Rate Lock", description: "Rate lock workflow and alerts", icon: "🔐", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "conditions", label: "Conditions", description: "Condition tracking and clearing workflow", icon: "📋", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "exceptions", label: "Exceptions", description: "Exception handling and escalation", icon: "⚠️", color: "bg-accent-teal", category: "pipeline-ops" },
  { id: "sla", label: "SLA / Turn Time", description: "Turn time targets and monitoring", icon: "⏱️", color: "bg-accent-teal", category: "pipeline-ops" },

  // ── Marketing & CRM ────────────────────────
  { id: "lead-gen", label: "Lead Gen", description: "Lead generation and capture ideas", icon: "🎯", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "crm-feature", label: "CRM Feature", description: "CRM functionality and improvements", icon: "👥", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "email-campaign", label: "Email Campaign", description: "Email marketing and drip campaigns", icon: "✉️", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "social-media", label: "Social Media", description: "Social media content and strategy", icon: "📣", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "borrower-portal", label: "Borrower Portal", description: "Borrower-facing portal and self-service", icon: "🌐", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "referral", label: "Referrals", description: "Referral and partner programs", icon: "🤝", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "brand-content", label: "Brand / Content", description: "Branding, content, and collateral", icon: "🎨", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "co-marketing", label: "Co-Marketing", description: "Realtor and partner co-marketing", icon: "🏡", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "reviews", label: "Reviews", description: "Reviews, ratings, and testimonials", icon: "⭐", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "pre-approval", label: "Pre-Approval", description: "Pre-approval and pre-qual tools", icon: "📝", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "listing-alerts", label: "Listing Alerts", description: "Property listing and market alerts", icon: "🏘️", color: "bg-cmg-gold", category: "marketing-crm" },
  { id: "retention", label: "Retention", description: "Post-close nurture and retention", icon: "💎", color: "bg-cmg-gold", category: "marketing-crm" },

  // ── Products & Growth ──────────────────────
  { id: "new-product", label: "New Product", description: "New loan product or program ideas", icon: "🆕", color: "bg-accent-purple", category: "products-growth" },
  { id: "pricing", label: "Pricing", description: "Pricing engine and compensation ideas", icon: "💲", color: "bg-accent-purple", category: "products-growth" },
  { id: "guidelines", label: "Guidelines", description: "Underwriting guideline improvements", icon: "📏", color: "bg-accent-purple", category: "products-growth" },
  { id: "compliance", label: "Compliance", description: "Regulatory compliance improvements", icon: "⚖️", color: "bg-accent-purple", category: "products-growth" },
  { id: "training", label: "Training", description: "Training and education ideas", icon: "🎓", color: "bg-accent-purple", category: "products-growth" },
  { id: "onboarding", label: "Onboarding", description: "New hire onboarding improvements", icon: "👋", color: "bg-accent-purple", category: "products-growth" },
  { id: "vendor", label: "Vendor", description: "Vendor and third-party partnerships", icon: "🤝", color: "bg-accent-purple", category: "products-growth" },
  { id: "cost-savings", label: "Cost Savings", description: "Cost reduction and efficiency ideas", icon: "💰", color: "bg-accent-purple", category: "products-growth" },
  { id: "revenue", label: "Revenue", description: "Revenue growth opportunities", icon: "📈", color: "bg-accent-purple", category: "products-growth" },
  { id: "risk", label: "Risk Mgmt", description: "Risk management and fraud prevention", icon: "🛡️", color: "bg-accent-purple", category: "products-growth" },
  { id: "investor", label: "Investor", description: "Secondary market and investor ideas", icon: "🏛️", color: "bg-accent-purple", category: "products-growth" },
  { id: "policy", label: "Policy", description: "Internal policy and procedure updates", icon: "📖", color: "bg-accent-purple", category: "products-growth" },
];

// Detail levels
export const DETAIL_LEVEL_OPTIONS: DetailLevelOption[] = [
  { id: "concise", label: "Brief", icon: "⚡" },
  { id: "balanced", label: "Balanced", icon: "⚖️" },
  { id: "comprehensive", label: "Detailed", icon: "📖" },
];

// Output formats
export const OUTPUT_FORMAT_OPTIONS: OutputFormatOption[] = [
  { id: "structured", label: "Structured", description: "Organized sections with headers" },
  { id: "conversational", label: "Narrative", description: "Natural flowing description" },
  { id: "bullet-points", label: "Bullet Points", description: "Easy-to-scan list format" },
];

// Modifiers — mortgage context
export const PROMPT_MODIFIERS: PromptModifier[] = [
  // General
  { id: "step-by-step", label: "Step-by-Step", description: "Break the idea into sequenced steps", promptAddition: "Break this into numbered implementation steps." },
  { id: "examples", label: "Examples", description: "Include practical examples", promptAddition: "Include real-world examples to illustrate key points." },
  { id: "alternatives", label: "Alternatives", description: "Present 2-3 alternative approaches", promptAddition: "Present 2-3 alternative approaches with trade-offs." },
  { id: "best-practices", label: "Best Practices", description: "Highlight industry best practices", promptAddition: "Highlight mortgage industry best practices." },
  { id: "explain-reasoning", label: "Reasoning", description: "Explain the 'why' behind the idea", promptAddition: "Explain the reasoning behind each recommendation." },
  // Mortgage-specific
  { id: "roi-impact", label: "ROI Impact", description: "Estimate return on investment", promptAddition: "Include estimated ROI and business impact analysis." },
  { id: "borrower-impact", label: "Borrower Impact", description: "How this affects borrowers", promptAddition: "Describe how this impacts the borrower experience." },
  { id: "compliance-check", label: "Compliance", description: "Regulatory considerations", promptAddition: "Include regulatory and compliance considerations." },
  { id: "affected-teams", label: "Affected Teams", description: "Which teams are impacted", promptAddition: "Identify all teams and departments affected." },
  { id: "implementation-effort", label: "Effort Estimate", description: "Estimate complexity and effort", promptAddition: "Estimate implementation effort (low/medium/high) with rationale." },
  { id: "timeline", label: "Timeline", description: "Implementation timeline", promptAddition: "Include a rough implementation timeline." },
  { id: "risk-assessment", label: "Risks", description: "Identify potential risks", promptAddition: "Identify potential risks and mitigation strategies." },
  { id: "metrics", label: "Success Metrics", description: "Define KPIs and success criteria", promptAddition: "Define clear success metrics and KPIs." },
  { id: "stakeholders", label: "Stakeholders", description: "Consider all stakeholders", promptAddition: "Consider all stakeholders and their perspectives." },
];

// Fallback prompt builder (used when API key not set)
export function buildPrompt(
  transcript: string,
  modes: string[],
  detailLevel: string,
  outputFormat: string,
  modifiers: string[],
  contextInfo: string
): string {
  const modeOptions = modes.map(m => PROMPT_MODE_OPTIONS.find(opt => opt.id === m)).filter(Boolean);
  const modifierAdditions = modifiers
    .map(id => PROMPT_MODIFIERS.find(m => m.id === id)?.promptAddition)
    .filter(Boolean)
    .join(" ");

  let prompt = "";

  if (modeOptions.length > 0) {
    const modeInstructions: Record<string, string> = {
      // LOS & Tech
      "los-enhancement": "I have an idea to improve our Loan Origination System.",
      "automation": "I have an idea to automate a manual task or repetitive process.",
      "macro-script": "I have an idea for a custom macro, script, or shortcut to speed up our workflow.",
      "integration": "I have an idea to better connect our systems, tools, or data sources.",
      "dashboard": "I have an idea for a new report, dashboard, or analytics view.",
      "ui-ux": "I have an idea to improve the user interface or experience of one of our tools.",
      "doc-mgmt": "I have an idea to improve how we handle, store, or process documents.",
      "mobile": "I have an idea for a mobile feature to support on-the-go origination.",
      "ai-feature": "I have an idea for using AI to improve underwriting, pricing, or analysis.",
      "data-quality": "I have an idea to improve data accuracy, validation, or deduplication.",
      "security": "I have an idea to improve security, permissions, or access controls.",
      "api-webhook": "I have an idea for better system connectivity or real-time notifications.",
      // Pipeline & Ops
      "pipeline-view": "I have an idea to improve pipeline visualization or filtering.",
      "workflow": "I have an idea to streamline a loan workflow or process.",
      "bottleneck": "I've identified a processing bottleneck or delay that needs fixing.",
      "milestone": "I have an idea to improve loan milestone or status tracking.",
      "task-mgmt": "I have an idea to improve task assignment, reminders, or follow-ups.",
      "handoff": "I have an idea to improve team-to-team handoffs.",
      "qc-audit": "I have an idea to improve our quality control or audit process.",
      "closing": "I have an idea to improve the closing and funding process.",
      "rate-lock": "I have an idea to improve the rate lock workflow or alerts.",
      "conditions": "I have an idea to improve condition tracking and clearing.",
      "exceptions": "I have an idea to improve how we handle exceptions and escalations.",
      "sla": "I have an idea to improve turn times and SLA monitoring.",
      // Marketing & CRM
      "lead-gen": "I have an idea for generating or capturing more leads.",
      "crm-feature": "I have an idea to improve our CRM system functionality.",
      "email-campaign": "I have an idea for an email marketing campaign or drip sequence.",
      "social-media": "I have an idea for social media content or strategy.",
      "borrower-portal": "I have an idea to improve the borrower-facing portal or self-service tools.",
      "referral": "I have an idea for our referral or partner program.",
      "brand-content": "I have an idea for branding, content, or marketing collateral.",
      "co-marketing": "I have an idea for realtor or partner co-marketing.",
      "reviews": "I have an idea to improve how we collect or showcase reviews.",
      "pre-approval": "I have an idea to improve the pre-approval or pre-qual experience.",
      "listing-alerts": "I have an idea for property listing or market alerts for clients.",
      "retention": "I have an idea to improve post-close borrower nurture and retention.",
      // Products & Growth
      "new-product": "I have an idea for a new loan product or program.",
      "pricing": "I have an idea about pricing engine or compensation improvements.",
      "guidelines": "I have an idea to improve or simplify underwriting guidelines.",
      "compliance": "I have an idea to improve our regulatory compliance processes.",
      "training": "I have an idea for training, education, or professional development.",
      "onboarding": "I have an idea to improve new hire or partner onboarding.",
      "vendor": "I have an idea about vendor partnerships or third-party integrations.",
      "cost-savings": "I have an idea to reduce costs or improve efficiency.",
      "revenue": "I have an idea for growing revenue or expanding our business.",
      "risk": "I have an idea to improve risk management or fraud prevention.",
      "investor": "I have an idea about secondary market or investor relationships.",
      "policy": "I have an idea to update or improve an internal policy or procedure.",
    };
    const instructions = modes.map(m => modeInstructions[m]).filter(Boolean).join("\n");
    prompt += `## Idea Category\n${instructions}\n\n`;
  }

  prompt += `## Idea Description\n${transcript}\n\n`;

  if (contextInfo.trim()) {
    prompt += `## Additional Context\n${contextInfo}\n\n`;
  }

  const detailInstructions: Record<string, string> = {
    concise: "Keep the description brief and focused on the key points.",
    balanced: "Provide a balanced level of detail — enough to understand and evaluate.",
    comprehensive: "Provide a thorough description covering all aspects, edge cases, and implications.",
  };
  prompt += `## Detail Level\n${detailInstructions[detailLevel] || detailInstructions.balanced}\n\n`;

  const formatInstructions: Record<string, string> = {
    structured: "Organize with clear sections and headers.",
    conversational: "Write in a natural, narrative tone.",
    "bullet-points": "Format as organized bullet points for easy scanning.",
  };
  prompt += `## Format\n${formatInstructions[outputFormat] || formatInstructions.structured}\n\n`;

  if (modifierAdditions) {
    prompt += `## Additional Requirements\n${modifierAdditions}\n`;
  }

  return prompt.trim();
}
