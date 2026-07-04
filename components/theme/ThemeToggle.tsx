import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg"
      style={{
        background: theme === 'light' 
          ? 'linear-gradient(135deg, #006187 0%, #007B5F 100%)'
          : 'linear-gradient(135deg, #015952 0%, #EE642E 100%)',
      }}
      aria-label="Toggle theme"
    >
      <div className="relative w-12 h-6 rounded-full bg-white bg-opacity-30">
        <div 
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300"
          style={{
            transform: theme === 'dark' ? 'translateX(26px)' : 'translateX(2px)'
          }}
        />
      </div>
      {theme === 'light' ? (
        <Sun className="w-4 h-4 text-white" />
      ) : (
        <Moon className="w-4 h-4 text-white" />
      )}
    </button>
  );
}
