import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle2, FileText, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { ModuleLayout } from '../layout/ModuleLayout';
import { Badge } from '../ui/badge';

interface ExecutiveBusinessPracticesProps {
  user: any;
  onBack: () => void;
  onSubmit: (data: any) => void;
}

interface CoLeader {
  nrp: string;
  name: string;
  department: string;
  section: string;
  jobsite: string;
}

interface Member {
  nrp: string;
  name: string;
  department: string;
  section: string;
}

export function ExecutiveBusinessPractices({ user, onBack, onSubmit }: ExecutiveBusinessPracticesProps) {
  const [formData, setFormData] = useState({
    project: '',
    problem: '',
    problemDocument: null as File | null,
    supportingOKR: '',
    okrDocument: null as File | null,
    benefit: '',
    
    // Leader
    leaderNRP: '',
    leader: '',
    leaderDivision: '',
    
    // Co Leaders
    coLeaders: Array(3).fill({ name: '', department: '', section: '', nrp: '', jobsite: '' }) as CoLeader[],
    
    // Members
    members: Array(10).fill({ name: '', department: '', section: '', nrp: '' }) as Member[]
  });

  const [validationError, setValidationError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Co-Leader temporary input
  const [coLeaderNRP, setCoLeaderNRP] = useState('');
  
  // Member NRP search
  const [searchNRP, setSearchNRP] = useState('');

  // Mock database of employees - in real app, this would come from an API
  const employeeDatabase = [
    { nrp: '12345', name: 'Agus Harsanto', department: 'IT OT Department', section: 'System Integration', jobsite: 'ADARO ENERGY' },
    { nrp: '12346', name: 'Eko Iswanto', department: 'Plant', section: 'Production Line 1', jobsite: 'ADMO' },
    { nrp: '12347', name: 'Risal Azeem', department: 'Finance', section: 'Accounting', jobsite: 'HO' },
    { nrp: '12348', name: 'Alfian Harsanto', department: 'IT OT Department', section: 'Infrastructure', jobsite: 'ADMO' },
    { nrp: '12349', name: 'Tito Dewantoro', department: 'Plant', section: 'Quality Assurance', jobsite: 'ADMO' },
    { nrp: '12350', name: 'Supriono', department: 'Engineering', section: 'Design', jobsite: 'ADMO' },
    { nrp: '12351', name: 'Agung Pramanto', department: 'Maintenance', section: 'Electrical', jobsite: 'ADMO' },
    { nrp: '12352', name: 'Zalman', department: 'Production', section: 'Assembly', jobsite: 'ADMO' },
    { nrp: '12353', name: 'Seto Aji', department: 'Quality Assurance', section: 'Testing', jobsite: 'ADMO' },
    { nrp: '12354', name: 'Dedi Rahmat', department: 'Supply Chain', section: 'Logistics', jobsite: 'ADMO' },
    { nrp: '12355', name: 'Ismail Achmad', department: 'HR', section: 'Recruitment', jobsite: 'ADMO' },
    { nrp: '12356', name: 'Hyoman Pandit', department: 'Finance', section: 'Treasury', jobsite: 'ADMO' },
    { nrp: '12357', name: 'Yanuar Surya', department: 'Marketing', section: 'Digital', jobsite: 'ADMO' },
    { nrp: '12358', name: 'Mokhammad', department: 'Sales', section: 'B2B', jobsite: 'ADMO' },
    { nrp: '12359', name: 'Imam Hanafi', department: 'R&D', section: 'Innovation', jobsite: 'ADMO' },
    { nrp: '12360', name: 'Muhammad Faris', department: 'Procurement', section: 'Sourcing', jobsite: 'ADMO' }
  ];

  const handleSearchLeader = () => {
    if (!formData.leaderNRP.trim()) {
      setValidationError('Please enter Leader NRP to search');
      return;
    }

    const employee = employeeDatabase.find(emp => emp.nrp === formData.leaderNRP);
    
    if (!employee) {
      setValidationError(`Employee with NRP "${formData.leaderNRP}" not found in database`);
      setFormData({ 
        ...formData, 
        leader: '', 
        leaderDivision: '' 
      });
      return;
    }

    setFormData({ 
      ...formData, 
      leader: employee.name,
      leaderDivision: employee.jobsite
    });
    setValidationError('');
  };

  const handleAddCoLeader = () => {
    if (!coLeaderNRP.trim()) {
      setValidationError('Please enter Co-Leader NRP');
      return;
    }

    const employee = employeeDatabase.find(emp => emp.nrp === coLeaderNRP);
    
    if (!employee) {
      setValidationError(`Employee with NRP "${coLeaderNRP}" not found in database`);
      return;
    }

    // Find first empty slot
    const emptyIndex = formData.coLeaders.findIndex(cl => !cl.name.trim());
    if (emptyIndex === -1) {
      setValidationError('All co-leader slots are filled. Please clear a slot first.');
      return;
    }

    // Insert employee data
    const newCoLeaders = [...formData.coLeaders];
    newCoLeaders[emptyIndex] = {
      nrp: employee.nrp,
      name: employee.name,
      department: employee.department,
      section: employee.section,
      jobsite: employee.jobsite
    };
    setFormData({ ...formData, coLeaders: newCoLeaders });
    setCoLeaderNRP('');
    setValidationError('');
  };



  const handleSearchNRP = () => {
    if (!searchNRP.trim()) {
      setValidationError('Please enter an NRP to search');
      return;
    }

    const employee = employeeDatabase.find(emp => emp.nrp === searchNRP);
    
    if (!employee) {
      setValidationError(`Employee with NRP "${searchNRP}" not found in database`);
      return;
    }

    // Find first empty slot
    const emptyIndex = formData.members.findIndex(m => !m.name.trim());
    if (emptyIndex === -1) {
      setValidationError('All member slots are filled. Please clear a slot first.');
      return;
    }

    // Insert employee data
    const newMembers = [...formData.members];
    newMembers[emptyIndex] = {
      name: employee.name,
      department: employee.department,
      section: employee.section,
      nrp: employee.nrp
    };
    setFormData({ ...formData, members: newMembers });
    setSearchNRP('');
    setValidationError('');
  };

  const updateMember = (index: number, field: 'name' | 'department' | 'section' | 'nrp', value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, members: newMembers });
    setValidationError('');
  };

  const updateCoLeader = (index: number, field: 'name' | 'department' | 'section' | 'nrp' | 'jobsite', value: string) => {
    const newCoLeaders = [...formData.coLeaders];
    newCoLeaders[index] = { ...newCoLeaders[index], [field]: value };
    setFormData({ ...formData, coLeaders: newCoLeaders });
    setValidationError('');
  };

  const handleFileChange = (field: 'problemDocument' | 'okrDocument', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Check file size (5MB = 5242880 bytes)
      if (file.size > 5242880) {
        setValidationError('File size must be less than 5 MB');
        e.target.value = '';
        return;
      }
      
      setFormData({ ...formData, [field]: file });
      setValidationError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Must have minimum 3 members
    const validMembers = formData.members.filter(m => m.name.trim() !== '');
    if (validMembers.length < 3) {
      setValidationError('TEBP Project requires minimum 3 team members');
      return;
    }

    // Validate that leader is filled
    if (!formData.leader.trim()) {
      setValidationError('Please fill in the Leader information');
      return;
    }

    // Validation: Must have minimum 1 co-leader
    const validCoLeaders = formData.coLeaders.filter(cl => cl.name.trim() !== '');
    if (validCoLeaders.length < 1) {
      setValidationError('TEBP Project requires minimum 1 co-leader');
      return;
    }

    onSubmit({
      ...formData,
      coLeaders: validCoLeaders,
      members: validMembers,
      type: 'TEBP',
      submittedBy: user?.name,
      status: 'pending',
      problemDocumentName: formData.problemDocument?.name,
      okrDocumentName: formData.okrDocument?.name
    });
    
    setShowSuccess(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background">
        <Card className="w-full max-w-md text-center bg-card">
          <CardContent className="pt-6">
            <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#5FCEA0' }} />
            <h3 className="mb-2">TEBP Project Submitted!</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Your Executive Business Practice project has been submitted</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ModuleLayout onBack={onBack}>
      <Card className="shadow-lg bg-card">
        {/* Header */}
        <div className="border-b p-3 sm:p-4 bg-card">
          <div className="text-center">
            <h2 className="text-base sm:text-lg mb-1">PT SAPTAINDRA SEJATI (ADARO ENERGY)</h2>
            <p className="mb-2">THE EXECUTIVE BUSINESS PRACTICES (TEBP) PROJECT of 2024</p>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROJECT */}
            <div className="space-y-4">
              <h3 className="border-b pb-2">Project</h3>
              <div className="space-y-2">
                <Label htmlFor="project">Project Title *</Label>
                <Textarea
                  id="project"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  placeholder="Enter project description"
                  rows={2}
                  required
                  className="resize-none"
                />
              </div>
            </div>

            {/* BACKGROUND */}
            <div className="space-y-4">
              <h3 className="border-b pb-2">Background</h3>
              
              {/* Problem */}
              <div className="border rounded-lg p-4 space-y-3" style={{ backgroundColor: 'rgba(1, 89, 82, 0.05)' }}>
                <Label htmlFor="problem" className="text-base">Problem *</Label>
                <Textarea
                  id="problem"
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  placeholder="Describe the problem"
                  rows={3}
                  required
                  className="resize-none"
                />
                
                {/* Problem Document Upload */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Supporting Document (PDF, max 5MB)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 bg-background">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('problemDocument', e)}
                        className="text-sm"
                      />
                      {formData.problemDocument && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <FileText className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{formData.problemDocument.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Supporting OKR */}
              <div className="border rounded-lg p-4 space-y-3" style={{ backgroundColor: 'rgba(238, 100, 46, 0.05)' }}>
                <Label htmlFor="supportingOKR" className="text-base">Supporting OKRs *</Label>
                <Textarea
                  id="supportingOKR"
                  value={formData.supportingOKR}
                  onChange={(e) => setFormData({ ...formData, supportingOKR: e.target.value })}
                  placeholder="Enter supporting OKRs"
                  rows={2}
                  required
                  className="resize-none"
                />
                
                {/* OKR Document Upload */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Supporting Document (PDF, max 5MB)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 bg-background">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('okrDocument', e)}
                        className="text-sm"
                      />
                      {formData.okrDocument && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <FileText className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{formData.okrDocument.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefit */}
              <div className="space-y-2">
                <Label htmlFor="benefit">Benefit *</Label>
                <Textarea
                  id="benefit"
                  value={formData.benefit}
                  onChange={(e) => setFormData({ ...formData, benefit: e.target.value })}
                  placeholder="Describe the benefits"
                  rows={2}
                  required
                  className="resize-none"
                />
              </div>
            </div>

            {/* TEAM PROJECT */}
            <div className="space-y-4">
              <h3 className="border-b pb-2">Team Project</h3>
              
              {/* Leader */}
              <div className="space-y-3">
                <Label>Leader *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="NRP"
                      value={formData.leaderNRP}
                      onChange={(e) => setFormData({ ...formData, leaderNRP: e.target.value })}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleSearchLeader}
                      variant="outline"
                      size="sm"
                    >
                      Get
                    </Button>
                  </div>
                  <Input
                    placeholder="Name (auto-filled)"
                    value={formData.leader}
                    readOnly
                    className="bg-muted"
                  />
                  <Input
                    placeholder="Division (auto-filled)"
                    value={formData.leaderDivision}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Co Leader */}
              <div className="space-y-4">
                <h3 className="border-b pb-2">Co Leader</h3>
                
                {/* Co Leader NRP Search */}
                <div className="bg-background/50 p-4 rounded-lg border">
                  <Label className="mb-2 block">Add Co Leader by NRP</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter NRP"
                      value={coLeaderNRP}
                      onChange={(e) => setCoLeaderNRP(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCoLeader())}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddCoLeader}
                      variant="outline"
                    >
                      Insert
                    </Button>
                  </div>
                </div>

                {/* Co-Leaders Table */}
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left border-b">No</th>
                        <th className="p-2 text-left border-b">NRP</th>
                        <th className="p-2 text-left border-b">Name</th>
                        <th className="p-2 text-left border-b">Department</th>
                        <th className="p-2 text-left border-b">Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.coLeaders.map((coLeader, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2">
                            <Input
                              value={coLeader.nrp}
                              onChange={(e) => updateCoLeader(index, 'nrp', e.target.value)}
                              placeholder="-"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={coLeader.name}
                              onChange={(e) => updateCoLeader(index, 'name', e.target.value)}
                              placeholder="-"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={coLeader.department}
                              onChange={(e) => updateCoLeader(index, 'department', e.target.value)}
                              placeholder="-"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={coLeader.section}
                              onChange={(e) => updateCoLeader(index, 'section', e.target.value)}
                              placeholder="-"
                              className="h-8 text-xs"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  * Minimum 1 co-leader required
                </p>
              </div>
            </div>

            {/* MEMBERS */}
            <div className="space-y-4">
              <h3 className="border-b pb-2">Members</h3>
              
              {/* Member NRP Search */}
              <div className="bg-background/50 p-4 rounded-lg border">
                <Label className="mb-2 block">Add Member by NRP</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter NRP"
                    value={searchNRP}
                    onChange={(e) => setSearchNRP(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchNRP())}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={handleSearchNRP}
                    variant="outline"
                  >
                    Insert
                  </Button>
                </div>
              </div>

              {/* Members Table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left border-b">No</th>
                      <th className="p-2 text-left border-b">NRP</th>
                      <th className="p-2 text-left border-b">Name</th>
                      <th className="p-2 text-left border-b">Department</th>
                      <th className="p-2 text-left border-b">Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.members.map((member, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">
                          <Input
                            value={member.nrp}
                            onChange={(e) => updateMember(index, 'nrp', e.target.value)}
                            placeholder="-"
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={member.name}
                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                            placeholder="-"
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={member.department}
                            onChange={(e) => updateMember(index, 'department', e.target.value)}
                            placeholder="-"
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={member.section}
                            onChange={(e) => updateMember(index, 'section', e.target.value)}
                            placeholder="-"
                            className="h-8 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <p className="text-xs text-muted-foreground">
                * Minimum 3 members required
              </p>
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                style={{ background: 'linear-gradient(135deg, #015952 0%, #EE642E 100%)' }}
              >
                Submit TEBP
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModuleLayout>
  );
}
