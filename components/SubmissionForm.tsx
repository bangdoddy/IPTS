import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Upload, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SubmissionFormProps {
  onSubmit: (data: any) => void;
}

export function SubmissionForm({ onSubmit }: SubmissionFormProps) {
  const [formData, setFormData] = useState({
    employeeName: '',
    department: '',
    ideaTitle: '',
    description: '',
    supervisorName: '',
    supervisorApproval: 'Approved',
    approvalDate: '',
    beforeImage: '',
    afterImage: '',
    submittedDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    qualityScore: null,
    reviewNotes: ''
  });

  const [beforePreview, setBeforePreview] = useState('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400');
  const [afterPreview, setAfterPreview] = useState('https://images.unsplash.com/photo-1552664730-d307ca884978?w=400');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      beforeImage: beforePreview,
      afterImage: afterPreview
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        employeeName: '',
        department: '',
        ideaTitle: '',
        description: '',
        supervisorName: '',
        supervisorApproval: 'Approved',
        approvalDate: '',
        beforeImage: '',
        afterImage: '',
        submittedDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        qualityScore: null,
        reviewNotes: ''
      });
    }, 2000);
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-green-900 mb-2">Ide Berhasil Diajukan!</h3>
            <p className="text-gray-600">Ide Anda akan segera direview oleh PDCA Officer/BPI Division</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Pengajuan Ide Perbaikan</CardTitle>
        <CardDescription>
          Lengkapi form berikut dengan detail ide perbaikan Anda beserta dokumentasi sebelum dan sesudah
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Nama Karyawan *</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departemen *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Contoh: Produksi, Quality Control"
                required
              />
            </div>
          </div>

          {/* Idea Details */}
          <div className="space-y-2">
            <Label htmlFor="ideaTitle">Judul Ide Perbaikan *</Label>
            <Input
              id="ideaTitle"
              value={formData.ideaTitle}
              onChange={(e) => setFormData({ ...formData, ideaTitle: e.target.value })}
              placeholder="Berikan judul singkat untuk ide Anda"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Detail Perbaikan *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan detail ide perbaikan, masalah yang diselesaikan, dan manfaat yang didapat"
              rows={4}
              required
            />
          </div>

          {/* Supervisor Approval */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <h4 className="text-green-900 mb-3 text-sm sm:text-base">Persetujuan Atasan</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supervisorName">Nama Atasan *</Label>
                <Input
                  id="supervisorName"
                  value={formData.supervisorName}
                  onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                  placeholder="Nama atasan yang menyetujui"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvalDate">Tanggal Persetujuan *</Label>
                <Input
                  id="approvalDate"
                  type="date"
                  value={formData.approvalDate}
                  onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Documentation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h4 className="text-blue-900 mb-3 text-sm sm:text-base">Dokumentasi Foto *</h4>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Before Image */}
              <div className="space-y-2">
                <Label className="text-sm">Foto SEBELUM Perbaikan</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-center">
                  <ImageWithFallback
                    src={beforePreview}
                    alt="Sebelum perbaikan"
                    className="w-full h-32 sm:h-48 object-cover rounded mb-3"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="text-xs sm:text-sm">Upload Foto</span>
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG (Max 5MB)</p>
                </div>
              </div>

              {/* After Image */}
              <div className="space-y-2">
                <Label className="text-sm">Foto SESUDAH Perbaikan</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-center">
                  <ImageWithFallback
                    src={afterPreview}
                    alt="Sesudah perbaikan"
                    className="w-full h-32 sm:h-48 object-cover rounded mb-3"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="text-xs sm:text-sm">Upload Foto</span>
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG (Max 5MB)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto">
              Simpan Draft
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" size="sm">
              Ajukan Ide Perbaikan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
