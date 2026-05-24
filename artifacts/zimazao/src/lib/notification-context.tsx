import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react"
import { useLocation } from "wouter"
import { api } from "./api"
import { useAuth } from "./auth-context"

interface ToastNotif {
  id: number
  senderId: number
  senderName: string
  content: string
  relatedOrderId?: number | null
  createdAt: string
}

interface NotifContextType {
  unreadCount: number
  toast: ToastNotif | null
  dismissToast: () => void
  refreshCount: () => void
}

const NotifContext = createContext<NotifContextType>({
  unreadCount: 0,
  toast: null,
  dismissToast: () => {},
  refreshCount: () => {},
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [location] = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [toast, setToast] = useState<ToastNotif | null>(null)
  const prevCountRef = useRef(0)
  const prevLatestIdRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismissToast = useCallback(() => setToast(null), [])

  const poll = useCallback(async () => {
    if (!user) return
    try {
      const [msgResult, notifResult] = await Promise.allSettled([
        api.messages.unreadCount(),
        api.notifications.unreadCount(),
      ])

      const msgCount = msgResult.status === "fulfilled" ? msgResult.value.count : 0
      const notifCount = notifResult.status === "fulfilled" ? notifResult.value.count : 0
      setUnreadCount(msgCount + notifCount)

      if (msgResult.status === "fulfilled") {
        const data = msgResult.value
        const isOnMessages = location.startsWith("/messages")
        if (
          !isOnMessages &&
          data.latest &&
          data.latest.id !== prevLatestIdRef.current &&
          data.count > prevCountRef.current
        ) {
          setToast({
            id: data.latest.id,
            senderId: data.latest.senderId,
            senderName: data.latest.senderName ?? "Someone",
            content: data.latest.content,
            relatedOrderId: data.latest.relatedOrderId,
            createdAt: data.latest.createdAt,
          })
          prevLatestIdRef.current = data.latest.id
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => setToast(null), 6000)
        }
        prevCountRef.current = data.count
      }
    } catch {}
  }, [user, location])

  useEffect(() => {
    if (!user) { setUnreadCount(0); setToast(null); return }
    poll()
    const interval = setInterval(poll, 10000)
    return () => clearInterval(interval)
  }, [user, poll])

  // Clear toast when navigating to messages
  useEffect(() => {
    if (location.startsWith("/messages")) {
      setToast(null)
    }
  }, [location])

  return (
    <NotifContext.Provider value={{ unreadCount, toast, dismissToast, refreshCount: poll }}>
      {children}
    </NotifContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotifContext)
}
