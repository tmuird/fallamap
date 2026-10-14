import { SignUp } from "@clerk/react";
import AuthPageShell from "@/components/AuthPageShell";
import AuthStepGuard from "@/components/AuthStepGuard";
import AuthWidgetFallback from "@/components/AuthWidgetFallback";
import { AUTH_APPEARANCE } from "@/lib/authAppearance";

export default function SignUpPage() {
  return (
    <AuthPageShell mode="sign-up">
      <AuthStepGuard mode="sign-up">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
          signInFallbackRedirectUrl="/"
          appearance={AUTH_APPEARANCE}
          fallback={<AuthWidgetFallback label="Preparing secure account creation…" />}
        />
      </AuthStepGuard>
    </AuthPageShell>
  );
}
