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
      <Alert className="flex w-full flex-col items-start justify-between gap-4 rounded-2xl border-[1.48px] border-primary-border bg-background-highlight px-4 py-4 text-body sm:flex-row sm:items-center sm:px-6 sm:gap-2">
        <AlertTitle className="w-full text-sm sm:text-base">
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center">
            <span className="leading-relaxed">
              Ethproofs is accelerating real-time proving with $300k in grants
              to incentivize breakthrough performance. Learn more{" "}
              <Link
                className="text-primary hover:text-primary-light"
                href={learnMoreLink}
              >
                here
              </Link>
            </span>
          </div>
        </AlertTitle>
        <Button 
          variant="ghost" 
          onClick={onDismiss} 
          size="icon"
          className="absolute right-2 top-2 sm:relative sm:right-0 sm:top-0"
        >
          <Close className="size-4" />
        </Button>
      </Alert>
    )
  )
}

export default GrantsBanner
