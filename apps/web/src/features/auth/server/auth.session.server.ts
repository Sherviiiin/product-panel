import { useSession } from "@tanstack/react-start/server";

import type { AuthRole } from "../auth.schema";

type AuthSessionData = {
  userId?: number;
  email?: string;
  activeRole?: AuthRole;
};

export function useAuthSession() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }

  return useSession<AuthSessionData>({
    name: "product-panel-session",

    password: secret,

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  });
}
