
"use client";

import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export default function ChangePasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary inline-flex items-center">
          <KeyRound className="mr-3 h-8 w-8 text-accent" />
          Change Your Password
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Update your password below. Choose a strong, unique password.
        </p>
      </div>

      <Card className="mx-auto max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Enter your current password and then your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
