/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { GameSetup } from './components/GameSetup';
import { GameScreen } from './components/GameScreen';
import { MaterialsHub } from './components/MaterialsHub';
import { QuestionsHub } from './components/QuestionsHub';
import { AchievementsHub } from './components/AchievementsHub';
import { SettingsModal } from './components/SettingsModal';
import { StudentAuthModal } from './components/StudentAuthModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { ClassLevel, Difficulty, GameMode, Player, GameSettings, StudentProfile } from './types';
import { StorageService } from './services/storage';
import { FirebaseService } from './services/firebase';

type AppView = 'menu' | 'setup' | 'game' | 'materials' | 'questions' | 'achievements' | 'admin';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('menu');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(() =>
    StorageService.getCurrentStudent()
  );

  // Synchronize curriculum and student data with Cloud Firestore on startup
  useEffect(() => {
    StorageService.syncWithCloud().then(() => {
      // Refresh current student if updated in cloud
      const refreshedStudent = StorageService.getCurrentStudent();
      if (refreshedStudent) {
        setCurrentStudent(refreshedStudent);
      }
    });

    const unsubscribe = FirebaseService.listenToCurriculumUpdates({
      onMaterialsUpdated: (newMats) => {
        StorageService.saveMaterials(newMats, true);
      },
      onQuestionsUpdated: (newQs) => {
        StorageService.saveQuestions(newQs, true);
      },
      onBoardConfigUpdated: (newBoard) => {
        StorageService.saveBoardConfig(newBoard, true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Active game session configuration
  const [gameConfig, setGameConfig] = useState<{
    mode: GameMode;
    classLevel: ClassLevel;
    difficulty: Difficulty;
    players: Player[];
  } | null>(null);

  const handleStartPlay = () => {
    setCurrentView('setup');
  };

  const handleStartGameSession = (config: {
    mode: GameMode;
    classLevel: ClassLevel;
    difficulty: Difficulty;
    players: Player[];
  }) => {
    setGameConfig(config);
    setCurrentView('game');
  };

  const handleStudentChanged = (student: StudentProfile | null) => {
    setCurrentStudent(student);
  };

  return (
    <div className="font-sans antialiased min-h-screen text-slate-100 relative selection:bg-purple-500 selection:text-white">
      {/* 1. Main Menu View */}
      {currentView === 'menu' && (
        <MainMenu
          onStartPlay={handleStartPlay}
          onOpenMaterials={() => setCurrentView('materials')}
          onOpenQuestions={() => setCurrentView('questions')}
          onOpenAchievements={() => setCurrentView('achievements')}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenAdmin={() => setCurrentView('admin')}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onLogout={() => setCurrentStudent(null)}
          currentStudent={currentStudent}
        />
      )}

      {/* 2. Game Setup & Character Selection View */}
      {currentView === 'setup' && (
        <GameSetup
          onBackToMenu={() => setCurrentView('menu')}
          onStartGame={handleStartGameSession}
          onOpenAuthModal={() => setShowAuthModal(true)}
          currentStudent={currentStudent}
          onStudentChanged={handleStudentChanged}
        />
      )}

      {/* 3. Main Game Board & Loop View */}
      {currentView === 'game' && gameConfig && (
        <GameScreen
          initialPlayers={gameConfig.players}
          classLevel={gameConfig.classLevel}
          difficulty={gameConfig.difficulty}
          mode={gameConfig.mode}
          onExitToMenu={() => {
            // refresh student state upon returning to menu
            setCurrentStudent(StorageService.getCurrentStudent());
            setCurrentView('menu');
          }}
          onGoMaterials={() => setCurrentView('materials')}
          currentStudent={currentStudent}
        />
      )}

      {/* 4. Student Materials Learning Hub */}
      {currentView === 'materials' && (
        <MaterialsHub
          onBackToMenu={() => setCurrentView('menu')}
          onOpenAuthModal={() => setShowAuthModal(true)}
        />
      )}

      {/* 5. Student Questions Practice Hub */}
      {currentView === 'questions' && (
        <QuestionsHub
          onBackToMenu={() => setCurrentView('menu')}
          onOpenAuthModal={() => setShowAuthModal(true)}
        />
      )}

      {/* 6. Achievements & Badges Hub */}
      {currentView === 'achievements' && (
        <AchievementsHub
          onBackToMenu={() => setCurrentView('menu')}
          onOpenAuthModal={() => setShowAuthModal(true)}
          currentStudent={currentStudent}
          onStudentChanged={handleStudentChanged}
        />
      )}

      {/* 7. Teacher / Admin Management Panel */}
      {currentView === 'admin' && (
        <AdminPanel
          onBackToMenu={() => setCurrentView('menu')}
          onStudentChanged={handleStudentChanged}
        />
      )}

      {/* Settings Modal (Global) */}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onSettingsChanged={() => {}}
        />
      )}

      {/* Student Authentication Modal (Global) */}
      <StudentAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onStudentChanged={handleStudentChanged}
      />
    </div>
  );
}


