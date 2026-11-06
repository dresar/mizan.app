import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
interface SantriSelectProps {
  value?: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
  status?: string;
}

export function SantriSelect({ value, onSelect, disabled, status }: SantriSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['santri-select', search, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '20');
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      const res = await api.get(`/admin/santri?${params.toString()}`);
      return res.data;
    },
    staleTime: 60000,
  });
  const santriList = data?.data || [];
  const { data: selectedSantri } = useQuery({
    queryKey: ['santri-detail', value],
    queryFn: async () => {
      if (!value) return null;
      const res = await api.get(`/admin/santri/${value}`);
      return res.data;
    },
    enabled: !!value && !santriList.find((s: any) => s.id === value),
  });
  const displayValue = value
    ? (santriList.find((s: any) => s.id === value)?.namaLengkap || selectedSantri?.namaLengkap || 'Pilih Santri...')
    : 'Pilih Santri...';
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}> 
          {}
          <CommandInput 
            placeholder="Cari nama santri..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
                {isLoading ? 'Memuat...' : 'Tidak ditemukan.'}
            </CommandEmpty>
            <CommandGroup>
              {santriList.map((santri: any) => (
                <CommandItem
                  key={santri.id}
                  value={String(santri.id)}
                  onSelect={() => {
                    onSelect(santri.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === santri.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {santri.namaLengkap} ({santri.nisn})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}