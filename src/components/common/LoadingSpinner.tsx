import { Spinner } from '@/components/ui/States';

export function LoadingSpinner({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dimension = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size];
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Spinner className={dimension} />
    </div>
  );
}
