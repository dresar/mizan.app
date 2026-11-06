import { api } from '@/lib/api';

export interface MediaFile {
    id: number;
    fileId: string;
    url: string;
    thumbnailUrl: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    category: string;
    folder: string;
    tags?: string[];
    createdAt: string;
    status: 'active' | 'replaced' | 'deleted';
    version: number;
}

export interface MediaAccount {
    id: number;
    provider: string;
    name: string; // Added name
    email?: string;
    quotaLimit: number;
    quotaUsed: number;
    isActive: boolean;
    isPrimary: boolean;
    order: number; // Added order
}

export interface MediaSettings {
    id: number;
    maxFileSize: number;
    allowedFormats: string;
    compressionQuality: number;
    enableWebPConversion: boolean;
    defaultStorageProvider: string;
    updatedAt: string;
}

export const mediaService = {
    getSettings: async () => {
        const response = await api.get('/media/settings');
        return response.data;
    },

    updateSettings: async (data: Partial<MediaSettings>) => {
        const response = await api.put('/media/settings', data);
        return response.data;
    },

    uploadFile: async (file: File, options?: { category?: string; folder?: string; tags?: string; provider?: string; replacementForId?: number }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (options?.category) formData.append('category', options.category);
        if (options?.folder) formData.append('folder', options.folder);
        if (options?.tags) formData.append('tags', options.tags);
        if (options?.provider) formData.append('provider', options.provider);
        if (options?.replacementForId) formData.append('replacementForId', String(options.replacementForId));

        const response = await api.post('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getFiles: async (params?: { 
        page?: number; 
        limit?: number; 
        category?: string; 
        folder?: string; 
        search?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: string;
    }) => {
        const response = await api.get('/media/files', { params });
        return response.data;
    },

    deleteFile: async (id: number) => {
        const response = await api.delete(`/media/files/${id}`);
        return response.data;
    },

    bulkDeleteFiles: async (ids: number[]) => {
        const response = await api.post('/media/files/bulk-delete', { ids });
        return response.data;
    },

    getAccounts: async (params?: { provider?: string; isActive?: boolean }) => {
        const response = await api.get('/media/accounts', { params });
        return response.data;
    },

    createAccount: async (data: any) => {
        const response = await api.post('/media/accounts', data);
        return response.data;
    },

    updateAccount: async (id: number, data: Partial<MediaAccount> & { apiKey?: string; apiSecret?: string; cloudName?: string; urlEndpoint?: string }) => {
        const response = await api.put(`/media/accounts/${id}`, data);
        return response.data;
    },
    
    deleteAccount: async (id: number, force = false) => {
        const response = await api.delete(`/media/accounts/${id}?force=${force}`);
        return response.data;
    },

    restoreAccount: async (id: number) => {
        const response = await api.post(`/media/accounts/${id}/restore`);
        return response.data;
    },

    reorderAccounts: async (orders: { id: number, order: number }[]) => {
        const response = await api.post('/media/accounts/reorder', orders);
        return response.data;
    },

    syncAccount: async (id: number) => {
        const response = await api.post(`/media/accounts/${id}/sync`);
        return response.data;
    },

    importAccountsFromFile: async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        const response = await api.post('/media/accounts/import', form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    importAccountsFromPath: async (path: string) => {
        const response = await api.post('/media/accounts/import', { path });
        return response.data;
    }
};
