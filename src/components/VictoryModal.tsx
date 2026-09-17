import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Player, StudentProfile } from '../types';
import { sound } from '../utils/audio';
import { StorageService } from '../services/storage';
import { Trophy, Star, CheckCircle, RotateCcw, Home, BookOpen, Sparkles, Award } from 'lucide-react';

interface VictoryModalProps {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  onGoHome: () => void;
  onGoMaterials: () => void;
  currentStudent?: StudentProfile | null;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  players,
  onPlayAgain,
  onGoHome,
  onGoMaterials,
  currentStudent: passedStudent
}) => {
  const currentStudent = passedStudent || StorageService.getCurrentStudent();

  useEffect(() => {
    sound.playVictory();

    // Fire fireworks confetti
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 }
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const unlockedCount = currentStudent
    ? currentStudent.achievements.filter(a => a.unlocked).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/85 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col text-center text-white"
      >
        {/* Top Celebration Header */}
        <div className="p-6 bg-gradient-to-b from-amber-500/90 via-orange-500/90 to-amber-500/90 backdrop-blur-md text-white flex flex-col items-center border-b border-white/20">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner border-2 border-white/40 mb-3"
          >
            🏆
          </motion.div>

          <span className="text-xs uppercase font-extrabold tracking-widest bg-white/20 border border-white/30 px-3 py-0.5 rounded-full">
            PERMAINAN SELESAI
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">SELAMAT!</h2>
          <p className="text-sm font-semibold text-white/95 mt-1">
            <span className="underline font-black">{winner.name}</span> berhasil mencapai Kotak 100! 🎉
          </p>
        </div>

        {/* Match Statistics Card */}
        <div className="p-6 flex flex-col gap-4">
          {/* Student Account Saved Callout */}
          {currentStudent && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 flex items-center justify-between text-left backdrop-blur-md shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{currentStudent.avatar}</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                    Pencapaian Tersimpan ke Akun:
                  </span>
                  <span className="text-sm font-black text-white">{currentStudent.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-300 block">
                  🏆 {unlockedCount} Medali
                </span>
                <span className="text-[10px] text-slate-300 font-semibold">Tersimpan Aman</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3.5 border border-white/15 flex flex-col items-center">
              <Star className="w-6 h-6 text-amber-400 mb-1" />
              <span className="text-xs text-slate-300 font-semibold">Total Skor</span>
              <span className="text-xl font-black text-amber-300">{winner.score} Poin</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3.5 border border-white/15 flex flex-col items-center">
              <CheckCircle className="w-6 h-6 text-emerald-400 mb-1" />
              <span className="text-xs text-slate-300 font-semibold">Soal Dijawab Benar</span>
              <span className="text-xl font-black text-emerald-300">
                {winner.correctAnswersCount} Soal
              </span>
            </div>
          </div>

          {/* 2-Player Summary table if multiplayer */}
          {players.length > 1 && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-3 border border-white/10 text-left">
              <span className="text-xs font-bold text-slate-300 uppercase px-1">Peringkat Pemain:</span>
              <div className="flex flex-col gap-1.5 mt-2">
                {[...players]
                  .sort((a, b) => b.score - a.score || b.position - a.position)
                  .map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/10 border border-white/15 text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-amber-300">#{idx + 1}</span>
                        <span>{p.character.avatar}</span>
                        <span className="text-xs font-bold text-slate-100">{p.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-200">
                        {p.score} Poin (Kotak {p.position})
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 mt-2">
            <button
              id="btn-play-again"
              onClick={onPlayAgain}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-emerald-600/90 backdrop-blur-xl border border-white/30 text-white font-black text-base flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 cursor-pointer shadow-xl shadow-emerald-950/50"
            >
              <RotateCcw className="w-5 h-5" />
              <span>MAIN LAGI</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-victory-materials"
                onClick={onGoMaterials}
                className="py-3 rounded-xl border border-teal-400/30 bg-teal-500/20 text-teal-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-teal-500/30 active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <BookOpen className="w-4 h-4" />
                <span>Pelajari Materi</span>
              </button>

              <button
                id="btn-victory-home"
                onClick={onGoHome}
                className="py-3 rounded-xl border border-white/20 bg-white/10 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-white/20 active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <Home className="w-4 h-4" />
                <span>Menu Utama</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
