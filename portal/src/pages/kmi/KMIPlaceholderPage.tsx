/**
 * KMI Placeholder Page — Halaman ini dalam pengembangan
 */
import { motion } from 'framer-motion';
import { Construction, School } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  description?: string;
  icon?: any;
}

export default function KMIPlaceholderPage({ title, description, icon: Icon = School }: Props) {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {description && <p className="text-muted-foreground mb-6">{description}</p>}
        <div className="inline-flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-800">
          <Construction className="w-4 h-4" />
          Sedang dalam pengembangan — Segera hadir!
        </div>
        <div className="mt-8">
          <Link to="/admin/kmi/dashboard" className="text-sm text-primary hover:underline">
            ← Kembali ke Dashboard KMI
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
