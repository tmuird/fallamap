/**
 * Validation and error-message rules for the headless Clerk forms.
 *
 * The sign-in and sign-up pages render their own fields and buttons (so the design
 * system owns the layout) and call Clerk's hooks directly. Everything that does not
 * need the network lives here, where it can be unit tested.
 */

export type AuthStep = "identifier" | "password" | "code" | "new-password" | "done";

export interface AuthFieldErrors {
  identifier?: string;
  password?: string;
  code?: string;
  form?: string;
}

export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns an error message, or null when the address is usable. */
export function validateIdentifier(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(trimmed)) return "That does not look like an email address.";
  return null;
}

/** Clerk's default minimum is 8; anything else is the server's call, not ours. */
export function validatePassword(value: string): string | null {
  if (!value) return "Enter your password.";
  if (!value.trim()) return "Enter your password.";
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function validateCode(value: string): string | null {
  const trimmed = value.replace(/\s+/g, "");
  if (!trimmed) return "Enter the code we emailed you.";
  if (!/^\d{4,10}$/.test(trimmed)) return "That code should be digits only.";
  return null;
}

const ERROR_MESSAGES: Record<string, { field: keyof AuthFieldErrors; message: string }> = {
  form_identifier_not_found: {
    field: "identifier",
    message: "No account uses that email address. Check it, or create an account.",
  },
  form_identifier_exists: {
    field: "identifier",
    message: "That email address already has an account. Sign in instead.",
  },
  form_param_format_invalid: {
    field: "identifier",
    message: "That does not look like an email address.",
  },
  form_password_incorrect: {
    field: "password",
    message: "That password is not right. Try again, or reset it.",
  },
  form_password_length_too_short: {
    field: "password",
    message: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  },
  form_password_pwned: {
    field: "password",
    message: "That password has appeared in a data breach. Pick a different one.",
  },
  form_password_validation_failed: {
    field: "password",
    message: "That password is not accepted. Try a longer, less common one.",
  },
  form_code_incorrect: {
    field: "code",
    message: "That code is not correct. Check the latest email and try again.",
  },
  verification_expired: {
    field: "code",
    message: "That code has expired. Ask for a new one.",
  },
  too_many_requests: {
    field: "form",
    message: "Too many attempts. Wait a minute and try again.",
  },
  network_error: {
    field: "form",
    message: "We could not reach the sign-in service. Check your connection and try again.",
  },
};

interface ClerkErrorShape {
  errors?: Array<{ code?: string; message?: string; longMessage?: string }>;
  message?: string;
}

/**
 * Turn a Clerk error into something a person can act on. Never surfaces the raw
 * code, and never blames the password when the real problem was the network.
 */
export function describeClerkError(error: unknown): { field: keyof AuthFieldErrors; message: string } {
  const shaped = (error ?? {}) as ClerkErrorShape;
  const first = Array.isArray(shaped.errors) ? shaped.errors[0] : undefined;
  const code = first?.code;

  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];

  // Only Clerk's structured messages are safe to show: a bare JS error's `.message`
  // is an internal string ("network down", "undefined is not a function") and would
  // read as nonsense to a customer.
  const fallback = first?.longMessage ?? first?.message;
  if (fallback && fallback.length > 8 && !/^[a-z_]+$/.test(fallback)) {
    return { field: "form", message: fallback };
  }
  return { field: "form", message: "Something went wrong. Please try again." };
}

/**
 * Clerk reports where a sign-in attempt got to. `needs_first_factor` means the
 * password is next; `needs_second_factor` means a verification code.
 */
export function nextSignInStep(status: string | null | undefined): AuthStep {
  switch (status) {
    case "needs_first_factor":
      return "password";
    case "needs_second_factor":
      return "code";
    case "needs_new_password":
      return "new-password";
    case "complete":
      return "done";
    default:
      return "identifier";
  }
}

/** Sign-up stays at `missing_requirements` until the emailed code is verified. */
export function nextSignUpStep(status: string | null | undefined, awaitingCode = false): AuthStep {
  if (status === "complete") return "done";
  return awaitingCode ? "code" : "identifier";
}
