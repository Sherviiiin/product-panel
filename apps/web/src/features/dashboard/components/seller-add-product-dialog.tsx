import {
  useState,
} from "react"

import {
  useForm,
} from "@tanstack/react-form"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  Check,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import {
  createSellerListingSchema,
  createSellerProductSchema,
} from "../dashboard.schema"

import {
  dashboardKeys,
  sellerProductCategoriesQuery,
  sellerProductSearchQuery,
} from "../queries/dashboard.query"

import {
  createSellerListing,
  createSellerProduct,
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

  onOpenChange: (
    open: boolean,
  ) => void
}

type Mode =
  | "existing"
  | "new"

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

export function SellerAddProductDialog({
  open,
  onOpenChange,
}: Props) {
  const queryClient =
    useQueryClient()

  const [
    mode,
    setMode,
  ] =
    useState<Mode>(
      "existing",
    )

  const [
    searchText,
    setSearchText,
  ] = useState("")

  const [
    search,
    setSearch,
  ] = useState("")

  const searchQuery =
    useQuery({
      ...sellerProductSearchQuery(
        search,
      ),

      enabled:
        open &&
        mode === "existing" &&
        search.length > 0,
    })

  const categoriesQuery =
    useQuery({
      ...sellerProductCategoriesQuery(),

      enabled:
        open &&
        mode === "new",
    })

  const existingMutation =
    useMutation({
      mutationFn:
        createSellerListing,

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            dashboardKeys.all,
        })

        existingForm.reset()

        setSearch("")
        setSearchText("")

        onOpenChange(false)
      },
    })

  const newMutation =
    useMutation({
      mutationFn:
        createSellerProduct,

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            dashboardKeys.all,
        })

        newProductForm.reset()

        onOpenChange(false)
      },
    })

  const existingForm =
    useForm({
      defaultValues: {
        productId: 0,

        price: 0,

        discountPrice:
          null as number | null,

        stock: 0,

        url: "",
      },

      validators: {
        //onChange:
        //  createSellerListingSchema,

        onSubmit:
          createSellerListingSchema,
      },

      onSubmit: async ({
        value,
      }) => {
        await existingMutation.mutateAsync({
          data: value,
        })
      },
    })

  const newProductForm =
    useForm({
      defaultValues: {
        name: "",

        description:
          null as string | null,

        categoryIds:
          [] as number[],

        specs:
          [] as {
            key: string
            value: string
          }[],

        price: 0,

        discountPrice:
          null as number | null,

        stock: 0,

        url: "",
      },

      validators: {
        //onChange:
        //  createSellerProductSchema,

        onSubmit:
          createSellerProductSchema,
      },

      onSubmit: async ({
        value,
      }) => {
        await newMutation.mutateAsync({
          data: value,
        })
      },
    })

  function closeDialog() {
    onOpenChange(false)

    setSearch("")
    setSearchText("")

    existingForm.reset()
    newProductForm.reset()

    existingMutation.reset()
    newMutation.reset()
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
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>
            افزودن محصول
          </DialogTitle>

          <DialogDescription>
            محصول موجود را لیست کنید یا محصول جدید بسازید.
          </DialogDescription>
        </DialogHeader>

        {/* Mode */}
        <div className="grid grid-cols-2 overflow-hidden rounded-lg border">
          <button
            type="button"
            onClick={() =>
              setMode(
                "existing",
              )
            }
            className={`h-11 border-l text-sm font-medium transition-colors ${
              mode ===
              "existing"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            انتخاب محصول موجود
          </button>

          <button
            type="button"
            onClick={() =>
              setMode("new")
            }
            className={`h-11 text-sm font-medium transition-colors ${
              mode === "new"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            ساخت محصول جدید
          </button>
        </div>

        {mode ===
        "existing" ? (
          <div className="space-y-5">
            {/* Search */}
            <form
              className="flex gap-2"
              onSubmit={(
                event,
              ) => {
                event.preventDefault()

                setSearch(
                  searchText.trim(),
                )
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={
                    searchText
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearchText(
                      event.target
                        .value,
                    )
                  }
                  placeholder="نام محصول را جستجو کنید..."
                  className="pr-10"
                />
              </div>

              <Button type="submit">
                جستجو
              </Button>
            </form>

            {/* Search results */}
            {searchQuery.isPending &&
            search ? (
              <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                در حال جستجو...
              </div>
            ) : null}

            {search &&
            !searchQuery.isPending &&
            searchQuery.data
              ?.length === 0 ? (
              <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                محصولی پیدا نشد.
              </div>
            ) : null}

            {searchQuery.data &&
            searchQuery.data
              .length > 0 ? (
              <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border p-2">
                {searchQuery.data.map(
                  (product) => (
                    <existingForm.Subscribe
                      key={
                        product.id
                      }
                      selector={(
                        state,
                      ) =>
                        state.values
                          .productId
                      }
                    >
                      {(
                        selectedId,
                      ) => {
                        const selected =
                          selectedId ===
                          product.id

                        return (
                          <button
                            type="button"
                            onClick={() =>
                              existingForm.setFieldValue(
                                "productId",
                                product.id,
                              )
                            }
                            className={`flex w-full items-center justify-between rounded-md border p-3 text-right transition-colors ${
                              selected
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted"
                            }`}
                          >
                            <div>
                              <p className="font-medium">
                                {
                                  product.name
                                }
                              </p>

                              {product.description && (
                                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                  {
                                    product.description
                                  }
                                </p>
                              )}
                            </div>

                            {selected && (
                              <Check className="size-5 text-primary" />
                            )}
                          </button>
                        )
                      }}
                    </existingForm.Subscribe>
                  ),
                )}
              </div>
            ) : null}

            {/* Listing form */}
            <form
              className="space-y-4 border-t pt-5"
              onSubmit={(
                event,
              ) => {
                event.preventDefault()
                event.stopPropagation()

                existingForm.handleSubmit()
              }}
            >
              <existingForm.Field
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
                        field.state
                          .value
                      }
                      onBlur={
                        field.handleBlur
                      }
                      onChange={(
                        event,
                      ) =>
                        field.handleChange(
                          Number(
                            event
                              .target
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
              </existingForm.Field>

              <existingForm.Field
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
                        field.state
                          .value ??
                        ""
                      }
                      placeholder="اختیاری"
                      onBlur={
                        field.handleBlur
                      }
                      onChange={(
                        event,
                      ) =>
                        field.handleChange(
                          event.target
                            .value ===
                            ""
                            ? null
                            : Number(
                                event
                                  .target
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
              </existingForm.Field>

              <existingForm.Field
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
                        field.state
                          .value
                      }
                      onBlur={
                        field.handleBlur
                      }
                      onChange={(
                        event,
                      ) =>
                        field.handleChange(
                          Number(
                            event
                              .target
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
              </existingForm.Field>

              <existingForm.Field
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
                        field.state
                          .value
                      }
                      onBlur={
                        field.handleBlur
                      }
                      onChange={(
                        event,
                      ) =>
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
              </existingForm.Field>

              {existingMutation.isError && (
                <p className="text-sm text-destructive">
                  {existingMutation.error instanceof
                  Error
                    ? existingMutation.error
                        .message
                    : "خطا در افزودن محصول."}
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

                <existingForm.Subscribe
                  selector={(
                    state,
                  ) => [
                    state.canSubmit,
                    state.values
                      .productId,
                  ]}
                >
                  {([
                    canSubmit,
                    productId,
                  ]) => (
                    <Button
                      type="submit"
                      disabled={
                        !canSubmit ||
                        productId ===
                          0 ||
                        existingMutation.isPending
                      }
                    >
                      {existingMutation.isPending
                        ? "در حال افزودن..."
                        : "افزودن به محصولات من"}
                    </Button>
                  )}
                </existingForm.Subscribe>
              </div>
            </form>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(
              event,
            ) => {
              event.preventDefault()
              event.stopPropagation()

              newProductForm.handleSubmit()
            }}
          >
            {/* Name */}
            <newProductForm.Field
              name="name"
            >
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    نام محصول
                  </label>

                  <Input
                    value={
                      field.state
                        .value
                    }
                    onBlur={
                      field.handleBlur
                    }
                    onChange={(
                      event,
                    ) =>
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
            </newProductForm.Field>

            {/* Description */}
            <newProductForm.Field
              name="description"
            >
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    توضیحات
                  </label>

                  <textarea
                    value={
                      field.state
                        .value ??
                      ""
                    }
                    onBlur={
                      field.handleBlur
                    }
                    onChange={(
                      event,
                    ) =>
                      field.handleChange(
                        event.target
                          .value ||
                          null,
                      )
                    }
                    className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />

                  <FieldErrors
                    errors={
                      field.state.meta
                        .errors
                    }
                  />
                </div>
              )}
            </newProductForm.Field>

            {/* Categories */}
            <newProductForm.Field
              name="categoryIds"
            >
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    دسته‌بندی‌ها
                  </label>

                  {categoriesQuery.isPending ? (
                    <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
                      در حال دریافت دسته‌بندی‌ها...
                    </div>
                  ) : categoriesQuery.data &&
                    categoriesQuery.data
                      .length > 0 ? (
                    <div className="flex flex-wrap gap-2 rounded-md border p-3">
                      {categoriesQuery.data.map(
                        (
                          category,
                        ) => {
                          const selected =
                            field.state.value.includes(
                              category.id,
                            )

                          return (
                            <button
                              key={
                                category.id
                              }
                              type="button"
                              onClick={() => {
                                if (
                                  selected
                                ) {
                                  field.handleChange(
                                    field.state.value.filter(
                                      (
                                        id,
                                      ) =>
                                        id !==
                                        category.id,
                                    ),
                                  )

                                  return
                                }

                                field.handleChange(
                                  [
                                    ...field
                                      .state
                                      .value,

                                    category.id,
                                  ],
                                )
                              }}
                              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                            >
                              {
                                category.name
                              }
                            </button>
                          )
                        },
                      )}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                      دسته‌بندی‌ای وجود ندارد.
                    </div>
                  )}

                  <FieldErrors
                    errors={
                      field.state.meta
                        .errors
                    }
                  />
                </div>
              )}
            </newProductForm.Field>

            {/* Specs */}
            <newProductForm.Field
              name="specs"
              mode="array"
            >
              {(field) => (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <label className="text-sm font-medium">
                        مشخصات محصول
                      </label>

                      <p className="mt-1 text-xs text-muted-foreground">
                        مشخصاتی مثل رنگ، وزن، حافظه یا ابعاد را اضافه کنید.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1.5"
                      onClick={() =>
                        field.pushValue({
                          key: "",
                          value: "",
                        })
                      }
                    >
                      <Plus className="size-4" />

                      افزودن مشخصه
                    </Button>
                  </div>

                  {field.state.value
                    .length === 0 ? (
                    <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">
                      هنوز مشخصه‌ای اضافه نشده است.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {field.state.value.map(
                        (
                          _,
                          index,
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]"
                          >
                            <newProductForm.Field
                              name={`specs[${index}].key`}
                            >
                              {(
                                specField,
                              ) => (
                                <div className="space-y-1.5">
                                  <Input
                                    value={
                                      specField
                                        .state
                                        .value
                                    }
                                    placeholder="عنوان، مثلاً رنگ"
                                    onBlur={
                                      specField.handleBlur
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      specField.handleChange(
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                  />

                                  <FieldErrors
                                    errors={
                                      specField
                                        .state.meta
                                        .errors
                                    }
                                  />
                                </div>
                              )}
                            </newProductForm.Field>

                            <newProductForm.Field
                              name={`specs[${index}].value`}
                            >
                              {(
                                specField,
                              ) => (
                                <div className="space-y-1.5">
                                  <Input
                                    value={
                                      specField
                                        .state
                                        .value
                                    }
                                    placeholder="مقدار، مثلاً مشکی"
                                    onBlur={
                                      specField.handleBlur
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      specField.handleChange(
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                  />

                                  <FieldErrors
                                    errors={
                                      specField
                                        .state.meta
                                        .errors
                                    }
                                  />
                                </div>
                              )}
                            </newProductForm.Field>

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="text-destructive"
                              onClick={() =>
                                field.removeValue(
                                  index,
                                )
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <FieldErrors
                    errors={
                      field.state.meta
                        .errors
                    }
                  />
                </div>
              )}
            </newProductForm.Field>

            {/* Listing data */}
            <div className="border-t pt-5">
              <p className="mb-4 text-sm font-medium">
                اطلاعات فروش
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <newProductForm.Field
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
                          field.state
                            .value
                        }
                        onBlur={
                          field.handleBlur
                        }
                        onChange={(
                          event,
                        ) =>
                          field.handleChange(
                            Number(
                              event
                                .target
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
                </newProductForm.Field>

                <newProductForm.Field
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
                          field.state
                            .value ??
                          ""
                        }
                        placeholder="اختیاری"
                        onBlur={
                          field.handleBlur
                        }
                        onChange={(
                          event,
                        ) =>
                          field.handleChange(
                            event.target
                              .value ===
                              ""
                              ? null
                              : Number(
                                  event
                                    .target
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
                </newProductForm.Field>

                <newProductForm.Field
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
                          field.state
                            .value
                        }
                        onBlur={
                          field.handleBlur
                        }
                        onChange={(
                          event,
                        ) =>
                          field.handleChange(
                            Number(
                              event
                                .target
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
                </newProductForm.Field>

                <newProductForm.Field
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
                          field.state
                            .value
                        }
                        onBlur={
                          field.handleBlur
                        }
                        onChange={(
                          event,
                        ) =>
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
                </newProductForm.Field>
              </div>
            </div>

            {newMutation.isError && (
              <p className="text-sm text-destructive">
                {newMutation.error instanceof
                Error
                  ? newMutation.error
                      .message
                  : "خطا در ساخت محصول."}
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

              <newProductForm.Subscribe
                selector={(
                  state,
                ) =>
                  state.canSubmit
                }
              >
                {(canSubmit) => (
                  <Button
                    type="submit"
                    className="gap-1.5"
                    disabled={
                      !canSubmit ||
                      newMutation.isPending
                    }
                  >
                    <Plus className="size-4" />

                    {newMutation.isPending
                      ? "در حال ساخت..."
                      : "ساخت و لیست کردن"}
                  </Button>
                )}
              </newProductForm.Subscribe>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}