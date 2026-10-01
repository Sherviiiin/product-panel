import {
  useEffect,
} from "react"

import {
  useForm,
} from "@tanstack/react-form"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import type {
  SellerListedProduct,
  UpdateSellerListingInput,
} from "../dashboard.schema"

import {
  updateSellerListingSchema,
} from "../dashboard.schema"

import {
  dashboardKeys,
} from "../queries/dashboard.query"

import {
  updateSellerListing,
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
  product: SellerListedProduct | null

  open: boolean

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
    (
      error,
      index,
    ) => {
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

export function SellerListingEditDialog({
  product,
  open,
  onOpenChange,
}: Props) {
  const queryClient =
    useQueryClient()

  const mutation =
    useMutation({
      mutationFn: (
        data: UpdateSellerListingInput,
      ) =>
        updateSellerListing({
          data,
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            dashboardKeys.all,
        })

        onOpenChange(false)
      },
    })

  const form = useForm({
    defaultValues: {
      listingId:
        product?.listingId ?? 0,

      price:
        product?.price ?? 0,

      discountPrice:
        product?.discountPrice ??
        null,

      stock:
        product?.stock ?? 0,

      url:
        product?.url ?? "",
    },

    validators: {
      //onChange:
      //  updateSellerListingSchema,

      onSubmit:
        updateSellerListingSchema,
    },

    onSubmit: async ({
      value,
    }) => {
      await mutation.mutateAsync(
        value,
      )
    },
  })

  useEffect(() => {
    if (!product) {
      return
    }

    mutation.reset()

    form.reset({
      listingId:
        product.listingId,

      price:
        product.price,

      discountPrice:
        product.discountPrice,

      stock:
        product.stock,

      url:
        product.url,
    })
  }, [
    product,
    form,
  ])

  function closeDialog() {
    mutation.reset()

    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(
        value,
      ) => {
        if (!value) {
          closeDialog()

          return
        }

        onOpenChange(true)
      }}
    >
      <DialogContent
        dir="rtl"
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>
            ویرایش اطلاعات فروش
          </DialogTitle>

          <DialogDescription>
            {product?.name}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()

            form.handleSubmit()
          }}
        >
          {/* Price */}
          <form.Field
            name="price"
          >
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  قیمت
                </label>

                <Input
                  type="number"
                  min={1}
                  value={
                    field.state.value
                  }
                  onBlur={
                    field.handleBlur
                  }
                  onChange={(event) =>
                    field.handleChange(
                      Number(
                        event.target
                          .value,
                      ),
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

          {/* Discount */}
          <form.Field
            name="discountPrice"
          >
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  قیمت با تخفیف
                </label>

                <Input
                  type="number"
                  min={1}
                  value={
                    field.state.value ??
                    ""
                  }
                  placeholder="بدون تخفیف"
                  onBlur={
                    field.handleBlur
                  }
                  onChange={(event) =>
                    field.handleChange(
                      event.target.value ===
                        ""
                        ? null
                        : Number(
                            event.target
                              .value,
                          ),
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

          {/* Stock */}
          <form.Field
            name="stock"
          >
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  موجودی
                </label>

                <Input
                  type="number"
                  min={0}
                  value={
                    field.state.value
                  }
                  onBlur={
                    field.handleBlur
                  }
                  onChange={(event) =>
                    field.handleChange(
                      Number(
                        event.target
                          .value,
                      ),
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

          {/* URL */}
          <form.Field
            name="url"
          >
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  لینک فروش
                </label>

                <Input
                  dir="ltr"
                  value={
                    field.state.value
                  }
                  onBlur={
                    field.handleBlur
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

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {mutation.error instanceof
              Error
                ? mutation.error.message
                : "خطا در ذخیره تغییرات."}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={
                closeDialog
              }
            >
              انصراف
            </Button>

            <form.Subscribe
              selector={(
                state,
              ) =>
                state.canSubmit
              }
            >
              {(canSubmit) => (
                <Button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    mutation.isPending
                  }
                >
                  {mutation.isPending
                    ? "در حال ذخیره..."
                    : "ذخیره تغییرات"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}