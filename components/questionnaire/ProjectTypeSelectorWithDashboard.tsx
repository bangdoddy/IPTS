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
  BarChart3,
  Home,
  Settings
} from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useTheme } from '../theme/ThemeProvider';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, LabelList } from 'recharts';
import bgPattern from 'figma:asset/c09ecd52078ce41db4ca5fcecd12ca2ca759c76c.png';

interface ProjectTypeSelectorWithDashboardProps {
  user: any;
  projects: any[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onUpdateProject: (project: any) => void;
}

export function ProjectTypeSelectorWithDashboard({ 
  user, 
  projects, 
  onNavigate, 
  onLogout, 
  onUpdateProject 
}: ProjectTypeSelectorWithDashboardProps) {
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
    <div className="min-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r shadow-lg flex-col hidden lg:flex fixed left-0 top-0 bottom-0 z-20">
        {/* Logo Section */}
        <div className="p-6 border-b">
          <img src={image_171c976b4ce8798473da0411fc2fa84e7a342985} alt="InovaSIS" className="h-10 w-auto mb-2" />
          <p className="text-xs text-muted-foreground">Innovation Management System</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #015952 0%, #006187 100%)' }}
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
            <FileText className="w-5 h-5" />
            <span>My Projects</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg mb-2">
            <User className="w-4 h-4" />
            <span className="text-sm truncate">{user?.name || 'User'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="bg-card border-b shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <img src={image_171c976b4ce8798473da0411fc2fa84e7a342985} alt="InovaSIS" className="h-8 sm:h-10 w-auto" />
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

        {/* Body Content - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            backgroundImage: `url(${bgPattern})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
            {/* Title */}
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="text-white text-2xl sm:text-3xl">Select the type to start submitting your Improvement project</h1>
            </div>

            {/* Module Cards */}
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

            {/* Charts Section */}
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
              </div>
            </div>

            {/* Project Monitoring Section */}
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

                  {/* Projects Table */}
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                      <TabsTrigger value="all">All Projects</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="approved">Approved</TabsTrigger>
                      <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-3">
                      {projects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No projects yet. Click on a module above to create your first project!
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Project Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {projects.map((project, index) => {
                                const typeColor = getTypeColor(project.type);
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{project.title || project.problemStatement}</TableCell>
                                    <TableCell>
                                      <Badge 
                                        style={{ 
                                          backgroundColor: typeColor.bg, 
                                          color: typeColor.text,
                                          border: 'none'
                                        }}
                                      >
                                        {getTypeLabel(project.type)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Progress value={calculateProgress(project)} className="w-20" />
                                        <span className="text-xs">{calculateProgress(project)}%</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {new Date(project.submittedDate || Date.now()).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => setSelectedProject(project)}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="pending" className="mt-3">
                      <div className="text-center py-8 text-muted-foreground">
                        {projects.filter(p => p.status === 'pending').length === 0 
                          ? 'No pending projects' 
                          : `${projects.filter(p => p.status === 'pending').length} pending projects`}
                      </div>
                    </TabsContent>

                    <TabsContent value="approved" className="mt-3">
                      <div className="text-center py-8 text-muted-foreground">
                        {projects.filter(p => p.status === 'approved').length === 0 
                          ? 'No approved projects' 
                          : `${projects.filter(p => p.status === 'approved').length} approved projects`}
                      </div>
                    </TabsContent>

                    <TabsContent value="in-progress" className="mt-3">
                      <div className="text-center py-8 text-muted-foreground">
                        {projects.filter(p => p.status === 'in-progress').length === 0 
                          ? 'No in-progress projects' 
                          : `${projects.filter(p => p.status === 'in-progress').length} in-progress projects`}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Project Detail Dialog */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProject.title || selectedProject.problemStatement}</DialogTitle>
              <DialogDescription>
                {getTypeLabel(selectedProject.type)} - {getStatusBadge(selectedProject.status)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">Description</h4>
                <p className="text-sm">{selectedProject.description || selectedProject.problemStatement}</p>
              </div>
              {selectedProject.expectedResults && (
                <div>
                  <h4 className="font-bold mb-2">Expected Results</h4>
                  <p className="text-sm">{selectedProject.expectedResults}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}