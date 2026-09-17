import React from 'react';
import { StorageService } from '../services/storage';
import { sound } from '../utils/audio';
import { User, LogOut, Star, Sparkles, Award } from 'lucide-react';

interface StudentHeaderBadgeProps {
  onOpenAuthModal: () => void;
  onLogout?: () => void;
  compact?: boolean;
}

export const StudentHeaderBadge: React.FC<StudentHeaderBadgeProps> = ({
  onOpenAuthModal,
  onLogout,
  compact = false
}) => {
  const currentStudent = StorageService.getCurrentStudent();

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    StorageService.logoutStudent();
    if (onLogout) {
      onLogout();
    }
  };

  if (!currentStudent) {
    return (
      <button
        id="btn-student-login-prompt"
        onClick={() => {
          sound.playPop();
          onOpenAuthModal();
        }}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-teal-500/20 hover:from-amber-500/30 hover:to-teal-500/30 border border-amber-300/40 backdrop-blur-xl shadow-lg shadow-amber-950/20 text-white font-bold text-xs sm:text-sm cursor-pointer transition-all hover:scale-102 active:scale-98"
        title="Masuk dengan Nama Siswa untuk Menyimpan Prestasi"
      >
        <span className="text-base">👋</span>
        <span className="text-amber-200 font-black">Masuk Akun Siswa</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
      </button>
    );
  }

  const unlockedMedals = currentStudent.achievements.filter(a => a.unlocked).length;

  return (
    <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-1 pr-2 shadow-lg transition-all">
      <button
        onClick={() => {
          sound.playPop();
          onOpenAuthModal();
        }}
        className="flex items-center gap-2 pl-1 pr-2 py-0.5 cursor-pointer text-left group"
        title="Klik untuk melihat profil / ganti akun"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-base sm:text-lg shadow-inner group-hover:scale-110 transition-transform">
          {currentStudent.avatar}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-white group-hover:text-teal-200 transition-colors leading-tight max-w-[100px] sm:max-w-[140px] truncate">
            {currentStudent.name}
          </span>
          {!compact && (
            <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1">
              <span>🏆 {unlockedMedals} Medali</span>
              <span className="text-white/40">•</span>
              <span>⭐ {currentStudent.stats.highestScore} Pts</span>
            </span>
          )}
        </div>
      </button>

      {/* Direct Logout Button */}
      <button
        id="btn-student-logout"
        onClick={handleLogoutClick}
        className="p-1.5 rounded-xl hover:bg-rose-500/25 text-slate-300 hover:text-rose-200 transition-colors cursor-pointer border border-transparent hover:border-rose-400/30"
        title="Keluar dari akun (Log Out)"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
