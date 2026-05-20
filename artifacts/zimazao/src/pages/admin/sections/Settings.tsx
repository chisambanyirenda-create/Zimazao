import { useEffect, useState } from "react"
import { adminRequest } from "@/lib/admin-auth"
import { Save, RefreshCw, AlertTriangle } from "lucide-react"

const GOLD = "#F59E0B"
const CARD = "rgba(17,24,39,0.8)"
const BORDER = "rgba(255,255,255,0.07)"

interface Settings {
  commission_rate: string
  pro_price: string
  free_listings_limit: string
  free_scans_limit: string
  maintenance_mode: string
}

export default function SettingsSection() {
  const [settings, setSettings] = useState<Settings>({
    commission_rate: "3", pro_price: "80",
    free_listings_limit: "3", free_scans_limit: "5", maintenance_mode: "false",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const load = () => {
    setLoading(true)
    adminRequest<Settings>("/admin/settings")
      .then(d => { setSettings(d); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const showMsg = (type: "ok" | "err", text: string) => {
    setMsg({ type, text }); setTimeout(() => setMsg(null), 3000)
  }

  const saveSetting = async (key: string, value: string) => {
    setSaving(key)
    try {
      await adminRequest("/admin/settings", { method: "POST", body: JSON.stringify({ key, value }) })
      showMsg("ok", `${key.replace(/_/g, " ")} updated to "${value}"`)
      load()
    } catch (e: any) { showMsg("err", e.message) }
    setSaving(null)
  }

  const SettingCard = ({ label, settingKey, description, type = "number", min, max, suffix = "" }: {
    label: string; settingKey: keyof Settings; description: string; type?: string; min?: string; max?: string; suffix?: string
  }) => {
    const [local, setLocal] = useState(settings[settingKey])
    useEffect(() => { setLocal(settings[settingKey]) }, [settings[settingKey]])
    const changed = local !== settings[settingKey]

    return (
      <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="text-sm font-semibold text-white mb-1">{label}</h3>
        <p className="text-xs mb-4" style={{ color: "#64748B" }}>{description}</p>
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input type={type} value={local} onChange={e => setLocal(e.target.value)} min={min} max={max}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${changed ? `${GOLD}66` : "rgba(255,255,255,0.08)"}` }} />
            {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#64748B" }}>{suffix}</span>}
          </div>
          <button onClick={() => saveSetting(settingKey, local)} disabled={!changed || saving === settingKey}
            className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            style={{
              background: changed ? `linear-gradient(135deg, ${GOLD}, #D97706)` : "rgba(255,255,255,0.05)",
              color: changed ? "white" : "#4B5563",
            }}>
            {saving === settingKey ? "..." : <><Save className="w-3.5 h-3.5" />{changed ? "Save" : "Saved"}</>}
          </button>
        </div>
      </div>
    )
  }

  const maintenance = settings.maintenance_mode === "true"

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">App Settings</h2>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>Control platform behaviour without touching code</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "rgba(245,158,11,0.1)", color: GOLD, border: "1px solid rgba(245,158,11,0.2)" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Reload
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-lg text-sm" style={{
          background: msg.type === "ok" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          color: msg.type === "ok" ? "#10B981" : "#F87171",
        }}>{msg.text}</div>
      )}

      {/* Maintenance Mode */}
      <div className="rounded-xl p-5" style={{
        background: maintenance ? "rgba(239,68,68,0.08)" : CARD,
        border: `1px solid ${maintenance ? "rgba(239,68,68,0.3)" : BORDER}`,
      }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" style={{ color: maintenance ? "#EF4444" : "#64748B" }} />
              <h3 className="text-sm font-semibold text-white">Maintenance Mode</h3>
            </div>
            <p className="text-xs" style={{ color: "#64748B" }}>
              When ON — all users see "App under maintenance". Admin still works normally.
            </p>
          </div>
          <button onClick={() => saveSetting("maintenance_mode", maintenance ? "false" : "true")}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: maintenance ? "#EF4444" : "rgba(255,255,255,0.05)",
              color: maintenance ? "white" : "#94A3B8",
              border: `1px solid ${maintenance ? "#EF4444" : BORDER}`,
            }}>
            {saving === "maintenance_mode" ? "..." : maintenance ? "🔴 TURN OFF" : "⚪ TURN ON"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl" style={{ background: CARD }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingCard
            label="Commission Rate"
            settingKey="commission_rate"
            description="Percentage taken from each order as platform fee"
            type="number" min="0" max="100" suffix="%"
          />
          <SettingCard
            label="Pro Plan Price"
            settingKey="pro_price"
            description="Monthly cost for farmers to upgrade to Pro subscription"
            type="number" min="0" suffix="ZMW"
          />
          <SettingCard
            label="Free Listings Limit"
            settingKey="free_listings_limit"
            description="Maximum crop listings allowed on the free plan"
            type="number" min="1"
          />
          <SettingCard
            label="Free Scans Limit"
            settingKey="free_scans_limit"
            description="Maximum disease scans allowed on the free plan per month"
            type="number" min="1"
          />
        </div>
      )}
    </div>
  )
}
