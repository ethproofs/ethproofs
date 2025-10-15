import {
  BarChart3,
  Box,
  Bug,
  Cpu,
  HeartPulse,
  Library,
  Target,
  // TrendingUp,
  Users,
  Zap,
} from "lucide-react"

export const exploreNavItems = [
  // {
  //   label: "dashboard",
  //   href: "/",
  //   icon: <TrendingUp />,
  // },
  {
    label: "zkVMs",
    href: "/zkvms",
    icon: <Zap />,
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
