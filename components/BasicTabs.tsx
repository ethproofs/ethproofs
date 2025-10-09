import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface BasicTabsProps {
  className?: string
  title?: string
  contentLeft: React.ReactNode
  contentLeftTitle?: string
  contentRight: React.ReactNode
  contentRightTitle?: string
  defaultTab?: "left" | "right"
}
export function BasicTabs({
  className,
  title,
  contentLeft,
  contentLeftTitle = "1x 4090",
  contentRight,
  contentRightTitle = "multi-GPU",
  defaultTab = "left",
}: BasicTabsProps) {
  return (
    <Tabs defaultValue={defaultTab}>
      <div
        className={cn("flex items-end justify-between gap-2 px-6", className)}
      >
        <span className="text-2xl">{title}</span>
        <TabsList className="m h-8 w-[250px] px-0.5">
          <TabsTrigger
            className="flex-1 py-1 data-[state=active]:text-primary"
            value="left"
          >
            {contentLeftTitle}
          </TabsTrigger>
          <TabsTrigger
            className="flex-1 py-1 data-[state=active]:text-primary"
            value="right"
          >
            {contentRightTitle}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="left">{contentLeft}</TabsContent>
      <TabsContent value="right">{contentRight}</TabsContent>
    </Tabs>
  )
}
