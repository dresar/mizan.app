import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader, RichTextEditor } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FileEdit, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DualImageInput } from '@/components/forms/DualImageInput';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';

const COLLAB_NONE_VALUE = '__none__'; // Radix Select forbids value=""
const CATEGORY_NONE_VALUE = '__none__';
const VOLUME_NONE_VALUE = '__none__';

const articleSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  content: z.string().min(50, 'Konten minimal 50 karakter'),
  excerpt: z.string().optional(),
  type: z.enum(['article', 'journal']),
  category_id: z.string().optional(),
  featured_image: z.string().optional(),
  pdf_file: z.string().optional(),
  volume_id: z.string().optional(),
  collaboration_id: z.string().optional(),
  keywords: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

export default function AuthorArticleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') === 'journal' ? 'journal' : 'article';
  const defaultCollaborationId = searchParams.get('collaborationId') || COLLAB_NONE_VALUE;
  const isEdit = !!id;
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      type: defaultType,
      category_id: CATEGORY_NONE_VALUE,
      featured_image: '',
      pdf_file: '',
      volume_id: VOLUME_NONE_VALUE,
      keywords: '',
      metaTitle: '',
      metaDescription: '',
      collaboration_id: defaultCollaborationId || COLLAB_NONE_VALUE,
    },
  });

  const typeForCategories = form.watch('type') ?? defaultType;
  const { data: categoriesRaw } = useQuery({
    queryKey: ['publication-categories', typeForCategories],
    queryFn: async () => {
      const res = await api.get(`/publication/categories?type=${typeForCategories}`);
      const raw = res?.data?.data ?? res?.data ?? [];
      return Array.isArray(raw) ? raw : [];
    },
  });
  const categoriesAll = Array.isArray(categoriesRaw) ? categoriesRaw : [];

  const { data: volumesRaw } = useQuery({
    queryKey: ['publication-volumes'],
    queryFn: async () => {
      const res = await api.get('/publication/volumes');
      const raw = res?.data?.data ?? res?.data ?? [];
      return Array.isArray(raw) ? raw : [];
    },
  });
  const volumes = Array.isArray(volumesRaw) ? volumesRaw : [];

  const { data: collaborationsData } = useQuery({
    queryKey: ['author-collaborations'],
    queryFn: async () => {
      const res = await api.get('/publication/author/collaborations');
      const data = res?.data?.data ?? res?.data;
      return Array.isArray(data) ? data : [];
    },
    retry: 1,
  });
  const collaborations = Array.isArray(collaborationsData) ? collaborationsData : [];

  const { data: article, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => (await api.get(`/publication/author/articles/${id}`)).data.data,
    enabled: isEdit,
  });
  const { data: collaborationDetail } = useQuery({
    queryKey: ['collab-detail', article?.collaborationId],
    queryFn: async () => (await api.get(`/publication/author/collaborations/${article?.collaborationId}`)).data.data,
    enabled: !!article?.collaborationId && isEdit,
  });
  const canEdit = !isEdit || !article?.collaborationId || collaborationDetail?.myRole !== 'viewer';

  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        type: article.type,
        category_id: article.categoryId ? String(article.categoryId) : CATEGORY_NONE_VALUE,
        featured_image: article.featuredImage || '',
        pdf_file: article.pdfFile || '',
        volume_id: article.volumeId ? String(article.volumeId) : VOLUME_NONE_VALUE,
        collaboration_id: article.collaborationId ? String(article.collaborationId) : COLLAB_NONE_VALUE,
        keywords: article.keywords || '',
        metaTitle: article.metaTitle || '',
        metaDescription: article.metaDescription || '',
      });
    }
  }, [article, form]);

  const mutation = useMutation({
    mutationFn: async (values: ArticleFormValues) => {
      const payload = {
        ...values,
        categoryId: values.category_id && values.category_id !== CATEGORY_NONE_VALUE ? Number(values.category_id) : undefined,
        volumeId: values.volume_id && values.volume_id !== VOLUME_NONE_VALUE ? Number(values.volume_id) : undefined,
        collaborationId: values.collaboration_id && values.collaboration_id !== COLLAB_NONE_VALUE ? Number(values.collaboration_id) : undefined,
        featuredImage: values.featured_image,
        pdfFile: values.pdf_file,
      };
      
      if (isEdit) {
        return api.put(`/publication/author/articles/${id}`, payload);
      }
      return api.post('/publication/author/articles', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-articles'] });
      queryClient.invalidateQueries({ queryKey: ['author-journals'] });
      toast.success(isEdit ? 'Artikel diperbarui' : 'Artikel berhasil dibuat');
      navigate('/author/articles');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Gagal menyimpan artikel');
    }
  });

  const onSubmit = (values: ArticleFormValues) => {
    mutation.mutate(values);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url;
    } catch (e) {
      toast.error('Gagal upload file');
      throw e;
    }
  };

  if (isEdit && isLoadingArticle) {
    return <div className="p-8 text-center">Memuat...</div>;
  }

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <PageHeader
        title={isEdit ? "Edit Tulisan" : "Tulis Artikel Baru"}
        description="Buat karya tulis ilmiah atau artikel populer"
        icon={FileEdit}
      >
        <Button variant="outline" onClick={() => navigate('/author/articles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </PageHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Konten Utama</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Judul</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Judul tulisan..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="excerpt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{form.watch('type') === 'journal' ? 'Abstrak Jurnal' : 'Ringkasan (Excerpt)'}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={form.watch('type') === 'journal' ? 'Tulis abstrak jurnal...' : 'Ringkasan singkat...'} rows={3} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{form.watch('type') === 'journal' ? 'Konten Jurnal / Pendahuluan s/d Penutup' : 'Konten Lengkap'}</FormLabel>
                                    <FormControl>
                                        <RichTextEditor 
                                            value={field.value} 
                                            onChange={(v) => field.onChange(v)}
                                            placeholder="Tulis konten lengkap di sini..."
                                            disabled={!canEdit}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                             <FormField
                                control={form.control}
                                name="keywords"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Keywords / Kata Kunci</FormLabel>
                                        <FormControl>
                                            <Input placeholder="pendidikan, pesantren, kurikulum..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="metaTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SEO Meta Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Judul untuk Google..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="metaDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SEO Meta Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Deskripsi untuk penelusuran Google..." rows={2} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengaturan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipe Tulisan</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih tipe" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="article">Artikel Populer</SelectItem>
                                            <SelectItem value="journal">Jurnal Ilmiah</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => {
                              const currentType = form.watch('type');
                              const categoryList = categoriesAll.filter((c: any) => !currentType || c.type === currentType);
                              return (
                                <FormItem>
                                    <FormLabel>Kategori</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || CATEGORY_NONE_VALUE}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={CATEGORY_NONE_VALUE}>Tanpa kategori</SelectItem>
                                            {categoryList.filter((cat: any) => cat.id != null && String(cat.id) !== '').map((cat: any) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                              );
                            }}
                        />

                        {form.watch('type') === 'journal' && (
                            <FormField
                                control={form.control}
                                name="volume_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Volume Jurnal</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || VOLUME_NONE_VALUE}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih volume" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={VOLUME_NONE_VALUE}>Tanpa volume / Pilih nanti</SelectItem>
                                                {volumes.filter((vol: { id?: number }) => vol.id != null && String(vol.id) !== '').map((vol: { id: number; name?: string; year?: number }) => (
                                                    <SelectItem key={vol.id} value={String(vol.id)}>{vol.name ?? `Volume ${vol.id}`} {vol.year != null ? `(${vol.year})` : ''}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Volume = edisi terbitan jurnal (mis. Vol 1 No 1, 2024). Dikelola admin di Pengaturan → Volume Jurnal.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="collaboration_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proyek Kolaborasi (Opsional)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || COLLAB_NONE_VALUE}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih proyek kolaborasi" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={COLLAB_NONE_VALUE}>Tidak Ada</SelectItem>
                                            {collaborations.map((collab: { id: number; title?: string }) => (
                                                <SelectItem key={collab.id} value={String(collab.id)}>{collab.title ?? `Proyek #${collab.id}`}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Proyek kolaborasi hanya menampilkan proyek yang Anda buat atau yang Anda diundang. Buat dari menu Kolaborasi jika belum ada.</p>
                                    <FormMessage />
                                    {field.value && field.value !== COLLAB_NONE_VALUE && (
                                      <CollaborationInviteForm collaborationId={Number(field.value)} />
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="featured_image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gambar Unggulan</FormLabel>
                                    <FormControl>
                                        <DualImageInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="URL Gambar"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch('type') === 'journal' && (
                            <FormField
                                control={form.control}
                                name="pdf_file"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>File PDF Jurnal</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <Input 
                                                    value={field.value} 
                                                    onChange={field.onChange} 
                                                    placeholder="URL PDF..." 
                                                    readOnly
                                                />
                                                <div className="relative">
                                                    <Button type="button" variant="outline" size="icon">
                                                        <FileEdit className="h-4 w-4" />
                                                    </Button>
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const url = await handleFileUpload(file);
                                                                field.onChange(url);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <Button type="submit" disabled={mutation.isPending} className="w-full">
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            {isEdit ? 'Simpan Perubahan' : 'Kirim Artikel'}
                        </Button>
                    </CardContent>
                </Card>
                {id && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Diskusi Kolaborator</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CommentsSection articleId={Number(id)} />
                    </CardContent>
                  </Card>
                )}
            </div>
        </form>
      </Form>
    </div>
  );
}

function CollaborationInviteForm({ collaborationId }: { collaborationId: number }) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: number; username: string; firstName: string; lastName: string; email?: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; username: string; firstName: string; lastName: string } | null>(null);
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviteSending, setInviteSending] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(async (q: string) => {
    if (q.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await api.get('/publication/author/users/search', { params: { q } });
      const list = res?.data?.data ?? res?.data ?? [];
      setSearchResults(Array.isArray(list) ? list.filter((u: any) => u.id !== currentUser?.id) : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQ.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => fetchUsers(searchQ.trim()), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQ, fetchUsers]);

  const handleInvite = async () => {
    if (!selectedUser) return;
    setInviteSending(true);
    try {
      await api.post(`/publication/author/collaborations/${collaborationId}/invites`, {
        userId: selectedUser.id,
        role: inviteRole,
      });
      toast.success('Undangan dikirim');
      setSelectedUser(null);
      setSearchQ('');
      setSearchResults([]);
      queryClient.invalidateQueries({ queryKey: ['collaborations'] });
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal mengirim undangan');
    } finally {
      setInviteSending(false);
    }
  };

  return (
    <div className="mt-3 space-y-2 rounded-lg border p-3 bg-muted/30">
      <FormLabel>Undang Kolaborator</FormLabel>
      <p className="text-xs text-muted-foreground">Ketik @ atau minimal 3 huruf untuk mencari user terdaftar, pilih lalu tentukan peran.</p>
      <div className="relative">
        <Input
          placeholder="Ketik @ atau 3+ huruf untuk cari user..."
          value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName} (@${selectedUser.username})` : searchQ}
          onChange={(e) => !selectedUser && setSearchQ(e.target.value)}
          onFocus={() => selectedUser && setSelectedUser(null)}
          className="pr-20"
        />
        {searchQ.length >= 3 && !selectedUser && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-auto rounded-md border bg-popover shadow-md">
            {searchLoading ? (
              <div className="p-3 text-sm text-muted-foreground">Mencari...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">Tidak ada user ditemukan</div>
            ) : (
              searchResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    setSelectedUser({ id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName });
                    setSearchQ('');
                    setSearchResults([]);
                  }}
                >
                  <span className="font-medium">{u.firstName} {u.lastName}</span>
                  <span className="text-muted-foreground">@{u.username}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {selectedUser && (
        <div className="flex flex-wrap items-center gap-2">
          <Select value={inviteRole} onValueChange={(v: 'editor' | 'viewer') => setInviteRole(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" size="sm" onClick={handleInvite} disabled={inviteSending}>
            {inviteSending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Undang
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Batal</Button>
        </div>
      )}
    </div>
  );
}

function CommentsSection({ articleId }: { articleId: number }) {
  const { data: comments, refetch } = useQuery({
    queryKey: ['article-discussions', articleId],
    queryFn: async () => (await api.get(`/publication/author/articles/${articleId}/discussions`)).data.data,
  });
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const submit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      await api.post(`/publication/author/articles/${articleId}/discussions`, { content });
      setContent('');
      await refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal mengirim komentar');
    } finally {
      setPosting(false);
    }
  };
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Textarea rows={3} placeholder="Tulis komentar..." value={content} onChange={(e) => setContent(e.target.value)} />
        <Button type="button" onClick={submit} disabled={posting}>
          <MessageSquare className="mr-2 h-4 w-4" /> Kirim Komentar
        </Button>
      </div>
      <div className="space-y-2 max-h-64 overflow-auto">
        {comments?.map((c: any) => (
          <div key={c.id} className="rounded-md border p-2">
            <div className="text-sm font-medium">{c.user?.username}</div>
            <div className="text-sm">{c.content}</div>
            <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {!comments?.length && <div className="text-sm text-muted-foreground">Belum ada komentar</div>}
      </div>
    </div>
  );
}
