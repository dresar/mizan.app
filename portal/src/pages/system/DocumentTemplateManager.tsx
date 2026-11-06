import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Edit, Trash, Sparkles, Eye, Save, ArrowLeft, Loader2, Upload, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { aiService } from '@/services/ai-service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { compressAndConvertToWebP } from '@/lib/image-utils';

type Template = {
  id: number;
  name: string;
  type: string;
  content: string;
  orientation: string;
  isActive: boolean;
};

export default function DocumentTemplateManager() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['documentTemplates'],
    queryFn: async () => {
      const res = await api.get('/admin/generic/documentTemplates');
      return res.data.data as Template[];
    }
  });

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
  };

  if (isEditorOpen) {
    return (
      <TemplateEditor 
        template={selectedTemplate} 
        onClose={handleCloseEditor} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Template Dokumen</h3>
          <p className="text-sm text-muted-foreground">Kelola template surat dan dokumen pesantren</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Buat Template Baru
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between items-start">
                  <span className="truncate">{template.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(template)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="capitalize">{template.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-muted/50 rounded-md p-2 text-[10px] overflow-hidden text-muted-foreground relative">
                   {template.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                   <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
              </CardContent>
            </Card>
          ))}
          {templates?.length === 0 && (
             <div className="col-span-full text-center p-8 border border-dashed rounded-lg text-muted-foreground">
               Belum ada template dokumen. Buat template pertama Anda!
             </div>
          )}
        </div>
      )}
    </div>
  );
}

