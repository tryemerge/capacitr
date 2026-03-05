import { getAuth } from "./auth";

export async function getSession(headers: Headers) {
  return getAuth().api.getSession({ headers });
}
