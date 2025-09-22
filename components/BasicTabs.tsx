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
    <div className="px-6">
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="left">{contentLeftTitle}</TabsTrigger>
          <TabsTrigger value="right">{contentRightTitle}</TabsTrigger>
        </TabsList>
        <TabsContent value="left">{contentLeft}</TabsContent>
        <TabsContent value="right">{contentRight}</TabsContent>
      </Tabs>
    </div>
  )
}

BasicTabs.displayName = "BasicTabs"

export default BasicTabs
