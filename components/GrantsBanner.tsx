"use client"

import { useState } from "react"
import { X as Close } from "lucide-react"

import { Alert, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
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
          <div className="flex items-center gap-1">
            <span>
              Ethproofs is accelerating real-time proving with $300k in grants
              to incentivize breakthrough performance. Learn more
            </span>
            <Link
              className="text-primary hover:text-primary-light"
              href={learnMoreLink}
            >
              here
            </Link>
          </div>
        </AlertTitle>
        <Button variant="ghost" onClick={onDismiss} size="icon">
          <Close className="size-4" />
        </Button>
      </Alert>
    )
  )
}

export default GrantsBanner
