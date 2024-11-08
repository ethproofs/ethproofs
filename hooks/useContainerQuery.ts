import { useEffect, useRef, useState } from "react"

/**
 * Custom hook that provides a reference to a container element and a boolean
 * indicating if the container's width is larger than the specified query width.
 *
 * @param minWidth - The width to compare the container's width against.
 * @returns An object containing:
 * - `containerRef`: A ref object to be attached to the container element.
 * - `isLarge`: A boolean indicating if the container's width is larger than the specified query width.
 */
export const useContainerQuery = (minWidth: number) => {
  const [isLarge, setIsLarge] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setIsLarge(containerRef.current.offsetWidth > minWidth)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [minWidth])

  return { containerRef, isLarge }
}
