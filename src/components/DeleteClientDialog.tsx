import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { ThemeName, isNeon } from '@/lib/theme';

interface DeleteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  onConfirm: () => void;
  theme: ThemeName;
}

export function DeleteClientDialog({
  open,
  onOpenChange,
  clientName,
  onConfirm,
  theme,
}: DeleteClientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const neon = isNeon(theme);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[425px] ${
        neon
          ? 'bg-slate-900 border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.15)]'
          : ''
      }`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${
            neon ? 'text-cyan-300' : ''
          }`}>
            <div className={`p-2 rounded-full ${
              neon ? 'bg-red-500/15' : 'bg-red-100'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                neon ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className={neon ? 'text-slate-400' : ''}>
            Are you sure you want to delete <strong>{clientName}</strong>? 
            This action cannot be undone. All client data, including communication history 
            and investment records, will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        
        <div className={`mt-2 p-3 rounded-lg ${
          neon 
            ? 'bg-amber-500/10 border border-amber-500/20' 
            : 'bg-amber-50 border border-amber-200'
        }`}>
          <p className={`text-sm ${
            neon ? 'text-amber-300' : 'text-amber-800'
          }`}>
            ⚠️ Warning: This will permanently delete the client and all associated data from the system.
          </p>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className={`rounded-full ${
              neon 
                ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400' 
                : ''
            }`}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="rounded-full flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}