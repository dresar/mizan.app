import { useState, useEffect } from 'react';
import { format, parse, isValid, subYears } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

interface DatePickerInputProps {
  label?: string;
  value?: string;
  onChange: (date: string) => void;
  error?: string;
  className?: string;
}

export const DatePickerInput = ({ label, value, onChange, error, className }: DatePickerInputProps) => {
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (isValid(d)) {
        setDate(d);
        setInputValue(format(d, "dd/MM/yyyy"));
      }
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Auto-add slashes
    if (val.length === 2 && inputValue.length === 1) val += '/';
    if (val.length === 5 && inputValue.length === 4) val += '/';
    
    setInputValue(val);
    
    if (val.length === 10) {
        const parsed = parse(val, "dd/MM/yyyy", new Date());
        if (isValid(parsed) && parsed > new Date(1900, 0, 1) && parsed <= new Date()) {
            setDate(parsed);
            onChange(format(parsed, "yyyy-MM-dd"));
        }
    }
  };

  const inputClass = "w-full px-4 py-2.5 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className={className || "space-y-1.5"}>
      {label && <label className="text-sm font-medium block">{label}</label>}
      <div className="relative">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <div className="relative">
                <input 
                    className={`${inputClass} ${error ? 'border-destructive ring-destructive/20' : ''} pr-10`}
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                    onClick={() => !isOpen && setIsOpen(true)}
                />
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:bg-transparent"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
            </div>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    defaultMonth={date || subYears(new Date(), 12)}
                    onSelect={(d) => {
                        if (d) {
                            setDate(d);
                            setInputValue(format(d, "dd/MM/yyyy"));
                            onChange(format(d, "yyyy-MM-dd"));
                            setIsOpen(false);
                        }
                    }}
                    disabled={(date) => date > new Date() || date < new Date(1900, 0, 1)}
                    initialFocus
                    locale={id}
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    classNames={{
                        caption_label: "hidden",
                    }}
                />
            </PopoverContent>
        </Popover>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};
