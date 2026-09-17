import React from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/audio';
import { StorageService } from '../services/storage';
import { StudentProfile } from '../types';
import { StudentHeaderBadge } from './StudentHeaderBadge';
import {
  Play,
  BookOpen,
  Brain,
  Trophy,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck
} from 'lucide-react';

interface MainMenuProps {
  onStartPlay: () => void;
  onOpenMaterials: () => void;
  onOpenQuestions: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  currentStudent: StudentProfile | null;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartPlay,
  onOpenMaterials,
  onOpenQuestions,
  onOpenAchievements,
  onOpenSettings,
  onOpenAdmin,
  onOpenAuthModal,
  onLogout,
  currentStudent
}) => {
  const stats = StorageService.getStats();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
      {/* Decorative floating background glow and emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-2/3 left-1/3 w-64 h-64 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute -top-10 -left-10 text-8xl opacity-20 select-none"
        >
          🎲
        </motion.div>
        <motion.div
          animate={{ y: [0, 25, 0], rotate: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute top-1/4 -right-8 text-8xl opacity-20 select-none"
        >
          🪜
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute bottom-10 -left-6 text-8xl opacity-20 select-none"
        >
          🐍
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
          className="absolute -bottom-10 right-10 text-8xl opacity-15 select-none"
        >
          ⭐
        </motion.div>
      </div>

      {/* Top Bar: Student Profile Badge, Quick Stats & Settings */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between gap-2">
        <StudentHeaderBadge
          onOpenAuthModal={onOpenAuthModal}
          onLogout={onLogout}
        />

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 shadow-lg">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-xs font-black text-slate-200">
              Skor Terbaik: <span className="text-amber-300 font-extrabold">{stats.highestScore} Pts</span>
            </span>
          </div>

          <button
            id="btn-menu-settings"
            onClick={() => {
              sound.playPop();
              onOpenSettings();
            }}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl shadow-lg text-slate-200 hover:text-white transition-all cursor-pointer"
            title="Pengaturan"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero / Logo & Mascot Section */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-6">
        {/* Animated Cute Mascots in Glass Pods */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-3xl sm:text-5xl shadow-2xl border border-white/30 select-none"
          >
            👦
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-18 h-18 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-400/80 via-orange-400/80 to-amber-500/80 backdrop-blur-xl flex items-center justify-center text-4xl sm:text-6xl shadow-2xl border-2 border-white/40 select-none z-10"
          >
            🎲
          </motion.div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, delay: 0.3, ease: 'easeInOut' }}
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-3xl sm:text-5xl shadow-2xl border border-white/30 select-none"
          >
            👧
          </motion.div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest bg-white/15 backdrop-blur-md text-amber-300 px-4 py-1.5 rounded-full border border-white/25 shadow-lg mb-3">
            Game Edukasi SD Kelas 1-6
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
            <span className="text-amber-400">ULAR</span> <span className="text-teal-300">TANGGA</span>
          </h1>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-rose-300 tracking-wider mt-1 drop-shadow-md">
            INTERAKTIF
          </h2>
          <p className="text-sm sm:text-lg font-bold text-slate-200 mt-2 max-w-md drop-shadow-xs">
            "Belajar Asyik & Bermain Jadi Lebih Seru!"
          </p>

          {/* Student Status Callout */}
          {currentStudent ? (
            <div className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-bold backdrop-blur-md shadow-md">
              <span className="text-base">{currentStudent.avatar}</span>
              <span>
                Halo, <span className="text-white font-black">{currentStudent.name}</span>! Siap kumpulkan medali hari ini?
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playPop();
                onOpenAuthModal();
              }}
              className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-bold backdrop-blur-md shadow-md cursor-pointer transition-all hover:scale-102"
            >
              <span>⭐</span>
              <span>Tips: Masuk akun nama siswa agar prestasimu tersimpan otomatis!</span>
            </button>
          )}
        </motion.div>

        {/* Action Menu Buttons Container (Glass Card) */}
        <div className="flex flex-col gap-3 w-full max-w-sm sm:max-w-md mt-6 sm:mt-8 p-4 sm:p-5 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
          {/* 1. PLAY BUTTON */}
          <motion.button
            id="btn-main-play"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sound.playPop();
              onStartPlay();
            }}
            className="w-full py-4.5 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-emerald-600/90 backdrop-blur-xl text-white font-black text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/40 hover:brightness-110 cursor-pointer border border-white/30 transition-all"
          >
            <Play className="w-7 h-7 fill-current" />
            <span>MULAI BERMAIN 🚀</span>
          </motion.button>

          {/* 2. Secondary 2x2 Grid Buttons */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              id="btn-main-materials"
              onClick={() => {
                sound.playPop();
                onOpenMaterials();
              }}
              className="p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-lg text-white font-bold text-xs sm:text-sm flex flex-col items-center gap-1.5 shadow-lg hover:border-teal-300/60 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/30 border border-teal-400/40 flex items-center justify-center text-teal-200 text-xl shadow-inner">
                📚
              </div>
              <span className="font-black text-teal-100">Pojok Materi</span>
            </button>

            <button
              id="btn-main-questions"
              onClick={() => {
                sound.playPop();
                onOpenQuestions();
              }}
              className="p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-lg text-white font-bold text-xs sm:text-sm flex flex-col items-center gap-1.5 shadow-lg hover:border-amber-300/60 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-200 text-xl shadow-inner">
                🧠
              </div>
              <span className="font-black text-amber-100">Latihan Soal</span>
            </button>

            <button
              id="btn-main-achievements"
              onClick={() => {
                sound.playPop();
                onOpenAchievements();
              }}
              className="p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-lg text-white font-bold text-xs sm:text-sm flex flex-col items-center gap-1.5 shadow-lg hover:border-yellow-300/60 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-yellow-500/30 border border-yellow-400/40 flex items-center justify-center text-yellow-200 text-xl shadow-inner">
                🏆
              </div>
              <span className="font-black text-yellow-100">Prestasi & Medali</span>
            </button>

            <button
              id="btn-main-admin"
              onClick={() => {
                sound.playPop();
                onOpenAdmin();
              }}
              className="p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-lg text-white font-bold text-xs sm:text-sm flex flex-col items-center gap-1.5 shadow-lg hover:border-purple-300/60 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-200 text-xl shadow-inner">
                👨‍🏫
              </div>
              <span className="font-black text-purple-100">Panel Guru / Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer tagline */}
      <footer className="relative z-10 text-center text-xs text-slate-300 font-semibold py-2">
        Game Edukasi Interaktif Ramah Anak SD • Berbagai Mata Pelajaran & Terstruktur
      </footer>
    </div>
  );
};
