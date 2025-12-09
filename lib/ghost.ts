import GhostContentAPI from "@tryghost/content-api"

export const ghost = new GhostContentAPI({
  url: process.env.GHOST_URL!,
  key: process.env.GHOST_CONTENT_KEY!,
  version: "v6.0",
})

export async function getAllPosts() {
  return ghost.posts.browse({
    limit: "all",
    include: ["tags", "authors"],
  })
}

export async function getPostBySlug(slug: string) {
  return ghost.posts.read({ slug }, { include: ["tags", "authors"] })
}
