import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

type MachineTabsProps = {
  multiContent: React.ReactNode
  singleContent: React.ReactNode
}

const MachineTabs = ({ multiContent, singleContent }: MachineTabsProps) => {
  return (
    <Tabs defaultValue="multi" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger className="w-full" value="multi">
          Multi-machine
        </TabsTrigger>
        <TabsTrigger className="w-full" value="single">
          Single machine
        </TabsTrigger>
      </TabsList>
      <TabsContent value="multi">{multiContent}</TabsContent>
      <TabsContent value="single">{singleContent}</TabsContent>
    </Tabs>
  )
}

MachineTabs.displayName = "MachineTabs"

export default MachineTabs
