"use client"

import { useState } from "react"

import Close from "@/components/svgs/close.svg"

import { Alert, AlertTitle } from "./ui/alert"
import Link from "./ui/link"

const learnMoreLink = "https://x.com/eth_proofs/status/1930244636582334473"

const GrantsBanner = () => {
  const [isOpen, setIsOpen] = useState(true)

  function onDismiss() {
    setIsOpen(false)
  }

  return (
    isOpen && (
      <Alert className="flex w-full items-center justify-between rounded-2xl border-[1.48px] border-primary-border bg-background-highlight px-6 py-4 text-body">
        <AlertTitle className="text-base">
          Ethproofs is accelerating real-time proving with $300k in grants to
          incentivize breakthrough performance. Learn more{" "}
          <Link
            className="text-primary hover:text-primary-light"
            href={learnMoreLink}
          >
            here
          </Link>
        </AlertTitle>
        <button onClick={onDismiss}>
          <Close />
        </button>
      </Alert>
    )
  )
}

export default GrantsBanner
