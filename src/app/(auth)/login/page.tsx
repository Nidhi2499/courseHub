import AuthLayout from "@/components/layout/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="mb-6 text-center text-3xl font-bold tracking-tight text-foreground">
        Welcome Back
      </h2>
      <LoginForm />
    </AuthLayout>
  );
}
