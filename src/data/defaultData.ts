import { Material, Question, BoardConfig, PlayerCharacter, Achievement } from '../types';

export const DEFAULT_CHARACTERS: PlayerCharacter[] = [
  {
    id: 'budi',
    name: 'Budi si Penjelajah',
    avatar: '👦',
    color: '#2563eb',
    bgGradient: 'from-blue-500 to-indigo-600',
    shadowColor: 'rgba(37, 99, 235, 0.4)',
    quote: 'Siap menjelajah angka dan berpetualang!'
  },
  {
    id: 'siti',
    name: 'Siti si Juara',
    avatar: '👧',
    color: '#db2777',
    bgGradient: 'from-pink-500 to-rose-600',
    shadowColor: 'rgba(219, 39, 119, 0.4)',
    quote: 'Belajar itu asyik dan menyenangkan!'
  },
  {
    id: 'robo',
    name: 'Robo-Hitung',
    avatar: '🤖',
    color: '#7c3aed',
    bgGradient: 'from-purple-500 to-violet-600',
    shadowColor: 'rgba(124, 58, 237, 0.4)',
    quote: 'Bip bop! Kalkulasi cepat siap menang!'
  },
  {
    id: 'miko',
    name: 'Kucing Miko',
    avatar: '🐱',
    color: '#ea580c',
    bgGradient: 'from-amber-500 to-orange-600',
    shadowColor: 'rgba(234, 88, 12, 0.4)',
    quote: 'Meow! Lompat tinggi hindari ular nakal!'
  },
  {
    id: 'leo',
    name: 'Singa Leo',
    avatar: '🦁',
    color: '#16a34a',
    bgGradient: 'from-emerald-500 to-green-600',
    shadowColor: 'rgba(22, 163, 74, 0.4)',
    quote: 'Berani hadapi semua tantangan hitungan!'
  },
  {
    id: 'dino',
    name: 'Dino Cerdas',
    avatar: '🦖',
    color: '#0d9488',
    bgGradient: 'from-teal-500 to-emerald-600',
    shadowColor: 'rgba(13, 148, 136, 0.4)',
    quote: 'Rawr! Semangat belajar sampai kotak 100!'
  }
];

