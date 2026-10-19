import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "STUDENT" | "ADMIN";
      name?: string | null;
      email?: string | null;
    };
  }
  interface User {
    role?: "STUDENT" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "STUDENT" | "ADMIN";
    uid?: string;
  }
}
