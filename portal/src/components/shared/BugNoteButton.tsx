import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bug, Loader2, SendHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { DualImageInput } from '@/components/forms/DualImageInput';

export default function BugNoteButton() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    screenshot: '',
  });

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      screenshot: '',
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Judul masalah dan detail bug wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/generic/adminBugnotes', {
        title: form.title.trim(),
        description: form.description.trim(),
        screenshot: form.screenshot || null,
        pageUrl: location.pathname,
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      toast.success('Bug note berhasil dikirim');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Gagal mengirim bug note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Bug Note"
        className="fixed z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 bg-amber-500 hover:bg-amber-600 text-white bottom-40 right-6"
      >
        <Bug className="w-6 h-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kirim Bug Note</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Halaman Saat Ini</Label>
              <Input value={location.pathname} disabled />
            </div>

            <div className="space-y-2">
              <Label>Judul Masalah</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Tombol simpan tidak merespon"
              />
            </div>

            <div className="space-y-2">
              <Label>Detail Bug / Masalah</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Jelaskan langkah-langkah, hasil yang terjadi, dan hasil yang diharapkan..."
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <DualImageInput
                label="Screenshot (opsional)"
                value={form.screenshot}
                onChange={(value) => setForm((prev) => ({ ...prev, screenshot: value }))}
                showMediaLibrary
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="mr-2 h-4 w-4" />
                    Kirim Bug
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

