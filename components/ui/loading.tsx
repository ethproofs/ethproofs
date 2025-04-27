import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"
import { Skeleton } from "./skeleton"

export const ProofsStatsLoading = ({ title }: { title: string }) => {
  return (
    <Card className="border-1 relative space-y-4 overflow-hidden dark:bg-black/10 md:space-y-4">
      <CardHeader className="flex flex-col gap-6 space-y-0 py-5">
        <CardTitle className="text-lg font-normal">{title}</CardTitle>
        <div className="flex">
          <div className="flex flex-1 flex-col items-center border-e text-center">
            <span className="block text-sm font-bold uppercase">avg</span>
            <span className="block font-mono text-3xl text-primary">
              <Skeleton className="h-4 w-10" />
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center text-center">
            <span className="block text-sm font-bold uppercase">median</span>
            <span className="block font-mono text-3xl text-primary">
              <Skeleton className="h-4 w-10" />
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-[250px] w-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
        </div>
      </CardContent>
      <CardFooter className="gap-4">
        {/* TODO: skeleton loading */}
        <div className="flex h-10 w-full items-center justify-center">
          <Skeleton className="h-4 w-10" />
        </div>
      </CardFooter>
    </Card>
  )
}
