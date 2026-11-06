import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '@/services/media-service';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

const settingsSchema = z.object({
    maxFileSize: z.coerce.number().min(1024 * 1024, "Min 1MB").max(50 * 1024 * 1024, "Max 50MB"),
    allowedFormats: z.string().min(1, "Required"),
    compressionQuality: z.coerce.number().min(10).max(100),
    enableWebPConversion: z.boolean(),
    defaultStorageProvider: z.enum(['cloudinary', 'imagekit']),
});

export default function MediaSettingsPage() {
    const queryClient = useQueryClient();
    
    const { data: settings, isLoading } = useQuery({
        queryKey: ['media-settings'],
        queryFn: mediaService.getSettings
    });

    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            maxFileSize: 5242880,
            allowedFormats: 'jpg,jpeg,png,webp,pdf',
            compressionQuality: 80,
            enableWebPConversion: true,
            defaultStorageProvider: 'cloudinary'
        }
    });

    useEffect(() => {
        if (settings) {
            form.reset({
                maxFileSize: settings.maxFileSize,
                allowedFormats: settings.allowedFormats,
                compressionQuality: settings.compressionQuality,
                enableWebPConversion: settings.enableWebPConversion,
                defaultStorageProvider: settings.defaultStorageProvider as 'cloudinary' | 'imagekit'
            });
        }
    }, [settings, form]);

    const mutation = useMutation({
        mutationFn: mediaService.updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media-settings'] });
            toast.success("Settings updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update settings");
            console.error(error);
        }
    });

    function onSubmit(values: z.infer<typeof settingsSchema>) {
        mutation.mutate(values);
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Media Settings</h1>
                    <p className="text-muted-foreground">Configure global media management settings</p>
                </div>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Configuration</CardTitle>
                            <CardDescription>File limits and restrictions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="maxFileSize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max File Size (bytes)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Current: {(field.value / 1024 / 1024).toFixed(2)} MB
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="allowedFormats"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Allowed Formats</FormLabel>
                                        <FormControl>
                                            <Input placeholder="jpg,jpeg,png,webp" {...field} />
                                        </FormControl>
                                        <FormDescription>Comma separated list of extensions</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Optimization & Storage</CardTitle>
                            <CardDescription>Compression and provider settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="compressionQuality"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Compression Quality (1-100)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormDescription>Higher means better quality but larger size</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="enableWebPConversion"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Auto Convert to WebP</FormLabel>
                                            <FormDescription>
                                                Automatically convert uploaded images to WebP format for better performance
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="defaultStorageProvider"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Storage Provider</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a provider" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="cloudinary">Cloudinary</SelectItem>
                                                <SelectItem value="imagekit">ImageKit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            New uploads will use this provider by default unless specified otherwise
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
