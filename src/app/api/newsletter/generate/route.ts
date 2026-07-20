import { NextResponse } from "next/server";
import { generateAndStoreNewsletter } from "@/lib/newsletter";

// Web-search-grounded AI generation can take well past Vercel's default
// function timeout — allow up to 60s (the max on the Hobby plan).
export const maxDuration = 60;

export async function POST() {
  try {
    const entry = await generateAndStoreNewsletter();
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("Newsletter generation error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate newsletter.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
