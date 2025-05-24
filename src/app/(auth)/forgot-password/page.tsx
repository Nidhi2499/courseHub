import AuthLayout from "@/components/layout/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-foreground">
        Forgot Password?
      </h2>
      <p className="mb-6 text-center text-muted-foreground">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
