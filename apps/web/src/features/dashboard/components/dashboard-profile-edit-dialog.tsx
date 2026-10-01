import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  useForm,
} from "@tanstack/react-form"

import type {
  DashboardProfile,
  UpdateSellerDashboardProfileInput,
  UpdateUserDashboardProfileInput,
} from "../dashboard.schema"

import {
  updateSellerDashboardProfileSchema,
  updateUserDashboardProfileSchema,
} from "../dashboard.schema"

import {
  dashboardKeys,
  dashboardProfileQuery,
} from "../queries/dashboard.query"

import {
  updateDashboardSellerProfile,
  updateDashboardUserProfile,
} from "../server/functions/dashboard.functions"

import {
  Button,
} from "@/components/ui/button"

import {
  Input,
} from "@/components/ui/input"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  open: boolean
  isSeller: boolean

  onOpenChange: (
    open: boolean,
  ) => void
}

function FieldErrors({
  errors,
}: {
  errors: readonly unknown[]
}) {
  return errors.map(
    (error, index) => {
      if (!error) {
        return null
      }

      const message =
        typeof error ===
          "object" &&
        error !== null &&
        "message" in error
          ? String(
              error.message,
            )
          : String(error)

      return (
        <p
          key={index}
          className="text-xs text-destructive"
        >
          {message}
        </p>
      )
    },
  )
}

function mutationErrorMessage(
  error: unknown,
) {
  if (
    error instanceof Error &&
    error.message ===
      "USERNAME_TAKEN"
  ) {
    return "این نام کاربری قبلاً استفاده شده است."
  }

  return "ذخیره اطلاعات انجام نشد."
}

export function DashboardProfileEditDialog({
  open,
  isSeller,
  onOpenChange,
}: Props) {
  const profileQuery =
    useQuery({
      ...dashboardProfileQuery(),

      enabled: open,
    })

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent
        dir="rtl"
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>
            ویرایش پروفایل
          </DialogTitle>

          <DialogDescription>
            اطلاعات پروفایل خود را ویرایش کنید.
          </DialogDescription>
        </DialogHeader>

        {profileQuery.isPending ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            در حال دریافت اطلاعات...
          </div>
        ) : profileQuery.isError ? (
          <p className="text-sm text-destructive">
            دریافت اطلاعات پروفایل انجام نشد.
          </p>
        ) : profileQuery.data ? (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">
                  ایمیل:
                </span>{" "}

                {
                  profileQuery.data
                    .email
                }
              </div>

              <div>
                <span className="text-muted-foreground">
                  شماره تماس:
                </span>{" "}

                {
                  profileQuery.data
                    .phone
                }
              </div>
            </div>

            {isSeller ? (
              <SellerProfileForm
                profile={
                  profileQuery.data
                }
                onSuccess={() =>
                  onOpenChange(
                    false,
                  )
                }
              />
            ) : (
              <UserProfileForm
                profile={
                  profileQuery.data
                }
                onSuccess={() =>
                  onOpenChange(
                    false,
                  )
                }
              />
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function UserProfileForm({
  profile,
  onSuccess,
}: {
  profile: DashboardProfile
  onSuccess: () => void
}) {
  const queryClient =
    useQueryClient()

  const mutation =
    useMutation({
      mutationFn: (
        data: UpdateUserDashboardProfileInput,
      ) =>
        updateDashboardUserProfile({
          data,
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            dashboardKeys.profile,
        })

        onSuccess()
      },
    })

  const form =
    useForm({
      defaultValues: {
        fullName:
          profile.fullName,

        username:
          profile.username,

        avatar:
          profile.avatar ??
          "",

        cityId:
          profile.cityId,
      },

      validators: {
        onSubmit:
          updateUserDashboardProfileSchema,
      },

      onSubmit: async ({
        value,
      }) => {
        await mutation.mutateAsync(
          value,
        )
      },
    })

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()

        form.handleSubmit()
      }}
    >
      <form.Field
        name="fullName"
      >
        {(field) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              نام و نام خانوادگی
            </label>

            <Input
              value={
                field.state.value
              }
              onChange={(event) =>
                field.handleChange(
                  event.target.value,
                )
              }
            />

            <FieldErrors
              errors={
                field.state.meta
                  .errors
              }
            />
          </div>
        )}
      </form.Field>

      <form.Field
        name="username"
      >
        {(field) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              نام کاربری
            </label>

            <Input
              dir="ltr"
              value={
                field.state.value
              }
              onChange={(event) =>
                field.handleChange(
                  event.target.value,
                )
              }
            />

            <FieldErrors
              errors={
                field.state.meta
                  .errors
              }
            />
          </div>
        )}
      </form.Field>

      <form.Field
        name="avatar"
      >
        {(field) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              لینک تصویر پروفایل
            </label>

            <Input
              dir="ltr"
              placeholder="اختیاری"
              value={
                field.state.value
              }
              onChange={(event) =>
                field.handleChange(
                  event.target.value,
                )
              }
            />

            <FieldErrors
              errors={
                field.state.meta
                  .errors
              }
            />
          </div>
        )}
      </form.Field>

      <form.Field
        name="cityId"
      >
        {(field) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              شهر
            </label>

            <select
              value={
                field.state.value ??
                ""
              }
              onChange={(event) =>
                field.handleChange(
                  event.target
                    .value === ""
                    ? null
                    : Number(
                        event.target
                          .value,
                      ),
                )
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">
                انتخاب نشده
              </option>

              {profile.cities.map(
                (city) => (
                  <option
                    key={city.id}
                    value={city.id}
                  >
                    {city.province} -{" "}
                    {city.city}
                  </option>
                ),
              )}
            </select>
          </div>
        )}
      </form.Field>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {mutationErrorMessage(
            mutation.error,
          )}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={
            mutation.isPending
          }
        >
          {mutation.isPending
            ? "در حال ذخیره..."
            : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  )
}

