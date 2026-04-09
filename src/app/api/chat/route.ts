import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PERSONAS = {
  frustrated_tech: {
    name: "frustrated tech user",
    style:
      "You are a frustrated tech-savvy user who is very annoyed that something isn't working. You use technical terms occasionally but are impatient. You sometimes type in short bursts. You make occasional typos when upset.",
  },
  confused_elderly: {
    name: "confused elderly person",
    style:
      "You are an elderly person who is confused and not very comfortable with technology. You ask the same question multiple times in different ways. You are polite but lost. You sometimes go off-topic with personal anecdotes.",
  },
  impatient_business: {
    name: "impatient business owner",
    style:
      "You are a busy business owner who values your time above all else. You are terse, direct, and get impatient with delays. You mention being busy frequently. You want solutions, not explanations.",
  },
  anxious_buyer: {
    name: "anxious first-time buyer",
    style:
      "You are a first-time buyer who is worried and a bit anxious. You ask lots of clarifying questions. You are polite but nervous. You worry about making mistakes and losing money.",
  },
  angry_billing: {
    name: "angry billing complaint",
    style:
      "You are very angry about a billing issue. You feel cheated. You use CAPS occasionally for emphasis. You threaten to cancel and leave bad reviews. You are emotional but can be calmed with empathy and solutions.",
  },
};

const PROBLEMS = {
  login: "cannot log in to their account",
  wrong_item: "received the wrong item in their order",
  billing_error: "was charged incorrectly on their bill",
  not_working: "has a product that is not working properly",
  refund: "wants a refund for a recent purchase",
};

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const { messages, persona, problem, impatience } = await req.json();

    const personaData = PERSONAS[persona as keyof typeof PERSONAS];
    const problemDesc = PROBLEMS[problem as keyof typeof PROBLEMS];

    if (!personaData || !problemDesc) {
      return NextResponse.json({ error: "Invalid persona or problem" }, { status: 400 });
    }

    const impatienceNote =
      impatience > 2
        ? " You are getting very impatient and frustrated with the wait time. Make it clear you are losing patience."
        : impatience > 1
        ? " You are starting to get impatient. Mention it subtly."
        : "";

    const systemPrompt = `You are playing the role of a customer contacting support. ${personaData.style}${impatienceNote}

Your issue: You ${problemDesc}.

RULES:
- Stay in character at ALL times
- Keep responses SHORT — 1-3 sentences max, like real chat
- Occasionally make small typos (1 in 5 messages) to feel human
- If the agent gives a good, helpful response that addresses your issue: show satisfaction and say you're happy/resolved
- If the agent's response is vague, unhelpful, or doesn't address your problem: express frustration or confusion and push back
- If the agent says something that fully resolves your issue and you feel satisfied: end your message with exactly "[RESOLVED]"
- Never break character or mention you are an AI`;

    const response = await client.messages.create(
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages: messages,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const resolved = text.includes("[RESOLVED]");
    const cleanText = text.replace("[RESOLVED]", "").trim();

    return NextResponse.json({ message: cleanText, resolved });
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
