import EditAddress from "@/components/EditAddress.tsx"
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
import {
  GalleryVerticalEnd,
  Mail,
  PencilLine,
  RefreshCw,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"

function AddressBar({ lang }: { lang: string }) {
  const address = useStore($address)
  const t = useMemo(() => useTranslations(lang as language), [])

  useEffect(() => {
    apiFetch<string[]>("/api/domain")
      .then((list) => initStore(list))
      .catch(fetchError)
  }, [])

  function onCopy() {
    if (!address) return
    navigator.clipboard
      .writeText(address)
      .then(() => toast.success(t("copy") + " " + address))
      .catch((e) => toast.error(e.message ?? e))
  }

  function onRandom() {
    const domain = address ? address.split("@")[1] : $domainList.get()[0]
    if (!domain) return
    const next = randomAddress(domain)
    updateAddress(next)
    toast.success(t("randomNew") + " " + next)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="icon"
        onClick={onCopy}
        aria-label="copy address"
        className="shrink-0"
      >
        <Mail size={18} />
      </Button>
      <div className="relative w-56 sm:w-72">
        <Mounted fallback={<Skeleton className="h-9 w-full" />}>
          <Input
            readOnly
            value={address ?? ""}
            className="bg-background pr-9 font-mono"
            onClick={onCopy}
          />
          <button
            type="button"
            onClick={onRandom}
            aria-label="random address"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </Mounted>
      </div>
      <EditAddress lang={lang}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("edit")}
          className="text-muted-foreground hover:text-foreground rounded-full border"
        >
          <PencilLine size={16} />
        </Button>
      </EditAddress>
      <History lang={lang}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("history")}
          className="text-muted-foreground hover:text-foreground rounded-full border"
        >
          <GalleryVerticalEnd size={16} />
        </Button>
      </History>
    </div>
  )
}

export default AddressBar
