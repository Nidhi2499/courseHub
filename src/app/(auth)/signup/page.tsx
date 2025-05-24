import AuthLayout from "@/components/layout/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout>
      <h2 className="mb-6 text-center text-3xl font-bold tracking-tight text-foreground">
        Create your Account
      </h2>
      <SignupForm />
    </AuthLayout>
  );
}
