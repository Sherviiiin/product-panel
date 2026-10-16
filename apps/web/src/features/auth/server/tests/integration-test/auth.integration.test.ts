import { randomUUID } from "node:crypto";
import { compare, hashSync } from "bcryptjs";
import {
  db,
  eq,
  inArray,
  productLikes,
  productSaves,
  productViews,
  roles,
  sellerProducts,
  sellerProfiles,
  sellerTypes,
  userProfiles,
  userRoles,
  users,
} from "@repo/db";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthRole, RegisterInput } from "../../../auth.schema";
import { authRepository } from "../../auth.repository.server";
import { authService } from "../../auth.service.server";

const sessionMocks = vi.hoisted(() => ({
  useAuthSession: vi.fn(),
  update: vi.fn(),
  clear: vi.fn(),
}));

vi.mock("../../auth.session.server", () => ({
  useAuthSession: sessionMocks.useAuthSession,
}));

const PASSWORD = "Password123!";

const createdEmails = new Set<string>();

let sellerTypeId: number;

function makeInput(role: AuthRole = "normal"): RegisterInput {
  const token = randomUUID().replaceAll("-", "");

  const phoneNumber = (BigInt(`0x${token.slice(0, 14)}`) % 1_000_000_000n)
    .toString()
    .padStart(9, "0");

  const common = {
    fullName: "Integration Test User",
    username: `it_${token}`,
    email: `it-${token}@example.test`,
    phone: `09${phoneNumber}`,
    password: PASSWORD,
    confirmPassword: PASSWORD,
    shopName: role === "seller" ? "Integration Test Shop" : "",
    sellerTypeId,
  };

  createdEmails.add(common.email);

  if (role === "seller") {
    return { ...common, role: "seller" };
  }

  return { ...common, role: "normal" };
}

async function findStoredUser(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return user ?? null;
}

async function getStoredRoles(userId: number) {
  const rows = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  return rows.map((row) => row.name);
}

beforeAll(async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  const hostname = new URL(databaseUrl).hostname;

  if (!["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname)) {
    throw new Error("Auth integration tests require a local development database");
  }

  const existingRoles = await db.select({ name: roles.name }).from(roles);

  const roleNames = new Set(existingRoles.map((role) => role.name));

  if (!roleNames.has("normal") || !roleNames.has("seller")) {
    throw new Error("Normal and seller roles must exist");
  }

  const [sellerType] = await db.select({ id: sellerTypes.id }).from(sellerTypes).limit(1);

  if (!sellerType) {
    throw new Error("Seller types must be seeded");
  }

  sellerTypeId = sellerType.id;
});

beforeEach(() => {
  vi.resetAllMocks();

  sessionMocks.useAuthSession.mockResolvedValue({
    data: {},
    update: sessionMocks.update,
    clear: sessionMocks.clear,
  });
});

afterEach(async () => {
  const emails = [...createdEmails];

  if (emails.length === 0) {
    return;
  }

  await db.transaction(async (tx) => {
    const testUsers = await tx
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.email, emails));

    const userIds = testUsers.map((user) => user.id);

    if (userIds.length === 0) {
      return;
    }

    const testSellers = await tx
      .select({ id: sellerProfiles.id })
      .from(sellerProfiles)
      .where(inArray(sellerProfiles.userId, userIds));

    const sellerIds = testSellers.map((seller) => seller.id);

    if (sellerIds.length > 0) {
      await tx.delete(sellerProducts).where(inArray(sellerProducts.sellerProfileId, sellerIds));
    }

    await tx.delete(productLikes).where(inArray(productLikes.userId, userIds));

    await tx.delete(productSaves).where(inArray(productSaves.userId, userIds));

    await tx.delete(productViews).where(inArray(productViews.userId, userIds));

    await tx.delete(sellerProfiles).where(inArray(sellerProfiles.userId, userIds));

    await tx.delete(userRoles).where(inArray(userRoles.userId, userIds));

    await tx.delete(userProfiles).where(inArray(userProfiles.userId, userIds));

    await tx.delete(users).where(inArray(users.id, userIds));
  });

  createdEmails.clear();
});

