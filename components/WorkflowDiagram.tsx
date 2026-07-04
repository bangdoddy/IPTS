import { CheckCircle, XCircle, AlertCircle, ArrowRight, FileText, UserCheck, ClipboardCheck, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function WorkflowDiagram() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alur Proses Ide Perbaikan Karyawan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-900 mb-2">1. Karyawan Mengajukan Ide Perbaikan</h3>
                <p className="text-gray-600 mb-2">Karyawan menyampaikan ide perbaikan dengan detail:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  <li>Judul dan deskripsi ide</li>
                  <li>Dokumentasi foto SEBELUM perbaikan</li>
                  <li>Dokumentasi foto SESUDAH perbaikan</li>
                  <li>Persetujuan dari atasan langsung</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="bg-white border-2 border-green-200 rounded-lg p-4">
                <h3 className="text-green-900 mb-2">2. Persetujuan Atasan</h3>
                <p className="text-gray-600 text-sm">
                  Atasan langsung mereview dan menyetujui ide perbaikan sebelum dilanjutkan ke tahap review PDCA
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
                <h3 className="text-purple-900 mb-2">3. Review oleh PDCA Officer / BPI Division</h3>
                <p className="text-gray-600 mb-2">Penilaian kualitas dan evaluasi ide meliputi:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  <li>Kualitas ide (skor 0-100)</li>
                  <li>Originalitas ide</li>
                  <li>Dampak terhadap perbaikan</li>
                  <li>Kelengkapan dokumentasi</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Decision Point */}
          <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-6">
            <h3 className="text-yellow-900 mb-4 text-center">Hasil Review</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Rejected - Duplicate */}
              <div className="bg-white border-2 border-red-200 rounded-lg p-4 text-center">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h4 className="text-red-900 mb-1">DITOLAK</h4>
                <p className="text-sm text-gray-600">Ide sama dengan yang sudah ada sebelumnya</p>
              </div>

              {/* Need Adjustment */}
              <div className="bg-white border-2 border-orange-200 rounded-lg p-4 text-center">
                <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h4 className="text-orange-900 mb-1">PERLU PENYESUAIAN</h4>
                <p className="text-sm text-gray-600">Kembali ke karyawan untuk diperbaiki</p>
              </div>

              {/* Approved */}
              <div className="bg-white border-2 border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="text-green-900 mb-1">DISETUJUI</h4>
                <p className="text-sm text-gray-600">Lanjut ke proses pemberian reward</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="bg-white border-2 border-amber-200 rounded-lg p-4">
                <h3 className="text-amber-900 mb-2">4. Pemberian Reward</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Ide yang disetujui akan mendapatkan reward berdasarkan skor kualitas:
                </p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  <li>Skor 90-100: Reward Platinum</li>
                  <li>Skor 80-89: Reward Gold</li>
                  <li>Skor 70-79: Reward Silver</li>
                  <li>Skor 60-69: Reward Bronze</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