function TemplateEditor({ template, onClose }: { template: Template | null, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || 'surat_keterangan',
    content: template?.content || '',
    orientation: template?.orientation || 'portrait',
    headerImage: '', // State for header image URL
  });

  // Extract header image from content on load
  useEffect(() => {
    if (template?.content) {
      const imgMatch = template.content.match(/<img class="header-image-kop" src="([^"]+)"[^>]*>/);
      if (imgMatch && imgMatch[1]) {
        setFormData(prev => ({
          ...prev,
          headerImage: imgMatch[1],
          content: prev.content.replace(imgMatch[0], '')
        }));
      } else {
        // Fallback default content if empty and new
        if (!template.content && !formData.content) {
             setFormData(prev => ({
                 ...prev,
                 content: `
<div style="text-align: right; margin-bottom: 20px;">{{tanggal}}</div>
<div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته</div>
<p>Dengan hormat,</p>
<p>Sehubungan dengan kegiatan rutin pesantren, kami mengundang Bapak/Ibu untuk hadir pada acara yang akan dilaksanakan di aula utama.</p>
<p>Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya kami ucapkan terima kasih.</p>
<div style="margin-top: 40px; text-align: right;">
<p>Hormat Kami,</p>
<br><br>
<p>Pengasuh Pondok</p>
</div>`
             }));
        }
      }
    } else if (!template) {
        // Default for new template
         setFormData(prev => ({
                 ...prev,
                 content: `
<div style="text-align: right; margin-bottom: 20px;">{{tanggal}}</div>
<div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته</div>
<p>Dengan hormat,</p>
<p>Sehubungan dengan kegiatan rutin pesantren, kami mengundang Bapak/Ibu untuk hadir pada acara yang akan dilaksanakan di aula utama.</p>
<p>Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya kami ucapkan terima kasih.</p>
<div style="margin-top: 40px; text-align: right;">
<p>Hormat Kami,</p>
<br><br>
<p>Pengasuh Pondok</p>
</div>`
         }));
    }
  }, [template]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiDialog, setShowAiDialog] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Re-inject header image into content before saving
      let finalContent = data.content;
      if (data.headerImage) {
        // Ensure we don't duplicate if already there (though logic above strips it)
        finalContent = `<img class="header-image-kop" src="${data.headerImage}" style="width: 100%; height: auto; display: block; margin-bottom: 20px;">${finalContent}`;
      }

      const payload = { ...data, content: finalContent, isActive: true, updatedAt: new Date().toISOString() };
      // Remove temporary headerImage field from payload
      delete payload.headerImage;

      if (template?.id) {
        return api.put(`/admin/generic/documentTemplates/${template.id}`, payload);
      }
      return api.post('/admin/generic/documentTemplates', { ...payload, createdAt: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
      toast.success('Template berhasil disimpan');
      onClose();
    },
    onError: () => toast.error('Gagal menyimpan template')
  });

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`/admin/generic/documentTemplates/${template?.id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
        toast.success('Template dihapus');
        onClose();
    }
  });

  const handleGenerateAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      // Use the generic AI service, mapped to a suitable type or 'educational_content'/custom
      // Since 'document_template' isn't a specific type in AIGenerateType, we can reuse 'announcement' or just pass context.
      // But actually, let's look at AIGenerateType. 'announcement' is close, or 'islamic_article'.
      // Better: We'll modify the prompt heavily.
      
      const content = await aiService.generateContent({
        type: 'announcement', // Using as base
        prompt: `Bertindaklah sebagai sekretaris profesional di sebuah Pondok Pesantren.
        Tugas Anda adalah membuat template surat/dokumen HTML yang SANGAT SEDERHANA, SINGKAT, dan PADAT.
        
        Konteks:
        - Dokumen untuk keperluan internal/eksternal pesantren.
        - Harus muat dalam 1 halaman A4 dengan margin standar.
        - Gaya bahasa: Formal, Sopan, Islami.

        Aturan Layout & Konten:
        1. Mulai dengan tempat dan tanggal di rata kanan (gunakan placeholder {{tanggal}}).
        2. WAJIB sertakan salam "Assalamualaikum Warahmatullahi Wabarakatuh" dalam tulisan ARAB (السلام عليكم ورحمة الله وبركاته) rata tengah (center), font size agak besar.
        3. Isi surat harus to the point (langsung ke inti), jangan bertele-tele. Maksimal 3-4 paragraf pendek.
        4. Penutup dengan "Wassalamualaikum..." (teks biasa atau Arab).
        5. Tanda tangan di kanan bawah (Hormat Kami, [Jarak], Pengurus/Pengasuh).
        6. Gunakan placeholder format {{nama_variabel}} untuk data dinamis (contoh: {{nama_wali}}, {{hari}}, {{waktu}}).

        Aturan Teknis HTML:
        - Gunakan HANYA tag HTML dasar (<p>, <div>, <br>, <b>).
        - Gunakan inline style untuk perataan (style="text-align: center;" atau "text-align: right;").
        - JANGAN gunakan markdown code block (\`\`\`html). Langsung output raw HTML nya saja.
        
        Permintaan User: "${aiPrompt}"`,
        length: 'medium',
        tone: 'formal'
      });
      
      setFormData(prev => ({ ...prev, content: content }));
      setShowAiDialog(false);
      toast.success('Template berhasil digenerate AI');
    } catch (e) {
      toast.error('Gagal generate AI');
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Mengompres & mengupload kop surat...');

    try {
      // 1. Compress Image
      let fileToUpload = file;
      try {
        fileToUpload = await compressAndConvertToWebP(file, 0.8, 1920);
      } catch (err) {
        console.warn('Gagal kompres gambar, menggunakan file asli', err);
      }

      // 2. Upload to Server
      const uploadFormData = new FormData();
      uploadFormData.append('file', fileToUpload);
      
      const response = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.url) {
        setFormData(prev => ({ ...prev, headerImage: response.data.url }));
        toast.success('Kop surat berhasil diupload', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal upload kop surat', { id: toastId });
    } finally {
      setIsUploading(false);
      // Reset input value to allow re-uploading same file if needed
      e.target.value = '';
    }
  };

  const handleRemoveHeaderImage = () => {
    setFormData(prev => ({ ...prev, headerImage: '' }));
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-medium">{template ? 'Edit Template' : 'Template Baru'}</h3>
          </div>
        </div>
        <div className="flex gap-2">
          {template && (
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate()}>
                  <Trash className="h-4 w-4 mr-2" /> Hapus
              </Button>
          )}
          <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending}>
            <Save className="h-4 w-4 mr-2" /> Simpan
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 flex-1 overflow-hidden">
        {/* Editor Column */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Nama Template</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Contoh: Surat Keterangan Aktif Santri"
              />
            </div>
            
            <div className="space-y-2">
                <Label>Kop Surat (Header Image)</Label>
                
                {formData.headerImage ? (
                  <div className="relative group rounded-lg border overflow-hidden bg-muted/20">
                    <img 
                      src={formData.headerImage} 
                      alt="Kop Surat Preview" 
                      className="w-full h-auto max-h-[120px] object-contain bg-white"
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 rounded-full shadow-sm"
                        onClick={handleRemoveHeaderImage}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-2 text-xs text-center text-muted-foreground border-t bg-muted/10 truncate">
                      {formData.headerImage.split('/').pop()}
                    </div>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative group flex flex-col items-center justify-center gap-2"
                    onClick={() => document.getElementById('kop-upload')?.click()}
                  >
                    <input 
                      id="kop-upload"
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleHeaderImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground">Mengupload...</span>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-primary/10 rounded-full text-primary group-hover:bg-primary/20 transition-colors">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-foreground">Klik untuk upload Kop Surat</span>
                          <p className="text-xs text-muted-foreground">JPG, PNG, WebP (Max 2MB)</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Fallback Input URL jika upload gagal atau ingin manual */}
                {!formData.headerImage && (
                   <div className="mt-2">
                      <p className="text-[10px] text-muted-foreground mb-1">Atau masukkan URL gambar:</p>
                      <Input 
                          value={formData.headerImage || ''} 
                          onChange={e => setFormData({...formData, headerImage: e.target.value})} 
                          placeholder="https://..."
                          className="font-mono text-xs h-8"
                      />
                   </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label>Tipe Dokumen</Label>
                <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="biodata">Biodata</SelectItem>
                    <SelectItem value="kuitansi">Kuitansi</SelectItem>
                    <SelectItem value="surat_keterangan">Surat Keterangan</SelectItem>
                    <SelectItem value="undangan">Undangan</SelectItem>
                    <SelectItem value="laporan">Laporan</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label>Orientasi</Label>
                <Select value={formData.orientation} onValueChange={v => setFormData({...formData, orientation: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 min-h-[400px]">
            <div className="flex justify-between items-center">
              <Label>Konten HTML</Label>
              <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                    <Sparkles className="h-3 w-3 mr-2" /> Generate with AI
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Template dengan AI</DialogTitle>
                    <CardDescription>Deskripsikan dokumen yang ingin Anda buat</CardDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Deskripsi Dokumen</Label>
                      <Textarea 
                        placeholder="Contoh: Buatkan surat undangan pengambilan rapot untuk wali santri dengan nada formal..." 
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleGenerateAI} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Generate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Textarea 
              className="flex-1 font-mono text-sm leading-relaxed" 
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">
                Tips: Gunakan tag HTML standar. Gunakan {'{{variable}}'} untuk data dinamis.
            </p>
          </div>
        </div>

        {/* Preview Column */}
        <div className="bg-slate-50 border rounded-lg flex flex-col overflow-hidden h-full shadow-inner">
          <div className="p-3 border-b bg-white flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Live Preview</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 border font-mono">
                    A4 {formData.orientation === 'portrait' ? '210 x 297 mm' : '297 x 210 mm'}
                </span>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-slate-200/60 flex items-start justify-center relative">
             <div 
                className="bg-white shadow-2xl transition-all duration-300 relative mx-auto flex flex-col"
                style={{
                    width: '100%',
                    maxWidth: formData.orientation === 'portrait' ? '210mm' : '297mm',
                    aspectRatio: formData.orientation === 'portrait' ? '210/297' : '297/210',
                    // padding: '20mm', // Moved padding to content container
                }}
             >
                {/* Header Image */}
                {formData.headerImage && (
                    <img 
                        src={formData.headerImage} 
                        alt="Kop Surat" 
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '150px' }}
                    />
                )}
                
                <div 
                    dangerouslySetInnerHTML={{ __html: formData.content }} 
                    className="prose max-w-none prose-sm flex-1" 
                    style={{ padding: '20mm' }}
                />
                
                {/* Paper edge effect */}
                <div className="absolute inset-0 pointer-events-none border border-slate-100/50"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
