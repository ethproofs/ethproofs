"use server"

import { eq } from "drizzle-orm"
import { authUsers } from "drizzle-orm/supabase"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { db } from "@/db"
import { apiAuthTokens, teams } from "@/db/schema"
import { hashToken } from "@/lib/auth/hash-token"
import { createClient } from "@/utils/supabase/server"

const API_KEY_MANAGER_ROLE = "api_key_manager"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function login(_prevState: unknown, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      errors: {
        email: ["Invalid credentials"],
      },
    }
  }

  revalidatePath("/admin", "layout")
  redirect("/admin")
}

const userSchema = z.object({
  email: z.string().email(),
  name: z.string(),
})

export async function createUser(_prevState: unknown, formData: FormData) {
  const validatedFields = userSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, name } = validatedFields.data

  try {
    const supabase = createClient()

    // check if logged user is using the correct role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.role !== API_KEY_MANAGER_ROLE) {
      return {
        errors: {
          email: ["Unauthorized"],
        },
      }
    }

    // create user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    })

    if (error) {
      console.error("error creating user", error)
      return {
        errors: {
          email: ["Error creating user"],
        },
      }
    }

    // update team name
    await db
      .update(teams)
      .set({
        name: name,
      })
      .where(eq(teams.id, data.user.id))

    // revalidate admin page to show new user
    revalidatePath("/admin", "page")

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

const apiKeySchema = z.object({
  team: z.string(),
})

export async function generateApiKey(_prevState: unknown, formData: FormData) {
  const validatedFields = apiKeySchema.safeParse({
    team: formData.get("team"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { team: teamId } = validatedFields.data

  try {
    const supabase = createClient()

    // check if logged user is using the correct role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.role !== API_KEY_MANAGER_ROLE) {
      return {
        errors: {
          email: ["Unauthorized"],
        },
      }
    }

    // get user
    const userData = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.id, teamId))

    if (userData.length === 0) {
      return {
        errors: { email: ["User not found"] },
      }
    }

    // create new api key
    const apikey = nanoid(24)
    const hashedKey = await hashToken(apikey)

    await db.insert(apiAuthTokens).values({
      token: hashedKey,
      mode: "all",
      team_id: userData[0].id,
    })

    return {
      data: { user: userData[0], apikey },
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
