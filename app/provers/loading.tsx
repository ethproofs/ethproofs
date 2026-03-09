import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <Spinner className="text-muted-foreground" />
      <p className="text-muted-foreground">loading provers...</p>
    </div>
  )
}