function SellerProfileForm({
  profile,
  onSuccess,
}: {
  profile: DashboardProfile
  onSuccess: () => void
}) {
  const queryClient =
    useQueryClient()

  const seller =
    profile.seller

  if (!seller) {
    return (
      <p className="text-sm text-destructive">
        پروفایل فروشنده پیدا نشد.
      </p>
    )
  }

  const mutation =
    useMutation({
      mutationFn: (
        data: UpdateSellerDashboardProfileInput,
      ) =>
        updateDashboardSellerProfile({
          data,
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            dashboardKeys.profile,
        })

        onSuccess()
      },
    })

  const form =
    useForm({
      defaultValues: {
        fullName:
          profile.fullName,

        username:
          profile.username,

        avatar:
          profile.avatar ??
          "",

        cityId:
          profile.cityId,

        shopName:
          seller.shopName,

        sellerAvatar:
          seller.avatar ??
          "",

        sellerCityId:
          seller.cityId,

        sellerTypeId:
          seller.sellerTypeId,
      },

      validators: {
        onSubmit:
          updateSellerDashboardProfileSchema,
      },

      onSubmit: async ({
        value,
      }) => {
        await mutation.mutateAsync(
          value,
        )
      },
    })

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()

        form.handleSubmit()
      }}
    >
      <div className="space-y-4">
        <p className="text-sm font-semibold">
          اطلاعات حساب
        </p>

        <form.Field
          name="fullName"
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                نام و نام خانوادگی
              </label>

              <Input
                value={
                  field.state.value
                }
                onChange={(event) =>
                  field.handleChange(
                    event.target
                      .value,
                  )
                }
              />

              <FieldErrors
                errors={
                  field.state.meta
                    .errors
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="username"
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                نام کاربری
              </label>

              <Input
                dir="ltr"
                value={
                  field.state.value
                }
                onChange={(event) =>
                  field.handleChange(
                    event.target
                      .value,
                  )
                }
              />

              <FieldErrors
                errors={
                  field.state.meta
                    .errors
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="avatar"
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                لینک تصویر پروفایل
              </label>

              <Input
                dir="ltr"
                placeholder="اختیاری"
                value={
                  field.state.value
                }
                onChange={(event) =>
                  field.handleChange(
                    event.target
                      .value,
                  )
                }
              />

              <FieldErrors
                errors={
                  field.state.meta
                    .errors
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="cityId"
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                شهر
              </label>

              <select
                value={
                  field.state
                    .value ?? ""
                }
                onChange={(event) =>
                  field.handleChange(
                    event.target
                      .value === ""
                      ? null
                      : Number(
                          event
                            .target
                            .value,
                        ),
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">
                  انتخاب نشده
                </option>

                {profile.cities.map(
                  (city) => (
                    <option
                      key={city.id}
                      value={
                        city.id
                      }
                    >
                      {
                        city.province
                      }{" "}
                      - {city.city}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}
        </form.Field>
      </div>

      <div className="space-y-4 border-t pt-5">
        <p className="text-sm font-semibold">
          اطلاعات فروشگاه
        </p>

        <form.Field
          name="shopName"
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                نام فروشگاه
              </label>

              <Input
                value={
                  field.state.value
                }
                onChange={(event) =>
                  field.handleChange(
                    event.target
                      .value,
                  )
                }
              />

              <FieldErrors
                errors={
                  field.state.meta
                    .errors
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="sellerAvatar"
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                لینک تصویر فروشگاه
              </label>

              <Input
                dir="ltr"
                placeholder="اختیاری"
                value={
                  field.state.value
                }
                onChange={(event) =>
                  field.handleChange(
                    event.target
                      .value,
                  )
                }
              />

              <FieldErrors
                errors={
                  field.state.meta
                    .errors
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="sellerCityId"
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                شهر فروشگاه
              </label>

              <select
                value={
                  field.state
                    .value ?? ""
                }
                onChange={(event) =>
                  field.handleChange(
                    event.target
                      .value === ""
                      ? null
                      : Number(
                          event
                            .target
                            .value,
                        ),
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">
                  انتخاب نشده
                </option>

                {profile.cities.map(
                  (city) => (
                    <option
                      key={city.id}
                      value={
                        city.id
                      }
                    >
                      {
                        city.province
                      }{" "}
                      - {city.city}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}
        </form.Field>

        <form.Field
          name="sellerTypeId"
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                نوع فروشنده
              </label>

              <select
                value={
                  field.state.value
                }
                onChange={(event) =>
                  field.handleChange(
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {profile.sellerTypes.map(
                  (type) => (
                    <option
                      key={type.id}
                      value={
                        type.id
                      }
                    >
                      {type.name}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}
        </form.Field>
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {mutationErrorMessage(
            mutation.error,
          )}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={
            mutation.isPending
          }
        >
          {mutation.isPending
            ? "در حال ذخیره..."
            : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  )
}