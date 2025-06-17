import { ProofButtonState } from "@/components/proof-buttons/utils"
import { useEffect, useRef, useState } from "react"

export function useAnimateCheckmark(buttonState: ProofButtonState) {
  const [checkmarkProgress, setCheckmarkProgress] = useState(0)
  const checkRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (buttonState === "success") {
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

  return {
    checkRef,
    checkmarkAnimation() {
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
    },
  }
}
