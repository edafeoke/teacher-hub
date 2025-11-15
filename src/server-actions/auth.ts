"use server";

import { auth } from "@/lib/auth"
import { APIError } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUp = async (prevState: any, formData: FormData) => {
    try {
        const firstname = formData.get("firstname") as string;
        const lastname = formData.get("lastname") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const response = await auth.api.signUpEmail({
            body: {
                name: `${firstname} ${lastname}`,
                email,
                password,
            },
            headers: await headers(),
        });
        console.log(response);
        return { success: true, message: "Signed up successfully" };
    } catch (error: unknown) {
        if (error instanceof APIError) {
            return { error: error.message, success: false };
        }
        return { error: "Failed to sign up", success: false };
    }
}

export const signIn = async (prevState: any, formData: FormData) => {
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

        // redirect("/");
        return { success: true, message: "Signed in successfully" };
    } catch (error: unknown) {
        if (error instanceof APIError) {
            return { error: error.message, success: false };
        }
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

export const forgotPassword = async (prevState: any, formData: FormData) => {
    try {
        const email = formData.get("email") as string;

        // TODO: Implement password reset email sending
        // This would typically involve:
        // 1. Generate a reset token
        // 2. Store the token with expiration
        // 3. Send email with reset link
        // For now, we'll just return success
        
        // Example implementation (uncomment when email service is configured):
        // await auth.api.forgotPassword({
        //     body: { email },
        //     headers: await headers(),
        // });

        return { success: true, message: "Password reset email sent" };
    } catch (error: unknown) {
        if (error instanceof APIError) {
            return { error: error.message, success: false };
        }
        console.error(error);
        return { error: "Failed to send reset email", success: false };
    }
}

export const resetPassword = async (prevState: any, formData: FormData) => {
    try {
        const password = formData.get("password") as string;
        const token = formData.get("token") as string;

        // TODO: Implement password reset
        // This would typically involve:
        // 1. Verify the reset token
        // 2. Check token expiration
        // 3. Update the user's password
        // 4. Invalidate the token
        
        // Example implementation (uncomment when auth service supports it):
        // await auth.api.resetPassword({
        //     body: { 
        //         password,
        //         token 
        //     },
        //     headers: await headers(),
        // });

        return { success: true, message: "Password reset successfully" };
    } catch (error: unknown) {
        if (error instanceof APIError) {
            return { error: error.message, success: false };
        }
        console.error(error);
        return { error: "Failed to reset password", success: false };
    }
}