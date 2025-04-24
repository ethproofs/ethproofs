"use client"

import { useState } from "react"

import { CloudInstance } from "@/lib/types"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function CloudInstancesTable({
  instances,
}: {
  instances: CloudInstance[]
}) {
  const [provider, setProvider] = useState<string>("vastai")

  const filteredInstances = instances.filter(
    (instance) => instance.provider === provider
  )

  const snapshotDate = filteredInstances[0].snapshot_date

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aws">AWS</SelectItem>
            <SelectItem value="vastai">Vast.ai</SelectItem>
          </SelectContent>
        </Select>

        <p className="text-secondary text-sm">
          Snapshot taken on{" "}
          {snapshotDate
            ? new Date(snapshotDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "N/A"}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Instance Name</TableHead>
            <TableHead>CPU Name</TableHead>
            <TableHead>CPU Cores</TableHead>
            <TableHead>GPU</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Disk Name</TableHead>
            <TableHead>Disk Space</TableHead>
            <TableHead>Region</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInstances.map((instance) => (
            <TableRow key={instance.id}>
              <TableCell className="border-l-2 border-r-2 border-primary bg-primary/5">
                {instance.instance_name}
              </TableCell>
              <TableCell>{instance.cpu_name}</TableCell>
              <TableCell>{instance.cpu_cores}</TableCell>
              <TableCell>{instance.gpu_count}</TableCell>
              <TableCell>{instance.memory}</TableCell>
              <TableCell>{instance.disk_name}</TableCell>
              <TableCell>{instance.disk_space}</TableCell>
              <TableCell>{instance.region}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
