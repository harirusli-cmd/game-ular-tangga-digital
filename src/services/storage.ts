import {
  Material,
  Question,
  BoardConfig,
  Achievement,
  GameStats,
  GameSettings,
  StudentProfile,
  StudentGameRecord,
  GameMode,
  ClassLevel,
  Difficulty,
  TeacherUser
} from '../types';
import {
  DEFAULT_MATERIALS,
  DEFAULT_QUESTIONS,
  DEFAULT_BOARD_CONFIG,
  DEFAULT_ACHIEVEMENTS
} from '../data/defaultData';
import { FirebaseService } from './firebase';

const STORAGE_KEYS = {
  MATERIALS: 'ular_tangga_materials_v1',
  QUESTIONS: 'ular_tangga_questions_v1',
  BOARD_CONFIG: 'ular_tangga_board_v1',
  ACHIEVEMENTS: 'ular_tangga_achievements_v1',
  STATS: 'ular_tangga_stats_v1',
  SETTINGS: 'ular_tangga_settings_v1',
  STUDENTS: 'ular_tangga_students_v1',
  CURRENT_STUDENT_ID: 'ular_tangga_current_student_id_v1',
  CURRENT_TEACHER: 'ular_tangga_current_teacher_v1'
};

const DEFAULT_SETTINGS: GameSettings = {
  useLives: true,
  soundEnabled: true,
  musicEnabled: true,
  animationSpeed: 'normal',
  difficulty: 'mudah',
  classLevel: 3
};

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  totalWrong: 0,
  highestScore: 0,
  materialsReadCount: 0,
  snakesAvoidedCount: 0,
  laddersClimbedCount: 0
};

export const AVATAR_OPTIONS = ['👦', '👧', '🦁', '🐱', '🦊', '🦖', '🤖', '🚀', '🐼', '⭐', '🦄', '🐯'];

