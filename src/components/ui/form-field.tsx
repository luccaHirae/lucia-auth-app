import { forwardRef, ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, children, className, id }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <Label htmlFor={id}>{label}</Label>
        {children}
        {error && <p className='text-sm text-shadow-rose-600'>{error}</p>}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { FormField };
