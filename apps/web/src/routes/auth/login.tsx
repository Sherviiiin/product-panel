import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/queries/auth.query";

import { loginSchema, type LoginInput } from "@/features/auth/auth.schema";
import { login } from "@/features/auth/server/functions/auth.functions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

const defaultValues: LoginInput = {
  role: "normal",
  email: "",
  password: "",
};

function LoginPage() {
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues,

    validators: {
      onSubmit: loginSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        setServerError(null);

        const user = await login({
          data: value,
        });

        queryClient.setQueryData(authKeys.currentUser(), user);

        await navigate({
          to: "/",
        });
      } catch (error) {
        if (error instanceof Error && error.message === "ACCOUNT_NOT_ACTIVE") {
          setServerError("حساب کاربری فعال نیست");
          return;
        }

        setServerError("ایمیل، رمز عبور یا نقش اشتباه است");
      }
    },
  });

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">ورود</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <form.Field name="role">
          {(field) => (
            <div className="space-y-2">
              <Label>نوع حساب</Label>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={field.state.value === "normal" ? "default" : "outline"}
                  onClick={() => field.handleChange("normal")}
                >
                  کاربر
                </Button>

                <Button
                  type="button"
                  variant={field.state.value === "seller" ? "default" : "outline"}
                  onClick={() => field.handleChange("seller")}
                >
                  فروشنده
                </Button>
              </div>
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>ایمیل</Label>

              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />

              {field.state.meta.errors.map((error) => {
                if (!error) return null;

                return (
                  <p key={error.message} className="text-sm text-destructive">
                    {error.message}
                  </p>
                );
              })}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>رمز عبور</Label>

              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />

              {field.state.meta.errors.map((error) => {
                if (!error) return null;

                return (
                  <p key={error.message} className="text-sm text-destructive">
                    {error.message}
                  </p>
                );
              })}
            </div>
          )}
        </form.Field>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "در حال ورود..." : "ورود"}
            </Button>
          )}
        </form.Subscribe>

        <Link
          to="/auth/register"
          className={buttonVariants({
            variant: "link",
          })}
        >
          حساب ندارید؟ ثبت‌نام
        </Link>
      </form>
    </main>
  );
}
