import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService, MediaFile } from '@/services/media-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Search, Filter, Copy, Trash2, Check, RefreshCw, Loader2, FileIcon, Image as ImageIcon, Film, FileText } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, subDays, startOfDay } from 'date-fns';

interface MediaLibraryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (files: MediaFile[]) => void;
    mode?: 'manage' | 'select';
    multiSelect?: boolean;
}

export function MediaLibraryModal({ open, onOpenChange, onSelect, mode = 'manage', multiSelect = false }: MediaLibraryModalProps) {
    const [search, setSearch] = useState('');
    const [type, setType] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
    const queryClient = useQueryClient();

    // Calculate date range based on filter
    const dateRange = React.useMemo(() => {
        const now = new Date();
        if (dateFilter === 'today') {
            return { startDate: startOfDay(now).toISOString() };
        } else if (dateFilter === 'week') {
            return { startDate: subDays(now, 7).toISOString() };
        } else if (dateFilter === 'month') {
            return { startDate: subDays(now, 30).toISOString() };
        }
        return {};
    }, [dateFilter]);

    const { data, isLoading, isRefetching } = useQuery({
        queryKey: ['media-files', page, search, type, dateRange],
        queryFn: () => mediaService.getFiles({
            page,
            limit: 24,
            search,
            type: type === 'all' ? undefined : type,
            ...dateRange
        }),
        placeholderData: (previousData) => previousData,
    });

    const deleteMutation = useMutation({
        mutationFn: mediaService.deleteFile,
        onSuccess: () => {
            toast.success('File deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['media-files'] });
            setSelectedFiles([]);
        },
        onError: () => {
            toast.error('Failed to delete file');
        }
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: number[]) => mediaService.bulkDeleteFiles(ids),
        onSuccess: () => {
            toast.success('Files deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['media-files'] });
            setSelectedFiles([]);
        },
        onError: () => {
            toast.error('Failed to delete files');
        }
    });

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    const handleSelectFile = (file: MediaFile) => {
        if (mode === 'manage' || multiSelect) {
            setSelectedFiles(prev => {
                const exists = prev.find(f => f.id === file.id);
                if (exists) return prev.filter(f => f.id !== file.id);
                return [...prev, file];
            });
        } else {
            onSelect?.([file]);
            onOpenChange(false);
        }
    };

    const handleConfirmSelection = () => {
        onSelect?.(selectedFiles);
        onOpenChange(false);
    };

    const handleDeleteSelected = () => {
        if (confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) {
            const ids = selectedFiles.map(f => f.id);
            bulkDeleteMutation.mutate(ids);
        }
    };

    const isSelected = (fileId: number) => selectedFiles.some(f => f.id === fileId);

    const getMimeType = (file: MediaFile & { mimetype?: string }) => file.mimeType ?? file.mimetype ?? '';

    const getFileIcon = (mimeType: string) => {
        if (!mimeType) return <FileIcon className="h-8 w-8 text-gray-500" />;
        if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
        if (mimeType.startsWith('video/')) return <Film className="h-8 w-8 text-red-500" />;
        if (mimeType.includes('pdf')) return <FileText className="h-8 w-8 text-orange-500" />;
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-screen-xl w-full h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Media Library</DialogTitle>
                        <div className="flex items-center gap-2">
                            {mode === 'select' && multiSelect && selectedFiles.length > 0 && (
                                <Button onClick={handleConfirmSelection} size="sm">
                                    Use Selected ({selectedFiles.length})
                                </Button>
                            )}
                            {mode === 'manage' && selectedFiles.length > 0 && (
                                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                                    Delete ({selectedFiles.length})
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="p-4 border-b bg-muted/30 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search files..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-full max-w-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-[130px] h-9">
                                <SelectValue placeholder="File Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="image">Images</SelectItem>
                                <SelectItem value="video">Videos</SelectItem>
                                <SelectItem value="document">Documents</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-[130px] h-9">
                                <SelectValue placeholder="Date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => queryClient.invalidateQueries({ queryKey: ['media-files'] })}>
                            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {(data?.data ?? []).filter((file): file is MediaFile => file != null && file.id != null).map((file: MediaFile & { mimetype?: string }) => (
                                    <div 
                                        key={file.id} 
                                        className={`group relative border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all ${isSelected(file.id) ? 'ring-2 ring-primary border-primary' : ''}`}
                                        onClick={() => handleSelectFile(file)}
                                    >
                                        <div className="aspect-square bg-muted flex items-center justify-center relative">
                                            {getMimeType(file).startsWith('image/') ? (
                                                <img 
                                                    src={file.thumbnailUrl || file.url} 
                                                    alt={file.originalName ?? ''} 
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                getFileIcon(getMimeType(file))
                                            )}
                                            
                                            {/* Overlay for actions */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button 
                                                    variant="secondary" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-full" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyLink(file.url);
                                                    }}
                                                    title="Copy CDN Link"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                
                                                {mode === 'manage' && (
                                                    <Button 
                                                        variant="destructive" 
                                                        size="icon" 
                                                        className="h-8 w-8 rounded-full"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Delete this file?')) deleteMutation.mutate(file.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Selection Checkbox */}
                                            {(mode === 'select' || mode === 'manage' || isSelected(file.id)) && (
                                                <div className={`absolute top-2 left-2 transition-opacity ${mode === 'manage' && !isSelected(file.id) ? 'opacity-0 group-hover:opacity-100' : ''}`}>
                                                    <Checkbox 
                                                        checked={isSelected(file.id)}
                                                        onCheckedChange={() => handleSelectFile(file)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-2 text-xs">
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="font-medium truncate flex-1" title={file.originalName}>{file.originalName}</p>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyLink(file.url);
                                                    }}
                                                    title="Copy Link"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground mt-1 items-center">
                                                <span>{formatBytes(file.size)}</span>
                                                <div className="flex items-center gap-1">
                                                    {file.version > 1 && (
                                                        <span className="px-1 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-medium">
                                                            v{file.version}
                                                        </span>
                                                    )}
                                                    {file.status === 'replaced' && (
                                                        <span className="px-1 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-medium">
                                                            Replaced
                                                        </span>
                                                    )}
                                                    <span>{format(new Date(file.createdAt), 'dd/MM/yy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {data?.data?.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No media files found</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {data?.meta && data.meta.totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8 mb-4">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center px-4 text-sm text-muted-foreground">
                                        Page {page} of {data.meta.totalPages}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={page === data.meta.totalPages}
                                        onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
