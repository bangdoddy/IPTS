import { ReactNode } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';

interface ModuleLayoutProps {
  children: ReactNode;
  onBack: () => void;
}

export function ModuleLayout({ children, onBack }: ModuleLayoutProps) {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 font-bold"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}