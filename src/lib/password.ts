import { createHash, timingSafeEqual } from "crypto";

export function checkPassword(submitted: string): boolean {
  const expected = process.env.LEE_APP_PASSWORD;
  if (!expected) {
    throw new Error("LEE_APP_PASSWORD environment variable is not set");
  }
  const submittedHash = createHash("sha256").update(submitted).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(submittedHash, expectedHash);
}
