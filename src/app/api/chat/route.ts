import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";
import { readPolicy } from "@/lib/adminPolicy";
import { PROBLEM_CONTEXT } from "@/lib/gameUtils";
import type { CustomerAccount } from "@/lib/types";

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const { messages, persona, problem, impatience, account } = await req.json();

    const policy = await readPolicy();
    const personaData = policy.personas[persona as string];

    if (!personaData) {
      clearTimeout(timeout);
      return NextResponse.json({ error: "Invalid persona or problem" }, { status: 400 });
    }

    const impatienceNote =
      impatience > 2
        ? " You are getting very impatient and frustrated with the wait time. Make it clear you are losing patience."
        : impatience > 1
        ? " You are starting to get impatient. Mention it subtly."
        : "";

    const accountInfo = account as CustomerAccount | undefined;
    const contextFn = PROBLEM_CONTEXT[problem as string];
    const problemContext = accountInfo && contextFn ? contextFn(accountInfo) : "";

    const accountSection = accountInfo
      ? `\nYour account details (use these naturally when relevant — don't list them all at once):
- Name: ${accountInfo.name}
- Email: ${accountInfo.email}
- Kajabi Plan: ${accountInfo.plan}
- Product/Course: "${accountInfo.product}"
- Member since: ${accountInfo.joinDate}
- Account ID: ${accountInfo.accountId}`
      : "";

    const systemPrompt = `You are playing the role of a Kajabi customer contacting support. ${personaData.style}${impatienceNote}
${accountSection}

Your situation: ${problemContext}

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
