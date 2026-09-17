import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameSettings } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../utils/audio';
import { Settings, Volume2, VolumeX, Heart, FastForward, Check, X } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onSettingsChanged: (settings: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSettingsChanged }) => {
  const [settings, setSettings] = useState<GameSettings>(() => StorageService.getSettings());

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    StorageService.saveSettings(updated);
    onSettingsChanged(updated);

    if (key === 'soundEnabled') {
      sound.setMuted(!value);
    }
    sound.playPop();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-slate-900/85 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col text-white"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-500/90 backdrop-blur-md text-white flex items-center justify-between border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl backdrop-blur-xs">
              ⚙️
            </div>
            <div>
              <h2 className="text-lg font-black">Pengaturan Game</h2>
              <p className="text-xs text-white/90 font-medium">Sesuaikan kenyamanan bermain</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white cursor-pointer transition-colors backdrop-blur-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 flex flex-col gap-4">
          {/* 1. Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Efek Suara Permainan</h4>
                <p className="text-xs text-slate-300">Dadu, langkah, nada benar & salah</p>
              </div>
            </div>

            <button
              id="btn-toggle-sound"
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer border border-white/20 ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Lives System Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Sistem 3 Nyawa (❤️)</h4>
                <p className="text-xs text-slate-300">Nyawa berkurang jika salah soal ular</p>
              </div>
            </div>

            <button
              id="btn-toggle-lives"
              onClick={() => updateSetting('useLives', !settings.useLives)}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer border border-white/20 ${
                settings.useLives ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.useLives ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Animation Speed */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center">
                <FastForward className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Kecepatan Animasi Dadu & Pion</h4>
                <p className="text-xs text-slate-300">Pilih kecepatan gerakan</p>
              </div>
            </div>

            <select
              value={settings.animationSpeed}
              onChange={e => updateSetting('animationSpeed', e.target.value as 'normal' | 'fast')}
              className="px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold bg-slate-800 text-white cursor-pointer backdrop-blur-md"
            >
              <option value="normal">Normal (Santai)</option>
              <option value="fast">Cepat (Kilat)</option>
            </select>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg backdrop-blur-md transition-all mt-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Simpan & Kembali</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
