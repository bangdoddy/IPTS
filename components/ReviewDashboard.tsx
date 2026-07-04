import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Submission {
  id: number;
  employeeName: string;
  department: string;
  ideaTitle: string;
  description: string;
  supervisorName: string;
  supervisorApproval: string;
  approvalDate: string;
  beforeImage: string;
  afterImage: string;
  submittedDate: string;
  status: string;
  qualityScore: number | null;
  reviewNotes: string;
}

interface ReviewDashboardProps {
  submissions: Submission[];
  onReview: (id: number, status: string, qualityScore: number, reviewNotes: string) => void;
}

export function ReviewDashboard({ submissions, onReview }: ReviewDashboardProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewForm, setReviewForm] = useState({
    qualityScore: 0,
    reviewNotes: '',
    status: 'pending'
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleReviewSubmit = () => {
    if (selectedSubmission) {
      onReview(
        selectedSubmission.id,
        reviewForm.status,
        reviewForm.qualityScore,
        reviewForm.reviewNotes
      );
      setIsDialogOpen(false);
      setReviewForm({ qualityScore: 0, reviewNotes: '', status: 'pending' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Ditolak</Badge>;
      case 'adjustment':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Perlu Penyesuaian</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRewardTier = (score: number) => {
    if (score >= 90) return { tier: 'Platinum', color: 'text-purple-600' };
    if (score >= 80) return { tier: 'Gold', color: 'text-yellow-600' };
    if (score >= 70) return { tier: 'Silver', color: 'text-gray-600' };
    if (score >= 60) return { tier: 'Bronze', color: 'text-amber-700' };
    return { tier: '-', color: 'text-gray-400' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Review PDCA Officer / BPI Division</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-yellow-900 mt-1">{submissions.filter(s => s.status === 'pending').length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Disetujui</p>
              <p className="text-green-900 mt-1">{submissions.filter(s => s.status === 'approved').length}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Perlu Penyesuaian</p>
              <p className="text-orange-900 mt-1">{submissions.filter(s => s.status === 'adjustment').length}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Ditolak</p>
              <p className="text-red-900 mt-1">{submissions.filter(s => s.status === 'rejected').length}</p>
            </div>
          </div>

          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-gray-900">{submission.ideaTitle}</h4>
                      {getStatusBadge(submission.status)}
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span>Karyawan: {submission.employeeName}</span>
                      <span>Dept: {submission.department}</span>
                      <span>Diajukan: {submission.submittedDate}</span>
                    </div>
                  </div>
                  <Dialog open={isDialogOpen && selectedSubmission?.id === submission.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setReviewForm({
                            qualityScore: submission.qualityScore || 0,
                            reviewNotes: submission.reviewNotes || '',
                            status: submission.status
                          });
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Review Ide Perbaikan</DialogTitle>
                        <DialogDescription>
                          Evaluasi kualitas ide dan berikan penilaian
                        </DialogDescription>
                      </DialogHeader>

                      {selectedSubmission && (
                        <div className="space-y-6">
                          {/* Submission Details */}
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Karyawan:</span>
                                <p className="text-gray-900">{selectedSubmission.employeeName}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Departemen:</span>
                                <p className="text-gray-900">{selectedSubmission.department}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Atasan:</span>
                                <p className="text-gray-900">{selectedSubmission.supervisorName}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Tanggal Persetujuan:</span>
                                <p className="text-gray-900">{selectedSubmission.approvalDate}</p>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 text-sm">Deskripsi:</span>
                              <p className="text-gray-900 mt-1">{selectedSubmission.description}</p>
                            </div>
                          </div>

                          {/* Documentation */}
                          <div>
                            <h4 className="text-gray-900 mb-3">Dokumentasi</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm mb-2 block">Sebelum Perbaikan</Label>
                                <ImageWithFallback
                                  src={selectedSubmission.beforeImage}
                                  alt="Sebelum"
                                  className="w-full h-64 object-cover rounded-lg border"
                                />
                              </div>
                              <div>
                                <Label className="text-sm mb-2 block">Sesudah Perbaikan</Label>
                                <ImageWithFallback
                                  src={selectedSubmission.afterImage}
                                  alt="Sesudah"
                                  className="w-full h-64 object-cover rounded-lg border"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Review Form */}
                          <div className="border-t pt-4 space-y-4">
                            <h4 className="text-gray-900">Penilaian PDCA Officer / BPI Division</h4>
                            
                            <div className="space-y-2">
                              <Label htmlFor="qualityScore">Skor Kualitas (0-100)</Label>
                              <Input
                                id="qualityScore"
                                type="number"
                                min="0"
                                max="100"
                                value={reviewForm.qualityScore}
                                onChange={(e) => setReviewForm({ ...reviewForm, qualityScore: parseInt(e.target.value) || 0 })}
                                placeholder="Masukkan skor kualitas"
                              />
                              {reviewForm.qualityScore > 0 && (
                                <p className="text-sm text-gray-600">
                                  Reward Tier: <span className={getRewardTier(reviewForm.qualityScore).color}>
                                    {getRewardTier(reviewForm.qualityScore).tier}
                                  </span>
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="reviewNotes">Catatan Review</Label>
                              <Textarea
                                id="reviewNotes"
                                value={reviewForm.reviewNotes}
                                onChange={(e) => setReviewForm({ ...reviewForm, reviewNotes: e.target.value })}
                                placeholder="Berikan feedback dan catatan untuk karyawan"
                                rows={3}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Keputusan Review</Label>
                              <div className="flex gap-3">
                                <Button
                                  type="button"
                                  variant={reviewForm.status === 'approved' ? 'default' : 'outline'}
                                  className={reviewForm.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                                  onClick={() => setReviewForm({ ...reviewForm, status: 'approved' })}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Setujui
                                </Button>
                                <Button
                                  type="button"
                                  variant={reviewForm.status === 'adjustment' ? 'default' : 'outline'}
                                  className={reviewForm.status === 'adjustment' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                                  onClick={() => setReviewForm({ ...reviewForm, status: 'adjustment' })}
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Perlu Penyesuaian
                                </Button>
                                <Button
                                  type="button"
                                  variant={reviewForm.status === 'rejected' ? 'default' : 'outline'}
                                  className={reviewForm.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                                  onClick={() => setReviewForm({ ...reviewForm, status: 'rejected' })}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Tolak (Duplikat)
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                              </Button>
                              <Button 
                                onClick={handleReviewSubmit}
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={reviewForm.status === 'pending'}
                              >
                                Simpan Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                {submission.qualityScore !== null && (
                  <div className="flex items-center gap-4 text-sm mt-3 pt-3 border-t">
                    <span className="text-gray-600">Skor Kualitas: <span className="text-gray-900">{submission.qualityScore}/100</span></span>
                    <span className="text-gray-600">Reward: <span className={getRewardTier(submission.qualityScore).color}>
                      {getRewardTier(submission.qualityScore).tier}
                    </span></span>
                    {submission.reviewNotes && (
                      <span className="text-gray-600">Catatan: {submission.reviewNotes}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
