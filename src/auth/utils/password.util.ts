import * as crypto from "crypto";

export class PasswordUtil {
  /**
   * Hashes a password with a random 16-byte salt using scrypt (Node.js crypto).
   * Format: salt:derivedKeyHex
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString("hex")}`;
  }

  /**
   * Securely verifies a password against a stored salt:derivedKeyHex string.
   */
  static verifyPassword(
    password: string,
    storedHash: string | null | undefined,
  ): boolean {
    if (!storedHash || !storedHash.includes(":")) {
      return false;
    }
    try {
      const [salt, key] = storedHash.split(":");
      const keyBuffer = Buffer.from(key, "hex");
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch {
      return false;
    }
  }

  /**
   * Parses vendor description to separate public description and stored password hash.
   */
  static parseVendorDescription(rawDescription: string | null | undefined): {
    description: string | null;
    passwordHash: string | null;
  } {
    if (!rawDescription) {
      return { description: null, passwordHash: null };
    }
    try {
      const parsed = JSON.parse(rawDescription);
      if (
        parsed &&
        typeof parsed === "object" &&
        (parsed.__isVendorMeta === true || parsed.passwordHash !== undefined)
      ) {
        return {
          description: parsed.bio ?? null,
          passwordHash: parsed.passwordHash ?? null,
        };
      }
    } catch {
      // rawDescription is a standard plain text string
    }
    return {
      description: rawDescription,
      passwordHash: null,
    };
  }

  /**
   * Serializes public description and password hash for safe DB persistence.
   */
  static serializeVendorDescription(
    bio: string | null | undefined,
    passwordHash: string | null | undefined,
  ): string | null {
    if (!passwordHash) {
      return bio ?? null;
    }
    return JSON.stringify({
      __isVendorMeta: true,
      bio: bio ?? null,
      passwordHash,
    });
  }

  /**
   * Sanitizes vendor object by extracting clean public description and removing password hash.
   */
  static sanitizeVendor<T extends { description?: string | null }>(
    vendor: T,
  ): T {
    if (!vendor) return vendor;
    const { description } = this.parseVendorDescription(vendor.description);
    const sanitized = { ...vendor, description };
    delete (sanitized as any).password;
    delete (sanitized as any).passwordHash;
    return sanitized;
  }
}
