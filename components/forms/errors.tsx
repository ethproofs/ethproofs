export function Errors({ errors }: { errors: Record<string, string[]> }) {
  return (
    <p className="text-sm text-red-500" aria-live="polite">
      {Object.values(errors).flat().join(", ")}
    </p>
  )
}
