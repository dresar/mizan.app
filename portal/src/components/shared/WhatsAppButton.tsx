import { useState } from 'react';
import { MessageCircle, Send, X, Search, ChevronRight } from 'lucide-react';
import { usePublicData } from '@/hooks/use-public-data';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
interface WhatsAppButtonProps {
  className?: string;
  role?: 'public' | 'user' | 'admin';
}
const defaultTemplates = [
  { label: 'Info Pendaftaran', message: 'Assalamu\'alaikum, saya ingin bertanya mengenai informasi pendaftaran santri baru.' },
  { label: 'Biaya Pendidikan', message: 'Assalamu\'alaikum, saya ingin mengetahui rincian biaya pendidikan di pesantren.' },
  { label: 'Program Pesantren', message: 'Assalamu\'alaikum, saya tertarik dengan program pendidikan di pesantren. Bisa dijelaskan lebih lanjut?' },
  { label: 'Konfirmasi Pembayaran', message: 'Assalamu\'alaikum, saya ingin mengkonfirmasi pembayaran pendaftaran.' },
];
const WhatsAppButton = ({ className, role = 'public' }: WhatsAppButtonProps) => {
  const { data: settings } = usePublicData<{ noTelepon?: string }>(['settings'], '/core/settings');
  const { data: templates } = usePublicData<{ id: number, nama: string, pesan: string, tipe: string }[]>(['whatsapp-templates'], '/core/whatsapp-templates');
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const filteredTemplates = (templates || [])
    .filter(t => {
      if (role === 'admin') return t.tipe === 'admin';
      if (role === 'user') return t.tipe === 'user' || t.tipe === 'public';
      return t.tipe === 'public';
    })
    .filter(t => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return t.nama.toLowerCase().includes(query) || t.pesan.toLowerCase().includes(query);
    });
  const displayTemplates = filteredTemplates.length > 0 
    ? filteredTemplates.map(t => ({ label: t.nama, message: t.pesan }))
    : (role === 'public' ? defaultTemplates : []);
  const processTemplate = (text: string) => {
    let processedText = text;
    if (user) {
      const namaLengkap = [user.firstName, user.lastName].filter(Boolean).join(' ');
      processedText = processedText
        .replace(/{{nama}}|{{nama-santri}}|{{name}}/gi, namaLengkap || 'User')
        .replace(/{{email}}/gi, user.email || '')
        .replace(/{{no_hp}}|{{phone}}|{{wa}}/gi, user.phone || '')
        .replace(/{{username}}/gi, user.username || '');
    }
    return processedText;
  };
  const handleTemplateClick = (text: string) => {
    const processed = processTemplate(text);
    setMessage(processed);
  };
  const handleSend = (text: string) => {
    const phone = settings?.noTelepon?.replace(/\D/g, '') || '';
    if (!phone) return;
    const formattedPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
    setIsOpen(false);
    setMessage('');
  };
  if (!settings?.noTelepon) return null;
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Chat WhatsApp"
        className={cn(
          "fixed z-50 flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform duration-200 hover:bg-[#20b85a]",
          className || "bottom-6 right-6"
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 bg-background [&>button]:hidden">
          {}
          <div className="bg-[#25D366] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">WhatsApp Support</h3>
                <p className="text-xs text-white/80">
                  {role === 'admin' ? 'Admin Support' : 'Admin Raudhatussalam'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col h-[450px]">
            {}
            <div className="p-3 border-b bg-muted/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari template pesan..." 
                  className="pl-9 bg-background border-border focus-visible:ring-[#25D366]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {}
            <div className="flex-1 overflow-y-auto p-2 bg-muted/30">
              <div className="space-y-2">
                {displayTemplates.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTemplateClick(t.message);
                    }}
                    className="w-full text-left p-3 bg-card hover:bg-accent border border-border rounded-lg transition-colors shadow-sm group relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{t.label}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.message}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                    </div>
                  </button>
                ))}
                {displayTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Tidak ada template yang ditemukan.
                  </div>
                )}
              </div>
            </div>
            {}
            <div className="p-3 bg-muted/50 border-t border-border">
              <div className="flex flex-col gap-2">
                <Textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Pilih template di atas atau ketik pesan manual..." 
                  className="min-h-[80px] max-h-[120px] resize-none border-none focus-visible:ring-0 bg-background rounded-xl px-4 py-3 text-sm shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (message.trim()) handleSend(message);
                    }
                  }}
                />
                <div className="flex justify-end">
                  <Button 
                    className="rounded-full px-6 gap-2 bg-[#25D366] hover:bg-[#20b85a]"
                    onClick={() => message.trim() && handleSend(message)}
                    disabled={!message.trim()}
                  >
                    <span>Kirim WhatsApp</span>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default WhatsAppButton;