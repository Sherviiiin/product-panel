import {
  useState,
} from "react"

import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router"

import {
  UserRoundPen,
} from "lucide-react"

import {
  currentUserQuery,
} from "@/features/auth/queries/auth.query"

import {
  DashboardProfileEditDialog,
} from "@/features/dashboard/components/dashboard-profile-edit-dialog"

import {
  UserDashboard,
} from "@/features/dashboard/components/user-dashboard"

import {
  SellerDashboard,
} from "@/features/dashboard/components/seller-dashboard"

import {
  Button,
} from "@/components/ui/button"

export const Route =
  createFileRoute(
    "/dashboard/",
  )({
    loader: async ({
      context,
    }) => {
      const user =
        await context.queryClient.query({
          ...currentUserQuery(),
        })

      if (!user) {
        throw redirect({
          to: "/auth/login",
        })
      }

      return {
        user,
      }
    },

    component:
      DashboardPage,
  })

function DashboardPage() {
  const { user } =
    Route.useLoaderData()

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false)

  const isSeller =
    user.activeRole ===
    "seller"

  return (
    <main
      dir="rtl"
      className="w-full max-w-none px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() =>
            setProfileOpen(true)
          }
        >
          <UserRoundPen className="size-4" />

          ویرایش پروفایل
        </Button>
      </div>

      {isSeller ? (
        <SellerDashboard />
      ) : (
        <UserDashboard />
      )}

      <DashboardProfileEditDialog
        open={profileOpen}
        isSeller={isSeller}
        onOpenChange={
          setProfileOpen
        }
      />
    </main>
  )
}