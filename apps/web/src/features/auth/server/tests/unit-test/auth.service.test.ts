import { compare, hashSync } from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authService } from "../../auth.service.server";

const mocks = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  emailExists: vi.fn(),
  phoneExists: vi.fn(),
  usernameExists: vi.fn(),
  createUser: vi.fn(),
  useAuthSession: vi.fn(),
  updateSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock("../../auth.repository.server", () => ({
  authRepository: {
    findByEmail: mocks.findByEmail,
    emailExists: mocks.emailExists,
    phoneExists: mocks.phoneExists,
    usernameExists: mocks.usernameExists,
    createUser: mocks.createUser,
  },
}));

vi.mock("../../auth.session.server", () => ({
  useAuthSession: mocks.useAuthSession,
}));

const activeUser = {
  id: 10,
  email: "test@example.com",
  passwordHash: hashSync("Password123!", 4),
  status: "active",
  roles: ["normal"],
};

const loginInput = {
  email: "test@example.com",
  password: "Password123!",
  role: "normal" as const,
};

const registerInput = {
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

beforeEach(() => {
  vi.resetAllMocks();

  mocks.findByEmail.mockResolvedValue(activeUser);
  mocks.emailExists.mockResolvedValue(false);
  mocks.phoneExists.mockResolvedValue(false);
  mocks.usernameExists.mockResolvedValue(false);

  mocks.createUser.mockResolvedValue({
    id: 20,
    email: "test@example.com",
  });

  mocks.useAuthSession.mockResolvedValue({
    data: {},
    update: mocks.updateSession,
    clear: mocks.clearSession,
  });
});

describe("AuthService - login", () => {
  it("logs in with valid credentials and normalizes email", async () => {
    const result = await authService.login({
      ...loginInput,
      email: " TEST@EXAMPLE.COM ",
    });

    expect(mocks.findByEmail).toHaveBeenCalledExactlyOnceWith("test@example.com");

    expect(mocks.updateSession).toHaveBeenCalledExactlyOnceWith({
      userId: 10,
      email: "test@example.com",
      activeRole: "normal",
    });

    expect(result).toEqual({
      id: 10,
      email: "test@example.com",
      activeRole: "normal",
    });
  });

  it("allows login with an authorized seller role", async () => {
    mocks.findByEmail.mockResolvedValue({
      ...activeUser,
      roles: ["normal", "seller"],
    });

    const result = await authService.login({
      ...loginInput,
      role: "seller",
    });

    expect(result.activeRole).toBe("seller");

    expect(mocks.updateSession).toHaveBeenCalledWith({
      userId: 10,
      email: "test@example.com",
      activeRole: "seller",
    });
  });

  it("rejects an incorrect password", async () => {
    await expect(
      authService.login({
        ...loginInput,
        password: "wrong-password",
      }),
    ).rejects.toThrow("INVALID_CREDENTIALS");

    expect(mocks.useAuthSession).not.toHaveBeenCalled();
  });

  it("treats passwords as case-sensitive", async () => {
    await expect(
      authService.login({
        ...loginInput,
        password: "password123!",
      }),
    ).rejects.toThrow("INVALID_CREDENTIALS");

    expect(mocks.updateSession).not.toHaveBeenCalled();
  });

  it("rejects an unknown user", async () => {
    mocks.findByEmail.mockResolvedValue(null);

    await expect(authService.login(loginInput)).rejects.toThrow("INVALID_CREDENTIALS");

    expect(mocks.useAuthSession).not.toHaveBeenCalled();
  });

  it.each(["inactive", "banned"] as const)("rejects an account with status %s", async (status) => {
    mocks.findByEmail.mockResolvedValue({
      ...activeUser,
      status,
    });

    await expect(authService.login(loginInput)).rejects.toThrow("ACCOUNT_NOT_ACTIVE");

    expect(mocks.updateSession).not.toHaveBeenCalled();
  });

  it("rejects a role not assigned to the user", async () => {
    await expect(
      authService.login({
        ...loginInput,
        role: "seller",
      }),
    ).rejects.toThrow("INVALID_CREDENTIALS");

    expect(mocks.useAuthSession).not.toHaveBeenCalled();
  });

  it("propagates repository read errors", async () => {
    mocks.findByEmail.mockRejectedValue(new Error("DATABASE_READ_FAILED"));

    await expect(authService.login(loginInput)).rejects.toThrow("DATABASE_READ_FAILED");

    expect(mocks.useAuthSession).not.toHaveBeenCalled();
  });

  it("propagates session initialization errors", async () => {
    mocks.useAuthSession.mockRejectedValue(new Error("SESSION_FAILED"));

    await expect(authService.login(loginInput)).rejects.toThrow("SESSION_FAILED");

    expect(mocks.updateSession).not.toHaveBeenCalled();
  });

  it("propagates session update errors", async () => {
    mocks.updateSession.mockRejectedValue(new Error("SESSION_UPDATE_FAILED"));

    await expect(authService.login(loginInput)).rejects.toThrow("SESSION_UPDATE_FAILED");

    expect(mocks.updateSession).toHaveBeenCalledOnce();
  });
});

describe("AuthService - register", () => {
  it("rejects duplicate email", async () => {
    mocks.emailExists.mockResolvedValue(true);

    await expect(authService.register(registerInput)).rejects.toThrow("EMAIL_ALREADY_EXISTS");

    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.useAuthSession).not.toHaveBeenCalled();
  });

  it("rejects duplicate phone", async () => {
    mocks.phoneExists.mockResolvedValue(true);

    await expect(authService.register(registerInput)).rejects.toThrow("PHONE_ALREADY_EXISTS");

    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.useAuthSession).not.toHaveBeenCalled();
  });

  it("rejects duplicate username", async () => {
    mocks.usernameExists.mockResolvedValue(true);

    await expect(authService.register(registerInput)).rejects.toThrow("USERNAME_ALREADY_EXISTS");

    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.useAuthSession).not.toHaveBeenCalled();
  });

  it("prioritizes the email error when all identifiers exist", async () => {
    mocks.emailExists.mockResolvedValue(true);
    mocks.phoneExists.mockResolvedValue(true);
    mocks.usernameExists.mockResolvedValue(true);

    await expect(authService.register(registerInput)).rejects.toThrow("EMAIL_ALREADY_EXISTS");

    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it("normalizes input and securely hashes the password", async () => {
    const result = await authService.register({
      ...registerInput,
      fullName: " Test User ",
      username: " testuser ",
      email: " TEST@EXAMPLE.COM ",
      phone: " 09123456789 ",
    });

    expect(mocks.emailExists).toHaveBeenCalledExactlyOnceWith("test@example.com");
    expect(mocks.phoneExists).toHaveBeenCalledExactlyOnceWith("09123456789");
    expect(mocks.usernameExists).toHaveBeenCalledExactlyOnceWith("testuser");

    expect(mocks.createUser).toHaveBeenCalledOnce();

    const call = mocks.createUser.mock.calls[0];
    if (!call) {
      throw new Error("Expected createUser to be called");
    }
    const [createdInput, passwordHash] = call;

    expect(createdInput).toMatchObject({
      role: "normal",
      fullName: "Test User",
      username: "testuser",
      email: "test@example.com",
      phone: "09123456789",
    });

    expect(passwordHash).not.toBe(registerInput.password);
    expect(await compare(registerInput.password, passwordHash)).toBe(true);

    expect(mocks.updateSession).toHaveBeenCalledExactlyOnceWith({
      userId: 20,
      email: "test@example.com",
      activeRole: "normal",
    });

    expect(result).toEqual({
      id: 20,
      email: "test@example.com",
      activeRole: "normal",
    });
  });

  it("registers a seller with the selected seller type", async () => {
    const result = await authService.register({
      ...registerInput,
      role: "seller",
      shopName: "Test Shop",
      sellerTypeId: 2,
    });

    expect(mocks.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "seller",
        shopName: "Test Shop",
        sellerTypeId: 2,
      }),
      expect.any(String),
    );

    expect(mocks.updateSession).toHaveBeenCalledWith({
      userId: 20,
      email: "test@example.com",
      activeRole: "seller",
    });

    expect(result.activeRole).toBe("seller");
  });

  it.each([
    ["emailExists", "EMAIL_LOOKUP_FAILED"],
    ["phoneExists", "PHONE_LOOKUP_FAILED"],
    ["usernameExists", "USERNAME_LOOKUP_FAILED"],
  ] as const)("does not create a user if %s fails", async (method, errorMessage) => {
    mocks[method].mockRejectedValue(new Error(errorMessage));

    await expect(authService.register(registerInput)).rejects.toThrow(errorMessage);

    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.useAuthSession).not.toHaveBeenCalled();
  });

  it("does not create a session when user creation fails", async () => {
    mocks.createUser.mockRejectedValue(new Error("DATABASE_WRITE_FAILED"));

    await expect(authService.register(registerInput)).rejects.toThrow("DATABASE_WRITE_FAILED");

    expect(mocks.useAuthSession).not.toHaveBeenCalled();
    expect(mocks.updateSession).not.toHaveBeenCalled();
  });

  it("propagates session initialization errors after creation", async () => {
    mocks.useAuthSession.mockRejectedValue(new Error("SESSION_FAILED"));

    await expect(authService.register(registerInput)).rejects.toThrow("SESSION_FAILED");

    expect(mocks.createUser).toHaveBeenCalledOnce();
    expect(mocks.updateSession).not.toHaveBeenCalled();
  });

  it("propagates session update errors after creation", async () => {
    mocks.updateSession.mockRejectedValue(new Error("SESSION_UPDATE_FAILED"));

    await expect(authService.register(registerInput)).rejects.toThrow("SESSION_UPDATE_FAILED");

    expect(mocks.createUser).toHaveBeenCalledOnce();
    expect(mocks.updateSession).toHaveBeenCalledOnce();
  });
});

