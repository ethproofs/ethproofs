"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { Errors } from "@/components/forms/errors"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { DashboardCluster } from "./columns"

import {
  createCluster,
  updateCluster,
} from "@/app/teams/[teamSlug]/dashboard/actions"

type ZkvmVersion = {
  id: number
  version: string
  zkvm: {
    id: number
    name: string
    slug: string
  }
}

type ProverType = {
  id: number
  name: string
  processing_ratio: string
  gpu_configuration: string
  deployment_type: string
}

type GuestProgram = {
  id: number
  name: string
}

interface ClusterManagementDrawerProps {
  mode: "create" | "edit"
  cluster?: DashboardCluster
  zkvmVersions: ZkvmVersion[]
  proverTypes: ProverType[]
  guestPrograms: GuestProgram[]
  open: boolean
  onOpenChange: (open: boolean) => void
  teamSlug: string
}

interface FormState {
  loading: boolean
  errors: Record<string, string[]>
  success: boolean
}

const initialState: FormState = {
  loading: false,
  errors: {},
  success: false,
}

export function ClusterDrawer({
  mode,
  cluster,
  zkvmVersions,
  proverTypes,
  guestPrograms,
  open,
  onOpenChange,
  teamSlug,
}: ClusterManagementDrawerProps) {
  const router = useRouter()
  const [state, setState] = useState<FormState>(initialState)
  const [selectedFileName, setSelectedFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get active version for edit mode
  const activeVersion =
    cluster?.versions.find((v) => v.is_active) || cluster?.versions[0]

  const [proverTypeId, setProverTypeId] = useState<string>(
    cluster?.prover_type?.id.toString() || ""
  )
  const [zkvmVersionId, setZkvmVersionId] = useState<string>(
    activeVersion?.zkvm_version_id?.toString() || ""
  )
  const [guestProgramId, setGuestProgramId] = useState<string>(
    cluster?.guest_program?.id.toString() || ""
  )
  const [isActive, setIsActive] = useState<boolean>(cluster?.is_active ?? true)

  useEffect(() => {
    setState(initialState)
    setSelectedFileName("")
    setProverTypeId(cluster?.prover_type?.id.toString() || "")
    setZkvmVersionId(activeVersion?.zkvm_version_id?.toString() || "")
    setGuestProgramId(cluster?.guest_program?.id.toString() || "")
    setIsActive(cluster?.is_active ?? true)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [
    open,
    cluster?.prover_type?.id,
    activeVersion?.zkvm_version_id,
    cluster?.guest_program?.id,
    cluster?.is_active,
  ])

  // Close drawer on successful submission
  useEffect(() => {
    if (state.success) {
      router.refresh()
      onOpenChange(false)
    }
  }, [state.success, onOpenChange, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFileName(file?.name ?? "")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState({ loading: true, errors: {}, success: false })

    try {
      const formData = new FormData(e.currentTarget)

      // Call the appropriate server action
      const result =
        mode === "create"
          ? await createCluster(null, formData)
          : await updateCluster(null, formData)

      if ("errors" in result && result.errors) {
        setState({
          loading: false,
          errors: result.errors,
          success: false,
        })
        return
      }

      // If there's a file to upload
      const file = fileInputRef.current?.files?.[0]
      if (file && "clusterId" in result && result.clusterId) {
        // Determine version ID
        const versionId =
          mode === "create"
            ? "versionId" in result
              ? result.versionId
              : null
            : activeVersion?.id

        if (versionId) {
          // Upload VK file
          const uploadFormData = new FormData()
          uploadFormData.append("file", file)
          uploadFormData.append("cluster_id", result.clusterId)
          uploadFormData.append("version_id", String(versionId))

          const uploadResponse = await fetch("/api/verification-keys/upload", {
            method: "POST",
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text()
            setState({
              loading: false,
              errors: {
                _form: [errorText || "failed to upload verification key"],
              },
              success: false,
            })
            return
          }
        }
      }

      setState({
        loading: false,
        errors: {},
        success: true,
      })
    } catch (error) {
      setState({
        loading: false,
        errors: {
          _form: [
            error instanceof Error
              ? error.message
              : "an unexpected error occurred",
          ],
        },
        success: false,
      })
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full w-[500px] overflow-y-auto border-l">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>
            {mode === "create" ? "create cluster" : "edit cluster"}
          </DrawerTitle>
          {mode === "edit" && cluster && (
            <span className="font-mono text-xs text-muted-foreground">
              {cluster.id}
            </span>
          )}
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
          <div className="flex-1 space-y-4">
            {/* Hidden fields for edit mode */}
            {mode === "edit" && cluster && (
              <>
                <input type="hidden" name="id" value={cluster.id} />
                <input
                  type="hidden"
                  name="original_is_active"
                  value={cluster.is_active ? "true" : "false"}
                />
                <input
                  type="hidden"
                  name="original_name"
                  value={cluster.name}
                />
                <input
                  type="hidden"
                  name="original_num_gpus"
                  value={cluster.num_gpus}
                />
                <input
                  type="hidden"
                  name="original_hardware_description"
                  value={cluster.hardware_description || ""}
                />
                <input
                  type="hidden"
                  name="original_prover_type_id"
                  value={cluster.prover_type?.id || ""}
                />
                <input
                  type="hidden"
                  name="original_guest_program_id"
                  value={cluster.guest_program?.id || ""}
                />
                <input
                  type="hidden"
                  name="original_zkvm_version_id"
                  value={activeVersion?.zkvm_version_id || ""}
                />
                <input
                  type="hidden"
                  name="original_vk_path"
                  value={activeVersion?.vk_path || ""}
                />
              </>
            )}
            <input type="hidden" name="team_slug" value={teamSlug} />

            {/* Cluster Metadata Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold underline">
                cluster details
              </h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(val) => setIsActive(Boolean(val))}
                />
                <input
                  type="hidden"
                  name="is_active"
                  value={isActive ? "true" : "false"}
                />
                <Label
                  htmlFor="is_active"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  active
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="ZKnight-01"
                  defaultValue={cluster?.name}
                  required
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  max 50 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_gpus">number of GPUs</Label>
                <Input
                  id="num_gpus"
                  name="num_gpus"
                  type="number"
                  min="1"
                  placeholder="8"
                  defaultValue={cluster?.num_gpus || 1}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prover_type_id">prover type</Label>
                <Select
                  value={proverTypeId}
                  onValueChange={setProverTypeId}
                  required
                >
                  <SelectTrigger id="prover_type_id">
                    <SelectValue placeholder="select a prover type" />
                  </SelectTrigger>
                  <SelectContent>
                    {proverTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="prover_type_id"
                  value={proverTypeId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest_program_id">
                  guest program (optional)
                </Label>
                <Select
                  value={guestProgramId}
                  onValueChange={setGuestProgramId}
                >
                  <SelectTrigger id="guest_program_id">
                    <SelectValue placeholder="select a guest program" />
                  </SelectTrigger>
                  <SelectContent>
                    {guestPrograms.map((program) => (
                      <SelectItem
                        key={program.id}
                        value={program.id.toString()}
                      >
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="guest_program_id"
                  value={guestProgramId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hardware_description">
                  hardware description (optional)
                </Label>
                <Input
                  id="hardware_description"
                  name="hardware_description"
                  type="text"
                  placeholder="8x NVIDIA H100 80GB GPUs, AMD EPYC..."
                  defaultValue={cluster?.hardware_description || ""}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  max 200 characters
                </p>
              </div>
            </div>

            {/* Version Metadata Section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold underline">zkVM details</h3>

              <div className="space-y-2">
                <Label htmlFor="zkvm_version_id">zkVM version</Label>
                <Select
                  value={zkvmVersionId}
                  onValueChange={setZkvmVersionId}
                  required={mode === "create"}
                >
                  <SelectTrigger id="zkvm_version_id">
                    <SelectValue placeholder="select a zkVM version" />
                  </SelectTrigger>
                  <SelectContent>
                    {zkvmVersions.map((version) => (
                      <SelectItem
                        key={version.id}
                        value={version.id.toString()}
                      >
                        {version.zkvm.name} v{version.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="zkvm_version_id"
                  value={zkvmVersionId}
                />
                {mode === "edit" && (
                  <p className="text-xs text-muted-foreground">
                    changing this will create a new cluster version
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vk_upload">verification key (optional)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="vk_upload"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".bin,.key"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    {selectedFileName || "choose file"}
                  </Button>
                </div>
                {mode === "edit" && (
                  <p className="text-xs text-muted-foreground">
                    uploading a new file will create a new cluster version
                  </p>
                )}
              </div>
            </div>

            <Errors errors={state.errors ?? {}} />
          </div>

          <DrawerFooter className="px-0">
            <Button type="submit" disabled={state.loading}>
              {state.loading
                ? "saving..."
                : mode === "create"
                  ? "create cluster"
                  : "save changes"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={state.loading}>
                cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
