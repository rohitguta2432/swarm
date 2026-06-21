"use server";

import { signIn, signOut } from "@/auth";

// Server actions invoked from <form action={...}> in server components.
export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
