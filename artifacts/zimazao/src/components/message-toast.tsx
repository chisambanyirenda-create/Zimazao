import { useLocation } from "wouter"
import { MessageCircle, X, Package } from "lucide-react"
import { useNotifications } from "@/lib/notification-context"

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function truncate(text: string, max = 72) {
  return text.length > max ? text.slice(0, max) + "…" : text
}

export function MessageToast() {
  const { toast, dismissToast } = useNotifications()
  const [, navigate] = useLocation()

  if (!toast) return null

  const isOrderMsg = !!toast.relatedOrderId || toast.content.startsWith("📦")

  return (
    <div
      className="fixed top-20 right-4 z-[2000] w-[340px] max-w-[calc(100vw-2rem)]"
      style={{ animation: "toastSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
    >
      <div
        className="relative flex items-start gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 cursor-pointer group overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(16,185,129,0.12)" }}
        onClick={() => {
          dismissToast()
          navigate(`/messages?with=${toast.senderId}`)
        }}
      >
        {/* Green accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-2xl" />

        {/* Avatar */}
        <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 ml-1">
          {isOrderMsg
            ? <Package className="w-5 h-5 text-white" />
            : <span className="text-white text-sm font-bold">{getInitials(toast.senderName)}</span>
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
              {isOrderMsg ? "New Order Message" : "New Message"}
            </p>
          </div>
          <p className="text-sm font-bold text-gray-900 leading-tight">{toast.senderName}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
            {truncate(toast.content)}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            Tap to open chat
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={(e) => { e.stopPropagation(); dismissToast() }}
          className="shrink-0 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors ml-1"
        >
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {/* Progress bar auto-dismiss */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-100">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
            style={{ animation: "toastProgress 6s linear forwards" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(120%) scale(0.95); opacity: 0; }
          to   { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}
