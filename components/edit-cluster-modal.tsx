"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import type { Cluster } from "@/lib/zod/schemas/cluster"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface EditClusterModalProps {
  cluster: Cluster & {
    id: string
    team_id: string
    versions: Array<{
      id: number
      version: string
      zkvm_version_id: number
      zkvm_version: {
        id: number
        zkvm_id: number
        version: string
      }
      cluster_machines: Array<{
        id: number
        machine_count: number
        cloud_instance_count: number
        machine: any
        cloud_instance: any
      }>
    }>
  }
  zkvmVersions: Array<{
    id: number
    zkvm_id: number
    version: string
    zkvm: {
      id: number
      name: string
      slug: string
    }
  }>
  cloudInstances: Array<{
    id: number
    instance_name: string
    provider_id: number
    hourly_price: number
  }>
}

export function EditClusterModal({
  cluster,
  zkvmVersions,
  cloudInstances,
}: EditClusterModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastVersion = cluster.versions[0]

  const [formData, setFormData] = useState({
    nickname: cluster.nickname,
    description: cluster.description || "",
    cycle_type: cluster.cycle_type || "",
    proof_type: cluster.proof_type || "",
    zkvm_version_id: lastVersion.zkvm_version_id,
    configuration: lastVersion.cluster_machines.map((cm) => ({
      machine: cm.machine,
      machine_count: cm.machine_count,
      cloud_instance_name: cm.cloud_instance.instance_name,
      cloud_instance_count: cm.cloud_instance_count,
    })),
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleConfigChange = (
    index: number,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      configuration: prev.configuration.map((config, i) =>
        i === index ? { ...config, [field]: value } : config
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/internal/clusters/${cluster.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to update cluster")
      }

      setIsOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Cluster</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Cluster Configuration</DialogTitle>
          <DialogDescription>
            Update your cluster settings. Configuration changes will create a new version.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Versions Info */}
          <Card className="bg-background-accent p-4">
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">Current Cluster Version:</span>{" "}
                <span className="text-primary">{lastVersion.version}</span>
              </div>
              <div>
                <span className="font-medium">Current ZkVM Version:</span>{" "}
                <span className="text-primary">
                  {zkvmVersions.find((v) => v.id === formData.zkvm_version_id)?.zkvm?.name} v
                  {zkvmVersions.find((v) => v.id === formData.zkvm_version_id)?.version}
                </span>
              </div>
            </div>
          </Card>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nickname
              </label>
              <Input
                value={formData.nickname}
                onChange={(e) => handleChange("nickname", e.target.value)}
                placeholder="e.g., ZKnight-01"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="e.g., Primary RISC-V prover"
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cycle Type
                </label>
                <Input
                  value={formData.cycle_type}
                  onChange={(e) => handleChange("cycle_type", e.target.value)}
                  placeholder="e.g., SP1"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Proof Type
                </label>
                <Input
                  value={formData.proof_type}
                  onChange={(e) => handleChange("proof_type", e.target.value)}
                  placeholder="e.g., Groth16"
                  maxLength={50}
                />
              </div>
            </div>
          </div>

          {/* ZkVM Version */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">ZkVM Version</h3>
            <p className="text-xs text-body-secondary">
              You can only upgrade to newer versions of the current zkVM. Switching to a different zkVM is not supported via cluster updates.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Version
              </label>
              <select
                value={formData.zkvm_version_id}
                onChange={(e) =>
                  handleChange("zkvm_version_id", parseInt(e.target.value))
                }
                className="w-full rounded border border-primary-border bg-background px-3 py-2"
              >
                {zkvmVersions
                  .filter(
                    (version) =>
                      version.zkvm_id === lastVersion.zkvm_version.zkvm_id
                  )
                  .map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.zkvm.name} v{version.version}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Hardware Configuration</h3>
            {formData.configuration.map((config, index) => (
              <Card key={index} className="p-4 space-y-3">
                <div className="text-sm font-medium">Machine {index + 1}</div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Machine Count
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={config.machine_count}
                      onChange={(e) =>
                        handleConfigChange(
                          index,
                          "machine_count",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Cloud Instance
                    </label>
                    <select
                      value={config.cloud_instance_name}
                      onChange={(e) =>
                        handleConfigChange(
                          index,
                          "cloud_instance_name",
                          e.target.value
                        )
                      }
                      className="w-full rounded border border-primary-border bg-background px-3 py-2 text-sm"
                    >
                      {cloudInstances.map((instance) => (
                        <option
                          key={instance.id}
                          value={instance.instance_name}
                        >
                          {instance.instance_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Cloud Instance Count
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={config.cloud_instance_count}
                    onChange={(e) =>
                      handleConfigChange(
                        index,
                        "cloud_instance_count",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>

                <div className="space-y-2 rounded bg-background-accent p-2 text-xs">
                  <div>CPU: {config.machine.cpu_cores} cores</div>
                  {config.machine.gpu_count && (
                    <div>GPU: {config.machine.gpu_count} {config.machine.gpu_models?.[0]}</div>
                  )}
                  <div>
                    Memory: {config.machine.memory_size_gb[0]} GB
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {error && (
            <div className="rounded border border-red-500 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Updating..." : "Update Cluster"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
