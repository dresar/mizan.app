import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, LayoutGrid, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { MediaLibraryModal } from '../media/MediaLibraryModal';

interface MultiImageInputProps {
  value?: string; // Newline-separated image URLs
  onChange: (value: string) => void;
  label?: string;
}

export function MultiImageInput({
  value = '',
  onChange,
  label = 'Galeri Foto Tambahan',
}: MultiImageInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse URLs
  const urls = value ? value.split('\n').map(u => u.trim()).filter(Boolean) : [];

  const handleUploadFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const toastId = toast.loading(`Mengunggah ${files.length} gambar...`);
    const newUploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File "${file.name}" terlalu besar (maks 5MB)`);
          continue;
        }
        if (!file.type.startsWith('image/')) {
          toast.error(`File "${file.name}" bukan format gambar`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data?.url) {
          newUploadedUrls.push(response.data.url);
        }
      }

      if (newUploadedUrls.length > 0) {
        const updatedUrls = [...urls, ...newUploadedUrls];
        onChange(updatedUrls.join('\n'));
        toast.success(`Berhasil mengunggah ${newUploadedUrls.length} gambar`, { id: toastId });
      } else {
        toast.error('Gagal mengunggah gambar', { id: toastId });
      }
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      toast.error('Gagal mengunggah gambar', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleSelectFromLibrary = (selectedFiles: any[]) => {
    const selectedUrls = selectedFiles.map(file => file.url);
    const updatedUrls = [...urls, ...selectedUrls];
    onChange(updatedUrls.join('\n'));
    setMediaLibraryOpen(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedUrls = urls.filter((_, idx) => idx !== indexToRemove);
    onChange(updatedUrls.join('\n'));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {label && <Label className="text-sm font-semibold">{label}</Label>}
        <div className="flex gap-2">
          {/* Media Library Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs border-dashed"
            onClick={() => setMediaLibraryOpen(true)}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Pilih dari Galeri
          </Button>

          {/* Bulk Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs border-dashed"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 mr-1.5 text-primary" />
            )}
            Upload Massal
          </Button>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Grid Previews */}
      <div className="border rounded-xl p-4 bg-muted/20 min-h-[120px]">
        {urls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-xs gap-1.5">
            <ImageIcon className="w-8 h-8 opacity-40 text-primary" />
            <p>Belum ada foto tambahan yang dipilih</p>
            <p className="text-[10px] text-muted-foreground/80">
              Gunakan tombol di atas untuk memilih atau mengunggah gambar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {urls.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-background group shadow-sm">
                <img
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[9px] text-white text-center py-0.5">
                  Foto {idx + 1}
                </div>
              </div>
            ))}
            
            {/* Quick Add Square */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center aspect-square bg-background/50 hover:bg-background transition-colors text-muted-foreground hover:text-primary gap-1"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-medium">Tambah</span>
            </button>
          </div>
        )}
      </div>

      {/* Media Library Selector Modal */}
      <MediaLibraryModal
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        onSelect={handleSelectFromLibrary}
        mode="select"
        multiSelect={true}
      />
    </div>
  );
}
