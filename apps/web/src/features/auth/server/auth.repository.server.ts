import { db, eq, roles, sellerProfiles, userProfiles, userRoles, users } from "@repo/db";

import type { AuthRole, RegisterInput } from "../auth.schema";

export type AuthUserRecord = {
  id: number;
  email: string;
  passwordHash: string;
  status: "active" | "inactive" | "banned";
  roles: AuthRole[];
};

export const authRepository = {
  // find user by email
  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        status: users.status,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(users.email, email));

    const first = rows[0];

    if (!first) {
      return null;
    }

    const userRolesList = rows.reduce<AuthRole[]>((result, row) => {
      if (row.roleName === "normal" || row.roleName === "seller") {
        result.push(row.roleName);
      }

      return result;
    }, []);

    return {
      id: first.id,
      email: first.email,
      passwordHash: first.passwordHash,
      status: first.status,
      roles: userRolesList,
    };
  },

  // check if email exists
  async emailExists(email: string) {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),

      columns: {
        id: true,
      },
    });

    return Boolean(user);
  },

  // check if mobile phone exists
  async phoneExists(phone: string) {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.phone, phone),

      columns: {
        id: true,
      },
    });

    return Boolean(user);
  },

  // check if username exists
  async usernameExists(username: string) {
    const profile = await db.query.userProfiles.findFirst({
      where: (userProfiles, { eq }) => eq(userProfiles.username, username),

      columns: {
        userId: true,
      },
    });

    return Boolean(profile);
  },

  // create new user
  async createUser(input: RegisterInput, passwordHash: string) {
    return db.transaction(async (tx) => {
      const [role] = await tx
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.name, input.role))
        .limit(1);

      if (!role) {
        throw new Error("ROLE_NOT_FOUND");
      }

      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          phone: input.phone,
          passwordHash,
        })
        .returning({
          id: users.id,
          email: users.email,
        });

      if (!user) {
        throw new Error("USER_CREATE_FAILED");
      }

      await tx.insert(userProfiles).values({
        userId: user.id,
        fullName: input.fullName,
        username: input.username,
      });

      await tx.insert(userRoles).values({
        userId: user.id,
        roleId: role.id,
      });

      if (input.role === "seller") {
        await tx.insert(sellerProfiles).values({
          userId: user.id,
          shopName: input.shopName,
          sellerTypeId: input.sellerTypeId,
        });
      }

      return user;
    });
  },
};
