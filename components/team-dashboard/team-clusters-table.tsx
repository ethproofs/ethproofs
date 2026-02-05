"use client"

import { DataTable } from "@/components/data-table/data-table"

import { columns, DashboardCluster } from "./columns"

interface TeamClustersTableProps {
  clusters: DashboardCluster[]
  onEdit: (cluster: DashboardCluster) => void
}

export function TeamClustersTable({
  clusters,
  onEdit,
}: TeamClustersTableProps) {
  return (
    <DataTable
      className="mt-4"
      columns={columns}
      data={clusters}
      onEdit={onEdit}
      showToolbar={false}
      showPagination={clusters.length > 10}
    />
  )
}
