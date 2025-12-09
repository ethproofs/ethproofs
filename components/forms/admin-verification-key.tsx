"use client"

import { useEffect, useRef, useState } from "react"

import type { Cluster, ClusterVersion } from "@/lib/types"

import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

import { Errors } from "./errors"
import { SubmitButton } from "./submit-button"

interface AdminVerificationKeyFormProps {
  clusters: Cluster[]
}

interface FormState {
  loading: boolean
  errors: Record<string, string[]>
  success: boolean
  filename?: string
}

const initialState: FormState = {
  loading: false,
  errors: {},
  success: false,
}

export function AdminVerificationKeyForm({
  clusters,
}: AdminVerificationKeyFormProps) {
  const [state, setState] = useState<FormState>(initialState)
  const [selectedClusterId, setSelectedClusterId] = useState<string>("")
  const [selectedVersionId, setSelectedVersionId] = useState<string>("")
  const [versions, setVersions] = useState<ClusterVersion[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFileName(file?.name ?? "")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState({ loading: true, errors: {}, success: false })

    try {
      if (!selectedClusterId) {
        setState({
          loading: false,
          errors: { cluster: ["select a cluster"] },
          success: false,
        })
        return
      }

      if (!selectedVersionId) {
        setState({
          loading: false,
          errors: { version: ["select a version"] },
          success: false,
        })
        return
      }

      const file = fileInputRef.current?.files?.[0]
      if (!file) {
        setState({
          loading: false,
          errors: { file: ["select a file"] },
          success: false,
        })
        return
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("cluster_id", selectedClusterId)
      formData.append("version_id", selectedVersionId)

      const response = await fetch("/api/verification-keys/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        setState({
          loading: false,
          errors: {
            submit: [errorText || "Failed to upload vk"],
          },
          success: false,
        })
        return
      }

      const data = await response.json()
      setState({
        loading: false,
        errors: {},
        success: true,
        filename: data.filename,
      })

      // Reset form
      if (fileInputRef.current) fileInputRef.current.value = ""
      setSelectedFileName("")
    } catch (error) {
      setState({
        loading: false,
        errors: {
          submit: [error instanceof Error ? error.message : "Unknown error"],
        },
        success: false,
      })
    }
  }

  // Fetch versions when cluster is selected
  useEffect(() => {
    if (!selectedClusterId) {
      setVersions([])
      setSelectedVersionId("")
      return
    }

    const fetchVersions = async () => {
      setLoadingVersions(true)
      try {
        const response = await fetch(
          `/api/clusters/${selectedClusterId}/versions`
        )
        if (response.ok) {
          const data = await response.json()
          setVersions(data.versions || [])
          // Auto-select active version
          const activeVersion = data.versions?.find(
            (v: ClusterVersion) => v.is_active
          )
          if (activeVersion) {
            setSelectedVersionId(String(activeVersion.id))
          }
        }
      } catch (error) {
        console.error("Failed to fetch versions:", error)
      } finally {
        setLoadingVersions(false)
      }
    }

    fetchVersions()
  }, [selectedClusterId])

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <Select value={selectedClusterId} onValueChange={setSelectedClusterId}>
          <SelectTrigger>
            <SelectValue placeholder="select cluster" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>active</SelectLabel>
              {clusters
                .filter((cluster) => cluster.is_active)
                .map((cluster) => (
                  <SelectItem key={cluster.id} value={cluster.id}>
                    {cluster.id}
                  </SelectItem>
                ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>inactive</SelectLabel>
              {clusters
                .filter((cluster) => !cluster.is_active)
                .map((cluster) => (
                  <SelectItem key={cluster.id} value={cluster.id}>
                    {cluster.id}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Select
          value={selectedVersionId}
          onValueChange={setSelectedVersionId}
          disabled={loadingVersions || versions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="select version" />
          </SelectTrigger>
          <SelectContent>
            {versions.map((version) => (
              <SelectItem key={version.id} value={String(version.id)}>
                v{version.index}
                {version.vk_path && " *"}
                {version.is_active && " (active)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="position-relative display-inline-block flex flex-col gap-2">
        <span className="text-sm font-normal">verification key (.bin)</span>
        <Label
          htmlFor="file"
          className="h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm font-normal text-muted-foreground ring-offset-background hover:bg-accent"
        >
          choose file
        </Label>
        <Input
          ref={fileInputRef}
          accept=".bin,application/octet-stream"
          className="absolute left-[-9999px]"
          id="file"
          type="file"
          onChange={handleFileChange}
        />
        {selectedFileName && (
          <p className="text-xs text-muted-foreground">{selectedFileName}</p>
        )}
        {state.success && (
          <div className="text-xs text-success">vk uploaded successfully</div>
        )}
      </div>

      <Errors errors={state.errors ?? {}} />

      <SubmitButton>
        {state.loading ? "uploading..." : "upload verification key"}
      </SubmitButton>
    </form>
  )
}
