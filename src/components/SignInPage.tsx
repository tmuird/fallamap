import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-6 py-8 shadow-md rounded-lg">
        <SignIn />
      </div>
    </div>
  );
}
