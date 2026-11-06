import { cn } from '@/lib/utils';
import type { SantriStatus, PaymentStatus, PostStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
type StatusType = SantriStatus | PaymentStatus | PostStatus | 'active' | 'inactive' | 'approved' | 'none';
interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}
const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'badge-pending' },
  verified: { label: 'Terverifikasi', className: 'badge-verified' },
  accepted: { label: 'Diterima', className: 'badge-accepted' },
  approved: { label: 'Disetujui', className: 'badge-accepted' },
  rejected: { label: 'Ditolak', className: 'badge-rejected' },
  none: { label: '-', className: 'badge-draft' },
  draft: { label: 'Draft', className: 'badge-draft' },
  published: { label: 'Dipublikasi', className: 'badge-published' },
  archived: { label: 'Diarsipkan', className: 'badge-draft' },
  active: { label: 'Aktif', className: 'badge-accepted' },
  inactive: { label: 'Nonaktif', className: 'badge-draft' },
};
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'badge-draft' };
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium capitalize border',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}