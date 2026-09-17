export type ClassLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type Difficulty = 'mudah' | 'sedang' | 'sulit';

export type QuestionType = 'multiple_choice' | 'true_false' | 'number_input';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  classLevel: ClassLevel;
  topic: string;
  question: string;
  type: QuestionType;
  options?: QuestionOption[]; // for multiple_choice & true_false
  correctAnswer: string; // ID for MC/TF or string representation of number
  explanation: string;
  difficulty: Difficulty;
  active: boolean;
}

export interface Material {
  id: string;
  classLevel: ClassLevel;
  topic: string;
  title: string;
  explanation: string;
  example: string;
  illustrationType?: 'fractions' | 'shapes' | 'clock' | 'money' | 'counting' | 'multiplication_grid' | 'volume' | 'generic';
  boxNumber?: number; // Tile on the board where this material appears
  active: boolean;
}

export interface Snake {
  id: string;
  head: number; // e.g. 98
  tail: number; // e.g. 78
}

export interface Ladder {
  id: string;
  start: number; // e.g. 4
  end: number; // e.g. 25
}

export type TileType = 'normal' | 'snake_head' | 'snake_tail' | 'ladder_start' | 'ladder_end' | 'material' | 'bonus' | 'trivia';

export interface TileSpecialInfo {
  boxNumber: number;
  type: 'material' | 'bonus' | 'trivia';
  materialId?: string;
  bonusPoints?: number;
  triviaText?: string;
}

export interface BoardConfig {
  snakes: Snake[];
  ladders: Ladder[];
  specialTiles: TileSpecialInfo[];
}

export interface PlayerCharacter {
  id: string;
  name: string;
  avatar: string; // emoji or icon
  color: string;
  bgGradient: string;
  shadowColor: string;
  quote: string;
}

export interface Player {
  id: string;
  name: string;
  character: PlayerCharacter;
  position: number;
  score: number;
  lives: number;
  isBot: boolean;
  streak: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  materialsLearned: string[];
}

export type GameMode = 'single' | 'two_player';

export interface GameSettings {
  useLives: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationSpeed: 'normal' | 'fast';
  difficulty: Difficulty;
  classLevel: ClassLevel;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export interface StudentGameRecord {
  id: string;
  date: string;
  playedAt?: string;
  mode: GameMode;
  classLevel: ClassLevel;
  difficulty: Difficulty;
  score: number;
  won: boolean;
  correctCount: number;
  wrongCount: number;
  positionReached: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  characterId?: string;
  createdAt: string;
  lastLoginAt: string;
  stats: GameStats;
  achievements: Achievement[];
  recentGames: StudentGameRecord[];
  gameHistory?: StudentGameRecord[];
}

export interface TeacherUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  highestScore: number;
  materialsReadCount: number;
  snakesAvoidedCount: number;
  laddersClimbedCount: number;
}
