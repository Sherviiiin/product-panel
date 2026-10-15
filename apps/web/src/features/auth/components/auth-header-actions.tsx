import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Button, buttonVariants } from "@/components/ui/button";

import { authKeys, currentUserQuery } from "../queries/auth.query";
import { logout } from "../server/functions/auth.functions";

export function AuthHeaderActions() {
  const queryClient = useQueryClient();

  const { data: user } = useSuspenseQuery(currentUserQuery());

  const logoutMutation = useMutation({
    mutationFn: () => logout(),

    onSuccess: () => {
      queryClient.setQueryData(authKeys.currentUser(), null);
    },
  });

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/auth/login"
          className={buttonVariants({
            variant: "outline",
          })}
        >
          ورود
        </Link>

        <Link to="/auth/register" className={buttonVariants()}>
          ثبت‌نام
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/dashboard"
        className={buttonVariants({
          variant: "outline",
          className:
            "h-9 rounded-full border-primary/20 bg-primary/5 px-4 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-primary/10 hover:text-primary",
        })}
      >
        {user.activeRole === "seller" ? "داشبورد فروشنده" : "داشبورد کاربر"}
      </Link>

      <Button
        type="button"
        variant="outline"
        disabled={logoutMutation.isPending}
        onClick={() => logoutMutation.mutate()}
      >
        {logoutMutation.isPending ? "در حال خروج..." : "خروج"}
      </Button>
    </div>
  );
}
