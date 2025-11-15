"use client";

import { LogoIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "./ui/spinner";
import { resetPasswordSchema } from "@/lib/validations/auth";
import type { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { BetterAuthError } from "better-auth";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setServerError(null);
    setIsPending(true);
    setIsSuccess(false);

    if (!token) {
      setServerError("Reset token is missing. Please use the link from your email.");
      setIsPending(false);
      return;
    }

    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token: token,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      if (error instanceof BetterAuthError) {
        setServerError(error.message);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
        <div className="p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home">
              <LogoIcon />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Reset Password</h1>
            <p className="text-sm">Enter your new password</p>
          </div>

          {serverError && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="mt-6">
              <CheckCircle2 className="w-4 h-4" />
              <AlertTitle>Password Reset</AlertTitle>
              <AlertDescription>
                Your password has been reset successfully. Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          {!isSuccess && (
            <>
              <form
                id="reset-password-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-6"
              >
                <FieldGroup>
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="reset-password-new">
                          New Password
                        </FieldLabel>
                        <Input
                          {...field}
                          id="reset-password-new"
                          type="password"
                          aria-invalid={fieldState.invalid}
                          autoComplete="new-password"
                        />
                        <FieldDescription>
                          Must be at least 8 characters with uppercase, lowercase,
                          and a number.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="confirmPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="reset-password-confirm">
                          Confirm Password
                        </FieldLabel>
                        <Input
                          {...field}
                          id="reset-password-confirm"
                          type="password"
                          aria-invalid={fieldState.invalid}
                          autoComplete="new-password"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>

              <Button
                type="submit"
                form="reset-password-form"
                className="mt-6 w-full"
                disabled={isPending}
              >
                {isPending ? <Spinner /> : "Reset Password"}
              </Button>
            </>
          )}
        </div>

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Remember your password?
            <Button asChild variant="link" className="px-2">
              <Link href="/login">Log in</Link>
            </Button>
          </p>
        </div>
      </div>
    </section>
  );
}

