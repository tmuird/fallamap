import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "@clerk/react/legacy";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { AuthAlert, AuthDivider, AuthField, AuthLinkButton, AuthOAuthButton, AuthSubmit } from "./AuthControls";
import { AuthServiceLoading } from "./AuthServiceState";
import {
  describeClerkError,
  validateCode,
  validateIdentifier,
  validatePassword,
  type AuthFieldErrors,
} from "@/lib/authForm";

type Step = "details" | "verify";

/**
 * Sign-up driven by Clerk's hooks with our own markup: email + password, then the emailed
 * code. Google uses the same redirect flow as sign-in.
 */
export default function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("details");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const reportError = (error: unknown) => {
    const { field, message } = describeClerkError(error);
    setErrors({ [field]: message });
  };

  const fail = (field: keyof AuthFieldErrors, message: string) => setErrors({ [field]: message });

  const handleDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signUp) return;
    const identifierError = validateIdentifier(identifier);
    const passwordError = validatePassword(password);
    if (identifierError || passwordError) {
      setErrors({ identifier: identifierError ?? undefined, password: passwordError ?? undefined });
      return;
    }
    setErrors({});
    setNotice("");
    setBusy(true);
    try {
      // A half-finished attempt from an earlier visit would reject the same address.
      await signUp.create({ emailAddress: identifier.trim(), password });

      if (signUp.status === "complete" && signUp.createdSessionId) {
        if (!setActive) throw new Error("no setActive");
        await setActive({ session: signUp.createdSessionId });
        navigate("/", { replace: true });
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCode("");
      setStep("verify");
      setNotice(`We emailed a code to ${identifier.trim()}.`);
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signUp) return;
    const codeError = validateCode(code);
    if (codeError) return fail("code", codeError);
    setErrors({});
    setBusy(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.replace(/\s+/g, "") });
      if (attempt.status === "complete" && attempt.createdSessionId) {
        if (!setActive) throw new Error("no setActive");
        await setActive({ session: attempt.createdSessionId });
        navigate("/", { replace: true });
        return;
      }
      if (attempt.status === "missing_requirements") {
        const missing = attempt.missingFields ?? [];
        if (missing.includes("email_address")) return fail("code", "That code is not right. Check the latest email.");
        fail("form", `Your account still needs: ${missing.join(", ") || "more details"}.`);
        return;
      }
      fail("form", "We could not finish creating your account. Please try again.");
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (!signUp) return;
    setErrors({});
    setBusy(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/`,
      });
    } catch (error) {
      reportError(error);
      setBusy(false);
    }
  };

  // Clerk unreachable used to mean three grey bars forever, with no fields to fill in.
  if (!isLoaded) return <AuthServiceLoading />;

  if (step === "verify") {
    return (
      <form className="space-y-4" onSubmit={handleVerify} noValidate>
        {notice && <AuthAlert message={notice} tone="info" />}
        <AuthField
          id="code"
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={setCode}
          error={errors.code}
          placeholder="123456"
          autoFocus
        />
        {errors.form && <AuthAlert message={errors.form} />}
        <AuthSubmit isLoading={busy} loadingLabel="Verifying…">
          Create my account
        </AuthSubmit>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AuthLinkButton onClick={() => { setStep("details"); setCode(""); setErrors({}); setNotice(""); }}>
            Use a different email
          </AuthLinkButton>
          <AuthLinkButton
            onClick={async () => {
              if (!signUp) return;
              try {
                await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                setNotice("We sent a new code.");
              } catch (error) {
                reportError(error);
              }
            }}
          >
            Send a new code
          </AuthLinkButton>
        </div>
      </form>
    );
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="mr-1 flex h-9 w-9 items-center justify-center rounded-lg text-falla-ink/65 hover:text-falla-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-falla-fire"
    >
      {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
    </button>
  );

  return (
    <form className="space-y-4" onSubmit={handleDetails} noValidate>
      <AuthOAuthButton provider="Google" onClick={handleGoogle} isLoading={busy} />
      <AuthDivider />
      <AuthField
        id="identifier"
        label="Email address"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={identifier}
        onChange={setIdentifier}
        error={errors.identifier}
        placeholder="you@example.com"
        disabled={busy}
        autoFocus
      />
      <AuthField
        id="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        hint="At least 8 characters."
        disabled={busy}
        trailing={passwordToggle}
      />
      {errors.form && <AuthAlert message={errors.form} />}
      <AuthSubmit isLoading={busy} loadingLabel="Creating your account…">
        Create account
      </AuthSubmit>
    </form>
  );
}
