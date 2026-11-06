import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { MediaLibraryModal } from '../media/MediaLibraryModal';

interface DualImageInputProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Tampilkan tombol "Pilih dari Galeri" (Media Library). Hanya untuk admin panel. */
  showMediaLibrary?: boolean;
}
export function DualImageInput({
  value,
  onChange,
  label = 'Gambar / Foto',
  placeholder = 'https://...',
  disabled = false,
  showMediaLibrary = false,
}: DualImageInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    setIsUploading(true);
    const toastId = toast.loading('Mengunggah gambar...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.url) {
        onChange(response.data.url);
        toast.success('Gambar berhasil diunggah', { id: toastId });
      } else {
        throw new Error('Respons tidak valid');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Gagal mengunggah gambar', { id: toastId });
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {label && <Label>{label}</Label>}
        {showMediaLibrary && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            onClick={() => setMediaLibraryOpen(true)}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-2" />
            Pilih dari Galeri
          </Button>
        )}
      </div>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="upload" disabled={disabled}>
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" disabled={disabled}>
            <LinkIcon className="w-4 h-4 mr-2" />
            URL Eksternal
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <div
            className={cn(
              "relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={onFileChange}
              accept="image/*"
              disabled={disabled || isUploading}
            />
            {isUploading ? (
              <div className="flex flex-col items-center text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Sedang mengunggah...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-background rounded-full border mb-2">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Klik untuk upload atau drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 2MB</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="url">
          <div className="flex gap-2">
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Masukkan URL gambar langsung (misal: dari CDN atau Google Photos)
          </p>
        </TabsContent>
      </Tabs>
      {}
      {value && (
        <div className="relative mt-4 group w-fit">
          <div className="relative w-40 h-40 rounded-lg overflow-hidden border bg-muted">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Error+Loading';
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange('')}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {showMediaLibrary && (
        <MediaLibraryModal 
          open={mediaLibraryOpen} 
          onOpenChange={setMediaLibraryOpen}
          mode="select"
          onSelect={(files) => {
            if (files?.[0]) {
              onChange(files[0].url);
              setMediaLibraryOpen(false);
            }
          }}
        />
      )}
    </div>
  );
}