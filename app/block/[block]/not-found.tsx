import NotFoundTemplate from "@/components/NotFoundTemplate"
import Box from "@/components/svgs/box.svg"

export default async function NotFound() {
  return (
    <NotFoundTemplate
      label="Proof"
      icon={<Box strokeWidth="1" className="text-6xl text-primary" />}
    />
  )
}
