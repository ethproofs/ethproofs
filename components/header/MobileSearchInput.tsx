"use client"

import { useState } from "react"

import Magnifier from "@/components/svgs/magnifier.svg"

import { Button } from "../ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "../ui/drawer"

import SearchInput from "./SearchInput"

const MobileSearchInput = () => {
  const [open, setOpen] = useState(false)
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="solid" className="size-8 p-2">
          <Magnifier />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <DrawerHeader className="justify-end">
          <DrawerClose asChild>
            <Button variant="ghost">Close</Button>
          </DrawerClose>
        </DrawerHeader>

        <SearchInput onSubmit={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  )
}

export default MobileSearchInput
