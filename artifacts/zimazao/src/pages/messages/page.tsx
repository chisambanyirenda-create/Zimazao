import { useState, useEffect, useRef, useCallback } from "react"
import { useLocation, Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { api, type ApiMessage } from "@/lib/api"
import {
  Send, ArrowLeft, Loader2, MessageCircle, Search,
  CheckCheck, Check, Mic, Square, Play, Pause,
} from "lucide-react"

interface Thread {
  userId: number
  userName: string
  lastMessage: string
  lastTime: string
  unreadCount: number
  relatedOrderId?: number | null
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-ZM", { hour: "2-digit", minute: "2-digit" })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "now"
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return "Yesterday"
  return new Date(iso).toLocaleDateString("en-ZM", { day: "2-digit", month: "short" })
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = [
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-purple-400",
  "from-cyan-500 to-blue-400",
  "from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400",
]
function avatarGradient(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length] }

function isVoiceNote(content: string) { return content.startsWith("[voice_note]:") }
function getVoiceData(content: string) { return content.replace("[voice_note]:", "") }

function VoiceNotePlayer({ src, isMe }: { src: string; isMe: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause() }
    else { audio.play() }
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className={`flex items-center gap-2 w-48 ${isMe ? "flex-row" : "flex-row"}`}>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0) }}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <button
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isMe ? "bg-white/20 hover:bg-white/30" : "bg-emerald-500/20 hover:bg-emerald-500/30"
        } transition-colors`}
      >
        {playing
          ? <Pause className={`w-3.5 h-3.5 ${isMe ? "text-white" : "text-emerald-400"}`} />
          : <Play className={`w-3.5 h-3.5 ${isMe ? "text-white" : "text-emerald-400"} ml-0.5`} />
        }
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className={`h-1 rounded-full overflow-hidden ${isMe ? "bg-white/20" : "bg-emerald-500/20"}`}>
          <div
            className={`h-full rounded-full transition-all ${isMe ? "bg-white/70" : "bg-emerald-400"}`}
            style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : "0%" }}
          />
        </div>
        <p className={`text-[10px] ${isMe ? "text-white/60" : "text-emerald-500/60"}`}>
          {fmt(progress)} / {fmt(duration || 0)}
        </p>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { user } = useAuth()
  const { refreshCount } = useNotifications()
  const [location, navigate] = useLocation()

  const [threads, setThreads] = useState<Thread[]>([])
  const [selected, setSelected] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [search, setSearch] = useState("")

  // Voice recording state
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordStartRef = useRef<number>(0)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const withParam = new URLSearchParams(location.split("?")[1] ?? "").get("with")

  const loadThreads = useCallback(async () => {
    if (!user) return
    try {
      const convos = await api.messages.conversations()
      const map = new Map<number, Thread>()
      convos.forEach((m) => {
        const isMe = Number(m.senderId) === Number(user.id)
        const otherId = isMe ? m.receiverId : m.senderId
        const otherName = isMe ? (m.receiverName ?? "User") : (m.senderName ?? "User")
        if (!map.has(otherId)) {
          map.set(otherId, {
            userId: otherId,
            userName: otherName,
            lastMessage: m.content.startsWith("[voice_note]:") ? "🎤 Voice note" : m.content,
            lastTime: m.createdAt,
            unreadCount: m.unreadCount ?? 0,
            relatedOrderId: m.relatedOrderId,
          })
        }
      })
      const arr = Array.from(map.values())
      setThreads(arr)
      return arr
    } catch {
      return undefined
    }
  }, [user])

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    loadThreads()
      .then((arr) => {
        if (withParam && arr) {
          const id = parseInt(withParam)
          const existing = arr.find((t) => t.userId === id)
          if (existing) openThread(existing)
          else {
            const placeholder: Thread = {
              userId: id, userName: "Farmer", lastMessage: "", lastTime: new Date().toISOString(), unreadCount: 0,
            }
            setThreads((prev) => [placeholder, ...prev])
            openThread(placeholder)
          }
        }
      })
      .finally(() => setLoadingThreads(false))
  }, [user])

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (!selected || !user) return
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.messages.thread(selected.userId)
        setMessages((prev) => {
          const newMsgs = data.messages
          if (newMsgs.length !== prev.length || newMsgs[newMsgs.length - 1]?.id !== prev[prev.length - 1]?.id) {
            return newMsgs
          }
          return prev
        })
        loadThreads()
      } catch {}
    }, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [selected, user])

  const openThread = async (thread: Thread) => {
    setSelected(thread)
    setLoadingMsgs(true)
    setMessages([])
    setTimeout(() => inputRef.current?.focus(), 100)
    try {
      const data = await api.messages.thread(thread.userId)
      setMessages(data.messages)
      await api.messages.markRead(thread.userId).catch(() => {})
      refreshCount()
      setThreads((prev) => prev.map((t) => t.userId === thread.userId ? { ...t, unreadCount: 0 } : t))
    } catch {}
    finally { setLoadingMsgs(false) }
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
      setThreads((prev) =>
        prev.map((t) =>
          t.userId === selected.userId ? { ...t, lastMessage: text.trim(), lastTime: new Date().toISOString() } : t
        )
      )
    } catch {}
    finally { setSending(false) }
  }

  // ── Voice note recording ──────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      audioChunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.start()
      setRecording(true)
      setRecordingTime(0)
      recordStartRef.current = Date.now()
      recordTimerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - recordStartRef.current) / 1000))
      }, 100)
    } catch {
      alert("Microphone access is needed to record voice notes.")
    }
  }

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !selected || !user) return
    const mr = mediaRecorderRef.current
    mr.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
      mr.stream.getTracks().forEach((t) => t.stop())
      // Convert to base64 data URI
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        const content = `[voice_note]:${base64}`
        try {
          const msg = await api.messages.send(selected.userId, content)
          setMessages((prev) => [...prev, { ...msg, senderName: user.name }])
          setThreads((prev) =>
            prev.map((t) =>
              t.userId === selected.userId ? { ...t, lastMessage: "🎤 Voice note", lastTime: new Date().toISOString() } : t
            )
          )
        } catch {}
      }
      reader.readAsDataURL(blob)
    }
    mr.stop()
    setRecording(false)
    if (recordTimerRef.current) clearInterval(recordTimerRef.current)
  }, [selected, user])

  const fmtRecTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  if (!user) return null

  const filtered = threads.filter((t) =>
    t.userName.toLowerCase().includes(search.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(search.toLowerCase())
  )
  const totalUnread = threads.reduce((s, t) => s + (t.unreadCount ?? 0), 0)

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6">

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
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                {totalUnread} new
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4 h-[calc(100vh-180px)] min-h-[500px]">

          {/* ── Sidebar ─────────────────────────────────────── */}
          <div className={`flex flex-col w-full md:w-80 shrink-0 rounded-2xl border border-emerald-500/20 bg-[#0d1628]/80 backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.07)] ${selected ? "hidden md:flex" : "flex"}`}>

            <div className="p-3 border-b border-emerald-500/15">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500/50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-emerald-500/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingThreads && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                </div>
              )}
              {!loadingThreads && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-emerald-500/40" />
                  </div>
                  <p className="text-white/60 text-sm font-medium mb-1">No conversations yet</p>
                  <p className="text-emerald-500/40 text-xs mb-4">Place an order to start chatting</p>
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
                      isActive ? "bg-emerald-500/10 border-l-2 border-l-emerald-400" : "hover:bg-emerald-500/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 relative">
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient(t.userId)} flex items-center justify-center shadow-md`}>
                          <span className="text-white text-xs font-bold">{getInitials(t.userName)}</span>
                        </div>
                        {t.unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {t.unreadCount > 9 ? "9+" : t.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`font-semibold text-sm truncate ${isActive ? "text-emerald-300" : t.unreadCount > 0 ? "text-white" : "text-white/85"}`}>
                            {t.userName}
                          </p>
                          <span className="text-[10px] text-white/30 shrink-0 ml-2">{timeAgo(t.lastTime)}</span>
                        </div>
                        <p className={`text-xs truncate ${t.unreadCount > 0 ? "text-white/65 font-medium" : "text-white/30"}`}>
                          {t.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Chat Panel ───────────────────────────────────── */}
          <div className={`flex-1 flex flex-col rounded-2xl border border-emerald-500/20 bg-[#0d1628]/80 backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.07)] ${!selected ? "hidden md:flex" : "flex"}`}>

            {!selected ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <MessageCircle className="w-9 h-9 text-emerald-400/40" />
                  </div>
                  <p className="text-white/60 font-semibold text-lg mb-1">Select a conversation</p>
                  <p className="text-emerald-500/40 text-sm">Choose a chat from the left</p>
                </div>
              </div>
            ) : (
              <>
                {/* ── Chat Header ── */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-emerald-500/15 bg-[#0d1628]/90 backdrop-blur-sm shrink-0">
                  <button
                    className="md:hidden text-white/50 hover:text-white transition-colors mr-1"
                    onClick={() => setSelected(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(selected.userId)} flex items-center justify-center shrink-0 shadow-md`}>
                    <span className="text-white text-xs font-bold">{getInitials(selected.userName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{selected.userName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] text-emerald-400/80">Online</span>
                    </div>
                  </div>
                </div>

                {/* ── Messages ── */}
                <div
                  className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
                  style={{
                    backgroundImage: "radial-gradient(circle at 20% 80%, rgba(16,185,129,0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.02) 0%, transparent 50%)",
                  }}
                >
                  {loadingMsgs && (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 text-emerald-400/40 animate-spin" />
                    </div>
                  )}

                  {!loadingMsgs && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-16">
                      <p className="text-white/25 text-sm text-center">
                        No messages yet<br />
                        <span className="text-emerald-500/30">Say hello to {selected.userName}! 👋</span>
                      </p>
                    </div>
                  )}

                  {messages.map((m, idx) => {
                    const isMe = Number(m.senderId) === Number(user.id)
                    const voice = isVoiceNote(m.content)
                    const prevMsg = messages[idx - 1]
                    const nextMsg = messages[idx + 1]
                    const prevIsMe = prevMsg ? Number(prevMsg.senderId) === Number(user.id) : null
                    const nextIsMe = nextMsg ? Number(nextMsg.senderId) === Number(user.id) : null
                    const isFirst = prevIsMe !== isMe
                    const isLast = nextIsMe !== isMe
                    const showTime = isLast || !nextMsg ||
                      Math.abs(new Date(nextMsg.createdAt).getTime() - new Date(m.createdAt).getTime()) > 300000

                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 ${isFirst ? "mt-3" : "mt-0.5"}`}
                      >
                        {!isMe && (
                          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradient(selected.userId)} flex items-center justify-center shrink-0 shadow-sm ${isLast ? "opacity-100" : "opacity-0"}`}>
                            <span className="text-white text-[9px] font-bold">{getInitials(selected.userName)}</span>
                          </div>
                        )}
                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                          <div className={`relative px-3.5 py-2.5 text-sm shadow-md ${
                            voice ? "px-3 py-2.5" : ""
                          } ${isMe
                            ? `bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/15 ${
                                isFirst && isLast ? "rounded-2xl rounded-br-sm"
                                : isFirst ? "rounded-2xl rounded-br-sm rounded-bl-2xl"
                                : isLast ? "rounded-2xl rounded-br-sm"
                                : "rounded-xl"
                              }`
                            : `bg-[#131d35] border border-white/5 text-white/90 ${
                                isFirst && isLast ? "rounded-2xl rounded-bl-sm"
                                : isFirst ? "rounded-2xl rounded-bl-sm"
                                : isLast ? "rounded-2xl rounded-bl-sm"
                                : "rounded-xl"
                              }`
                          }`}>
                            {voice
                              ? <VoiceNotePlayer src={getVoiceData(m.content)} isMe={isMe} />
                              : <p className="leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                            }
                          </div>
                          {showTime && (
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                              <span className="text-[10px] text-white/25">{formatTime(m.createdAt)}</span>
                              {isMe && (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-400/60" />
                              )}
                            </div>
                          )}
                        </div>
                        {isMe && (
                          <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 shadow-sm ${isLast ? "opacity-100" : "opacity-0"}`}>
                            <span className="text-white text-[9px] font-bold">{getInitials(user.name)}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* ── Input Bar ── */}
                <div className="px-3 py-3 border-t border-white/5 shrink-0 bg-[#0a0f1e]/80">
                  {recording ? (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      <p className="text-red-400 text-sm font-medium flex-1">Recording… {fmtRecTime(recordingTime)}</p>
                      <button
                        onMouseUp={stopRecording}
                        onTouchEnd={stopRecording}
                        className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25 active:scale-95"
                      >
                        <Square className="w-4 h-4 text-white fill-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Message…"
                          className="w-full bg-[#131d35] border border-white/8 focus:border-emerald-500/40 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                        />
                      </div>

                      {/* Mic button (hold to record) */}
                      {!text.trim() && (
                        <button
                          onMouseDown={startRecording}
                          onTouchStart={startRecording}
                          className="w-11 h-11 rounded-full flex items-center justify-center bg-[#131d35] border border-white/8 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all active:scale-95 shrink-0"
                          title="Hold to record voice note"
                        >
                          <Mic className="w-4.5 h-4.5 text-emerald-400/70" />
                        </button>
                      )}

                      {/* Send button */}
                      <button
                        onClick={handleSend}
                        disabled={sending || !text.trim()}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                          text.trim() && !sending
                            ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 active:scale-95"
                            : "hidden"
                        }`}
                      >
                        {sending
                          ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                          : <Send className="w-4 h-4 text-white" />
                        }
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
