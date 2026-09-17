import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Material } from '../types';
import { sound } from '../utils/audio';
import { BookOpen, Sparkles, Check, Info } from 'lucide-react';

interface MaterialModalProps {
  material: Material;
  onClose: () => void;
  playerName?: string;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({ material, onClose, playerName }) => {
  const [fractionSlices, setFractionSlices] = useState<number>(1);

  const handleUnderstand = () => {
    sound.playBonus();
    onClose();
  };

  const renderIllustration = () => {
    switch (material.illustrationType) {
      case 'fractions':
        return (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-amber-300">Visualisasi Pecahan Interaktif:</span>
            <div className="flex items-center gap-6">
              {/* Visual Pizza / Pie */}
              <div className="relative w-28 h-28 rounded-full border-4 border-amber-400 bg-amber-200/80 overflow-hidden shadow-lg flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-rose-500 origin-center transition-all duration-300"
                  style={{
                    clipPath:
                      fractionSlices === 1
                        ? 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' // 1/4
                        : fractionSlices === 2
                        ? 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' // 2/4 = 1/2
                        : fractionSlices === 3
                        ? 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)' // 3/4
                        : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' // 4/4
                  }}
                />
                <div className="relative z-10 w-8 h-8 rounded-full bg-slate-900/90 text-white font-black text-xs flex items-center justify-center shadow">
                  {fractionSlices}/4
                </div>
              </div>

              {/* Control slider or buttons */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-300">Pilih Bagian:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => {
                        setFractionSlices(num);
                        sound.playPop();
                      }}
                      className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
                        fractionSlices === num
                          ? 'bg-rose-500 text-white shadow-lg border border-rose-300 scale-105'
                          : 'bg-white/10 border border-white/20 text-slate-200 hover:bg-white/20'
                      }`}
                    >
                      {num}/4
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-300 font-medium">
                  {fractionSlices === 1 && 'Satu per empat (1/4 pizza)'}
                  {fractionSlices === 2 && 'Dua per empat = Setengah (1/2 pizza)'}
                  {fractionSlices === 3 && 'Tiga per empat (3/4 pizza)'}
                  {fractionSlices === 4 && 'Empat per empat = 1 Pizza Utuh'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'shapes':
        return (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center gap-1.5 p-2 bg-white/5 border border-white/10 rounded-xl shadow-xs">
              <div className="w-12 h-12 rounded-full bg-sky-500/80 border-2 border-white/40 flex items-center justify-center text-white font-bold shadow-inner">
                🔵
              </div>
              <span className="text-xs font-bold text-white">Lingkaran</span>
              <span className="text-[10px] text-slate-300">1 sisi melengkung</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 bg-white/5 border border-white/10 rounded-xl shadow-xs">
              <div className="w-12 h-12 bg-amber-500/80 border-2 border-white/40 flex items-center justify-center text-white font-bold rounded-lg shadow-inner">
                🟦
              </div>
              <span className="text-xs font-bold text-white">Persegi</span>
              <span className="text-[10px] text-slate-300">4 sisi sama panjang</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 bg-white/5 border border-white/10 rounded-xl shadow-xs">
              <div
                className="w-12 h-12 bg-rose-500/80 border-2 border-white/40 flex items-center justify-center text-white font-bold shadow-inner"
                style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
              />
              <span className="text-xs font-bold text-white">Segitiga</span>
              <span className="text-[10px] text-slate-300">3 sisi & 3 sudut</span>
            </div>
          </div>
        );

      case 'clock':
        return (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 flex items-center justify-center gap-6">
            <div className="relative w-24 h-24 rounded-full bg-slate-900 border-4 border-emerald-400 flex items-center justify-center shadow-lg">
              <span className="absolute top-1 text-[10px] font-black text-slate-200">12</span>
              <span className="absolute right-1 text-[10px] font-black text-slate-200">3</span>
              <span className="absolute bottom-1 text-[10px] font-black text-slate-200">6</span>
              <span className="absolute left-1 text-[10px] font-black text-slate-200">9</span>
              {/* Short Hand (hour) */}
              <div className="absolute w-1.5 h-6 bg-white top-6 rounded-full origin-bottom rotate-90" />
              {/* Long Hand (minute) */}
              <div className="absolute w-1 h-9 bg-rose-400 top-3 rounded-full origin-bottom" />
              <div className="w-3 h-3 rounded-full bg-amber-400 z-10" />
            </div>
            <div className="text-xs text-slate-200 flex flex-col gap-1">
              <span className="font-bold text-emerald-300 text-sm">Pukul 03.00</span>
              <span>• Jarum Pendek = Menunjuk JAM</span>
              <span>• Jarum Panjang = Menunjuk MENIT</span>
              <span className="font-semibold text-emerald-300">1 Jam = 60 Menit</span>
            </div>
          </div>
        );

      case 'multiplication_grid':
        return (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-purple-300">Ilustrasi 3 Baris × 4 Kolom:</span>
            <div className="grid grid-cols-4 gap-1.5 p-2 bg-white/5 rounded-xl shadow-xs border border-white/15">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs border border-white/20"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <span className="text-xs text-purple-200 font-bold">
              3 × 4 = 4 + 4 + 4 = 12 Kotak Total
            </span>
          </div>
        );

      default:
        return (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/40 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
              💡
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              Materi dan konsep ini sangat bermanfaat serta sering digunakan dalam kehidupan sehari-hari!
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="w-full max-w-lg bg-slate-900/85 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh] text-white"
      >
        {/* Header Banner */}
        <div className="p-5 bg-gradient-to-r from-teal-500/90 via-emerald-500/90 to-teal-600/90 backdrop-blur-md text-white flex items-center gap-4 border-b border-white/20">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner shrink-0 border border-white/30">
            📚
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full font-extrabold backdrop-blur-xs">
                Kelas {material.classLevel}
              </span>
              {material.boxNumber && (
                <span className="text-xs bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-black">
                  Kotak {material.boxNumber}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-1 leading-tight">{material.title}</h2>
            <p className="text-xs text-white/90 font-medium">{material.topic}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4">
          {/* Visual Illustration */}
          {renderIllustration()}

          {/* Explanation Text */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
            <h4 className="text-sm font-bold text-teal-300 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-300" />
              <span>Penjelasan Materi:</span>
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {material.explanation}
            </p>
          </div>

          {/* Example Box */}
          <div className="bg-amber-500/15 backdrop-blur-xl rounded-2xl p-4 border border-amber-400/30">
            <h4 className="text-sm font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Contoh & Cara Menghitung:</span>
            </h4>
            <p className="text-xs sm:text-sm text-amber-100 font-medium whitespace-pre-line leading-relaxed">
              {material.example}
            </p>
          </div>

          {/* Understand Button */}
          <button
            id="btn-understand-material"
            onClick={handleUnderstand}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-teal-600/90 backdrop-blur-xl border border-white/30 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 cursor-pointer shadow-xl shadow-emerald-950/50 transition-all"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>AKU MENGERTI! (+5 POIN)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
