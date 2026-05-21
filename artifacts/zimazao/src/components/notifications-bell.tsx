import { useState } from "react"
import { Bell, Package, MessageCircle, Tag, CheckCircle2, X, ArrowRight } from "lucide-react"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
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

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  const dismiss = (id: number) => setNotifs((prev) => prev.filter((n) => n.id !== id))
  const markRead = (id: number) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))

  const handleOpenChange = (next: boolean) => {
    if (next && onOpen) onOpen()
    setOpen(next)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-24px)] max-w-sm p-0 shadow-2xl border border-border/60 rounded-2xl overflow-hidden"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-primary to-emerald-700 text-white">
          <div>
            <h3 className="font-bold text-sm">Notifications</h3>
            {unread > 0 && <p className="text-white/75 text-xs">{unread} unread</p>}
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button onClick={markAllRead} className="text-white/80 hover:text-white text-xs underline underline-offset-2 transition-colors">
                Mark all read
              </button>
            )}
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-border max-h-80 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="w-9 h-9 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">All caught up!</p>
            </div>
          ) : (
            notifs.map((notif) => {
              const Icon = NOTIF_ICON[notif.type]
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors group cursor-pointer ${!notif.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}`}
                  onClick={() => markRead(notif.id)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${NOTIF_COLOR[notif.type]}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${!notif.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                        {notif.title}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(notif.id) }}
                        className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{notif.body}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-muted-foreground">{notif.time}</span>
                      {notif.href && (
                        <Link href={notif.href} onClick={() => { markRead(notif.id); setOpen(false) }}>
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
        <div className="border-t border-border px-4 py-2.5 bg-muted/30">
          <Link href="/orders" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground gap-1 h-8">
              View all activity <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
