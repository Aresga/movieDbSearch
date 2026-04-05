import { QRCodeSVG } from 'qrcode.react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface QRCodeDisplayProps {
  url: string
  secret: string
}

export function QRCodeDisplay({ url, secret }: QRCodeDisplayProps) {
  const copySecret = () => {
    navigator.clipboard.writeText(secret).then(() => toast.success('Secret copied!'))
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
          <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={copySecret}>
            <Copy className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
