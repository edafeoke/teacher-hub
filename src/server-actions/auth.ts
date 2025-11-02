"use server";

import { authClient } from "@/lib/auth-client";

"use server";
import { auth } from "@/lib/auth"
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUp = async (formData: FormData) => {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
            },
            headers: await headers(),
        });
        redirect("/");
    } catch (error) {
        console.error(error);
        return { error: "Failed to sign up", success: false };
    }
}

export const signIn = async (formData: FormData) => {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            headers: await headers(),
        })

        redirect("/");
    } catch (error) {
        console.error(error);
        return { error: "Failed to sign in", success: false };
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({
            headers: await headers(),
        })
        redirect("/");
    } catch (error) {
        console.error(error);
        return { error: "Failed to sign out", success: false };
    }
}