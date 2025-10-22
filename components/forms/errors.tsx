export function Errors({ errors }: { errors: Record<string, string[]> }) {
  return (
    <div className="flex flex-col gap-2">
      {Object.values(errors)
        .flat()
        .map((error) => (
          <p className="text-sm text-red-500" aria-live="polite" key={error}>
            {error}
          </p>
        ))}
    </div>
  )
}
