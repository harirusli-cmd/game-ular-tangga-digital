import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Player,
  BoardConfig,
  ClassLevel,
  Difficulty,
  Question,
  Material,
  GameMode,
  GameSettings,
  StudentProfile
} from '../types';
import { Board } from './Board';
import { Dice } from './Dice';
import { QuestionModal } from './QuestionModal';
import { MaterialModal } from './MaterialModal';
import { VictoryModal } from './VictoryModal';
import { SettingsModal } from './SettingsModal';
import { StorageService } from '../services/storage';
import { questionEngine } from '../services/questionEngine';
import { BoardEngine } from '../services/boardEngine';
import { sound } from '../utils/audio';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Heart,
  Star,
  RotateCcw,
  Sparkles,
  Info,
  Trophy,
  AlertCircle
} from 'lucide-react';

interface GameScreenProps {
  initialPlayers: Player[];
  classLevel: ClassLevel;
  difficulty: Difficulty;
  mode: GameMode;
  onExitToMenu: () => void;
  onGoMaterials: () => void;
  currentStudent?: StudentProfile | null;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  initialPlayers,
  classLevel,
  difficulty,
  mode,
  onExitToMenu,
  onGoMaterials,
  currentStudent: passedStudent
}) => {
  const currentStudent = passedStudent || StorageService.getCurrentStudent();
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [gameMessage, setGameMessage] = useState<string>(
    `Permainan dimulai! Giliran ${initialPlayers[0].name}. Silakan lempar dadu!`
  );

  // Active board config & settings
  const [boardConfig, setBoardConfig] = useState<BoardConfig>(() => StorageService.getBoardConfig());
  const [settings, setSettings] = useState<GameSettings>(() => StorageService.getSettings());
  const materialsList = StorageService.getMaterials();

  // Modals state
  const [activeQuestion, setActiveQuestion] = useState<{
    question: Question;
    reason: 'snake' | 'ladder' | 'tile_challenge';
    targetTileIfCorrect?: number;
    targetTileIfWrong?: number;
  } | null>(null);

  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tileInfoModal, setTileInfoModal] = useState<{ tileNumber: number; text: string } | null>(null);

  const activePlayer = players[activePlayerIndex];
  const isBotTurn = activePlayer?.isBot && !winner && !activeQuestion && !activeMaterial && !isMoving && !isRolling;

  // Bot auto-play loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBotTurn) {
      timer = setTimeout(() => {
        handleRollDice();
      }, 1200);
    }
    return () => clearTimeout(timer);
  }, [isBotTurn, activePlayerIndex]);

  // Dice roll handler
  const handleRollDice = async () => {
    if (isRolling || isMoving || winner || activeQuestion || activeMaterial) return;

    setIsRolling(true);
    setGameMessage(`🎲 ${activePlayer.name} sedang mengocok dadu...`);

    // Simulate roll animation delay
    const rollDuration = 700;
    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceValue(rolled);
      setIsRolling(false);
      movePlayerStepByStep(rolled);
    }, rollDuration);
  };

  // Step-by-step movement animation
  const movePlayerStepByStep = async (steps: number) => {
    setIsMoving(true);
    let currentPos = activePlayer.position;
    let targetPos = currentPos + steps;

    // Bounce back rule if overshooting 100
    if (targetPos > 100) {
      const overshoot = targetPos - 100;
      targetPos = 100 - overshoot;
      setGameMessage(`Lewat dari 100! ${activePlayer.name} membal kembali ke kotak ${targetPos}.`);
    } else {
      setGameMessage(`🎲 ${activePlayer.name} mendapatkan angka ${steps}! Bergerak ke kotak ${targetPos}.`);
    }

    const stepDelay = settings.animationSpeed === 'fast' ? 120 : 250;

    // Animate individual tile hops forward or backward
    const direction = targetPos > currentPos ? 1 : -1;
    while (currentPos !== targetPos) {
      currentPos += direction;
      sound.playStep();
      updatePlayerPosition(activePlayer.id, currentPos);
      await new Promise(r => setTimeout(r, stepDelay));
    }

    // Landed on target tile -> Evaluate tile events
    await handleTileLanding(targetPos);
  };

  const updatePlayerPosition = (playerId: string, newPos: number) => {
    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, position: newPos } : p))
    );
  };

  const updatePlayerScore = (playerId: string, deltaScore: number) => {
    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, score: Math.max(0, p.score + deltaScore) } : p))
    );
  };

  // Process Tile Events upon landing
  const handleTileLanding = async (tileNumber: number) => {
    // 1. Check Win Condition
    if (tileNumber === 100) {
      handleVictory();
      return;
    }

    const events = BoardEngine.getTileEvents(tileNumber, boardConfig);

    // 2. Snake Head Landed!
    if (events.snakeHead) {
      const q = questionEngine.getNextQuestion(classLevel, difficulty);
      setGameMessage(`🐍 Awas! ${activePlayer.name} berada di kepala ular kotak ${tileNumber}!`);

      if (activePlayer.isBot) {
        // Bot auto resolves based on accuracy (~70%)
        const botSuccess = Math.random() < 0.7;
        setTimeout(() => {
          handleAnswerCallback(botSuccess, 'snake', events.snakeHead!.head, events.snakeHead!.tail);
        }, 1500);
      } else {
        setActiveQuestion({
          question: q,
          reason: 'snake',
          targetTileIfCorrect: events.snakeHead.head,
          targetTileIfWrong: events.snakeHead.tail
        });
      }
      return;
    }

    // 3. Ladder Start Landed!
    if (events.ladderStart) {
      const q = questionEngine.getNextQuestion(classLevel, difficulty);
      setGameMessage(`🪜 Kesempatan naik! ${activePlayer.name} berada di pangkal tangga kotak ${tileNumber}!`);

      if (activePlayer.isBot) {
        const botSuccess = Math.random() < 0.75;
        setTimeout(() => {
          handleAnswerCallback(botSuccess, 'ladder', events.ladderStart!.end, events.ladderStart!.start);
        }, 1500);
      } else {
        setActiveQuestion({
          question: q,
          reason: 'ladder',
          targetTileIfCorrect: events.ladderStart.end,
          targetTileIfWrong: events.ladderStart.start
        });
      }
      return;
    }

    // 4. Material Tile Landed!
    if (events.special?.type === 'material') {
      const mat = materialsList.find(m => m.id === events.special?.materialId) || materialsList[0];
      if (mat) {
        setGameMessage(`📚 ${activePlayer.name} menemukan kotak materi: ${mat.title}!`);
        if (!activePlayer.isBot) {
          setActiveMaterial(mat);
          return;
        } else {
          updatePlayerScore(activePlayer.id, 5);
        }
      }
    }

    // 5. Bonus Tile Landed!
    if (events.special?.type === 'bonus') {
      const pts = events.special.bonusPoints || 20;
      sound.playBonus();
      updatePlayerScore(activePlayer.id, pts);
      setGameMessage(`⭐ Kotak Bintang! ${activePlayer.name} mendapatkan bonus +${pts} Poin!`);
    }

    // 6. Trivia Tile
    if (events.special?.type === 'trivia') {
      sound.playBonus();
      setGameMessage(`💡 ${events.special.triviaText || 'Fakta seru & wawasan menarik!'}`);
    }

    // End of Turn -> switch to next player
    finishTurn();
  };

  // Handle Question Modal Answer
  const handleAnswerCallback = async (
    isCorrect: boolean,
    reason: 'snake' | 'ladder' | 'tile_challenge',
    targetIfCorrect?: number,
    targetIfWrong?: number
  ) => {
    setActiveQuestion(null);

    // Record stats
    StorageService.recordGameStats({
      totalQuestionsAnswered: 1,
      totalCorrect: isCorrect ? 1 : 0,
      totalWrong: isCorrect ? 0 : 1
    });

    if (isCorrect) {
      // Award score
      const bonus = reason === 'ladder' ? 15 : 10;
      updatePlayerScore(activePlayer.id, bonus);
      setPlayers(prev =>
        prev.map(p =>
          p.id === activePlayer.id
            ? { ...p, correctAnswersCount: p.correctAnswersCount + 1, streak: p.streak + 1 }
            : p
        )
      );

      if (reason === 'ladder' && targetIfCorrect) {
        sound.playLadder();
        setGameMessage(`🎉 Benar! ${activePlayer.name} memanjat tangga ke kotak ${targetIfCorrect}!`);
        updatePlayerPosition(activePlayer.id, targetIfCorrect);
        StorageService.updateAchievementProgress('ladder_master', 1);
      } else if (reason === 'snake') {
        setGameMessage(`🎉 Hebat! ${activePlayer.name} berhasil menjawab benar dan terhindar dari ular!`);
        StorageService.updateAchievementProgress('snake_tamer', 1);
      }

      StorageService.updateAchievementProgress('quiz_expert', 1);
    } else {
      // Wrong answer
      setPlayers(prev =>
        prev.map(p =>
          p.id === activePlayer.id
            ? {
                ...p,
                wrongAnswersCount: p.wrongAnswersCount + 1,
                streak: 0,
                lives: settings.useLives ? Math.max(0, p.lives - 1) : p.lives
              }
            : p
        )
      );

      if (reason === 'snake' && targetIfWrong) {
        sound.playSnake();
        setGameMessage(`😅 Ups! ${activePlayer.name} meluncur turun ke kotak ${targetIfWrong}.`);
        updatePlayerPosition(activePlayer.id, targetIfWrong);
      } else if (reason === 'ladder') {
        setGameMessage(`😊 Jawaban belum tepat, ${activePlayer.name} tetap berada di tempat.`);
      }
    }

    // Check if ladder jump caused victory (e.g. ladder to 100 if any)
    if (activePlayer.position >= 100) {
      handleVictory();
      return;
    }

    finishTurn();
  };

  // Material Modal Dismissal
  const handleMaterialUnderstood = () => {
    if (activeMaterial) {
      updatePlayerScore(activePlayer.id, 5);
      setPlayers(prev =>
        prev.map(p =>
          p.id === activePlayer.id
            ? { ...p, materialsLearned: [...p.materialsLearned, activeMaterial.id] }
            : p
        )
      );
      StorageService.recordGameStats({ materialsReadCount: 1 });
      StorageService.updateAchievementProgress('scholar', 1);
    }
    setActiveMaterial(null);
    finishTurn();
  };

  // Advance turn to next player
  const finishTurn = () => {
    setIsMoving(false);
    const nextIdx = (activePlayerIndex + 1) % players.length;
    setActivePlayerIndex(nextIdx);
  };

  // Victory Handler
  const handleVictory = () => {
    const winningPlayer = activePlayer;
    setWinner(winningPlayer);
    setIsMoving(false);
    setIsRolling(false);
    sound.playVictory();

    // Identify human player to save record for
    const humanPlayer = players.find(p => !p.isBot) || winningPlayer;

    // Save full match record into the student's personal account
    StorageService.recordStudentGame({
      mode,
      classLevel,
      difficulty,
      score: humanPlayer.score,
      won: winningPlayer.id === humanPlayer.id,
      correctCount: humanPlayer.correctAnswersCount,
      wrongCount: humanPlayer.wrongAnswersCount,
      positionReached: humanPlayer.position
    });

    StorageService.recordGameStats({
      gamesPlayed: 1,
      gamesWon: 1,
      highestScore: winningPlayer.score
    });
    StorageService.updateAchievementProgress('first_win', 1);
    if (winningPlayer.score >= 150) {
      StorageService.updateAchievementProgress('high_scorer', winningPlayer.score);
    }
  };

  const handlePlayAgain = () => {
    const reset = initialPlayers.map(p => ({
      ...p,
      position: 1,
      score: 0,
      lives: 3,
      streak: 0,
      correctAnswersCount: 0,
      wrongAnswersCount: 0,
      materialsLearned: []
    }));
    setPlayers(reset);
    setActivePlayerIndex(0);
    setWinner(null);
    setDiceValue(1);
    setGameMessage(`Permainan dimulai kembali! Giliran ${reset[0].name}.`);
  };

  return (
    <div className="min-h-screen relative text-slate-100 flex flex-col justify-between p-2 sm:p-4 select-none overflow-x-hidden">
      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between bg-white/10 backdrop-blur-2xl px-3 sm:px-5 py-2.5 rounded-2xl sm:rounded-3xl border border-white/20 shadow-xl gap-2 z-20">
        <button
          id="btn-game-back-menu"
          onClick={() => {
            if (confirm('Keluar ke menu utama? Kemajuan game saat ini akan berakhir.')) {
              sound.playPop();
              onExitToMenu();
            }
          }}
          className="p-2 sm:px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm backdrop-blur-md transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">Menu</span>
        </button>

        {/* Grade & Difficulty Info */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentStudent && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 backdrop-blur-md">
              <span>{currentStudent.avatar}</span>
              <span className="font-black text-white">{currentStudent.name}</span>
            </div>
          )}
          <span className="text-xs font-black bg-teal-500/25 border border-teal-400/30 text-teal-200 px-2.5 py-1 rounded-xl backdrop-blur-md">
            Kelas {classLevel} SD
          </span>
          <span className="text-[11px] font-bold text-slate-300 capitalize bg-white/10 border border-white/15 px-2 py-1 rounded-xl hidden sm:inline backdrop-blur-md">
            Tingkat: {difficulty}
          </span>
        </div>

        {/* Players Status Pills */}
        <div className="flex items-center gap-2">
          {players.map((p, idx) => {
            const isActive = idx === activePlayerIndex;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all backdrop-blur-md border ${
                  isActive
                    ? 'bg-amber-500/30 border-amber-400 text-white shadow-lg ring-1 ring-amber-300/50 scale-105'
                    : 'bg-white/10 border-white/15 text-slate-200'
                }`}
              >
                <span>{p.character.avatar}</span>
                <span className="font-black">{p.name.split(' ')[0]}</span>
                <span className="opacity-80">({p.position})</span>
                <span className="text-amber-300 font-black">⭐{p.score}</span>
                {settings.useLives && (
                  <span className="text-rose-300 hidden sm:inline">❤️{p.lives}</span>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 hover:text-white cursor-pointer backdrop-blur-md transition-all"
            title="Pengaturan"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="max-w-6xl w-full mx-auto my-auto py-2 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center relative z-10">
        {/* Left / Center: The 100-Tiles Board */}
        <div className="lg:col-span-8 flex justify-center">
          <Board
            boardConfig={boardConfig}
            players={players}
            activePlayerIndex={activePlayerIndex}
            onTileClick={tileNum => {
              const events = BoardEngine.getTileEvents(tileNum, boardConfig);
              let text = `Kotak Nomor ${tileNum}.`;
              if (events.snakeHead) text += ` 🐍 Kepala Ular! Jika kena, akan meluncur turun ke kotak ${events.snakeHead.tail}.`;
              if (events.ladderStart) text += ` 🪜 Pangkal Tangga! Jika jawab benar, akan naik ke kotak ${events.ladderStart.end}.`;
              if (events.special?.type === 'material') text += ` 📚 Kotak Materi Pembelajaran!`;
              if (events.special?.type === 'bonus') text += ` ⭐ Kotak Bonus Poin!`;
              setTileInfoModal({ tileNumber: tileNum, text });
            }}
          />
        </div>

        {/* Right: Controls & Interactive Game Dashboard */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Active Player Card Banner */}
          <div
            className="p-4 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 text-white flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
                  {activePlayer.character.avatar}
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/15 border border-white/20 px-2 py-0.5 rounded-full text-slate-200">
                    {activePlayer.isBot ? '🤖 Giliran Komputer' : '👦 Giliran Kamu'}
                  </span>
                  <h3 className="text-lg font-black leading-tight mt-0.5 text-white">{activePlayer.name}</h3>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-amber-300 drop-shadow-sm">{activePlayer.position}</div>
                <span className="text-[10px] font-bold opacity-80 uppercase text-slate-300">Kotak</span>
              </div>
            </div>

            {/* Score & Lives bar */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-white/10 border border-white/15 backdrop-blur-md p-2 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Total Skor:</span>
                <span className="text-sm font-black text-amber-300">⭐ {activePlayer.score}</span>
              </div>

              {settings.useLives ? (
                <div className="bg-white/10 border border-white/15 backdrop-blur-md p-2 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Nyawa:</span>
                  <span className="text-xs font-black text-rose-300">
                    {'❤️'.repeat(Math.max(0, activePlayer.lives))}
                  </span>
                </div>
              ) : (
                <div className="bg-white/10 border border-white/15 backdrop-blur-md p-2 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Benar:</span>
                  <span className="text-xs font-black text-emerald-300">
                    🧠 {activePlayer.correctAnswersCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Live Action Ticker / Notification Box */}
          <div className="bg-white/10 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 shadow-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
              {gameMessage}
            </p>
          </div>

          {/* Dice & Roll Action Box */}
          <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center justify-center">
            <Dice
              value={diceValue}
              isRolling={isRolling}
              disabled={isMoving || activePlayer.isBot || !!winner}
              onRoll={handleRollDice}
              playerName={activePlayer.name}
              playerColor={activePlayer.character.color}
            />
          </div>
        </div>
      </main>

      {/* Footer Helper info */}
      <footer className="max-w-6xl w-full mx-auto flex items-center justify-between text-[11px] text-slate-300 font-semibold px-2 py-1 relative z-10">
        <span>💡 Tips: Klik sembarang kotak di papan untuk melihat informasi.</span>
        <span>Ular Tangga Interaktif SD</span>
      </footer>

      {/* ================= MODALS ================= */}

      {/* 1. Question Modal */}
      {activeQuestion && (
        <QuestionModal
          question={activeQuestion.question}
          reason={activeQuestion.reason}
          playerName={activePlayer.name}
          onAnswer={isCorrect =>
            handleAnswerCallback(
              isCorrect,
              activeQuestion.reason,
              activeQuestion.targetTileIfCorrect,
              activeQuestion.targetTileIfWrong
            )
          }
        />
      )}

      {/* 2. Material Modal */}
      {activeMaterial && (
        <MaterialModal
          material={activeMaterial}
          onClose={handleMaterialUnderstood}
          playerName={activePlayer.name}
        />
      )}

      {/* 3. Victory Modal */}
      {winner && (
        <VictoryModal
          winner={winner}
          players={players}
          onPlayAgain={handlePlayAgain}
          onGoHome={onExitToMenu}
          onGoMaterials={onGoMaterials}
          currentStudent={currentStudent}
        />
      )}

      {/* 4. Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSettingsChanged={updated => setSettings(updated)}
        />
      )}

      {/* 5. Tile Info Tooltip Modal */}
      {tileInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-slate-900/85 backdrop-blur-2xl p-5 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3 text-center text-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 font-black text-lg flex items-center justify-center mx-auto shadow-inner">
              #{tileInfoModal.tileNumber}
            </div>
            <p className="text-sm font-bold text-slate-200 leading-relaxed">
              {tileInfoModal.text}
            </p>
            <button
              onClick={() => setTileInfoModal(null)}
              className="mt-1 py-2.5 px-4 rounded-xl bg-amber-500/90 hover:bg-amber-500 text-white font-black text-xs cursor-pointer border border-white/20 transition-all"
            >
              Tutup Info
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
