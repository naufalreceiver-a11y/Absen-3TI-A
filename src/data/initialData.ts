import { Course, Student, AttendanceRecord } from '../types';

export const STUDENTS: Student[] = [
  { id: "255520001", name: "ACHMAD FADILAH RIZQI" },
  { id: "255520002", name: "AHMAD SYA'RONI" },
  { id: "255520004", name: "ALI AL HUSAINI" },
  { id: "255520006", name: "ANANDA DWI SAPUTRA" },
  { id: "255520008", name: "ANINDHITA AULIA PUTRI" },
  { id: "255520009", name: "AZKA HAIKAL FUADI" },
  { id: "255520010", name: "BURHANUDIN" },
  { id: "255520011", name: "DWI YOVI HAIDAR" },
  { id: "255520013", name: "FARHAN ABDULLOH" },
  { id: "255520018", name: "MESA GAINSWARA" },
  { id: "255520022", name: "MUHAMMAD SYAFIQ LUBABUL FIKRI" },
  { id: "255520023", name: "MUHAMMAD TALU" },
  { id: "255520024", name: "MUHAMMAD YUSRON SAIFUL JAMIL" },
  { id: "255520025", name: "MUZADID THOLIB" },
  { id: "255520027", name: "NAUFAL NUR IKHSAN" },
  { id: "255520031", name: "SANGADAH" },
  { id: "255520032", name: "SIVA RESTIANA" },
  { id: "255520034", name: "ULYVIA OKTAVIANI PAJRIAH GUNTARI" },
  { id: "255520038", name: "MUHAMMAD FAATIH FIKRUSSYIFA" },
  { id: "255520045", name: "ALAN TIO WAHYUDIN" },
  { id: "255520056", name: "KHOERUL UMAM" }
];

export const COURSES: Course[] = [
  { code: "K552210", name: "Sistem Terdistribusi", lecturer: "Ahmad Latif, M.Kom.", sks: 3, jadwal: "Jum'at, 07.30 - 09.30" },
  { code: "KU18110", name: "Islamic Studies", lecturer: "Amri Yahya, M.Ag.", sks: 3, jadwal: "Jum'at, 09.30 - 11.30" },
  { code: "K552215", name: "Rekayasa Perangkat Lunak", lecturer: "Beny Riswanto, M.Kom.", sks: 3, jadwal: "Kamis, 08.00 - 10.00" },
  { code: "K552112", name: "Jaringan Komputer", lecturer: "Slamet Cahyo, M.Kom.", sks: 3, jadwal: "Kamis, 10.00 - 12.00" },
  { code: "K552205", name: "Pemrograman Web", lecturer: "Andika Tri, M.Kom.", sks: 3, jadwal: "Selasa, 08.00 - 10.00" },
  { code: "K552203", name: "Aljabar Linier", lecturer: "Fadilah Istiqomah, M.Pd.", sks: 3, jadwal: "Selasa, 10.00 - 12.00" },
  { code: "KU22103", name: "Pendidikan Pancasila", lecturer: "Edi Astar, M.H.", sks: 3, jadwal: "Senin, 09.30 - 11.30" },
  { code: "K552311", name: "Multimedia", lecturer: "Kusnana, M.Kom.", sks: 3, jadwal: "Senin, 07.30 - 09.30" }
];

export const SAMPLE_INITIAL_RECORDS: AttendanceRecord[] = [
  // Sample meeting 1 for Pemrograman Web
  ...STUDENTS.map((s, idx) => ({
    id: s.id,
    name: s.name,
    courseCode: "K552205",
    courseName: "Pemrograman Web",
    lecturer: "Andika Tri, M.Kom.",
    meeting: "1",
    date: "2026-09-08",
    type: "Offline" as const,
    status: idx === 4 ? ("Izin" as const) : idx === 8 ? ("Sakit" as const) : ("Hadir" as const),
    material: "Pengenalan Ekosistem Web Modern, HTML5, dan Arsitektur Komponen.",
    timeIn: "08:00",
    timeOut: "10:00",
    timestamp: 1725757200000
  })),
  // Sample meeting 1 for Jaringan Komputer
  ...STUDENTS.map((s, idx) => ({
    id: s.id,
    name: s.name,
    courseCode: "K552112",
    courseName: "Jaringan Komputer",
    lecturer: "Slamet Cahyo, M.Kom.",
    meeting: "1",
    date: "2026-09-10",
    type: "Offline" as const,
    status: idx === 11 ? ("Alpha" as const) : ("Hadir" as const),
    material: "Dasar Topologi Jaringan & Pengalamatan IP Subnetting.",
    timeIn: "10:00",
    timeOut: "12:00",
    timestamp: 1725937200000
  }))
];
