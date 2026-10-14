import AuthPageShell from "@/components/AuthPageShell";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <AuthPageShell mode="sign-in">
      <SignInForm />
    </AuthPageShell>
  );
}
