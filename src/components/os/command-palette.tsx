"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/app-context'

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d7dae3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

type Command = {
  id: string
  label: string
  group: string
  bg: string
  color: string
  href?: string
  action?: 'openDrawer' | 'openCapture'
  toast?: string
  iconPath?: string
}

const BASE_COMMANDS: Command[] = [
  { id: 'c0', label: 'View Daily Briefing', group: 'Navigate', bg: '#efe9f5', color: '#4a2d6e', href: '/briefing', iconPath: 'M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z' },
  { id: 'c1', label: 'Go to Home', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/dashboard', iconPath: 'M3 10.5 12 4l9 6.5M5 9.5V20h14V9.5' },
  { id: 'c2', label: 'Go to Today', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/today', iconPath: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 2v2M12 20v2' },
  { id: 'c3', label: 'Open Inbox', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/inbox', iconPath: 'M4 13h4l1.6 3h4.8L20 13M4 13 6.2 5h11.6L20 13v6H4z' },
  { id: 'c4', label: 'View Projects', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/projects', iconPath: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { id: 'c5', label: 'Open Calendar', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/calendar', iconPath: 'M3 9.5h18M8 3v4M16 3v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z' },
  { id: 'c5b', label: 'Review Goals', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/goals', iconPath: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
  { id: 'c5c', label: 'Open People', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/people', iconPath: 'M9 8a3 3 0 1 0 0-.01M3 19a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6' },
  { id: 'c5d', label: 'Open Settings', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/settings', iconPath: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1' },
  { id: 'c5e', label: 'Open Apple Health', group: 'Navigate', bg: '#fdeee6', color: '#b84a1f', href: '/health', iconPath: 'M3 12h3l2-5 3 10 2-7 1.5 2H21' },
  { id: 'c5f', label: 'Open Notes', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/notes', iconPath: 'M5 4h11l3 3v13H5z' },
  { id: 'c5g', label: 'Open Weekly Review', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/review', iconPath: 'M9 11l3 3 7-7M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10' },
  { id: 'c5h', label: 'Open Habits', group: 'Navigate', bg: '#fdeee6', color: '#b84a1f', href: '/habits', iconPath: 'M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3' },
  { id: 'c5j', label: 'Open Saved Views', group: 'Navigate', bg: '#e9f6f7', color: '#1d7a82', href: '/views', iconPath: 'M3 5h18M6 12h12M10 19h4' },
  { id: 'c6', label: 'New task', group: 'Create', bg: '#fdeee6', color: '#b84a1f', action: 'openDrawer', iconPath: 'M12 5v14M5 12h14' },
  { id: 'c8', label: 'Quick capture', group: 'Create', bg: '#efe9f5', color: '#4a2d6e', action: 'openCapture', iconPath: 'M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z' },
  { id: 'a2', label: 'Snooze inbox to this evening', group: 'Quick actions', bg: '#fdf4e0', color: '#b17d1f', toast: 'Inbox snoozed to 6:00 PM', iconPath: 'M12 8v4l3 2M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z' },
  { id: 'i1', label: 'Ask AI to plan my day', group: 'Intelligence', bg: '#efe9f5', color: '#4a2d6e', href: '/briefing', iconPath: 'M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z' },
  { id: 'i2', label: 'Process inbox with AI', group: 'Intelligence', bg: '#efe9f5', color: '#4a2d6e', href: '/inbox', iconPath: 'M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z' },
]

function CommandIcon({ path, bg, color }: { path?: string; bg: string; color: string }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 9,
      background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d={path ?? 'M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z'} />
      </svg>
    </div>
  )
}

export function CommandPalette() {
  const { paletteOpen, closePalette, openPalette, openDrawer, openCapture, showToast } = useApp()
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA'

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (paletteOpen) {
          closePalette()
        } else {
          openPalette()
        }
        return
      }
      if (e.key === 'Escape' && paletteOpen) {
        closePalette()
        setQuery('')
        return
      }
      if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey && !typing && !paletteOpen) {
        e.preventDefault()
        openCapture()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [paletteOpen, closePalette, openPalette, openCapture])

  useEffect(() => {
    if (paletteOpen) {
      setQuery('')
      setTimeout(() => {
        document.getElementById('cmd-palette-input')?.focus()
      }, 30)
    }
  }, [paletteOpen])

  if (!paletteOpen) return null

  const q = query.trim().toLowerCase()
  let commands = q
    ? BASE_COMMANDS.filter(c => (c.label + ' ' + c.group).toLowerCase().includes(q))
    : BASE_COMMANDS

  if (q) {
    commands = [
      {
        id: 'create-dynamic',
        label: `Create task “${query.trim()}”`,
        group: 'Create new',
        bg: '#fdeee6',
        color: '#b84a1f',
        action: 'openDrawer',
        iconPath: 'M12 5v14M5 12h14',
      },
      ...commands,
    ]
  }

  function runCommand(cmd: Command) {
    if (cmd.action === 'openDrawer') {
      const prefill = cmd.id === 'create-dynamic' ? { title: query.trim() } : {}
      openDrawer(prefill)
      setQuery('')
    } else if (cmd.action === 'openCapture') {
      openCapture()
      closePalette()
      setQuery('')
    } else if (cmd.toast) {
      showToast(cmd.toast)
      closePalette()
      setQuery('')
    } else if (cmd.href) {
      router.push(cmd.href)
      closePalette()
      setQuery('')
    }
  }

  const hasResults = commands.length > 0

  return (
    <>
      <style>{`
        @keyframes ml-pop {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ml-pop { animation: ml-pop 200ms ease-out both; }
        .ml-scroll { scrollbar-width: thin; scrollbar-color: #d7dae3 transparent; }
        .cmd-item:hover { background: #faf7f1; }
      `}</style>
      <div
        onClick={closePalette}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(15,16,20,0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '14vh',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          className="ml-pop"
          style={{
            width: 580, maxWidth: '92vw',
            background: '#ffffff',
            border: '1px solid #d7dae3',
            borderRadius: 18,
            boxShadow: '0 30px 70px -25px rgba(15,16,20,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid #eceef3',
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#674197" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z" />
            </svg>
            <input
              id="cmd-palette-input"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && commands[0]) {
                  e.preventDefault()
                  runCommand(commands[0])
                }
              }}
              placeholder="Type a command or search…"
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent',
                fontFamily: 'inherit', fontSize: 15.5, color: '#15171d',
              }}
            />
            <kbd style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              background: '#f5f6f9',
              border: '1px solid #d7dae3',
              borderRadius: 5,
              padding: '2px 6px',
              color: '#80859a',
            }}>esc</kbd>
          </div>

          {/* Results */}
          <div
            className="ml-scroll"
            style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }}
          >
            {hasResults ? (
              commands.map(cmd => (
                <div
                  key={cmd.id}
                  className="cmd-item"
                  onClick={() => runCommand(cmd)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 13,
                    padding: '11px 13px',
                    borderRadius: 11,
                    cursor: 'pointer',
                    transition: 'background 120ms',
                  }}
                >
                  <CommandIcon path={cmd.iconPath} bg={cmd.bg} color={cmd.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: '#15171d' }}>{cmd.label}</div>
                    <div style={{ fontSize: 12, color: '#80859a' }}>{cmd.group}</div>
                  </div>
                  <ArrowIcon />
                </div>
              ))
            ) : (
              <div style={{ padding: 32, textAlign: 'center', color: '#80859a', fontSize: 13.5 }}>
                No matches. Try &ldquo;new task&rdquo; or &ldquo;calendar&rdquo;.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}