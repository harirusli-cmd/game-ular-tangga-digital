import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageService, AVATAR_OPTIONS } from '../services/storage';
import { StudentProfile } from '../types';
import { sound } from '../utils/audio';
import {
  User,
  LogOut,
  Sparkles,
  Trophy,
  Star,
  CheckCircle2,
  Trash2,
  UserPlus,
  ArrowRight,
  X
} from 'lucide-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentChanged: (student: StudentProfile | null) => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onStudentChanged
}) => {
  const currentStudent = StorageService.getCurrentStudent();
  const [studentsList, setStudentsList] = useState<StudentProfile[]>(() => StorageService.getStudents());
  const [nameInput, setNameInput] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mode, setMode] = useState<'view' | 'new'>(currentStudent ? 'view' : 'new');

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const clean = nameInput.trim();
    if (!clean) {
      setErrorMessage('Silakan tulis nama siswa terlebih dahulu.');
      return;
    }

    try {
      sound.playPop();
      const student = StorageService.loginStudent(clean, selectedAvatar);
      setNameInput('');
      setStudentsList(StorageService.getStudents());
      onStudentChanged(student);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk akun siswa');
    }
  };

  const handleSwitchAccount = (studentId: string) => {
    sound.playPop();
    const switched = StorageService.switchStudent(studentId);
    if (switched) {
      onStudentChanged(switched);
      onClose();
    }
  };

  const handleLogout = () => {
    sound.playPop();
    StorageService.logoutStudent();
    onStudentChanged(null);
    setMode('new');
  };

  const handleDeleteProfile = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Hapus akun siswa ini beserta seluruh pencapaiannya?')) {
      sound.playSnake();
      StorageService.deleteStudent(studentId);
      const updated = StorageService.getStudents();
      setStudentsList(updated);
      if (currentStudent?.id === studentId) {
        onStudentChanged(null);
        setMode('new');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-teal-600/30 border-b border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center text-2xl shadow-inner">
              🎓
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Akun Siswa</span>
                <Sparkles className="w-5 h-5 text-amber-300" />
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Masuk hanya dengan nama untuk menyimpan pencapaian & skor!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6">
          {/* Active Logged In View */}
          {currentStudent && mode === 'view' ? (
            <div className="flex flex-col gap-5">
              {/* Current Student Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-teal-500/20 border border-white/20 shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-18 h-18 rounded-3xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-4xl shadow-md">
                    {currentStudent.avatar}
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
                      Akun Aktif Saat Ini
                    </span>
                    <h3 className="text-2xl font-black text-white">{currentStudent.name}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Bergabung sejak:{' '}
                      {new Date(currentStudent.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Stats summary badges */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/15 text-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
                    <span className="text-[11px] text-slate-300 font-semibold block">Skor Tertinggi</span>
                    <span className="text-base font-black text-amber-300">
                      {currentStudent.stats.highestScore} Pts
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
                    <span className="text-[11px] text-slate-300 font-semibold block">Medali Terbuka</span>
                    <span className="text-base font-black text-yellow-300">
                      {currentStudent.achievements.filter(a => a.unlocked).length} /{' '}
                      {currentStudent.achievements.length}
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
                    <span className="text-[11px] text-slate-300 font-semibold block">Menang</span>
                    <span className="text-base font-black text-emerald-300">
                      {currentStudent.stats.gamesWon} Kali
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    sound.playPop();
                    setMode('new');
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <UserPlus className="w-4 h-4 text-teal-300" />
                  <span>Ganti / Masuk dengan Akun Siswa Lain</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun Siswa (Log Out)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login / Register Form */
            <div className="flex flex-col gap-6">
              {/* Existing accounts quick switcher if available */}
              {studentsList.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pilih Akun yang Sudah Ada di Perangkat Ini:</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {studentsList.map(s => {
                      const isCurrent = currentStudent?.id === s.id;
                      const unlockedMedals = s.achievements.filter(a => a.unlocked).length;

                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSwitchAccount(s.id)}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-500/20 border-emerald-400/50 shadow-md'
                              : 'bg-white/10 hover:bg-white/20 border-white/15'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="text-2xl">{s.avatar}</span>
                            <div className="overflow-hidden">
                              <span className="font-black text-sm text-white block truncate">
                                {s.name}
                              </span>
                              <span className="text-[11px] text-amber-300 font-semibold block">
                                🏆 {unlockedMedals} Medali • ⭐ {s.stats.highestScore} Poin
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {isCurrent && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            <button
                              onClick={e => handleDeleteProfile(s.id, e)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/30 text-slate-400 hover:text-rose-300 transition-all ml-1"
                              title="Hapus profil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Divider if existing accounts exist */}
              {studentsList.length > 0 && (
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-white/15 w-full" />
                  <span className="bg-slate-900 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider absolute">
                    Atau Masuk Nama Baru
                  </span>
                </div>
              )}

              {/* Name Input Form */}
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Nama Lengkap / Panggilan Siswa:
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="Contoh: Budi Pratama, Siti, dll..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 font-bold text-base focus:outline-none focus:border-teal-400/80 focus:ring-2 focus:ring-teal-400/20 backdrop-blur-md transition-all"
                    maxLength={30}
                    autoFocus
                  />
                  <span className="text-[11px] text-slate-400">
                    *Hanya perlu nama, tanpa kata sandi! Jika nama sudah pernah dipakai, otomatis memuat pencapaianmu.
                  </span>
                </div>

                {/* Avatar Picker */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-200">Pilih Karakter Avatar:</label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {AVATAR_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setSelectedAvatar(emoji);
                        }}
                        className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center text-2xl transition-all cursor-pointer ${
                          selectedAvatar === emoji
                            ? 'bg-amber-400/30 border-2 border-amber-400 scale-110 shadow-lg'
                            : 'bg-white/10 hover:bg-white/20 border border-white/15'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-emerald-600/90 hover:brightness-110 active:scale-98 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 cursor-pointer border border-white/30 transition-all"
                >
                  <span>MASUK & SIMPAN PENCAPAIAN</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
