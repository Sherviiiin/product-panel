import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"

import { useQueryClient } from "@tanstack/react-query"
import { authKeys } from "@/features/auth/queries/auth.query"

import { registerSchema } from "@/features/auth/auth.schema"
import { register } from "@/features/auth/server/functions/auth.functions"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
})

const sellerTypeOptions = [
  { value: 1, label: "آنلاین" },
  { value: 2, label: "حضوری" },
] as const

const defaultValues = {
  role: "normal" as "normal" | "seller",
  fullName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  shopName: "",
  sellerTypeId: 1,
}

function RegisterPage() {
  const queryClient = useQueryClient()
  
  const navigate = useNavigate()

  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm({
    defaultValues,

    validators: {
      onSubmit: registerSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        setServerError(null)

        const data = registerSchema.parse(value)

        const user = await register({ data })

        queryClient.setQueryData(
          authKeys.currentUser(),
          user,
        )

        await navigate({ to: "/" })

      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "EMAIL_ALREADY_EXISTS") {
            setServerError("این ایمیل قبلاً ثبت شده است")
            return
          }

          if (error.message === "PHONE_ALREADY_EXISTS") {
            setServerError("این شماره تلفن قبلاً ثبت شده است")
            return
          }

          if (error.message === "USERNAME_ALREADY_EXISTS") {
            setServerError("این نام کاربری قبلاً ثبت شده است")
            return
          }
        }

        setServerError("ثبت‌نام انجام نشد")
      }
    },
  })

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">
        ثبت‌نام
      </h1>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()

          form.handleSubmit()
        }}
      >
        {/* Role */}
        <form.Field
          name="role"
          children={(field) => (
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
        />

        {/* Full name */}
        <form.Field
          name="fullName"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                نام و نام خانوادگی
              </Label>

              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />

              <FieldErrors
                errors={field.state.meta.errors}
              />
            </div>
          )}
        />

        {/* Username */}
        <form.Field
          name="username"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                نام کاربری
              </Label>

              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />

              <FieldErrors
                errors={field.state.meta.errors}
              />
            </div>
          )}
        />

        {/* Email */}
        <form.Field
          name="email"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                ایمیل
              </Label>

              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />

              <FieldErrors
                errors={field.state.meta.errors}
              />
            </div>
          )}
        />

        {/* Phone */}
        <form.Field
          name="phone"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                شماره تلفن
              </Label>

              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />

              <FieldErrors
                errors={field.state.meta.errors}
              />
            </div>
          )}
        />

        {/* Password */}
        <form.Field
          name="password"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                رمز عبور
              </Label>

              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />

              <FieldErrors
                errors={field.state.meta.errors}
              />
            </div>
          )}
        />

        {/* Confirm password */}
        <form.Field
          name="confirmPassword"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                تکرار رمز عبور
              </Label>

              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />

              <FieldErrors
                errors={field.state.meta.errors}
              />
            </div>
          )}
        />

        {/* Seller-only fields */}
        <form.Subscribe
          selector={(state) => state.values.role}
          children={(role) => role === "seller" ? (
              <>
                <form.Field
                  name="shopName"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>
                        نام فروشگاه
                      </Label>

                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />

                      <FieldErrors
                        errors={field.state.meta.errors}
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="sellerTypeId"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label>
                        نوع فروشنده
                      </Label>

                      <div className="grid grid-cols-2 gap-2">
                        {sellerTypeOptions.map(
                          (sellerType) => (
                            <Button
                              key={sellerType.value}
                              type="button"
                              variant={field.state.value === sellerType.value ? "default" : "outline"}
                              onClick={() => field.handleChange(sellerType.value)}
                            >
                              {sellerType.label}
                            </Button>
                          ),
                        )}
                      </div>

                      <FieldErrors
                        errors={field.state.meta.errors}
                      />
                    </div>
                  )}
                />
              </>
            ) : null
          }
        />

        {serverError && (
          <p className="text-sm text-destructive">
            {serverError}
          </p>
        )}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting,]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "در حال ثبت‌نام..." : "ثبت‌نام"}
            </Button>
          )}
        />

        <Link
          to="/auth/login"
          className={buttonVariants({
            variant: "link",
          })}
        >
          حساب دارید؟ ورود
        </Link>
      </form>
    </main>
  )
}

function FieldErrors({errors,}: {errors: readonly unknown[]}) {
  return errors.map((error, index) => {
    if (!error) {
      return null
    }

    let message = String(error)

    if (
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      message = error.message
    }

    return (
      <p
        key={index}
        className="text-sm text-destructive"
      >
        {message}
      </p>
    )
  })
}