describe("AuthService - session", () => {
  it("returns null when no user is logged in", async () => {
    const result = await authService.getCurrentUser();

    expect(result).toBeNull();
  });

  it("returns the current logged-in user", async () => {
    mocks.useAuthSession.mockResolvedValue({
      data: {
        userId: 10,
        email: "test@example.com",
        activeRole: "seller",
      },
      update: mocks.updateSession,
      clear: mocks.clearSession,
    });

    const result = await authService.getCurrentUser();

    expect(result).toEqual({
      id: 10,
      email: "test@example.com",
      activeRole: "seller",
    });
  });

  it("propagates session read errors", async () => {
    mocks.useAuthSession.mockRejectedValue(new Error("SESSION_READ_FAILED"));

    await expect(authService.getCurrentUser()).rejects.toThrow("SESSION_READ_FAILED");
  });
});

describe("AuthService - logout", () => {
  it("clears the session", async () => {
    const result = await authService.logout();

    expect(mocks.clearSession).toHaveBeenCalledOnce();
    expect(result).toEqual({ success: true });
  });

  it("propagates session clearing errors", async () => {
    mocks.clearSession.mockRejectedValue(new Error("SESSION_CLEAR_FAILED"));

    await expect(authService.logout()).rejects.toThrow("SESSION_CLEAR_FAILED");
  });
});
