import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
interface Step {
  label: string;
  shortLabel?: string;
}
interface StepperFormProps {
  steps: Step[];
  currentStep: number;
}
const StepperForm = ({ steps, currentStep }: StepperFormProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, i) => {
        const completed = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0',
                  completed && 'gradient-primary text-primary-foreground',
                  active && 'ring-2 ring-primary bg-primary/20 text-primary',
                  !completed && !active && 'bg-secondary text-muted-foreground'
                )}
              >
                {completed ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] md:text-xs font-medium text-center leading-tight max-w-[60px] md:max-w-none',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <span className="hidden md:inline">{step.label}</span>
                <span className="md:hidden">{step.shortLabel || step.label}</span>
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-2">
                <div className={cn(
                  'h-0.5 rounded-full transition-colors duration-300',
                  completed ? 'bg-primary' : 'bg-border'
                )} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default StepperForm;