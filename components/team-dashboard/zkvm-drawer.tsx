"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Errors } from "@/components/forms/errors"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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

import type { DashboardZkvm } from "./zkvm-columns"

import {
  createZkvm,
  updateZkvm,
} from "@/app/teams/[teamSlug]/dashboard/actions"

interface ZkvmDrawerProps {
  mode: "create" | "edit"
  zkvm?: DashboardZkvm
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

const SEVERITY_COLORS = {
  green: "bg-level-best",
  yellow: "bg-level-middle",
  red: "bg-level-worst",
} as const

interface SeverityOptionProps {
  level: keyof typeof SEVERITY_COLORS
  label: string
}

function SeverityOption({ level, label }: SeverityOptionProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`size-2 shrink-0 rounded-full ${SEVERITY_COLORS[level]}`}
      />
      <span>{label}</span>
    </div>
  )
}

export function ZkvmDrawer({
  mode,
  zkvm,
  open,
  onOpenChange,
  teamSlug,
}: ZkvmDrawerProps) {
  const router = useRouter()
  const [state, setState] = useState<FormState>(initialState)
  const [name, setName] = useState(zkvm?.name || "")
  const [isOpenSource, setIsOpenSource] = useState(
    zkvm?.is_open_source ?? false
  )
  const [isDualLicensed, setIsDualLicensed] = useState(
    zkvm?.is_dual_licensed ?? false
  )
  const [isProvingMainnet, setIsProvingMainnet] = useState(
    zkvm?.is_proving_mainnet ?? false
  )
  const [implementationSoundness, setImplementationSoundness] =
    useState<string>(zkvm?.security_metrics?.implementation_soundness || "")
  const [evmStfBytecode, setEvmStfBytecode] = useState<string>(
    zkvm?.security_metrics?.evm_stf_bytecode || ""
  )
  const [quantumSecurity, setQuantumSecurity] = useState<string>(
    zkvm?.security_metrics?.quantum_security || ""
  )

  useEffect(() => {
    setState(initialState)
    setName(zkvm?.name || "")
    setIsOpenSource(zkvm?.is_open_source ?? false)
    setIsDualLicensed(zkvm?.is_dual_licensed ?? false)
    setIsProvingMainnet(zkvm?.is_proving_mainnet ?? false)
    setImplementationSoundness(
      zkvm?.security_metrics?.implementation_soundness || ""
    )
    setEvmStfBytecode(zkvm?.security_metrics?.evm_stf_bytecode || "")
    setQuantumSecurity(zkvm?.security_metrics?.quantum_security || "")
  }, [
    open,
    zkvm?.name,
    zkvm?.is_open_source,
    zkvm?.is_dual_licensed,
    zkvm?.is_proving_mainnet,
    zkvm?.security_metrics?.implementation_soundness,
    zkvm?.security_metrics?.evm_stf_bytecode,
    zkvm?.security_metrics?.quantum_security,
  ])

  useEffect(() => {
    if (state.success) {
      router.refresh()
      onOpenChange(false)
    }
  }, [state.success, onOpenChange, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState({ loading: true, errors: {}, success: false })

    try {
      const formData = new FormData(e.currentTarget)

      const result =
        mode === "create"
          ? await createZkvm(null, formData)
          : await updateZkvm(null, formData)

      if ("errors" in result && result.errors) {
        setState({
          loading: false,
          errors: result.errors,
          success: false,
        })
        return
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

  const latestVersion = zkvm?.versions[0]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full w-[500px] overflow-y-auto border-l">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>
            {mode === "create" ? "create zkvm" : "edit zkvm"}
          </DrawerTitle>
          {mode === "edit" && zkvm && (
            <span className="font-mono text-xs text-muted-foreground">
              {zkvm.id}
            </span>
          )}
        </DrawerHeader>

        <form
          key={zkvm?.id ?? "new"}
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col px-4"
        >
          <div className="flex-1 space-y-4">
            {mode === "edit" && zkvm && (
              <input type="hidden" name="id" value={zkvm.id} />
            )}
            <input type="hidden" name="team_slug" value={teamSlug} />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold underline">zkvm details</h3>

              <div className="space-y-2">
                <Label htmlFor="name">name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="My zkVM"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isa">ISA</Label>
                <Input
                  id="isa"
                  name="isa"
                  type="text"
                  placeholder="rv32im"
                  defaultValue={zkvm?.isa}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo_url">repository url</Label>
                <Input
                  id="repo_url"
                  name="repo_url"
                  type="url"
                  placeholder="https://github.com/org/repo"
                  defaultValue={zkvm?.repo_url || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">
                  {mode === "create"
                    ? "initial version"
                    : "new version (optional)"}
                </Label>
                <Input
                  id="version"
                  name="version"
                  type="text"
                  placeholder={
                    latestVersion
                      ? `current: ${latestVersion.version}`
                      : "1.0.0"
                  }
                  defaultValue=""
                  required={mode === "create"}
                />
                <p className="text-xs text-muted-foreground">
                  numbers and dots only (e.g. 1.0.0). will be displayed as
                  v1.0.0
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_open_source"
                    checked={isOpenSource}
                    onCheckedChange={(val) => setIsOpenSource(Boolean(val))}
                  />
                  <input
                    type="hidden"
                    name="is_open_source"
                    value={isOpenSource ? "true" : "false"}
                  />
                  <Label
                    htmlFor="is_open_source"
                    className="text-sm font-normal leading-none"
                  >
                    open source
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_dual_licensed"
                    checked={isDualLicensed}
                    onCheckedChange={(val) => setIsDualLicensed(Boolean(val))}
                  />
                  <input
                    type="hidden"
                    name="is_dual_licensed"
                    value={isDualLicensed ? "true" : "false"}
                  />
                  <Label
                    htmlFor="is_dual_licensed"
                    className="text-sm font-normal leading-none"
                  >
                    dual licensed
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_proving_mainnet"
                    checked={isProvingMainnet}
                    onCheckedChange={(val) => setIsProvingMainnet(Boolean(val))}
                  />
                  <input
                    type="hidden"
                    name="is_proving_mainnet"
                    value={isProvingMainnet ? "true" : "false"}
                  />
                  <Label
                    htmlFor="is_proving_mainnet"
                    className="text-sm font-normal leading-none"
                  >
                    proving mainnet
                  </Label>
                </div>
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="security-metrics" className="border-none">
                <AccordionTrigger className="py-2 text-sm font-semibold underline hover:no-underline">
                  security metrics
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-1 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="implementation_soundness">soundness</Label>
                    <Select
                      value={implementationSoundness}
                      onValueChange={setImplementationSoundness}
                    >
                      <SelectTrigger id="implementation_soundness">
                        <SelectValue placeholder="select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">
                          <SeverityOption
                            level="green"
                            label="formally verified"
                          />
                        </SelectItem>
                        <SelectItem value="yellow">
                          <SeverityOption
                            level="yellow"
                            label="fully audited"
                          />
                        </SelectItem>
                        <SelectItem value="red">
                          <SeverityOption
                            level="red"
                            label="not fully audited"
                          />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="implementation_soundness"
                      value={implementationSoundness}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evm_stf_bytecode">EVM STF bytecode</Label>
                    <Select
                      value={evmStfBytecode}
                      onValueChange={setEvmStfBytecode}
                    >
                      <SelectTrigger id="evm_stf_bytecode">
                        <SelectValue placeholder="select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">
                          <SeverityOption
                            level="green"
                            label="formally verified"
                          />
                        </SelectItem>
                        <SelectItem value="yellow">
                          <SeverityOption
                            level="yellow"
                            label="fully audited"
                          />
                        </SelectItem>
                        <SelectItem value="red">
                          <SeverityOption
                            level="red"
                            label="not fully audited"
                          />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="evm_stf_bytecode"
                      value={evmStfBytecode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantum_security">quantum security</Label>
                    <Select
                      value={quantumSecurity}
                      onValueChange={setQuantumSecurity}
                    >
                      <SelectTrigger id="quantum_security">
                        <SelectValue placeholder="select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">
                          <SeverityOption
                            level="green"
                            label="hash / lattice based"
                          />
                        </SelectItem>
                        <SelectItem value="red">
                          <SeverityOption
                            level="red"
                            label="pre-quantum components"
                          />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="quantum_security"
                      value={quantumSecurity}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="security_target_bits">
                      security target bits
                    </Label>
                    <Input
                      id="security_target_bits"
                      name="security_target_bits"
                      type="number"
                      min="0"
                      placeholder="128"
                      defaultValue={
                        zkvm?.security_metrics?.security_target_bits ?? ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_bounty_amount">
                      max bounty amount ($)
                    </Label>
                    <Input
                      id="max_bounty_amount"
                      name="max_bounty_amount"
                      type="number"
                      min="0"
                      placeholder="100000"
                      defaultValue={
                        zkvm?.security_metrics?.max_bounty_amount ?? ""
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="performance-metrics"
                className="border-none"
              >
                <AccordionTrigger className="py-2 text-sm font-semibold underline hover:no-underline">
                  performance metrics
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-1 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="size_bytes">proof size (bytes)</Label>
                    <Input
                      id="size_bytes"
                      name="size_bytes"
                      type="number"
                      min="0"
                      placeholder="300000"
                      defaultValue={zkvm?.performance_metrics?.size_bytes ?? ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification_ms">
                      verification time (milliseconds)
                    </Label>
                    <Input
                      id="verification_ms"
                      name="verification_ms"
                      type="number"
                      min="0"
                      placeholder="10"
                      defaultValue={
                        zkvm?.performance_metrics?.verification_ms ?? ""
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Errors errors={state.errors ?? {}} />
          </div>

          <DrawerFooter className="px-0">
            <Button type="submit" disabled={state.loading}>
              {state.loading
                ? "saving..."
                : mode === "create"
                  ? "create zkvm"
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
