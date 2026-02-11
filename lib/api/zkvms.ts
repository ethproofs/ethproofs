import { and, desc, eq } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import type { ZkvmPendingUpdates } from "@/lib/types"

import { TAGS } from "@/lib/constants"

import { db, type Transaction } from "@/db"
import { zkvms, zkvmVersions } from "@/db/schema"

interface GetZkvmsOptions {
  limit?: number
  includeUnapproved?: boolean
}

export const getZkvms = cache(
  async ({ limit, includeUnapproved = false }: GetZkvmsOptions = {}) => {
    const zkVmsList = await db.query.zkvms.findMany({
      where: includeUnapproved ? undefined : eq(zkvms.approved, true),
      with: {
        versions: {
          orderBy: desc(zkvmVersions.id),
        },
        team: true,
      },
      limit,
    })
    return zkVmsList
  },
  ["zkvms"],
  {
    tags: [TAGS.ZKVMS],
  }
)

interface CreateZkvmData {
  team_id: string
  name: string
  slug: string
  isa: string
  repo_url?: string | null
  is_open_source?: boolean
  is_dual_licensed?: boolean
  is_proving_mainnet?: boolean
}

export async function createZkvm(data: CreateZkvmData) {
  const [zkvm] = await db
    .insert(zkvms)
    .values({
      team_id: data.team_id,
      name: data.name,
      slug: data.slug,
      isa: data.isa,
      repo_url: data.repo_url ?? null,
      is_open_source: data.is_open_source ?? false,
      is_dual_licensed: data.is_dual_licensed ?? false,
      is_proving_mainnet: data.is_proving_mainnet ?? false,
      approved: false,
      update_status: "pending",
    })
    .returning()
  return zkvm
}

interface UpdateZkvmData {
  name?: string
  isa?: string
  repo_url?: string | null
  is_open_source?: boolean
  is_dual_licensed?: boolean
  is_proving_mainnet?: boolean
}

export async function updateZkvm(
  id: number,
  data: UpdateZkvmData,
  tx?: Transaction
) {
  const executor = tx ?? db
  const [zkvm] = await executor
    .update(zkvms)
    .set({
      ...data,
      update_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .where(eq(zkvms.id, id))
    .returning()
  return zkvm
}

export async function setZkvmPendingUpdates(
  id: number,
  changes: ZkvmPendingUpdates
) {
  const [zkvm] = await db
    .update(zkvms)
    .set({
      pending_updates: changes,
      update_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .where(eq(zkvms.id, id))
    .returning()
  return zkvm
}

export async function clearZkvmPendingUpdates(id: number, tx?: Transaction) {
  const executor = tx ?? db
  const [zkvm] = await executor
    .update(zkvms)
    .set({
      pending_updates: null,
      update_status: null,
      updated_at: new Date().toISOString(),
    })
    .where(eq(zkvms.id, id))
    .returning()
  return zkvm
}

export async function rejectZkvmUpdates(id: number) {
  const [zkvm] = await db
    .update(zkvms)
    .set({
      pending_updates: null,
      update_status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .where(eq(zkvms.id, id))
    .returning()
  return zkvm
}

export async function approveZkvm(id: number) {
  const [zkvm] = await db
    .update(zkvms)
    .set({
      approved: true,
      pending_updates: null,
      update_status: null,
      updated_at: new Date().toISOString(),
    })
    .where(eq(zkvms.id, id))
    .returning()
  return zkvm
}

export async function getPendingZkvms() {
  const pendingZkvms = await db.query.zkvms.findMany({
    where: eq(zkvms.update_status, "pending"),
    with: {
      versions: {
        orderBy: desc(zkvmVersions.id),
      },
      team: true,
    },
  })
  return pendingZkvms
}

export const getZkvm = cache(
  async ({ id, slug }: { id?: number; slug?: string }) => {
    const filter = id
      ? eq(zkvms.id, id)
      : slug
        ? eq(zkvms.slug, slug)
        : undefined

    if (!filter) {
      throw new Error("Either id or slug must be provided")
    }

    const zkvm = await db.query.zkvms.findFirst({
      where: () => filter,
      with: {
        versions: {
          orderBy: desc(zkvmVersions.id),
        },
        team: true,
      },
    })
    return zkvm
  }
)

interface GetZkvmsByTeamIdOptions {
  includeUnapproved?: boolean
}

export async function getZkvmsByTeamId(
  teamId: string,
  options: GetZkvmsByTeamIdOptions = {}
) {
  const { includeUnapproved = false } = options
  const zkVmsList = await db.query.zkvms.findMany({
    where: includeUnapproved
      ? eq(zkvms.team_id, teamId)
      : and(eq(zkvms.team_id, teamId), eq(zkvms.approved, true)),
    with: {
      versions: {
        orderBy: desc(zkvmVersions.id),
      },
      team: true,
    },
  })
  return zkVmsList
}
