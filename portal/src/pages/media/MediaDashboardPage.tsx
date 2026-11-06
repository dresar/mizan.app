import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService, MediaFile, MediaAccount } from '@/services/media-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Upload, Plus, Trash2, Search, FileIcon, Image as ImageIcon, Film, FileText, GripVertical, AlertTriangle, RefreshCw, Cloud, MoreHorizontal, Undo2, Edit, CheckSquare, X, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { compressAndConvertToWebP } from '@/lib/image-utils';

// --- Sortable Item Component ---
function SortableAccountItem({ account, onDelete, onRestore, formatBytes, onSync, isSyncing, onEdit }: { account: MediaAccount, onDelete: (id: number, force?: boolean) => void, onRestore: (id: number) => void, formatBytes: (b: number) => string, onSync: (id: number) => void, isSyncing: boolean, onEdit: (account: MediaAccount) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: account.id, disabled: !account.isActive && !account.provider /* prevent drag if needed, but lets allow reordering even if inactive */ });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: account.isActive ? 1 : 0.6
    };

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [confirmType, setConfirmType] = React.useState<'deactivate'|'restore'|'forceDelete'|null>(null);

    const openConfirm = (type: 'deactivate'|'restore'|'forceDelete') => {
        setConfirmType(type);
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        if (!confirmType) return;
        if (confirmType === 'deactivate') {
            onDelete(account.id, false);
        } else if (confirmType === 'restore') {
            onRestore(account.id);
        } else if (confirmType === 'forceDelete') {
            onDelete(account.id, true);
        }
        setConfirmOpen(false);
        setConfirmType(null);
    };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center gap-4 p-4 bg-card rounded-lg border mb-2 shadow-sm ${!account.isActive ? 'bg-muted/50 border-dashed' : ''}`}>
            <div {...attributes} {...listeners} className="cursor-grab hover:text-primary">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{account.name}</h3>
                    {account.provider === 'imagekit' ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">ImageKit</Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">Cloudinary</Badge>
                    )}
                    {account.isPrimary && <Badge>Primary</Badge>}
                    {!account.isActive && <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Inactive / Trash</Badge>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                    {account.email || 'System Account'} • {formatBytes(account.quotaUsed)} used of {formatBytes(account.quotaLimit)}
                </div>
                <div className="mt-2 w-full max-w-md">
                     <Progress value={(account.quotaUsed / account.quotaLimit) * 100} className="h-2" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(account)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSync(account.id)} disabled={isSyncing}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                            Sync Usage
                        </DropdownMenuItem>
                        {account.isActive ? (
                            <DropdownMenuItem onClick={() => openConfirm('deactivate')}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Nonaktifkan (Pindah ke Trash)
                            </DropdownMenuItem>
                        ) : (
                            <>
                                <DropdownMenuItem onClick={() => openConfirm('restore')}>
                                    <Undo2 className="h-4 w-4 mr-2" />
                                    Pulihkan
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => openConfirm('forceDelete')}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus Permanen
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {confirmType === 'deactivate' && 'Nonaktifkan Akun?'}
                                {confirmType === 'restore' && 'Pulihkan Akun?'}
                                {confirmType === 'forceDelete' && 'Hapus Permanen Akun?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {confirmType === 'deactivate' && 'Akun akan dipindahkan ke Trash. Anda dapat memulihkannya nanti.'}
                                {confirmType === 'restore' && 'Akun akan diaktifkan kembali.'}
                                {confirmType === 'forceDelete' && 'Tindakan ini akan menghapus akun beserta semua file terkait. TIDAK DAPAT DIBATALKAN.'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirm}>
                                Konfirmasi
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

export default function MediaDashboardPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('files');
    const queryClient = useQueryClient();

    // --- Files State ---
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('all');
    const [page, setPage] = useState(1);
    
    // --- Upload State ---
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadCategory, setUploadCategory] = useState('general');
    const [uploadProvider, setUploadProvider] = useState<string>('auto'); 
    const [isUploading, setIsUploading] = useState(false);

    // --- Accounts State ---
    const [accounts, setAccounts] = useState<MediaAccount[]>([]);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importPath, setImportPath] = useState('c:\\Users\\eka\\Music\\new_pondok\\storage_accounts_backup_2026-02-17.json');
    const [editingAccount, setEditingAccount] = useState<MediaAccount | null>(null);

    // --- View/Modal State ---
    const [viewFile, setViewFile] = useState<MediaFile | null>(null);
    const [replacementFileId, setReplacementFileId] = useState<number | null>(null);

    const updateAccountMutation = useMutation({
        mutationFn: (data: { id: number, updates: any }) => mediaService.updateAccount(data.id, data.updates),
        onSuccess: () => {
            toast.success('Akun berhasil diperbarui');
            queryClient.invalidateQueries({ queryKey: ['mediaAccounts'] });
            setEditingAccount(null);
        },
        onError: (error) => {
            toast.error(`Gagal memperbarui akun: ${(error as any).response?.data?.error || (error as Error).message}`);
        }
    });
    
    // --- Selection State ---
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

    // Derived state for split columns
    const cloudinaryAccounts = useMemo(() => accounts.filter(a => a.provider === 'cloudinary'), [accounts]);
    const imagekitAccounts = useMemo(() => accounts.filter(a => a.provider === 'imagekit'), [accounts]);

    // --- DnD Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Queries ---
    const { data: filesData, isLoading: isFilesLoading } = useQuery({
        queryKey: ['media-files', page, category, search],
        queryFn: () => mediaService.getFiles({ 
            page, 
            limit: 20, 
            category: category === 'all' ? undefined : category,
            search: search || undefined
        }),
    });

    const { data: accountsData, isLoading: isAccountsLoading } = useQuery({
        queryKey: ['media-accounts'],
        queryFn: () => mediaService.getAccounts(),
    });

    const { data: settings } = useQuery({
        queryKey: ['media-settings'],
        queryFn: mediaService.getSettings
    });

    // Sync accounts state with query data
    useEffect(() => {
        if (accountsData) {
            setAccounts(accountsData);
        }
    }, [accountsData]);

    // --- Mutations ---
    const [syncingId, setSyncingId] = useState<number | null>(null);

    const syncAccountMutation = useMutation({
        mutationFn: async (id: number) => {
            setSyncingId(id);
            try {
                return await mediaService.syncAccount(id);
            } finally {
                setSyncingId(null);
            }
        },
        onSuccess: (data) => {
            if (data?.formatted) {
                toast.success(`Usage synced: ${data.formatted.usage} / ${data.formatted.limit}`);
            } else {
                toast.success("Usage synced");
            }
            queryClient.invalidateQueries({ queryKey: ['media-accounts'] });
        },
        onError: () => {
            toast.error("Failed to sync usage");
        }
    });

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!uploadFile) throw new Error("No file selected");
            
            let fileToUpload = uploadFile;

            // Client-side WebP Conversion
            if (settings?.enableWebPConversion && fileToUpload.type.startsWith('image/')) {
                 try {
                    fileToUpload = await compressAndConvertToWebP(
                        fileToUpload, 
                        (settings.compressionQuality || 80) / 100
                    );
                    console.log(`Converted to WebP: ${uploadFile.size} -> ${fileToUpload.size} bytes`);
                 } catch (e) {
                     console.error("WebP conversion failed, uploading original", e);
                 }
            }

            return mediaService.uploadFile(fileToUpload, { 
                category: uploadCategory,
                provider: uploadProvider === 'auto' ? undefined : uploadProvider,
                replacementForId: replacementFileId ?? undefined
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media-files'] });
            queryClient.invalidateQueries({ queryKey: ['media-accounts'] }); // Quota updates
            setIsUploadOpen(false);
            setUploadFile(null);
            setUploadProvider('auto');
            setReplacementFileId(null);
            toast.success(replacementFileId ? "File replaced successfully" : "File uploaded successfully");
        },
        onError: (error) => {
            const err: any = error;
            const detail = err?.response?.data?.error || err?.message || 'Unknown error';
            toast.error("Upload gagal: " + detail);
        }
    });

    const restoreAccountMutation = useMutation({
        mutationFn: async (id: number) => {
            return mediaService.restoreAccount(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media-accounts'] });
            toast.success("Akun dipulihkan");
        },
        onError: () => {
            toast.error("Gagal memulihkan akun");
        }
    });

    const importFromFileMutation = useMutation({
        mutationFn: async (file: File) => {
            return mediaService.importAccountsFromFile(file);
        },
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ['media-accounts'] });
            toast.success(`Import selesai: ${res?.inserted ?? 0} ditambah, ${res?.updated ?? 0} diperbarui, ${res?.skipped ?? 0} dilewati`);
            setIsImportOpen(false);
            setImportFile(null);
        },
        onError: (e: any) => {
            toast.error("Import gagal: " + e.message);
        }
    });

    const importFromPathMutation = useMutation({
        mutationFn: async (path: string) => {
            return mediaService.importAccountsFromPath(path);
        },
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ['media-accounts'] });
            toast.success(`Import selesai: ${res?.inserted ?? 0} ditambah, ${res?.updated ?? 0} diperbarui, ${res?.skipped ?? 0} dilewati`);
            setIsImportOpen(false);
        },
        onError: (e: any) => {
            toast.error("Import gagal: " + e.message);
        }
    });

    const deleteAccountMutation = useMutation({
        mutationFn: async ({ id, force }: { id: number, force: boolean }) => {
            return mediaService.deleteAccount(id, force);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media-accounts'] });
            toast.success("Account deleted successfully");
        },
        onError: (error: any) => {
            // Check if error message contains "force delete" suggestion
            if (error.message.includes("force delete")) {
                toast.error(
                    <div className="flex flex-col gap-2">
                        <span>{error.message}</span>
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => {
                                toast.dismiss();
                            }}
                        >
                            Use Force Delete (Wipes Files)
                        </Button>
                    </div>
                );
            } else {
                toast.error("Delete failed: " + error.message);
            }
        }
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: number[]) => {
            return mediaService.bulkDeleteFiles(ids);
        },
        onSuccess: (data) => {
             toast.success(`Deleted ${data.success} files, ${data.failed} failed`);
             queryClient.invalidateQueries({ queryKey: ['media-files'] });
             queryClient.invalidateQueries({ queryKey: ['media-accounts'] });
             setSelectedFiles([]);
        },
        onError: () => {
             toast.error("Bulk delete failed");
        }
    });

    const toggleSelection = (id: number) => {
        setSelectedFiles(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) {
            bulkDeleteMutation.mutate(selectedFiles);
        }
    };

    const reorderMutation = useMutation({
        mutationFn: async (newOrder: MediaAccount[]) => {
            const orders = newOrder.map((acc, index) => ({ id: acc.id, order: index }));
            return mediaService.reorderAccounts(orders);
        },
        onSuccess: () => {
            // Silent success or small toast
            // toast.success("Order saved");
            queryClient.invalidateQueries({ queryKey: ['media-accounts'] });
        },
        onError: () => {
            toast.error("Failed to save order");
        }
    });

    const handleUpload = async () => {
        if (!uploadFile) return;
        setIsUploading(true);
        try {
            await uploadMutation.mutateAsync();
        } finally {
            setIsUploading(false);
        }
    };

    const handleCloudinaryDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = cloudinaryAccounts.findIndex((item) => item.id === active.id);
            const newIndex = cloudinaryAccounts.findIndex((item) => item.id === over?.id);
            const newCloudinaryOrder = arrayMove(cloudinaryAccounts, oldIndex, newIndex);
            
            // Construct new global order: Cloudinary first, then ImageKit
            const newGlobalOrder = [...newCloudinaryOrder, ...imagekitAccounts];
            setAccounts(newGlobalOrder);
            reorderMutation.mutate(newGlobalOrder);
        }
    };

    const handleImageKitDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = imagekitAccounts.findIndex((item) => item.id === active.id);
            const newIndex = imagekitAccounts.findIndex((item) => item.id === over?.id);
            const newImageKitOrder = arrayMove(imagekitAccounts, oldIndex, newIndex);
            
            // Construct new global order: Cloudinary first, then ImageKit
            const newGlobalOrder = [...cloudinaryAccounts, ...newImageKitOrder];
            setAccounts(newGlobalOrder);
            reorderMutation.mutate(newGlobalOrder);
        }
    };

    const handleDeactivate = async (id: number) => {
        try {
            await deleteAccountMutation.mutateAsync({ id, force: false });
        } catch (e) {
            // handled by mutation error
        }
    };

    const handleForceDelete = async (id: number) => {
        try {
            await deleteAccountMutation.mutateAsync({ id, force: true });
        } catch (e) {
            // handled by mutation error
        }
    };

    const handleRestore = async (id: number) => {
        try {
            await restoreAccountMutation.mutateAsync(id);
        } catch (e) {
            // handled by mutation error
        }
    };

    // --- Render Helpers ---
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Media Management</h1>
                    <p className="text-muted-foreground">Manage your images, videos, and documents across multiple providers.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button><Upload className="mr-2 h-4 w-4" /> Upload Media</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{replacementFileId ? 'Replace Media' : 'Upload Media'}</DialogTitle>
                                <DialogDescription>
                                    {replacementFileId ? 'Select a file to replace the existing one. The old file will be archived.' : 'Select a file to upload. It will be automatically optimized and stored in the best available account.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="file">File</Label>
                                    <Input 
                                        id="file" 
                                        type="file" 
                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={uploadCategory} onValueChange={setUploadCategory}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="profile">Profile</SelectItem>
                                            <SelectItem value="blog">Blog</SelectItem>
                                            <SelectItem value="gallery">Gallery</SelectItem>
                                            <SelectItem value="document">Document</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="provider">Provider (Optional)</Label>
                                    <Select value={uploadProvider} onValueChange={setUploadProvider}>
                                        <SelectTrigger id="provider">
                                            <SelectValue placeholder="Auto (Best Available)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">Auto (Best Available)</SelectItem>
                                            <SelectItem value="cloudinary">Cloudinary</SelectItem>
                                            <SelectItem value="imagekit">ImageKit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpload} disabled={isUploading || !uploadFile}>
                                    {isUploading ? "Uploading..." : "Upload"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="files" className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4" /> Media Files
                    </TabsTrigger>
                    <TabsTrigger value="accounts" className="flex items-center gap-2">
                        <Cloud className="h-4 w-4" /> Storage Accounts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="files" className="space-y-4">
                    {selectedFiles.length > 0 && (
                        <div className="bg-primary/10 p-2 rounded-lg flex items-center justify-between border border-primary/20">
                            <span className="text-sm font-medium ml-2">{selectedFiles.length} files selected</span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])}>Cancel</Button>
                                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search files..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="profile">Profile</SelectItem>
                                <SelectItem value="blog">Blog</SelectItem>
                                <SelectItem value="gallery">Gallery</SelectItem>
                                <SelectItem value="document">Document</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isFilesLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[1,2,3,4,5].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                            {filesData?.data?.map((file: MediaFile) => (
                                <Card key={file.id} className={`overflow-hidden group relative transition-all ${selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''}`}>
                                    <div className={`absolute top-2 left-2 z-10 ${selectedFiles.includes(file.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                        <Checkbox 
                                            checked={selectedFiles.includes(file.id)}
                                            onCheckedChange={() => toggleSelection(file.id)}
                                            className="bg-white/80 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-sm"
                                        />
                                    </div>
                                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white text-gray-700">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setViewFile(file)}>
                                                    <ImageIcon className="mr-2 h-4 w-4" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toggleSelection(file.id)}>
                                                    <CheckSquare className="mr-2 h-4 w-4" /> Select
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {
                                                    setReplacementFileId(file.id);
                                                    setIsUploadOpen(true);
                                                }}>
                                                    <RefreshCcw className="mr-2 h-4 w-4" /> Replace
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                                                    if(confirm('Are you sure you want to delete this file? This will remove it from storage provider as well.')) {
                                                        bulkDeleteMutation.mutate([file.id]);
                                                    }
                                                }}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="aspect-square relative bg-muted flex items-center justify-center cursor-pointer" onClick={() => setViewFile(file)}>
                                        {file.mimeType?.startsWith('image/') || file.originalName?.match(/\.(jpg|jpeg|png|gif|webp|svg|heic)$/i) || file.url?.match(/\.(jpg|jpeg|png|gif|webp|svg|heic)$/i) ? (
                                            <img 
                                                src={file.thumbnailUrl || file.url} 
                                                alt={file.originalName} 
                                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <FileIcon className="h-12 w-12 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="font-medium truncate text-sm" title={file.originalName}>{file.originalName}</p>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>{formatBytes(file.size)}</span>
                                            <span className="capitalize">{file.category}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {filesData?.data?.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No files found. Upload some media to get started.
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <Dialog open={!!viewFile} onOpenChange={(open) => !open && setViewFile(null)}>
                    <DialogContent className="max-w-screen-lg w-full p-0 overflow-hidden bg-black/90 border-none shadow-2xl flex justify-center items-center h-[90vh]">
                        {viewFile && (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {viewFile.mimeType?.startsWith('image/') || viewFile.originalName?.match(/\.(jpg|jpeg|png|gif|webp|svg|heic)$/i) || viewFile.url?.match(/\.(jpg|jpeg|png|gif|webp|svg|heic)$/i) ? (
                                    <img 
                                        src={viewFile.url} 
                                        alt={viewFile.originalName} 
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <div className="text-white text-center p-8">
                                        <FileIcon className="h-24 w-24 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-xl font-medium">{viewFile.originalName}</h3>
                                        <p className="text-white/60 mt-2">{formatBytes(viewFile.size)} • {viewFile.mimeType}</p>
                                        <Button variant="secondary" className="mt-6" asChild>
                                            <a href={viewFile.url} target="_blank" rel="noreferrer">Download File</a>
                                        </Button>
                                    </div>
                                )}
                                <Button 
                                    className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 text-white border-none"
                                    size="icon"
                                    onClick={() => setViewFile(null)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <TabsContent value="accounts" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="bg-muted/30 p-4 rounded-lg border border-dashed mb-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-sm">Smart Failover & Priority</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Cloudinary sebagai default. Drag & drop dalam setiap list untuk mengubah prioritas.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                                Import JSON Akun
                            </Button>
                        </div>
                    </div>

                    <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import Akun dari JSON</DialogTitle>
                                <DialogDescription>
                                    Pilih file JSON atau gunakan path backup default.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="import-file">File JSON</Label>
                                    <Input id="import-file" type="file" accept=".json,application/json" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                                    <div className="flex gap-2">
                                        <Button size="sm" disabled={!importFile || importFromFileMutation.isPending} onClick={() => importFile && importFromFileMutation.mutate(importFile)}>Import dari File</Button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="import-path">Path Backup (Server)</Label>
                                    <Input id="import-path" value={importPath} onChange={(e) => setImportPath(e.target.value)} />
                                    <div>
                                        <Button size="sm" variant="secondary" disabled={!importPath || importFromPathMutation.isPending} onClick={() => importFromPathMutation.mutate(importPath)}>
                                            Import dari Path
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsImportOpen(false)}>Tutup</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <div className="bg-muted/30 p-4 rounded-lg border border-dashed mb-4">
                        {/* Left Column: Cloudinary */}
                        <div className="space-y-4">
                             <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg border border-orange-100">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-orange-700">
                                    <Cloud className="h-5 w-5" />
                                    Cloudinary
                                </h3>
                                <Badge className="bg-orange-500 hover:bg-orange-600">Default Primary</Badge>
                             </div>
                             
                             <DndContext 
                                id="dnd-cloudinary"
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleCloudinaryDragEnd}
                             >
                                 <SortableContext 
                                    items={cloudinaryAccounts.map(a => a.id)}
                                    strategy={verticalListSortingStrategy}
                                 >
                                     <div className="space-y-2 min-h-[100px]">
                                        {cloudinaryAccounts.map((account) => (
                                            <SortableAccountItem 
                                                key={account.id} 
                                                account={account} 
                                                onDelete={(id, force) => force ? handleForceDelete(id) : handleDeactivate(id)}
                                                onRestore={handleRestore}
                                                formatBytes={formatBytes}
                                                onSync={(id) => syncAccountMutation.mutate(id)}
                                                isSyncing={syncingId === account.id}
                                                onEdit={(account) => setEditingAccount(account)}
                                            />
                                        ))}
                                        {cloudinaryAccounts.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                                No Cloudinary accounts
                                            </div>
                                        )}
                                     </div>
                                 </SortableContext>
                             </DndContext>
                
                             <Button 
                                variant="outline" 
                                className="w-full border-dashed border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                onClick={() => navigate('/admin/media/add-account?provider=cloudinary')}
                             >
                                <Plus className="mr-2 h-4 w-4" /> Add Cloudinary Account
                             </Button>
                        </div>
                
                        {/* Right Column: ImageKit */}
                        <div className="space-y-4">
                             <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                                    <ImageIcon className="h-5 w-5" />
                                    ImageKit
                                </h3>
                                <Badge variant="secondary" className="bg-blue-200 text-blue-800">Secondary</Badge>
                             </div>
                
                             <DndContext 
                                id="dnd-imagekit"
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleImageKitDragEnd}
                             >
                                 <SortableContext 
                                    items={imagekitAccounts.map(a => a.id)}
                                    strategy={verticalListSortingStrategy}
                                 >
                                     <div className="space-y-2 min-h-[100px]">
                                        {imagekitAccounts.map((account) => (
                                            <SortableAccountItem 
                                                key={account.id} 
                                                account={account} 
                                                onDelete={(id, force) => force ? handleForceDelete(id) : handleDeactivate(id)}
                                                onRestore={handleRestore}
                                                formatBytes={formatBytes}
                                                onSync={(id) => syncAccountMutation.mutate(id)}
                                                isSyncing={syncingId === account.id}
                                                onEdit={(account) => setEditingAccount(account)}
                                            />
                                        ))}
                                        {imagekitAccounts.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                                No ImageKit accounts
                                            </div>
                                        )}
                                     </div>
                                 </SortableContext>
                             </DndContext>
                
                             <Button 
                                variant="outline" 
                                className="w-full border-dashed border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => navigate('/admin/media/add-account?provider=imagekit')}
                             >
                                <Plus className="mr-2 h-4 w-4" /> Add ImageKit Account
                             </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Edit Account Dialog */}
            <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Akun {editingAccount?.provider}</DialogTitle>
                        <DialogDescription>
                            Perbarui kredensial akun media Anda.
                        </DialogDescription>
                    </DialogHeader>
                    {editingAccount && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nama Akun</Label>
                                <Input 
                                    id="edit-name" 
                                    value={editingAccount.name}
                                    onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
                                />
                            </div>
                            {editingAccount.provider === 'cloudinary' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-cloud-name">Cloud Name</Label>
                                    <Input 
                                        id="edit-cloud-name" 
                                        value={(editingAccount as any).cloudName || ''}
                                        onChange={(e) => setEditingAccount({...editingAccount, cloudName: e.target.value} as any)}
                                    />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="edit-api-key">API Key (Public)</Label>
                                <Input 
                                    id="edit-api-key" 
                                    value={(editingAccount as any).apiKey || ''}
                                    onChange={(e) => setEditingAccount({...editingAccount, apiKey: e.target.value} as any)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-api-secret">API Secret (Private)</Label>
                                <Input 
                                    id="edit-api-secret" 
                                    placeholder="••••••••"
                                    value={(editingAccount as any).apiSecret || ''}
                                    onChange={(e) => setEditingAccount({...editingAccount, apiSecret: e.target.value} as any)}
                                />
                                <p className="text-xs text-muted-foreground">Wajib diisi agar akun dapat aktif.</p>
                            </div>
                            {editingAccount.provider === 'imagekit' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-url-endpoint">URL Endpoint</Label>
                                    <Input 
                                        id="edit-url-endpoint" 
                                        value={(editingAccount as any).urlEndpoint || ''}
                                        onChange={(e) => setEditingAccount({...editingAccount, urlEndpoint: e.target.value} as any)}
                                    />
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-active"
                                    checked={editingAccount.isActive}
                                    onCheckedChange={(checked) => setEditingAccount({...editingAccount, isActive: checked})}
                                />
                                <Label htmlFor="edit-active">Aktif</Label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingAccount(null)}>Batal</Button>
                        <Button 
                            onClick={() => {
                                if (editingAccount) {
                                    // Basic validation
                                    if (!editingAccount.name) {
                                        toast.error("Nama akun tidak boleh kosong");
                                        return;
                                    }
                                    const apiKey = (editingAccount as any).apiKey;
                                    const apiSecret = (editingAccount as any).apiSecret;
                                    const isActive = editingAccount.isActive;

                                    if (isActive && (!apiKey || !apiSecret)) {
                                        toast.error("API Key dan API Secret wajib diisi untuk mengaktifkan akun");
                                        return;
                                    }

                                    updateAccountMutation.mutate({
                                        id: editingAccount.id,
                                        updates: {
                                            name: editingAccount.name,
                                            apiKey: apiKey,
                                            apiSecret: apiSecret,
                                            cloudName: (editingAccount as any).cloudName,
                                            urlEndpoint: (editingAccount as any).urlEndpoint,
                                            isActive: isActive
                                        }
                                    });
                                }
                            }}
                            disabled={updateAccountMutation.isPending}
                        >
                            {updateAccountMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
