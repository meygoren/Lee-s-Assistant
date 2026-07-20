import { NextResponse } from "next/server";
import { generateAndStoreNewsletter } from "@/lib/newsletter";

export async function POST() {
  try {
    const entry = await generateAndStoreNewsletter();
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("Newsletter generation error:", err);
    return NextResponse.json({ error: "Failed to generate newsletter." }, { status: 500 });
  }
}
