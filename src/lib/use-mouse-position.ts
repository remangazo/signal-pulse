"use client"

import { useState, useEffect } from "react"

export function useMousePosition() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    }
    window.addEventListener("mousemove", handle, { passive: true })
    return () => window.removeEventListener("mousemove", handle)
  }, [])

  return pos
}
