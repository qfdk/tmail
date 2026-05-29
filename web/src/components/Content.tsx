import DeleteEnvelope from "@/components/DeleteEnvelope.tsx"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
import { type language, useTranslations } from "@/i18n/ui.ts"
import { ABORT_SAFE } from "@/lib/constant.ts"
import { $address } from "@/lib/store/store.ts"
import type { Attachment, Envelope } from "@/lib/types.ts"
import {
  apiFetch,
  fetchError,
  fmtDate,
  fmtFrom,
  fmtString,
} from "@/lib/utils.ts"
import { useStore } from "@nanostores/react"
import { clsx } from "clsx"
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Download,
  Paperclip,
  RotateCw,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

type MailDetail = {
  content: string
  attachments: Attachment[]
}

function Content({ lang }: { lang: string }) {
  const [loading, setLoading] = useState(true)
  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [selected, setSelected] = useState<Envelope | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [rawOpen, setRawOpen] = useState(false)
  const [rawData, setRawData] = useState<MailDetail | null>(null)

  const controller = useRef<AbortController>(null)
  const detailController = useRef<AbortController>(null)
  const eventSource = useRef<EventSource | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<ShadowRoot | null>(null)

  const address = useStore($address)
  const t = useMemo(() => useTranslations(lang as language), [])

  useEffect(() => {
    return () => {
      controller.current?.abort(ABORT_SAFE)
      detailController.current?.abort(ABORT_SAFE)
      eventSource.current?.close()
    }
  }, [])

  useEffect(() => {
    if (!selected || !rawData) return
    const host = contentRef.current
    if (!host) return
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" })
    shadow.innerHTML = rawData.content
    shadowRef.current = shadow
  }, [selected, rawData])

  useEffect(() => {
    if (!address) return
    controller.current?.abort(ABORT_SAFE)
    controller.current = new AbortController()
    eventSource.current?.close()
    setLoading(true)
    setEnvelopes([])
    setSelected(null)

    apiFetch<Envelope[]>("/api/fetch?to=" + address, {
      signal: controller.current.signal,
    })
      .then((list) => setEnvelopes(list))
      .catch(fetchError)
      .finally(() => setLoading(false))

    const es = new EventSource(`/api/stream?to=${encodeURIComponent(address)}`)
    es.addEventListener("mail", (ev) => {
      try {
        const e = JSON.parse((ev as MessageEvent).data) as Envelope
        e.animate = true
        setEnvelopes((list) =>
          list.some((x) => x.id === e.id) ? list : [e, ...list]
        )
        toast.success(fmtString(t("receiveNew"), e.from))
      } catch (err) {
        fetchError(err)
      }
    })
    eventSource.current = es

    return () => {
      es.close()
    }
  }, [address])

  function onSelect(envelope: Envelope) {
    setSelected(envelope)
    setAttachments([])
    setRawData(null)
    detailController.current?.abort(ABORT_SAFE)
    detailController.current = new AbortController()
    setDetailLoading(true)
    apiFetch<MailDetail>("/api/fetch/" + envelope.id, {
      signal: detailController.current.signal,
    })
      .then((res) => {
        setAttachments(res.attachments)
        setRawData(res)
      })
      .catch(fetchError)
      .finally(() => setDetailLoading(false))
  }

  function onDownload(id: string) {
    window.open(`/api/download/${id}`, "_blank")
  }

  function onEnvelopeDeleted(id: number) {
    setEnvelopes((list) => list.filter((env) => env.id !== id))
    if (selected?.id === id) {
      setSelected(null)
      if (shadowRef.current) shadowRef.current.innerHTML = ""
    }
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-6">
      <section className="bg-card flex items-center gap-4 rounded-md border px-5 py-4 shadow-2xs">
        <div className="relative shrink-0">
          <CheckCircle2 className="text-green-500" size={40} strokeWidth={1.6} />
          <span className="absolute inset-0 animate-ping rounded-full bg-green-500/30 [animation-duration:3s]" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold">{t("serviceRunning")}</span>
          <span className="text-muted-foreground text-sm">
            {t("serviceDesc")}
          </span>
        </div>
      </section>

      {envelopes.length > 0 && (
        <section className="bg-card overflow-hidden rounded-md border shadow-2xs">
          <table className="w-full table-fixed">
            <thead className="bg-sidebar text-muted-foreground border-b text-sm">
              <tr>
                <th className="w-1/3 px-4 py-3 text-left font-semibold">
                  {t("colFrom")}
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  {t("colSubject")}
                </th>
                <th className="w-44 px-4 py-3 text-right font-semibold whitespace-nowrap">
                  {t("colTime")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {envelopes.map((envelope) => (
                <tr
                  key={envelope.id}
                  onClick={() => onSelect(envelope)}
                  className={clsx(
                    "hover:bg-secondary group cursor-pointer transition-colors",
                    selected?.id === envelope.id && "bg-secondary",
                    envelope.animate && "animate-in slide-in-from-right"
                  )}
                >
                  <td className="truncate px-4 py-3 text-sm">
                    {fmtFrom(envelope.from)}
                  </td>
                  <td className="truncate px-4 py-3">
                    <span className="text-foreground">{envelope.subject}</span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-right text-sm whitespace-nowrap">
                    {fmtDate(envelope.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {(selected || envelopes.length === 0) && (
      <section className="bg-card rounded-md border shadow-2xs">
        <div className="flex items-center justify-between gap-2 border-b px-5 py-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold">
              {selected ? selected.subject || t("noSubject") : t("faqTitle")}
            </span>
            {selected && (
              <span className="text-muted-foreground flex flex-wrap gap-x-3 text-xs">
                <span className="truncate">{selected.from}</span>
                <span className="shrink-0">{fmtDate(selected.created_at)}</span>
              </span>
            )}
          </div>
          {selected && (
            <div className="flex shrink-0 items-center gap-1">
              {rawData && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRawOpen(true)}
                  aria-label="raw"
                >
                  <Code2 size={18} />
                </Button>
              )}
              <DeleteEnvelope
                id={selected.id}
                lang={lang}
                onDeleted={onEnvelopeDeleted}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={t("deleteTitle")}
                >
                  <Trash2 size={18} />
                </Button>
              </DeleteEnvelope>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelected(null)
                  if (shadowRef.current) shadowRef.current.innerHTML = ""
                }}
                aria-label={t("backToList")}
              >
                <ArrowLeft size={18} />
              </Button>
            </div>
          )}
        </div>

        {!selected && (
          <div className="text-muted-foreground flex items-center gap-2 px-5 py-4">
            {loading ? (
              <>
                <RotateCw className="animate-spin" size={16} />
                <span>{t("listLoading")}</span>
              </>
            ) : (
              <span>{t("faqContent")}</span>
            )}
          </div>
        )}

        {selected && (
          <div className="px-5 py-4">
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {attachments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onDownload(a.id)}
                    className="bg-secondary text-muted-foreground hover:text-foreground group flex items-center gap-1 rounded-sm border px-1.5 py-1 text-sm hover:cursor-pointer hover:shadow-xs"
                  >
                    <Download
                      className="animate-in fade-in hidden duration-500 group-hover:block"
                      size={16}
                    />
                    <Paperclip className="group-hover:hidden" size={16} />
                    {a.filename}
                  </div>
                ))}
              </div>
            )}
            {detailLoading && (
              <div className="text-muted-foreground flex items-center gap-2">
                <RotateCw className="animate-spin" size={16} />
                <span>{t("mailLoading")}</span>
              </div>
            )}
            <div ref={contentRef} />
          </div>
        )}
      </section>
      )}

      <AlertDialog open={rawOpen} onOpenChange={setRawOpen}>
        <AlertDialogContent className="flex max-h-11/12 flex-col sm:max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>RAW</AlertDialogTitle>
            <AlertDialogDescription>
              {selected?.subject}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <pre className="flex-1 overflow-auto rounded-md border bg-secondary p-3 text-xs">
            <code>{rawData ? JSON.stringify(rawData, null, 2) : ""}</code>
          </pre>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setRawOpen(false)}>
              {t("cancel")}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Content
