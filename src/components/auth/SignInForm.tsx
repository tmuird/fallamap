import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/react/legacy";
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

type Step = "credentials" | "code" | "reset-request" | "reset-code" | "new-password";

/**
 * Sign-in driven by Clerk's hooks, rendered with our own fields and buttons.
 *
 * Clerk's prebuilt <SignIn> was an embedded card whose internal markup had to be bent into
 * place with class-name overrides; it kept collapsing its password row and fighting the page
 * theme. Here Clerk only supplies the API, and the markup is ours.
 */
export default function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("credentials");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const reportError = (error: unknown) => {
    const { field, message } = describeClerkError(error);
    setErrors({ [field]: message });
  };

  const fail = (field: keyof AuthFieldErrors, message: string) => {
    setErrors({ [field]: message });
  };

  /** Clerk reports completion on the attempt resource; activate the session if we got one. */
  const activateIfComplete = async (status: string | null | undefined, sessionId: string | null | undefined) => {
    if (status !== "complete" || !sessionId || !setActive) return false;
    await setActive({ session: sessionId });
    navigate("/", { replace: true });
    return true;
  };

  const handleCredentials = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signIn) return;
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
      const created = await signIn.create({ identifier: identifier.trim() });
      const attempt = created.supportedFirstFactors?.some((factor) => factor.strategy === "password")
        ? await signIn.attemptFirstFactor({ strategy: "password", password })
        : created;

      if (await activateIfComplete(attempt.status, attempt.createdSessionId)) return;

      if (attempt.status === "needs_second_factor") {
        const emailCode = attempt.supportedSecondFactors?.find((factor) => factor.strategy === "email_code");
        if (!emailCode) {
          fail("form", "This account needs a verification step that is not available here. Contact support.");
          return;
        }
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setCode("");
        setStep("code");
        setNotice("We emailed you a code to finish signing in.");
        return;
      }
      if (attempt.status === "needs_new_password") {
        setStep("new-password");
        setNotice("Your account needs a new password.");
        return;
      }
      fail("form", "We could not complete that sign-in. Please try again.");
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signIn) return;
    const codeError = validateCode(code);
    if (codeError) return fail("code", codeError);
    setErrors({});
    setBusy(true);
    try {
      const attempt = await signIn.attemptSecondFactor({ strategy: "email_code", code: code.replace(/\s+/g, "") });
      if (await activateIfComplete(attempt.status, attempt.createdSessionId)) return;
      fail("form", "That code did not finish the sign-in. Try again, or request a new code.");
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleResetRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signIn) return;
    const identifierError = validateIdentifier(identifier);
    if (identifierError) return fail("identifier", identifierError);
    setErrors({});
    setBusy(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: identifier.trim() });
      setCode("");
      setStep("reset-code");
      setNotice("We emailed you a code to reset your password.");
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleResetCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signIn) return;
    const codeError = validateCode(code);
    if (codeError) return fail("code", codeError);
    setErrors({});
    setBusy(true);
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.replace(/\s+/g, ""),
      });
      if (attempt.status === "needs_new_password") {
        setNewPassword("");
        setStep("new-password");
        setNotice("Choose a new password.");
        return;
      }
      if (await activateIfComplete(attempt.status, attempt.createdSessionId)) return;
      fail("form", "That code was accepted but the flow stalled. Start again.");
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleNewPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signIn) return;
    const passwordError = validatePassword(newPassword);
    if (passwordError) return fail("password", passwordError);
    setErrors({});
    setBusy(true);
    try {
      const attempt = await signIn.resetPassword({ password: newPassword });
      if (await activateIfComplete(attempt.status, attempt.createdSessionId)) return;
      fail("form", "The password was set but we could not sign you in. Try signing in again.");
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (!signIn) return;
    setErrors({});
    setBusy(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/`,
      });
    } catch (error) {
      reportError(error);
      setBusy(false);
    }
  };

  const backToCredentials = () => {
    setStep("credentials");
    setCode("");
    setNewPassword("");
    setErrors({});
    setNotice("");
  };

  // Clerk unreachable used to mean three grey bars forever, with no fields to fill in.
  if (!isLoaded) return <AuthServiceLoading />;

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="mr-1 flex h-11 w-11 items-center justify-center rounded-lg text-falla-ink/65 hover:text-falla-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-falla-fire"
    >
      {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
    </button>
  );

  if (step === "code") {
    return (
      <form className="space-y-4" onSubmit={handleCode} noValidate>
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
          Verify and continue
        </AuthSubmit>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AuthLinkButton onClick={backToCredentials}>Start over</AuthLinkButton>
          <AuthLinkButton
            onClick={async () => {
              if (!signIn) return;
              try {
                await signIn.prepareSecondFactor({ strategy: "email_code" });
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

  if (step === "reset-request" || step === "reset-code" || step === "new-password") {
    const isRequest = step === "reset-request";
    const isCode = step === "reset-code";
    return (
      <form className="space-y-4" onSubmit={isRequest ? handleResetRequest : isCode ? handleResetCode : handleNewPassword} noValidate>
        {notice && <AuthAlert message={notice} tone="info" />}
        {isRequest && (
          <AuthField
            id="reset-identifier"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={identifier}
            onChange={setIdentifier}
            error={errors.identifier}
            placeholder="you@example.com"
            autoFocus
          />
        )}
        {isCode && (
          <AuthField
            id="reset-code"
            label="Reset code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={setCode}
            error={errors.code}
            placeholder="123456"
            autoFocus
          />
        )}
        {step === "new-password" && (
          <AuthField
            id="new-password"
            label="New password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={setNewPassword}
            error={errors.password}
            hint="At least 8 characters."
            trailing={passwordToggle}
            autoFocus
          />
        )}
        {errors.form && <AuthAlert message={errors.form} />}
        <AuthSubmit isLoading={busy} loadingLabel="Working…">
          {isRequest ? "Email me a reset code" : isCode ? "Verify code" : "Set new password"}
        </AuthSubmit>
        <AuthLinkButton onClick={backToCredentials}>Back to sign in</AuthLinkButton>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleCredentials} noValidate>
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
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        disabled={busy}
        trailing={passwordToggle}
      />
      {errors.form && <AuthAlert message={errors.form} />}
      <AuthSubmit isLoading={busy} loadingLabel="Signing in…">
        Sign in
      </AuthSubmit>
      <div className="text-center">
        <AuthLinkButton onClick={() => { setErrors({}); setNotice(""); setStep("reset-request"); }}>
          Forgot your password?
        </AuthLinkButton>
      </div>
    </form>
  );
}
