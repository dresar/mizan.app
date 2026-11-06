import { PageHeader, EmptyState } from '@/components/common';
import { MessageSquare } from 'lucide-react';

export default function AuthorDiscussionsPage() {
  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Diskusi & Review"
        description="Diskusi dan review artikel"
        icon={MessageSquare}
      />
      
      <EmptyState
        title="Fitur Segera Hadir"
        description="Fitur diskusi dan review peer-to-peer sedang dalam tahap pengembangan."
        icon={MessageSquare}
      />
    </div>
  );
}
