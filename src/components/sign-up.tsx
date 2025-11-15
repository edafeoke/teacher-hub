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
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "./ui/spinner";
import { signUpSchema } from "@/lib/validations/auth";
import type { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { BetterAuthError } from "better-auth";

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignUpFormData) {
    setServerError(null);
    setIsPending(true);

    try {
      const { error } = await authClient.signUp.email({
        name: `${data.firstname} ${data.lastname}`,
        email: data.email,
        password: data.password,
        callbackURL: "/onboarding",
      });

      if (error) {
        throw error;
      }

      // // Redirect to login on success
      router.push("/onboarding");
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
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Create a TeacherHub Account
            </h1>
            <p className="text-sm">Welcome! Create an account to get started</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button type="button" variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285f4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34a853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#fbbc05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                ></path>
                <path
                  fill="#eb4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              <span>Google</span>
            </Button>
            <Button type="button" variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 256 256"
              >
                <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z"></path>
                <path fill="#80cc28" d="M256 121.666H134.335V0H256z"></path>
                <path
                  fill="#00adef"
                  d="M121.663 256.002H0V134.336h121.663z"
                ></path>
                <path
                  fill="#fbbc09"
                  d="M256 256.002H134.335V134.336H256z"
                ></path>
              </svg>
              <span>Microsoft</span>
            </Button>
          </div>

          <hr className="my-4 border-dashed" />

          {serverError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="firstname"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-firstname">
                        Firstname
                      </FieldLabel>
                      <Input
                        {...field}
                        id="signup-firstname"
                        type="text"
                        aria-invalid={fieldState.invalid}
                        autoComplete="given-name"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="lastname"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-lastname">
                        Lastname
                      </FieldLabel>
                      <Input
                        {...field}
                        id="signup-lastname"
                        type="text"
                        aria-invalid={fieldState.invalid}
                        autoComplete="family-name"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="signup-email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="signup-password"
                      type="password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                      className="input sz-md variant-mixed"
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
            </FieldGroup>
          </form>

          <Button
            type="submit"
            form="signup-form"
            className="mt-6 w-full"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : "Continue"}
          </Button>
        </div>

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Have an account ?
            <Button asChild variant="link" className="px-2">
              <Link href="/login">Sign In</Link>
            </Button>
          </p>
        </div>
      </div>
    </section>
  );
}
