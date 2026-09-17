import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ClassLevel,
  Difficulty,
  GameMode,
  PlayerCharacter,
  Player,
  StudentProfile
} from '../types';
import { DEFAULT_CHARACTERS } from '../data/defaultData';
import { sound } from '../utils/audio';
import { StorageService } from '../services/storage';
import { StudentHeaderBadge } from './StudentHeaderBadge';
import { ArrowLeft, User, Users, Play, Sparkles, Check, UserCheck } from 'lucide-react';

interface GameSetupProps {
  onBackToMenu: () => void;
  onStartGame: (config: {
    mode: GameMode;
    classLevel: ClassLevel;
    difficulty: Difficulty;
    players: Player[];
  }) => void;
  onOpenAuthModal: () => void;
  currentStudent: StudentProfile | null;
  onStudentChanged: (student: StudentProfile | null) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({
  onBackToMenu,
  onStartGame,
  onOpenAuthModal,
  currentStudent,
  onStudentChanged
}) => {
  const [mode, setMode] = useState<GameMode>('single');
  const [classLevel, setClassLevel] = useState<ClassLevel>(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('mudah');

  // Player 1 config - prefilled with current logged in student
  const [p1Name, setP1Name] = useState<string>(() => currentStudent?.name || 'Budi');
  const [p1Character, setP1Character] = useState<PlayerCharacter>(DEFAULT_CHARACTERS[0]);

  // Player 2 config (for 2-Player mode)
  const [p2Name, setP2Name] = useState<string>('Siti');
  const [p2Character, setP2Character] = useState<PlayerCharacter>(DEFAULT_CHARACTERS[1]);

  useEffect(() => {
    if (currentStudent) {
      setP1Name(currentStudent.name);
    }
  }, [currentStudent]);

  const handleStart = () => {
    sound.playPop();

    const finalP1Name = p1Name.trim() || 'Pemain 1';

    // Auto log in / ensure student profile exists so achievements are guaranteed to be saved!
    let activeStudent = StorageService.getCurrentStudent();
    if (!activeStudent || activeStudent.name.toLowerCase() !== finalP1Name.toLowerCase()) {
      try {
        activeStudent = StorageService.loginStudent(finalP1Name, p1Character.avatar);
        onStudentChanged(activeStudent);
      } catch (e) {
        console.error('Error auto-logging student', e);
      }
    }

    const playersList: Player[] = [
      {
        id: 'p1',
        name: finalP1Name,
        character: p1Character,
        position: 1,
        score: 0,
        lives: 3,
        isBot: false,
        streak: 0,
        correctAnswersCount: 0,
        wrongAnswersCount: 0,
        materialsLearned: []
      }
    ];

    if (mode === 'single') {
      // Bot player
      playersList.push({
        id: 'bot',
        name: 'Robo-Hitung (Komputer)',
        character: DEFAULT_CHARACTERS[2], // Robo
        position: 1,
        score: 0,
        lives: 3,
        isBot: true,
        streak: 0,
        correctAnswersCount: 0,
        wrongAnswersCount: 0,
        materialsLearned: []
      });
    } else {
      // Human player 2
      playersList.push({
        id: 'p2',
        name: p2Name.trim() || 'Pemain 2',
        character: p2Character,
        position: 1,
        score: 0,
        lives: 3,
        isBot: false,
        streak: 0,
        correctAnswersCount: 0,
        wrongAnswersCount: 0,
        materialsLearned: []
      });
    }

    onStartGame({
      mode,
      classLevel,
      difficulty,
      players: playersList
    });
  };

  return (
    <div className="min-h-screen relative pb-16">
      {/* Top Bar */}
      <header className="bg-white/10 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-30 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              sound.playPop();
              onBackToMenu();
            }}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold flex items-center gap-2 cursor-pointer text-sm backdrop-blur-md transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Kembali</span>
          </button>

          <h1 className="text-base sm:text-2xl font-black text-white flex items-center gap-2 drop-shadow-sm truncate">
            <span>⚙️ Persiapan Permainan</span>
          </h1>

          <StudentHeaderBadge
            onOpenAuthModal={onOpenAuthModal}
            onLogout={() => onStudentChanged(null)}
            compact
          />
        </div>
      </header>

      {/* Form Container */}
      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6 relative z-10">
        {/* 1. Mode Selection */}
        <div className="bg-white/10 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3">
          <label className="text-sm font-black text-white flex items-center gap-2">
            <span>1. Pilih Mode Permainan:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                sound.playPop();
                setMode('single');
              }}
              className={`p-4 rounded-2xl border flex items-center gap-3.5 text-left transition-all cursor-pointer backdrop-blur-md ${
                mode === 'single'
                  ? 'border-amber-400/80 bg-amber-500/20 shadow-lg shadow-amber-950/20 scale-[1.02]'
                  : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/30 flex items-center justify-center text-2xl shrink-0">
                🤖
              </div>
              <div>
                <h4 className="text-base font-black text-white">1 Pemain vs Bot</h4>
                <p className="text-xs text-slate-300 font-medium">Bermain melawan Robo-Hitung</p>
              </div>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setMode('two_player');
              }}
              className={`p-4 rounded-2xl border flex items-center gap-3.5 text-left transition-all cursor-pointer backdrop-blur-md ${
                mode === 'two_player'
                  ? 'border-pink-400/80 bg-pink-500/20 shadow-lg shadow-pink-950/20 scale-[1.02]'
                  : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-500/30 border border-pink-400/30 flex items-center justify-center text-2xl shrink-0">
                👥
              </div>
              <div>
                <h4 className="text-base font-black text-white">2 Pemain (1 Perangkat)</h4>
                <p className="text-xs text-slate-300 font-medium">Main bergantian bersama teman</p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Grade Level Picker */}
        <div className="bg-white/10 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-black text-white">2. Pilih Tingkat Kelas SD:</label>
            <span className="text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-400/30 px-2.5 py-1 rounded-lg">
              Soal disesuaikan kurikulum
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map(g => (
              <button
                key={g}
                onClick={() => {
                  sound.playPop();
                  setClassLevel(g as ClassLevel);
                }}
                className={`py-3.5 rounded-2xl font-black text-sm flex flex-col items-center gap-1 transition-all cursor-pointer backdrop-blur-md ${
                  classLevel === g
                    ? 'bg-gradient-to-b from-teal-500/90 to-emerald-600/90 text-white shadow-lg border border-teal-300/60 scale-105'
                    : 'bg-white/5 border border-white/15 text-slate-200 hover:bg-white/15 hover:border-white/30'
                }`}
              >
                <span className="text-lg font-black">Kelas {g}</span>
                <span className="text-[10px] opacity-80 font-medium">SD</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Difficulty */}
        <div className="bg-white/10 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3">
          <label className="text-sm font-black text-white">3. Tingkat Kesulitan Soal:</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'mudah', title: '🌱 Mudah', desc: 'Santai & Menyenangkan' },
              { id: 'sedang', title: '⭐ Sedang', desc: 'Tantangan Seimbang' },
              { id: 'sulit', title: '🔥 Sulit', desc: 'Asah Otak Maksimal' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => {
                  sound.playPop();
                  setDifficulty(d.id as Difficulty);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer backdrop-blur-md ${
                  difficulty === d.id
                    ? 'border-amber-400/80 bg-amber-500/20 shadow-lg text-white font-black scale-102'
                    : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/15 hover:border-white/30'
                }`}
              >
                <div className="text-sm font-bold">{d.title}</div>
                <div className="text-[10px] text-slate-300 mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Character Selection for Player 1 */}
        <div className="bg-white/10 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-sm font-black text-white block">
                4. Karakter & Nama Pemain 1:
              </label>
              {currentStudent ? (
                <span className="text-[11px] text-teal-300 font-bold flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Tersambung ke akun siswa: <strong className="text-white">{currentStudent.name}</strong></span>
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="underline text-amber-300 hover:text-amber-200 ml-1 cursor-pointer"
                  >
                    (Ganti Akun)
                  </button>
                </span>
              ) : (
                <span className="text-[11px] text-slate-300 font-medium">
                  Nama di bawah otomatis digunakan untuk menyimpan prestasimu.
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Nama Pemain 1..."
              value={p1Name}
              onChange={e => setP1Name(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-black bg-white/10 backdrop-blur-md text-white placeholder:text-slate-400 focus:outline-none focus:border-white/50 max-w-[200px]"
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {DEFAULT_CHARACTERS.map(c => {
              const isSelected = p1Character.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    sound.playPop();
                    setP1Character(c);
                  }}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer backdrop-blur-md ${
                    isSelected
                      ? 'border-blue-400/80 bg-blue-500/30 shadow-lg scale-105'
                      : 'border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/30'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl">{c.avatar}</div>
                  <span className="text-[11px] font-black text-slate-100 text-center leading-tight">
                    {c.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Character Selection for Player 2 (If 2 Player Mode) */}
        {mode === 'two_player' && (
          <div className="bg-white/10 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-black text-pink-300">
                5. Karakter & Nama Pemain 2:
              </label>
              <input
                type="text"
                placeholder="Nama Pemain 2..."
                value={p2Name}
                onChange={e => setP2Name(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl border border-pink-300/30 text-xs font-black bg-white/10 backdrop-blur-md text-white placeholder:text-slate-400 focus:outline-none focus:border-pink-300/60 max-w-[200px]"
              />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {DEFAULT_CHARACTERS.map(c => {
                const isSelected = p2Character.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      sound.playPop();
                      setP2Character(c);
                    }}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'border-pink-400/80 bg-pink-500/30 shadow-lg scale-105'
                        : 'border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/30'
                    }`}
                  >
                    <div className="text-3xl sm:text-4xl">{c.avatar}</div>
                    <span className="text-[11px] font-black text-slate-100 text-center leading-tight">
                      {c.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Game Button */}
        <button
          id="btn-confirm-start-game"
          onClick={handleStart}
          className="w-full py-4.5 rounded-3xl bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-emerald-600/90 backdrop-blur-xl text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-98 cursor-pointer shadow-2xl shadow-emerald-950/50 border border-white/30 transition-all"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>MULAI PETUALANGAN! 🚀</span>
        </button>
      </main>
    </div>
  );
};
