import { cn } from "@/lib/utils"

type LampEffectProps = Pick<React.HTMLAttributes<HTMLDivElement>, "className">

export const LampEffect = ({ className }: LampEffectProps) => {
  const getBgImage = (intensity: string, spread: string) =>
    `radial-gradient(
      ellipse at 50% 0%,
      hsla(var(--light-source-color), ${intensity}) 0%,
      hsla(var(--light-source-color), calc(${intensity} * 0.5)) calc(${spread} * 0.25),
      transparent ${spread}
    )`

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 h-[40rem] w-full translate-y-[-50%] scale-x-125 bg-transparent dark:mix-blend-plus-lighter md:h-[calc((100vw_-_var(--sidebar-width))_*_0.4)]",
        className
      )}
    >
      {/* Primary light source - stronger intensity */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: getBgImage(
            "var(--light-source-intensity)",
            "var(--light-source-spread)"
          ),
        }}
      />
      {/* Secondary light source - provides a more ambient glow with wider spread */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: getBgImage(
            "var(--light-source-secondary-intensity)",
            "var(--light-source-secondary-spread)"
          ),
        }}
      />
    </div>
  )
}

LampEffect.displayName = "LampEffect"

export default LampEffect
