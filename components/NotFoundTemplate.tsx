import { ButtonLink } from "./ui/button"
import { HeroSection } from "./ui/hero"
import { type LinkProps } from "./ui/link"

type NotFoundTemplateProps = Partial<
  Pick<React.HTMLAttributes<HTMLDivElement>, "children"> &
    Pick<LinkProps, "href"> & {
      icon: React.ReactNode
      label: string
    }
>

const NotFoundTemplate = ({
  children = "View all proofs",
  href = "/",
  label = "page",
  icon,
}: NotFoundTemplateProps) => {
  return (
    <>
      <HeroSection className="space-y-4">
        <h1 className="flex flex-col items-center gap-4 font-mono md:flex-row">
          404 {icon}
        </h1>
        <p className="text-center font-mono md:text-start">{label} not found</p>
      </HeroSection>
      <div className="justify-center p-6 max-md:flex">
        <ButtonLink href={href} className="mx-auto h-fit w-fit" size="lg">
          {children}
        </ButtonLink>
      </div>
    </>
  )
}

export default NotFoundTemplate
