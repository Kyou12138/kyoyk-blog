import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createToken, verifyToken } from "./auth";

export const SESSION_COOKIE = "blog_session";
export const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

export const isAdmin = async (): Promise<boolean> => {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
};

export const requireAdmin = async (): Promise<void> => {
  if (!(await isAdmin())) redirect("/admin/login");
};

export const startSession = async (): Promise<void> => {
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(SESSION_TTL), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL / 1000,
  });
};

export const endSession = async (): Promise<void> => {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
};
