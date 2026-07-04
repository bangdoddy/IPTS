import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Users, ClipboardCheck, TrendingUp, DollarSign, ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import logoImage from 'figma:asset/7872d5f0088fc9b5bcc819525afa0091bcc335c1.png';
import bgPattern from 'figma:asset/c09ecd52078ce41db4ca5fcecd12ca2ca759c76c.png';

interface GroupProjectSelectorProps {
  user: any;
  onSelectQCC: () => void;
  onSelectQCP: () => void;
  onSelectTEBP: () => void;
  onSelectCRP: () => void;
  onBack: () => void;
}

type QuestionStep = 'kpi' | 'qhse' | 'management' | 'rkt' | 'department' | 'show-projects';
type ProjectFilter = 'qcc' | 'qcp' | 'qcc-qcp' | 'tebp' | 'all';

export function GroupProjectSelector({ 
  user, 
  onSelectQCC, 
  onSelectQCP, 
  onSelectTEBP, 
  onSelectCRP,
  onBack 
}: GroupProjectSelectorProps) {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState<QuestionStep>('kpi');
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('all');
  const handleYesAnswer = (nextStep: QuestionStep, filter?: ProjectFilter) => {
    if (filter) {
      setProjectFilter(filter);
      setCurrentStep('show-projects');
    } else {
      setCurrentStep(nextStep);
    }
  };

  const handleNoAnswer = (nextStep: QuestionStep) => {
    setCurrentStep(nextStep);
  };

  const projectTypes = [
    {
      id: 'qcc',
      title: 'Quality Control Circle',
      description: 'Team-based quality improvement projects with collaborative approach (Min. 3 members)',
      icon: Users,
      gradient: 'linear-gradient(135deg, #ED8330 0%, #EE642E 100%)',
      bgColor: 'rgba(238, 100, 46, 0.1)',
      iconColor: '#EE642E',
      borderColor: '#EE642E',
      onClick: onSelectQCC
    },
    {
      id: 'qcp',
      title: 'Quality Control Project',
      description: 'Structured quality improvement initiatives with measurable outcomes (Min. 3 members)',
      icon: ClipboardCheck,
      gradient: 'linear-gradient(135deg, #5FCEA0 0%, #007B5F 100%)',
      bgColor: 'rgba(95, 206, 160, 0.1)',
      iconColor: '#007B5F',
      borderColor: '#5FCEA0',
      onClick: onSelectQCP
    },
    {
      id: 'tebp',
      title: 'The Executive Business Practices',
      description: 'Strategic business practice improvements requiring management approval and strategic documents',
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #001150 0%, #003080 100%)',
      bgColor: 'rgba(0, 17, 80, 0.1)',
      iconColor: '#001150',
      borderColor: '#001150',
      onClick: onSelectTEBP
    },
    {
      id: 'crp',
      title: 'Cost Reduction Project',
      description: 'Budget-focused initiatives with measurable cost savings and ROI calculations',
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #7FED84 0%, #5FCEA0 100%)',
      bgColor: 'rgba(127, 237, 132, 0.1)',
      iconColor: '#5FCEA0',
      borderColor: '#7FED84',
      onClick: onSelectCRP
    }
  ];

  const getFilteredProjects = () => {
    if (projectFilter === 'qcc') {
      return projectTypes.filter(p => p.id === 'qcc');
    } else if (projectFilter === 'qcp') {
      return projectTypes.filter(p => p.id === 'qcp');
    } else if (projectFilter === 'qcc-qcp') {
      return projectTypes.filter(p => p.id === 'qcc' || p.id === 'qcp');
    } else if (projectFilter === 'tebp') {
      return projectTypes.filter(p => p.id === 'tebp');
    }
    return projectTypes;
  };

  const getHeaderGradient = () => {
    if (projectFilter === 'qcc') {
      return 'linear-gradient(135deg, #ED8330 0%, #EE642E 100%)';
    } else if (projectFilter === 'qcp') {
      return 'linear-gradient(135deg, #5FCEA0 0%, #007B5F 100%)';
    } else if (projectFilter === 'tebp') {
      return 'linear-gradient(135deg, #001150 0%, #003080 100%)';
    }
    return 'linear-gradient(135deg, #EE642E 0%, #ED8330 100%)';
  };

  const questions = {
    kpi: {
      title: 'What is the theme raised from the non-achievement of KPIs?',
      onYes: () => handleYesAnswer('department'),
      onNo: () => handleNoAnswer('qhse'),
      showNoButton: true
    },
    qhse: {
      title: 'What is the theme raised from QHSE Issues?',
      onYes: () => handleYesAnswer('department'),
      onNo: () => handleNoAnswer('management'),
      showNoButton: true
    },
    management: {
      title: "What is theme raised from management request with saving cost Under USD 1 million?",
      onYes: () => handleYesAnswer('department'),
      onNo: () => handleNoAnswer('rkt'),
      showNoButton: true
    },
    rkt: {
      title: 'What is theme raised from management request with saving cost Over USD 1 million?',
      onYes: () => handleYesAnswer('show-projects', 'tebp'),
      onNo: () => handleYesAnswer('show-projects', 'all'),
      showNoButton: false
    },
    department: {
      title: 'Does the project team involve one department?',
      onYes: () => handleYesAnswer('show-projects', 'qcc'),
      onNo: () => handleYesAnswer('show-projects', 'qcp'),
      showNoButton: true
    }
  };

  // Render Yes/No Question
  const renderQuestion = (step: QuestionStep) => {
    const question = questions[step as keyof typeof questions];
    if (!question) return null;

    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 sm:p-6"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center -mb-4">
              <img src={logoImage} alt="Geo" className="h-60 w-auto" />
            </div>
            <h1 className="text-white text-lg sm:text-xl">Group Improvement Project - Answer the questions to find the right project type</h1>
          </div>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="group relative mb-4 sm:mb-6 px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center"
            style={{ 
              borderColor: 'white',
              backgroundColor: 'transparent'
            }}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
              style={{ backgroundColor: 'white' }}
            />
            <div className="relative z-10 flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2 text-white group-hover:text-black transition-colors duration-300" />
              <span className="text-sm text-white group-hover:text-black transition-colors duration-300">Back to Project Type</span>
            </div>
          </button>

          {/* Question Card */}
          <Card className="shadow-2xl overflow-hidden mb-6 bg-card">
            <div className="text-white p-4 sm:p-6 text-center" style={{ background: 'linear-gradient(135deg, #015952 0%, #006187 100%)' }}>
              <h2 className="text-white mb-2 text-base sm:text-lg">Let's identify your project theme</h2>
              <p className="text-white opacity-90 text-base sm:text-lg">Please answer the following question</p>
            </div>
            
            <CardContent className="p-6 sm:p-10">
              <div className="text-center mb-8">
                <h3 className="mb-6 text-lg sm:text-xl" style={{ color: theme === 'dark' ? '#7FED84' : '#015952' }}>
                  {question.title}
                </h3>
                
                <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${!question.showNoButton ? 'max-w-xs mx-auto' : ''}`}>
                  {/* Yes Button */}
                  <button
                    onClick={question.onYes}
                    className="group relative bg-card border-2 rounded-xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 w-full sm:w-48"
                    style={{ borderColor: '#5FCEA0' }}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                      style={{ backgroundColor: 'rgba(95, 206, 160, 0.1)' }}
                    />
                    
                    <div className="relative z-10">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: 'rgba(95, 206, 160, 0.2)' }}
                      >
                        <CheckCircle className="w-8 h-8" style={{ color: '#5FCEA0' }} />
                      </div>
                      
                      <h4 className="text-xl" style={{ color: '#5FCEA0' }}>Yes</h4>
                    </div>

                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl"
                      style={{ background: 'linear-gradient(90deg, #5FCEA0 0%, #007B5F 100%)' }}
                    />
                  </button>

                  {/* No Button - Only show if showNoButton is true */}
                  {question.showNoButton && (
                    <button
                      onClick={question.onNo}
                      className="group relative bg-card border-2 rounded-xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 w-full sm:w-48"
                      style={{ borderColor: '#EE642E' }}
                    >
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                        style={{ backgroundColor: 'rgba(238, 100, 46, 0.1)' }}
                      />
                      
                      <div className="relative z-10">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: 'rgba(238, 100, 46, 0.2)' }}
                        >
                          <XCircle className="w-8 h-8" style={{ color: '#EE642E' }} />
                      </div>
                      
                      <h4 className="text-xl" style={{ color: '#EE642E' }}>No</h4>
                    </div>

                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl"
                      style={{ background: 'linear-gradient(90deg, #EE642E 0%, #ED8330 100%)' }}
                    />
                  </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Answer honestly to get the most suitable project type recommendation
          </p>
        </div>
      </div>
    );
  };

  // Render Project Selection Cards
  const renderProjectSelection = () => {
    const filteredProjects = getFilteredProjects();

    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 sm:p-6"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center -mb-4">
              <img src={logoImage} alt="Geo" className="h-60 w-auto" />
            </div>
            <h1 className="text-white text-lg sm:text-xl">
              {projectFilter === 'qcc' 
                ? 'Based on your answers, Quality Control Circle is recommended for single department team'
                : projectFilter === 'qcp'
                ? 'Based on your answers, Quality Control Project is recommended for cross-department teams'
                : projectFilter === 'qcc-qcp' 
                ? 'Based on your answers, these project types are recommended for you'
                : projectFilter === 'tebp'
                ? 'Based on saving cost Over USD 1 million, this project type is recommended'
                : 'Select the type that best fits your team\'s initiative'}
            </h1>
          </div>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="group relative mb-4 sm:mb-6 px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center"
            style={{ 
              borderColor: 'white',
              backgroundColor: 'transparent'
            }}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
              style={{ backgroundColor: 'white' }}
            />
            <div className="relative z-10 flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2 text-white group-hover:text-black transition-colors duration-300" />
              <span className="text-sm text-white group-hover:text-black transition-colors duration-300">Back to Project Type</span>
            </div>
          </button>

          {/* Main Question Card */}
          <Card className="shadow-2xl overflow-hidden mb-6 bg-card">
            <div className="text-white p-4 sm:p-6 text-center" style={{ background: getHeaderGradient() }}>
              <h2 className="text-white mb-2 text-base sm:text-lg">
                {(projectFilter === 'tebp' || projectFilter === 'qcc' || projectFilter === 'qcp')
                  ? <span className="font-bold">Recommended Project Type</span>
                  : 'Which Group Improvement project will you initiate?'}
              </h2>
              <p className="text-white opacity-90 text-base sm:text-lg"><span className="font-bold">that aligns with your project goals</span></p>
            </div>
            
            <CardContent className="p-4 sm:p-8">
              <div className={`grid ${filteredProjects.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'sm:grid-cols-2'} gap-4 sm:gap-6`}>
                {filteredProjects.map((project) => {
                  const Icon = project.icon;
                  return (
                    <button
                      key={project.id}
                      onClick={project.onClick}
                      className="group relative bg-card border-2 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
                      style={{ borderColor: project.borderColor }}
                    >
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ backgroundColor: project.bgColor }}
                      />
                      
                      <div className="relative z-10">
                        <div 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: project.bgColor }}
                        >
                          <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: project.iconColor }} />
                        </div>
                        
                        <h3 className="mb-2 text-sm sm:text-base font-bold" style={{ color: project.borderColor }}>{project.title}</h3>
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed" style={{ color: project.borderColor }}>
                          {project.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold" style={{ color: project.borderColor }}>
                          <span>Start this project</span>
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>

                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                        style={{ background: project.gradient }}
                      />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            All group projects require collaboration and documentation
          </p>
        </div>
      </div>
    );
  };

  // Main render logic
  if (currentStep === 'show-projects') {
    return renderProjectSelection();
  } else {
    return renderQuestion(currentStep);
  }
}
