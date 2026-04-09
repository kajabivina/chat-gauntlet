import { put, get } from "@vercel/blob";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const BLOB_PATHNAME = "chatgauntlet/policy.json";
const LOCAL_POLICY_PATH = path.join(process.cwd(), "config", "policy.json");

export interface PersonaPolicy {
  name: string;
  style: string;
}

export interface Policy {
  personas: Record<string, PersonaPolicy>;
  rules: string;
  troubleshootingSteps: Record<string, string[]>;
}

export const DEFAULT_POLICY: Policy = {
  personas: {
    frustrated_tech: {
      name: "frustrated tech-savvy creator",
      style:
        "You are a tech-savvy Kajabi creator who is very annoyed that something isn't working. You know your way around software and are frustrated this platform isn't cooperating. You use technical terms occasionally and are impatient. You type in short bursts and make occasional typos when upset.",
    },
    confused_elderly: {
      name: "confused older creator",
      style:
        "You are an older Kajabi creator who built a course to share your life's expertise, but you're not very comfortable with technology. You ask the same question multiple times in different ways. You are polite but lost, and sometimes go off-topic mentioning your students or your course topic.",
    },
    impatient_business: {
      name: "impatient business owner",
      style:
        "You are a busy entrepreneur running your online business on Kajabi. You value your time above all else and get impatient with delays. You are terse and direct — you want solutions, not explanations. You mention lost revenue or student frustration when things don't work.",
    },
    anxious_buyer: {
      name: "anxious new Kajabi user",
      style:
        "You are new to Kajabi and worried about your investment. You just launched or are about to launch your first course. You ask lots of clarifying questions, are polite but nervous, and worry about losing students or money if things aren't fixed quickly.",
    },
    angry_billing: {
      name: "angry billing complaint",
      style:
        "You are very angry about an unexpected Kajabi charge. You feel misled about pricing. You use CAPS occasionally for emphasis. You threaten to cancel, dispute the charge, and leave bad reviews. You are emotional but can be calmed with empathy and a clear explanation.",
    },
  },
  troubleshootingSteps: {
    course_access: [
      "Greet the customer and confirm which product/course they're referring to",
      "Ask how many students are affected and what error message they see",
      "Verify the product is published and all sections are toggled on",
      "Confirm the student is enrolled and has an active offer",
      "Ask the student to try an incognito/private browser window",
      "Check if content is drip-scheduled and not yet unlocked",
      "Escalate to Tier 2 if issue persists after above steps",
    ],
    billing: [
      "Pull up the account and confirm their current plan",
      "Review billing history and identify the charge in question",
      "Check for any active promotions or discount codes on file",
      "Explain what the charge is for clearly and empathetically",
      "If charge is incorrect, escalate to billing team with account ID",
    ],
    login: [
      "Confirm the email address associated with the account",
      "Send a fresh password reset link from the admin side",
      "Ask them to check spam, promotions, and junk folders",
      "Suggest trying a different browser or incognito mode",
      "Check if the account is suspended or has an unusual status",
      "If email still not arriving, verify the email on file is correct",
    ],
    product_issue: [
      "Ask which product and which specific pages are affected",
      "Check if the product is published and all sections are enabled",
      "Ask if any edits were made recently before the issue started",
      "Ask them to hard refresh (Ctrl+Shift+R) and clear browser cache",
      "Verify the issue affects all browsers, not just one",
      "If content appears deleted, check if it was accidentally removed in the editor",
    ],
    email_issue: [
      "Confirm the broadcast shows 'Sent' status in the Kajabi dashboard",
      "Ask if a test email to themselves was also not received",
      "Check if the sender email address is verified in Kajabi",
      "Ask the customer to check if any contacts are in the suppression list",
      "Note the broadcast name and time, escalate to deliverability team",
    ],
    cancellation: [
      "Acknowledge their request with empathy — do not immediately process",
      "Ask what's driving the decision to understand if we can help",
      "Offer the account pause option if they need a break (eligible plans)",
      "If they confirm cancellation, explain what happens to their data and products",
      "Process the cancellation and confirm via email",
    ],
  },
  rules:
    '- Stay in character at ALL times\n- Keep responses SHORT — 1-3 sentences max, like real chat\n- Occasionally make small typos (1 in 5 messages) to feel human\n- If the agent gives a good, helpful response that addresses your issue: show satisfaction and say you\'re happy/resolved\n- If the agent\'s response is vague, unhelpful, or doesn\'t address your problem: express frustration or confusion and push back\n- If the agent says something that fully resolves your issue and you feel satisfied: end your message with exactly "[RESOLVED]"\n- Never break character or mention you are an AI',
};

function usesBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function mergeWithDefaults(parsed: Policy): Policy {
  return {
    personas: { ...DEFAULT_POLICY.personas, ...parsed.personas },
    rules: parsed.rules ?? DEFAULT_POLICY.rules,
    troubleshootingSteps: { ...DEFAULT_POLICY.troubleshootingSteps, ...parsed.troubleshootingSteps },
  };
}

export async function readPolicy(): Promise<Policy> {
  if (usesBlob()) {
    try {
      const result = await get(BLOB_PATHNAME, { access: "public" });
      if (result && result.statusCode === 200) {
        const text = await new Response(result.stream).text();
        return mergeWithDefaults(JSON.parse(text) as Policy);
      }
    } catch {
      // blob not found yet — return defaults
    }
    return DEFAULT_POLICY;
  }

  // Local file fallback for development
  try {
    const raw = await readFile(LOCAL_POLICY_PATH, "utf-8");
    return mergeWithDefaults(JSON.parse(raw) as Policy);
  } catch {
    return DEFAULT_POLICY;
  }
}

export async function writePolicy(policy: Policy): Promise<void> {
  if (usesBlob()) {
    await put(BLOB_PATHNAME, JSON.stringify(policy, null, 2), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    });
    return;
  }

  // Local file fallback for development
  await mkdir(path.dirname(LOCAL_POLICY_PATH), { recursive: true });
  await writeFile(LOCAL_POLICY_PATH, JSON.stringify(policy, null, 2), "utf-8");
}
