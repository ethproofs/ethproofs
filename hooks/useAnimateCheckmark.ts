import { useEffect, useRef, useState } from "react"

import { ProofButtonState } from "@/components/proof-buttons/utils"

export function useAnimateCheckmark(buttonState: ProofButtonState) {
  const [checkmarkProgress, setCheckmarkProgress] = useState(0)
  const [pathLength, setPathLength] = useState(0)
  const checkRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (buttonState === "success") {
      setCheckmarkProgress(0)

      if (checkRef.current) {
        const path = checkRef.current.querySelector("path")
        if (path) {
          setPathLength(path.getTotalLength())
        }
      }

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

  return {
    checkRef,
    checkmarkAnimation() {
      const drawLength = (checkmarkProgress / 100) * pathLength
      return {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength - drawLength,
      }
    },
  }
}
