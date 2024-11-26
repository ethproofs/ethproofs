import Image, { type ImageProps } from "next/image"

import { cn } from "@/lib/utils"

import { FALLBACK_TEAM_LOGO_SRC } from "@/lib/constants"

type TeamLogoProps = Omit<ImageProps, "src" | "alt"> & {
  src?: ImageProps["src"] | null
  alt?: ImageProps["alt"]
}

const TeamLogo = ({ src, alt, className, ...props }: TeamLogoProps) => (
  <Image
    src={src || FALLBACK_TEAM_LOGO_SRC}
    alt={alt || "Team logo"}
    fill
    sizes="100vw"
    className={cn("object-contain object-left dark:invert", className)}
    {...props}
  />
)

export default TeamLogo
