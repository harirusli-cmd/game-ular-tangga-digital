import React, { useState } from 'react';
import { Question, ClassLevel } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../utils/audio';
import { QuestionModal } from './QuestionModal';
import { ArrowLeft, Brain, Sparkles, CheckCircle2, Play } from 'lucide-react';

interface QuestionsHubProps {
  onBackToMenu: () => void;
}

export const QuestionsHub: React.FC<QuestionsHubProps> = ({ onBackToMenu }) => {
  const [selectedGrade, setSelectedGrade] = useState<ClassLevel>(1);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  const questions = StorageService.getQuestions().filter(q => q.active && q.classLevel === selectedGrade);

  const handleAnswerResult = (isCorrect: boolean) => {
    if (activeQuestion && isCorrect) {
      setSolvedIds(prev => new Set(prev).add(activeQuestion.id));
      StorageService.recordGameStats({
        totalQuestionsAnswered: 1,
        totalCorrect: 1
      });
      StorageService.updateAchievementProgress('quiz_expert', 1);
    } else {
      StorageService.recordGameStats({
        totalQuestionsAnswered: 1,
        totalWrong: 1
      });
    }
    setActiveQuestion(null);
  };

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
              <span>🧠 Latihan Soal & Kuis</span>
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Uji kemampuanmu dan kumpulkan bintang keberhasilan!
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/25 border border-emerald-400/30 px-3 py-1.5 rounded-2xl text-xs font-black text-emerald-200 backdrop-blur-md">
            <span>⭐ Terjawab:</span>
            <span>{solvedIds.size}</span>
          </div>
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
                  ? 'bg-amber-500/80 border-amber-300 text-white shadow-lg scale-105'
                  : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/20'
              }`}
            >
              Kelas {grade} SD
            </button>
          ))}
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q, idx) => {
            const isSolved = solvedIds.has(q.id);

            return (
              <div
                key={q.id}
                className={`backdrop-blur-xl rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-lg text-white ${
                  isSolved
                    ? 'border-emerald-400/40 bg-emerald-500/15'
                    : 'border-white/20 bg-white/10 hover:border-amber-300/60 hover:shadow-2xl'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/30 text-amber-200">
                        Soal #{idx + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300 capitalize bg-white/10 border border-white/15 px-2 py-0.5 rounded-full">
                        {q.difficulty}
                      </span>
                    </div>

                    {isSolved && (
                      <span className="flex items-center gap-1 text-xs font-black text-emerald-300 bg-emerald-500/25 border border-emerald-400/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesai</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-1 leading-snug">{q.question}</h3>
                  <span className="text-xs font-bold text-amber-300">Topik: {q.topic}</span>
                </div>

                <button
                  onClick={() => {
                    sound.playPop();
                    setActiveQuestion(q);
                  }}
                  className={`mt-4 w-full py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all backdrop-blur-md border ${
                    isSolved
                      ? 'bg-emerald-500/80 hover:bg-emerald-500 border-white/30 text-white'
                      : 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:brightness-110 border-white/30 text-white shadow-lg'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isSolved ? 'Coba Lagi' : 'Jawab Soal Ini'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {questions.length === 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 text-center border border-dashed border-white/20 text-white">
            <span className="text-4xl block mb-2">💡</span>
            <h3 className="text-base font-bold text-slate-200">Belum ada soal untuk kelas ini</h3>
            <p className="text-xs text-slate-400 mt-1">Guru dapat menambahkan soal baru di Panel Admin.</p>
          </div>
        )}
      </main>

      {/* Active Question Modal */}
      {activeQuestion && (
        <QuestionModal
          question={activeQuestion}
          reason="tile_challenge"
          playerName="Kamu"
          onAnswer={handleAnswerResult}
        />
      )}
    </div>
  );
};
