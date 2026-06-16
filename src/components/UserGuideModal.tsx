import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Search, Cpu, Sparkles, Activity, ShieldAlert } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-white/10 shadow-2xl shadow-indigo-900/20 rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Panduan Penggunaan</h2>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-0.5">IHSG Stock Predictor (AI)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 space-y-6">
            
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Selamat datang di aplikasi <strong className="text-indigo-400">IHSG Stock Predictor</strong>. Aplikasi ini menggabungkan analisis teknikal, fundamental, dan teknologi <em>Deep Learning</em> (Convolutional Neural Network) untuk memandu keputusan investasi Anda.
            </p>

            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-slate-300">1</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <Search className="w-4 h-4 text-emerald-400" />
                  Pilih & Pantau Saham
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gunakan keranjang saham di panel kiri untuk mencari dan memilih emiten. Anda dapat menandai saham favorit dengan ikon bintang (⭐). Pilih kerangka waktu (1 Hari, 1 Minggu, atau 1 Bulan) melalui kontrol <em>Timeframe</em> pada kurva grafik.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-slate-300">2</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Kalkulasi Prediksi
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pada panel profil emiten, klik tombol <strong>"Kalkulasi Prediksi Fundamental AI"</strong>. Model AI akan menganalisis indikator teknis (RSI, Pola Candlestick, MACD) dan rasio fundamental makro (P/E, ROE) milik perusahaan untuk mengeluarkan rekomendasi target arah harga.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-slate-300">3</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Auto-Training (Validasi Terdalam)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  Jika Anda merasa perhitungan AI meleset dari kondisi pasar riil, gunakan panel <strong>Optimasi Model & Reinforcement</strong> di sebelah kanan. Pilih bias sentimen koreksi Anda, dan tekan tombol:
                </p>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-bold uppercase tracking-wider">Auto Train CNN (&gt;99%)</span>
                    <span className="text-xs text-slate-400">Otomatis menjalankan pelatihan intensif lintas iterasi (500 epoch) hingga performa jaringan valid menembus batas akurasi 99.1%.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-slate-300">4</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-400" />
                  Evaluasi & Jurnal Keputusan
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pantau kekuatan prediksi model pada panel <strong>Self-Evaluation Log</strong>. Sistem mempertahankan jurnal pengujian silang atas 500 riwayat transaksi pasar masa lalu untuk memastikan tingkat efisiensi menang (Win Rate) serta nilai kalibrasi terkini.
                </p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/5 bg-slate-950/40 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-indigo-900/20"
            >
              Saya Mengerti
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
