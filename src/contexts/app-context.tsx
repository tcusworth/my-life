"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface Draft {
  id: string | null
  title: string
  notes: string
  project: string
  p: 'high' | 'med' | 'low'
  when: 'today' | 'tomorrow' | 'week'
  time: string
}

interface AppContextValue {
  toast: string | null
  paletteOpen: boolean
  drawerOpen: boolean
  captureOpen: boolean
  draft: Draft | null
  showToast: (msg: string) => void
  openPalette: () => void
  closePalette: () => void
  openDrawer: (prefill?: Partial<Draft>) => void
  closeDrawer: () => void
  openCapture: () => void
  closeCapture: () => void
  updateDraft: (key: keyof Draft, value: string) => void
  saveDraft: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [captureOpen, setCaptureOpen] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const toastTimer = React.useRef<ReturnType<typeof setTimeout>>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])

  const openDrawer = useCallback((prefill?: Partial<Draft>) => {
    setDraft({ id: null, title: '', notes: '', project: '', p: 'med', when: 'today', time: '', ...prefill })
    setDrawerOpen(true)
    setPaletteOpen(false)
  }, [])

  const closeDrawer = useCallback(() => { setDrawerOpen(false); setDraft(null) }, [])

  const openCapture = useCallback(() => setCaptureOpen(true), [])
  const closeCapture = useCallback(() => setCaptureOpen(false), [])

  const updateDraft = useCallback((key: keyof Draft, value: string) => {
    setDraft(prev => prev ? { ...prev, [key]: value } : null)
  }, [])

  const saveDraft = useCallback(() => {
    if (!draft) return
    showToast(draft.id ? 'Task updated' : 'Task created')
    setDrawerOpen(false)
    setDraft(null)
  }, [draft, showToast])

  return (
    <AppContext.Provider value={{
      toast, paletteOpen, drawerOpen, captureOpen, draft,
      showToast, openPalette, closePalette,
      openDrawer, closeDrawer,
      openCapture, closeCapture,
      updateDraft, saveDraft,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
