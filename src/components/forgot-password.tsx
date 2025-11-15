"use client";

import { LogoIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "./ui/spinner";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import type { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { BetterAuthError } from "better-auth";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setServerError(null);
    setIsPending(true);
    setIsSuccess(false);

    try {
      const { error } = await authClient.forgotPassword({
        email: data.email,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      form.reset();
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
      <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home">
              <LogoIcon />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Recover Password
            </h1>
            <p className="text-sm">Enter your email to receive a reset link</p>
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
              <AlertTitle>Email Sent</AlertTitle>
              <AlertDescription>
                If an account exists with this email, we've sent a password reset
                link.
              </AlertDescription>
            </Alert>
          )}

          {!isSuccess && (
            <>
              <form
                id="forgot-password-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-6"
              >
                <FieldGroup>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="forgot-password-email">
                          Email
                        </FieldLabel>
                        <Input
                          {...field}
                          id="forgot-password-email"
                          type="email"
                          aria-invalid={fieldState.invalid}
                          autoComplete="email"
                          placeholder="name@example.com"
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
                form="forgot-password-form"
                className="mt-6 w-full"
                disabled={isPending}
              >
                {isPending ? <Spinner /> : "Send Reset Link"}
              </Button>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              We'll send you a link to reset your password.
            </p>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Remembered your password?
            <Button asChild variant="link" className="px-2">
              <Link href="/login">Log in</Link>
            </Button>
          </p>
        </div>
      </div>
    </section>
  );
}
