import { useState, useEffect } from "react"
import { Bell, Package, MessageCircle, X, ArrowRight, Loader2, Truck, ShieldAlert, Star, AlertTriangle } from "lucide-react"
import { Link, useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/lib/notification-context"
import { api, type ApiNotification } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function getTypeIcon(type: string) {
  if (type.includes("message")) return MessageCircle
  if (type.includes("dispatch") || type.includes("shipped") || type.includes("out_for")) return Truck
  if (type.includes("verification")) return ShieldAlert
  if (type.includes("review") || type.includes("rating")) return Star
  if (type.includes("dispute")) return AlertTriangle
  if (type.includes("order") || type.includes("delivered") || type.includes("packed")) return Package
  return Bell
}

function getTypeColor(type: string) {
  if (type.includes("message")) return "bg-emerald-100 text-emerald-600"
  if (type.includes("dispatch") || type.includes("shipped") || type.includes("out_for")) return "bg-purple-100 text-purple-600"
  if (type.includes("delivered") || type.includes("confirmed")) return "bg-green-100 text-green-600"
  if (type.includes("cancelled") || type.includes("dispute")) return "bg-red-100 text-red-600"
  if (type.includes("order")) return "bg-blue-100 text-blue-600"
  return "bg-gray-100 text-gray-600"
}

interface NotificationsBellProps {
  onOpen?: () => void
}

export function NotificationsBell({ onOpen }: NotificationsBellProps) {
  const { user } = useAuth()
  const { unreadCount, refreshCount } = useNotifications()
  const [notifs, setNotifs] = useState<ApiNotification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [, navigate] = useLocation()

  const localUnread = notifs.filter((n) => !n.is_read).length
  const displayCount = open ? localUnread : unreadCount

  const loadNotifs = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await api.notifications.list()
      setNotifs(data)
    } catch {
      // Fallback to message notifications
      try {
        const convos = await api.messages.conversations()
        const msgs: ApiNotification[] = convos
          .filter((c) => (c.unreadCount ?? 0) > 0)
          .slice(0, 15)
          .map((c) => {
            const isMe = Number(c.senderId) === Number(user.id)
            const otherName = isMe ? (c.receiverName ?? "Someone") : (c.senderName ?? "Someone")
            const otherId = isMe ? c.receiverId : c.senderId
            return {
              id: c.id,
              userId: Number(user.id),
              type: c.content?.startsWith("📦") || !!c.relatedOrderId ? "new_order" : "new_message",
              title: c.content?.startsWith("📦") ? `Order Message from ${otherName}` : `Message from ${otherName}`,
              body: c.content?.slice(0, 100) ?? "",
              href: `/messages?with=${otherId}`,
              is_read: !c.unread,
              created_at: c.createdAt,
            }
          })
        setNotifs(msgs)
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadNotifs()
  }, [open, user])

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const openPanel = () => { onOpen?.(); setOpen(true) }
  const closePanel = () => setOpen(false)

  const markAllRead = async () => {
    try { await api.notifications.markAllRead() } catch {}
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
    refreshCount()
  }

  const handleClick = async (notif: ApiNotification) => {
    try { await api.notifications.markRead(notif.id) } catch {}
    setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n))
    refreshCount()
    closePanel()
    navigate(notif.href)
  }

  return (
    <>
      <button
        className="relative p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none"
        aria-label="Notifications"
        onClick={openPanel}
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {displayCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {displayCount > 9 ? "9+" : displayCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/50" onClick={closePanel} aria-hidden="true" />

          <div
            className="fixed top-0 right-0 z-[1000] h-full w-full max-w-sm flex flex-col border-l border-border"
            style={{
              animation: "slideInRight 0.22s cubic-bezier(0.34,1.2,0.64,1)",
              backgroundColor: "white",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.2), -2px 0 12px rgba(0,0,0,0.1)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-primary to-emerald-700 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Notifications</h3>
                  {displayCount > 0 && <p className="text-white/75 text-xs mt-0.5">{displayCount} unread</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {localUnread > 0 && (
                  <button onClick={markAllRead} className="text-white/80 hover:text-white text-xs underline underline-offset-2 transition-colors">
                    Mark all read
                  </button>
                )}
                <button
                  onClick={closePanel}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {loading ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading notifications…</p>
                </div>
              ) : notifs.length === 0 ? (
                <div className="py-16 text-center px-6">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-foreground font-medium mb-1">All caught up!</p>
                  <p className="text-muted-foreground text-sm">New order, message and delivery alerts will appear here.</p>
                </div>
              ) : (
                notifs.map((notif) => {
                  const Icon = getTypeIcon(notif.type)
                  const colorClass = getTypeColor(notif.type)
                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-4 transition-colors group cursor-pointer ${
                        !notif.is_read ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleClick(notif)}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${!notif.is_read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{notif.body}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-muted-foreground">{timeAgo(notif.created_at)}</span>
                          <span className="text-[11px] text-primary font-medium flex items-center gap-0.5">
                            View <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="border-t border-border px-4 py-3 bg-muted/30 shrink-0">
              <Link href="/orders" onClick={closePanel}>
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground gap-1 h-9">
                  View all orders <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
