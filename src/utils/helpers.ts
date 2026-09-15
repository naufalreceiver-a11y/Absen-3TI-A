import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord, Course, Student } from '../types';

export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getStatusBadgeClasses(status: string) {
  switch (status) {
    case 'Hadir':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    case 'Izin':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
    case 'Sakit':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
    case 'Alpha':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20';
  }
}

export function generateSessionPDF(records: AttendanceRecord[]) {
  if (!records || records.length === 0) return;

  const r = records[0];
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const formattedDate = formatDateIndo(r.date);

  // Header banner / title
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(14, 12, 182, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR HADIR PERKULIAHAN KELAS 3TI-A', 105, 21, { align: 'center' });

  // Information details
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');

  const startY = 32;
  const col1 = 16;
  const col2 = 110;
  const lineHeight = 5.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Mata Kuliah', col1, startY);
  doc.text('Dosen Pengampu', col1, startY + lineHeight);
  doc.text('Pertemuan Ke', col1, startY + lineHeight * 2);

  doc.text('Hari & Tanggal', col2, startY);
  doc.text('Jenis Pertemuan', col2, startY + lineHeight);
  doc.text('Waktu / Jam', col2, startY + lineHeight * 2);

  doc.setFont('helvetica', 'normal');
  doc.text(`: ${r.courseName}`, col1 + 28, startY);
  doc.text(`: ${r.lecturer}`, col1 + 28, startY + lineHeight);
  doc.text(`: Ke-${r.meeting}`, col1 + 28, startY + lineHeight * 2);

  doc.text(`: ${formattedDate}`, col2 + 28, startY);
  doc.text(`: ${r.type}`, col2 + 28, startY + lineHeight);
  const timeStr = r.type === 'Online' ? 'Sesuai Jadwal' : `${r.timeIn || '-'} s/d ${r.timeOut || '-'}`;
  doc.text(`: ${timeStr}`, col2 + 28, startY + lineHeight * 2);

  doc.setFont('helvetica', 'bold');
  doc.text('Pokok Bahasan/Materi:', col1, startY + lineHeight * 3.3);
  doc.setFont('helvetica', 'normal');
  doc.text(r.material || 'Tidak ada catatan materi khusus', col1 + 40, startY + lineHeight * 3.3, {
    maxWidth: 140,
  });

  // Table Data
  let countH = 0;
  let countI = 0;
  let countS = 0;
  let countA = 0;
  const listI: string[] = [];
  const listS: string[] = [];
  const listA: string[] = [];

  const tableBody = records.map((st, idx) => {
    const formattedName = toTitleCase(st.name);
    if (st.status === 'Hadir') countH++;
    else if (st.status === 'Izin') {
      countI++;
      listI.push(formattedName);
    } else if (st.status === 'Sakit') {
      countS++;
      listS.push(formattedName);
    } else if (st.status === 'Alpha') {
      countA++;
      listA.push(formattedName);
    }

    return [
      String(idx + 1),
      st.id,
      formattedName,
      st.status,
      st.status === 'Hadir' ? '✓' : st.status.charAt(0)
    ];
  });

  autoTable(doc, {
    startY: startY + lineHeight * 4.8,
    margin: { left: 14, right: 14 },
    head: [['No', 'NIM', 'Nama Mahasiswa', 'Status Kehadiran', 'Ket']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 9,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 28 },
      2: { cellWidth: 85 },
      3: { halign: 'center', cellWidth: 35 },
      4: { halign: 'center', cellWidth: 15 },
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Summary box
  doc.setFillColor(241, 245, 249);
  doc.rect(14, finalY, 182, 10, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Rekapitulasi:  Total Mahasiswa: ${records.length}  |  Hadir: ${countH}  |  Izin: ${countI}  |  Sakit: ${countS}  |  Alpha: ${countA}`,
    18,
    finalY + 6.5
  );

  let noteY = finalY + 14;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const izinText = `Izin: ${listI.length > 0 ? listI.join(', ') : '-'}`;
  const sakitText = `Sakit: ${listS.length > 0 ? listS.join(', ') : '-'}`;
  const alphaText = `Alpha: ${listA.length > 0 ? listA.join(', ') : '-'}`;

  doc.text(alphaText, 16, noteY, { maxWidth: 55 });
  doc.text(izinText, 76, noteY, { maxWidth: 55 });
  doc.text(sakitText, 136, noteY, { maxWidth: 55 });

  // Signatures
  const sigY = noteY + 16;
  doc.text('Mengetahui / Mengesahkan,', 135, sigY);
  doc.text('Dosen Pengampu Mata Kuliah,', 135, sigY + 4);
  doc.setFont('helvetica', 'bold');
  doc.text(`(${r.lecturer})`, 135, sigY + 22);

  doc.save(`Absensi_${r.courseName.replace(/\s+/g, '_')}_P${r.meeting}.pdf`);
}

export function generateFullRecapPDF(course: Course, students: Student[], records: AttendanceRecord[]) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Title
  doc.setFillColor(30, 58, 138);
  doc.rect(14, 10, 269, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`REKAPITULASI PRESENSI MAHASISWA KELAS 3TI-A`, 148, 17.5, { align: 'center' });

  // Course info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mata Kuliah : ${course.name} (${course.code})`, 14, 28);
  doc.text(`Dosen : ${course.lecturer}`, 14, 33);
  doc.text(`Bobot SKS : ${course.sks} SKS | Jadwal: ${course.jadwal}`, 140, 28);
  doc.text(`Tanggal Cetak : ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`, 140, 33);

  // Table Data
  const meetings = Array.from({ length: 16 }, (_, i) => `P${i + 1}`);
  const head = [['No', 'NIM', 'Nama Mahasiswa', ...meetings, 'H', 'I', 'S', 'A', '%']];

  const body = students.map((s, idx) => {
    const row: (string | number)[] = [idx + 1, s.id, toTitleCase(s.name)];
    let h = 0;
    let iCount = 0;
    let sCount = 0;
    let aCount = 0;
    let totalRecorded = 0;

    for (let m = 1; m <= 16; m++) {
      const rec = records.find(r => r.id === s.id && r.courseCode === course.code && String(r.meeting) === String(m));
      if (rec) {
        totalRecorded++;
        if (rec.status === 'Hadir') {
          h++;
          row.push('H');
        } else if (rec.status === 'Izin') {
          iCount++;
          row.push('I');
        } else if (rec.status === 'Sakit') {
          sCount++;
          row.push('S');
        } else if (rec.status === 'Alpha') {
          aCount++;
          row.push('A');
        }
      } else {
        row.push('-');
      }
    }

    const percentage = totalRecorded > 0 ? Math.round((h / totalRecorded) * 100) : 0;
    row.push(h, iCount, sCount, aCount, `${percentage}%`);
    return row;
  });

  autoTable(doc, {
    startY: 37,
    head,
    body,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      halign: 'center',
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 22 },
      2: { halign: 'left', cellWidth: 52 },
      // Meetings P1..P16 are indexed 3 to 18
      19: { fontStyle: 'bold', fillColor: [240, 253, 244] }, // H
      20: { fillColor: [254, 252, 232] }, // I
      21: { fillColor: [239, 246, 255] }, // S
      22: { fillColor: [255, 241, 242] }, // A
      23: { fontStyle: 'bold' }, // %
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(8);
  doc.text('* Keterangan: H = Hadir, I = Izin, S = Sakit, A = Alpha / Tanpa Keterangan', 14, finalY);

  doc.save(`Rekapitulasi_Presensi_${course.name.replace(/\s+/g, '_')}.pdf`);
}
