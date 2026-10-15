import { createServerFn } from "@tanstack/react-start";
import { loginSchema, registerSchema } from "../../auth.schema";
import { authService } from "../auth.service.server";

// login
export const login = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    return authService.login(data);
  });

// register
export const register = createServerFn({ method: "POST" })
  .validator(registerSchema)
  .handler(async ({ data }) => {
    return authService.register(data);
  });

// get Current User
export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  return authService.getCurrentUser();
});

// logout
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  return authService.logout();
});
