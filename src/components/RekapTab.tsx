import React, { useState } from 'react';
import { TableProperties, UserCheck, Download, Search, CheckCircle, Clock, AlertCircle, XCircle, BarChart3 } from 'lucide-react';
import { Course, Student, AttendanceRecord } from '../types';
import { toTitleCase, generateFullRecapPDF, formatDateIndo } from '../utils/helpers';

interface RekapTabProps {
  students: Student[];
  courses: Course[];
  records: AttendanceRecord[];
}

export const RekapTab: React.FC<RekapTabProps> = ({
  students,
  courses,
  records,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'matkul' | 'mhs'>('matkul');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(courses[0]?.code ?? '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id ?? '');

  const currentCourse = courses.find(c => c.code === selectedCourseCode) || courses[0];
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Helper for status cell color in the matrix
  const getMatrixCell = (status?: string) => {
    if (!status) return <span className="text-slate-300">-</span>;
    switch (status) {
      case 'Hadir':
        return <span className="text-emerald-700 font-bold">H</span>;
      case 'Izin':
        return <span className="text-amber-700 font-bold">I</span>;
      case 'Sakit':
        return <span className="text-blue-700 font-bold">S</span>;
      case 'Alpha':
        return <span className="text-rose-700 font-bold">A</span>;
      default:
        return <span className="text-slate-400">{status.charAt(0)}</span>;
    }
  };

  // Student specific history
  const studentRecords = records
    .filter(r => r.id === selectedStudentId && (!selectedCourseCode || r.courseCode === selectedCourseCode))
    .sort((a, b) => Number(a.meeting) - Number(b.meeting));

  const totalStudentEntries = studentRecords.length;
  const studentHadir = studentRecords.filter(r => r.status === 'Hadir').length;
  const studentIzin = studentRecords.filter(r => r.status === 'Izin').length;
  const studentSakit = studentRecords.filter(r => r.status === 'Sakit').length;
  const studentAlpha = studentRecords.filter(r => r.status === 'Alpha').length;
  const studentRate = totalStudentEntries > 0 ? Math.round((studentHadir / totalStudentEntries) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Sub tabs selector */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('matkul')}
            className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'matkul'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>Rekap per Mata Kuliah</span>
          </button>
          <button
            onClick={() => setActiveSubTab('mhs')}
            className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'mhs'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Rekap per Mahasiswa</span>
          </button>
        </div>

        {activeSubTab === 'matkul' && currentCourse && (
          <button
            id="btn-pdf-rekap"
            onClick={() => generateFullRecapPDF(currentCourse, students, records)}
            className="bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Rekap PDF (16 Pertemuan)</span>
          </button>
        )}
      </div>

      {/* Subtab 1: Rekap Matkul */}
      {activeSubTab === 'matkul' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="w-full sm:w-80">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  Pilih Mata Kuliah
                </label>
                <select
                  value={selectedCourseCode}
                  onChange={e => setSelectedCourseCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  {courses.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {currentCourse && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div>
                    <span className="font-semibold text-slate-700">Dosen:</span> {currentCourse.lecturer}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">SKS:</span> {currentCourse.sks} SKS
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Jadwal:</span> {currentCourse.jadwal}
                  </div>
                </div>
              )}
            </div>

            {/* Matrix Table */}
            <div id="matkul-table" className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-white font-semibold">
                  <tr>
                    <th className="p-2.5 text-center w-10 border-r border-slate-700">No</th>
                    <th className="p-2.5 w-24 border-r border-slate-700">NIM</th>
                    <th className="p-2.5 w-56 border-r border-slate-700">Nama Mahasiswa</th>
                    {Array.from({ length: 16 }, (_, i) => (
                      <th key={i} className="p-2 text-center w-7 border-r border-slate-700">
                        P{i + 1}
                      </th>
                    ))}
                    <th className="p-2 text-center w-8 bg-emerald-800 text-emerald-100 border-r border-slate-700" title="Total Hadir">H</th>
                    <th className="p-2 text-center w-8 bg-amber-800 text-amber-100 border-r border-slate-700" title="Total Izin">I</th>
                    <th className="p-2 text-center w-8 bg-blue-800 text-blue-100 border-r border-slate-700" title="Total Sakit">S</th>
                    <th className="p-2 text-center w-8 bg-rose-800 text-rose-100 border-r border-slate-700" title="Total Alpha">A</th>
                    <th className="p-2 text-center w-12 bg-slate-800 text-slate-100" title="Persentase Kehadiran">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((s, idx) => {
                    let hadir = 0;
                    let izin = 0;
                    let sakit = 0;
                    let alpha = 0;
                    let totalMeetingRecorded = 0;

                    const meetingCells = Array.from({ length: 16 }, (_, i) => {
                      const meetingNum = String(i + 1);
                      const rec = records.find(
                        r =>
                          r.id === s.id &&
                          r.courseCode === selectedCourseCode &&
                          String(r.meeting) === meetingNum
                      );

                      if (rec) {
                        totalMeetingRecorded++;
                        if (rec.status === 'Hadir') hadir++;
                        else if (rec.status === 'Izin') izin++;
                        else if (rec.status === 'Sakit') sakit++;
                        else if (rec.status === 'Alpha') alpha++;
                      }

                      return (
                        <td
                          key={i}
                          className={`p-2 text-center border-r border-slate-200 text-[11px] ${
                            rec?.status === 'Hadir'
                              ? 'bg-emerald-50/60'
                              : rec?.status === 'Izin'
                              ? 'bg-amber-50/60'
                              : rec?.status === 'Sakit'
                              ? 'bg-blue-50/60'
                              : rec?.status === 'Alpha'
                              ? 'bg-rose-50/60'
                              : ''
                          }`}
                        >
                          {getMatrixCell(rec?.status)}
                        </td>
                      );
                    });

                    const percentage = totalMeetingRecorded > 0 ? Math.round((hadir / totalMeetingRecorded) * 100) : 0;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-2.5 text-center text-slate-500 border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-mono font-medium text-slate-700 border-r border-slate-200">
                          {s.id}
                        </td>
                        <td className="p-2.5 font-medium text-slate-800 border-r border-slate-200 whitespace-nowrap">
                          {toTitleCase(s.name)}
                        </td>
                        {meetingCells}
                        <td className="p-2 text-center font-bold text-emerald-700 bg-emerald-50/50 border-r border-slate-200">
                          {hadir}
                        </td>
                        <td className="p-2 text-center font-semibold text-amber-700 bg-amber-50/50 border-r border-slate-200">
                          {izin}
                        </td>
                        <td className="p-2 text-center font-semibold text-blue-700 bg-blue-50/50 border-r border-slate-200">
                          {sakit}
                        </td>
                        <td className="p-2 text-center font-semibold text-rose-700 bg-rose-50/50 border-r border-slate-200">
                          {alpha}
                        </td>
                        <td className="p-2 text-center font-bold text-slate-800 bg-slate-50">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              percentage >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : percentage >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Keterangan:</span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> H = Hadir
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> I = Izin
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> S = Sakit
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span> A = Alpha
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Rekap Mahasiswa */}
      {activeSubTab === 'mhs' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-700">
                  Pilih Mahasiswa
                </label>
                <select
                  id="srch-student"
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id} - {toTitleCase(s.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-700">
                  Pilih Mata Kuliah
                </label>
                <select
                  id="srch-course"
                  value={selectedCourseCode}
                  onChange={e => setSelectedCourseCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Semua Mata Kuliah</option>
                  {courses.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student card overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold text-slate-500">{currentStudent?.id}</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {toTitleCase(currentStudent?.name || '')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mata Kuliah: {selectedCourseCode ? currentCourse?.name : 'Semua Mata Kuliah'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">{studentRate}%</div>
                  <div className="text-xs text-slate-500">Persentase Hadir</div>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <span className="text-emerald-700 font-semibold">Hadir: {studentHadir}</span>
                  <span className="text-amber-700 font-semibold">Izin: {studentIzin}</span>
                  <span className="text-blue-700 font-semibold">Sakit: {studentSakit}</span>
                  <span className="text-rose-700 font-semibold">Alpha: {studentAlpha}</span>
                </div>
              </div>
            </div>

            {/* Meeting Timeline list */}
            <div id="mhs-result" className="space-y-2 mt-4">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Riwayat Kehadiran Pertemuan
              </h4>
              {studentRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
                  Belum ada catatan presensi untuk mahasiswa ini pada mata kuliah yang dipilih.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
                  {studentRecords.map((r, i) => (
                    <div key={i} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-800">
                            Pertemuan {r.meeting}
                          </span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-xs font-medium text-slate-700">
                            {r.courseName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatDateIndo(r.date)} {r.timeIn ? `(${r.timeIn} - ${r.timeOut})` : `(${r.type})`}
                        </p>
                        {r.material && (
                          <p className="text-xs text-slate-600 italic line-clamp-1">
                            Materi: {r.material}
                          </p>
                        )}
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            r.status === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'Izin'
                              ? 'bg-amber-100 text-amber-800'
                              : r.status === 'Sakit'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
