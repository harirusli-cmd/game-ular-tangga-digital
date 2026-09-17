import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { sound } from '../utils/audio';
import { StudentProfile } from '../types';
import { StudentHeaderBadge } from './StudentHeaderBadge';
import {
  ArrowLeft,
  Trophy,
  Star,
  Award,
  Lock,
  CheckCircle2,
  Calendar,
  History,
  Target,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface AchievementsHubProps {
  onBackToMenu: () => void;
  onOpenAuthModal: () => void;
  currentStudent: StudentProfile | null;
  onStudentChanged: (student: StudentProfile | null) => void;
}

export const AchievementsHub: React.FC<AchievementsHubProps> = ({
  onBackToMenu,
  onOpenAuthModal,
  currentStudent,
  onStudentChanged
}) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'history'>('badges');

  const achievements = StorageService.getAchievements();
  const stats = StorageService.getStats();

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const history = currentStudent?.recentGames || currentStudent?.gameHistory || [];

  return (
    <div className="min-h-screen relative text-slate-100 pb-16">
      {/* Top Header */}
      <header className="bg-white/10 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-30 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              sound.playPop();
              onBackToMenu();
            }}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold flex items-center gap-2 cursor-pointer text-sm backdrop-blur-md transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Menu Utama</span>
          </button>

          <div className="text-center truncate">
            <h1 className="text-base sm:text-2xl font-black text-white flex items-center justify-center gap-2 drop-shadow-sm">
              <span>🏆 Prestasi & Medali</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">
              Koleksi lencana keberhasilan petualangan belajarmu!
            </p>
          </div>

          <StudentHeaderBadge
            onOpenAuthModal={onOpenAuthModal}
            onLogout={() => onStudentChanged(null)}
            compact
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 relative z-10">
        {/* Student Account Status Banner */}
        {currentStudent ? (
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 sm:p-6 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-4xl shadow-inner shrink-0">
                {currentStudent.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-purple-500/30 border border-purple-300/40 px-2.5 py-0.5 rounded-full text-purple-200">
                    Akun Siswa Aktif
                  </span>
                  <span className="text-xs text-slate-300">
                    ID: {currentStudent.id.slice(-6)}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
                  {currentStudent.name}
                </h2>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Bergabung: {new Date(currentStudent.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Quick stats mini badges */}
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                <span className="text-[10px] text-slate-300 font-bold block">Skor Top</span>
                <span className="text-sm font-black text-amber-300">{currentStudent.stats.highestScore}</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                <span className="text-[10px] text-slate-300 font-bold block">Permainan</span>
                <span className="text-sm font-black text-teal-300">{currentStudent.stats.gamesPlayed}</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                <span className="text-[10px] text-slate-300 font-bold block">Menang</span>
                <span className="text-sm font-black text-emerald-300">{currentStudent.stats.gamesWon}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/15 backdrop-blur-2xl border border-amber-400/30 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-amber-200">
                  Belum Masuk Akun Siswa
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Masuk dengan nama siswa agar medali & riwayat permainanmu tersimpan khusus di profilmu!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playPop();
                onOpenAuthModal();
              }}
              className="px-4 py-2 rounded-2xl bg-amber-500/80 hover:bg-amber-500 text-white font-black text-xs cursor-pointer shadow-lg transition-all shrink-0"
            >
              Masuk / Buat Akun Siswa
            </button>
          </div>
        )}

        {/* Tab Switcher: Medali vs Riwayat Permainan */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 self-center">
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('badges');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-amber-500/80 text-white shadow-lg border border-amber-300/40'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Koleksi Medali ({unlockedCount}/{achievements.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('history');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-purple-500/80 text-white shadow-lg border border-purple-300/40'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Bermain ({history.length})</span>
          </button>
        </div>

        {/* Tab 1: Badges Grid */}
        {activeTab === 'badges' && (
          <>
            {/* Progress summary banner */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-4xl shadow-inner shrink-0">
                  👑
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider bg-white/15 border border-white/20 px-2.5 py-0.5 rounded-full text-amber-300">
                    Kemajuan Medali
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
                    {unlockedCount} dari {achievements.length} Medali Terbuka
                  </h2>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Total {stats.gamesPlayed} Permainan • Skor Tertinggi: {stats.highestScore} Poin
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full sm:w-44 flex flex-col gap-1.5">
                <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                  />
                </div>
                <span className="text-right text-[11px] font-black text-amber-300">
                  {Math.round((unlockedCount / achievements.length) * 100)}% Selesai
                </span>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map(badge => {
                const percent = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

                return (
                  <div
                    key={badge.id}
                    className={`backdrop-blur-xl rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-lg text-white ${
                      badge.unlocked
                        ? 'border-amber-400/50 bg-white/15 shadow-xl'
                        : 'border-white/10 bg-white/5 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border ${
                            badge.unlocked
                              ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                              : 'bg-white/5 border-white/10 text-slate-500 grayscale'
                          }`}
                        >
                          {badge.icon}
                        </div>

                        {badge.unlocked ? (
                          <span className="flex items-center gap-1 text-[11px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full backdrop-blur-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Terbuka</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-white/10 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
                            <Lock className="w-3 h-3" />
                            <span>Terkunci</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-white">{badge.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                        {badge.description}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-300">
                        <span>Kemajuan:</span>
                        <span className="text-amber-300">
                          {badge.progress} / {badge.maxProgress}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            badge.unlocked ? 'bg-amber-400' : 'bg-slate-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Tab 2: Match History */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-4">
            {history.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 text-center text-white">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-4xl mx-auto mb-3">
                  🎲
                </div>
                <h3 className="text-lg font-black text-white">Belum Ada Riwayat Permainan</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
                  Mainkan game petualangan interaktif sampai selesai untuk melihat catatan skor dan hasil permainanmu di sini!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map(record => (
                  <div
                    key={record.id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                          record.won
                            ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                            : 'bg-slate-700/40 border-white/15 text-slate-300'
                        }`}
                      >
                        {record.won ? '🏆' : '🏁'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            record.won
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-slate-600/30 text-slate-300 border border-white/15'
                          }`}>
                            {record.won ? 'Menang Kotak 100' : `Berhenti di Kotak ${record.positionReached}`}
                          </span>
                          <span className="text-[11px] text-teal-300 font-bold bg-teal-500/20 px-2 py-0.5 rounded-full">
                            Kelas {record.classLevel} SD
                          </span>
                          <span className="text-[11px] text-slate-300 capitalize">
                            • {record.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(record.playedAt || record.date || Date.now()).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs text-slate-300 font-semibold block">Soal Benar</span>
                        <span className="text-sm font-black text-emerald-300">
                          {record.correctCount} / {record.correctCount + record.wrongCount}
                        </span>
                      </div>
                      <div className="text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                        <span className="text-[10px] text-slate-300 font-bold block">Skor</span>
                        <span className="text-base font-black text-amber-300">
                          ⭐ {record.score}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
