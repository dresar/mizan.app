import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppStore } from '@/stores/app-store';
import { Loader2 } from 'lucide-react';

type ConfirmDialogProps = {
  /** Controlled mode: when provided, dialog uses these props instead of store */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  confirmText?: string;
  isLoading?: boolean;
  variant?: 'default' | 'destructive';
};

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { confirmDialog, hideConfirm } = useAppStore();

  const isControlled = props.open !== undefined;
  const open = isControlled ? !!props.open : confirmDialog.open;
  const onOpenChange = isControlled ? props.onOpenChange : ((o: boolean) => !o && hideConfirm());
  const title = isControlled ? (props.title ?? 'Konfirmasi') : confirmDialog.title;
  const description = isControlled ? (props.description ?? '') : confirmDialog.description;
  const confirmText = isControlled ? (props.confirmText ?? 'Konfirmasi') : 'Konfirmasi';
  const isLoading = isControlled ? (props.isLoading ?? false) : false;
  const variant = isControlled ? (props.variant ?? 'default') : (confirmDialog.variant ?? 'default');

  const handleConfirm = () => {
    if (isControlled && props.onConfirm) {
      props.onConfirm();
      props.onOpenChange?.(false);
    } else {
      confirmDialog.onConfirm();
      hideConfirm();
    }
  };

  const handleCancel = () => {
    if (isControlled) {
      props.onOpenChange?.(false);
    } else {
      confirmDialog.onCancel?.();
      hideConfirm();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => onOpenChange?.(o)}>
      <AlertDialogContent aria-describedby="confirm-dialog-desc">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription id="confirm-dialog-desc">
            {description || ' '}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isLoading}
            className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
