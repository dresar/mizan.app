import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, RefreshCw, Check, Copy, Sparkles, FileText, AlignLeft, Type, X, Target, Search, ArrowLeft } from 'lucide-react';
import { aiService } from '@/services/ai-service';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

export default function BlogAIGeneratorPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('Umum');
  const [tone, setTone] = useState<'formal' | 'casual' | 'inspirational' | 'academic'>('inspirational');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [keywords, setKeywords] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string, content: string, metaTitle: string, metaDesc: string, keywords: string } | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: "Topik kosong",
        description: "Mohon masukkan topik utama artikel blog.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const prompt = `
        Topik: ${topic}
        Target Pembaca: ${targetAudience}
        Keyword SEO: ${keywords}
        
        Tugas: Buat artikel blog lengkap dengan struktur berikut:
        1. Judul yang menarik (Clickbait tapi Islami)
        2. Konten artikel yang mendalam, terstruktur dengan sub-heading (H2, H3), paragraf yang enak dibaca.
        3. Sertakan dalil Al-Quran/Hadits yang relevan.
        4. SEO Meta Title (max 60 chars)
        5. SEO Meta Description (max 160 chars)
        6. SEO Keywords (comma separated)

        FORMAT OUTPUT HARUS JSON valid seperti ini:
        {
          "title": "Judul Artikel...",
          "content": "Isi artikel lengkap dengan format HTML sederhana (p, h2, h3, ul, li)...",
          "metaTitle": "Judul SEO...",
          "metaDesc": "Deskripsi SEO...",
          "keywords": "keyword1, keyword2..."
        }
        Hanya output JSON saja, tanpa teks lain.
      `;

      const rawContent = await aiService.generateContent({
        type: 'blog',
        prompt: prompt,
        tone: tone,
        length: length
      });

      try {
        const jsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        setResult(parsed);
        toast({ title: "Berhasil", description: "Artikel blog berhasil dibuat!" });
      } catch (e) {
        console.error("JSON Parse Error", e);
        setResult({
          title: topic,
          content: rawContent,
          metaTitle: topic,
          metaDesc: rawContent.substring(0, 150),
          keywords: keywords
        });
        toast({ title: "Format Tidak Sesuai", description: "AI memberikan format teks biasa, silakan edit manual.", variant: "default" });
      }

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

  const handleUseArticle = () => {
    if (result) {
        navigate('/admin/blog/posts/new', { 
            state: { generatedData: result } 
        });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <PageHeader title="AI Blog Generator" description="Buat artikel blog berkualitas dengan bantuan AI" icon={Sparkles}>
        <Button variant="outline" onClick={() => navigate('/admin/blog/posts')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Controls Panel */}
        <Card className="lg:col-span-1 h-full flex flex-col">
            <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground"><AlignLeft className="w-4 h-4" /> Topik Utama</Label>
                        <Textarea 
                            placeholder="Contoh: Cara Mendidik Anak Secara Islami di Era Digital..." 
                            className="min-h-[120px] resize-none bg-muted/30 border-muted-foreground/20 p-4"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-muted-foreground"><Target className="w-4 h-4" /> Target Pembaca</Label>
                            <Select value={targetAudience} onValueChange={setTargetAudience}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Umum">Umum</SelectItem>
                                    <SelectItem value="Santri">Santri</SelectItem>
                                    <SelectItem value="Wali Santri">Wali Santri</SelectItem>
                                    <SelectItem value="Remaja">Remaja Islami</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-muted-foreground"><Type className="w-4 h-4" /> Nada Bahasa</Label>
                            <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="formal">Formal</SelectItem>
                                    <SelectItem value="casual">Santai</SelectItem>
                                    <SelectItem value="inspirational">Inspiratif</SelectItem>
                                    <SelectItem value="academic">Akademis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground"><Search className="w-4 h-4" /> Keywords SEO (Opsional)</Label>
                        <Input 
                            placeholder="pendidikan anak, parenting islami, digital..." 
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">Panjang Artikel</Label>
                        <Select value={length} onValueChange={(v: any) => setLength(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="short">Pendek (~500 kata)</SelectItem>
                                <SelectItem value="medium">Sedang (~1000 kata)</SelectItem>
                                <SelectItem value="long">Panjang (~1500+ kata)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button 
                    className="w-full h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 mt-auto min-h-[44px] rounded-[4px]" 
                    onClick={handleGenerate} 
                    disabled={loading}
                >
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sedang Menulis...</> : <><Wand2 className="w-5 h-5 mr-2" /> Generate Artikel</>}
                </Button>
            </CardContent>
        </Card>

        {/* Result Panel */}
        <Card className="lg:col-span-2 h-full flex flex-col bg-muted/20 border-dashed">
            <CardContent className="p-6 flex-1 flex flex-col h-full overflow-hidden">
                {result ? (
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Preview Hasil</h3>
                            <Button onClick={handleUseArticle} className="bg-green-600 hover:bg-green-700 text-white">
                                <Check className="w-4 h-4 mr-2" /> Gunakan Artikel Ini
                            </Button>
                        </div>
                        <div className="bg-background rounded-xl border shadow-sm p-6 overflow-hidden flex flex-col flex-1">
                            <Tabs defaultValue="preview" className="flex-1 flex flex-col h-full">
                                <TabsList className="mb-4 w-fit">
                                    <TabsTrigger value="preview">Preview Artikel</TabsTrigger>
                                    <TabsTrigger value="seo">SEO Meta Data</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="preview" className="flex-1 overflow-hidden data-[state=active]:flex flex-col mt-0">
                                    <div className="mb-4 border-b pb-4">
                                        <h1 className="text-2xl font-bold text-gray-900">{result.title}</h1>
                                    </div>
                                    <ScrollArea className="flex-1 pr-4 h-full">
                                        <div className="prose prose-blue max-w-none pb-10" dangerouslySetInnerHTML={{ __html: result.content }} />
                                    </ScrollArea>
                                </TabsContent>
                                
                                <TabsContent value="seo" className="space-y-4 mt-0">
                                    <div className="space-y-2">
                                        <Label>Meta Title</Label>
                                        <div className="p-3 bg-muted rounded-md text-sm">{result.metaTitle}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Meta Description</Label>
                                        <div className="p-3 bg-muted rounded-md text-sm">{result.metaDesc}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Keywords</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {result.keywords.split(',').map((k, i) => (
                                                <Badge key={i} variant="secondary">{k.trim()}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center opacity-60">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="w-12 h-12 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Siap Menulis?</h3>
                        <p className="max-w-md mx-auto">Masukkan topik artikel di panel kiri, atur target pembaca, dan biarkan AI membuat draft artikel blog yang lengkap untuk Anda.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
