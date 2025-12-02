"use server"

import { eq } from "drizzle-orm"
import { authUsers } from "drizzle-orm/supabase"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { PUBLIC_ASSETS_BUCKET } from "@/lib/constants"

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

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath("/", "layout")
  redirect("/")
}

const userSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  website: z.string().optional(),
  github_org: z.string().optional(),
  twitter_handle: z.string().optional(),
  logo: z
    .any()
    .optional()
    .refine(
      (file) => {
        if (!file || !file.size) return true
        return file.type === "image/svg+xml"
      },
      {
        message: "Logo must be a SVG file",
      }
    ),
})

export async function createUser(_prevState: unknown, formData: FormData) {
  const formLogo = formData.get("logo") as File | null

  const validatedFields = userSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    website: formData.get("website"),
    github_org: formData.get("github_org"),
    twitter_handle: formData.get("twitter_handle"),
    logo: formLogo?.size ? formLogo : null,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, name, website, github_org, twitter_handle, logo } =
    validatedFields.data

  try {
    const supabase = await createClient()

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

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    })

    if (error) {
      console.error("error creating user", error)
      return {
        errors: {
          email: ["Error creating user", error?.message],
        },
      }
    }

    let logoUrl = null

    if (logo) {
      const { data, error } = await supabase.storage
        .from(PUBLIC_ASSETS_BUCKET)
        .upload(`${name.toLowerCase().replace(" ", "-")}.svg`, logo)

      if (error) {
        console.error("error uploading logo", error)
        return {
          errors: { logo: ["Error uploading logo"] },
        }
      }

      // Get public url
      const { data: publicUrlData } = supabase.storage
        .from(PUBLIC_ASSETS_BUCKET)
        .getPublicUrl(data.path)

      logoUrl = publicUrlData.publicUrl
    }

    await db
      .update(teams)
      .set({
        name: name,
        website_url: website,
        github_org,
        twitter_handle,
        logo_url: logoUrl,
      })
      .where(eq(teams.id, data.user.id))

    // Revalidate admin page to show new user
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
    const supabase = await createClient()

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

    const userData = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.id, teamId))

    if (userData.length === 0) {
      return {
        errors: { email: ["User not found"] },
      }
    }

    // Create new API key
    const apikey = nanoid(24)
    const hashedKey = await hashToken(apikey)

    await db.insert(apiAuthTokens).values({
      token: hashedKey,
      mode: "write",
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
