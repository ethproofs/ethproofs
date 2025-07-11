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
  contentLeftTitle = "multi-GPU",
  contentRight,
  contentRightTitle = "1x 4090",
  defaultTab = "right",
}: BasicTabsProps) => {
  return (
    <Tabs defaultValue={defaultTab} className="w-full p-px">
      <TabsList className="w-full">
        <TabsTrigger
          className="w-full hover:bg-gradient-to-b hover:from-primary/10 hover:to-primary/10"
          value="left"
        >
          {contentLeftTitle}
        </TabsTrigger>
        <TabsTrigger
          className="w-full hover:bg-gradient-to-b hover:from-primary/10 hover:to-primary/10"
          value="right"
        >
          {contentRightTitle}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="left">{contentLeft}</TabsContent>
      <TabsContent value="right">{contentRight}</TabsContent>
    </Tabs>
  )
}

BasicTabs.displayName = "BasicTabs"

export default BasicTabs
