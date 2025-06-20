import React, { useEffect, useState, type ReactNode, type RefObject } from 'react'

/**
 * Hook to prevent hydration mismatches by ensuring component only renders on client
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to suppress hydration warnings for components that may have browser extension interference
 */
export function useSuppressHydrationWarning() {
  const [suppressWarning, setSuppressWarning] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment with potential extensions
    if (typeof window !== 'undefined') {
      // Small delay to allow browser extensions to process
      const timer = setTimeout(() => {
        setSuppressWarning(true)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [])

  return suppressWarning
}

/**
 * Component wrapper to prevent hydration mismatches
 */
export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const isClient = useClientOnly()

  if (!isClient) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

/**
 * Utility to clean browser-generated attributes that cause hydration mismatches
 */
export function cleanBrowserAttributes(element: HTMLElement) {
  if (typeof window === 'undefined') return

  // Remove common browser extension attributes
  const attributesToRemove = [
    'fdprocessedid',
    'data-form-type',
    'data-lpignore',
    'data-1p-ignore',
    'data-bwignore',
    'data-lpignore',
    'data-form-type',
    'data-1p-ignore',
    'data-bwignore'
  ]

  attributesToRemove.forEach(attr => {
    if (element.hasAttribute(attr)) {
      element.removeAttribute(attr)
    }
  })

  // Also clean child elements
  element.querySelectorAll('*').forEach(child => {
    attributesToRemove.forEach(attr => {
      if (child.hasAttribute(attr)) {
        child.removeAttribute(attr)
      }
    })
  })
}

/**
 * Hook to clean browser attributes on mount
 */
export function useCleanBrowserAttributes(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    if (ref.current) {
      cleanBrowserAttributes(ref.current)
    }
  }, [ref])
} 