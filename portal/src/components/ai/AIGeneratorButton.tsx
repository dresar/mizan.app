import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { AIGeneratorModal } from './AIGeneratorModal';
import { AIGenerateType } from '@/services/ai-service';

interface AIGeneratorButtonProps {
  onInsert: (content: string) => void;
  type?: AIGenerateType;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AIGeneratorButton({ 
  onInsert, 
  type = 'blog', 
  label = 'Generate with AI', 
  variant = 'outline',
  size = 'sm',
  className
}: AIGeneratorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className} 
        onClick={() => setIsOpen(true)}
        type="button" // Prevent form submission
      >
        <Wand2 className="w-4 h-4 mr-2" />
        {label}
      </Button>

      <AIGeneratorModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onInsert={onInsert}
        defaultType={type}
      />
    </>
  );
}
