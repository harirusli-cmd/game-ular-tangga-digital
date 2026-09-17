import React, { useState, useEffect } from 'react';
import {
  Material,
  Question,
  BoardConfig,
  ClassLevel,
  Difficulty,
  QuestionType,
  Snake,
  Ladder,
  TileSpecialInfo,
  StudentProfile,
  TeacherUser
} from '../../types';
import { StorageService, AVATAR_OPTIONS } from '../../services/storage';
import { FirebaseService, subscribeToCloudSync, CloudSyncStatus } from '../../services/firebase';
import { sound } from '../../utils/audio';
import { MaterialModal } from '../MaterialModal';
import { QuestionModal } from '../QuestionModal';
import { BoardEngine } from '../../services/boardEngine';
import { BoardGraphics } from '../BoardGraphics';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Grid,
  Database,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Save,
  RotateCcw,
  Download,
  Upload,
  ArrowLeft,
  CheckCircle,
  Search,
  Filter,
  Users,
  Trophy,
  History,
  Star,
  Cloud,
  RefreshCw,
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus,
  Lock,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';

interface AdminPanelProps {
  onBackToMenu: () => void;
  onStudentChanged?: (student: StudentProfile | null) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToMenu, onStudentChanged }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'materials' | 'questions' | 'board' | 'students' | 'backup'>('dashboard');

  // Google Auth for Teacher/Admin
  const [currentTeacher, setCurrentTeacher] = useState<TeacherUser | null>(() => {
    return StorageService.getCurrentTeacher() || FirebaseService.getCurrentTeacher();
  });
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Stored state
  const [materials, setMaterials] = useState<Material[]>(() => StorageService.getMaterials());
  const [questions, setQuestions] = useState<Question[]>(() => StorageService.getQuestions());
  const [boardConfig, setBoardConfig] = useState<BoardConfig>(() => StorageService.getBoardConfig());
  const [students, setStudents] = useState<StudentProfile[]>(() => StorageService.getAllStudents());
  const [studentSearch, setStudentSearch] = useState<string>('');
  const stats = StorageService.getStats();

  // Modals in Student Tab
  const [isAddingStudent, setIsAddingStudent] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentAvatar, setNewStudentAvatar] = useState<string>('👦');
  const [viewingStudentHistory, setViewingStudentHistory] = useState<StudentProfile | null>(null);

  // Previews
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Forms - Material
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isAddingMaterial, setIsAddingMaterial] = useState<boolean>(false);

  // Forms - Question
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);

  // Filters & Search
  const [filterGrade, setFilterGrade] = useState<number>(0); // 0 = all
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected tile in Board Editor
  const [selectedTileNum, setSelectedTileNum] = useState<number | null>(null);
  const [notification, setNotification] = useState<string>('');

  // Cloud Sync Status
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>('connecting');
  const [cloudMessage, setCloudMessage] = useState<string>('Menghubungkan ke Cloud Firestore...');
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Listen to Google Auth state changes
  useEffect(() => {
    const unsubAuth = FirebaseService.onTeacherAuthStateChanged(teacher => {
      setCurrentTeacher(teacher);
      StorageService.setCurrentTeacher(teacher);
      if (teacher) {
        StorageService.syncWithCloud().then(() => {
          setMaterials(StorageService.getMaterials());
          setQuestions(StorageService.getQuestions());
          setBoardConfig(StorageService.getBoardConfig());
          setStudents(StorageService.getAllStudents());
        });
      }
    });
    return () => unsubAuth();
  }, []);

  // Sync with Cloud Firestore on mount and subscribe to real-time curriculum updates
  useEffect(() => {
    const unsubStatus = subscribeToCloudSync((status, msg) => {
      setCloudStatus(status);
      if (msg) setCloudMessage(msg);
    });

    StorageService.syncWithCloud().then(() => {
      setMaterials(StorageService.getMaterials());
      setQuestions(StorageService.getQuestions());
      setBoardConfig(StorageService.getBoardConfig());
      setStudents(StorageService.getAllStudents());
    });

    const unsubCurriculum = FirebaseService.listenToCurriculumUpdates({
      onMaterialsUpdated: newMats => {
        setMaterials(newMats);
        StorageService.saveMaterials(newMats, true);
      },
      onQuestionsUpdated: newQs => {
        setQuestions(newQs);
        StorageService.saveQuestions(newQs, true);
      },
      onBoardConfigUpdated: newBoard => {
        setBoardConfig(newBoard);
        StorageService.saveBoardConfig(newBoard, true);
      }
    });

    return () => {
      unsubStatus();
      unsubCurriculum();
    };
  }, [currentTeacher?.uid]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      sound.playPop();
      const teacher = await FirebaseService.loginWithGoogle();
      setCurrentTeacher(teacher);
      StorageService.setCurrentTeacher(teacher);
      sound.playBonus();
      showNotice(`Selamat datang, ${teacher.displayName}!`);
      await StorageService.syncWithCloud();
      setMaterials(StorageService.getMaterials());
      setQuestions(StorageService.getQuestions());
      setBoardConfig(StorageService.getBoardConfig());
      setStudents(StorageService.getAllStudents());
    } catch (err: any) {
      console.error('Google login error', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLoginError('Jendela login Google ditutup sebelum proses selesai.');
      } else if (err.code === 'auth/popup-blocked') {
        setLoginError('Pop-up login diblokir browser. Silakan izinkan pop-up lalu coba lagi.');
      } else {
        setLoginError(err.message || 'Gagal masuk dengan Akun Google.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleTeacherLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari akun Google ini?')) return;
    sound.playPop();
    try {
      await FirebaseService.logoutTeacher();
    } catch (e) {
      console.error(e);
    }
    setCurrentTeacher(null);
    StorageService.setCurrentTeacher(null);
    showNotice('Anda telah keluar dari akun Google.');
  };

  const handleManualCloudSync = async () => {
    setIsManualSyncing(true);
    sound.playPop();
    showNotice('🔄 Sedang menyinkronkan data dengan Cloud Firestore...');
    const ok = await StorageService.syncWithCloud();
    setMaterials(StorageService.getMaterials());
    setQuestions(StorageService.getQuestions());
    setBoardConfig(StorageService.getBoardConfig());
    setStudents(StorageService.getAllStudents());
    setIsManualSyncing(false);
    if (ok) {
      sound.playBonus();
      showNotice('✨ Data berhasil disinkronkan dengan Cloud untuk semua perangkat!');
    } else {
      showNotice('⚠️ Gagal terhubung ke Cloud. Data tersimpan di memori perangkat ini.');
    }
  };

  // --- MATERIAL HANDLERS ---
  const handleSaveMaterial = (mat: Material) => {
    let updated: Material[];
    if (editingMaterial) {
      updated = materials.map(m => (m.id === mat.id ? mat : m));
    } else {
      updated = [...materials, { ...mat, id: `mat_${Date.now()}` }];
    }
    setMaterials(updated);
    StorageService.saveMaterials(updated);
    setEditingMaterial(null);
    setIsAddingMaterial(false);
    sound.playBonus();
    showNotice('Materi berhasil disimpan! 🎉');
  };

  const handleDeleteMaterial = (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus materi ini?')) return;
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    StorageService.saveMaterials(updated);
    sound.playPop();
    showNotice('Materi berhasil dihapus.');
  };

  // --- QUESTION HANDLERS ---
  const handleSaveQuestion = (q: Question) => {
    let updated: Question[];
    if (editingQuestion) {
      updated = questions.map(item => (item.id === q.id ? q : item));
    } else {
      updated = [...questions, { ...q, id: `q_${Date.now()}` }];
    }
    setQuestions(updated);
    StorageService.saveQuestions(updated);
    setEditingQuestion(null);
    setIsAddingQuestion(false);
    sound.playBonus();
    showNotice('Soal berhasil disimpan! 🎉');
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm('Hapus soal ini dari bank soal?')) return;
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    StorageService.saveQuestions(updated);
    sound.playPop();
    showNotice('Soal berhasil dihapus.');
  };

  // --- BOARD EDITOR HANDLERS ---
  const handleTileActionChange = (actionType: 'normal' | 'snake' | 'ladder' | 'material' | 'bonus' | 'trivia', params?: {
    targetTile?: number;
    materialId?: string;
    bonusPoints?: number;
    triviaText?: string;
  }) => {
    if (!selectedTileNum) return;

    const t = selectedTileNum;
    const newConfig: BoardConfig = {
      snakes: boardConfig.snakes.filter(s => s.head !== t && s.tail !== t),
      ladders: boardConfig.ladders.filter(l => l.start !== t && l.end !== t),
      specialTiles: boardConfig.specialTiles.filter(st => st.boxNumber !== t)
    };

    if (actionType === 'snake' && params?.targetTile && params.targetTile < t) {
      newConfig.snakes.push({ id: `snake_${Date.now()}`, head: t, tail: params.targetTile });
    } else if (actionType === 'ladder' && params?.targetTile && params.targetTile > t) {
      newConfig.ladders.push({ id: `ladder_${Date.now()}`, start: t, end: params.targetTile });
    } else if (actionType === 'material') {
      newConfig.specialTiles.push({ boxNumber: t, type: 'material', materialId: params?.materialId });
    } else if (actionType === 'bonus') {
      newConfig.specialTiles.push({ boxNumber: t, type: 'bonus', bonusPoints: params?.bonusPoints || 20 });
    } else if (actionType === 'trivia') {
      newConfig.specialTiles.push({ boxNumber: t, type: 'trivia', triviaText: params?.triviaText || 'Fakta seru & wawasan baru!' });
    }

    setBoardConfig(newConfig);
    StorageService.saveBoardConfig(newConfig);
    sound.playPop();
    showNotice(`Kotak ${t} berhasil diperbarui.`);
  };

  // Filtered lists
  const filteredMaterials = materials.filter(m => {
    const matchGrade = filterGrade === 0 || m.classLevel === filterGrade;
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGrade && matchSearch;
  });

  const filteredQuestions = questions.filter(q => {
    const matchGrade = filterGrade === 0 || q.classLevel === filterGrade;
    const matchSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGrade && matchSearch;
  });

  // If teacher is not logged in with Google, require Google Auth
  if (!currentTeacher) {
    return (
      <div className="min-h-screen relative text-slate-100 p-4 sm:p-6 flex flex-col justify-between">
        {/* Top Header */}
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
          <button
            id="btn-admin-auth-back"
            onClick={() => {
              sound.playPop();
              onBackToMenu();
            }}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold flex items-center gap-2 transition-all cursor-pointer text-sm backdrop-blur-md shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu Game</span>
          </button>
          <div className="text-xs bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 backdrop-blur-md">
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>Akses Khusus Guru & Admin</span>
          </div>
        </header>

        {/* Center Login Box */}
        <div className="max-w-xl mx-auto w-full my-auto py-8">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            {/* Icon Banner */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/30 to-indigo-500/30 border border-white/30 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/10 backdrop-blur-xl">
                👨‍🏫
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white text-slate-800 flex items-center justify-center shadow-lg border border-slate-200">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Panel Guru & Admin
            </h2>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed max-w-md">
              Masuk menggunakan <strong>Akun Google</strong> untuk mengelola kurikulum kustom Anda. Setiap materi, bank soal, konfigurasi papan, dan data siswa tersimpan aman secara <strong>terisolasi di akun Google Anda masing-masing</strong>.
            </p>

            {/* Feature Highlights */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-6 text-left">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                <span className="text-base">🔒</span>
                <span className="text-xs font-bold text-amber-200">Data Terisolasi</span>
                <span className="text-[11px] text-slate-300 leading-tight">Editan Anda tidak bercampur dengan guru lain.</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                <span className="text-base">☁️</span>
                <span className="text-xs font-bold text-teal-200">Sinkron Cloud</span>
                <span className="text-[11px] text-slate-300 leading-tight">Tersimpan otomatis di Firestore real-time.</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                <span className="text-base">🎓</span>
                <span className="text-xs font-bold text-sky-200">Data Siswa Kelas</span>
                <span className="text-[11px] text-slate-300 leading-tight">Pantau nilai & riwayat sesi siswa Anda.</span>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="w-full mb-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Google Sign-in Button */}
            <button
              id="btn-admin-google-login"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl hover:shadow-2xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group border border-slate-200"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                  <span>Menghubungkan ke Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Masuk dengan Akun Google</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 mt-4">
              Masuk langsung dan aman melalui Google Authentication.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto w-full text-center py-2 text-xs text-slate-400">
          Ular Tangga Interaktif • Platform Kuis & Pembelajaran Edukatif
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-slate-100 pb-16">
      {/* Top Navbar */}
      <header className="bg-white/10 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="btn-admin-back-menu"
              onClick={() => {
                sound.playPop();
                onBackToMenu();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer text-sm backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Menu Game</span>
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <span>👨‍🏫 Panel Guru & Admin</span>
                <span className="text-xs bg-amber-500/30 border border-amber-400/40 text-amber-200 font-bold px-2 py-0.5 rounded-md hidden sm:inline-block">
                  Kelola Konten
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Teacher Profile Chip */}
            {currentTeacher && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md">
                {currentTeacher.photoURL ? (
                  <img
                    src={currentTeacher.photoURL}
                    alt={currentTeacher.displayName}
                    className="w-6 h-6 rounded-full border border-amber-300/60 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-500/40 border border-amber-300/60 text-amber-200 text-xs font-bold flex items-center justify-center">
                    {currentTeacher.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight max-w-[130px] truncate">
                    {currentTeacher.displayName}
                  </span>
                  <span className="text-[10px] text-amber-300/80 leading-tight max-w-[130px] truncate">
                    {currentTeacher.email}
                  </span>
                </div>
                <button
                  id="btn-admin-logout"
                  onClick={handleTeacherLogout}
                  className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-400/40 transition-all cursor-pointer text-xs ml-1"
                  title="Keluar dari Akun Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Cloud Sync Status Badge */}
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border backdrop-blur-md transition-all ${
                cloudStatus === 'synced'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : cloudStatus === 'syncing'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse'
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
              }`}
              title={cloudMessage}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {cloudStatus === 'synced'
                  ? 'Cloud Tersinkron'
                  : cloudStatus === 'syncing'
                  ? 'Menyinkronkan...'
                  : 'Mode Offline'}
              </span>
            </div>

            {/* Manual Sync Button */}
            <button
              id="btn-admin-sync-cloud"
              onClick={handleManualCloudSync}
              disabled={isManualSyncing}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md active:scale-95 disabled:opacity-50"
              title="Sinkronkan dengan Cloud Firestore untuk akun Google ini"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin text-amber-300' : ''}`} />
              <span className="hidden md:inline">Sinkronkan</span>
            </button>

            {notification && (
              <div className="text-xs bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in shadow-lg backdrop-blur-md">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="max-w-[180px] sm:max-w-xs truncate">{notification}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto border-t border-white/10 py-2">
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('dashboard');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md border ${
              activeTab === 'dashboard'
                ? 'bg-amber-500/80 border-amber-300 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('materials');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md border ${
              activeTab === 'materials'
                ? 'bg-amber-500/80 border-amber-300 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Materi ({materials.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('questions');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md border ${
              activeTab === 'questions'
                ? 'bg-amber-500/80 border-amber-300 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Bank Soal ({questions.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('board');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md border ${
              activeTab === 'board'
                ? 'bg-amber-500/80 border-amber-300 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Editor Papan 1-100</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setStudents(StorageService.getAllStudents());
              setActiveTab('students');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md border ${
              activeTab === 'students'
                ? 'bg-amber-500/80 border-amber-300 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Siswa ({students.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('backup');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md border ${
              activeTab === 'backup'
                ? 'bg-amber-500/80 border-amber-300 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Cadangan / Reset</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col text-white">
                <span className="text-xs font-bold text-slate-300">Total Materi Aktif</span>
                <span className="text-3xl font-black text-teal-300 mt-1">{materials.filter(m => m.active).length}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">dari {materials.length} total materi</span>
              </div>

              <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col text-white">
                <span className="text-xs font-bold text-slate-300">Total Bank Soal</span>
                <span className="text-3xl font-black text-amber-300 mt-1">{questions.filter(q => q.active).length}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">dari {questions.length} total soal</span>
              </div>

              <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col text-white">
                <span className="text-xs font-bold text-slate-300">Permainan Dimainkan</span>
                <span className="text-3xl font-black text-blue-300 mt-1">{stats.gamesPlayed}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">{stats.gamesWon} selesai mencapai 100</span>
              </div>

              <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col text-white">
                <span className="text-xs font-bold text-slate-300">Akurasi Jawaban Siswa</span>
                <span className="text-3xl font-black text-emerald-300 mt-1">
                  {stats.totalQuestionsAnswered > 0
                    ? Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)
                    : 0}%
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  {stats.totalCorrect} benar / {stats.totalQuestionsAnswered} dijawab
                </span>
              </div>
            </div>

            {/* Content summary by Grade */}
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg text-white">
              <h3 className="text-base font-bold text-white mb-4">
                Distribusi Materi & Soal Berdasarkan Kelas SD
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map(grade => {
                  const matCount = materials.filter(m => m.classLevel === grade).length;
                  const qCount = questions.filter(q => q.classLevel === grade).length;
                  return (
                    <div key={grade} className="p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-center">
                      <span className="text-xs font-black text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded-md">
                        Kelas {grade}
                      </span>
                      <div className="mt-2 text-xs text-slate-300 flex flex-col gap-1">
                        <span>📚 {matCount} Materi</span>
                        <span>🧠 {qCount} Soal</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Board Objects Summary */}
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg text-white">
              <h3 className="text-base font-bold text-white mb-2">Konfigurasi Papan Saat Ini</h3>
              <p className="text-xs text-slate-300 mb-4">
                Papan memiliki {boardConfig.snakes.length} Ular, {boardConfig.ladders.length} Tangga, dan{' '}
                {boardConfig.specialTiles.length} Kotak Khusus (Materi/Bonus).
              </p>
              <button
                onClick={() => setActiveTab('board')}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:brightness-110 text-white rounded-xl font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 border border-white/20 shadow-md backdrop-blur-md"
              >
                <Grid className="w-4 h-4" />
                <span>Buka Visual Editor Papan</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MATERI MANAGEMENT ================= */}
        {activeTab === 'materials' && (
          <div className="flex flex-col gap-4">
            {/* Action Bar */}
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-lg flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari materi atau topik..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/20 text-xs focus:outline-none focus:border-teal-300 bg-white/10 text-white placeholder:text-slate-400 backdrop-blur-md"
                  />
                </div>

                {/* Grade Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-slate-300" />
                  <select
                    value={filterGrade}
                    onChange={e => setFilterGrade(Number(e.target.value))}
                    className="py-2 px-3 rounded-xl border border-white/20 text-xs font-semibold bg-slate-800 text-white cursor-pointer backdrop-blur-md"
                  >
                    <option value={0}>Semua Kelas (1-6)</option>
                    <option value={1}>Kelas 1</option>
                    <option value={2}>Kelas 2</option>
                    <option value={3}>Kelas 3</option>
                    <option value={4}>Kelas 4</option>
                    <option value={5}>Kelas 5</option>
                    <option value={6}>Kelas 6</option>
                  </select>
                </div>
              </div>

              {/* Add Material Button */}
              <button
                id="btn-add-material"
                onClick={() => {
                  setEditingMaterial(null);
                  setIsAddingMaterial(true);
                }}
                className="px-4 py-2 rounded-xl bg-teal-500/80 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 border border-white/30 transition-all cursor-pointer shadow-lg backdrop-blur-md"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Materi Baru</span>
              </button>
            </div>

            {/* Add / Edit Form Modal/Drawer */}
            {(isAddingMaterial || editingMaterial) && (
              <MaterialForm
                initial={editingMaterial}
                onSave={handleSaveMaterial}
                onCancel={() => {
                  setIsAddingMaterial(false);
                  setEditingMaterial(null);
                }}
              />
            )}

            {/* Material Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map(mat => (
                <div
                  key={mat.id}
                  className={`bg-white/10 backdrop-blur-xl p-5 rounded-2xl border ${
                    mat.active ? 'border-white/20' : 'border-white/10 opacity-60'
                  } shadow-lg flex flex-col justify-between text-white`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-teal-500/30 border border-teal-400/40 text-teal-200">
                        Kelas {mat.classLevel}
                      </span>
                      {mat.boxNumber && (
                        <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded-md">
                          Kotak #{mat.boxNumber}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-white leading-snug">{mat.title}</h4>
                    <span className="text-xs text-amber-300 font-semibold">{mat.topic}</span>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {mat.explanation}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-4">
                    <button
                      onClick={() => setPreviewMaterial(mat)}
                      className="text-xs font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingMaterial(mat);
                          setIsAddingMaterial(false);
                        }}
                        className="p-1.5 rounded-lg text-slate-300 hover:bg-white/15 cursor-pointer border border-white/10"
                        title="Edit Materi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-500/20 cursor-pointer border border-rose-500/30"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: QUESTIONS BANK ================= */}
        {activeTab === 'questions' && (
          <div className="flex flex-col gap-4">
            {/* Filter Bar */}
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-lg flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari pertanyaan atau topik..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/20 text-xs focus:outline-none focus:border-amber-300 bg-white/10 text-white placeholder:text-slate-400 backdrop-blur-md"
                  />
                </div>

                <select
                  value={filterGrade}
                  onChange={e => setFilterGrade(Number(e.target.value))}
                  className="py-2 px-3 rounded-xl border border-white/20 text-xs font-semibold bg-slate-800 text-white cursor-pointer backdrop-blur-md"
                >
                  <option value={0}>Semua Kelas (1-6)</option>
                  <option value={1}>Kelas 1</option>
                  <option value={2}>Kelas 2</option>
                  <option value={3}>Kelas 3</option>
                  <option value={4}>Kelas 4</option>
                  <option value={5}>Kelas 5</option>
                  <option value={6}>Kelas 6</option>
                </select>
              </div>

              <button
                id="btn-add-question"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsAddingQuestion(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 border border-white/30 transition-all cursor-pointer shadow-lg backdrop-blur-md"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Soal Baru</span>
              </button>
            </div>

            {/* Add / Edit Form */}
            {(isAddingQuestion || editingQuestion) && (
              <QuestionForm
                initial={editingQuestion}
                onSave={handleSaveQuestion}
                onCancel={() => {
                  setIsAddingQuestion(false);
                  setEditingQuestion(null);
                }}
              />
            )}

            {/* Questions Table / List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white/10 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col justify-between text-white"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/30 text-amber-200">
                          Kelas {q.classLevel}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-300 capitalize bg-white/10 border border-white/15 px-2 py-0.5 rounded-full">
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {q.type === 'multiple_choice' ? 'Pilihan Ganda' : q.type === 'true_false' ? 'Benar/Salah' : 'Isian Angka'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{q.question}</h4>
                    <span className="text-xs text-amber-300 font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      Topik: {q.topic}
                    </span>

                    {/* Options list preview */}
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                        {q.options.map(opt => (
                          <div
                            key={opt.id}
                            className={`p-1.5 rounded-lg text-xs font-medium border ${
                              opt.id === q.correctAnswer
                                ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-200 font-bold'
                                : 'bg-white/5 border-white/10 text-slate-300'
                            }`}
                          >
                            <span className="uppercase font-black mr-1">{opt.id}.</span> {opt.text}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-2.5 text-xs text-slate-300 bg-white/5 p-2 rounded-lg border border-white/10">
                      <span className="font-bold text-amber-300">Pembahasan: </span>
                      {q.explanation}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-3">
                    <button
                      onClick={() => setPreviewQuestion(q)}
                      className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Coba Jawab (Preview)</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setIsAddingQuestion(false);
                        }}
                        className="p-1.5 rounded-lg text-slate-300 hover:bg-white/15 cursor-pointer border border-white/10"
                        title="Edit Soal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-500/20 cursor-pointer border border-rose-500/30"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: VISUAL BOARD EDITOR ================= */}
        {activeTab === 'board' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Board 1-100 */}
            <div className="lg:col-span-7 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-lg flex flex-col items-center text-white">
              <div className="w-full flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">
                  Klik sembarang kotak (1-100) untuk mengatur Ular, Tangga, atau Materi:
                </h3>
              </div>

              {/* 100 tiles grid */}
              <div className="relative w-full aspect-square max-w-[500px] border-2 border-amber-300/40 rounded-2xl p-1.5 bg-slate-900/60 backdrop-blur-md">
                <div className="grid grid-rows-10 grid-cols-10 w-full h-full gap-0.5 rounded-xl overflow-hidden">
                  {Array.from({ length: 10 }).map((_, rIdx) => {
                    const rowNum = 9 - rIdx;
                    const isEven = rowNum % 2 === 0;
                    return Array.from({ length: 10 }).map((_, cIdx) => {
                      const tileNum = isEven ? rowNum * 10 + cIdx + 1 : rowNum * 10 + (9 - cIdx) + 1;
                      const events = BoardEngine.getTileEvents(tileNum, boardConfig);
                      const isSelected = selectedTileNum === tileNum;

                      return (
                        <div
                          key={tileNum}
                          onClick={() => {
                            setSelectedTileNum(tileNum);
                            sound.playPop();
                          }}
                          className={`relative p-0.5 flex flex-col justify-between border cursor-pointer text-[8px] sm:text-[10px] transition-all backdrop-blur-xs ${
                            isSelected
                              ? 'ring-2 ring-amber-400 bg-amber-400/40 border-amber-300 z-20 font-black'
                              : events.snakeHead
                              ? 'bg-rose-500/30 border-rose-400/40 text-rose-200'
                              : events.ladderStart
                              ? 'bg-emerald-500/30 border-emerald-400/40 text-emerald-200'
                              : events.special?.type === 'material'
                              ? 'bg-teal-500/30 border-teal-400/40 text-teal-200'
                              : 'bg-white/10 border-white/10 text-slate-200 hover:bg-white/20'
                          }`}
                        >
                          <span className="font-bold">{tileNum}</span>
                          <div className="text-[9px] self-center">
                            {events.snakeHead && '🐍'}
                            {events.ladderStart && '🪜'}
                            {events.special?.type === 'material' && '📚'}
                            {events.special?.type === 'bonus' && '⭐'}
                          </div>
                        </div>
                      );
                    });
                  })}
                </div>

                {/* SVG Overlay */}
                <BoardGraphics snakes={boardConfig.snakes} ladders={boardConfig.ladders} />
              </div>
            </div>

            {/* Tile Action Controller */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-lg text-white">
                <h3 className="text-base font-black text-white border-b border-white/10 pb-2">
                  Pengaturan Kotak: {selectedTileNum ? `Kotak #${selectedTileNum}` : 'Pilih Kotak di Kiri'}
                </h3>

                {selectedTileNum ? (
                  <TileEditorForm
                    tileNumber={selectedTileNum}
                    boardConfig={boardConfig}
                    materials={materials}
                    onApply={handleTileActionChange}
                  />
                ) : (
                  <div className="py-12 text-center text-slate-300 text-xs">
                    👈 Silakan klik salah satu nomor kotak pada papan di samping untuk mulai mengatur posisi ular, tangga, atau materi.
                  </div>
                )}
              </div>

              {/* Current Snakes and Ladders list */}
              <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col gap-3 max-h-[350px] overflow-y-auto text-white">
                <h4 className="text-xs font-bold text-slate-200 uppercase">Daftar Ular & Tangga Aktif:</h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-rose-300">🐍 Kepala Ular → Ekor:</span>
                    {boardConfig.snakes.map(s => (
                      <div key={s.id} className="p-1.5 bg-rose-500/20 border border-rose-400/30 rounded-lg flex justify-between items-center text-white">
                        <span>Kotak {s.head} ➔ {s.tail}</span>
                        <button
                          onClick={() => {
                            const newSnakes = boardConfig.snakes.filter(item => item.id !== s.id);
                            const updated = { ...boardConfig, snakes: newSnakes };
                            setBoardConfig(updated);
                            StorageService.saveBoardConfig(updated);
                          }}
                          className="text-rose-300 font-bold hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-emerald-300">🪜 Bawah Tangga → Atas:</span>
                    {boardConfig.ladders.map(l => (
                      <div key={l.id} className="p-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-lg flex justify-between items-center text-white">
                        <span>Kotak {l.start} ➔ {l.end}</span>
                        <button
                          onClick={() => {
                            const newLadders = boardConfig.ladders.filter(item => item.id !== l.id);
                            const updated = { ...boardConfig, ladders: newLadders };
                            setBoardConfig(updated);
                            StorageService.saveBoardConfig(updated);
                          }}
                          className="text-emerald-300 font-bold hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: DATA & AKUN SISWA ================= */}
        {activeTab === 'students' && (
          <div className="flex flex-col gap-6">
            {/* Header & Search */}
            <div className="bg-white/10 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-white/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Daftar Akun & Progres Siswa</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kelola data siswa di kelas Anda. Nilai, skor, akurasi soal, dan medali tercatat rapi di akun Google Anda.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama siswa..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-white/40"
                  />
                </div>

                <button
                  id="btn-admin-add-student"
                  onClick={() => {
                    sound.playPop();
                    setNewStudentName('');
                    setNewStudentAvatar('👦');
                    setIsAddingStudent(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer whitespace-nowrap active:scale-95 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambah Siswa</span>
                </button>
              </div>
            </div>

            {/* Students List */}
            {students.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 text-center text-white flex flex-col items-center">
                <div className="text-5xl mb-3">🎓</div>
                <h4 className="text-lg font-black text-white">Belum Ada Siswa Terdaftar</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 mb-5">
                  Tambahkan siswa secara manual menggunakan tombol di atas, atau siswa dapat langsung mengetikkan nama mereka di halaman utama sebelum mulai bermain.
                </p>
                <button
                  onClick={() => {
                    sound.playPop();
                    setNewStudentName('');
                    setNewStudentAvatar('👦');
                    setIsAddingStudent(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftarkan Siswa Pertama</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students
                  .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
                  .map(student => {
                    const achievementsList = Array.isArray(student.achievements) ? student.achievements : [];
                    const unlockedCount = achievementsList.filter(a => a.unlocked).length;
                    const isCurrentActive = StorageService.getCurrentStudent()?.id === student.id;
                    const games = student.recentGames || student.gameHistory || [];
                    const stats = student.stats || {
                      gamesPlayed: 0,
                      gamesWon: 0,
                      highestScore: 0,
                      totalCorrect: 0,
                      totalQuestions: 0,
                      winStreak: 0,
                      bestWinStreak: 0
                    };

                    const accuracy = stats.totalQuestions > 0
                      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
                      : 0;

                    return (
                      <div
                        key={student.id}
                        className={`bg-white/10 backdrop-blur-xl rounded-3xl p-5 border flex flex-col justify-between shadow-xl transition-all ${
                          isCurrentActive
                            ? 'border-emerald-400/60 ring-2 ring-emerald-400/30'
                            : 'border-white/15'
                        }`}
                      >
                        <div>
                          {/* Student Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-13 h-13 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl shadow-sm">
                                {student.avatar || '👦'}
                              </div>
                              <div>
                                <h4 className="text-base font-black text-white flex items-center gap-1.5">
                                  <span>{student.name}</span>
                                  {isCurrentActive && (
                                    <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/40">
                                      Aktif
                                    </span>
                                  )}
                                </h4>
                                <span className="text-[10px] text-slate-300 block">
                                  ID: {student.id.slice(-6)} • Main: {stats.gamesPlayed}x
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (confirm(`Hapus akun siswa "${student.name}" beserta seluruh medalinya?`)) {
                                  sound.playPop();
                                  StorageService.deleteStudent(student.id);
                                  const updated = StorageService.getAllStudents();
                                  setStudents(updated);
                                  if (onStudentChanged && isCurrentActive) {
                                    onStudentChanged(null);
                                  }
                                  showNotice(`Akun ${student.name} berhasil dihapus.`);
                                }
                              }}
                              className="p-2 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-xl transition-all cursor-pointer"
                              title="Hapus Akun Siswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 my-3">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                              <span className="text-[10px] text-slate-300 block font-semibold">Skor Top</span>
                              <span className="text-sm font-black text-amber-300">
                                ⭐ {stats.highestScore}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                              <span className="text-[10px] text-slate-300 block font-semibold">Menang</span>
                              <span className="text-sm font-black text-emerald-300">
                                🏆 {stats.gamesWon}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                              <span className="text-[10px] text-slate-300 block font-semibold">Akurasi Soal</span>
                              <span className="text-sm font-black text-sky-300">
                                🎯 {accuracy}%
                              </span>
                            </div>
                          </div>

                          {/* History snippet */}
                          <div className="bg-black/20 rounded-xl p-2.5 text-xs text-slate-300 flex flex-col gap-1">
                            <div className="flex justify-between font-bold text-[11px] text-slate-200">
                              <span>Riwayat Game ({games.length}):</span>
                              <span>Benar: {stats.totalCorrect} / {stats.totalQuestions} soal</span>
                            </div>
                            {games.length > 0 ? (
                              <span className="text-[11px] text-slate-300">
                                Terakhir: {(() => {
                                  const d = games[0]?.playedAt ? new Date(games[0].playedAt) : null;
                                  const dateStr = d && !isNaN(d.getTime()) ? d.toLocaleDateString('id-ID') : 'Sesi lalu';
                                  return `${dateStr} (${games[0]?.won ? 'Menang 🏆' : 'Selesai'}) - ${games[0]?.score || 0} pts`;
                                })()}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Belum ada sesi game yang selesai
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                sound.playPop();
                                setViewingStudentHistory(student);
                              }}
                              className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5 text-amber-300" />
                              <span>Lihat Detail Riwayat</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Reset seluruh statistik & riwayat skor untuk siswa "${student.name}"?`)) {
                                  sound.playPop();
                                  StorageService.resetStudentProgress(student.id);
                                  setStudents(StorageService.getAllStudents());
                                  showNotice(`Statistik siswa ${student.name} berhasil di-reset.`);
                                }
                              }}
                              className="py-1.5 px-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                              title="Reset statistik & riwayat game siswa"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              sound.playPop();
                              StorageService.loginStudent(student.name);
                              const cur = StorageService.getCurrentStudent();
                              if (onStudentChanged) onStudentChanged(cur);
                              setStudents(StorageService.getAllStudents());
                              showNotice(`Siswa aktif dialihkan ke "${student.name}".`);
                            }}
                            disabled={isCurrentActive}
                            className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isCurrentActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 opacity-90 cursor-default'
                                : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200'
                            }`}
                          >
                            {isCurrentActive ? '✓ Sedang Digunakan Saat Bermain' : 'Gunakan Akun Ini Saat Bermain'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 6: BACKUP & RESET ================= */}
        {activeTab === 'backup' && (
          <div className="max-w-2xl mx-auto flex flex-col gap-6 bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 shadow-2xl text-white">
            <div>
              <h3 className="text-lg font-black text-white">Cadangan Data & Reset</h3>
              <p className="text-xs text-slate-300 mt-1">
                Guru dapat mengunduh seluruh materi, bank soal, dan tata letak papan dalam bentuk file JSON untuk dibagikan ke kelas atau perangkat lain.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export Button */}
              <button
                onClick={() => {
                  const json = StorageService.exportBackupJSON();
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ular_tangga_interaktif_backup_${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showNotice('File cadangan JSON berhasil diunduh!');
                }}
                className="p-4 rounded-2xl border border-amber-400/40 bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md flex flex-col items-center gap-2 font-bold text-amber-200 cursor-pointer transition-all shadow-lg"
              >
                <Download className="w-6 h-6 text-amber-300" />
                <span>Unduh Cadangan (Export JSON)</span>
              </button>

              {/* Import Button */}
              <label className="p-4 rounded-2xl border border-blue-400/40 bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-md flex flex-col items-center gap-2 font-bold text-blue-200 cursor-pointer transition-all shadow-lg">
                <Upload className="w-6 h-6 text-blue-300" />
                <span>Pulihkan Data (Import JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                      const content = ev.target?.result as string;
                      if (StorageService.importBackupJSON(content)) {
                        setMaterials(StorageService.getMaterials());
                        setQuestions(StorageService.getQuestions());
                        setBoardConfig(StorageService.getBoardConfig());
                        showNotice('Data berhasil dipulihkan dari file JSON! 🎉');
                      } else {
                        alert('Format file JSON tidak valid.');
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
            </div>

            <div className="border-t border-white/10 pt-5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-rose-300">Zona Bahaya: Reset Data</h4>
              <p className="text-xs text-slate-300">
                Mengembalikan semua materi dan bank soal ke kurikulum default bawaan game.
              </p>
              <button
                onClick={() => {
                  if (confirm('Apakah kamu yakin ingin mengembalikan seluruh materi dan soal ke data awal?')) {
                    StorageService.resetAllToDefault();
                    setMaterials(StorageService.getMaterials());
                    setQuestions(StorageService.getQuestions());
                    setBoardConfig(StorageService.getBoardConfig());
                    showNotice('Seluruh data berhasil di-reset ke default.');
                  }
                }}
                className="self-start px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-400/30 font-bold text-xs flex items-center gap-1.5 hover:bg-rose-500/30 cursor-pointer backdrop-blur-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset ke Kurikulum Default</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Previews Modals */}
      {previewMaterial && (
        <MaterialModal material={previewMaterial} onClose={() => setPreviewMaterial(null)} />
      )}
      {previewQuestion && (
        <QuestionModal
          question={previewQuestion}
          reason="tile_challenge"
          playerName="Siswa Preview"
          onAnswer={() => setPreviewQuestion(null)}
        />
      )}

      {/* Modal: Tambah Siswa Baru */}
      {isAddingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">Tambah Siswa Baru</h3>
              </div>
              <button
                onClick={() => setIsAddingStudent(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nama Lengkap / Panggilan Siswa
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Pilih Avatar Karakter
                </label>
                <div className="grid grid-cols-6 gap-2 p-2 rounded-xl bg-black/20 border border-white/10 max-h-36 overflow-y-auto">
                  {AVATAR_OPTIONS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setNewStudentAvatar(av);
                      }}
                      className={`text-2xl p-2 rounded-xl border transition-all cursor-pointer ${
                        newStudentAvatar === av
                          ? 'bg-amber-500/40 border-amber-300 scale-110 shadow-md'
                          : 'border-transparent hover:bg-white/10'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddingStudent(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newStudentName.trim()) {
                    alert('Silakan masukkan nama siswa.');
                    return;
                  }
                  sound.playBonus();
                  StorageService.loginStudent(newStudentName.trim(), newStudentAvatar);
                  setStudents(StorageService.getAllStudents());
                  setIsAddingStudent(false);
                  showNotice(`Siswa "${newStudentName.trim()}" berhasil ditambahkan!`);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Simpan Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Riwayat & Detail Siswa */}
      {viewingStudentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-sm">
                  {viewingStudentHistory.avatar || '👦'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{viewingStudentHistory.name}</span>
                    <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full border border-white/20">
                      ID: {viewingStudentHistory.id.slice(-6)}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Detail statistik pembelajaran dan riwayat permainan kuis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudentHistory(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Stats Cards */}
            {(() => {
              const s = viewingStudentHistory.stats || {
                gamesPlayed: 0,
                gamesWon: 0,
                highestScore: 0,
                totalCorrect: 0,
                totalQuestions: 0,
                winStreak: 0,
                bestWinStreak: 0
              };
              const games = viewingStudentHistory.recentGames || viewingStudentHistory.gameHistory || [];
              const achs = Array.isArray(viewingStudentHistory.achievements) ? viewingStudentHistory.achievements : [];
              const unlockedCount = achs.filter(a => a.unlocked).length;
              const accuracy = s.totalQuestions > 0 ? Math.round((s.totalCorrect / s.totalQuestions) * 100) : 0;
              const winRate = s.gamesPlayed > 0 ? Math.round((s.gamesWon / s.gamesPlayed) * 100) : 0;

              return (
                <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[11px] text-slate-400 block font-semibold">Total Bermain</span>
                      <span className="text-lg font-black text-white">{s.gamesPlayed}x</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[11px] text-slate-400 block font-semibold">Kemenangan</span>
                      <span className="text-lg font-black text-emerald-300">{s.gamesWon} ({winRate}%)</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[11px] text-slate-400 block font-semibold">Skor Tertinggi</span>
                      <span className="text-lg font-black text-amber-300">⭐ {s.highestScore}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[11px] text-slate-400 block font-semibold">Akurasi Soal</span>
                      <span className="text-lg font-black text-sky-300">🎯 {accuracy}%</span>
                    </div>
                  </div>

                  {/* Summary of Questions & Achievements */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓ Benar: {s.totalCorrect}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">Total Dijawab: {s.totalQuestions} Soal</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                      <Trophy className="w-4 h-4 text-purple-400" />
                      <span>{unlockedCount} dari {achs.length} Medali Terbuka</span>
                    </div>
                  </div>

                  {/* Game History List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-amber-400" />
                      <span>Riwayat Permainan ({games.length} sesi)</span>
                    </h4>

                    {games.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-black/20 rounded-2xl border border-white/10">
                        Siswa ini belum menyelesaikan sesi permainan apapun.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                        {games.map((g, idx) => {
                          const dateObj = g.playedAt ? new Date(g.playedAt) : null;
                          const dateFormatted = dateObj && !isNaN(dateObj.getTime())
                            ? dateObj.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Tanggal tidak tercatat';

                          return (
                            <div
                              key={g.id || idx}
                              className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                  g.won
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                    : 'bg-white/10 text-slate-300 border border-white/20'
                                }`}>
                                  {g.won ? '🏆' : `${idx + 1}`}
                                </span>
                                <div>
                                  <span className="font-bold text-white block">
                                    {g.won ? 'Menang Mencapai Kotak 100' : 'Sesi Selesai'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {dateFormatted}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="font-black text-amber-300 block">
                                    ⭐ {g.score || 0} pts
                                  </span>
                                  <span className="text-[10px] text-slate-300">
                                    Benar: {g.questionsCorrect || 0} / {g.questionsAnswered || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Footer */}
            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setViewingStudentHistory(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: Material Form ---
interface MaterialFormProps {
  initial: Material | null;
  onSave: (mat: Material) => void;
  onCancel: () => void;
}

const MaterialForm: React.FC<MaterialFormProps> = ({ initial, onSave, onCancel }) => {
  const [classLevel, setClassLevel] = useState<ClassLevel>(initial?.classLevel || 3);
  const [topic, setTopic] = useState<string>(initial?.topic || '');
  const [title, setTitle] = useState<string>(initial?.title || '');
  const [explanation, setExplanation] = useState<string>(initial?.explanation || '');
  const [example, setExample] = useState<string>(initial?.example || '');
  const [illustrationType, setIllustrationType] = useState<Material['illustrationType']>(
    initial?.illustrationType || 'generic'
  );
  const [boxNumber, setBoxNumber] = useState<number | undefined>(initial?.boxNumber);
  const [active, setActive] = useState<boolean>(initial ? initial.active : true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !explanation.trim()) {
      alert('Mohon lengkapi Judul dan Penjelasan materi.');
      return;
    }
    onSave({
      id: initial?.id || '',
      classLevel,
      topic: topic.trim() || 'Materi Umum',
      title: title.trim(),
      explanation: explanation.trim(),
      example: example.trim(),
      illustrationType,
      boxNumber: boxNumber ? Number(boxNumber) : undefined,
      active
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/85 backdrop-blur-2xl p-5 rounded-2xl border border-teal-400/40 shadow-2xl flex flex-col gap-4 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-base font-black text-white">
          {initial ? 'Edit Materi Pelajaran' : 'Tambah Materi Pelajaran Baru'}
        </h3>
        <button type="button" onClick={onCancel} className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer">
          Batal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-300 mb-1 block">Tingkat Kelas:</label>
          <select
            value={classLevel}
            onChange={e => setClassLevel(Number(e.target.value) as ClassLevel)}
            className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-bold bg-slate-800 text-white cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map(g => (
              <option key={g} value={g}>Kelas {g} SD</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 mb-1 block">Topik Pembahasan:</label>
          <input
            type="text"
            placeholder="misal: Pecahan Sederhana"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-medium bg-white/10 text-white placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 mb-1 block">Tipe Ilustrasi Visual:</label>
          <select
            value={illustrationType}
            onChange={e => setIllustrationType(e.target.value as Material['illustrationType'])}
            className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-bold bg-slate-800 text-white cursor-pointer"
          >
            <option value="generic">Umum / Kartun Standar</option>
            <option value="fractions">Pizza Pecahan (1/4, 1/2, 3/4)</option>
            <option value="shapes">Bangun Datar (Lingkaran, Persegi, Segitiga)</option>
            <option value="clock">Jam Analog Interaktif</option>
            <option value="multiplication_grid">Grid Baris × Kolom Perkalian</option>
            <option value="volume">Kubus / Balok 3D</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-300 mb-1 block">Judul Materi:</label>
        <input
          type="text"
          placeholder="misal: Mengenal Pecahan Pizza"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-bold bg-white/10 text-white placeholder:text-slate-400"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-300 mb-1 block">Penjelasan Konsep:</label>
        <textarea
          rows={3}
          placeholder="Tulis penjelasan materi yang mudah dipahami anak..."
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-medium bg-white/10 text-white placeholder:text-slate-400"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-300 mb-1 block">Contoh Soal / Nyata:</label>
        <textarea
          rows={2}
          placeholder="Contoh: 1 pizza dipotong 4 bagian, jika dimakan 1 maka 1/4 bagian."
          value={example}
          onChange={e => setExample(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-medium bg-white/10 text-white placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            className="w-4 h-4 rounded text-teal-500"
          />
          <span>Status Aktif (Tampil dalam permainan)</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer border border-white/10"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg border border-white/20"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Materi</span>
          </button>
        </div>
      </div>
    </form>
  );
};

// --- SUB-COMPONENT: Question Form ---
interface QuestionFormProps {
  initial: Question | null;
  onSave: (q: Question) => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ initial, onSave, onCancel }) => {
  const [classLevel, setClassLevel] = useState<ClassLevel>(initial?.classLevel || 3);
  const [topic, setTopic] = useState<string>(initial?.topic || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty || 'mudah');
  const [type, setType] = useState<QuestionType>(initial?.type || 'multiple_choice');
  const [question, setQuestion] = useState<string>(initial?.question || '');
  const [optA, setOptA] = useState<string>(initial?.options?.[0]?.text || '');
  const [optB, setOptB] = useState<string>(initial?.options?.[1]?.text || '');
  const [optC, setOptC] = useState<string>(initial?.options?.[2]?.text || '');
  const [optD, setOptD] = useState<string>(initial?.options?.[3]?.text || '');
  const [correctAnswer, setCorrectAnswer] = useState<string>(initial?.correctAnswer || 'a');
  const [explanation, setExplanation] = useState<string>(initial?.explanation || '');
  const [active, setActive] = useState<boolean>(initial ? initial.active : true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      alert('Pertanyaan tidak boleh kosong.');
      return;
    }

    let options = undefined;
    if (type === 'multiple_choice') {
      options = [
        { id: 'a', text: optA.trim() || 'Pilihan A' },
        { id: 'b', text: optB.trim() || 'Pilihan B' },
        { id: 'c', text: optC.trim() || 'Pilihan C' },
        { id: 'd', text: optD.trim() || 'Pilihan D' }
      ];
    } else if (type === 'true_false') {
      options = [
        { id: 'true', text: 'Benar' },
        { id: 'false', text: 'Salah' }
      ];
    }

    onSave({
      id: initial?.id || '',
      classLevel,
      topic: topic.trim() || 'Umum',
      question: question.trim(),
      type,
      options,
      correctAnswer: correctAnswer.trim(),
      explanation: explanation.trim() || 'Jawaban benar telah diverifikasi.',
      difficulty,
      active
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/85 backdrop-blur-2xl p-5 rounded-2xl border border-amber-400/40 shadow-2xl flex flex-col gap-4 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-base font-black text-white">
          {initial ? 'Edit Soal / Pertanyaan' : 'Tambah Soal Baru'}
        </h3>
        <button type="button" onClick={onCancel} className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer">
          Batal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-300 mb-1 block">Tingkat Kelas:</label>
          <select
            value={classLevel}
            onChange={e => setClassLevel(Number(e.target.value) as ClassLevel)}
            className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-bold bg-slate-800 text-white cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map(g => (
              <option key={g} value={g}>Kelas {g} SD</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 mb-1 block">Topik:</label>
          <input
            type="text"
            placeholder="misal: Perkalian"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-medium bg-white/10 text-white placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 mb-1 block">Tingkat Kesulitan:</label>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as Difficulty)}
            className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-bold bg-slate-800 text-white cursor-pointer"
          >
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 mb-1 block">Bentuk Soal:</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as QuestionType)}
            className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-bold bg-slate-800 text-white cursor-pointer"
          >
            <option value="multiple_choice">Pilihan Ganda (A, B, C, D)</option>
            <option value="true_false">Benar atau Salah</option>
            <option value="number_input">Isian Angka Langsung</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-300 mb-1 block">Pertanyaan:</label>
        <textarea
          rows={2}
          placeholder="Tulis pertanyaan soal di sini..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-bold bg-white/10 text-white placeholder:text-slate-400"
        />
      </div>

      {/* Pilihan Ganda fields */}
      {type === 'multiple_choice' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/15">
          <div>
            <label className="text-xs font-bold text-slate-300">Pilihan A:</label>
            <input
              type="text"
              value={optA}
              onChange={e => setOptA(e.target.value)}
              className="w-full p-2 rounded-lg border border-white/20 text-xs bg-white/10 text-white mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-300">Pilihan B:</label>
            <input
              type="text"
              value={optB}
              onChange={e => setOptB(e.target.value)}
              className="w-full p-2 rounded-lg border border-white/20 text-xs bg-white/10 text-white mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-300">Pilihan C:</label>
            <input
              type="text"
              value={optC}
              onChange={e => setOptC(e.target.value)}
              className="w-full p-2 rounded-lg border border-white/20 text-xs bg-white/10 text-white mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-300">Pilihan D:</label>
            <input
              type="text"
              value={optD}
              onChange={e => setOptD(e.target.value)}
              className="w-full p-2 rounded-lg border border-white/20 text-xs bg-white/10 text-white mt-1"
            />
          </div>
        </div>
      )}

      {/* Correct answer picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-emerald-300 mb-1 block">Kunci Jawaban Benar:</label>
          {type === 'multiple_choice' ? (
            <select
              value={correctAnswer}
              onChange={e => setCorrectAnswer(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-emerald-400/40 text-xs font-black bg-slate-800 text-emerald-300 cursor-pointer"
            >
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>
          ) : type === 'true_false' ? (
            <select
              value={correctAnswer}
              onChange={e => setCorrectAnswer(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-emerald-400/40 text-xs font-black bg-slate-800 text-emerald-300 cursor-pointer"
            >
              <option value="true">Benar</option>
              <option value="false">Salah</option>
            </select>
          ) : (
            <input
              type="text"
              placeholder="Ketik angka jawaban benar..."
              value={correctAnswer}
              onChange={e => setCorrectAnswer(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-emerald-400/40 text-xs font-black bg-white/10 text-white"
            />
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 mb-1 block">Penjelasan / Pembahasan:</label>
          <input
            type="text"
            placeholder="misal: 6 × 7 = 42 karena..."
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-medium bg-white/10 text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500"
          />
          <span>Status Aktif di Permainan</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer border border-white/10"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg border border-white/20"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Soal</span>
          </button>
        </div>
      </div>
    </form>
  );
};

// --- SUB-COMPONENT: Tile Editor Form ---
interface TileEditorFormProps {
  tileNumber: number;
  boardConfig: BoardConfig;
  materials: Material[];
  onApply: (
    action: 'normal' | 'snake' | 'ladder' | 'material' | 'bonus' | 'trivia',
    params?: { targetTile?: number; materialId?: string; bonusPoints?: number; triviaText?: string }
  ) => void;
}

const TileEditorForm: React.FC<TileEditorFormProps> = ({
  tileNumber,
  boardConfig,
  materials,
  onApply
}) => {
  const events = BoardEngine.getTileEvents(tileNumber, boardConfig);
  const [actionType, setActionType] = useState<string>(
    events.snakeHead
      ? 'snake'
      : events.ladderStart
      ? 'ladder'
      : events.special?.type || 'normal'
  );
  const [targetTile, setTargetTile] = useState<number>(
    events.snakeHead?.tail || events.ladderStart?.end || (tileNumber > 50 ? tileNumber - 20 : tileNumber + 20)
  );
  const [materialId, setMaterialId] = useState<string>(events.special?.materialId || materials[0]?.id || '');
  const [bonusPoints, setBonusPoints] = useState<number>(events.special?.bonusPoints || 25);
  const [triviaText, setTriviaText] = useState<string>(events.special?.triviaText || '');

  return (
    <div className="flex flex-col gap-4 mt-3 text-white">
      <div>
        <label className="text-xs font-bold text-slate-300 mb-1.5 block">Tipe Kotak #{tileNumber}:</label>
        <select
          value={actionType}
          onChange={e => setActionType(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-white/20 text-xs font-black bg-slate-800 text-white cursor-pointer"
        >
          <option value="normal">⚪ Kotak Normal</option>
          {tileNumber > 10 && <option value="snake">🐍 Kepala Ular (Meluncur Turun)</option>}
          {tileNumber < 90 && <option value="ladder">🪜 Bawah Tangga (Memanjat Naik)</option>}
          <option value="material">📚 Kotak Materi Pembelajaran</option>
          <option value="bonus">⭐ Kotak Bonus Poin</option>
          <option value="trivia">💡 Kotak Fakta Menarik (Trivia)</option>
        </select>
      </div>

      {/* Snake parameters */}
      {actionType === 'snake' && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/30 text-xs flex flex-col gap-2">
          <label className="font-bold text-rose-200">Ekor Ular Berada di Kotak Nomor:</label>
          <input
            type="number"
            min={1}
            max={tileNumber - 1}
            value={targetTile}
            onChange={e => setTargetTile(Number(e.target.value))}
            className="p-2 rounded-lg border border-rose-400/40 bg-white/10 font-black text-sm text-white"
          />
          <span className="text-[10px] text-rose-300">
            * Harap pilih kotak yang lebih kecil dari {tileNumber}.
          </span>
        </div>
      )}

      {/* Ladder parameters */}
      {actionType === 'ladder' && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-xs flex flex-col gap-2">
          <label className="font-bold text-emerald-200">Ujung Atas Tangga Berada di Kotak Nomor:</label>
          <input
            type="number"
            min={tileNumber + 1}
            max={100}
            value={targetTile}
            onChange={e => setTargetTile(Number(e.target.value))}
            className="p-2 rounded-lg border border-emerald-400/40 bg-white/10 font-black text-sm text-white"
          />
          <span className="text-[10px] text-emerald-300">
            * Harap pilih kotak yang lebih besar dari {tileNumber}.
          </span>
        </div>
      )}

      {/* Material parameters */}
      {actionType === 'material' && (
        <div className="p-3 rounded-xl bg-teal-500/20 border border-teal-400/30 text-xs flex flex-col gap-2">
          <label className="font-bold text-teal-200">Pilih Materi yang Ditampilkan:</label>
          <select
            value={materialId}
            onChange={e => setMaterialId(e.target.value)}
            className="p-2 rounded-lg border border-teal-400/40 bg-slate-800 font-semibold text-xs text-white"
          >
            {materials.map(m => (
              <option key={m.id} value={m.id}>
                Kelas {m.classLevel}: {m.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bonus parameters */}
      {actionType === 'bonus' && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-xs flex flex-col gap-2">
          <label className="font-bold text-amber-200">Jumlah Bonus Poin:</label>
          <input
            type="number"
            min={5}
            max={100}
            step={5}
            value={bonusPoints}
            onChange={e => setBonusPoints(Number(e.target.value))}
            className="p-2 rounded-lg border border-amber-400/40 bg-white/10 text-white font-black"
          />
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={() => {
          onApply(actionType as any, {
            targetTile,
            materialId,
            bonusPoints,
            triviaText
          });
        }}
        className="w-full py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg backdrop-blur-md transition-all"
      >
        <Save className="w-4 h-4" />
        <span>Terapkan Perubahan Kotak #{tileNumber}</span>
      </button>
    </div>
  );
};
