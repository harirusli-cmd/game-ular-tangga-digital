import React, { useState } from 'react';
import { Material, ClassLevel } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../utils/audio';
import { MaterialModal } from './MaterialModal';
import { ArrowLeft, BookOpen, Sparkles, Filter, Search } from 'lucide-react';

interface MaterialsHubProps {
  onBackToMenu: () => void;
}

export const MaterialsHub: React.FC<MaterialsHubProps> = ({ onBackToMenu }) => {
  const [selectedGrade, setSelectedGrade] = useState<ClassLevel>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const materials = StorageService.getMaterials().filter(m => m.active);

  const filtered = materials.filter(m => {
    const matchGrade = m.classLevel === selectedGrade;
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGrade && matchSearch;
  });

  return (
    <div className="min-h-screen relative text-slate-100 pb-16">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-30 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => {
              sound.playPop();
              onBackToMenu();
            }}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold flex items-center gap-2 cursor-pointer text-sm backdrop-blur-md transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Menu Utama</span>
          </button>

          <div className="text-center">
            <h1 className="text-lg sm:text-2xl font-black text-white flex items-center justify-center gap-2">
              <span>📚 Pojok Belajar & Eksplorasi Materi</span>
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Pilih kelas dan pelajari materi pelajaran dengan mudah!
            </p>
          </div>

          <div className="w-16" />
        </div>

        {/* Grade tabs */}
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map(grade => (
            <button
              key={grade}
              onClick={() => {
                sound.playPop();
                setSelectedGrade(grade as ClassLevel);
              }}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer backdrop-blur-md border ${
                selectedGrade === grade
                  ? 'bg-teal-500/80 border-teal-300 text-white shadow-lg scale-105'
                  : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/20'
              }`}
            >
              Kelas {grade} SD
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 relative z-10">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Cari materi di Kelas ${selectedGrade}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-300 shadow-lg"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(mat => (
            <div
              key={mat.id}
              onClick={() => {
                sound.playPop();
                setSelectedMaterial(mat);
              }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-lg hover:shadow-2xl hover:bg-white/15 hover:border-teal-300/60 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group text-white"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-teal-500/30 border border-teal-400/40 text-teal-200 backdrop-blur-md">
                    Kelas {mat.classLevel}
                  </span>
                  <span className="text-xl group-hover:scale-125 transition-transform">
                    {mat.illustrationType === 'fractions'
                      ? '🍕'
                      : mat.illustrationType === 'shapes'
                      ? '🔷'
                      : mat.illustrationType === 'clock'
                      ? '⏰'
                      : mat.illustrationType === 'multiplication_grid'
                      ? '🔢'
                      : '💡'}
                  </span>
                </div>

                <h3 className="text-base font-black text-white leading-snug group-hover:text-teal-200 transition-colors">
                  {mat.title}
                </h3>
                <span className="text-xs font-bold text-amber-300 block mt-0.5">{mat.topic}</span>

                <p className="text-xs text-slate-200 mt-2.5 line-clamp-3 leading-relaxed font-medium">
                  {mat.explanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-black text-teal-300">
                <span>Buka Materi</span>
                <span className="group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 text-center border border-dashed border-white/20 text-white">
            <span className="text-4xl block mb-2">🔍</span>
            <h3 className="text-base font-bold text-slate-200">Belum ada materi yang sesuai pencarian</h3>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain atau ganti pilihan kelas.</p>
          </div>
        )}
      </main>

      {/* Selected Material Modal */}
      {selectedMaterial && (
        <MaterialModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} />
      )}
    </div>
  );
};
