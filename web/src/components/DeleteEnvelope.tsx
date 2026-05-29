import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx"
import { type language, useTranslations } from "@/i18n/ui.ts"
import { apiFetch, fetchError } from "@/lib/utils.ts"
import { type MouseEvent, type ReactNode, useMemo, useState } from "react"
import { toast } from "sonner"

function DeleteEnvelope({
  id,
  lang,
  onDeleted,
  children,
}: {
  id: number
  lang: string
  onDeleted: (id: number) => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const t = useMemo(() => useTranslations(lang as language), [])

  async function onConfirm(e: MouseEvent) {
    e.stopPropagation()
    try {
      await apiFetch(`/api/fetch/${id}`, { method: "DELETE" })
      onDeleted(id)
      toast.success(t("deleted"))
    } catch (err) {
      fetchError(err)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteDesc")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteEnvelope
