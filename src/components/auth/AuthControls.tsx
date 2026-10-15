import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

/**
 * The pieces the sign-in and sign-up forms are built from.
 *
 * These replace Clerk's embedded widget: we drive Clerk's API from hooks and render our
 * own markup, so the fields, spacing and type match the rest of the app instead of a
 * third-party card that has to be forced into place with class-name overrides.
 */

interface AuthFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "tel";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric";
  disabled?: boolean;
  autoFocus?: boolean;
  /** Rendered inside the field wrapper, e.g. a show/hide toggle. */
  trailing?: React.ReactNode;
}

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  hint,
  placeholder,
  autoComplete,
  inputMode,
  disabled,
  autoFocus,
  trailing,
}: AuthFieldProps) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-falla-ink/65"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            "h-12 w-full rounded-xl border-2 bg-falla-paper px-4 text-sm font-semibold text-falla-ink",
            "placeholder:text-falla-ink/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-falla-fire focus-visible:ring-offset-2 focus-visible:ring-offset-falla-paper",
            "disabled:opacity-50",
            error ? "border-red-600" : "border-falla-ink/20 focus:border-falla-ink",
            trailing && "pr-12"
          )}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="ml-1 text-xs font-medium text-falla-ink/65">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="ml-1 text-xs font-bold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthAlert({ message, tone = "error" }: { message: string; tone?: "error" | "info" }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-xl border-2 p-3 text-sm font-semibold",
        tone === "error"
          ? "border-red-600 bg-red-50 text-red-800"
          : "border-falla-ink/20 bg-falla-sand/20 text-falla-ink"
      )}
    >
      <WarningCircle size={18} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function AuthSubmit({
  children,
  isLoading,
  loadingLabel,
  disabled,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="submit"
      isLoading={isLoading}
      disabled={disabled}
      className="h-12 w-full rounded-xl text-[11px] font-black uppercase tracking-widest"
    >
      {isLoading ? loadingLabel ?? "Working…" : children}
    </Button>
  );
}

export function AuthLinkButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center px-3 text-xs font-black uppercase tracking-widest text-falla-fire-ink underline decoration-falla-fire/40 underline-offset-4",
        "hover:decoration-falla-fire-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-falla-fire",
        className
      )}
    >
      {children}
    </button>
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-[2px] flex-1 bg-falla-ink/10" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-falla-ink/65">{label}</span>
      <span className="h-[2px] flex-1 bg-falla-ink/10" />
    </div>
  );
}

export function AuthOAuthButton({
  onClick,
  disabled,
  isLoading,
  provider,
}: {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  provider: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="h-12 w-full rounded-xl text-[11px] font-black uppercase tracking-widest"
    >
      {isLoading ? "Redirecting…" : `Continue with ${provider}`}
    </Button>
  );
}
