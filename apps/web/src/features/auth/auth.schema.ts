import { z } from "zod"

export const authRoleSchema = z.enum(["normal","seller"])

export const loginSchema = z.object({
  role: authRoleSchema,

  email: z.string().trim().email("ایمیل معتبر وارد کنید"),

  password: z.string().min(3, "رمز عبور باید حداقل 3 کاراکتر باشد"),
})

const registerBase = {
  fullName: z.string().trim().min(2, "نام الزامی است").max(150),

  username: z.string().trim().toLowerCase().min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد").max(100)
  .regex(/^[a-z_][a-z0-9_]*$/i, "نام کاربری نباید با عدد شروع شود و فقط می‌تواند شامل حروف انگلیسی، عدد و _ باشد"),

  email: z.string().trim().email("ایمیل معتبر وارد کنید"),

  phone: z.string().trim().min(11, "شماره تلفن معتبر وارد کنید").max(20),

  password: z.string().min(3, "رمز عبور باید حداقل 3 کاراکتر باشد"),

  confirmPassword: z.string(),

  shopName: z.string().trim().max(150),

  sellerTypeId: z.number().int().positive(),
}

const userRegisterSchema = z.object({
  ...registerBase,
  role: z.literal("normal"),
})

const sellerRegisterSchema = z.object({
  ...registerBase,
  role: z.literal("seller"),
})

export const registerSchema = z.discriminatedUnion("role", [userRegisterSchema, sellerRegisterSchema])
.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "تکرار رمز عبور مطابقت ندارد",
    })
  }

  if (data.role === "seller" && data.shopName.length < 2) {
    ctx.addIssue({
      code: "custom",
      path: ["shopName"],
      message: "نام فروشگاه الزامی است",
    })
  }
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AuthRole = z.infer<typeof authRoleSchema>