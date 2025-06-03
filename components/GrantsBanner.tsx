"use client"

import { useState } from "react"

import Close from "@/components/svgs/close.svg"

import { Banner } from "./ui/banner"
import Link from "./ui/link"

const learnMoreLink = "https://x.com/eth_proofs/status/1930244636582334473"

const GrantsBanner = () => {
  const [isOpen, setIsOpen] = useState(true)

  function onDismiss() {
    setIsOpen(false)
  }

  return (
    isOpen && (
      <Banner>
        <span className="text-center text-base">
          Ethproofs is accelerating real-time proving with $300k in grants to
          incentivize breakthrough performance. Learn more{" "}
          <Link href={learnMoreLink}>here</Link>
        </span>
        <button onClick={onDismiss}>
          <Close />
        </button>
      </Banner>
    )
  )
}

export default GrantsBanner