describe("Auth integration - registration", () => {
  it("persists a normal user, profile and role", async () => {
    const input = makeInput();

    const result = await authService.register(input);

    const stored = await findStoredUser(input.email);

    expect(stored).not.toBeNull();

    if (!stored) {
      throw new Error("Registered user was not persisted");
    }

    expect(result).toEqual({
      id: stored.id,
      email: input.email,
      activeRole: "normal",
    });

    expect(stored.phone).toBe(input.phone);
    expect(stored.status).toBe("active");
    expect(stored.passwordHash).not.toBe(PASSWORD);
    expect(await compare(PASSWORD, stored.passwordHash)).toBe(true);

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, stored.id));

    expect(profile).toMatchObject({
      userId: stored.id,
      username: input.username,
      fullName: input.fullName,
    });

    expect(await getStoredRoles(stored.id)).toEqual(["normal"]);

    expect(sessionMocks.update).toHaveBeenCalledWith({
      userId: stored.id,
      email: input.email,
      activeRole: "normal",
    });
  });

  it("persists a seller, seller profile and role", async () => {
    const input = makeInput("seller");

    const result = await authService.register(input);

    const [profile] = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, result.id));

    expect(profile).toMatchObject({
      userId: result.id,
      shopName: input.shopName,
      sellerTypeId: input.sellerTypeId,
    });

    expect(await getStoredRoles(result.id)).toEqual(["seller"]);

    expect(result.activeRole).toBe("seller");

    expect(sessionMocks.update).toHaveBeenCalledWith({
      userId: result.id,
      email: input.email,
      activeRole: "seller",
    });
  });

  it("normalizes user data before persisting", async () => {
    const input = makeInput();

    const result = await authService.register({
      ...input,
      fullName: `  ${input.fullName}  `,
      username: `  ${input.username}  `,
      email: `  ${input.email.toUpperCase()}  `,
      phone: `  ${input.phone}  `,
    });

    const stored = await findStoredUser(input.email);

    expect(stored?.id).toBe(result.id);
    expect(stored?.phone).toBe(input.phone);

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, result.id));

    expect(profile?.username).toBe(input.username);
    expect(profile?.fullName).toBe(input.fullName);
  });

  it.each([
    ["email", "EMAIL_ALREADY_EXISTS"],
    ["phone", "PHONE_ALREADY_EXISTS"],
    ["username", "USERNAME_ALREADY_EXISTS"],
  ] as const)("rejects an already registered %s", async (field, expectedError) => {
    const first = makeInput();
    await authService.register(first);

    const second = makeInput();

    if (field === "email") {
      second.email = first.email;
    } else if (field === "phone") {
      second.phone = first.phone;
    } else {
      second.username = first.username;
    }

    await expect(authService.register(second)).rejects.toThrow(expectedError);

    if (field === "email") {
      expect(await findStoredUser(first.email)).not.toBeNull();
    } else {
      expect(await findStoredUser(second.email)).toBeNull();
    }
  });

  it("rejects duplicates after email normalization", async () => {
    const first = makeInput();
    await authService.register(first);

    const second = makeInput();

    await expect(
      authService.register({
        ...second,
        email: `  ${first.email.toUpperCase()}  `,
      }),
    ).rejects.toThrow("EMAIL_ALREADY_EXISTS");

    expect(await findStoredUser(second.email)).toBeNull();
  });

  it("rolls back user creation for an invalid seller type", async () => {
    const input = makeInput("seller");

    const [reservedType] = await db
      .select({ id: sellerTypes.id })
      .from(sellerTypes)
      .where(eq(sellerTypes.id, 2_000_000_000));

    if (reservedType) {
      throw new Error("Reserved seller type ID is already used");
    }

    await expect(
      authService.register({
        ...input,
        sellerTypeId: 2_000_000_000,
      }),
    ).rejects.toThrow();

    expect(await findStoredUser(input.email)).toBeNull();
  });

  it.each(["email", "phone", "username"] as const)(
    "enforces database uniqueness for %s",
    async (field) => {
      const first = makeInput();
      await authService.register(first);

      const second = makeInput();

      if (field === "email") {
        second.email = first.email;
      } else if (field === "phone") {
        second.phone = first.phone;
      } else {
        second.username = first.username;
      }

      await expect(authRepository.createUser(second, hashSync(PASSWORD, 4))).rejects.toThrow();

      if (field !== "email") {
        expect(await findStoredUser(second.email)).toBeNull();
      }
    },
  );

  it("allows only one concurrent registration for a username", async () => {
    const first = makeInput();
    const second = makeInput();

    second.username = first.username;

    const results = await Promise.allSettled([
      authService.register(first),
      authService.register(second),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);

    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);

    const matchingProfiles = await db
      .select({ userId: userProfiles.userId })
      .from(userProfiles)
      .where(eq(userProfiles.username, first.username));

    expect(matchingProfiles).toHaveLength(1);
  });
});

