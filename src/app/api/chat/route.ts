import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";
import { readPolicy } from "@/lib/adminPolicy";

const PROBLEMS: Record<string, string> = {
  course_access: "is a Kajabi creator whose students cannot access their course or membership content",
  billing: "has a question or complaint about a charge on their Kajabi account",
  login: "cannot log in to their Kajabi account",
  product_issue: "has a Kajabi product or course page that is not displaying or working correctly",
  email_issue: "sent a Kajabi broadcast or automation email that was not delivered to their list",
  cancellation: "wants to cancel their Kajabi subscription",
};

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const { messages, persona, problem, impatience } = await req.json();

    const policy = await readPolicy();
    const personaData = policy.personas[persona as string];
    const problemDesc = PROBLEMS[problem as string];

    if (!personaData || !problemDesc) {
      clearTimeout(timeout);
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
${policy.rules}`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      maxOutputTokens: 500,
      system: systemPrompt,
      messages,
      abortSignal: controller.signal,
    });

    clearTimeout(timeout);

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
