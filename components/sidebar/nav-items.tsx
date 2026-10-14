import {
  Activity,
  BarChart3,
  BookOpen,
  Box,
  Cpu,
  HardDrive,
  HeartPulse,
  Library,
  Server,
  SquareCode,
  Target,
  Users,
  Zap,
} from "lucide-react"
import type { ReactNode } from "react"

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  isDisabled?: boolean
  disabledReason?: string
}

export const cohortsNavItems: NavItem[] = [
  {
    label: "1:10 cohort",
    href: "/on-prem-proving-initiative",
    icon: <HardDrive />,
  },
  {
    label: "1:1 on-prem cohort",
    href: "/on-prem-real-time-proving",
    icon: <Server />,
  },
]

export const exploreNavItems = [
  {
    label: "metrics",
    href: "/metrics",
    icon: <Activity />,
  },
  {
    label: "zkVMs",
    href: "/zkvms",
    icon: <Zap />,
  },
  {
    label: "guests",
    href: "/guests",
    icon: <SquareCode />,
  },
  {
    label: "provers",
    href: "/clusters",
    icon: <Cpu />,
  },
  {
    label: "blocks",
    href: "/blocks",
    icon: <Box />,
  },
  {
    label: "teams",
    href: "/teams",
    icon: <Users />,
  },
  {
    label: "status",
    href: "/status",
    icon: <HeartPulse />,
  },
]

export const benchmarksNavItems = [
  {
    label: "benchmarks",
    href: "/csp-benchmarks",
    icon: <BarChart3 />,
  },
]

export const moreNavItems = [
  {
    label: "blog",
    href: "/blog",
    icon: <BookOpen />,
  },
  {
    label: "learn",
    href: "/learn",
    icon: <Library />,
  },
  {
    label: "API",
    href: "/api.html",
    icon: <Target />,
  },
]
