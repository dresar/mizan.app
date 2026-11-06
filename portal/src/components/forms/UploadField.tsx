import { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
interface UploadFieldProps {
  label: string;
  accept?: string;
  onFileSelect?: (file: File | null) => void;
}
const UploadField = ({ label, accept = '.pdf,.jpg,.png', onFileSelect }: UploadFieldProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect?.(file);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect?.(file);
    }
  };
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    onFileSelect?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  if (fileName) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <div className="w-8 h-8 rounded-md gradient-primary flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{label}</p>
          <p className="text-xs text-muted-foreground truncate">{fileName}</p>
        </div>
        <button onClick={handleRemove} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
  return (
    <>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'w-full flex flex-col items-center gap-2 p-6 rounded-lg border-2 border-dashed transition-colors text-center cursor-pointer',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Upload className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Klik atau seret file ({accept})</p>
        </div>
      </button>
    </>
  );
};
export default UploadField;