
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '@/services/media-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

export default function MediaAddAccountPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    
    const [accountForm, setAccountForm] = useState({
        provider: 'imagekit',
        name: '',
        email: '',
        apiKey: '',
        apiSecret: '',
        imagekitId: '',
        cloudName: '',
        urlEndpoint: '',
        quotaLimit: 1000000000
    });

    useEffect(() => {
        const providerParam = searchParams.get('provider');
        if (providerParam && (providerParam === 'cloudinary' || providerParam === 'imagekit')) {
            setAccountForm(prev => ({ ...prev, provider: providerParam }));
        }
    }, [searchParams]);

    const createAccountMutation = useMutation({
        mutationFn: (data: any) => mediaService.createAccount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media-accounts'] });
            toast.success("Account added successfully");
            navigate('/admin/media');
        },
        onError: (error) => {
            toast.error("Failed to add account: " + (error as Error).message);
        }
    });

    const handleCreateAccount = () => {
        const payload: any = {
            provider: accountForm.provider,
            name: accountForm.name,
            email: accountForm.email || 'noreply@example.com',
            apiKey: accountForm.apiKey,
            apiSecret: accountForm.apiSecret,
            quotaLimit: Number(accountForm.quotaLimit) || 0,
            isActive: true,
            isPrimary: false,
        };
        if (accountForm.provider === 'imagekit') {
            payload.urlEndpoint = accountForm.urlEndpoint || accountForm.cloudName;
        } else if (accountForm.provider === 'cloudinary') {
            payload.cloudName = accountForm.cloudName;
        }
        createAccountMutation.mutate(payload);
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/media')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add Storage Account</h1>
                    <p className="text-muted-foreground">Add a new storage provider account (ImageKit or Cloudinary).</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>
                        Enter the credentials provided by your storage provider.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="acc-provider">Provider</Label>
                        <Select 
                            value={accountForm.provider} 
                            onValueChange={(val) => setAccountForm({...accountForm, provider: val})}
                        >
                            <SelectTrigger id="acc-provider">
                                <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="imagekit">ImageKit</SelectItem>
                                <SelectItem value="cloudinary">Cloudinary</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="acc-name">Account Name (Label)</Label>
                        <Input 
                            id="acc-name" 
                            placeholder="e.g. My ImageKit Main"
                            value={accountForm.name}
                            onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="acc-email">Email (opsional)</Label>
                        <Input 
                            id="acc-email" 
                            type="email"
                            placeholder="email akun (opsional)"
                            value={accountForm.email}
                            onChange={(e) => setAccountForm({...accountForm, email: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="acc-key">
                            {accountForm.provider === 'imagekit' ? 'Public Key' : 'API Key'}
                        </Label>
                        <Input 
                            id="acc-key" 
                            type="password"
                            value={accountForm.apiKey}
                            onChange={(e) => setAccountForm({...accountForm, apiKey: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="acc-secret">
                            {accountForm.provider === 'imagekit' ? 'Private Key' : 'API Secret'}
                        </Label>
                        <Input 
                            id="acc-secret" 
                            type="password"
                            value={accountForm.apiSecret}
                            onChange={(e) => setAccountForm({...accountForm, apiSecret: e.target.value})}
                        />
                    </div>
                    {accountForm.provider === 'imagekit' ? (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="acc-ikid">ImageKit ID</Label>
                                <Input 
                                    id="acc-ikid" 
                                    placeholder="contoh: 5alv3xogw"
                                    value={accountForm.imagekitId}
                                    onChange={(e) => {
                                        const id = e.target.value.trim();
                                        const prev = accountForm.imagekitId;
                                        const prevUrl = accountForm.urlEndpoint?.trim() || '';
                                        const prevPattern = prev ? new RegExp(`^https://ik\\.imagekit\\.io/${prev}/?$`) : null;
                                        let nextUrl = prevUrl;
                                        if (!prevUrl || (prevPattern && prevPattern.test(prevUrl))) {
                                            nextUrl = id ? `https://ik.imagekit.io/${id}` : '';
                                        }
                                        setAccountForm({...accountForm, imagekitId: id, urlEndpoint: nextUrl});
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">ImageKit ID berbeda dengan Label. Ini bagian unik dari URL endpoint.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="acc-endpoint">URL Endpoint</Label>
                                <Input 
                                    id="acc-endpoint" 
                                    placeholder="https://ik.imagekit.io/your_id"
                                    value={accountForm.urlEndpoint}
                                    onChange={(e) => setAccountForm({...accountForm, urlEndpoint: e.target.value})}
                                />
                                <p className="text-xs text-muted-foreground">Biasanya: https://ik.imagekit.io/[ImageKit ID]</p>
                            </div>
                        </>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor="acc-cloud">Cloud Name</Label>
                            <Input 
                                id="acc-cloud" 
                                placeholder="your_cloud_name"
                                value={accountForm.cloudName}
                                onChange={(e) => setAccountForm({...accountForm, cloudName: e.target.value})}
                            />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="acc-quota">Quota Limit (Bytes)</Label>
                        <Input 
                            id="acc-quota" 
                            type="number"
                            value={accountForm.quotaLimit}
                            onChange={(e) => setAccountForm({...accountForm, quotaLimit: Number(e.target.value)})}
                        />
                        <p className="text-xs text-muted-foreground">Default: 1GB (1000000000)</p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => navigate('/admin/media')}>Cancel</Button>
                    <Button onClick={handleCreateAccount} disabled={createAccountMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {createAccountMutation.isPending ? "Adding..." : "Save Account"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
