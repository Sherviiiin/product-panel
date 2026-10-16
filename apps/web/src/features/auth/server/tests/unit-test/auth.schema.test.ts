import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "../../../auth.schema";

const validRegistration = {
  role: "normal" as const,
  fullName: "Test User",
  username: "testuser",
  email: "test@example.com",
  phone: "09123456789",
  password: "Password123!",
  confirmPassword: "Password123!",
  shopName: "",
  sellerTypeId: 1,
};

describe("Login schema", () => {
  it.each(["normal", "seller"])("accepts valid credentials for role %s", (role) => {
    expect(
      loginSchema.safeParse({
        role,
        email: "test@example.com",
        password: "Password123!",
      }).success,
    ).toBe(true);
  });

  it("trims email whitespace", () => {
    const result = loginSchema.parse({
      role: "normal",
      email: " test@example.com ",
      password: "abc",
    });

    expect(result.email).toBe("test@example.com");
  });

  it.each([
    ["invalid role", { role: "admin" }],
    ["invalid email", { email: "invalid-email" }],
    ["empty email", { email: "" }],
    ["short password", { password: "ab" }],
    ["missing password", { password: undefined }],
  ])("rejects %s", (_label, changes) => {
    const result = loginSchema.safeParse({
      role: "normal",
      email: "test@example.com",
      password: "Password123!",
      ...changes,
    });

    expect(result.success).toBe(false);
  });
});

describe("Register schema", () => {
  it("accepts a valid normal user", () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it("accepts a valid seller", () => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        role: "seller",
        shopName: "Test Shop",
      }).success,
    ).toBe(true);
  });

  it("trims text fields and lowercases username", () => {
    const result = registerSchema.parse({
      ...validRegistration,
      fullName: " Test User ",
      username: " TEST_USER ",
      email: " test@example.com ",
      phone: " 09123456789 ",
    });

    expect(result).toMatchObject({
      fullName: "Test User",
      username: "test_user",
      email: "test@example.com",
      phone: "09123456789",
    });
  });

  it("accepts a username beginning with underscore", () => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        username: "_test",
      }).success,
    ).toBe(true);
  });

  it.each([
    ["too short", "ab"],
    ["starts with a number", "1test"],
    ["contains a hyphen", "test-user"],
    ["contains a space", "test user"],
    ["contains a special character", "test@user"],
    ["exceeds 100 characters", "a".repeat(101)],
  ])("rejects a username that %s", (_label, username) => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        username,
      }).success,
    ).toBe(false);
  });

  it.each([
    ["too short", "A"],
    ["too long", "A".repeat(151)],
  ])("rejects a full name that is %s", (_label, fullName) => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        fullName,
      }).success,
    ).toBe(false);
  });

  it.each([
    ["too short", "1234567890"],
    ["too long", "1".repeat(21)],
  ])("rejects a phone number that is %s", (_label, phone) => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        phone,
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        email: "invalid-email",
      }).success,
    ).toBe(false);
  });

  it("rejects a password shorter than three characters", () => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        password: "ab",
        confirmPassword: "ab",
      }).success,
    ).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: "Different123!",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "confirmPassword")).toBe(true);
    }
  });

  it.each([
    ["empty", ""],
    ["one character", "A"],
    ["over 150 characters", "A".repeat(151)],
  ])("rejects a seller shop name that is %s", (_label, shopName) => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        role: "seller",
        shopName,
      }).success,
    ).toBe(false);
  });

  it("permits an empty shop name for normal users", () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it.each([0, -1, 1.5])("rejects invalid sellerTypeId: %s", (sellerTypeId) => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        sellerTypeId,
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown registration role", () => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        role: "admin",
      }).success,
    ).toBe(false);
  });
});
