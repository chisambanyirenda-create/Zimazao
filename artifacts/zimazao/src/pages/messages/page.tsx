import { useState, useEffect, useRef } from "react"
import { useLocation, Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/lib/auth-context"
import { api, type ApiMessage } from "@/lib/api"
import { Send, ArrowLeft, Loader2, User, MessageCircle, Zap, Search } from "lucide-react"

interface Thread {
  userId: number
  userName: string
  lastMessage: string
  lastTime: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

const NEON_COLORS = [
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-purple-400",
  "from-cyan-500 to-blue-400",
  "from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400",
]
function avatarGradient(id: number) {
  return NEON_COLORS[id % NEON_COLORS.length]
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [, navigate] = useLocation()
  const [threads, setThreads] = useState<Thread[]>([])
  const [selected, setSelected] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [search, setSearch] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    api.messages.conversations()
      .then((convos) => {
        const map = new Map<number, Thread>()
        convos.forEach((m) => {
          const isMe = Number(m.senderId) === Number(user.id)
          const otherId = isMe ? m.receiverId : m.senderId
          const otherName = isMe ? (m.receiverName ?? "User") : (m.senderName ?? "User")
          if (!map.has(otherId)) {
            map.set(otherId, { userId: otherId, userName: otherName, lastMessage: m.content, lastTime: m.createdAt })
          }
        })
        setThreads(Array.from(map.values()))
      })
      .catch(() => {})
      .finally(() => setLoadingThreads(false))
  }, [user])

  const openThread = (thread: Thread) => {
    setSelected(thread)
    setLoadingMsgs(true)
    api.messages.thread(thread.userId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoadingMsgs(false))
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !selected || !user) return
    setSending(true)
    try {
      const msg = await api.messages.send(selected.userId, text.trim())
      setMessages((prev) => [...prev, { ...msg, senderName: user.name }])
      setText("")
      setThreads((prev) => prev.map((t) =>
        t.userId === selected.userId ? { ...t, lastMessage: text.trim(), lastTime: new Date().toISOString() } : t
      ))
    } catch {}
    finally { setSending(false) }
  }

  if (!user) return null

  const filtered = threads.filter((t) =>
    t.userName.toLowerCase().includes(search.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Navbar />

      {/* Global neon glow background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-emerald-400/70 hover:text-emerald-400 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-px h-4 bg-emerald-500/20" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Messages</h1>
            {threads.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {threads.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4 h-[calc(100vh-180px)] min-h-[500px]">

          {/* ── Sidebar: Thread list ─────────────────────────────── */}
          <div className={`flex flex-col w-full md:w-80 shrink-0 rounded-2xl border border-emerald-500/20 bg-[#0d1628]/80 backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.07)] ${selected ? "hidden md:flex" : "flex"}`}>

            {/* Search */}
            <div className="p-3 border-b border-emerald-500/15">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500/50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-emerald-500/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Thread list */}
            <div className="flex-1 overflow-y-auto">
              {loadingThreads && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                    <p className="text-emerald-500/50 text-xs">Loading chats…</p>
                  </div>
                </div>
              )}

              {!loadingThreads && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <MessageCircle className="w-7 h-7 text-emerald-500/40" />
                  </div>
                  <p className="text-white/60 text-sm font-medium mb-1">No conversations yet</p>
                  <p className="text-emerald-500/40 text-xs mb-4">Browse listings and message a farmer to start chatting</p>
                  <Link href="/marketplace">
                    <button className="text-xs px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      Browse Marketplace →
                    </button>
                  </Link>
                </div>
              )}

              {filtered.map((t) => {
                const isActive = selected?.userId === t.userId
                return (
                  <button
                    key={t.userId}
                    onClick={() => openThread(t)}
                    className={`w-full text-left px-4 py-3.5 border-b border-emerald-500/10 transition-all group relative ${
                      isActive
                        ? "bg-emerald-500/10 border-l-2 border-l-emerald-400"
                        : "hover:bg-emerald-500/5"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                    )}
                    <div className="flex items-center gap-3 relative">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient(t.userId)} flex items-center justify-center shrink-0 shadow-lg`}>
                        <span className="text-white text-xs font-bold">{getInitials(t.userName)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`font-semibold text-sm truncate ${isActive ? "text-emerald-300" : "text-white/90"}`}>{t.userName}</p>
                          <span className="text-[10px] text-emerald-500/40 shrink-0 ml-2">{timeAgo(t.lastTime)}</span>
                        </div>
                        <p className="text-xs text-white/35 truncate">{t.lastMessage}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Chat Panel ──────────────────────────────────────── */}
          <div className={`flex-1 flex flex-col rounded-2xl border border-emerald-500/20 bg-[#0d1628]/80 backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.07)] ${!selected ? "hidden md:flex" : "flex"}`}>

            {!selected ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-5">
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-pulse" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <MessageCircle className="w-9 h-9 text-emerald-400/50" />
                    </div>
                  </div>
                  <p className="text-white/70 font-semibold text-lg mb-1">Select a conversation</p>
                  <p className="text-emerald-500/40 text-sm">Choose a chat from the left to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-emerald-500/15 bg-[#0d1628]/60 backdrop-blur-sm shrink-0">
                  <button
                    className="md:hidden mr-1 text-emerald-400/60 hover:text-emerald-400 transition-colors"
                    onClick={() => setSelected(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient(selected.userId)} flex items-center justify-center shrink-0 shadow-lg`}>
                    <span className="text-white text-xs font-bold">{getInitials(selected.userName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{selected.userName}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-400/70">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-medium">Live Chat</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs && (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                    </div>
                  )}

                  {!loadingMsgs && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                        <MessageCircle className="w-6 h-6 text-emerald-400/40" />
                      </div>
                      <p className="text-white/40 text-sm">No messages yet. Say hello! 👋</p>
                    </div>
                  )}

                  {messages.map((m, idx) => {
                    const isMe = Number(m.senderId) === Number(user.id)
                    const showTime = idx === messages.length - 1 ||
                      Math.abs(new Date(messages[idx + 1]?.createdAt).getTime() - new Date(m.createdAt).getTime()) > 300000

                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                        {!isMe && (
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarGradient(selected.userId)} flex items-center justify-center shrink-0 shadow-md mb-0.5`}>
                            <span className="text-white text-[9px] font-bold">{getInitials(selected.userName)}</span>
                          </div>
                        )}
                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[72%]`}>
                          <div className={`relative px-4 py-2.5 rounded-2xl text-sm shadow-lg ${
                            isMe
                              ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-sm shadow-emerald-500/20 shadow-lg"
                              : "bg-[#131d35] border border-emerald-500/15 text-white/90 rounded-bl-sm"
                          }`}>
                            {isMe && (
                              <div className="absolute inset-0 rounded-2xl rounded-br-sm bg-white/5 pointer-events-none" />
                            )}
                            <p className="relative leading-relaxed">{m.content}</p>
                          </div>
                          {showTime && (
                            <p className={`text-[10px] mt-1 px-1 ${isMe ? "text-emerald-500/40" : "text-white/25"}`}>
                              {new Date(m.createdAt).toLocaleTimeString("en-ZM", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                        {isMe && (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 shadow-md mb-0.5">
                            <span className="text-white text-[9px] font-bold">{getInitials(user.name)}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3.5 border-t border-emerald-500/15 shrink-0 bg-[#0d1628]/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 relative group">
                      <input
                        ref={inputRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message…"
                        className="w-full bg-[#131d35] border border-emerald-500/20 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all pr-12"
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                      />
                      {/* Glow line at bottom of input */}
                      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={sending || !text.trim()}
                      className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                        text.trim() && !sending
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
                          : "bg-emerald-500/10 border border-emerald-500/20 cursor-not-allowed"
                      }`}
                    >
                      {sending
                        ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Send className={`w-4 h-4 transition-colors ${text.trim() ? "text-white" : "text-emerald-500/30"}`} />
                      }
                      {text.trim() && !sending && (
                        <span className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/30 animate-ping opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-emerald-500/25 mt-2">Press Enter to send</p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
