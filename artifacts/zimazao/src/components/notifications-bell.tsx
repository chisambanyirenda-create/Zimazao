import { useState, useEffect } from "react"
import { Bell, Package, MessageCircle, Tag, CheckCircle2, X, ArrowRight } from "lucide-react"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Notif = {
  id: number
  type: "order" | "message" | "deal" | "system"
  title: string
  body: string
  time: string
  read: boolean
  href?: string
}

const DEMO_NOTIFS: Notif[] = [
  { id: 1, type: "order", title: "Order Confirmed", body: "Your order for White Maize has been confirmed by John Mwansa.", time: "5m ago", read: false, href: "/orders" },
  { id: 2, type: "message", title: "New Message", body: "Mary Banda replied: 'Yes, I can arrange delivery to Lusaka.'", time: "23m ago", read: false, href: "/messages" },
  { id: 3, type: "deal", title: "Flash Deal — 20% Off", body: "Groundnuts from Chipata — limited stock at reduced price!", time: "1h ago", read: false, href: "/marketplace" },
  { id: 4, type: "order", title: "Order Dispatched", body: "Your Soybeans order is on its way from Chipata, ETA 2 days.", time: "3h ago", read: true, href: "/orders" },
  { id: 5, type: "system", title: "Price Alert", body: "Maize prices in Southern Province rose 8% this week.", time: "1d ago", read: true, href: "/prices" },
]

const NOTIF_ICON: Record<Notif["type"], typeof Package> = {
  order: Package,
  message: MessageCircle,
  deal: Tag,
  system: CheckCircle2,
}

const NOTIF_COLOR: Record<Notif["type"], string> = {
  order: "bg-blue-100 text-blue-600",
  message: "bg-primary/10 text-primary",
  deal: "bg-orange-100 text-orange-600",
  system: "bg-purple-100 text-purple-600",
}

interface NotificationsBellProps {
  onOpen?: () => void
}

export function NotificationsBell({ onOpen }: NotificationsBellProps) {
  const [notifs, setNotifs] = useState<Notif[]>(DEMO_NOTIFS)
  const [open, setOpen] = useState(false)

  const unread = notifs.filter((n) => !n.read).length

  // Lock body scroll when panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  const openPanel = () => {
    onOpen?.()
    setOpen(true)
  }
  const closePanel = () => setOpen(false)

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  const dismiss = (id: number) => setNotifs((prev) => prev.filter((n) => n.id !== id))
  const markRead = (id: number) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))

  return (
    <>
      {/* Trigger button */}
      <button
        className="relative p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none"
        aria-label="Notifications"
        onClick={openPanel}
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Dark overlay — z-999, blocks background, click to close */}
          <div
            className="fixed inset-0 z-[999] bg-black/50"
            onClick={closePanel}
            aria-hidden="true"
          />

          {/* Notification panel — z-1000, slides in from top-right */}
          <div
            className="fixed top-0 right-0 z-[1000] h-full w-full max-w-sm flex flex-col border-l border-border"
            style={{
              animation: "slideInRight 0.2s ease-out",
              backgroundColor: "white",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.2), -2px 0 12px rgba(0,0,0,0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-primary to-emerald-700 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Notifications</h3>
                  {unread > 0 && <p className="text-white/75 text-xs mt-0.5">{unread} unread</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unread > 0 && (
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

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {notifs.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-foreground font-medium mb-1">All caught up!</p>
                  <p className="text-muted-foreground text-sm">No new notifications</p>
                </div>
              ) : (
                notifs.map((notif) => {
                  const Icon = NOTIF_ICON[notif.type]
                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-4 transition-colors group cursor-pointer ${
                        !notif.read ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-muted/50"
                      }`}
                      onClick={() => markRead(notif.id)}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${NOTIF_COLOR[notif.type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${!notif.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                            {notif.title}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); dismiss(notif.id) }}
                            className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center hover:bg-muted"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{notif.body}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-muted-foreground">{notif.time}</span>
                          {notif.href && (
                            <Link href={notif.href} onClick={() => { markRead(notif.id); closePanel() }}>
                              <span className="text-[11px] text-primary font-medium flex items-center gap-0.5 hover:underline">
                                View <ArrowRight className="w-3 h-3" />
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-3 bg-muted/30 shrink-0">
              <Link href="/orders" onClick={closePanel}>
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground gap-1 h-9">
                  View all activity <ArrowRight className="w-3 h-3" />
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
