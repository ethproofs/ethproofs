import NotFoundTemplate from "@/components/NotFoundTemplate"
import ProofCircle from "@/components/svgs/proof-circle.svg"

export default async function NotFound() {
  return (
    <NotFoundTemplate
      icon={<ProofCircle className="inline text-primary" />}
      label="Teams"
      href="/teams"
    >
      View all proving teams
    </NotFoundTemplate>
  )
}
