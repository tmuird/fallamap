import { SignIn } from "@clerk/react";
import AuthPageShell from "@/components/AuthPageShell";
import AuthWidgetFallback from "@/components/AuthWidgetFallback";
import { AUTH_APPEARANCE } from "@/lib/authAppearance";

export default function SignInPage() {
  return (
    <AuthPageShell mode="sign-in">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        appearance={AUTH_APPEARANCE}
        fallback={<AuthWidgetFallback label="Preparing secure sign-in…" />}
      />
    </AuthPageShell>
  );
}
