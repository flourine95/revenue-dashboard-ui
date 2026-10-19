import { redirect } from "next/navigation"
import { getSessionUser } from "./api/server"
import type { User } from "./api/types"

/** Server-side route guard: sends anonymous visitors to the login page. */
export async function requireUser(): Promise<User> {
  const user = await getSessionUser()
  if (user === null) redirect("/login")
  return user
}
