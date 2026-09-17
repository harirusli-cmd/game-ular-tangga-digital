import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { Material, Question, BoardConfig, StudentProfile, TeacherUser } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Connect to Firestore using the provisioned database ID
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

export type CloudSyncStatus = 'offline' | 'connecting' | 'synced' | 'syncing' | 'error';

type SyncListener = (status: CloudSyncStatus, message?: string) => void;
const listeners: Set<SyncListener> = new Set();
let currentStatus: CloudSyncStatus = 'connecting';
let currentMessage = 'Menghubungkan ke Cloud Firestore...';

export function getCloudSyncStatus(): { status: CloudSyncStatus; message: string } {
  return { status: currentStatus, message: currentMessage };
}

export function subscribeToCloudSync(listener: SyncListener): () => void {
  listeners.add(listener);
  listener(currentStatus, currentMessage);
  return () => {
    listeners.delete(listener);
  };
}

function updateStatus(status: CloudSyncStatus, message: string) {
  currentStatus = status;
  currentMessage = message;
  listeners.forEach(fn => {
    try {
      fn(status, message);
    } catch (e) {
      console.error('Error in sync listener', e);
    }
  });
}

function formatTeacherUser(user: User): TeacherUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Guru',
    photoURL: user.photoURL
  };
}

/**
 * Cloud storage service for persisting curriculum (materials, questions, board config)
 * and student profiles per teacher's Google account or globally.
 */
