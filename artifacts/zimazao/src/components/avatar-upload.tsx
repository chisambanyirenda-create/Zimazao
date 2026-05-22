import { useRef, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Camera, Loader2 } from "lucide-react"

interface AvatarUploadProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showName?: boolean
}

const SIZE_MAP = {
  sm: { outer: "w-9 h-9", text: "text-xs", icon: "w-3 h-3", cam: "w-5 h-5 -bottom-0.5 -right-0.5" },
  md: { outer: "w-11 h-11", text: "text-sm", icon: "w-3.5 h-3.5", cam: "w-6 h-6 -bottom-0.5 -right-0.5" },
  lg: { outer: "w-16 h-16", text: "text-lg", icon: "w-4 h-4", cam: "w-7 h-7 -bottom-0 -right-0" },
  xl: { outer: "w-24 h-24", text: "text-2xl", icon: "w-5 h-5", cam: "w-9 h-9 -bottom-1 -right-1" },
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function resizeImage(file: File, maxPx = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Canvas toBlob failed"))
      }, "image/jpeg", 0.82)
    }
    img.onerror = reject
    img.src = url
  })
}

export function AvatarUpload({ size = "md", className = "", showName = false }: AvatarUploadProps) {
  const { user, updateAvatar } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const s = SIZE_MAP[size]

  if (!user) return null

  const isFarmer = user.userType === "farmer"
  const gradient = isFarmer
    ? "from-primary to-emerald-600"
    : "from-blue-500 to-indigo-600"

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const resized = await resizeImage(file)
      const resizedFile = new File([resized], "avatar.jpg", { type: "image/jpeg" })
      await updateAvatar(resizedFile)
    } catch {
      setError("Upload failed. Try a smaller image.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative group cursor-pointer" onClick={() => !uploading && inputRef.current?.click()}>
        <div className={`${s.outer} rounded-xl overflow-hidden relative shadow-md`}>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className={`${s.text} font-bold text-white`}>{getInitials(user.name)}</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${uploading ? "opacity-100" : ""}`}>
            {uploading
              ? <Loader2 className={`${s.icon} text-white animate-spin`} />
              : <Camera className={`${s.icon} text-white`} />
            }
          </div>
        </div>
        {/* Camera badge */}
        <div className={`absolute ${s.cam} bg-primary rounded-full border-2 border-white flex items-center justify-center shadow-sm pointer-events-none`}>
          <Camera className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      {showName && (
        <div className="text-center">
          <p className="font-semibold text-sm text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{uploading ? "Uploading…" : "Tap photo to change"}</p>
        </div>
      )}

      {error && <p className="text-xs text-red-500 text-center max-w-[160px]">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}

// Standalone avatar display (no upload) — used in navbar, messages, etc.
export function UserAvatar({
  name,
  avatar,
  userType,
  size = "md",
  className = "",
}: {
  name: string
  avatar?: string | null
  userType?: "farmer" | "buyer"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  const s = SIZE_MAP[size]
  const isFarmer = userType === "farmer"
  const gradient = isFarmer
    ? "from-primary to-emerald-600"
    : "from-blue-500 to-indigo-600"

  return (
    <div className={`${s.outer} rounded-xl overflow-hidden shrink-0 shadow-sm ${className}`}>
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className={`${s.text} font-bold text-white`}>{getInitials(name)}</span>
        </div>
      )}
    </div>
  )
}