describe("Auth integration - login", () => {
  it("logs in a registered normal user", async () => {
    const input = makeInput();

    const registered = await authService.register(input);

    sessionMocks.update.mockClear();

    const result = await authService.login({
      email: input.email.toUpperCase(),
      password: PASSWORD,
      role: "normal",
    });

    expect(result).toEqual({
      id: registered.id,
      email: input.email,
      activeRole: "normal",
    });

    expect(sessionMocks.update).toHaveBeenCalledWith({
      userId: registered.id,
      email: input.email,
      activeRole: "normal",
    });
  });

  it("logs in a registered seller", async () => {
    const input = makeInput("seller");

    const registered = await authService.register(input);

    const result = await authService.login({
      email: input.email,
      password: PASSWORD,
      role: "seller",
    });

    expect(result.id).toBe(registered.id);
    expect(result.activeRole).toBe("seller");
  });

  it("rejects an incorrect password", async () => {
    const input = makeInput();
    await authService.register(input);

    sessionMocks.update.mockClear();

    await expect(
      authService.login({
        email: input.email,
        password: "WrongPassword123!",
        role: "normal",
      }),
    ).rejects.toThrow("INVALID_CREDENTIALS");

    expect(sessionMocks.update).not.toHaveBeenCalled();
  });

  it("rejects an unknown email", async () => {
    const input = makeInput();

    await expect(
      authService.login({
        email: input.email,
        password: PASSWORD,
        role: "normal",
      }),
    ).rejects.toThrow("INVALID_CREDENTIALS");

    expect(sessionMocks.update).not.toHaveBeenCalled();
  });

  it.each(["inactive", "banned"] as const)("rejects a user with status %s", async (status) => {
    const input = makeInput();
    const registered = await authService.register(input);

    await db.update(users).set({ status }).where(eq(users.id, registered.id));

    sessionMocks.update.mockClear();

    await expect(
      authService.login({
        email: input.email,
        password: PASSWORD,
        role: "normal",
      }),
    ).rejects.toThrow("ACCOUNT_NOT_ACTIVE");

    expect(sessionMocks.update).not.toHaveBeenCalled();
  });

  it("rejects a role not assigned to the account", async () => {
    const input = makeInput();
    await authService.register(input);

    sessionMocks.update.mockClear();

    await expect(
      authService.login({
        email: input.email,
        password: PASSWORD,
        role: "seller",
      }),
    ).rejects.toThrow("INVALID_CREDENTIALS");

    expect(sessionMocks.update).not.toHaveBeenCalled();
  });

  it("returns the real user with their assigned role", async () => {
    const input = makeInput("seller");
    await authService.register(input);

    const stored = await authRepository.findByEmail(input.email);

    expect(stored).toMatchObject({
      email: input.email,
      status: "active",
      roles: ["seller"],
    });

    expect(stored?.id).toEqual(expect.any(Number));
    expect(await compare(PASSWORD, stored?.passwordHash ?? "")).toBe(true);
  });
});

describe("Auth integration - session failures", () => {
  it("does not register a user when repository validation fails", async () => {
    const first = makeInput();
    await authService.register(first);

    const second = makeInput();

    sessionMocks.update.mockClear();

    await expect(
      authService.register({
        ...second,
        phone: first.phone,
      }),
    ).rejects.toThrow("PHONE_ALREADY_EXISTS");

    expect(sessionMocks.update).not.toHaveBeenCalled();
    expect(await findStoredUser(second.email)).toBeNull();
  });

  it("reports session update failure after registration", async () => {
    const input = makeInput();

    sessionMocks.update.mockRejectedValueOnce(new Error("SESSION_UPDATE_FAILED"));

    await expect(authService.register(input)).rejects.toThrow("SESSION_UPDATE_FAILED");

    // The account was committed before the session failed.
    // afterEach removes this test account.
    expect(await findStoredUser(input.email)).not.toBeNull();
  });

  it("does not change a valid account when login session update fails", async () => {
    const input = makeInput();
    await authService.register(input);

    sessionMocks.update.mockRejectedValueOnce(new Error("SESSION_UPDATE_FAILED"));

    await expect(
      authService.login({
        email: input.email,
        password: PASSWORD,
        role: "normal",
      }),
    ).rejects.toThrow("SESSION_UPDATE_FAILED");

    expect(await findStoredUser(input.email)).not.toBeNull();
  });
});