export const DEFAULT_MATERIALS: Material[] = [
  // Kelas 1
  {
    id: 'mat_k1_1',
    classLevel: 1,
    topic: 'Penjumlahan & Pengurangan Dasar',
    title: 'Menghitung Benda Sekitar',
    explanation: 'Penjumlahan artinya menggabungkan dua kelompok benda menjadi satu jumlah yang lebih banyak (+). Pengurangan artinya mengambil sebagian benda sehingga jumlahnya berkurang (-).',
    example: '🍎🍎 + 🍎🍎🍎 = 5 Apel. Jika ada 5 permen dimakan 2, tersisa 5 - 2 = 3 permen.',
    illustrationType: 'counting',
    boxNumber: 7,
    active: true
  },
  {
    id: 'mat_k1_2',
    classLevel: 1,
    topic: 'Mengenal Bentuk Bangun Datar',
    title: 'Bentuk di Sekitar Kita',
    explanation: 'Lingkaran berbentuk bulat seperti roda atau donat. Persegi memiliki 4 sisi yang sama panjang seperti jendela. Segitiga memiliki 3 sisi seperti potongan pizza.',
    example: '🔵 Lingkaran | 🟦 Persegi (4 sisi sama) | 🔺 Segitiga (3 sudut)',
    illustrationType: 'shapes',
    boxNumber: 15,
    active: true
  },

  // Kelas 2
  {
    id: 'mat_k2_1',
    classLevel: 2,
    topic: 'Perkalian Dasar',
    title: 'Perkalian sebagai Penjumlahan Berulang',
    explanation: 'Perkalian adalah cara cepat menjumlahkan angka yang sama berulang kali. Contohnya 3 × 4 artinya angka 4 dijumlahkan sebanyak 3 kali (4 + 4 + 4).',
    example: '3 × 4 = 4 + 4 + 4 = 12. Jadi, 3 kotak berisi 4 donat sama dengan 12 donat.',
    illustrationType: 'multiplication_grid',
    boxNumber: 22,
    active: true
  },
  {
    id: 'mat_k2_2',
    classLevel: 2,
    topic: 'Mengenal Waktu dan Jam',
    title: 'Membaca Jam Analog',
    explanation: 'Jarum pendek menunjukkan JAM, sedangkan jarum panjang menunjukkan MENIT. Jika jarum pendek di angka 3 dan jarum panjang di angka 12, artinya pukul 03.00.',
    example: '1 Jam = 60 Menit. Pukul 07.30 artinya jam 7 lebih tiga puluh menit (setengah 8).',
    illustrationType: 'clock',
    boxNumber: 35,
    active: true
  },
  {
    id: 'mat_k2_3',
    classLevel: 2,
    topic: 'Mengenal Nilai Mata Uang',
    title: 'Uang Rupiah',
    explanation: 'Uang digunakan untuk jual beli. Nilai uang bisa digabungkan untuk membayar barang.',
    example: 'Rp 2.000 + Rp 1.000 + Rp 1.000 = Rp 4.000. Dua lembar seribuan bernilai sama dengan satu lembar dua ribuan.',
    illustrationType: 'money',
    boxNumber: 42,
    active: true
  },

  // Kelas 3
  {
    id: 'mat_k3_1',
    classLevel: 3,
    topic: 'Pecahan Sederhana',
    title: 'Mengenal Pecahan Pizza',
    explanation: 'Pecahan menunjukkan bagian dari keseluruhan yang utuh. Angka atas disebut PEMBILANG (bagian yang diambil) dan angka bawah disebut PENYEBUT (total seluruh bagian).',
    example: '🍕 1 loyang pizza dipotong jadi 4 bagian sama besar. Jika kamu makan 1 potong, kamu memakan 1/4 (satu per empat) bagian pizza.',
    illustrationType: 'fractions',
    boxNumber: 47,
    active: true
  },
  {
    id: 'mat_k3_2',
    classLevel: 3,
    topic: 'Pembagian Dasar',
    title: 'Pembagian sebagai Pengurangan Berulang',
    explanation: 'Pembagian adalah membagi sejumlah benda secara adil sampai habis. Contoh 12 ÷ 3 artinya 12 dikurangi 3 terus menerus sampai 0 (sebanyak 4 kali).',
    example: '12 ÷ 3 = 4 (karena 12 - 3 - 3 - 3 - 3 = 0). Ada 12 permen dibagi ke 3 teman, masing-masing dapat 4 permen.',
    illustrationType: 'counting',
    boxNumber: 55,
    active: true
  },

  // Kelas 4
  {
    id: 'mat_k4_1',
    classLevel: 4,
    topic: 'Keliling & Luas Bangun Datar',
    title: 'Keliling dan Luas Persegi & Persegi Panjang',
    explanation: 'Keliling adalah jumlah seluruh panjang sisi luar. Luas adalah besarnya daerah di dalam bangun datar.',
    example: 'Persegi sisi 5 cm → Keliling = 4 × 5 = 20 cm. Luas = 5 × 5 = 25 cm².\nPersegi Panjang (p=6, l=4) → Luas = 6 × 4 = 24 cm².',
    illustrationType: 'shapes',
    boxNumber: 66,
    active: true
  },
  {
    id: 'mat_k4_2',
    classLevel: 4,
    topic: 'KPK dan FPB',
    title: 'Faktor dan Kelipatan Bilangan',
    explanation: 'Kelipatan adalah hasil kali bilangan dengan bilangan asli (Kelipatan 3: 3, 6, 9, 12, ...). KPK adalah kelipatan terkecil yang sama. FPB adalah faktor terbesar yang sama.',
    example: 'KPK dari 4 dan 6 adalah 12. FPB dari 12 dan 18 adalah 6.',
    illustrationType: 'generic',
    boxNumber: 74,
    active: true
  },

  // Kelas 5
  {
    id: 'mat_k5_1',
    classLevel: 5,
    topic: 'Pecahan & Desimal & Persen',
    title: 'Mengubah Bentuk Pecahan',
    explanation: 'Pecahan biasa dapat diubah ke bentuk desimal dan persen (per seratus). 1/2 sama nilainya dengan 0,5 dan 50%.',
    example: '1/4 = 25/100 = 0,25 = 25%\n3/4 = 75/100 = 0,75 = 75%\n1/2 = 50/100 = 0,50 = 50%',
    illustrationType: 'fractions',
    boxNumber: 82,
    active: true
  },
  {
    id: 'mat_k5_2',
    classLevel: 5,
    topic: 'Volume Bangun Ruang',
    title: 'Volume Kubus dan Balok',
    explanation: 'Volume menyatakan isi ruangan di dalam bangun 3 dimensi. Volume kubus dihitung dari rusuk × rusuk × rusuk (s³). Volume balok = panjang × lebar × tinggi.',
    example: 'Kubus dengan panjang rusuk 4 cm: Volume = 4 × 4 × 4 = 64 cm³.\nBalok (p=5, l=3, t=2): Volume = 5 × 3 × 2 = 30 cm³.',
    illustrationType: 'volume',
    boxNumber: 89,
    active: true
  },

  // Kelas 6
  {
    id: 'mat_k6_1',
    classLevel: 6,
    topic: 'Operasi Bilangan Bulat Negatif',
    title: 'Bilangan Positif dan Negatif',
    explanation: 'Bilangan negatif berada di sebelah kiri angka 0 pada garis bilangan. Mengurangi bilangan negatif sama dengan menjumlahkan bilangan positif: a - (-b) = a + b.',
    example: 'Suhu -5°C naik 8°C menjadi: -5 + 8 = 3°C.\n7 - (-3) = 7 + 3 = 10.',
    illustrationType: 'generic',
    boxNumber: 94,
    active: true
  }
];

