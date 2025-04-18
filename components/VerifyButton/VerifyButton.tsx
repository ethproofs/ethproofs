"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Download, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

import { useDownloadProof } from "./useDownloadProof"
import { useVerifyProof } from "./useVerifyProof"
import {
  getButtonClasses,
  getButtonLabel,
  getTextColorClass,
  VerifyButtonState,
  verifyButtonStateMap,
} from "./VerifyButton.utils"

type VerifyButtonProps = {
  // proof: Proof
  className?: string
  containerClass?: string
  labelClass?: string
}

const VerifyButton = ({
  className,
  // proof,
  containerClass = "flex-col",
  labelClass,
}: VerifyButtonProps) => {
  // const { proof_id } = proof
  const [buttonState, setButtonState] = useState<VerifyButtonState>(
    verifyButtonStateMap.idle
  )
  const { downloadProgress, downloadSpeed, downloadProof } = useDownloadProof()
  const { verifyTime, verifyProof } = useVerifyProof()
  const [checkmarkProgress, setCheckmarkProgress] = useState(0)
  const checkRef = useRef<SVGSVGElement | null>(null)

  const labelClassName = cn(
    "inline-block text-nowrap text-xs font-bold font-body",
    labelClass
  )
  const sizingClassName = "relative h-8 gap-2 self-center text-2xl"

  // Animate checkmark when entering success state
  useEffect(() => {
    if (buttonState === "verified") {
      // Reset and animate the checkmark
      setCheckmarkProgress(0)
      const checkmarkAnimation = setInterval(() => {
        setCheckmarkProgress((prev) => {
          if (prev >= 100) {
            clearInterval(checkmarkAnimation)
            return 100
          }
          return prev + 5
        })
      }, 10)

      return () => clearInterval(checkmarkAnimation)
    }
  }, [buttonState])

  // Calculate checkmark animation properties
  const checkmarkAnimation = () => {
    let length = 0
    let drawLength = 0
    if (checkRef.current) {
      const path = checkRef.current.querySelector("path")
      if (path) {
        length = path.getTotalLength()
        drawLength = (checkmarkProgress / 100) * length
      }
    }
    return {
      strokeDasharray: length,
      strokeDashoffset: length - drawLength,
    }
  }

  async function onVerifyProof() {
    // Downloading proof
    console.log("Downloading proof...")
    setButtonState(verifyButtonStateMap.downloading)
    const proof = await downloadProof() // Simulate proof download
    if (!proof) return setButtonState(verifyButtonStateMap.error)
    console.log("Proof downloaded:", proof)
    // Verifying proof
    console.log("Verifying proof...")
    setButtonState(verifyButtonStateMap.verifying)
    const result = verifyProof(proof)
    if (!result) return setButtonState(verifyButtonStateMap.error)
    setButtonState(
      result ? verifyButtonStateMap.verified : verifyButtonStateMap.failed
    )
    console.log("Verification result:", result)
  }

  return (
    <div className={cn("flex items-center gap-x-2 gap-y-1", containerClass)}>
      <Button
        variant="outline"
        className={cn(
          className,
          getButtonClasses(buttonState),
          sizingClassName
        )}
        size="icon"
        asChild
        onClick={onVerifyProof}
      >
        <div>
          {/* Progress bars */}
          {buttonState === "downloading" && (
            <div
              className="absolute left-0 top-0 h-full bg-green-300/20 transition-all duration-100"
              style={{ width: `${downloadProgress}%` }}
            />
          )}

          {buttonState === "verifying" && (
            <div
              className="absolute left-0 top-0 h-full bg-green-500/20 transition-all duration-100"
              style={{ width: `${downloadProgress}%` }}
            />
          )}

          {buttonState === "verified" && (
            <>
              <div className="animate-success-pulse absolute inset-0 bg-green-500 opacity-20" />
              <div className="animate-success-ring absolute -inset-4 rounded-full border border-green-500/30" />
            </>
          )}

          {buttonState === "downloading" && (
            <Download className="animate-pulse text-green-300" />
          )}
          {buttonState === "verifying" && (
            <Loader2 className="animate-spin text-green-400" />
          )}
          {buttonState === "verified" && (
            <Check ref={checkRef} style={checkmarkAnimation()} />
          )}
          <span className={cn(labelClassName, getTextColorClass(buttonState))}>
            {getButtonLabel(buttonState)}
          </span>
        </div>
      </Button>

      {buttonState === "downloading" &&
      downloadProgress > 5 &&
      downloadProgress < 98 ? (
        <span className="text-xs text-green-300 opacity-80">
          {downloadSpeed} MB/s
        </span>
      ) : (
        <span
          className="animate-fadeIn text-xs text-gray-400 opacity-0"
          style={{ animation: "fadeIn 0.3s forwards" }}
        >
          {buttonState === "verified"
            ? `${verifyTime}ms`
            : "in-browser verification"}
        </span>
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes successPulse {
          0% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            opacity: 0.1;
          }
        }

        @keyframes successRing {
          0% {
            transform: scale(0.8);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.1);
            opacity: 0;
          }
        }

        .animate-success-pulse {
          animation: successPulse 1.2s ease-in-out;
          animation-iteration-count: 2;
          animation-fill-mode: forwards;
        }

        .animate-success-ring {
          animation: successRing 1s ease-out;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  )
}

export default VerifyButton
