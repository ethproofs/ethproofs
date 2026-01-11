"use server"

import { eq } from "drizzle-orm"
import { authUsers } from "drizzle-orm/supabase"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { API_KEY_MANAGER_ROLE, PUBLIC_ASSETS_BUCKET } from "@/lib/constants"

import { db } from "@/db"
import { apiAuthTokens, teams } from "@/db/schema"
import { hashToken } from "@/lib/auth/hash-token"
import { createClient } from "@/utils/supabase/server"

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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      errors: {
        email: ["invalid credentials"],
      },
    }
  }

  // Check if the team is approved and get team data
  if (data.user) {
    // Check if user is an admin
    if (data.user.role === API_KEY_MANAGER_ROLE) {
      // Admin: redirect to admin panel
      revalidatePath("/admin", "layout")
      redirect("/admin")
    }

    const teamData = await db
      .select()
      .from(teams)
      .where(eq(teams.id, data.user.id))

    if (teamData.length === 0) {
      // No team found for this user
      await supabase.auth.signOut()
      return {
        errors: {
          email: ["team not found"],
        },
      }
    }

    if (!teamData[0].approved) {
      // Sign out the user since they're not approved yet
      await supabase.auth.signOut()

      return {
        errors: {
          email: ["your account is pending approval"],
        },
      }
    }

    revalidatePath("/teams", "layout")
    redirect(`/teams/${teamData[0].slug}`)
  }

  // Fallback redirect (shouldn't reach here)
  revalidatePath("/teams", "layout")
  redirect("/teams")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath("/", "layout")
  redirect("/")
}

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function forgotPassword(_prevState: unknown, formData: FormData) {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  })

  if (error) {
    console.error("Password reset error:", error)
    return {
      errors: {
        email: [`failed to send reset email: ${error.message.toLowerCase()}`],
      },
    }
  }

  return {
    success: true,
  }
}

const resetPasswordSchema = z.object({
  password: z.string().min(6, "password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "password must be at least 6 characters"),
})

export async function resetPassword(_prevState: unknown, formData: FormData) {
  const validatedFields = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password, confirmPassword } = validatedFields.data

  if (password !== confirmPassword) {
    return {
      errors: {
        confirmPassword: ["passwords do not match"],
      },
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return {
      errors: {
        password: ["failed to update password"],
      },
    }
  }

  // Get team slug for redirect
  if (data.user) {
    const teamData = await db
      .select()
      .from(teams)
      .where(eq(teams.id, data.user.id))

    if (teamData.length > 0 && teamData[0].slug) {
      revalidatePath(`/teams/${teamData[0].slug}`, "layout")
      redirect(`/teams/${teamData[0].slug}/dashboard`)
    }
  }

  // Fallback to home if team not found
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
        message: "logo must be an SVG file",
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
          email: ["unauthorized"],
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
          email: ["error creating user", error?.message.toLowerCase()],
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
          errors: { logo: ["error uploading logo"] },
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
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        website_url: website,
        github_org,
        twitter_handle,
        logo_url: logoUrl,
        approved: true, // Auto-approve admin-created users
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
        email: ["internal server error"],
      },
    }
  }
}

const teamApprovalSchema = z.object({
  teamId: z.string().uuid(),
})

export async function approveTeam(_prevState: unknown, formData: FormData) {
  const validatedFields = teamApprovalSchema.safeParse({
    teamId: formData.get("teamId"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { teamId } = validatedFields.data

  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.role !== API_KEY_MANAGER_ROLE) {
      return {
        errors: {
          teamId: ["unauthorized"],
        },
      }
    }

    // Update the team to approved
    await db.update(teams).set({ approved: true }).where(eq(teams.id, teamId))

    // Auto-generate an API key for the newly approved team
    const apikey = nanoid(24)
    const hashedKey = await hashToken(apikey)

    await db.insert(apiAuthTokens).values({
      token: hashedKey,
      mode: "write",
      team_id: teamId,
    })

    return {
      data: { success: true, apikey },
    }
  } catch (error) {
    console.error("error approving team", error)

    return {
      errors: {
        teamId: ["internal server error"],
      },
    }
  }
}

export async function rejectTeam(_prevState: unknown, formData: FormData) {
  const validatedFields = teamApprovalSchema.safeParse({
    teamId: formData.get("teamId"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { teamId } = validatedFields.data

  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.role !== API_KEY_MANAGER_ROLE) {
      return {
        errors: {
          teamId: ["unauthorized"],
        },
      }
    }

    // Delete the team and associated auth user
    // Note: This will cascade delete due to foreign key constraints
    await db.delete(teams).where(eq(teams.id, teamId))

    // Also delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(teamId)

    if (error) {
      console.error("error deleting user from auth", error)
    }

    revalidatePath("/admin", "page")

    return {
      data: { success: true },
    }
  } catch (error) {
    console.error("error rejecting team", error)

    return {
      errors: {
        teamId: ["internal server error"],
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
          email: ["unauthorized"],
        },
      }
    }

    const userData = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.id, teamId))

    if (userData.length === 0) {
      return {
        errors: { email: ["user not found"] },
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
        email: ["internal server error"],
      },
    }
  }
}