export const DEFAULT_QUESTIONS: Question[] = [
  // KELAS 1
  {
    id: 'q_k1_01',
    classLevel: 1,
    topic: 'Penjumlahan',
    question: 'Berapakah hasil dari 5 + 4 = ?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '8' },
      { id: 'b', text: '9' },
      { id: 'c', text: '10' },
      { id: 'd', text: '7' }
    ],
    correctAnswer: 'b',
    explanation: '5 ditambah 4 sama dengan 9 (5, 6, 7, 8, 9).',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k1_02',
    classLevel: 1,
    topic: 'Pengurangan',
    question: 'Ibu membeli 9 buah jeruk. Dimakan adik 3 buah. Berapa sisa jeruk ibu?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '5 buah' },
      { id: 'b', text: '6 buah' },
      { id: 'c', text: '7 buah' },
      { id: 'd', text: '4 buah' }
    ],
    correctAnswer: 'b',
    explanation: '9 jeruk dikurangi 3 jeruk yang dimakan = 9 - 3 = 6 buah.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k1_03',
    classLevel: 1,
    topic: 'Membandingkan Bilangan',
    question: 'Manakah tanda yang tepat untuk membandingkan: 8 ... 12 ?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '< (lebih kecil)' },
      { id: 'b', text: '> (lebih besar)' },
      { id: 'c', text: '= (sama dengan)' },
      { id: 'd', text: 'Semua salah' }
    ],
    correctAnswer: 'a',
    explanation: 'Angka 8 lebih kecil dari 12, maka tandanya adalah < (8 < 12).',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k1_04',
    classLevel: 1,
    topic: 'Bentuk Bangun Datar',
    question: 'Sebuah koin uang dan roda sepeda berbentuk bangun datar ...',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Persegi' },
      { id: 'b', text: 'Segitiga' },
      { id: 'c', text: 'Lingkaran' },
      { id: 'd', text: 'Persegi Panjang' }
    ],
    correctAnswer: 'c',
    explanation: 'Koin uang dan roda berbentuk bulat melengkung tanpa sudut yaitu Lingkaran.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k1_05',
    classLevel: 1,
    topic: 'Penjumlahan',
    question: '6 + 7 = 13. Apakah pernyataan ini Benar atau Salah?',
    type: 'true_false',
    options: [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' }
    ],
    correctAnswer: 'true',
    explanation: 'Benar! 6 + 7 memang menghasilkan 13.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k1_06',
    classLevel: 1,
    topic: 'Pengurangan',
    question: 'Berapakah 15 - 8 ? (Ketik angka saja)',
    type: 'number_input',
    correctAnswer: '7',
    explanation: '15 - 8 = 7 karena 7 + 8 = 15.',
    difficulty: 'sedang',
    active: true
  },

  // KELAS 2
  {
    id: 'q_k2_01',
    classLevel: 2,
    topic: 'Perkalian Dasar',
    question: 'Berapakah hasil dari 4 × 5 = ?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '18' },
      { id: 'b', text: '20' },
      { id: 'c', text: '22' },
      { id: 'd', text: '25' }
    ],
    correctAnswer: 'b',
    explanation: '4 × 5 = 5 + 5 + 5 + 5 = 20.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k2_02',
    classLevel: 2,
    topic: 'Pembagian Dasar',
    question: 'Budi memiliki 18 kelereng dan ingin membagikannya kepada 3 temannya sama rata. Setiap teman mendapat berapa kelereng?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '5 kelereng' },
      { id: 'b', text: '6 kelereng' },
      { id: 'c', text: '7 kelereng' },
      { id: 'd', text: '9 kelereng' }
    ],
    correctAnswer: 'b',
    explanation: '18 ÷ 3 = 6 kelereng per teman (karena 3 × 6 = 18).',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k2_03',
    classLevel: 2,
    topic: 'Waktu dan Jam',
    question: 'Jarum pendek menunjuk angka 4, jarum panjang menunjuk angka 12. Pukul berapakah itu?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Pukul 12.04' },
      { id: 'b', text: 'Pukul 04.12' },
      { id: 'c', text: 'Pukul 04.00' },
      { id: 'd', text: 'Pukul 04.30' }
    ],
    correctAnswer: 'c',
    explanation: 'Jika jarum panjang tepat di angka 12, jam menunjukkan pukul bulat yaitu 04.00.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k2_04',
    classLevel: 2,
    topic: 'Uang Rupiah',
    question: 'Siti membeli pensil seharga Rp 3.500 dan buku seharga Rp 4.000. Berapa total belanjaan Siti?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Rp 6.500' },
      { id: 'b', text: 'Rp 7.000' },
      { id: 'c', text: 'Rp 7.500' },
      { id: 'd', text: 'Rp 8.000' }
    ],
    correctAnswer: 'c',
    explanation: 'Rp 3.500 + Rp 4.000 = Rp 7.500.',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k2_05',
    classLevel: 2,
    topic: 'Perkalian Dasar',
    question: 'Hasil dari 6 × 3 adalah 18. Benar atau Salah?',
    type: 'true_false',
    options: [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' }
    ],
    correctAnswer: 'true',
    explanation: 'Benar! 6 × 3 = 3 + 3 + 3 + 3 + 3 + 3 = 18.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k2_06',
    classLevel: 2,
    topic: 'Perkalian',
    question: 'Hitunglah 7 × 4 = ?',
    type: 'number_input',
    correctAnswer: '28',
    explanation: '7 × 4 = 28 (penjumlahan 4 sebanyak 7 kali).',
    difficulty: 'sedang',
    active: true
  },

  // KELAS 3
  {
    id: 'q_k3_01',
    classLevel: 3,
    topic: 'Perkalian & Pembagian',
    question: 'Berapakah hasil dari 7 × 8 = ?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '54' },
      { id: 'b', text: '56' },
      { id: 'c', text: '58' },
      { id: 'd', text: '64' }
    ],
    correctAnswer: 'b',
    explanation: '7 × 8 = 56 (karena 8 dikalikan 7 kali adalah 56).',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k3_02',
    classLevel: 3,
    topic: 'Pembagian',
    question: 'Berapakah 72 ÷ 9 = ?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '7' },
      { id: 'b', text: '8' },
      { id: 'c', text: '9' },
      { id: 'd', text: '6' }
    ],
    correctAnswer: 'b',
    explanation: '72 ÷ 9 = 8 karena 9 × 8 = 72.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k3_03',
    classLevel: 3,
    topic: 'Pecahan Sederhana',
    question: 'Sebuah semangka dipotong menjadi 8 bagian sama besar. Roni memakan 3 potong. Bagian semangka yang dimakan Roni adalah ...',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '3/8' },
      { id: 'b', text: '5/8' },
      { id: 'c', text: '1/3' },
      { id: 'd', text: '8/3' }
    ],
    correctAnswer: 'a',
    explanation: 'Roni memakan 3 bagian dari total 8 bagian, ditulis pecahan 3/8.',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k3_04',
    classLevel: 3,
    topic: 'Pengukuran Panjang',
    question: '3 meter sama dengan berapa sentimeter (cm)?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '30 cm' },
      { id: 'b', text: '300 cm' },
      { id: 'c', text: '3.000 cm' },
      { id: 'd', text: '30.000 cm' }
    ],
    correctAnswer: 'b',
    explanation: '1 meter = 100 cm, jadi 3 meter = 3 × 100 = 300 cm.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k3_05',
    classLevel: 3,
    topic: 'Pecahan',
    question: 'Pecahan 2/4 nilainya sama besar dengan 1/2. Benar atau Salah?',
    type: 'true_false',
    options: [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' }
    ],
    correctAnswer: 'true',
    explanation: 'Benar! Jika pembilang dan penyebut 2/4 sama-sama dibagi 2, hasilnya 1/2.',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k3_06',
    classLevel: 3,
    topic: 'Perkalian',
    question: 'Berapakah hasil dari 9 × 6 = ?',
    type: 'number_input',
    correctAnswer: '54',
    explanation: '9 × 6 = 54.',
    difficulty: 'sedang',
    active: true
  },

  // KELAS 4
  {
    id: 'q_k4_01',
    classLevel: 4,
    topic: 'Keliling & Luas',
    question: 'Sebuah persegi memiliki panjang sisi 9 cm. Berapakah luas persegi tersebut?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '36 cm²' },
      { id: 'b', text: '81 cm²' },
      { id: 'c', text: '72 cm²' },
      { id: 'd', text: '18 cm²' }
    ],
    correctAnswer: 'b',
    explanation: 'Luas persegi = sisi × sisi = 9 × 9 = 81 cm².',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k4_02',
    classLevel: 4,
    topic: 'KPK dan FPB',
    question: 'Berapakah Kelipatan Persekutuan Terkecil (KPK) dari 6 dan 8?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '12' },
      { id: 'b', text: '18' },
      { id: 'c', text: '24' },
      { id: 'd', text: '48' }
    ],
    correctAnswer: 'c',
    explanation: 'Kelipatan 6: 6, 12, 18, 24, 30... Kelipatan 8: 8, 16, 24, 32... Kelipatan terkecil yang sama adalah 24.',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k4_03',
    classLevel: 4,
    topic: 'Pecahan',
    question: 'Berapakah hasil dari 2/5 + 1/5 = ?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '3/10' },
      { id: 'b', text: '3/5' },
      { id: 'c', text: '2/5' },
      { id: 'd', text: '3/25' }
    ],
    correctAnswer: 'b',
    explanation: 'Karena penyebutnya sudah sama (5), cukup jumlahkan pembilangnya: 2 + 1 = 3, jadi 3/5.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k4_04',
    classLevel: 4,
    topic: 'Bangun Datar',
    question: 'Sebuah persegi panjang memiliki panjang 12 cm dan lebar 5 cm. Berapakah kelilingnya?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '60 cm' },
      { id: 'b', text: '34 cm' },
      { id: 'c', text: '17 cm' },
      { id: 'd', text: '48 cm' }
    ],
    correctAnswer: 'b',
    explanation: 'Keliling = 2 × (panjang + lebar) = 2 × (12 + 5) = 2 × 17 = 34 cm.',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k4_05',
    classLevel: 4,
    topic: 'Sudut',
    question: 'Besar sudut siku-siku adalah 90 derajat. Benar atau Salah?',
    type: 'true_false',
    options: [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' }
    ],
    correctAnswer: 'true',
    explanation: 'Benar! Sudut siku-siku selalu tepat berukuran 90°.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k4_06',
    classLevel: 4,
    topic: 'FPB',
    question: 'Berapakah FPB dari 15 dan 20?',
    type: 'number_input',
    correctAnswer: '5',
    explanation: 'Faktor 15: 1, 3, 5, 15. Faktor 20: 1, 2, 4, 5, 10, 20. Faktor persekutuan terbesar adalah 5.',
    difficulty: 'sedang',
    active: true
  },

  // KELAS 5
  {
    id: 'q_k5_01',
    classLevel: 5,
    topic: 'Pecahan dan Desimal',
    question: 'Bentuk desimal dari pecahan 3/4 adalah ...',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '0,34' },
      { id: 'b', text: '0,75' },
      { id: 'c', text: '0,50' },
      { id: 'd', text: '0,25' }
    ],
    correctAnswer: 'b',
    explanation: '3/4 = (3 × 25) / (4 × 25) = 75/100 = 0,75.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k5_02',
    classLevel: 5,
    topic: 'Persentase',
    question: 'Toko buku memberi diskon 20% untuk buku seharga Rp 50.000. Berapa besar potongan harganya?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Rp 5.000' },
      { id: 'b', text: 'Rp 10.000' },
      { id: 'c', text: 'Rp 15.000' },
      { id: 'd', text: 'Rp 20.000' }
    ],
    correctAnswer: 'b',
    explanation: 'Diskon = 20% × Rp 50.000 = (20/100) × 50.000 = Rp 10.000.',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k5_03',
    classLevel: 5,
    topic: 'Volume Bangun Ruang',
    question: 'Sebuah kubus memiliki rusuk 6 cm. Berapakah volume kubus tersebut?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '36 cm³' },
      { id: 'b', text: '144 cm³' },
      { id: 'c', text: '216 cm³' },
      { id: 'd', text: '180 cm³' }
    ],
    correctAnswer: 'c',
    explanation: 'Volume kubus = s × s × s = 6 × 6 × 6 = 216 cm³.',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k5_04',
    classLevel: 5,
    topic: 'Skala dan Denah',
    question: 'Jarak 1 cm pada peta berskala 1 : 100.000 mewakili jarak sebenarnya sejauh 1 km. Benar atau Salah?',
    type: 'true_false',
    options: [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' }
    ],
    correctAnswer: 'true',
    explanation: 'Benar! 100.000 cm = 1.000 m = 1 km.',
    difficulty: 'mudah',
    active: true
  },
  {
    id: 'q_k5_05',
    classLevel: 5,
    topic: 'Kecepatan dan Debit',
    question: 'Sebuah mobil melaju dengan kecepatan 60 km/jam selama 2 jam. Berapa total jarak yang ditempuh mobil tersebut (dalam km)?',
    type: 'number_input',
    correctAnswer: '120',
    explanation: 'Jarak = Kecepatan × Waktu = 60 km/jam × 2 jam = 120 km.',
    difficulty: 'sedang',
    active: true
  },

  // KELAS 6
  {
    id: 'q_k6_01',
    classLevel: 6,
    topic: 'Operasi Bilangan Bulat',
    question: 'Berapakah hasil dari (-15) + 23 - (-7) = ?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '15' },
      { id: 'c', text: '25' },
      { id: 'd', text: '31' }
    ],
    correctAnswer: 'b',
    explanation: '(-15) + 23 = 8. Lalu 8 - (-7) = 8 + 7 = 15.',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k6_02',
    classLevel: 6,
    topic: 'Lingkaran',
    question: 'Sebuah lingkaran memiliki diameter 14 cm. Berapakah luas lingkaran tersebut? (Gunakan π = 22/7)',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '44 cm²' },
      { id: 'b', text: '88 cm²' },
      { id: 'c', text: '154 cm²' },
      { id: 'd', text: '616 cm²' }
    ],
    correctAnswer: 'c',
    explanation: 'Jari-jari (r) = 14 / 2 = 7 cm. Luas = π × r² = (22/7) × 7 × 7 = 154 cm².',
    difficulty: 'sulit',
    active: true
  },
  {
    id: 'q_k6_03',
    classLevel: 6,
    topic: 'Perbandingan',
    question: 'Perbandingan uang Budi dan Siti adalah 3 : 5. Jika jumlah uang mereka Rp 80.000, berapakah uang Budi?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Rp 24.000' },
      { id: 'b', text: 'Rp 30.000' },
      { id: 'c', text: 'Rp 50.000' },
      { id: 'd', text: 'Rp 35.000' }
    ],
    correctAnswer: 'b',
    explanation: 'Total bagian = 3 + 5 = 8. Uang Budi = (3/8) × Rp 80.000 = Rp 30.000.',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k6_04',
    classLevel: 6,
    topic: 'Rata-Rata (Mean)',
    question: 'Nilai ulangan Dino adalah 80, 90, 70, dan 80. Berapakah nilai rata-ratanya?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '75' },
      { id: 'b', text: '80' },
      { id: 'c', text: '85' },
      { id: 'd', text: '90' }
    ],
    correctAnswer: 'b',
    explanation: 'Rata-rata = (80 + 90 + 70 + 80) ÷ 4 = 320 ÷ 4 = 80.',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k6_05',
    classLevel: 6,
    topic: 'Operasi Campuran',
    question: 'Hasil dari 25 + 5 × 4 adalah 120. Benar atau Salah?',
    type: 'true_false',
    options: [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' }
    ],
    correctAnswer: 'false',
    explanation: 'Salah! Perkalian harus dihitung duluan: (5 × 4 = 20), lalu 25 + 20 = 45 (bukan 120).',
    difficulty: 'sedang',
    active: true
  },
  {
    id: 'q_k6_06',
    classLevel: 6,
    topic: 'Operasi Hitung Campuran',
    question: 'Hitunglah: 50 - 6 × 7 = ?',
    type: 'number_input',
    correctAnswer: '8',
    explanation: 'Perkalian didahulukan: 6 × 7 = 42. Maka 50 - 42 = 8.',
    difficulty: 'sedang',
    active: true
  }
];

