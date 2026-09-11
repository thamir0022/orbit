"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { signInApi } from "./api/sign-in.api";
import { signInSchema, type SignInFormData } from "./schema/sign-in.schema";

import { Button } from "@orbit/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@orbit/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@orbit/ui/components/field";
import { Input } from "@orbit/ui/components/input";
import { useRouter } from "next/navigation";

const FORM_ID = "admin-signin-form";

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormData) => {
    form.clearErrors("root");
    const response = await signInApi(values);

    if (!response.success) {
      form.setError("root", {
        type: "server",
        message: response.message,
      });
      return;
    }

    router.replace("/dashboard");

    form.reset();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Administrator Sign In</CardTitle>
        <CardDescription>
          Enter your administrator credentials to continue.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signin-email">Email</FieldLabel>

                  <Input
                    {...field}
                    id="signin-email"
                    type="email"
                    placeholder="admin@example.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
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
                  <FieldLabel htmlFor="signin-password">Password</FieldLabel>

                  <div className="relative">
                    <Input
                      {...field}
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      className="pr-10"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                      onClick={() => setShowPassword((previous) => !previous)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {form.formState.errors.root?.message && (
            <Field data-invalid>
              <FieldError
                errors={[
                  {
                    message: form.formState.errors.root.message,
                  },
                ]}
              />
            </Field>
          )}
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Reset
          </Button>

          <Button
            type="submit"
            form={FORM_ID}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Sign In
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
};

export default SignInForm;
