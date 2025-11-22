import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import { adminClient } from "better-auth/client/plugins";
import { ac, admin, user } from "@/lib/permissions";

export const authClient = createAuthClient({
  //you can pass client configuration here
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
      
    }),
    nextCookies()
  ],
});
