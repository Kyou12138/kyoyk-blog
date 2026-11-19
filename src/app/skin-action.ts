"use server";

import { cookies } from "next/headers";
import { isSkin, SKIN_MAX_AGE, SKIN_STORAGE_KEY, type SkinId } from "@/lib/skins";

export async function selectSkin(skin: SkinId) {
  if (!isSkin(skin)) throw new Error("未知皮肤");
  (await cookies()).set(SKIN_STORAGE_KEY, skin, {
    path: "/", sameSite: "lax", maxAge: SKIN_MAX_AGE,
  });
}
