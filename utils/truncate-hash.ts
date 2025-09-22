export function truncateHash(hash: string, start = 6, end = 4): string {
  return `${hash.slice(0, start)}...${hash.slice(-end)}`
}
