import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

interface Message {
  role: "assistant" | "user";
  content: string;
}

const SYSTEM_PROMPT_NEW = `You are an expert idea refinement assistant at CMG Financial. Your goal is to help loan officers articulate their ideas clearly by asking 2-4 focused questions, then generating a well-structured idea submission.

When starting an interview:
1. Greet the loan officer warmly
2. Acknowledge their initial idea
3. Ask your first clarifying question

Good questions to ask:
- What specific problem or pain point does this solve?
- How does this affect your daily workflow or your borrowers?
- Which systems or teams would this impact?
- What does the ideal outcome look like?
- Have you seen this done well elsewhere?

Rules:
- Ask only 1 question at a time
- Keep questions concise and friendly
- After 2-4 questions (when you have enough context), generate the final idea submission
- When ready to complete, respond with EXACTLY this format:

[COMPLETE]
<your structured idea submission here>
[/COMPLETE]

The idea submission should be:
- Well-structured with clear sections (Problem, Solution, Impact, Implementation)
- Include all gathered context
- Be specific and actionable
- Use markdown formatting`;

const SYSTEM_PROMPT_ENHANCE = `You are an expert idea refinement assistant at CMG Financial. The loan officer already has a generated idea submission and wants to enhance it. Ask 2-3 clarifying questions to understand what to add or change, then merge everything into an improved version.

When starting an enhancement:
1. Acknowledge their existing submission
2. Ask what they'd like to add, change, or clarify
3. Focus on what's missing or could be improved

Good questions:
- What would you like to add or change in this submission?
- Is there context or a requirement that's missing?
- Should we adjust the priority or scope?
- Are there specific metrics or outcomes you want to highlight?

Rules:
- Ask only 1 question at a time
- After 2-3 questions, merge new information with the existing submission
- PRESERVE the good parts of the existing submission
- When ready, respond with:

[COMPLETE]
<your merged/enhanced submission here>
[/COMPLETE]`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transcript, mode, messages, existingPrompt } = body;
    const hasExistingPrompt = Boolean(existingPrompt?.trim());

    if (!process.env.OPENROUTER_API_KEY) {
      if (action === "start") {
        if (hasExistingPrompt) {
          return NextResponse.json({
            message: `I see you already have an idea submission. Let me help you refine it!\n\nWhat would you like to add, change, or clarify?`,
          });
        }
        if (!transcript?.trim()) {
          return NextResponse.json({
            message: `Welcome! I'm here to help you brainstorm and develop an idea for CMG.\n\nWhat's on your mind? Tell me about a challenge, pain point, or improvement you'd like to see.`,
          });
        }
        return NextResponse.json({
          message: `Great idea about ${mode ? mode.replace(/-/g, " ") : "improving our processes"}! Let me help you flesh it out.\n\nWhat specific problem or pain point does this solve for you or your borrowers?`,
        });
      }

      const questionCount = messages?.filter((m: Message) => m.role === "assistant").length || 0;
      if (questionCount >= 2) {
        const userResponses = messages?.filter((m: Message) => m.role === "user").map((m: Message) => m.content).join("\n- ");
        if (hasExistingPrompt) {
          return NextResponse.json({
            isComplete: true,
            finalPrompt: `${existingPrompt}\n\n## Additional Details from Interview\n- ${userResponses}`,
          });
        }
        return NextResponse.json({
          isComplete: true,
          finalPrompt: `## Idea Category\n${mode ? mode.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) : "General Improvement"}\n\n## Idea Description\n${transcript}\n\n## Additional Context from Interview\n- ${userResponses}\n\n## Expected Benefits\nPlease evaluate this idea for potential impact on efficiency, borrower experience, and business growth.`,
        });
      }

      if (action === "generate") {
        const userResponses = messages?.filter((m: Message) => m.role === "user").map((m: Message) => m.content).join("\n- ");
        if (hasExistingPrompt) {
          return NextResponse.json({
            isComplete: true,
            finalPrompt: `${existingPrompt}\n\n## Additional Details\n- ${userResponses || "No additional context provided"}`,
          });
        }
        return NextResponse.json({
          isComplete: true,
          finalPrompt: `## Idea Category\n${mode || "General"}\n\n## Description\n${transcript || "Idea submission"}\n\n## Interview Context\n- ${userResponses || "No additional context"}\n\n## Next Steps\nPlease evaluate for feasibility and impact.`,
        });
      }

      const followUpQuestions = hasExistingPrompt
        ? [
            "What specific section would you like to expand or modify?",
            "Are there any edge cases or scenarios you want to add?",
            "Should we adjust the priority or scope of any part?",
          ]
        : [
            "Which teams or systems would this affect the most?",
            "What does success look like \u2014 how would you measure the improvement?",
            "Is there anything else leadership should know about this idea?",
          ];

      return NextResponse.json({
        message: followUpQuestions[questionCount] || followUpQuestions[0],
      });
    }

    type MessageRole = "system" | "user" | "assistant";
    interface ChatMessage { role: MessageRole; content: string; }

    const systemPrompt = hasExistingPrompt ? SYSTEM_PROMPT_ENHANCE : SYSTEM_PROMPT_NEW;
    const allMessages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

    const hasTranscript = Boolean(transcript?.trim());
    const contextString = hasExistingPrompt
      ? `A loan officer wants to enhance their "${mode}" idea. Their initial description: "${transcript}"\n\nExisting submission:\n\n---EXISTING---\n${existingPrompt}\n---END---\n\nHelp them improve it.`
      : hasTranscript
        ? `A loan officer has an idea about "${mode}". Their description:\n\n"${transcript}"`
        : `A loan officer wants to brainstorm a new idea${mode ? ` in the "${mode}" category` : ""}. They haven't written anything yet — help them discover and articulate their idea through conversation.`;

    if (action === "start") {
      allMessages.push({
        role: "user",
        content: hasExistingPrompt
          ? `${contextString}\n\nAcknowledge their submission and ask what they'd like to improve.`
          : hasTranscript
            ? `${contextString}\n\nGreet them and ask your first clarifying question.`
            : `${contextString}\n\nWelcome them warmly and ask what idea they'd like to explore. Be enthusiastic and open-ended.`,
      });
    } else if (action === "continue" && messages) {
      allMessages.push({ role: "user", content: contextString });
      for (const msg of messages) {
        allMessages.push({ role: msg.role as MessageRole, content: msg.content });
      }
    } else if (action === "generate" && messages) {
      allMessages.push({ role: "user", content: contextString });
      for (const msg of messages) {
        allMessages.push({ role: msg.role as MessageRole, content: msg.content });
      }
      allMessages.push({
        role: "user",
        content: hasExistingPrompt
          ? "Merge the new information with the existing submission. Respond with:\n\n[COMPLETE]\n<merged submission>\n[/COMPLETE]"
          : "Generate the final idea submission now. Respond with:\n\n[COMPLETE]\n<submission>\n[/COMPLETE]",
      });
    }

    const result = await generateText({
      model: openrouter("anthropic/claude-3.5-haiku"),
      messages: allMessages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    const responseText = result.text;
    const completeMatch = responseText.match(/\[COMPLETE\]([\s\S]*?)\[\/COMPLETE\]/);
    if (completeMatch) {
      return NextResponse.json({ isComplete: true, finalPrompt: completeMatch[1].trim() });
    }

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json({ error: "Failed to process interview" }, { status: 500 });
  }
}