export const FirebaseService = {
  // ================= GOOGLE AUTHENTICATION FOR ADMIN/TEACHER =================
  /**
   * Sign in using Google Account
   */
  async loginWithGoogle(): Promise<TeacherUser> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      const teacher = formatTeacherUser(result.user);

      // Record / update teacher profile in Firestore
      try {
        const teacherDocRef = doc(db, 'teachers', teacher.uid);
        await setDoc(
          teacherDocRef,
          {
            uid: teacher.uid,
            email: teacher.email,
            displayName: teacher.displayName,
            photoURL: teacher.photoURL,
            lastLoginAt: new Date().toISOString()
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Could not write teacher profile document', err);
      }

      return teacher;
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  },

  /**
   * Sign out current teacher
   */
  async logoutTeacher(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Get current authenticated user as TeacherUser
   */
  getCurrentTeacher(): TeacherUser | null {
    if (auth.currentUser) {
      return formatTeacherUser(auth.currentUser);
    }
    return null;
  },

  /**
   * Subscribe to auth state changes
   */
  onTeacherAuthStateChanged(callback: (user: TeacherUser | null) => void): () => void {
    return onAuthStateChanged(auth, user => {
      if (user) {
        callback(formatTeacherUser(user));
      } else {
        callback(null);
      }
    });
  },

  // ================= TEACHER-ISOLATED CURRICULUM SYNC =================
  /**
   * Initialize and synchronize data with Cloud Firestore for a specific Google Teacher Account.
   * If the teacher account is new, it seeds their private cloud storage with default materials,
   * questions, and board configuration so they have a complete starting point.
   */
  async initAndSyncTeacher(
    teacherUid: string,
    initialData?: {
      materials: Material[];
      questions: Question[];
      boardConfig: BoardConfig;
    },
    callbacks?: {
      onMaterialsUpdated?: (materials: Material[]) => void;
      onQuestionsUpdated?: (questions: Question[]) => void;
      onBoardConfigUpdated?: (config: BoardConfig) => void;
      onStudentsUpdated?: (students: StudentProfile[]) => void;
    }
  ): Promise<boolean> {
    updateStatus('syncing', 'Menyelaraskan kurikulum khusus akun Google Anda...');

    try {
      // 1. Sync Teacher Materials
      const matDocRef = doc(db, 'teachers', teacherUid, 'curriculum', 'materials');
      const matSnap = await getDoc(matDocRef);
      if (matSnap.exists() && matSnap.data()?.items) {
        const cloudMaterials = matSnap.data().items as Material[];
        if (Array.isArray(cloudMaterials) && cloudMaterials.length > 0) {
          callbacks?.onMaterialsUpdated?.(cloudMaterials);
        }
      } else if (initialData?.materials && initialData.materials.length > 0) {
        // Teacher's cloud is fresh -> seed initial materials for this teacher
        await setDoc(matDocRef, {
          items: initialData.materials,
          updatedAt: new Date().toISOString()
        });
      }

      // 2. Sync Teacher Questions
      const qDocRef = doc(db, 'teachers', teacherUid, 'curriculum', 'questions');
      const qSnap = await getDoc(qDocRef);
      if (qSnap.exists() && qSnap.data()?.items) {
        const cloudQuestions = qSnap.data().items as Question[];
        if (Array.isArray(cloudQuestions) && cloudQuestions.length > 0) {
          callbacks?.onQuestionsUpdated?.(cloudQuestions);
        }
      } else if (initialData?.questions && initialData.questions.length > 0) {
        // Teacher's cloud is fresh -> seed initial questions for this teacher
        await setDoc(qDocRef, {
          items: initialData.questions,
          updatedAt: new Date().toISOString()
        });
      }

      // 3. Sync Teacher Board Config
      const boardDocRef = doc(db, 'teachers', teacherUid, 'curriculum', 'board');
      const boardSnap = await getDoc(boardDocRef);
      if (boardSnap.exists() && boardSnap.data()?.config) {
        const cloudBoard = boardSnap.data().config as BoardConfig;
        callbacks?.onBoardConfigUpdated?.(cloudBoard);
      } else if (initialData?.boardConfig) {
        // Teacher's cloud is fresh -> seed initial board configuration
        await setDoc(boardDocRef, {
          config: initialData.boardConfig,
          updatedAt: new Date().toISOString()
        });
      }

      // 4. Sync Teacher Students Collection
      try {
        const studentsColl = collection(db, 'teachers', teacherUid, 'students');
        const studentsSnap = await getDocs(studentsColl);
        if (!studentsSnap.empty) {
          const cloudStudents: StudentProfile[] = [];
          studentsSnap.forEach(docSnap => {
            const data = docSnap.data() as StudentProfile;
            if (data && data.id && data.name) {
              cloudStudents.push({
                ...data,
                achievements: Array.isArray(data.achievements) ? data.achievements : [],
                stats: data.stats || {
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
                recentGames: Array.isArray(data.recentGames)
                  ? data.recentGames
                  : Array.isArray(data.gameHistory)
                  ? data.gameHistory
                  : [],
                gameHistory: Array.isArray(data.gameHistory)
                  ? data.gameHistory
                  : Array.isArray(data.recentGames)
                  ? data.recentGames
                  : []
              });
            }
          });
          callbacks?.onStudentsUpdated?.(cloudStudents);
        }
      } catch (err) {
        console.warn('Could not sync teacher students from cloud', err);
      }

      updateStatus('synced', 'Tersinkron dengan Akun Google Anda');
      return true;
    } catch (error) {
      console.error('Firebase teacher initAndSync failed:', error);
      updateStatus('error', 'Gagal menyinkronkan data guru dari Cloud. Menggunakan data lokal.');
      return false;
    }
  },

  /**
   * Listen for real-time curriculum updates for a specific teacher.
   */
  listenToTeacherCurriculumUpdates(
    teacherUid: string,
    callbacks: {
      onMaterialsUpdated?: (materials: Material[]) => void;
      onQuestionsUpdated?: (questions: Question[]) => void;
      onBoardConfigUpdated?: (config: BoardConfig) => void;
    }
  ): () => void {
    const unsubMaterials = onSnapshot(
      doc(db, 'teachers', teacherUid, 'curriculum', 'materials'),
      docSnap => {
        if (docSnap.exists() && docSnap.data()?.items) {
          callbacks.onMaterialsUpdated?.(docSnap.data().items);
        }
      },
      err => console.warn('Teacher materials snapshot error', err)
    );

    const unsubQuestions = onSnapshot(
      doc(db, 'teachers', teacherUid, 'curriculum', 'questions'),
      docSnap => {
        if (docSnap.exists() && docSnap.data()?.items) {
          callbacks.onQuestionsUpdated?.(docSnap.data().items);
        }
      },
      err => console.warn('Teacher questions snapshot error', err)
    );

    const unsubBoard = onSnapshot(
      doc(db, 'teachers', teacherUid, 'curriculum', 'board'),
      docSnap => {
        if (docSnap.exists() && docSnap.data()?.config) {
          callbacks.onBoardConfigUpdated?.(docSnap.data().config);
        }
      },
      err => console.warn('Teacher board snapshot error', err)
    );

    return () => {
      unsubMaterials();
      unsubQuestions();
      unsubBoard();
    };
  },

  /**
   * Save materials for a specific teacher
   */
  async saveTeacherMaterials(teacherUid: string, materials: Material[]): Promise<boolean> {
    updateStatus('syncing', 'Menyimpan materi ke akun Google Anda...');
    try {
      const matDocRef = doc(db, 'teachers', teacherUid, 'curriculum', 'materials');
      await setDoc(matDocRef, {
        items: materials,
        updatedAt: new Date().toISOString()
      });
      updateStatus('synced', 'Materi tersimpan di akun Google Anda!');
      return true;
    } catch (e) {
      console.error('Failed to save teacher materials to cloud:', e);
      updateStatus('error', 'Gagal menyimpan ke Cloud. Tersimpan di memori lokal.');
      return false;
    }
  },

  /**
   * Save questions for a specific teacher
   */
  async saveTeacherQuestions(teacherUid: string, questions: Question[]): Promise<boolean> {
    updateStatus('syncing', 'Menyimpan bank soal ke akun Google Anda...');
    try {
      const qDocRef = doc(db, 'teachers', teacherUid, 'curriculum', 'questions');
      await setDoc(qDocRef, {
        items: questions,
        updatedAt: new Date().toISOString()
      });
      updateStatus('synced', 'Bank soal tersimpan di akun Google Anda!');
      return true;
    } catch (e) {
      console.error('Failed to save teacher questions to cloud:', e);
      updateStatus('error', 'Gagal menyimpan ke Cloud. Tersimpan di memori lokal.');
      return false;
    }
  },

  /**
   * Save board config for a specific teacher
   */
  async saveTeacherBoardConfig(teacherUid: string, config: BoardConfig): Promise<boolean> {
    updateStatus('syncing', 'Menyimpan tata letak papan ke akun Google Anda...');
    try {
      const boardDocRef = doc(db, 'teachers', teacherUid, 'curriculum', 'board');
      await setDoc(boardDocRef, {
        config: config,
        updatedAt: new Date().toISOString()
      });
      updateStatus('synced', 'Papan tersimpan di akun Google Anda!');
      return true;
    } catch (e) {
      console.error('Failed to save teacher board config to cloud:', e);
      updateStatus('error', 'Gagal menyimpan ke Cloud. Tersimpan di memori lokal.');
      return false;
    }
  },

  /**
   * Save student profile for a specific teacher
   */
  async saveTeacherStudent(teacherUid: string, student: StudentProfile): Promise<boolean> {
    try {
      const studentDocRef = doc(db, 'teachers', teacherUid, 'students', student.id);
      await setDoc(studentDocRef, {
        ...student,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (e) {
      console.error('Failed to save student under teacher account:', e);
      return false;
    }
  },

  /**
   * Delete student profile for a specific teacher
   */
  async deleteTeacherStudent(teacherUid: string, studentId: string): Promise<boolean> {
    try {
      const studentDocRef = doc(db, 'teachers', teacherUid, 'students', studentId);
      await deleteDoc(studentDocRef);
      return true;
    } catch (e) {
      console.error('Failed to delete student under teacher account:', e);
      return false;
    }
  },

  // ================= GENERAL / FALLBACK SYNC =================
  /**
   * Fallback sync for global curriculum when no teacher is logged in
   */
  async initAndSync(
    initialData?: {
      materials: Material[];
      questions: Question[];
      boardConfig: BoardConfig;
    },
    callbacks?: {
      onMaterialsUpdated?: (materials: Material[]) => void;
      onQuestionsUpdated?: (questions: Question[]) => void;
      onBoardConfigUpdated?: (config: BoardConfig) => void;
      onStudentsUpdated?: (students: StudentProfile[]) => void;
    }
  ): Promise<boolean> {
    updateStatus('syncing', 'Menyelaraskan data materi & soal dengan Cloud...');

    try {
      // 1. Sync Materials
      const matDocRef = doc(db, 'curriculum', 'materials');
      const matSnap = await getDoc(matDocRef);
      if (matSnap.exists() && matSnap.data()?.items) {
        const cloudMaterials = matSnap.data().items as Material[];
        if (Array.isArray(cloudMaterials) && cloudMaterials.length > 0) {
          callbacks?.onMaterialsUpdated?.(cloudMaterials);
        }
      } else if (initialData?.materials && initialData.materials.length > 0) {
        await setDoc(matDocRef, {
          items: initialData.materials,
          updatedAt: new Date().toISOString()
        });
      }

      // 2. Sync Questions
      const qDocRef = doc(db, 'curriculum', 'questions');
      const qSnap = await getDoc(qDocRef);
      if (qSnap.exists() && qSnap.data()?.items) {
        const cloudQuestions = qSnap.data().items as Question[];
        if (Array.isArray(cloudQuestions) && cloudQuestions.length > 0) {
          callbacks?.onQuestionsUpdated?.(cloudQuestions);
        }
      } else if (initialData?.questions && initialData.questions.length > 0) {
        await setDoc(qDocRef, {
          items: initialData.questions,
          updatedAt: new Date().toISOString()
        });
      }

      // 3. Sync Board Config
      const boardDocRef = doc(db, 'curriculum', 'board');
      const boardSnap = await getDoc(boardDocRef);
      if (boardSnap.exists() && boardSnap.data()?.config) {
        const cloudBoard = boardSnap.data().config as BoardConfig;
        callbacks?.onBoardConfigUpdated?.(cloudBoard);
      } else if (initialData?.boardConfig) {
        await setDoc(boardDocRef, {
          config: initialData.boardConfig,
          updatedAt: new Date().toISOString()
        });
      }

      // 4. Sync Students
      try {
        const studentsColl = collection(db, 'students');
        const studentsSnap = await getDocs(studentsColl);
        if (!studentsSnap.empty) {
          const cloudStudents: StudentProfile[] = [];
          studentsSnap.forEach(docSnap => {
            const data = docSnap.data() as StudentProfile;
            if (data && data.id && data.name) {
              cloudStudents.push({
                ...data,
                achievements: Array.isArray(data.achievements) ? data.achievements : [],
                stats: data.stats || {
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
                recentGames: Array.isArray(data.recentGames)
                  ? data.recentGames
                  : Array.isArray(data.gameHistory)
                  ? data.gameHistory
                  : [],
                gameHistory: Array.isArray(data.gameHistory)
                  ? data.gameHistory
                  : Array.isArray(data.recentGames)
                  ? data.recentGames
                  : []
              });
            }
          });
          if (cloudStudents.length > 0) {
            callbacks?.onStudentsUpdated?.(cloudStudents);
          }
        }
      } catch (err) {
        console.warn('Could not sync students collection from cloud', err);
      }

      updateStatus('synced', 'Terhubung ke Cloud');
      return true;
    } catch (error) {
      console.error('Firebase initAndSync failed:', error);
      updateStatus('error', 'Gagal terhubung ke Cloud. Menggunakan data lokal.');
      return false;
    }
  },

  /**
   * Listen for real-time fallback curriculum changes.
   */
  listenToCurriculumUpdates(callbacks: {
    onMaterialsUpdated?: (materials: Material[]) => void;
    onQuestionsUpdated?: (questions: Question[]) => void;
    onBoardConfigUpdated?: (config: BoardConfig) => void;
  }): () => void {
    const unsubMaterials = onSnapshot(
      doc(db, 'curriculum', 'materials'),
      docSnap => {
        if (docSnap.exists() && docSnap.data()?.items) {
          callbacks.onMaterialsUpdated?.(docSnap.data().items);
        }
      },
      err => console.warn('Materials snapshot error', err)
    );

    const unsubQuestions = onSnapshot(
      doc(db, 'curriculum', 'questions'),
      docSnap => {
        if (docSnap.exists() && docSnap.data()?.items) {
          callbacks.onQuestionsUpdated?.(docSnap.data().items);
        }
      },
      err => console.warn('Questions snapshot error', err)
    );

    const unsubBoard = onSnapshot(
      doc(db, 'curriculum', 'board'),
      docSnap => {
        if (docSnap.exists() && docSnap.data()?.config) {
          callbacks.onBoardConfigUpdated?.(docSnap.data().config);
        }
      },
      err => console.warn('Board snapshot error', err)
    );

    return () => {
      unsubMaterials();
      unsubQuestions();
      unsubBoard();
    };
  },

  /**
   * Save materials to Firestore (global fallback)
   */
  async saveMaterials(materials: Material[]): Promise<boolean> {
    updateStatus('syncing', 'Menyimpan materi ke Cloud...');
    try {
      const matDocRef = doc(db, 'curriculum', 'materials');
      await setDoc(matDocRef, {
        items: materials,
        updatedAt: new Date().toISOString()
      });
      updateStatus('synced', 'Materi berhasil disimpan ke Cloud!');
      return true;
    } catch (e) {
      console.error('Failed to save materials to cloud:', e);
      updateStatus('error', 'Gagal menyimpan ke Cloud. Tersimpan di memori lokal.');
      return false;
    }
  },

  /**
   * Save questions to Firestore (global fallback)
   */
  async saveQuestions(questions: Question[]): Promise<boolean> {
    updateStatus('syncing', 'Menyimpan bank soal ke Cloud...');
    try {
      const qDocRef = doc(db, 'curriculum', 'questions');
      await setDoc(qDocRef, {
        items: questions,
        updatedAt: new Date().toISOString()
      });
      updateStatus('synced', 'Bank soal berhasil disimpan ke Cloud!');
      return true;
    } catch (e) {
      console.error('Failed to save questions to cloud:', e);
      updateStatus('error', 'Gagal menyimpan ke Cloud. Tersimpan di memori lokal.');
      return false;
    }
  },

  /**
   * Save board configuration to Firestore (global fallback)
   */
  async saveBoardConfig(config: BoardConfig): Promise<boolean> {
    updateStatus('syncing', 'Menyimpan konfigurasi papan ke Cloud...');
    try {
      const boardDocRef = doc(db, 'curriculum', 'board');
      await setDoc(boardDocRef, {
        config: config,
        updatedAt: new Date().toISOString()
      });
      updateStatus('synced', 'Posisi ular & tangga berhasil disimpan ke Cloud!');
      return true;
    } catch (e) {
      console.error('Failed to save board config to cloud:', e);
      updateStatus('error', 'Gagal menyimpan ke Cloud. Tersimpan di memori lokal.');
      return false;
    }
  },

  /**
   * Save student profile to Firestore (global fallback)
   */
  async saveStudent(student: StudentProfile): Promise<boolean> {
    try {
      const studentDocRef = doc(db, 'students', student.id);
      await setDoc(studentDocRef, {
        ...student,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (e) {
      console.error('Failed to save student to cloud:', e);
      return false;
    }
  },

  /**
   * Delete student profile from Firestore (global fallback)
   */
  async deleteStudent(studentId: string): Promise<boolean> {
    try {
      const studentDocRef = doc(db, 'students', studentId);
      await deleteDoc(studentDocRef);
      return true;
    } catch (e) {
      console.error('Failed to delete student from cloud:', e);
      return false;
    }
  }
};

