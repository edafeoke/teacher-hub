import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js";
import prisma from "@/lib/prisma";
import { ac, admin, user } from "@/lib/permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // await sendEmail({
      //   to: user.email,
      //   subject: "Verify your email address",
      //   text: `Click the link to verify your email: ${url}`,
      // });
    },
  },
  plugins: [
    adminPlugin({
      adminUserIds: ["UETT05wk85ogUO3XJI81fmfPEFq9kcV8"],
      ac,
      roles: {
        admin,
        user,
      },
      
    }),
    nextCookies()
  ],
});
