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
