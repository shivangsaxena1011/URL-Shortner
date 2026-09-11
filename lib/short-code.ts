import crypto from "crypto";
import prisma from "@/lib/db";

// Character set avoiding ambiguous characters: 0, O, 1, I, l
const CHARSET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generate a cryptographically random short code
 * @param length Code length (default 6)
 */
export function generateRandomCode(length: number = 6): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

/**
 * Generate a unique short code, querying the database and handling collisions.
 * @param maxAttempts Maximum attempts before error
 * @param length Length of the short code
 */
export async function generateUniqueShortCode(
  maxAttempts: number = 10,
  length: number = 6
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRandomCode(length);
    // Check if code or custom alias matches this generated code
    const existing = await prisma.url.findFirst({
      where: {
        OR: [{ shortCode: code }, { customAlias: code }],
      },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  // If collisions continue, try slightly longer code
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRandomCode(length + 1);
    const existing = await prisma.url.findFirst({
      where: {
        OR: [{ shortCode: code }, { customAlias: code }],
      },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Failed to generate a unique short code after multiple attempts.");
}
