import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { 
  ArrowLeft, 
  Eye, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  TrendingUp,
  FileDown,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';

interface MonitoringDashboardProps {
  user: any;
  projects: any[];
  onBack: () => void;
  onUpdateProject: (project: any) => void;
}

export function MonitoringDashboard({ user, projects, onBack, onUpdateProject }: MonitoringDashboardProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

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

  // Filter projects by selected type and status
  const filterByType = (projectList: any[]) => {
    let filtered = projectList;
    
    // Filter by types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p => selectedTypes.includes(p.type));
    }
    
    // Filter by statuses
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(p => selectedStatuses.includes(p.status));
    }
    
    return filtered;
  };
  
  // Get unique types from projects
  const uniqueTypes = Array.from(new Set(projects.map(p => p.type)));
  
  // Get unique statuses from projects
  const uniqueStatuses = Array.from(new Set(projects.map(p => p.status)));
  
  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
  };

  const filteredProjects = filterByType(projects);

  const stats = {
    total: filteredProjects.length,
    pending: filteredProjects.filter(p => p.status === 'pending').length,
    approved: filteredProjects.filter(p => p.status === 'approved').length,
    inProgress: filteredProjects.filter(p => p.status === 'in-progress').length,
    completed: filteredProjects.filter(p => p.status === 'completed').length
  };

  return (
<div className="p-4 sm:p-6">

      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4 sm:mb-6" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">Monitoring Dashboard</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Track all project submissions and their status</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Projects</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                </TabsList>
                
                {/* Active Filter Indicator */}
                {(selectedTypes.length > 0 || selectedStatuses.length > 0) && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border flex-wrap">
                    <Filter className="w-3 h-3 text-gray-600" />
                    <span className="text-xs text-gray-600">Active Filters:</span>
                    
                    {selectedTypes.map(type => (
                      <Badge 
                        key={type}
                        className="border cursor-pointer hover:opacity-80 transition-opacity gap-1" 
                        style={{ 
                          backgroundColor: getTypeColor(type).bg,
                          color: getTypeColor(type).text,
                          borderColor: getTypeColor(type).text
                        }}
                        onClick={() => toggleTypeFilter(type)}
                      >
                        {type}
                        <X className="w-3 h-3" />
                      </Badge>
                    ))}
                    
                    {selectedStatuses.map(status => (
                      <Badge 
                        key={status}
                        className="border cursor-pointer hover:opacity-80 transition-opacity gap-1 bg-gray-600 text-white"
                        onClick={() => toggleStatusFilter(status)}
                      >
                        {status}
                        <X className="w-3 h-3" />
                      </Badge>
                    ))}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </Button>
                  </div>
                )}
              </div>

              <TabsContent value="all" className="mt-4">
                <ProjectList 
                  projects={filteredProjects} 
                  onSelectProject={setSelectedProject}
                  getStatusBadge={getStatusBadge}
                  getTypeLabel={getTypeLabel}
                  getTypeColor={getTypeColor}
                  calculateProgress={calculateProgress}
                  uniqueTypes={uniqueTypes}
                  uniqueStatuses={uniqueStatuses}
                  selectedTypes={selectedTypes}
                  selectedStatuses={selectedStatuses}
                  onToggleType={toggleTypeFilter}
                  onToggleStatus={toggleStatusFilter}
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <ProjectList 
                  projects={filteredProjects.filter(p => p.status === 'pending')} 
                  onSelectProject={setSelectedProject}
                  getStatusBadge={getStatusBadge}
                  getTypeLabel={getTypeLabel}
                  getTypeColor={getTypeColor}
                  calculateProgress={calculateProgress}
                  uniqueTypes={uniqueTypes}
                  uniqueStatuses={uniqueStatuses}
                  selectedTypes={selectedTypes}
                  selectedStatuses={selectedStatuses}
                  onToggleType={toggleTypeFilter}
                  onToggleStatus={toggleStatusFilter}
                />
              </TabsContent>

              <TabsContent value="approved" className="mt-4">
                <ProjectList 
                  projects={filteredProjects.filter(p => p.status === 'approved')} 
                  onSelectProject={setSelectedProject}
                  getStatusBadge={getStatusBadge}
                  getTypeLabel={getTypeLabel}
                  getTypeColor={getTypeColor}
                  calculateProgress={calculateProgress}
                  uniqueTypes={uniqueTypes}
                  uniqueStatuses={uniqueStatuses}
                  selectedTypes={selectedTypes}
                  selectedStatuses={selectedStatuses}
                  onToggleType={toggleTypeFilter}
                  onToggleStatus={toggleStatusFilter}
                />
              </TabsContent>

              <TabsContent value="in-progress" className="mt-4">
                <ProjectList 
                  projects={filteredProjects.filter(p => p.status === 'in-progress')} 
                  onSelectProject={setSelectedProject}
                  getStatusBadge={getStatusBadge}
                  getTypeLabel={getTypeLabel}
                  getTypeColor={getTypeColor}
                  calculateProgress={calculateProgress}
                  uniqueTypes={uniqueTypes}
                  uniqueStatuses={uniqueStatuses}
                  selectedTypes={selectedTypes}
                  selectedStatuses={selectedStatuses}
                  onToggleType={toggleTypeFilter}
                  onToggleStatus={toggleStatusFilter}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
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
  uniqueTypes,
  uniqueStatuses,
  selectedTypes,
  selectedStatuses,
  onToggleType,
  onToggleStatus
}: any) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No projects found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile Filter Buttons */}
      <div className="lg:hidden flex gap-2 mb-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 relative">
              <Filter className="h-3 w-3" />
              Type
              {selectedTypes.length > 0 && (
                <Badge className="ml-1 h-4 px-1 text-xs" style={{ backgroundColor: '#015952', color: 'white' }}>
                  {selectedTypes.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700 mb-2">Filter by Type</div>
              {uniqueTypes.map((type: string) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => onToggleType(type)}
                  />
                  <label
                    htmlFor={`mobile-type-${type}`}
                    className="text-sm cursor-pointer flex items-center gap-2 flex-1"
                  >
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: getTypeColor(type).bg,
                        color: getTypeColor(type).text,
                      }}
                    >
                      {type}
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 relative">
              <Filter className="h-3 w-3" />
              Status
              {selectedStatuses.length > 0 && (
                <Badge className="ml-1 h-4 px-1 text-xs" style={{ backgroundColor: '#015952', color: 'white' }}>
                  {selectedStatuses.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700 mb-2">Filter by Status</div>
              {uniqueStatuses.map((status: string) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-status-${status}`}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => onToggleStatus(status)}
                  />
                  <label
                    htmlFor={`mobile-status-${status}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {getStatusBadge(status)}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table Header with Filters - Desktop Only */}
      <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2 bg-gray-50 rounded-lg border text-sm font-medium text-gray-700">
        <div className="col-span-1 flex items-center gap-1">
          Type
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 relative">
                {selectedTypes.length > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px]">{selectedTypes.length}</span>
                  </div>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700 mb-2">Filter by Type</div>
                {uniqueTypes.map((type: string) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => onToggleType(type)}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm cursor-pointer flex items-center gap-2 flex-1"
                    >
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: getTypeColor(type).bg,
                          color: getTypeColor(type).text,
                        }}
                      >
                        {type}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="col-span-3">Project Title</div>
        <div className="col-span-2">Submitted By</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2 flex items-center gap-1">
          Status
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 relative">
                {selectedStatuses.length > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px]">{selectedStatuses.length}</span>
                  </div>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700 mb-2">Filter by Status</div>
                {uniqueStatuses.map((status: string) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => onToggleStatus(status)}
                    />
                    <label
                      htmlFor={`status-${status}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {getStatusBadge(status)}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="col-span-1">Progress</div>
        <div className="col-span-1 text-center">Actions</div>
      </div>

      {/* Project Rows */}
      {projects.map((project: any) => (
        <div
          key={project.id}
          className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
            {/* Type */}
            <div className="col-span-1">
              <Badge 
                className="border text-xs" 
                style={{ 
                  backgroundColor: getTypeColor(project.type).bg,
                  color: getTypeColor(project.type).text,
                  borderColor: getTypeColor(project.type).text,
                }}
              >
                {project.type}
              </Badge>
            </div>
            
            {/* Project Title */}
            <div className="col-span-3">
              <h4 
                className="text-gray-900 cursor-pointer hover:underline"
                onClick={() => onSelectProject(project)}
              >
                {project.projectTitle || project.title || project.practiceTitle}
              </h4>
            </div>
            
            {/* Submitted By */}
            <div className="col-span-2 text-sm text-gray-600">
              {project.submittedBy}
            </div>
            
            {/* Date */}
            <div className="col-span-2 text-sm text-gray-600">
              {new Date(project.submittedDate).toLocaleDateString()}
            </div>
            
            {/* Status */}
            <div className="col-span-2">
              {getStatusBadge(project.status)}
            </div>
            
            {/* Progress */}
            <div className="col-span-1">
              <div className="text-xs text-gray-600">
                {calculateProgress(project)}%
              </div>
            </div>
            
            {/* Actions */}
            <div className="col-span-1 flex justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSelectProject(project)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <Badge 
                    className="border w-fit text-xs" 
                    style={{ 
                      backgroundColor: getTypeColor(project.type).bg,
                      color: getTypeColor(project.type).text,
                      borderColor: getTypeColor(project.type).text,
                    }}
                  >
                    {project.type}
                  </Badge>
                  <h4 
                    className="text-gray-900 text-sm sm:text-base cursor-pointer hover:underline"
                    onClick={() => onSelectProject(project)}
                  >
                    {project.projectTitle || project.title || project.practiceTitle}
                  </h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    {project.submittedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {new Date(project.submittedDate).toLocaleDateString()}
                  </span>
                  {project.members && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      {project.members.length} members
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
                {getStatusBadge(project.status)}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSelectProject(project)}
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
            
            {project.startDate && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{calculateProgress(project)}%</span>
                </div>
                <Progress value={calculateProgress(project)} className="h-2" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectDetailDialog({ project, open, onClose, getStatusBadge, getTypeLabel, calculateProgress }: any) {
  const [showPdfModal, setShowPdfModal] = useState(false);

  return (
    <>
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
              <h3 className="text-gray-900 mb-2">
                {project.projectTitle || project.title || project.practiceTitle}
              </h3>
              <p className="text-sm text-gray-600">{getTypeLabel(project.type)}</p>
            </div>
            {getStatusBadge(project.status)}
          </div>

          {/* Timeline */}
          {project.startDate && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="text-blue-900">Timeline</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Target Completion</p>
                  <p className="text-gray-900">
                    {new Date(project.endDate || project.targetCompletionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={calculateProgress(project)} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">Progress: {calculateProgress(project)}%</p>
              </div>
            </div>
          )}

          {/* Team Members */}
          {project.members && project.members.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-purple-600" />
                <h4 className="text-purple-900">Team Members ({project.members.length})</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.members.map((member: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-white">
                    {member}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Documents */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <h4 className="text-gray-900">Supporting Documents</h4>
            </div>
            {project.pdfDocument && project.pdfImages && project.pdfImages.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>{project.pdfDocument}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowPdfModal(true)}
                  className="w-full sm:w-auto"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View PDF Document
                </Button>
              </div>
            ) : project.strategicDocument ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Strategic Document Uploaded</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded</p>
            )}
          </div>

          {/* Project Details */}
          <div className="space-y-3">
            <h4 className="text-gray-900">Project Information</h4>
            
            {project.description && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-sm text-gray-900">{project.description}</p>
              </div>
            )}
            
            {project.currentSituation && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Situation</p>
                <p className="text-sm text-gray-900">{project.currentSituation}</p>
              </div>
            )}
            
            {project.proposedSolution && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Proposed Solution</p>
                <p className="text-sm text-gray-900">{project.proposedSolution}</p>
              </div>
            )}

            {project.costReduction > 0 && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-900">Cost Reduction</p>
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

    {/* PDF Document Modal */}
    <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project.pdfDocument || 'PDF Document'}</DialogTitle>
          <DialogDescription>
            Document preview for {project.projectTitle || project.title || project.practiceTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* PDF Document Info */}
          <div className="bg-muted rounded-lg p-4 border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Document Type</p>
                <p className="font-medium">Project Document PDF</p>
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
                <p className="text-muted-foreground mb-1">Status</p>
                <p className="font-medium">{project.status}</p>
              </div>
            </div>
          </div>

          {/* PDF Preview Area with Scroll */}
          <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
            <div className="bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
              <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden max-w-4xl mx-auto">
                {project.pdfImages && project.pdfImages.length > 0 ? (
                  <div className="space-y-4 p-4">
                    {project.pdfImages.map((imageUrl: string, index: number) => (
                      <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <img 
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
                  <div className="p-6 sm:p-8 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">No PDF document available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setShowPdfModal(false)}>
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
    </>
  );
}