import { Cpu } from "lucide-react"

import NotFoundTemplate from "@/components/NotFoundTemplate"

export default async function NotFound() {
  return (
    <NotFoundTemplate
      icon={
        <Cpu className="ms-4 inline size-14 text-primary" strokeWidth="1.5" />
      }
      label="Cluster"
      href="/clusters"
    >
      View all clusters
    </NotFoundTemplate>
  )
}