export const DEFAULT_BOARD_CONFIG: BoardConfig = {
  snakes: [
    { id: 's1', head: 98, tail: 78 },
    { id: 's2', head: 95, tail: 56 },
    { id: 's3', head: 88, tail: 24 },
    { id: 's4', head: 62, tail: 18 },
    { id: 's5', head: 48, tail: 26 },
    { id: 's6', head: 36, tail: 6 },
    { id: 's7', head: 32, tail: 10 }
  ],
  ladders: [
    { id: 'l1', start: 4, end: 25 },
    { id: 'l2', start: 9, end: 31 },
    { id: 'l3', start: 20, end: 38 },
    { id: 'l4', start: 28, end: 84 },
    { id: 'l5', start: 40, end: 59 },
    { id: 'l6', start: 51, end: 67 },
    { id: 'l7', start: 63, end: 81 },
    { id: 'l8', start: 71, end: 91 }
  ],
  specialTiles: [
    { boxNumber: 7, type: 'material', materialId: 'mat_k1_1' },
    { boxNumber: 15, type: 'material', materialId: 'mat_k1_2' },
    { boxNumber: 22, type: 'material', materialId: 'mat_k2_1' },
    { boxNumber: 35, type: 'material', materialId: 'mat_k2_2' },
    { boxNumber: 42, type: 'material', materialId: 'mat_k2_3' },
    { boxNumber: 47, type: 'material', materialId: 'mat_k3_1' },
    { boxNumber: 55, type: 'material', materialId: 'mat_k3_2' },
    { boxNumber: 66, type: 'material', materialId: 'mat_k4_1' },
    { boxNumber: 74, type: 'material', materialId: 'mat_k4_2' },
    { boxNumber: 82, type: 'material', materialId: 'mat_k5_1' },
    { boxNumber: 89, type: 'material', materialId: 'mat_k5_2' },
    { boxNumber: 94, type: 'material', materialId: 'mat_k6_1' },
    // Bonus tiles
    { boxNumber: 14, type: 'bonus', bonusPoints: 20, triviaText: 'Bintang Kejutan! Kamu mendapatkan bonus +20 Poin!' },
    { boxNumber: 50, type: 'bonus', bonusPoints: 25, triviaText: 'Setengah Perjalanan! Semangat terus, bonus +25 Poin!' },
    { boxNumber: 77, type: 'bonus', bonusPoints: 30, triviaText: 'Angka Keberuntungan 77! Bonus +30 Poin!' },
    // Trivia
    { boxNumber: 19, type: 'trivia', triviaText: 'Tahukah kamu? Angka 0 pertama kali ditemukan dan digunakan secara luas di India kuno.' },
    { boxNumber: 60, type: 'trivia', triviaText: 'Tahukah kamu? 1 Jam ada 60 Menit karena bangsa Babilonia kuno menggunakan basis angka 60.' }
  ]
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'Juara Ular Tangga',
    description: 'Capai kotak 100 dan menangkan permainan pertama kali',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'snake_tamer',
    title: 'Penakluk Ular',
    description: 'Jawab benar tantangan kepala ular sebanyak 3 kali',
    icon: '🐍',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'ladder_master',
    title: 'Master Tangga',
    description: 'Berhasil memanjat tangga dengan menjawab benar 3 kali',
    icon: '🪜',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'quiz_expert',
    title: '10 Soal Benar',
    description: 'Jawab total 10 soal tantangan kuis dengan benar',
    icon: '🧠',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'scholar',
    title: 'Rajin Belajar',
    description: 'Baca dan pelajari 5 kotak materi di papan',
    icon: '📚',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'high_scorer',
    title: 'Bintang Prestasi',
    description: 'Raih total skor 150 poin dalam satu permainan',
    icon: '⭐',
    unlocked: false,
    progress: 0,
    maxProgress: 150
  }
];
