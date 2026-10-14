import AuthPageShell from "@/components/AuthPageShell";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthPageShell mode="sign-up">
      <SignUpForm />
    </AuthPageShell>
  );
}
