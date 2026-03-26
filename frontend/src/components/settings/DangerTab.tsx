import { Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/alert-dialog'
import { useDeleteMe } from '@/hooks/useUser'
import { useExportData } from '@/hooks/useExport'
import type { User } from '@/types'

export function DangerTab({ user }: { user: User }) {
  const { mutate: deleteMe, isPending: deleting } = useDeleteMe()
  const { exportData } = useExportData()

  return (
    <div className="flex flex-col gap-4">
      {/* Export */}
      <div className="rounded-xl border p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-sm">Download My Data</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Download a copy of your profile, reviews and friends list as a JSON file.
          </p>
        </div>
        <Button variant="outline" size="sm" className="self-start gap-2" onClick={exportData}>
          <Download className="size-4" />
          Download my data
        </Button>
      </div>

      {/* Delete */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-destructive text-sm">Delete Account</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="self-start gap-2">
              <Trash2 className="size-4" />
              Delete My Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account <strong>{user.username}</strong> and
                all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteMe()}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
