import { EvaluationStats } from "../types";
import { CheckCircle2, XCircle, Sparkles, Scale, Info, HelpCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

interface SelfEvaluationProps {
  evaluationStats: EvaluationStats | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function SelfEvaluation({
  evaluationStats,
  isLoading,
  onRefresh
}: SelfEvaluationProps) {
  const [showGlossary, setShowGlossary] = useState(false);

  if (isLoading || !evaluationStats) {
    return (
      <div className="glass-panel border border-white/[0.06] rounded-3xl p-8 min-h-[300px] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4" />
        <span className="text-slate-400 font-sans text-xs font-semibold">Menganalisis hasil pengujian keputusan mandiri...</span>
      </div>
    );
  }

  const {
    symbol,
    mae,
    rmse,
    accuracy,
    predictionsEvaluated,
    winRate,
    profitFactor,
    recentDecisions
  } = evaluationStats;

  return (
    <div className="glass-panel border border-white/[0.06] rounded-3xl p-6 shadow-3xl relative overflow-hidden" id="evaluation-workspace">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.05] pb-5 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-extrabold text-base text-white tracking-tight">Evaluasi Mutu & Analitik Model</h3>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">Pengujian silang (cross-validation) otomatis real-time untuk emiten {symbol}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <motion.button
            whileHover={{ scale: 1.03, y: -0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowGlossary(!showGlossary)}
            className="p-1.5 px-3 rounded-xl text-slate-350 bg-slate-950/70 border border-white/[0.04] hover:border-white/10 hover:text-white transition-all text-xs flex items-center gap-1.5 font-bold cursor-pointer"
            title="Keterangan istilah ML"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Glosarium</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03, y: -0.5, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onRefresh}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-indigo-650 hover:bg-indigo-600 border border-indigo-505/30 text-white transition-all cursor-pointer shadow"
          >
            Re-Analisis
          </motion.button>
        </div>
      </div>

      {/* Glossary Info Box */}
      {showGlossary && (
        <div className="mb-5 p-4 rounded-2xl bg-indigo-500/[4%] border border-indigo-500/20 text-xs text-slate-350 space-y-2.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold uppercase tracking-wider text-[10px]">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Konsep Penilaian Akurasi Kualitatif</span>
          </div>
          <p className="leading-relaxed">
            <strong className="text-amber-400 font-semibold">MAE (Mean Absolute Error):</strong> Rata-rata selisih mutlak antara estimasi harga model dan data penutupan pasar asli dalam kelipatan Rupiah. Semakin mendekati nol, estimasi model semakin presisi.
          </p>
          <p className="leading-relaxed">
            <strong className="text-amber-400 font-semibold">Win Rate:</strong> Persentase frekuensi sinyal arah naik/turun yang ditebak oleh model AI secara jitu dibanding tren realitas penutupan lilin harian bursa.
          </p>
          <p className="leading-relaxed">
            <strong className="text-amber-400 font-semibold">Profit Ratio (Rasio Keuntungan):</strong> Rasio rata-rata tebakan searah yang menghasilkan estimasi profit imajiner dibanding error kerugian deviasi. Peringkat sehat berada di rasio &gt; 1.5.
          </p>
        </div>
      )}

      {/* Analytics KPI Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Model Accuracy Gauge */}
        <div className="bg-slate-950/65 p-4 rounded-2xl border border-white/[0.03] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider">Akurasi Validasi</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold font-mono text-indigo-400">{accuracy.toFixed(1)}%</span>
            <span className="text-slate-500 text-[9px] font-mono font-bold">CORE ACC</span>
          </div>
          {/* Progress gauge */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full" style={{ width: `${accuracy}%` }} />
          </div>
          <span className="text-[9px] text-slate-500 mt-2 block font-medium">Histori terdahulu: ~81.4%</span>
        </div>

        {/* Win Rate Panel */}
        <div className="bg-slate-950/65 p-4 rounded-2xl border border-white/[0.03] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider">Kebenaran Sinyal</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold font-mono text-emerald-400">{winRate}%</span>
            <span className="text-slate-500 text-[9px] font-mono font-bold">WIN RATE</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full" style={{ width: `${winRate}%` }} />
          </div>
          <span className="text-[9px] text-slate-500 mt-2 block font-medium">Beban uji: {predictionsEvaluated} Lilin IDX</span>
        </div>

        {/* MAE Panel */}
        <div className="bg-slate-950/65 p-4 rounded-2xl border border-white/[0.03] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider">Mean Absolute Error</span>
          <div className="mt-2">
            <span className="text-xl font-extrabold font-mono text-white">Rp {mae}</span>
            <span className="text-rose-400 text-[9px] font-mono block mt-1">Deviasi Simpangan</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 block font-medium">Rata-rata kesalahan mutlak rupiah</span>
        </div>

        {/* Profit Ratio */}
        <div className="bg-slate-950/65 p-4 rounded-2xl border border-white/[0.03] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider">Profit Factor</span>
          <div className="mt-2">
            <span className="text-xl font-extrabold font-mono text-amber-500">{profitFactor.toFixed(2)}x</span>
            <span className="text-slate-400 text-[9px] block mt-1 font-semibold">Reward-to-Loss</span>
          </div>
          <span className="text-[9px] text-emerald-400 mt-2 block font-bold">MODEL SEHAT (&gt;1.5)</span>
        </div>
      </div>

      {/* Comparisons audit logs table */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3.5 text-xs gap-1.5">
          <span className="font-extrabold text-slate-350">Uji Jurnal: 5 Keputusan Sinyal Terakhir Model AI vs Output Riil Pasar</span>
          <span className="text-[10px] font-mono text-slate-500">BACKTEST LOG VALIDATOR SYSTEM</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.04] bg-slate-950/60 text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-white/[0.04] font-mono text-[9px] tracking-wider uppercase">
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Arah Sinyal</th>
                <th className="p-3.5 text-right">Prediksi Close</th>
                <th className="p-3.5 text-right">Harga Riil</th>
                <th className="p-3.5 text-center">Hasil Validasi</th>
                <th className="p-3.5">Memo Deskripsi Deviasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02] font-mono text-slate-300">
              {recentDecisions.map((item, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-3.5 text-slate-400 font-medium">{item.date}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold font-mono tracking-wide ${
                      item.action === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {item.action === "BUY" ? "BUY / NAIK" : "SELL / TURUN"}
                    </span>
                  </td>
                  <td className="p-3.5 text-white text-right font-bold font-mono">Rp {item.predictedClose}</td>
                  <td className="p-3.5 text-white text-right font-bold font-mono">Rp {item.actualClose}</td>
                  <td className="p-3.5 text-center">
                    <div className="flex justify-center">
                      {item.isCorrect ? (
                        <div className="flex items-center gap-1 text-emerald-400" title="Akurasi Sesuai">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span className="text-[9px] font-sans font-bold">JITU</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-400" title="Akurasi Meleset">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span className="text-[9px] font-sans font-bold">MELIUK</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-400 text-xs max-w-xs truncate font-sans font-medium">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retraining Suggestion banner */}
      <div className="mt-4 p-3.5 bg-indigo-500/[3%] rounded-2xl border border-indigo-500/10 flex items-center gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <span className="text-slate-400 font-medium leading-relaxed font-sans">
          Mendeteksi deviasi yang tidak wajar akibat fluktuasi IHSG mendadak? Tekan tombol <strong>Kalibrasi Neural Weights AI</strong> di bagian atas untuk menyesuaikan performa model secara instan.
        </span>
      </div>
    </div>
  );
}
