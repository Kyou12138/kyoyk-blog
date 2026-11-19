import { cookies } from "next/headers";
import { DEFAULT_SKIN, isSkin, SKIN_STORAGE_KEY } from "./skins";

export async function getSkin() {
  const value = (await cookies()).get(SKIN_STORAGE_KEY)?.value;
  return isSkin(value) ? value : DEFAULT_SKIN;
}
