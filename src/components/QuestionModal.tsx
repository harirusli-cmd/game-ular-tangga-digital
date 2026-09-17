import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Question } from '../types';
import { questionEngine } from '../services/questionEngine';
import { sound } from '../utils/audio';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface QuestionModalProps {
  question: Question;
  reason: 'snake' | 'ladder' | 'tile_challenge';
  playerName: string;
  onAnswer: (isCorrect: boolean) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  reason,
  playerName,
  onAnswer
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [numberInput, setNumberInput] = useState<string>('');
  const [answered, setAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const handleSubmit = (chosenAnswer?: string) => {
    if (answered) return;

    const answerToValidate = chosenAnswer || (question.type === 'number_input' ? numberInput : selectedOption);
    if (!answerToValidate.trim()) return;

    const correct = questionEngine.validateAnswer(question, answerToValidate);
    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      sound.playCorrect();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      sound.playWrong();
    }
  };

  const handleFinish = () => {
    sound.playPop();
    onAnswer(isCorrect);
  };

  const getHeaderInfo = () => {
    switch (reason) {
      case 'snake':
        return {
          icon: '🐍',
          title: 'AWAS ULAR!',
          subtitle: `${playerName}, jawab benar pertanyaan ini agar kamu tidak turun ke bawah!`,
          bg: 'from-orange-500 to-rose-600',
          badge: 'bg-rose-100 text-rose-800'
        };
      case 'ladder':
        return {
          icon: '🪜',
          title: 'NAIK TANGGA!',
          subtitle: `${playerName}, jawab benar soal ini untuk memanjat tangga lebih cepat!`,
          bg: 'from-amber-500 to-emerald-600',
          badge: 'bg-emerald-100 text-emerald-800'
        };
      default:
        return {
          icon: '🧠',
          title: 'TANTANGAN KUIS',
          subtitle: `${playerName}, jawab soal untuk mengumpulkan bintang & poin!`,
          bg: 'from-blue-500 to-indigo-600',
          badge: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="w-full max-w-lg bg-slate-900/85 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col text-white"
      >
        {/* Header Banner */}
        <div className={`p-5 bg-gradient-to-r ${header.bg} text-white flex items-center gap-4 border-b border-white/20`}>
          <div className="text-4xl sm:text-5xl animate-bounce">{header.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-wide">{header.title}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase backdrop-blur-md ${header.badge}`}>
                Kelas {question.classLevel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 mt-1 leading-snug">{header.subtitle}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          {/* Topic & Difficulty */}
          <div className="flex items-center justify-between text-xs text-slate-300 border-b border-white/10 pb-2">
            <span className="font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 rounded-lg backdrop-blur-md">
              📚 Topik: {question.topic}
            </span>
            <span className="capitalize font-semibold text-slate-300">
              Tingkat: <span className="text-white font-bold">{question.difficulty}</span>
            </span>
          </div>

          {/* Question text */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/20 shadow-inner">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed text-center">
              {question.question}
            </h3>
          </div>

          {/* Answering State */}
          {!answered ? (
            <div className="flex flex-col gap-3 mt-2">
              {/* 1. MULTIPLE CHOICE */}
              {question.type === 'multiple_choice' && question.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {question.options.map((opt, idx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    return (
                      <button
                        key={opt.id}
                        id={`btn-opt-${opt.id}`}
                        onClick={() => {
                          setSelectedOption(opt.id);
                          handleSubmit(opt.id);
                        }}
                        className="group flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border border-white/15 bg-white/10 hover:border-amber-300/60 hover:bg-white/20 active:scale-95 transition-all text-left font-bold cursor-pointer backdrop-blur-md shadow-lg"
                      >
                        <span className="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-400/40 text-amber-200 flex items-center justify-center font-black group-hover:bg-amber-500 group-hover:text-white transition-colors text-sm">
                          {letters[idx] || opt.id.toUpperCase()}
                        </span>
                        <span className="text-base text-slate-100 flex-1">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. TRUE / FALSE */}
              {question.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    id="btn-tf-true"
                    onClick={() => handleSubmit('true')}
                    className="p-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 hover:bg-emerald-500/35 active:scale-95 transition-all flex flex-col items-center gap-2 cursor-pointer font-black text-emerald-200 backdrop-blur-md shadow-lg"
                  >
                    <span className="text-3xl">👍</span>
                    <span className="text-lg text-emerald-100">BENAR</span>
                  </button>
                  <button
                    id="btn-tf-false"
                    onClick={() => handleSubmit('false')}
                    className="p-4 rounded-2xl border border-rose-400/40 bg-rose-500/20 hover:bg-rose-500/35 active:scale-95 transition-all flex flex-col items-center gap-2 cursor-pointer font-black text-rose-200 backdrop-blur-md shadow-lg"
                  >
                    <span className="text-3xl">👎</span>
                    <span className="text-lg text-rose-100">SALAH</span>
                  </button>
                </div>
              )}

              {/* 3. NUMBER INPUT */}
              {question.type === 'number_input' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="input-number-answer"
                      type="text"
                      inputMode="numeric"
                      placeholder="Ketik angka jawabanmu..."
                      value={numberInput}
                      onChange={e => setNumberInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSubmit();
                      }}
                      autoFocus
                      className="flex-1 p-3.5 rounded-2xl border border-white/20 text-center text-xl font-bold focus:outline-none focus:border-white/50 bg-white/10 backdrop-blur-md text-white placeholder:text-slate-400"
                    />
                    <button
                      id="btn-submit-number"
                      onClick={() => handleSubmit()}
                      disabled={!numberInput.trim()}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg border border-white/20"
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Result and Explanation View */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              {/* Feedback banner */}
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 border backdrop-blur-md ${
                  isCorrect
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                    : 'bg-rose-500/20 border-rose-400/40 text-rose-100'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-base sm:text-lg font-black">
                    {isCorrect
                      ? reason === 'snake'
                        ? '🎉 Hebat! Kamu Berhasil Menghindari Ular!'
                        : reason === 'ladder'
                        ? '🎉 Luar Biasa! Kamu Boleh Naik Tangga!'
                        : '🎉 Jawabanmu Tepat Sekali (+10 Poin)!'
                      : reason === 'snake'
                      ? '😅 Ups! Jawabanmu belum tepat. Harus meluncur ke ekor ular.'
                      : reason === 'ladder'
                      ? '😊 Belum tepat. Belum bisa naik tangga kali ini.'
                      : '😊 Ups! Jawabanmu belum tepat, tetap semangat!'}
                  </h4>
                  {!isCorrect && (
                    <p className="text-xs mt-0.5 opacity-90 font-medium">
                      Jawaban yang benar adalah: <span className="font-bold underline">{question.correctAnswer.toUpperCase()}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Explanation Card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
                    <Lightbulb className="w-4 h-4" />
                    <span>Pembahasan & Kunci Jawaban:</span>
                  </div>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {question.explanation}
                </p>
              </div>

              {/* Action button */}
              <button
                id="btn-continue-after-question"
                onClick={handleFinish}
                className="mt-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-teal-600/90 backdrop-blur-xl border border-white/30 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 cursor-pointer shadow-xl shadow-emerald-950/50"
              >
                <span>Ayo Lanjut Bermain!</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
