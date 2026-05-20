import { useState, useEffect, useRef } from "react"
import { useLocation, Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { api, type ApiMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, ArrowLeft, Loader2, User } from "lucide-react"

interface Thread {
  userId: number
  userName: string
  lastMessage: string
  lastTime: string
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
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    api.messages.conversations()
      .then((convos) => {
        const mapped: Thread[] = convos.map((m) => {
          const isMe = Number(m.senderId) === Number(user.id)
          const otherId = isMe ? m.receiverId : m.senderId
          const otherName = isMe ? "Farmer" : (m.senderName ?? "User")
          return { userId: otherId, userName: otherName, lastMessage: m.content, lastTime: m.createdAt }
        })
        setThreads(mapped)
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
    } catch {}
    finally { setSending(false) }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" /> Messages
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
          {/* Thread list */}
          <Card className="md:col-span-1 overflow-hidden flex flex-col">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto">
              {loadingThreads && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              {!loadingThreads && threads.length === 0 && (
                <div className="text-center py-12 px-4 text-muted-foreground text-sm">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No messages yet.<br />
                  <Link href="/marketplace" className="text-primary underline">Browse listings</Link> and message a farmer.
                </div>
              )}
              {threads.map((t) => (
                <button
                  key={t.userId}
                  onClick={() => openThread(t)}
                  className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted transition-colors ${selected?.userId === t.userId ? "bg-muted" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{t.userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Message thread */}
          <Card className="md:col-span-2 overflow-hidden flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                <div className="text-center">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Select a conversation
                </div>
              </div>
            ) : (
              <>
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-base">{selected.userName}</CardTitle>
                </CardHeader>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs && <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
                  {messages.map((m) => {
                    const isMe = Number(m.senderId) === Number(user.id)
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                          <p>{m.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {new Date(m.createdAt).toLocaleTimeString("en-ZM", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t flex gap-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  />
                  <Button onClick={handleSend} disabled={sending || !text.trim()} size="icon">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
