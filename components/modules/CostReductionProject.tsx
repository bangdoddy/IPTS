import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { ArrowLeft, DollarSign, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface CostReductionProjectProps {
  user: any;
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export function CostReductionProject({ user, onBack, onSubmit }: CostReductionProjectProps) {
  const [formData, setFormData] = useState({
    projectTitle: '',
    category: '',
    currentCost: 0,
    targetCost: 0,
    costReduction: 0,
    reductionPercentage: 0,
    budget: 0,
    description: '',
    methodology: '',
    expectedROI: '',
    startDate: '',
    targetCompletionDate: ''
  });

  const [validationError, setValidationError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (formData.currentCost > 0 && formData.targetCost > 0) {
      const reduction = formData.currentCost - formData.targetCost;
      const percentage = (reduction / formData.currentCost) * 100;
      setFormData(prev => ({
        ...prev,
        costReduction: reduction,
        reductionPercentage: parseFloat(percentage.toFixed(2))
      }));
    }
  }, [formData.currentCost, formData.targetCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Cost reduction must be positive
    if (formData.costReduction <= 0) {
      setValidationError('Target cost must be lower than current cost to show reduction');
      return;
    }

    // Validation: Must have budget allocated
    if (formData.budget <= 0) {
      setValidationError('Budget allocation is required for cost reduction project');
      return;
    }

    // Validation: Cost reduction vs budget check
    if (formData.costReduction < formData.budget) {
      setValidationError('Warning: Cost reduction should exceed budget investment for positive ROI');
      return;
    }

    onSubmit({
      ...formData,
      type: 'CRP',
      submittedBy: user?.name,
      status: 'pending'
    });
    
    setShowSuccess(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">CRP Submitted!</h3>
            <p className="text-gray-600">Your Cost Reduction Project has been submitted</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-white rounded-t-lg" style={{ background: 'linear-gradient(135deg, #7FED84 0%, #5FCEA0 100%)' }}>
            <CardTitle>Cost Reduction Project (CRP)</CardTitle>
            <CardDescription className="text-white opacity-90">
              Budget-focused initiatives with measurable cost savings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    placeholder="Enter cost reduction project title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Cost Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Material Cost, Energy, Labor, Waste Reduction"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the cost reduction initiative"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="methodology">Methodology & Approach *</Label>
                  <Textarea
                    id="methodology"
                    value={formData.methodology}
                    onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                    placeholder="Explain how cost reduction will be achieved"
                    rows={2}
                    required
                  />
                </div>
              </div>

              {/* Cost Analysis & Budget Verification */}
              <div className="border rounded-lg p-4" style={{ backgroundColor: 'rgba(127, 237, 132, 0.1)', borderColor: '#5FCEA0' }}>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5" style={{ color: '#5FCEA0' }} />
                  <h4 style={{ color: '#015952' }}>Cost Reduction vs Budget Analysis</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentCost">Current Annual Cost ($) *</Label>
                    <Input
                      id="currentCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.currentCost || ''}
                      onChange={(e) => setFormData({ ...formData, currentCost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetCost">Target Annual Cost ($) *</Label>
                    <Input
                      id="targetCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.targetCost || ''}
                      onChange={(e) => setFormData({ ...formData, targetCost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Cost Reduction:</span>
                    <span className={`${formData.costReduction > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      ${formData.costReduction.toLocaleString()} ({formData.reductionPercentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(formData.reductionPercentage, 100)}%`,
                        background: 'linear-gradient(90deg, #5FCEA0 0%, #007B5F 100%)'
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="budget">Project Budget / Investment ($) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-600">
                    Budget needed to implement this cost reduction project
                  </p>
                </div>

                {formData.costReduction > 0 && formData.budget > 0 && (
                  <div className="mt-4 p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Net Savings (Annual):</span>
                      <span className={`${formData.costReduction > formData.budget ? 'text-green-600' : 'text-red-600'}`}>
                        ${(formData.costReduction - formData.budget).toLocaleString()}
                      </span>
                    </div>
                    {formData.costReduction > formData.budget && (
                      <div className="flex items-center gap-2 mt-2 text-green-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm">Positive ROI - Cost reduction exceeds budget ✓</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedROI">Expected ROI & Payback Period *</Label>
                <Input
                  id="expectedROI"
                  value={formData.expectedROI}
                  onChange={(e) => setFormData({ ...formData, expectedROI: e.target.value })}
                  placeholder="e.g., 200% ROI with 6 months payback period"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetCompletionDate">Target Completion *</Label>
                  <Input
                    id="targetCompletionDate"
                    type="date"
                    value={formData.targetCompletionDate}
                    onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit" style={{ background: 'linear-gradient(135deg, #7FED84 0%, #5FCEA0 100%)' }}>
                  Submit CRP
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}