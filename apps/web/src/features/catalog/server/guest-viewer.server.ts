import { randomUUID } from "node:crypto"
import { getCookie, setCookie } from "@tanstack/react-start/server"

const COOKIE_NAME = "product-panel-guest-id"

const UUID_PATTERN =
  /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i

export function getOrCreateGuestId(): string {
  const existing = getCookie(COOKIE_NAME)

  if (existing && UUID_PATTERN.test(existing)) {
    return existing
  }

  const guestId = randomUUID()

  setCookie(COOKIE_NAME, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })

  return guestId
}