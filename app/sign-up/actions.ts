"use server"

import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { teams } from "@/db/schema"
import { createClient } from "@/utils/supabase/server"

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Team name is required"),
})

export async function signUp(_prevState: unknown, formData: FormData) {
  const validatedFields = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, name } = validatedFields.data

  try {
    const supabase = await createClient()

    // Create the user account with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/sign-in`,
      },
    })

    if (error) {
      console.error("error creating user", error)
      return {
        errors: {
          email: [error.message],
        },
      }
    }

    if (!data.user) {
      return {
        errors: {
          email: ["Failed to create user account"],
        },
      }
    }

    // Update the teams table with team info and set approved to false
    await db
      .update(teams)
      .set({
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        approved: false, // This is the key - user must be approved by admin
      })
      .where(eq(teams.id, data.user.id))

    // Sign out the user immediately since they're not approved yet
    // This prevents them from accessing protected pages
    await supabase.auth.signOut()

    return {
      data: { user: data.user },
    }
  } catch (error) {
    console.error("error creating user", error)

    return {
      errors: {
        email: ["Internal server error"],
      },
    }
  }
}