export const StorageService = {
  // ================= CURRENT TEACHER CONTEXT & SCOPING =================
  getCurrentTeacher(): TeacherUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_TEACHER);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return FirebaseService.getCurrentTeacher();
  },

  setCurrentTeacher(teacher: TeacherUser | null): void {
    try {
      if (teacher) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_TEACHER, JSON.stringify(teacher));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_TEACHER);
      }
    } catch (e) {
      console.error('Failed to set current teacher in localStorage', e);
    }
  },

  getScopedKey(baseKey: string): string {
    const teacher = this.getCurrentTeacher();
    if (teacher && teacher.uid) {
      return `${baseKey}_teacher_${teacher.uid}`;
    }
    return baseKey;
  },

  // ================= STUDENT ACCOUNT & PROFILE MANAGEMENT =================
  getStudents(): StudentProfile[] {
    try {
      const scopedKey = this.getScopedKey(STORAGE_KEYS.STUDENTS);
      let data = localStorage.getItem(scopedKey);
      if (!data && scopedKey !== STORAGE_KEYS.STUDENTS) {
        data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      }
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      return parsed.map((s: any) => ({
        ...s,
        achievements: Array.isArray(s.achievements) ? s.achievements : [],
        stats: s.stats || {
          gamesPlayed: 0,
          gamesWon: 0,
          totalQuestionsAnswered: 0,
          totalCorrect: 0,
          totalWrong: 0,
          highestScore: 0,
          materialsReadCount: 0,
          snakesAvoidedCount: 0,
          laddersClimbedCount: 0
        },
        recentGames: Array.isArray(s.recentGames)
          ? s.recentGames
          : Array.isArray(s.gameHistory)
          ? s.gameHistory
          : [],
        gameHistory: Array.isArray(s.gameHistory)
          ? s.gameHistory
          : Array.isArray(s.recentGames)
          ? s.recentGames
          : []
      }));
    } catch {
      return [];
    }
  },

  getAllStudents(): StudentProfile[] {
    return this.getStudents();
  },

  saveStudents(students: StudentProfile[]): void {
    try {
      const sanitized = students.map(s => {
        const history = Array.isArray(s.recentGames)
          ? s.recentGames
          : Array.isArray(s.gameHistory)
          ? s.gameHistory
          : [];
        return {
          ...s,
          achievements: Array.isArray(s.achievements) ? s.achievements : [],
          stats: s.stats || { ...DEFAULT_STATS },
          recentGames: history,
          gameHistory: history
        };
      });

      const scopedKey = this.getScopedKey(STORAGE_KEYS.STUDENTS);
      localStorage.setItem(scopedKey, JSON.stringify(sanitized));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(sanitized));
    } catch (e) {
      console.error('Failed to save students', e);
    }
  },

  getCurrentStudent(): StudentProfile | null {
    try {
      const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
      if (!currentId) return null;

      const students = this.getStudents();
      const found = students.find(s => s.id === currentId);
      if (!found) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
        return null;
      }
      return found;
    } catch {
      return null;
    }
  },

  saveCurrentStudent(student: StudentProfile): void {
    try {
      const history = Array.isArray(student.recentGames)
        ? student.recentGames
        : Array.isArray(student.gameHistory)
        ? student.gameHistory
        : [];
      
      student.recentGames = history;
      student.gameHistory = history;
      student.stats = student.stats || { ...DEFAULT_STATS };
      student.achievements = Array.isArray(student.achievements) ? student.achievements : [];

      const students = this.getStudents();
      const index = students.findIndex(s => s.id === student.id);
      if (index >= 0) {
        students[index] = student;
      } else {
        students.push(student);
      }
      this.saveStudents(students);
      localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT_ID, student.id);

      const teacher = this.getCurrentTeacher();
      if (teacher) {
        FirebaseService.saveTeacherStudent(teacher.uid, student).catch(err => {
          console.error('Background cloud save teacher student error', err);
        });
      } else {
        FirebaseService.saveStudent(student).catch(err => {
          console.error('Background cloud save student error', err);
        });
      }
    } catch (e) {
      console.error('Failed to save current student', e);
    }
  },

  /**
   * Log in or register a student using only their name (kid-friendly, no password required).
   * If a student with the same name already exists (case-insensitive), switches to their profile.
   * Otherwise, creates a fresh student profile with clean achievements & stats.
   */
  loginStudent(rawName: string, avatarChoice?: string): StudentProfile {
    const cleanName = rawName.trim();
    if (!cleanName) {
      throw new Error('Nama siswa tidak boleh kosong');
    }

    const students = this.getStudents();
    const existingIndex = students.findIndex(
      s => (s.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Existing student found -> update last login
      const student = students[existingIndex];
      student.lastLoginAt = now;
      if (avatarChoice) {
        student.avatar = avatarChoice;
      }
      students[existingIndex] = student;
      this.saveStudents(students);
      localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT_ID, student.id);

      const teacher = this.getCurrentTeacher();
      if (teacher) {
        FirebaseService.saveTeacherStudent(teacher.uid, student).catch(err => {
          console.error('Background cloud update teacher student error', err);
        });
      } else {
        FirebaseService.saveStudent(student).catch(err => {
          console.error('Background cloud update student error', err);
        });
      }
      return student;
    }

    // New student registration
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
    const chosenAvatar = avatarChoice || randomAvatar;
    const newId = 'student_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Deep copy achievements template
    const initialAchievements: Achievement[] = DEFAULT_ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: false,
      progress: 0,
      unlockedAt: undefined
    }));

    const newStudent: StudentProfile = {
      id: newId,
      name: cleanName,
      avatar: chosenAvatar,
      createdAt: now,
      lastLoginAt: now,
      stats: { ...DEFAULT_STATS },
      achievements: initialAchievements,
      recentGames: [],
      gameHistory: []
    };

    students.push(newStudent);
    this.saveStudents(students);
    localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT_ID, newId);

    const teacher = this.getCurrentTeacher();
    if (teacher) {
      FirebaseService.saveTeacherStudent(teacher.uid, newStudent).catch(err => {
        console.error('Background cloud create teacher student error', err);
      });
    } else {
      FirebaseService.saveStudent(newStudent).catch(err => {
        console.error('Background cloud create student error', err);
      });
    }
    return newStudent;
  },

  logoutStudent(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
    } catch (e) {
      console.error('Failed to logout student', e);
    }
  },

  switchStudent(studentId: string): StudentProfile | null {
    const students = this.getStudents();
    const found = students.find(s => s.id === studentId);
    if (found) {
      found.lastLoginAt = new Date().toISOString();
      this.saveStudents(students);
      localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT_ID, found.id);

      const teacher = this.getCurrentTeacher();
      if (teacher) {
        FirebaseService.saveTeacherStudent(teacher.uid, found).catch(err => {
          console.error('Background cloud update teacher student error', err);
        });
      } else {
        FirebaseService.saveStudent(found).catch(err => {
          console.error('Background cloud update student error', err);
        });
      }
      return found;
    }
    return null;
  },

  deleteStudent(studentId: string): void {
    let students = this.getStudents();
    students = students.filter(s => s.id !== studentId);
    this.saveStudents(students);

    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
    if (currentId === studentId) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
    }

    const teacher = this.getCurrentTeacher();
    if (teacher) {
      FirebaseService.deleteTeacherStudent(teacher.uid, studentId).catch(err => {
        console.error('Background cloud delete teacher student error', err);
      });
    } else {
      FirebaseService.deleteStudent(studentId).catch(err => {
        console.error('Background cloud delete student error', err);
      });
    }
  },

  resetStudentProgress(studentId: string): void {
    const students = this.getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    student.stats = { ...DEFAULT_STATS };
    student.recentGames = [];
    student.gameHistory = [];
    student.achievements = DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, progress: 0, unlockedAt: undefined }));

    this.saveStudents(students);
    const teacher = this.getCurrentTeacher();
    if (teacher) {
      FirebaseService.saveTeacherStudent(teacher.uid, student).catch(err => {
        console.error('Background cloud reset teacher student error', err);
      });
    } else {
      FirebaseService.saveStudent(student).catch(err => {
        console.error('Background cloud reset student error', err);
      });
    }
  },

  recordStudentGame(summary: {
    mode: GameMode;
    classLevel: ClassLevel;
    difficulty: Difficulty;
    score: number;
    won: boolean;
    correctCount: number;
    wrongCount: number;
    positionReached: number;
  }): void {
    const student = this.getCurrentStudent();
    if (!student) return;

    const now = new Date().toISOString();
    const gameRecord: StudentGameRecord = {
      id: 'game_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: now,
      playedAt: now,
      ...summary
    };

    const existingHistory = Array.isArray(student.recentGames)
      ? student.recentGames
      : Array.isArray(student.gameHistory)
      ? student.gameHistory
      : [];
    const updatedRecent = [gameRecord, ...existingHistory].slice(0, 50);

    const currentStats = student.stats || { ...DEFAULT_STATS };
    const updatedStats: GameStats = {
      gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
      gamesWon: (currentStats.gamesWon || 0) + (summary.won ? 1 : 0),
      totalQuestionsAnswered: (currentStats.totalQuestionsAnswered || 0) + summary.correctCount + summary.wrongCount,
      totalCorrect: (currentStats.totalCorrect || 0) + summary.correctCount,
      totalWrong: (currentStats.totalWrong || 0) + summary.wrongCount,
      highestScore: Math.max(currentStats.highestScore || 0, summary.score),
      materialsReadCount: currentStats.materialsReadCount || 0,
      snakesAvoidedCount: currentStats.snakesAvoidedCount || 0,
      laddersClimbedCount: currentStats.laddersClimbedCount || 0
    };

    student.recentGames = updatedRecent;
    student.gameHistory = updatedRecent;
    student.stats = updatedStats;
    student.lastLoginAt = now;

    // Check specific game-end achievements for this student
    if (summary.won) {
      this.updateAchievementProgress('first_win', 1);
    }
    if (summary.score >= 150) {
      this.updateAchievementProgress('high_scorer', summary.score);
    }

    this.saveCurrentStudent(student);
  },

  // --- MATERIALS ---
  getMaterials(): Material[] {
    try {
      const scopedKey = this.getScopedKey(STORAGE_KEYS.MATERIALS);
      const data = localStorage.getItem(scopedKey) || localStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (!data) {
        this.saveMaterials(DEFAULT_MATERIALS);
        return DEFAULT_MATERIALS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_MATERIALS;
    }
  },

  saveMaterials(materials: Material[], skipCloud: boolean = false): void {
    try {
      const scopedKey = this.getScopedKey(STORAGE_KEYS.MATERIALS);
      localStorage.setItem(scopedKey, JSON.stringify(materials));
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
      if (!skipCloud) {
        const teacher = this.getCurrentTeacher();
        if (teacher) {
          FirebaseService.saveTeacherMaterials(teacher.uid, materials).catch(e => {
            console.error('Failed to sync teacher materials to cloud', e);
          });
        } else {
          FirebaseService.saveMaterials(materials).catch(e => {
            console.error('Failed to sync materials to cloud', e);
          });
        }
      }
    } catch (e) {
      console.error('Failed to save materials', e);
    }
  },

  // --- QUESTIONS ---
  getQuestions(): Question[] {
    try {
      const scopedKey = this.getScopedKey(STORAGE_KEYS.QUESTIONS);
      const data = localStorage.getItem(scopedKey) || localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (!data) {
        this.saveQuestions(DEFAULT_QUESTIONS);
        return DEFAULT_QUESTIONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_QUESTIONS;
    }
  },

  saveQuestions(questions: Question[], skipCloud: boolean = false): void {
    try {
      const scopedKey = this.getScopedKey(STORAGE_KEYS.QUESTIONS);
      localStorage.setItem(scopedKey, JSON.stringify(questions));
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
      if (!skipCloud) {
        const teacher = this.getCurrentTeacher();
        if (teacher) {
          FirebaseService.saveTeacherQuestions(teacher.uid, questions).catch(e => {
            console.error('Failed to sync teacher questions to cloud', e);
          });
        } else {
          FirebaseService.saveQuestions(questions).catch(e => {
            console.error('Failed to sync questions to cloud', e);
          });
        }
      }
    } catch (e) {
      console.error('Failed to save questions', e);
    }
  },

  // --- BOARD CONFIG ---
  getBoardConfig(): BoardConfig {
    try {
      const scopedKey = this.getScopedKey(STORAGE_KEYS.BOARD_CONFIG);
      const data = localStorage.getItem(scopedKey) || localStorage.getItem(STORAGE_KEYS.BOARD_CONFIG);
      if (!data) {
        this.saveBoardConfig(DEFAULT_BOARD_CONFIG);
        return DEFAULT_BOARD_CONFIG;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_BOARD_CONFIG;
    }
  },

  saveBoardConfig(config: BoardConfig, skipCloud: boolean = false): void {
    try {
      const scopedKey = this.getScopedKey(STORAGE_KEYS.BOARD_CONFIG);
      localStorage.setItem(scopedKey, JSON.stringify(config));
      localStorage.setItem(STORAGE_KEYS.BOARD_CONFIG, JSON.stringify(config));
      if (!skipCloud) {
        const teacher = this.getCurrentTeacher();
        if (teacher) {
          FirebaseService.saveTeacherBoardConfig(teacher.uid, config).catch(e => {
            console.error('Failed to sync teacher board config to cloud', e);
          });
        } else {
          FirebaseService.saveBoardConfig(config).catch(e => {
            console.error('Failed to sync board config to cloud', e);
          });
        }
      }
    } catch (e) {
      console.error('Failed to save board config', e);
    }
  },

  /**
   * Synchronize local data with Cloud Firestore.
   * If an admin teacher is logged in, syncs strictly from their isolated Google account collection!
   */
  async syncWithCloud(onSyncComplete?: () => void): Promise<boolean> {
    const teacher = this.getCurrentTeacher();
    const localMaterials = this.getMaterials();
    const localQuestions = this.getQuestions();
    const localBoard = this.getBoardConfig();
    const localStudents = this.getStudents();

    if (teacher && teacher.uid) {
      const success = await FirebaseService.initAndSyncTeacher(
        teacher.uid,
        {
          materials: localMaterials,
          questions: localQuestions,
          boardConfig: localBoard
        },
        {
          onMaterialsUpdated: (cloudMaterials) => {
            try {
              const scopedKey = this.getScopedKey(STORAGE_KEYS.MATERIALS);
              localStorage.setItem(scopedKey, JSON.stringify(cloudMaterials));
              localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(cloudMaterials));
            } catch (e) {
              console.error(e);
            }
          },
          onQuestionsUpdated: (cloudQuestions) => {
            try {
              const scopedKey = this.getScopedKey(STORAGE_KEYS.QUESTIONS);
              localStorage.setItem(scopedKey, JSON.stringify(cloudQuestions));
              localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(cloudQuestions));
            } catch (e) {
              console.error(e);
            }
          },
          onBoardConfigUpdated: (cloudBoard) => {
            try {
              const scopedKey = this.getScopedKey(STORAGE_KEYS.BOARD_CONFIG);
              localStorage.setItem(scopedKey, JSON.stringify(cloudBoard));
              localStorage.setItem(STORAGE_KEYS.BOARD_CONFIG, JSON.stringify(cloudBoard));
            } catch (e) {
              console.error(e);
            }
          },
          onStudentsUpdated: (cloudStudents) => {
            try {
              const studentMap = new Map<string, StudentProfile>();
              localStudents.forEach(s => studentMap.set(s.id, s));
              cloudStudents.forEach(s => studentMap.set(s.id, s));
              const merged = Array.from(studentMap.values());
              const scopedKey = this.getScopedKey(STORAGE_KEYS.STUDENTS);
              localStorage.setItem(scopedKey, JSON.stringify(merged));
              localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(merged));
            } catch (e) {
              console.error(e);
            }
          }
        }
      );

      if (onSyncComplete) onSyncComplete();
      return success;
    }

    // Fallback sync when no teacher is logged in
    const success = await FirebaseService.initAndSync(
      {
        materials: localMaterials,
        questions: localQuestions,
        boardConfig: localBoard
      },
      {
        onMaterialsUpdated: (cloudMaterials) => {
          try {
            localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(cloudMaterials));
          } catch (e) {
            console.error(e);
          }
        },
        onQuestionsUpdated: (cloudQuestions) => {
          try {
            localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(cloudQuestions));
          } catch (e) {
            console.error(e);
          }
        },
        onBoardConfigUpdated: (cloudBoard) => {
          try {
            localStorage.setItem(STORAGE_KEYS.BOARD_CONFIG, JSON.stringify(cloudBoard));
          } catch (e) {
            console.error(e);
          }
        },
        onStudentsUpdated: (cloudStudents) => {
          try {
            const studentMap = new Map<string, StudentProfile>();
            localStudents.forEach(s => studentMap.set(s.id, s));
            cloudStudents.forEach(s => studentMap.set(s.id, s));
            const merged = Array.from(studentMap.values());
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(merged));
          } catch (e) {
            console.error(e);
          }
        }
      }
    );

    if (onSyncComplete) onSyncComplete();
    return success;
  },

  // --- ACHIEVEMENTS ---
  getAchievements(): Achievement[] {
    const student = this.getCurrentStudent();
    if (student && student.achievements && student.achievements.length > 0) {
      // Ensure all default achievements exist in student's profile
      const studentMap = new Map<string, Achievement>(student.achievements.map((a: Achievement) => [a.id, a]));
      const merged: Achievement[] = DEFAULT_ACHIEVEMENTS.map(def => {
        const found = studentMap.get(def.id);
        return found ? found : { ...def, unlocked: false, progress: 0 };
      });
      return merged;
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (!data) {
        this.saveAchievements(DEFAULT_ACHIEVEMENTS);
        return DEFAULT_ACHIEVEMENTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_ACHIEVEMENTS;
    }
  },

  saveAchievements(achievements: Achievement[]): void {
    const student = this.getCurrentStudent();
    if (student) {
      student.achievements = achievements;
      this.saveCurrentStudent(student);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (e) {
      console.error('Failed to save achievements', e);
    }
  },

  updateAchievementProgress(id: string, delta: number): Achievement | null {
    const list = this.getAchievements();
    const item = list.find(a => a.id === id);
    if (!item) return null;

    item.progress = Math.min(item.maxProgress, item.progress + delta);
    if (item.progress >= item.maxProgress && !item.unlocked) {
      item.unlocked = true;
      item.unlockedAt = new Date().toISOString();
    }
    this.saveAchievements(list);
    return item;
  },

  // --- STATS ---
  getStats(): GameStats {
    const student = this.getCurrentStudent();
    if (student && student.stats) {
      return { ...DEFAULT_STATS, ...student.stats };
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!data) {
        this.saveStats(DEFAULT_STATS);
        return DEFAULT_STATS;
      }
      return { ...DEFAULT_STATS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_STATS;
    }
  },

  saveStats(stats: GameStats): void {
    const student = this.getCurrentStudent();
    if (student) {
      student.stats = stats;
      this.saveCurrentStudent(student);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }
  },

  recordGameStats(delta: Partial<GameStats>): GameStats {
    const current = this.getStats();
    const updated: GameStats = {
      gamesPlayed: current.gamesPlayed + (delta.gamesPlayed || 0),
      gamesWon: current.gamesWon + (delta.gamesWon || 0),
      totalQuestionsAnswered: current.totalQuestionsAnswered + (delta.totalQuestionsAnswered || 0),
      totalCorrect: current.totalCorrect + (delta.totalCorrect || 0),
      totalWrong: current.totalWrong + (delta.totalWrong || 0),
      highestScore: Math.max(current.highestScore, delta.highestScore || 0),
      materialsReadCount: current.materialsReadCount + (delta.materialsReadCount || 0),
      snakesAvoidedCount: current.snakesAvoidedCount + (delta.snakesAvoidedCount || 0),
      laddersClimbedCount: current.laddersClimbedCount + (delta.laddersClimbedCount || 0)
    };
    this.saveStats(updated);
    return updated;
  },

  // --- SETTINGS ---
  getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  // --- RESET ALL DATA ---
  resetAllToDefault(): void {
    this.saveMaterials(DEFAULT_MATERIALS);
    this.saveQuestions(DEFAULT_QUESTIONS);
    this.saveBoardConfig(DEFAULT_BOARD_CONFIG);
    this.saveAchievements(DEFAULT_ACHIEVEMENTS);
    this.saveStats(DEFAULT_STATS);
    this.saveSettings(DEFAULT_SETTINGS);
  },

  // --- EXPORT / IMPORT ALL ---
  exportBackupJSON(): string {
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      materials: this.getMaterials(),
      questions: this.getQuestions(),
      boardConfig: this.getBoardConfig(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.materials)) this.saveMaterials(data.materials);
      if (Array.isArray(data.questions)) this.saveQuestions(data.questions);
      if (data.boardConfig && Array.isArray(data.boardConfig.snakes)) this.saveBoardConfig(data.boardConfig);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};
