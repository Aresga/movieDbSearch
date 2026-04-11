import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export interface QRCodeDisplayProps {
  url: string
  secret: string
}

/**
 * QRCodeDisplay Component
 * An isolated visual renderer that securely handles rendering the TOTP URL into
 * a scannable QR Code element, along with a clipboard copy utility for manual app entry.
 */
export function QRCodeDisplay({ url, secret }: QRCodeDisplayProps) {
  const [didCopy, setDidCopy] = useState(false)

  useEffect(() => {
    if (!didCopy) return
    const timer = window.setTimeout(() => setDidCopy(false), 1800)
    return () => window.clearTimeout(timer)
  }, [didCopy])

  const fallbackCopy = (value: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = value
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    textArea.style.pointerEvents = 'none'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    let copied = false
    try {
      copied = document.execCommand('copy')
    } catch {
      copied = false
    }

    document.body.removeChild(textArea)
    return copied
  }

  const copySecret = async () => {
    let copied = false

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(secret)
        copied = true
      }
    } catch {
      copied = fallbackCopy(secret)
    }

    if (!copied) {
      copied = fallbackCopy(secret)
    }

    if (copied) {
      setDidCopy(true)
      toast.success('Secret copied!')
      return
    }

    toast.error('Could not copy automatically. Please copy it manually.')
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded-xl shadow-inner">
        {url.startsWith('data:image') ? (
          <img src={url} alt="2FA QR Code" className="w-[180px] h-[180px]" />
        ) : (
          <QRCodeSVG value={url} size={180} />
        )}
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">
          Can't scan? Enter this secret manually:
        </p>
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
          <code className="text-xs font-mono tracking-widest break-all flex-1">{secret}</code>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            onClick={copySecret}
            title={didCopy ? 'Copied' : 'Copy secret'}
            aria-label={didCopy ? 'Secret copied' : 'Copy secret'}
          >
            {didCopy ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
