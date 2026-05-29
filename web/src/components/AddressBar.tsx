import History from "@/components/History.tsx"
import Mounted from "@/components/Mounted.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { type language, useTranslations } from "@/i18n/ui.ts"
import {
  $address,
  $domainList,
  initStore,
  updateAddress,
} from "@/lib/store/store.ts"
import { apiFetch, fetchError, randomAddress } from "@/lib/utils.ts"
import { useStore } from "@nanostores/react"
import { Check, Mail, PencilLine, RefreshCw, X } from "lucide-react"
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"

const MAX_USER_LEN = 20

function AddressBar({ lang }: { lang: string }) {
  const address = useStore($address)
  const domainList = useStore($domainList)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const t = useMemo(() => useTranslations(lang as language), [])

  useEffect(() => {
    apiFetch<string[]>("/api/domain")
      .then((list) => initStore(list))
      .catch(fetchError)
  }, [])

  const currentDomain = address ? address.split("@")[1] : domainList[0]

  function onCopy() {
    if (!address || editing) return
    navigator.clipboard
      .writeText(address)
      .then(() => toast.success(t("copy") + " " + address))
      .catch((e) => toast.error(e.message ?? e))
  }

  function onRandom() {
    if (editing) return
    const domain = currentDomain
    if (!domain) return
    const next = randomAddress(domain)
    updateAddress(next)
    toast.success(t("randomNew") + " " + next)
  }

  function startEdit() {
    if (!address) return
    setDraft(address.split("@")[0])
    setEditing(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }

  function cancelEdit() {
    setEditing(false)
    setDraft("")
  }

  function confirmEdit() {
    const cleaned = draft.replace(/[^a-zA-Z0-9-_.]/g, "").slice(0, MAX_USER_LEN)
    if (!cleaned || !currentDomain) {
      cancelEdit()
      return
    }
    const next = `${cleaned}@${currentDomain}`
    if (next !== address) {
      updateAddress(next)
      toast.success(t("changeNew") + " " + next)
    }
    setEditing(false)
    setDraft("")
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      confirmEdit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancelEdit()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <History lang={lang}>
        <Button
          variant="secondary"
          size="icon"
          aria-label={t("history")}
          className="shrink-0 cursor-pointer"
        >
          <Mail size={18} />
        </Button>
      </History>
      <div className="relative flex-1 sm:w-60 sm:flex-none">
        <Mounted fallback={<Skeleton className="h-9 w-full" />}>
          <Input
            ref={inputRef}
            readOnly={!editing}
            value={editing ? draft : (address ?? "")}
            onChange={(e) => setDraft(e.currentTarget.value)}
            onKeyDown={onKeyDown}
            onClick={editing ? undefined : onCopy}
            placeholder={editing ? t("editPlaceholder") : ""}
            className={`bg-background pr-10 font-mono ${editing ? "" : "cursor-pointer"}`}
          />
          <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
            {editing && (
              <span className="text-muted-foreground mr-1 truncate text-xs">
                @{currentDomain}
              </span>
            )}
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEdit}
                  aria-label={t("cancel")}
                  className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-1 transition-colors"
                >
                  <X size={16} />
                </button>
                <button
                  type="button"
                  onClick={confirmEdit}
                  aria-label={t("confirm")}
                  className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-1 transition-colors"
                >
                  <Check size={16} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                aria-label={t("edit")}
                className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-1 transition-colors"
              >
                <PencilLine size={16} />
              </button>
            )}
          </div>
        </Mounted>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRandom}
        aria-label={t("random")}
        className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-full border"
      >
        <RefreshCw size={16} />
      </Button>
    </div>
  )
}

export default AddressBar
