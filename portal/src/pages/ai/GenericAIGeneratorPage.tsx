
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, RefreshCw, Check, Copy, Sparkles, FileText, AlignLeft, Type, ArrowLeft } from 'lucide-react';
import { aiService, AIGenerateType } from '@/services/ai-service';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function GenericAIGeneratorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as AIGenerateType || 'blog';
  const returnUrl = searchParams.get('returnUrl') || '/admin/dashboard';
  const defaultPrompt = searchParams.get('prompt') || '';

  const [prompt, setPrompt] = useState(defaultPrompt);
  const [type, setType] = useState<AIGenerateType>(typeParam);
  const [tone, setTone] = useState<'formal' | 'casual' | 'inspirational' | 'academic'>('formal');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: "Prompt kosong",
        description: "Mohon masukkan topik atau instruksi untuk AI.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const content = await aiService.generateContent({
        type,
        prompt,
        tone,
        length
      });
      setResult(content);
      toast({
        title: "Berhasil",
        description: "Konten berhasil dibuat oleh AI.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menghubungi layanan AI.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast({ description: "Disalin ke clipboard" });
  };

  const handleUseContent = () => {
    navigate(returnUrl, { state: { aiContent: result } });
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <PageHeader 
        title="AI Content Generator" 
        description="Asisten cerdas untuk membuat konten islami berkualitas tinggi." 
        icon={Sparkles}
      >
        <Button variant="outline" onClick={() => navigate(returnUrl)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Controls Panel */}
        <Card className="lg:col-span-1 h-full flex flex-col">
            <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="w-4 h-4" /> Tipe Konten
                        </Label>
                        <Select value={type} onValueChange={(v) => setType(v as AIGenerateType)}>
                            <SelectTrigger className="w-full bg-muted/30 border-muted-foreground/20">
                                <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="blog">Artikel Blog</SelectItem>
                                <SelectItem value="vision_mission">Visi & Misi</SelectItem>
                                <SelectItem value="program_description">Deskripsi Program</SelectItem>
                                <SelectItem value="announcement">Pengumuman Resmi</SelectItem>
                                <SelectItem value="educational_content">Konten Edukatif</SelectItem>
                                <SelectItem value="activity_report">Laporan Kegiatan</SelectItem>
                                <SelectItem value="islamic_quote">Quotes & Doa</SelectItem>
                                <SelectItem value="biography">Biografi Tokoh</SelectItem>
                                <SelectItem value="pesantren_activity">Kegiatan Pesantren</SelectItem>
                                <SelectItem value="social_media">Caption Sosmed</SelectItem>
                                <SelectItem value="curriculum">Kurikulum</SelectItem>
                                <SelectItem value="faq">FAQ</SelectItem>
                                <SelectItem value="profile">Profil Lembaga</SelectItem>
                                <SelectItem value="facility_description">Deskripsi Fasilitas</SelectItem>
                                <SelectItem value="event_content">Konten Event</SelectItem>
                                <SelectItem value="islamic_article">Artikel Keislaman</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <AlignLeft className="w-4 h-4" /> Topik / Instruksi
                        </Label>
                        <Textarea 
                            placeholder="Contoh: Tuliskan visi misi pesantren modern yang berfokus pada tahfidz dan teknologi..." 
                            className="min-h-[160px] resize-none bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors p-4 leading-relaxed"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-muted-foreground">
                                <Type className="w-4 h-4" /> Nada
                            </Label>
                            <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                                <SelectTrigger className="bg-muted/30 border-muted-foreground/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="formal">Formal</SelectItem>
                                    <SelectItem value="casual">Santai</SelectItem>
                                    <SelectItem value="inspirational">Inspiratif</SelectItem>
                                    <SelectItem value="academic">Akademis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-muted-foreground">
                                <AlignLeft className="w-4 h-4" /> Panjang
                            </Label>
                            <Select value={length} onValueChange={(v: any) => setLength(v)}>
                                <SelectTrigger className="bg-muted/30 border-muted-foreground/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="short">Pendek</SelectItem>
                                    <SelectItem value="medium">Sedang</SelectItem>
                                    <SelectItem value="long">Panjang</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Button 
                    className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 mt-auto" 
                    onClick={handleGenerate} 
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sedang Menulis...
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-5 h-5 mr-2" />
                            Generate Content
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>

        {/* Result Panel */}
        <Card className="lg:col-span-2 h-full flex flex-col bg-muted/20 border-dashed">
            <CardContent className="p-6 flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-foreground">Preview Hasil</Label>
                        {result && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Generated</Badge>}
                    </div>
                    
                    {result && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopy} className="hover:bg-background">
                                <Copy className="w-4 h-4 mr-2" /> Salin
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleGenerate} className="hover:bg-background">
                                <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                            </Button>
                            <Button onClick={handleUseContent} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Check className="w-4 h-4 mr-2" /> Gunakan Konten Ini
                            </Button>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 bg-background rounded-xl border shadow-sm overflow-hidden flex flex-col relative">
                    {loading && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                            <div className="p-4 bg-emerald-50 rounded-full animate-pulse">
                                <Sparkles className="w-8 h-8 text-emerald-600 animate-spin" style={{ animationDuration: '3s' }} />
                            </div>
                            <p className="text-muted-foreground font-medium animate-pulse">AI sedang berpikir...</p>
                        </div>
                    )}
                    
                    <ScrollArea className="flex-1 p-8">
                        {result ? (
                            <div className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                                {result}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center opacity-60">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Wand2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Belum ada konten</h3>
                                <p className="max-w-xs mx-auto">
                                    Masukkan instruksi di panel kiri dan klik tombol Generate untuk mulai membuat konten.
                                </p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
