import { ArrowLeft } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
  onBack: () => void;
}

export function Placeholder({ title, description, onBack }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#015952] via-[#006187] to-[#007B5F] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="relative z-10 p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-white text-5xl mb-4">{title}</h1>
          <p className="text-white/80 text-xl">{description}</p>
        </div>
      </div>
    </div>
  );
}
