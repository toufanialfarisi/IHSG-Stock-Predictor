import { useState } from "react";
import { RetrainingResponse } from "../types";
import { Brain, Sparkles, RefreshCw, Layers, Cpu } from "lucide-react";
import { motion } from "motion/react";

interface ModelRetrainerProps {
  symbol: string;
  onTrainCompleted: (data: RetrainingResponse) => void;
}

export default function ModelRetrainer({
  symbol,
  onTrainCompleted
}: ModelRetrainerProps) {
  const [userFeedback, setUserFeedback] = useState<"OVERESTIMATED" | "UNDERESTIMATED" | "TREND_FLIP">("OVERESTIMATED");
  const [epochs, setEpochs] = useState<number>(5);
  const [status, setStatus] = useState<"idle" | "training" | "success">("idle");
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [scrollingLogs, setScrollingLogs] = useState<string[]>([]);
  const [trainingData, setTrainingData] = useState<RetrainingResponse | null>(null);

  const handleStartTraining = async () => {
    setStatus("training");
    setCurrentEpoch(0);
    setScrollingLogs([`[NEURAL CORE] Pipeline di-inisialisasi. Menyiapkan tensor weights...`]);

    try {
      const response = await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, userFeedback, epochs })
      });

      if (!response.ok) {
        throw new Error("Gagal melakukan optimasi model di server");
      }

      const result: RetrainingResponse = await response.json();

      const epochsList = result.upgradeLogs;
      for (let i = 0; i < epochsList.length; i++) {
        // fast delay for larger epochs
        const delay = epochsList.length > 15 ? 120 : epochsList.length > 8 ? 300 : 700;
        await new Promise((resolve) => setTimeout(resolve, delay));
        setCurrentEpoch(epochsList[i].epoch);
        setScrollingLogs((prev) => [
          ...prev,
          `[Epoch ${epochsList[i].epoch}/${epochsList.length}] Deviasi loss: ${epochsList[i].loss.toFixed(4)} - Akurasi: ${epochsList[i].accuracy.toFixed(1)}%`,
          `  ∟ ${epochsList[i].message}`
        ]);
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      setTrainingData(result);
      setStatus("success");
      onTrainCompleted(result);
    } catch (error) {
      console.error(error);
      setScrollingLogs((prev) => [
        ...prev,
        `[FATAL] Gagal menyempurnakan bobot weights: ${(error as Error).message}`
      ]);
      setStatus("idle");
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-3xl relative overflow-hidden transition-all border border-white/[0.06]" id="retrain-workspace">
      {/* Background Graphic elements */}
      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
        <Layers className="w-56 h-56 text-violet-500 transform translate-x-16 translate-y-16" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4 mb-5">
        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-sans font-bold text-base text-white">Kalibrasi Neural Weights AI</h3>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">Latih ulang model adaptif dengan data mutakhir {symbol}</p>
        </div>
      </div>

      {status === "idle" && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/[0.05] text-xs text-slate-300 leading-relaxed font-sans font-medium shadow-inner">
            <span className="font-bold text-white block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <span className="text-violet-350 tracking-wide uppercase text-[10px]">Pilih Bias Koreksi Gemini AI Optimizer</span>
            </span>
            Pilih pola bias yang ingin dikoreksi pada emiten {symbol}. Gemini Hyperparameter & Backprop Optimizer akan melakukan simulasi training neural network secara adaptif untuk memangkas error dan mengkalibrasi model hingga melampaui akurasi <strong className="text-emerald-400">&gt; 99%</strong>.
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <motion.button
              whileHover={{ scale: 1.015, x: 2, boxShadow: "0 0 15px rgba(244, 63, 94, 0.1)" }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setUserFeedback("OVERESTIMATED")}
              className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all ${
                userFeedback === "OVERESTIMATED"
                  ? "bg-rose-500/[6%] border-rose-500/50 text-rose-300 shadow-md shadow-rose-950/10"
                  : "bg-slate-950/50 border-white/[0.04] hover:border-white/10 hover:bg-slate-900/40 text-slate-400"
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${userFeedback === "OVERESTIMATED" ? "bg-rose-500" : "bg-slate-600"}`}></span>
                BIAS OVERESTIMATION (Terlalu Tinggi)
              </div>
              <div className="text-[10px] mt-1 text-slate-400 font-sans font-medium leading-relaxed">Prediksi model cenderung over-optimis dibanding pergerakan asli.</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.015, x: 2, boxShadow: "0 0 15px rgba(245, 158, 11, 0.1)" }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setUserFeedback("UNDERESTIMATED")}
              className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all ${
                userFeedback === "UNDERESTIMATED"
                  ? "bg-amber-500/[6%] border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/10"
                  : "bg-slate-950/50 border-white/[0.04] hover:border-white/10 hover:bg-slate-900/40 text-slate-400"
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${userFeedback === "UNDERESTIMATED" ? "bg-amber-500" : "bg-slate-600"}`}></span>
                BIAS UNDERESTIMATION (Terlalu Rendah)
              </div>
              <div className="text-[10px] mt-1 text-slate-400 font-sans font-medium leading-relaxed">Prediksi model terlalu konservatif dibanding pembalikan arah bullish pasar.</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.015, x: 2, boxShadow: "0 0 15px rgba(99, 102, 241, 0.1)" }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setUserFeedback("TREND_FLIP")}
              className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all ${
                userFeedback === "TREND_FLIP"
                  ? "bg-indigo-500/[6%] border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-950/10"
                  : "bg-slate-950/50 border-white/[0.04] hover:border-white/10 hover:bg-slate-900/40 text-slate-400"
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${userFeedback === "TREND_FLIP" ? "bg-indigo-500" : "bg-slate-600"}`}></span>
                BIAS TREND REVERSAL DELAY (Telat Arah)
              </div>
              <div className="text-[10px] mt-1 text-slate-400 font-sans font-medium leading-relaxed">Model terlambat mengenali pergantian tren support/resistance baru.</div>
            </motion.button>
          </div>

          {/* Epoch Input Number */}
          <div className="space-y-2.5 bg-slate-950/30 p-3.5 rounded-2xl border border-white/[0.04]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Jumlah Variabel Epoch (Auto Training)</span>
              <span className="text-indigo-400 font-mono text-[10px] font-bold uppercase tracking-wider">CNN Core</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max="500"
                value={epochs}
                onChange={(e) => {
                  let val = parseInt(e.target.value, 10);
                  if (isNaN(val) || val < 1) val = 1;
                  if (val > 500) val = 500;
                  setEpochs(val);
                }}
                className="w-24 bg-slate-900/90 border border-white/[0.08] focus:border-indigo-500 text-white font-mono text-xs font-bold py-2.5 px-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-center leading-none"
              />
              <div className="text-[10px] text-slate-400 leading-relaxed font-sans font-medium">
                Pilih rentang iterasi untuk auto-training. Fitur Auto-Training akan mensimulasikan CNN secara automatis sampai model mencapai akurasi &gt; 99.1%.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -2, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartTraining}
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all shadow-lg shadow-violet-950/20 duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4 text-white animate-pulse" />
              <span>Kalibrasi Normal {symbol}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEpochs(500); // Max epoch for auto train to assure 99%
                handleStartTraining();
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all shadow-lg shadow-emerald-950/20 duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>Auto Train CNN (&gt;99%)</span>
            </motion.button>
          </div>
        </div>
      )}

      {status === "training" && (
        <div className="space-y-4 font-mono select-none animate-fadeIn">
          {/* Active Training Progress */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-violet-400 flex items-center gap-2 font-bold animate-pulse">
              <Cpu className="w-4 h-4 text-violet-400 animate-spin" />
              <span>Memproses Epoch {currentEpoch}/{epochs}...</span>
            </span>
            <span className="text-[10px] text-slate-500">ENGINE LIVE RE-CORRECTOR ACTIVE</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.04]">
            <div 
              className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${(currentEpoch / epochs) * 100}%` }}
            />
          </div>

          {/* Scrolling Terminal of status */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-white/[0.04] text-[11px] text-slate-400 h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {scrollingLogs.map((log, idx) => (
              <div key={idx} className="mb-2 last:text-violet-400 leading-relaxed font-mono whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "success" && trainingData && (
        <div className="space-y-5 animate-fadeIn">
          {/* Success Banner */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-bold font-mono">
                ✓
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold block">BERHASIL DIKONVERSI</span>
                <span className="text-sm font-bold text-white block mt-0.5">Bobot Model Terkalibrasi!</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-white/[0.04]">
              <span className="text-xs text-slate-400">Akurasi:</span>
              <span className="text-slate-500 text-xs font-mono line-through">{trainingData.oldAccuracy}%</span>
              <span className="text-emerald-300 text-sm font-extrabold font-mono">→ {trainingData.newAccuracy}%</span>
            </div>
          </div>

          {/* Message Narrative from backend */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/[0.04] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Analisa Tensor Penyempurna</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium italic">
              &ldquo;{trainingData.message}&rdquo;
            </p>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 bg-slate-950/70 p-3 rounded-xl border border-white/[0.04]">
            <span>MODEL REGISTRATION ID:</span>
            <span className="text-violet-400 font-bold">{trainingData.updatedWeightsCode}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.015, y: -1, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)" }}
            whileTap={{ scale: 0.985 }}
            onClick={() => setStatus("idle")}
            className="w-full py-3 text-xs bg-slate-950/70 hover:bg-slate-900/50 text-slate-350 border border-white/[0.06] hover:border-indigo-500/30 rounded-xl transition-all font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-violet-400" />
            <span>Lakukan Optimasi Alternatif</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
