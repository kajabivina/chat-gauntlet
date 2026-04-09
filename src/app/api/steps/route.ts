import { NextResponse } from "next/server";
import { readPolicy } from "@/lib/adminPolicy";

export async function GET() {
  const policy = await readPolicy();
  return NextResponse.json(policy.troubleshootingSteps);
}
