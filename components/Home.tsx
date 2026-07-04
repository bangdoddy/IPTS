{/* Sample 3-level menu: Main Menu with 2 Submenus */ }
<div className="group relative">
  <button
    onClick={() => setShowSampleMenu(!showSampleMenu)}
    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors w-full justify-between"
    type="button"
  >
    <span className="flex items-center gap-3">
      <BarChart3 className="w-5 h-5" />
      <span>Sample Menu</span>
    </span>
    <svg className={`w-4 h-4 transition-transform ${showSampleMenu ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
  </button>
  {showSampleMenu && (
    <div className="ml-6 mt-1 flex flex-col gap-1">
      {/* Submenu 1 */}
      <button
        onClick={() => onNavigate('sample-submenu-1')}
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg w-full text-sm"
      >
        Submenu 1
      </button>
      {/* Submenu 2 */}
      <button
        onClick={() => onNavigate('sample-submenu-2')}
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg w-full text-sm"
      >
        Submenu 2
      </button>
    </div>
  )}
</div>
// State for sample menu
const [showSampleMenu, setShowSampleMenu] = useState(false);
import { Home as HomeIcon, Lightbulb, Calendar, BarChart3, Users, TrendingUp, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface HomeProps {
  user: any;
  onSelectModule: (module: string) => void;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const modules = [
  {
    id: 'ss',
    title: 'Suggestion',
    subtitle: 'System',
    fullTitle: 'Suggestion System',
    description: 'Perbaikan yang dilaksanakan secara perorangan dengan waktu yang singkat',
    icon: Lightbulb,
    iconBg: 'bg-gradient-to-br from-[#EE642E] to-[#ED8330]',
    iconColor: '#EE642E',
    bgColor: 'rgba(238, 100, 46, 0.1)',
  },
  {
    id: 'qcc',
    title: 'Quality Control',
    subtitle: 'Circle',
    fullTitle: 'Quality Control Circle',
    description: 'Perbaikan secara kelompok dengan melibatkan satu department',
    icon: Users,
    iconBg: 'bg-gradient-to-br from-[#006187] to-[#007B5F]',
    iconColor: '#006187',
    bgColor: 'rgba(0, 97, 135, 0.1)',
  },
  {
    id: 'tebp',
    title: 'The Executive',
    subtitle: 'Business Practices',
    fullTitle: 'The Executive Business Practices',
    description: 'Peningkatan praktik bisnis strategis yang memerlukan persetujuan manajemen',
    icon: TrendingUp,
    iconBg: 'bg-gradient-to-br from-[#EAB308] to-[#FCD34D]',
    iconColor: '#EAB308',
    bgColor: 'rgba(234, 179, 8, 0.1)',
  },
  {
    id: 'crp',
    title: 'Cost Reduction',
    subtitle: 'Project',
    fullTitle: 'Cost Reduction Project',
    description: 'Inisiatif fokus anggaran dengan penghematan biaya yang terukur',
    icon: DollarSign,
    iconBg: 'bg-gradient-to-br from-[#5FCEA0] to-[#7FED84]',
    iconColor: '#5FCEA0',
    bgColor: 'rgba(95, 206, 160, 0.1)',
  },
];

export function Home({ user, onSelectModule, onNavigate, onLogout }: HomeProps) {
  const [selectedHomeModule, setSelectedHomeModule] = useState<string | null>(null);

  const handleModuleClick = (moduleId: string) => {
    onSelectModule(moduleId);
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedHomeModule(selectedHomeModule === moduleId ? null : moduleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#015952] via-[#006187] to-[#007B5F] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-[230px] bg-gradient-to-b from-[#EE642E] via-[#ED8330] to-[#EE642E] shadow-2xl flex-shrink-0">
          <nav className="flex flex-col gap-2 p-4 pt-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 px-4 py-3 text-white bg-white/20 rounded-lg transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button
              onClick={() => onNavigate('questionnaire')}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Lightbulb className="w-5 h-5" />
              <span>Create Idea or Project</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onNavigate('historical')}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Historical Projects</span>
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span>Calendar Event</span>
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-auto md:h-[100px] flex items-center justify-end px-4 md:px-8 py-4 gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#015952]">{user?.name?.[0] || 'U'}</span>
              </div>
              <span className="text-white text-sm md:text-base">{user?.name || 'User'}</span>
            </div>
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-[#EE642E] to-[#ED8330] text-white px-4 md:px-6 py-2 rounded-lg hover:shadow-lg transition-shadow text-sm md:text-base"
            >
              Logout
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 px-6 md:px-12 pb-8 flex items-center">
            <div className="w-full max-w-5xl">
              {/* Logo and tagline section */}
              <div className="mb-12">
                <h1 className="text-white mb-3 text-3xl md:text-4xl" style={{
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2'
                }}>
                  InovaSIS
                </h1>
                <p className="text-white/80 max-w-2xl text-xs md:text-sm leading-relaxed mb-10">
                  InovaSIS adalah program kegiatan perbaikan yang dilaksanakan di seluruh area PT Saptaindra Sejati, dimulai dari perbaikan yang dilakukan secara perorangan ataupun per kelompok
                </p>
              </div>

              {/* Module buttons - Circular horizontal layout */}
              <div className="space-y-6">
                {/* Circular buttons */}
                <div className="flex flex-wrap justify-start gap-6 md:gap-10">
                  {modules.map((module) => {
                    const Icon = module.icon;
                    const isSelected = selectedHomeModule === module.id;
                    return (
                      <button
                        key={module.id}
                        onClick={() => handleModuleToggle(module.id)}
                        className="flex flex-col items-center group"
                      >
                        <div
                          className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all mb-3 ${isSelected ? 'ring-4 ring-white/30 scale-105' : 'group-hover:scale-105'
                            }`}
                          style={{
                            backgroundColor: module.iconColor,
                          }}
                        >
                          <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div className="text-center max-w-[100px]">
                          <p className="text-white text-xs md:text-sm leading-tight">
                            {module.title}
                          </p>
                          <p className="text-white text-xs md:text-sm leading-tight">
                            {module.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Detail card - shown when module is selected */}
                {selectedHomeModule && (
                  <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {modules
                      .filter((m) => m.id === selectedHomeModule)
                      .map((module) => {
                        const Icon = module.icon;
                        return (
                          <div
                            key={module.id}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 transition-all"
                            style={{
                              borderColor: module.iconColor,
                            }}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: module.bgColor,
                                }}
                              >
                                <Icon className="w-6 h-6" style={{ color: module.iconColor }} />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white text-lg mb-2">{module.fullTitle}</h3>
                                <p className="text-white/80 text-sm leading-relaxed mb-4">
                                  {module.description}
                                </p>
                                <button
                                  onClick={() => handleModuleClick(module.id)}
                                  className="px-6 py-2 rounded-lg text-white transition-all hover:shadow-lg"
                                  style={{
                                    backgroundColor: module.iconColor,
                                  }}
                                >
                                  Start Project
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}