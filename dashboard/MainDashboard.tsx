import image_171c976b4ce8798473da0411fc2fa84e7a342985 from 'figma:asset/171c976b4ce8798473da0411fc2fa84e7a342985.png';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Progress } from '../ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Lightbulb, 
  Users, 
  ClipboardCheck, 
  TrendingUp, 
  DollarSign, 
  LogOut,
  User,
  Eye,
  Clock,
  FileText,
  CheckCircle,
  Calendar,
  FileDown,
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useTheme } from '../theme/ThemeProvider';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, LabelList } from 'recharts';
import logoImage from 'figma:asset/1caea5a577f038f56938d89ff983ec6dd326fd52.png';
import bgPattern from 'figma:asset/c09ecd52078ce41db4ca5fcecd12ca2ca759c76c.png';

interface MainDashboardProps {
  user: any;
  projects: any[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onUpdateProject: (project: any) => void;
  onBackToProjectType?: () => void;
}

export function MainDashboard({ user, projects, onNavigate, onLogout, onUpdateProject, onBackToProjectType }: MainDashboardProps) {
  const { theme } = useTheme();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [pdfProject, setPdfProject] = useState<any>(null);
  
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-300' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-300' },
      'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      completed: { label: 'Completed', className: 'bg-purple-100 text-purple-800 border-purple-300' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      SS: 'Suggestion System',
      QCC: 'Quality Control Circle',
      QCP: 'Quality Control Project',
      TEBP: 'Executive Business Practices',
      CRP: 'Cost Reduction Project'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      SS: { bg: 'rgba(0, 97, 135, 0.15)', text: '#006187' },
      QCC: { bg: 'rgba(238, 100, 46, 0.15)', text: '#EE642E' },
      QCP: { bg: 'rgba(95, 206, 160, 0.15)', text: '#007B5F' },
      TEBP: { bg: 'rgba(1, 89, 82, 0.15)', text: '#015952' },
      CRP: { bg: 'rgba(127, 237, 132, 0.15)', text: '#5FCEA0' }
    };
    return colors[type] || { bg: 'rgba(0, 0, 0, 0.1)', text: '#000' };
  };

  const calculateProgress = (project: any) => {
    if (!project.startDate || !project.endDate) return 0;
    
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate || project.targetCompletionDate).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  const stats = {
    total: projects.length,
    pending: projects.filter(p => p.status === 'pending').length,
    approved: projects.filter(p => p.status === 'approved').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length
  };

  const modules = [
    {
      id: 'ss',
      title: 'Suggestion System',
      description: 'Submit individual improvement ideas with quick implementation timeline',
      icon: Lightbulb,
      gradient: 'linear-gradient(135deg, #006187 0%, #007B5F 100%)',
      bgColor: 'rgba(0, 97, 135, 0.1)',
      iconColor: '#006187'
    },
    {
      id: 'qcc',
      title: 'Quality Control Circle',
      description: 'Team-based quality improvement projects with collaborative approach',
      icon: Users,
      gradient: 'linear-gradient(135deg, #ED8330 0%, #EE642E 100%)',
      bgColor: 'rgba(238, 100, 46, 0.1)',
      iconColor: '#EE642E'
    },
    {
      id: 'qcp',
      title: 'Quality Control Project',
      description: 'Structured quality improvement initiatives with measurable outcomes',
      icon: ClipboardCheck,
      gradient: 'linear-gradient(135deg, #5FCEA0 0%, #007B5F 100%)',
      bgColor: 'rgba(95, 206, 160, 0.1)',
      iconColor: '#007B5F'
    },
    {
      id: 'tebp',
      title: 'The Executive Business Practices',
      description: 'Strategic business practice improvements requiring management approval',
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #015952 0%, #EE642E 100%)',
      bgColor: 'rgba(1, 89, 82, 0.1)',
      iconColor: '#015952'
    },
    {
      id: 'crp',
      title: 'Cost Reduction Project',
      description: 'Budget-focused initiatives with measurable cost savings',
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #7FED84 0%, #5FCEA0 100%)',
      bgColor: 'rgba(127, 237, 132, 0.1)',
      iconColor: '#5FCEA0'
    }
  ];

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url(${bgPattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              {onBackToProjectType && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onBackToProjectType}
                  className="flex items-center gap-2 font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              )}
              <img src={image_171c976b4ce8798473da0411fc2fa84e7a342985} alt="AlamTri" className="h-8 sm:h-10 w-auto" />
              <div className="hidden sm:block">
                <h1>Digitalization Improvement</h1>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-muted rounded-lg">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.name || 'User'}</span>
              </div>
              <Button variant="outline" size="icon" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-white text-2xl sm:text-3xl">Select the type to start submitting your Improvement project</h1>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden bg-card"
                onClick={() => onNavigate(module.id)}
                style={{
                  ['--module-color' as any]: module.iconColor
                }}
              >
                <CardContent className="p-6">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: module.bgColor }}
                  >
                    <Icon className="w-7 h-7" style={{ color: module.iconColor }} />
                  </div>
                  <h3 className="mb-2 transition-colors duration-300 group-hover:[color:var(--module-color)]">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:[color:var(--module-color)]">
                    {module.description}
                  </p>
                  <div 
                    className="mt-4 h-1 w-0 group-hover:w-full rounded-full transition-all duration-300" 
                    style={{ background: module.gradient }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Monthly Progress Overview Charts */}
        <div className="mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 sm:gap-6">
            {/* SS Collected Chart - 5/8 width */}
            <div className="lg:col-span-5">
              <Card className="shadow-lg border-0 bg-card h-full">
                <CardHeader className="p-4 sm:p-6 pb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" style={{ color: '#006187' }} />
                    <div>
                      <CardTitle className="text-lg sm:text-xl">SS Collected</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Year-to-Date Target vs Actual</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="w-full h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={[
                          { month: 'Jan', Plan: 48, Actual: 133, Achievement: 277 },
                          { month: 'Feb', Plan: 142, Actual: 323, Achievement: 227 },
                          { month: 'Mar', Plan: 242, Actual: 495, Achievement: 205 },
                          { month: 'Apr', Plan: 395, Actual: 651, Achievement: 165 },
                          { month: 'May', Plan: 551, Actual: 807, Achievement: 146 },
                          { month: 'Jun', Plan: 705, Actual: 994, Achievement: 141 },
                          { month: 'Jul', Plan: 859, Actual: 1157, Achievement: 135 },
                          { month: 'Aug', Plan: 1022, Actual: 1378, Achievement: 135 },
                          { month: 'Sep', Plan: 1195, Actual: 1551, Achievement: 130 },
                          { month: 'Oct', Plan: 1356, Actual: 1551, Achievement: 114 },
                          { month: 'Nov', Plan: 1477, Actual: 1551, Achievement: 105 },
                          { month: 'Dec', Plan: 1600, Actual: 1551, Achievement: 97 }
                        ]}
                        margin={{ top: 30, right: 40, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fill: 'currentColor', fontSize: 12 }}
                          tickLine={{ stroke: 'currentColor' }}
                        />
                        <YAxis 
                          yAxisId="left"
                          tick={{ fill: 'currentColor', fontSize: 12 }}
                          tickLine={{ stroke: 'currentColor' }}
                          label={{ value: 'SS Collected', angle: -90, position: 'insideLeft', style: { fill: 'currentColor', fontSize: 12 } }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          tick={{ fill: 'currentColor', fontSize: 12 }}
                          tickLine={{ stroke: 'currentColor' }}
                          label={{ value: 'Achievement (%)', angle: 90, position: 'insideRight', style: { fill: 'currentColor', fontSize: 12 } }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1f2937',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }}
                          labelStyle={{
                            color: '#1f2937',
                            fontWeight: 'bold',
                            marginBottom: '4px'
                          }}
                          itemStyle={{
                            color: '#1f2937'
                          }}
                          formatter={(value: any, name: any) => {
                            if (name === 'Achievement') return [`${value}%`, name];
                            return [value, name];
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px' }}
                          iconType="square"
                        />
                        <Bar 
                          yAxisId="left"
                          dataKey="Plan" 
                          fill="#006187" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        >
                          <LabelList 
                            dataKey="Plan" 
                            position="top" 
                            style={{ fill: '#006187', fontSize: 10, fontWeight: 'bold' }}
                          />
                        </Bar>
                        <Bar 
                          yAxisId="left"
                          dataKey="Actual" 
                          fill="#EE642E" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        >
                          <LabelList 
                            dataKey="Actual" 
                            position="top" 
                            style={{ fill: '#EE642E', fontSize: 10, fontWeight: 'bold' }}
                          />
                        </Bar>
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="Achievement" 
                          stroke="#7FED84" 
                          strokeWidth={3}
                          dot={{ fill: '#7FED84', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* QCC/P Collected Chart - 3/8 width */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg border-0 bg-card h-full">
                <CardHeader className="p-4 sm:p-6 pb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" style={{ color: '#ED8330' }} />
                    <div>
                      <CardTitle className="text-lg sm:text-xl">QCC/P Collected</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Year-to-Date Target vs Actual</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="w-full h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={[
                          { month: 'Dec', Target: 78, Actual: 87, Achievement: 100 },
                          { month: 'Nov', Target: 78, Actual: 87, Achievement: 112 },
                          { month: 'Oct', Target: 78, Actual: 87, Achievement: 112 },
                          { month: 'Sep', Target: 78, Actual: 87, Achievement: 112 },
                          { month: 'Aug', Target: 78, Actual: 69, Achievement: 88 },
                          { month: 'Jul', Target: 57, Actual: 64, Achievement: 112 },
                          { month: 'Jun', Target: 53, Actual: 38, Achievement: 72 },
                          { month: 'May', Target: 48, Actual: 37, Achievement: 77 },
                          { month: 'Apr', Target: 23, Actual: 12, Achievement: 52 },
                          { month: 'Mar', Target: 18, Actual: 14, Achievement: 78 },
                          { month: 'Feb', Target: 14, Actual: 4, Achievement: 29 },
                          { month: 'Jan', Target: 7, Actual: 2, Achievement: 29 }
                        ]}
                        layout="vertical"
                        margin={{ top: 5, right: 50, left: 30, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                        <XAxis 
                          type="number"
                          tick={{ fill: 'currentColor', fontSize: 10 }}
                          tickLine={{ stroke: 'currentColor' }}
                        />
                        <YAxis 
                          type="category"
                          dataKey="month"
                          tick={{ fill: 'currentColor', fontSize: 10 }}
                          tickLine={{ stroke: 'currentColor' }}
                          width={30}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1f2937',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }}
                          labelStyle={{
                            color: '#1f2937',
                            fontWeight: 'bold',
                            marginBottom: '4px'
                          }}
                          itemStyle={{
                            color: '#1f2937'
                          }}
                          formatter={(value: any, name: any) => {
                            if (name === 'Achievement') return [`${value}%`, name];
                            return [value, name];
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px' }}
                          iconType="square"
                        />
                        <Bar 
                          dataKey="Target" 
                          fill="#ED8330" 
                          radius={[0, 4, 4, 0]}
                          barSize={12}
                        >
                          <LabelList 
                            dataKey="Target" 
                            position="right" 
                            style={{ fill: '#ED8330', fontSize: 9, fontWeight: 'bold' }}
                          />
                        </Bar>
                        <Bar 
                          dataKey="Actual" 
                          fill="#5FCEA0" 
                          radius={[0, 4, 4, 0]}
                          barSize={12}
                        >
                          <LabelList 
                            dataKey="Actual" 
                            position="right" 
                            style={{ fill: '#007B5F', fontSize: 9, fontWeight: 'bold' }}
                          />
                        </Bar>
                        <Line 
                          type="monotone" 
                          dataKey="Achievement" 
                          stroke="#015952" 
                          strokeWidth={2}
                          dot={{ fill: '#015952', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Klasifikasi By Class Chart - 3/8 width */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg border-0 bg-card h-full">
                <CardHeader className="p-4 sm:p-6 pb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" style={{ color: '#007B5F' }} />
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Klasifikasi By Class</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Jumlah per Class (A-F)</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="w-full h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={[
                          { class: 'A', jumlah: 12 },
                          { class: 'B', jumlah: 18 },
                          { class: 'C', jumlah: 9 },
                          { class: 'D', jumlah: 7 },
                          { class: 'E', jumlah: 3 },
                          { class: 'F', jumlah: 1 }
                        ]}
                        layout="vertical"
                        margin={{ top: 5, right: 50, left: 30, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                        <XAxis 
                          type="number"
                          tick={{ fill: 'currentColor', fontSize: 10 }}
                          tickLine={{ stroke: 'currentColor' }}
                        />
                        <YAxis 
                          type="category"
                          dataKey="class"
                          tick={{ fill: 'currentColor', fontSize: 10 }}
                          tickLine={{ stroke: 'currentColor' }}
                          width={30}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1f2937',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }}
                          labelStyle={{
                            color: '#1f2937',
                            fontWeight: 'bold',
                            marginBottom: '4px'
                          }}
                          itemStyle={{
                            color: '#1f2937'
                          }}
                          formatter={(value: any, name: any) => [value, name]}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px' }}
                          iconType="square"
                        />
                        <Bar 
                          dataKey="jumlah" 
                          fill="#007B5F" 
                          radius={[0, 4, 4, 0]}
                          barSize={12}
                        >
                          <LabelList 
                            dataKey="jumlah" 
                            position="right" 
                            style={{ fill: '#007B5F', fontSize: 9, fontWeight: 'bold' }}
                          />
                        </Bar>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Monitoring Section */}
        <div className="mt-12">
          <Card className="shadow-lg border-0 bg-card">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Project Monitoring</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track all project submissions and their status</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                <div className="rounded-lg p-3 sm:p-4 border" style={{ background: 'rgba(0, 97, 135, 0.1)', borderColor: '#006187' }}>
                  <p className="text-xs sm:text-sm mb-1" style={{ color: '#006187' }}>Total Projects</p>
                  <p style={{ color: '#015952' }}>{stats.total}</p>
                </div>
                <div className="rounded-lg p-3 sm:p-4 border" style={{ background: 'rgba(238, 183, 48, 0.1)', borderColor: '#EEB730' }}>
                  <p className="text-xs sm:text-sm mb-1" style={{ color: '#EEB730' }}>Pending Review</p>
                  <p style={{ color: '#015952' }}>{stats.pending}</p>
                </div>
                <div className="rounded-lg p-3 sm:p-4 border" style={{ background: 'rgba(95, 206, 160, 0.1)', borderColor: '#5FCEA0' }}>
                  <p className="text-xs sm:text-sm mb-1" style={{ color: '#007B5F' }}>Approved</p>
                  <p style={{ color: '#015952' }}>{stats.approved}</p>
                </div>
                <div className="rounded-lg p-3 sm:p-4 border" style={{ background: 'rgba(0, 97, 135, 0.1)', borderColor: '#006187' }}>
                  <p className="text-xs sm:text-sm mb-1" style={{ color: '#006187' }}>In Progress</p>
                  <p style={{ color: '#015952' }}>{stats.inProgress}</p>
                </div>
                <div className="rounded-lg p-3 sm:p-4 border" style={{ background: 'rgba(127, 237, 132, 0.1)', borderColor: '#7FED84' }}>
                  <p className="text-xs sm:text-sm mb-1" style={{ color: '#5FCEA0' }}>Completed</p>
                  <p style={{ color: '#015952' }}>{stats.completed}</p>
                </div>
              </div>

              {/* Projects List */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All Projects</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-3">
                  <ProjectList 
                    projects={projects} 
                    onSelectProject={setSelectedProject}
                    getStatusBadge={getStatusBadge}
                    getTypeLabel={getTypeLabel}
                    getTypeColor={getTypeColor}
                    calculateProgress={calculateProgress}
                    onViewPDF={setPdfProject}
                  />
                </TabsContent>

                <TabsContent value="pending" className="mt-3">
                  <ProjectList 
                    projects={projects.filter(p => p.status === 'pending')} 
                    onSelectProject={setSelectedProject}
                    getStatusBadge={getStatusBadge}
                    getTypeLabel={getTypeLabel}
                    getTypeColor={getTypeColor}
                    calculateProgress={calculateProgress}
                    onViewPDF={setPdfProject}
                  />
                </TabsContent>

                <TabsContent value="approved" className="mt-3">
                  <ProjectList 
                    projects={projects.filter(p => p.status === 'approved')} 
                    onSelectProject={setSelectedProject}
                    getStatusBadge={getStatusBadge}
                    getTypeLabel={getTypeLabel}
                    getTypeColor={getTypeColor}
                    calculateProgress={calculateProgress}
                    onViewPDF={setPdfProject}
                  />
                </TabsContent>

                <TabsContent value="in-progress" className="mt-3">
                  <ProjectList 
                    projects={projects.filter(p => p.status === 'in-progress')} 
                    onSelectProject={setSelectedProject}
                    getStatusBadge={getStatusBadge}
                    getTypeLabel={getTypeLabel}
                    getTypeColor={getTypeColor}
                    calculateProgress={calculateProgress}
                    onViewPDF={setPdfProject}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Detail Dialog */}
      {selectedProject && (
        <ProjectDetailDialog
          project={selectedProject}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          getStatusBadge={getStatusBadge}
          getTypeLabel={getTypeLabel}
          calculateProgress={calculateProgress}
        />
      )}

      {/* PDF Viewer Dialog */}
      {pdfProject && (
        <PDFViewerDialog
          project={pdfProject}
          open={!!pdfProject}
          onClose={() => setPdfProject(null)}
        />
      )}
    </div>
  );
}

function ProjectList({ 
  projects, 
  onSelectProject, 
  getStatusBadge, 
  getTypeLabel, 
  getTypeColor,
  calculateProgress,
  onViewPDF
}: any) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No projects found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead>Project Title</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Progress</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project: any) => (
            <TableRow key={project.id} className="hover:bg-muted/50">
              <TableCell>
                <Badge 
                  className="text-xs whitespace-nowrap" 
                  style={{ 
                    backgroundColor: getTypeColor(project.type).bg,
                    color: getTypeColor(project.type).text,
                    borderColor: getTypeColor(project.type).text
                  }}
                >
                  {project.type}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                <div className="max-w-xs">
                  <p className="truncate">{project.projectTitle || project.title || project.practiceTitle}</p>
                  {project.members && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.members.length} team members
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>{project.submittedBy}</TableCell>
              <TableCell className="text-sm">
                {new Date(project.submittedDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{getStatusBadge(project.status)}</TableCell>
              <TableCell>
                {project.startDate ? (
                  <div className="space-y-1">
                    <Progress value={calculateProgress(project)} className="h-2 w-20 mx-auto" />
                    <p className="text-xs text-center text-muted-foreground">
                      {calculateProgress(project)}%
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-center text-muted-foreground">-</p>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectProject(project)}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewPDF(project)}
                    title="View PDF Document"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FileDown className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProjectDetailDialog({ project, open, onClose, getStatusBadge, getTypeLabel, calculateProgress }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
          <DialogDescription>
            View detailed information about this project including timeline, team members, and documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="mb-2">
                {project.projectTitle || project.title || project.practiceTitle}
              </h3>
              <p className="text-sm text-muted-foreground">{getTypeLabel(project.type)}</p>
            </div>
            {getStatusBadge(project.status)}
          </div>

          {/* Timeline */}
          {project.startDate && (
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="text-blue-900 dark:text-blue-100">Timeline</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p>{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target Completion</p>
                  <p>
                    {new Date(project.endDate || project.targetCompletionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={calculateProgress(project)} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">Progress: {calculateProgress(project)}%</p>
              </div>
            </div>
          )}

          {/* Leader & Co-Leaders - Only for TEBP */}
          {project.type === 'TEBP' && (project.leader || (project.coLeaders && project.coLeaders.length > 0)) && (
            <div className="space-y-4">
              {/* Leader */}
              {project.leader && (
                <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-cyan-600" />
                    <h4 className="text-cyan-900 dark:text-cyan-100">Leader</h4>
                  </div>
                  <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-3">
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-muted-foreground">NRP:</span> {project.leaderNRP || '-'}
                        </p>
                        <p>
                          {project.leader}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {project.leaderDivision || '-'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Co-Leaders */}
              {project.coLeaders && project.coLeaders.length > 0 && (
                <div className="bg-teal-50 dark:bg-teal-950/30 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-teal-600" />
                    <h4 className="text-teal-900 dark:text-teal-100">Co-Leaders ({Math.min(project.coLeaders.length, 3)})</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {project.coLeaders.slice(0, 3).map((coLeader: any, index: number) => (
                      <Card key={index} className="bg-white dark:bg-gray-800">
                        <CardContent className="p-3">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-muted-foreground">NRP:</span> {coLeader.nrp || '-'}
                            </p>
                            <p className="truncate" title={coLeader.name}>
                              {coLeader.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate" title={coLeader.department}>
                              {coLeader.department || '-'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate" title={coLeader.section}>
                              {coLeader.section || '-'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Team Members */}
          {project.members && project.members.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-purple-600" />
                <h4 className="text-purple-900 dark:text-purple-100">Team Members ({project.members.length})</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.members.map((member: any, index: number) => (
                  <Badge key={index} variant="outline" className="bg-white dark:bg-gray-800">
                    {typeof member === 'string' ? member : member.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Documents */}
          <div className="bg-muted rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5" />
              <h4>Supporting Documents</h4>
            </div>
            {project.strategicDocument ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Strategic Document Uploaded</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded</p>
            )}
          </div>

          {/* Project Details */}
          <div className="space-y-3">
            <h4>Project Information</h4>
            
            {project.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{project.description}</p>
              </div>
            )}
            
            {project.currentSituation && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Situation</p>
                <p className="text-sm">{project.currentSituation}</p>
              </div>
            )}
            
            {project.proposedSolution && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Proposed Solution</p>
                <p className="text-sm">{project.proposedSolution}</p>
              </div>
            )}

            {project.costReduction > 0 && (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-900 dark:text-green-100">Cost Reduction</p>
                </div>
                <p className="text-green-600">${project.costReduction.toLocaleString()} ({project.reductionPercentage}%)</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PDFViewerDialog({ project, open, onClose }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-red-600" />
            {project.pdfDocument}
          </DialogTitle>
          <DialogDescription>
            {project.projectTitle || project.title || project.practiceTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* PDF Document Info */}
          <div className="bg-muted rounded-lg p-4 border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Document Type</p>
                <p className="font-medium">Project Proposal PDF</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Uploaded By</p>
                <p className="font-medium">{project.submittedBy}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Upload Date</p>
                <p className="font-medium">{new Date(project.submittedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">File Size</p>
                <p className="font-medium">2.4 MB</p>
              </div>
            </div>
          </div>

          {/* PDF Preview Area */}
          <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
            <div className="bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
              <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden max-w-4xl mx-auto">
                {project.pdfImages && project.pdfImages.length > 0 ? (
                  <div className="space-y-4 p-4">
                    {project.pdfImages.map((imageUrl: string, index: number) => (
                      <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <ImageWithFallback 
                          src={imageUrl} 
                          alt={`${project.pdfDocument} - Page ${index + 1}`}
                          className="w-full h-auto rounded shadow-lg"
                        />
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Page {index + 1} of {project.pdfImages.length}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 min-h-[500px]">
                    {/* PDF Content Mockup */}
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="text-center border-b pb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                          {project.projectTitle || project.title || project.practiceTitle}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Project Proposal Document
                        </p>
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Executive Summary</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {project.description || 'This project aims to improve operational efficiency and reduce costs through systematic improvements and innovation.'}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Project Details</h3>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Project Type:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{project.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Submitted By:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{project.submittedBy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Submission Date:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {new Date(project.submittedDate).toLocaleDateString()}
                              </span>
                            </div>
                            {project.members && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Team Size:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{project.members.length} members</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {project.currentSituation && (
                          <div>
                            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Current Situation</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {project.currentSituation}
                            </p>
                          </div>
                        )}

                        {project.proposedSolution && (
                          <div>
                            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Proposed Solution</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {project.proposedSolution}
                            </p>
                          </div>
                        )}

                        {project.expectedBenefit && (
                          <div>
                            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Expected Benefits</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {project.expectedBenefit}
                            </p>
                          </div>
                        )}

                        {project.costReduction > 0 && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                            <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">Cost Reduction Impact</h3>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-green-700 dark:text-green-300">Current Cost:</span>
                                <span className="font-medium text-green-900 dark:text-green-100">
                                  ${project.currentCost?.toLocaleString() || '0'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-700 dark:text-green-300">Projected Cost:</span>
                                <span className="font-medium text-green-900 dark:text-green-100">
                                  ${project.projectedCost?.toLocaleString() || '0'}
                                </span>
                              </div>
                              <div className="flex justify-between border-t border-green-200 dark:border-green-800 pt-1 mt-1">
                                <span className="text-green-700 dark:text-green-300 font-semibold">Savings:</span>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  ${project.costReduction.toLocaleString()} ({project.reductionPercentage}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="border-t pt-4 mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
                          <p>Page 1 of 1 • {project.pdfDocument}</p>
                          <p className="mt-1">Digitalization Improvement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <FileDown className="w-4 h-4" />
                Download PDF
              </Button>
              <Button className="gap-2" style={{ background: 'linear-gradient(90deg, #015952 0%, #005CA0 100%)' }}>
                <CheckCircle className="w-4 h-4" />
                Approve Document
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}