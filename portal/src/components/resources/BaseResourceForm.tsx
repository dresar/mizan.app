import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, Sparkles } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { LucideIcon } from 'lucide-react';
interface BaseResourceFormProps<T extends FieldValues> {
  resource: string;
  title: string;
  basePath: string;
  schema: z.ZodType<T>;
  defaultValues: DefaultValues<T>;
  children: (form: UseFormReturn<T>) => React.ReactNode;
  icon?: LucideIcon;
  apiEndpoint?: string;
}
export function BaseResourceForm<T extends FieldValues>({
  resource,
  title,
  basePath,
  schema,
  defaultValues,
  children,
  icon: Icon,
  apiEndpoint,
}: BaseResourceFormProps<T>) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const endpoint = apiEndpoint || `/admin/generic/${resource}`;
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { data: itemData, isLoading: isLoadingData } = useQuery<Record<string, unknown> | null>({
    queryKey: ['resource', resource, id],
    queryFn: async () => {
      if (!isEdit) return null;
      const response = await api.get(`${endpoint}/${id}`);
      return response.data?.data || response.data;
    },
    enabled: isEdit,
  });
  useEffect(() => {
    if (itemData) {
      const mappedData: Record<string, unknown> = {};
      Object.keys(itemData).forEach(key => {
        let value = itemData[key];
        if (value === null) {
          const lowerKey = key.toLowerCase();
          if (lowerKey.endsWith('id') || lowerKey === 'order') {
            value = undefined;
          } else if (lowerKey.startsWith('is') || lowerKey.startsWith('has')) {
            value = false;
          } else {
            value = '';
          }
        }
        
        mappedData[key] = value;

        if (key.includes('_')) {
          const camelKey = key.replace(/([-_][a-z])/gi, ($1) => {
            return $1.toUpperCase().replace('-', '').replace('_', '');
          });
          mappedData[camelKey] = value;
        }
      });
      form.reset(mappedData as any);
    }
  }, [itemData, form]);
  const mutation = useMutation({
    mutationFn: (values: T) => {
      const payload = { ...values };
      const mutablePayload = payload as Record<string, unknown>;
      
      // Convert empty strings to null so PostgreSQL nullable columns (dates/integers) don't crash on empty values
      Object.keys(mutablePayload).forEach(key => {
        if (mutablePayload[key] === '') {
          mutablePayload[key] = null;
        }
      });

      if (!mutablePayload.createdAt) {
          mutablePayload.createdAt = new Date().toISOString();
      }
      if (!mutablePayload.updatedAt) {
          mutablePayload.updatedAt = new Date().toISOString();
      }

      if (isEdit) {
        return api.put(`${endpoint}/${id}`, payload);
      }
      return api.post(endpoint, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', resource] });
      toast.success(isEdit ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan');
      navigate(basePath);
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string; details?: string } };
        message?: string;
      };
      // Clean up error message for display
      const message = err.response?.data?.message || 
                      err.response?.data?.details || 
                      err.message || 
                      'Terjadi kesalahan saat menyimpan data';
      
      // Avoid logging to console as requested
      // console.error(error);
      
      toast.error(message, {
        duration: 5000,
        description: err.response?.data?.details ? `Detail: ${err.response.data.details}` : undefined
      });
    },
  });
  const onInvalid = (errors: any) => {
    console.error('Form validation failed:', errors);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const errorList = errorKeys.map(key => {
        const fieldName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `${fieldName}: ${errors[key]?.message || 'Nilai tidak valid'}`;
      }).join(', ');
      toast.error(`Validasi gagal: ${errorList}`);
    }
  };

  const onSubmit = (values: T) => {
    mutation.mutate(values);
  };
  if (isEdit && isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`${isEdit ? 'Edit' : 'Tambah'} ${title}`}
        description={`Form ${isEdit ? 'perubahan' : 'pembuatan'} data ${title}`}
        icon={Icon}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                `/admin/ai-generator?type=blog&returnUrl=${encodeURIComponent(location.pathname)}&prompt=${encodeURIComponent(`Tulis konten untuk form ${title}`)}`
              )
            }
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Generator
          </Button>
          <Button variant="outline" onClick={() => navigate(basePath)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Informasi {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              {children(form)}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(basePath)}
                  disabled={mutation.isPending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
