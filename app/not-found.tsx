import TriangleAlert from "@/components/svgs/triangle-alert.svg"
import { ButtonLink } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"

export default async function NotFound() {
  return (
    <div className="mt-40 flex flex-col items-center gap-4 text-center">
      <TriangleAlert className="size-40 stroke-[1.25px] text-primary" />
      <h1 className="mb-4 font-normal text-primary">404</h1>
      <p className="text-lg">...oops, nothing here</p>
      <Divider className="my-6" />
      <ButtonLink href="/" variant="outline" size="lg">
        back to homepage
      </ButtonLink>
    </div>
  )
}
