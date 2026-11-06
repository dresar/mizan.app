import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus, Image as ImageIcon, MapPin, Calendar, Edit, Trash2, FolderOpen, MoreVertical, LayoutGrid, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Dokumentasi = {
  id: number;
  judul: string;
  deskripsi: string;
  kategori: string;
  tanggalKegiatan: string | null;
  lokasi: string;
  order: number;
  isPublished: boolean;
};

type DokumentasiImage = {
  id: number;
  gambar: string;
  altText: string;
  order: number;
  dokumentasiId: number;
};

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val && typeof val === 'object' && 'data' in val) {
    const data = (val as { data: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function DocumentationListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showConfirm } = useAppStore();

  const { data: docsRaw, isLoading: docsLoading } = useQuery({
    queryKey: ['resource', 'dokumentasi'],
    queryFn: async () => {
      const res = await api.get('/admin/generic/dokumentasi');
      return res.data;
    },
  });

  const { data: imagesRaw, isLoading: imagesLoading } = useQuery({
    queryKey: ['resource', 'dokumentasiImages'],
    queryFn: async () => {
      const res = await api.get('/admin/generic/dokumentasiImages');
      return res.data;
    },
  });

  const docs = useMemo(() => toArray<Dokumentasi>(docsRaw).sort((a, b) => (a.order || 0) - (b.order || 0)), [docsRaw]);
  const images = useMemo(() => toArray<DokumentasiImage>(imagesRaw), [imagesRaw]);

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => api.delete(`/admin/generic/dokumentasi/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'dokumentasi'] });
      toast.success('Album dokumentasi berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus album')
  });

  const handleDelete = (id: string | number) => {
    showConfirm({
      title: 'Hapus Dokumentasi',
      description: 'Apakah Anda yakin ingin menghapus album ini beserta isinya?',
      variant: 'destructive',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const isLoading = docsLoading || imagesLoading;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Media & Dokumentasi"
        description="Pusat pengelolaan arsip visual dan galeri kegiatan pesantren"
        icon={ImageIcon}
      >
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/5"
            onClick={() => navigate('/admin/system-docs')}
          >
            <Info className="mr-2 h-4 w-4" />
            Panduan
          </Button>
          <Button 
            onClick={() => navigate(`/admin/documentation/new`)}
            className="shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Album Baru
          </Button>
        </div>
      </PageHeader>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] bg-muted/60 animate-pulse rounded-2xl" />
                <div className="h-5 w-2/3 bg-muted animate-pulse rounded-full" />
                <div className="h-4 w-full bg-muted/60 animate-pulse rounded-full" />
              </div>
            ))}
          </motion.div>
        ) : docs.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 backdrop-blur-sm"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <FolderOpen className="h-10 w-10 text-primary opacity-40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Belum Ada Dokumentasi</h3>
            <p className="text-muted-foreground max-w-sm text-center mb-8">
              Mulai mendokumentasikan kegiatan pesantren dengan membuat album pertama Anda hari ini.
            </p>
            <Button 
                onClick={() => navigate(`/admin/documentation/new`)}
                size="lg"
                className="rounded-full px-8 shadow-xl"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tambah Dokumentasi
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {docs.map((item) => {
              const itemImages = images
                .filter((img) => {
                  const imgDocId = img.dokumentasiId ?? (img as any).dokumentasi_id;
                  return String(imgDocId) === String(item.id);
                })
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              
              const coverImage = itemImages.length > 0 ? (itemImages[0].gambar || (itemImages[0] as any).image) : null;
              const isPublished = item.isPublished ?? (item as any).is_published;
              const tanggalKegiatan = item.tanggalKegiatan ?? (item as any).tanggal_kegiatan;

              return (
                <motion.div key={item.id} variants={itemVariants}>
                  <Card className="h-full overflow-hidden border-none bg-background/50 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 group relative">
                    <div 
                      className="aspect-[4/3] relative overflow-hidden cursor-pointer bg-muted"
                      onClick={() => navigate(`/admin/documentation/${item.id}/edit`)}
                    >
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={item.judul}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 bg-gradient-to-br from-muted to-muted/30">
                          <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
                          <span className="text-xs font-semibold tracking-wider uppercase">No Preview</span>
                        </div>
                      )}
                      
                      {}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge 
                          className={cn(
                            "px-2.5 py-0.5 border-none backdrop-blur-md shadow-lg font-medium text-[10px] uppercase tracking-wider",
                            isPublished 
                              ? "bg-emerald-500/90 text-white" 
                              : "bg-amber-500/90 text-white"
                          )}
                        >
                          {isPublished ? 'Live' : 'Draft'}
                        </Badge>
                      </div>

                      <div className="absolute bottom-4 left-4 flex items-center transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold">
                          <LayoutGrid className="h-3 w-3 mr-1.5 opacity-70" />
                          {itemImages.length} Foto
                        </Badge>
                      </div>

                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-8 w-8 rounded-full bg-white/20 border-white/40 border backdrop-blur-md text-white hover:bg-white/30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => navigate(`/admin/documentation/${item.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Album
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus Album
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <CardContent className="p-5 flex flex-col h-[calc(100%-12/16*100%)]">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                          <span className="bg-primary/10 px-2 py-0.5 rounded text-primary">{item.kategori || 'Kegiatan'}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {tanggalKegiatan ? new Date(tanggalKegiatan).toLocaleDateString('id-ID', { year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight line-clamp-1 mb-2 group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/admin/documentation/${item.id}/edit`)}>
                          {item.judul}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.deskripsi || 'Album dokumentasi belum memiliki deskripsi ringkas.'}
                        </p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-muted/50 flex items-center justify-between">
                        <div className="flex items-center text-[11px] font-medium text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary/50" />
                          <span className="max-w-[120px] truncate">{item.lokasi || 'Pesantren'}</span>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-3 rounded-full text-[11px] font-bold hover:bg-primary/5 hover:text-primary transition-all"
                          onClick={() => navigate(`/admin/documentation/${item.id}/edit`)}
                        >
                          Lihat Detail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
