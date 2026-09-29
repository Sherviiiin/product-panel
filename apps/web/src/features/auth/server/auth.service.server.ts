import { compare, hash, hashSync } from "bcryptjs"

import type { LoginInput, RegisterInput } from "../auth.schema"

import { authRepository } from "./auth.repository.server"
import { useAuthSession } from "./auth.session.server"

const DUMMY_PASSWORD_HASH = hashSync("dummy-auth-password",12)

export const authService = {

  // login
  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase()

    const user = await authRepository.findByEmail(email)

    const passwordMatches = await compare(input.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH)

    if (!user || !passwordMatches) {
      throw new Error("INVALID_CREDENTIALS")

    } else if (user.status !== "active") {
      throw new Error("ACCOUNT_NOT_ACTIVE")

    } else if (!user.roles.includes(input.role)) {
      throw new Error("INVALID_CREDENTIALS")
    }

    const session = await useAuthSession()

    await session.update({
      userId: user.id,
      email: user.email,
      activeRole: input.role,
    })

    return {
      id: user.id,
      email: user.email,
      activeRole: input.role,
    }
  },

  // register
  async register(input: RegisterInput) {
    const normalizedInput = {
      ...input,
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      username: input.username.trim(),
      fullName: input.fullName.trim(),
    }

    const [emailExists, phoneExists, usernameExists] = await Promise.all([
      authRepository.emailExists(
        normalizedInput.email,
      ),

      authRepository.phoneExists(
        normalizedInput.phone,
      ),

      authRepository.usernameExists(
        normalizedInput.username,
      ),
    ])

    if (emailExists) {
      throw new Error("EMAIL_ALREADY_EXISTS")

    } else if (phoneExists) {
      throw new Error("PHONE_ALREADY_EXISTS")

    } else if (usernameExists) {
      throw new Error("USERNAME_ALREADY_EXISTS")
    }

    const passwordHash = await hash(normalizedInput.password, 12)

    const user = await authRepository.createUser(normalizedInput, passwordHash)

    const session = await useAuthSession()

    await session.update({
      userId: user.id,
      email: user.email,
      activeRole: input.role,
    })

    return {
      id: user.id,
      email: user.email,
      activeRole: input.role,
    }
  },

  // get current session user
  async getCurrentUser() {
    const session = await useAuthSession()
  
    if (!session.data.userId) {
      return null
    }
  
    return {
      id: session.data.userId,
      email: session.data.email,
      activeRole: session.data.activeRole,
    }
  },
  
  // logout
  async logout() {
    const session = await useAuthSession()
  
    await session.clear()
  
    return {
      success: true,
    }
  },
}