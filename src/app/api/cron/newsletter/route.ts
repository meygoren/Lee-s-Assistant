import { NextRequest, NextResponse } from "next/server";
import { generateAndStoreNewsletter } from "@/lib/newsletter";

// Trigger every morning via Vercel Cron (see vercel.json) or any external scheduler.
// Protect with CRON_SECRET so this endpoint can't be triggered by anyone else.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const entry = await generateAndStoreNewsletter();
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("Cron newsletter generation error:", err);
    return NextResponse.json({ error: "Failed to generate newsletter." }, { status: 500 });
  }
}
