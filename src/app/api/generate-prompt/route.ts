import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const SYSTEM_PROMPT = `You are an expert idea refinement assistant for CMG Financial. Your job is to take a loan officer's rough idea and transform it into a well-structured, actionable idea submission that leadership and product teams can evaluate.

Given the user's input and their selected preferences, generate a detailed, actionable idea submission that:
1. Clearly states the problem or opportunity
2. Describes the proposed solution or improvement
3. Explains expected benefits and impact
4. Identifies affected teams, systems, and stakeholders
5. Includes implementation considerations

Output ONLY the structured idea — no meta-commentary. Be thorough, specific, and include mortgage industry context.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, modes: modesRaw, mode: legacyMode, detailLevel, outputFormat, modifiers, contextInfo, attachments, urlReferences } = body;
    const modes: string[] = Array.isArray(modesRaw) ? modesRaw : (legacyMode ? [legacyMode] : []);

    const modeDescriptions: Record<string, string> = {
      "los-enhancement": "improving the Loan Origination System",
      "automation": "automating manual tasks and processes",
      "macro-script": "custom macros, scripts, and shortcuts",
      "integration": "connecting systems, tools, and data",
      "dashboard": "new reports, dashboards, and analytics",
      "ui-ux": "interface and usability improvements",
      "doc-mgmt": "document handling, e-sign, and storage",
      "mobile": "mobile origination features",
      "ai-feature": "AI-powered tools for underwriting or analysis",
      "data-quality": "data accuracy and validation",
      "security": "security, permissions, and access control",
      "api-webhook": "system connectivity and notifications",
      "pipeline-view": "pipeline visualization and filtering",
      "workflow": "loan workflow improvements",
      "bottleneck": "fixing processing delays",
      "milestone": "milestone and status tracking",
      "task-mgmt": "task assignment and follow-ups",
      "handoff": "team-to-team handoff improvements",
      "qc-audit": "quality control and audit improvements",
      "closing": "closing and funding improvements",
      "rate-lock": "rate lock workflow and alerts",
      "conditions": "condition tracking and clearing",
      "exceptions": "exception handling and escalation",
      "sla": "turn time targets and monitoring",
      "lead-gen": "lead generation and capture",
      "crm-feature": "CRM functionality improvements",
      "email-campaign": "email marketing and drip campaigns",
      "social-media": "social media content and strategy",
      "borrower-portal": "borrower portal and self-service",
      "referral": "referral and partner programs",
      "brand-content": "branding, content, and collateral",
      "co-marketing": "realtor and partner co-marketing",
      "reviews": "reviews, ratings, and testimonials",
      "pre-approval": "pre-approval and pre-qual tools",
      "listing-alerts": "property listing and market alerts",
      "retention": "post-close nurture and retention",
      "new-product": "new loan products or programs",
      "pricing": "pricing engine and compensation",
      "guidelines": "underwriting guideline improvements",
      "compliance": "regulatory compliance improvements",
      "training": "training and education",
      "onboarding": "new hire onboarding",
      "vendor": "vendor and third-party partnerships",
      "cost-savings": "cost reduction and efficiency",
      "revenue": "revenue growth opportunities",
      "risk": "risk management and fraud prevention",
      "investor": "secondary market and investor relations",
      "policy": "internal policy and procedure updates",
    };

    const detailDescriptions: Record<string, string> = {
      concise: "Keep the idea brief and focused.",
      balanced: "Provide moderate detail — enough to evaluate.",
      comprehensive: "Be thorough. Cover problem, solution, impact, risks, and implementation.",
    };

    const formatDescriptions: Record<string, string> = {
      structured: "Use clear markdown headers to organize into sections.",
      conversational: "Write naturally as if pitching to a colleague.",
      "bullet-points": "Use bullet points for easy scanning.",
    };

    const modifierDescriptions: Record<string, string> = {
      "step-by-step": "Break into numbered implementation steps",
      "examples": "Include practical mortgage industry examples",
      "alternatives": "Present 2-3 alternative approaches",
      "best-practices": "Highlight mortgage industry best practices",
      "explain-reasoning": "Explain the why behind decisions",
      "roi-impact": "Include estimated ROI and business impact",
      "borrower-impact": "Describe borrower experience impact",
      "compliance-check": "Address regulatory considerations",
      "affected-teams": "Identify all affected teams",
      "implementation-effort": "Estimate complexity (low/medium/high)",
      "timeline": "Include rough implementation timeline",
      "risk-assessment": "Identify risks and mitigations",
      "metrics": "Define success metrics and KPIs",
      "stakeholders": "Consider all stakeholder perspectives",
    };

    const selectedModifiers = modifiers
      .map((id: string) => modifierDescriptions[id])
      .filter(Boolean)
      .join("\n- ");

    interface AttachmentData { name: string; content: string; }
    const attachmentSection = attachments && attachments.length > 0
      ? "\n\nATTACHED FILES:\n" + attachments.map((a: AttachmentData) => "--- " + a.name + " ---\n" + a.content.slice(0, 10000) + "\n").join("\n")
      : "";

    interface UrlReferenceData { title: string; content: string; type: string; url: string; }
    const urlSection = urlReferences && urlReferences.length > 0
      ? "\n\nREFERENCED URLS:\n" + urlReferences.map((r: UrlReferenceData) => "--- " + r.title + " (" + r.url + ") ---\n" + r.content.slice(0, 15000) + "\n").join("\n")
      : "";

    const modeList = modes.length > 0
      ? modes.map((m: string) => m + " (" + (modeDescriptions[m] || "general") + ")").join(" + ")
      : "general improvement idea";

    const userPrompt = "Transform this loan officer's idea into a structured submission:\n\n"
      + "IDEA: \"" + transcript + "\"\n\n"
      + "CATEGORIES: " + modeList + "\n\n"
      + "DETAIL: " + (detailDescriptions[detailLevel] || detailDescriptions.balanced) + "\n"
      + "FORMAT: " + (formatDescriptions[outputFormat] || formatDescriptions.structured) + "\n"
      + (contextInfo ? "\nCONTEXT: " + contextInfo + "\n" : "")
      + attachmentSection
      + urlSection
      + (selectedModifiers ? "\nREQUIREMENTS:\n- " + selectedModifiers : "")
      + "\n\nGenerate a detailed, well-structured idea submission.";

    if (!process.env.OPENROUTER_API_KEY) {
      const modeLabel = modes.length > 0
        ? modes.map(m => m.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")).join(" + ")
        : "General";
      const modeContext = modes.length > 0
        ? modes.map(m => modeDescriptions[m] || "improving CMG processes").join("; ")
        : "improving CMG tools and processes";

      let p = "# " + modeLabel + " Idea\n\n## Overview\n" + transcript + "\n\n## Category\nFocused on " + modeContext + ".\n\n";
      if (contextInfo) p += "## Context\n" + contextInfo + "\n\n";
      p += "## Detail Level\n" + (detailDescriptions[detailLevel] || detailDescriptions.balanced) + "\n\n";
      if (selectedModifiers) p += "## Requirements\n- " + selectedModifiers + "\n\n";
      p += "## Evaluation Criteria\n- Problem/opportunity clearly stated\n- Solution is specific and actionable\n- Benefits quantified where possible";
      return NextResponse.json({ prompt: p });
    }

    const result = await generateText({
      model: openrouter("anthropic/claude-opus-4"),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json({ prompt: result.text });
  } catch (error) {
    console.error("Generate idea error:", error);
    return NextResponse.json({ error: "Failed to generate idea" }, { status: 500 });
  }
}
