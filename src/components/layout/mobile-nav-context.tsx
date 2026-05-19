"use client"

import * as React from "react"

type MobileNavContextValue = {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

const MobileNavContext = React.createContext<MobileNavContextValue | undefined>(undefined)

type MobileNavProviderProps = {
  children: React.ReactNode
}

export function MobileNavProvider({ children }: MobileNavProviderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const value = React.useMemo(
    () => ({ isMobileMenuOpen, setIsMobileMenuOpen }),
    [isMobileMenuOpen],
  )

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>
}

export function useMobileNav() {
  const context = React.useContext(MobileNavContext)

  if (!context) {
    throw new Error("useMobileNav must be used within MobileNavProvider")
  }

  return context
}
