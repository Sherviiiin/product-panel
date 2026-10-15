import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  productSearchFormSchema,
  type ProductSearchFormInput,
} from "@/features/catalog/catalog.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const defaultValues: ProductSearchFormInput = {
  search: "",
};

function HomePage() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues,

    validators: {
      onSubmit: productSearchFormSchema,
    },

    onSubmit: async ({ value }) => {
      const data = productSearchFormSchema.parse(value);

      await navigate({
        to: "/products",
        search: {
          search: data.search,
        },
      });
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold">جستجوی محصولات</h1>

        <p className="mt-3 text-muted-foreground">محصول موردنظر خود را جستجو کنید</p>

        <form
          className="mt-8 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="search">
            {(field) => (
              <div className="flex-1">
                <Input
                  name={field.name}
                  value={field.state.value}
                  placeholder="نام محصول..."
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />

                {field.state.meta.errors.map((error) => {
                  if (!error) return null;

                  const message =
                    typeof error === "object" &&
                    "message" in error &&
                    typeof error.message === "string"
                      ? error.message
                      : String(error);

                  return (
                    <p key={message} className="mt-1 text-start text-sm text-destructive">
                      {message}
                    </p>
                  );
                })}
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                جستجو
              </Button>
            )}
          </form.Subscribe>
        </form>
      </section>
    </main>
  );
}
