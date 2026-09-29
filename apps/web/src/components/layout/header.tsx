import { Link } from "@tanstack/react-router"

import { AuthHeaderActions } from "@/features/auth/components/auth-header-actions"

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-lg font-semibold"
        >
          Marketplace
        </Link>

        <AuthHeaderActions />
      </div>
    </header>
  )
}