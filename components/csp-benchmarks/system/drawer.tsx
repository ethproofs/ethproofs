"use client"

import { Globe } from "lucide-react"

import { Null } from "@/components/Null"
import GitHubLogo from "@/components/svgs/github-logo.svg"
import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Item, ItemContent, ItemMedia } from "@/components/ui/item"
import Link from "@/components/ui/link"

import { SystemLegend } from "./legend"
import type { SystemProperties } from "./properties"
import { getSlicesFromSystemProperties } from "./slices"

import { getHost } from "@/lib/url"

interface SystemDrawerProps {
  open: boolean
  onOpenChange(open: boolean): void
  system: SystemProperties | null
}

interface PropertyCellProps {
  label: string
  value: string | number | undefined
}

function PropertyCell({ label, value }: PropertyCellProps) {
  return (
    <div>
      <div className="text-body-secondary">{label}</div>
      <div className="font-medium text-foreground">
        {value !== undefined ? String(value) : <Null />}
      </div>
    </div>
  )
}

interface DrawerBodyProps {
  system: SystemProperties
}

function DrawerBody({ system }: DrawerBodyProps) {
  const slices = getSlicesFromSystemProperties(system)
  const githubUrl = system.github
    ? `https://github.com/${system.github}`
    : undefined

  return (
    <>
      <DrawerHeader className="border-b pb-4">
        <DrawerTitle className="text-xl">{system.proverKey}</DrawerTitle>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="outline">
            {system.is_zkvm ? "zkVM" : "proving system"}
          </Badge>
        </div>
      </DrawerHeader>

      {(githubUrl || system.website) && (
        <div className="border-b py-4">
          <div className="flex flex-wrap justify-center gap-x-4 text-sm">
            {githubUrl && (
              <Item asChild size="sm" className="p-0">
                <Link hideArrow href={githubUrl}>
                  <ItemMedia>
                    <GitHubLogo className="size-4" />
                  </ItemMedia>
                  <ItemContent className="hover:underline">
                    {system.github?.split("/").pop()}
                  </ItemContent>
                </Link>
              </Item>
            )}
            {system.website && (
              <Item asChild size="sm" className="p-0">
                <Link hideArrow href={system.website}>
                  <ItemMedia>
                    <Globe className="size-4" />
                  </ItemMedia>
                  <ItemContent className="hover:underline">
                    {getHost(system.website)}
                  </ItemContent>
                </Link>
              </Item>
            )}
          </div>
        </div>
      )}

      <div className="border-b p-4">
        <h3 className="mb-3 text-base font-medium">
          security overview
        </h3>
        <SystemLegend slices={slices} className="w-full" />
      </div>

      <div className="p-4">
        <h3 className="mb-3 text-base font-medium">
          properties
        </h3>
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <PropertyCell label="proving system" value={system.proving_system} />
          <PropertyCell label="field/curve" value={system.field_curve} />
          <PropertyCell label="IOP" value={system.iop} />
          <PropertyCell label="PCS" value={system.pcs} />
          <PropertyCell label="arithmetization" value={system.arithm} />
          <PropertyCell label="ISA" value={system.isa} />
        </div>
      </div>
    </>
  )
}

export function SystemDrawer({
  open,
  onOpenChange,
  system,
}: SystemDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full w-[420px] overflow-y-auto border-l">
        {system ? <DrawerBody system={system} /> : null}
      </DrawerContent>
    </Drawer>
  )
}
