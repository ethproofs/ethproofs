import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface BasicTabsProps {
  contentLeft: React.ReactNode
  contentLeftTitle?: string
  contentRight: React.ReactNode
  contentRightTitle?: string
  defaultTab?: "left" | "right"
}

const BasicTabs = ({
  contentLeft,
  contentLeftTitle = "1x 4090",
  contentRight,
  contentRightTitle = "multi-GPU",
  defaultTab = "left",
}: BasicTabsProps) => {
  return (
    <div className="px-6">
      <Tabs defaultValue={defaultTab}>
        <div className="flex items-end justify-between gap-2">
          <span className="text-2xl">blocks</span>
          <TabsList className="w-[250px]">
            <TabsTrigger
              className="flex-1 data-[state=active]:text-primary"
              value="left"
            >
              {contentLeftTitle}
            </TabsTrigger>
            <TabsTrigger
              className="flex-1 data-[state=active]:text-primary"
              value="right"
            >
              {contentRightTitle}
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="left">{contentLeft}</TabsContent>
        <TabsContent value="right">{contentRight}</TabsContent>
      </Tabs>
    </div>
  )
}

BasicTabs.displayName = "BasicTabs"

export default BasicTabs
