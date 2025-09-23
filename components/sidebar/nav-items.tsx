import {
  Bomb,
  Box,
  Bug,
  Cpu,
  HeartPulse,
  Library,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

// import GitHub from "@/components/svgs/github-logo.svg"
// import XLogo from "@/components/svgs/x-logo.svg"

// import { URL_GITHUB_REPO, URL_TWITTER } from "@/lib/constants"
// import { SITE_REPO } from "@/lib/constants"

export const exploreNavItems = [
  {
    label: "dashboard",
    href: "/",
    icon: <TrendingUp />,
  },
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
    label: "killers",
    href: "/killers",
    icon: <Bomb />,
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
  // {
  //   label: "build Ethproofs",
  //   href: URL_GITHUB_REPO,
  //   icon: <GitHub />,
  // },
  // {
  //   label: "spot a bug?",
  //   href: new URL(
  //     SITE_REPO + "/issues/new/choose/",
  //     "https://github.com"
  //   ).toString(),
  //   icon: <Bug />,
  // },
  // {
  //   label: "follow us",
  //   href: URL_TWITTER,
  //   icon: <XLogo className="h-3 w-auto" />,
  // },
]
