import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";
import { readPolicy, writePolicy, Policy } from "@/lib/adminPolicy";

function isAuthed(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : false;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const policy = await readPolicy();
  return NextResponse.json(policy);
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const policy = (await req.json()) as Policy;
  await writePolicy(policy);
  return NextResponse.json({ ok: true });
}
