import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

type MachineTabsProps = {
  multiContent: React.ReactNode
  singleContent: React.ReactNode
}

const MachineTabs = ({ multiContent, singleContent }: MachineTabsProps) => {
  return (
    <Tabs defaultValue="single" className="w-full p-px">
      <TabsList className="w-full">
        <TabsTrigger
          className="w-full hover:bg-gradient-to-b hover:from-primary/10 hover:to-primary/10"
          value="multi"
        >
          multi-GPU
        </TabsTrigger>
        <TabsTrigger
          className="w-full hover:bg-gradient-to-b hover:from-primary/10 hover:to-primary/10"
          value="single"
        >
          single 4090
        </TabsTrigger>
      </TabsList>
      <TabsContent value="multi">{multiContent}</TabsContent>
      <TabsContent value="single">{singleContent}</TabsContent>
    </Tabs>
  )
}

MachineTabs.displayName = "MachineTabs"

export default MachineTabs
