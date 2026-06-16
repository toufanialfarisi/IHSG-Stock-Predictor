import { Stock, PredictionResult } from "../types";
import { Cpu, ShieldCheck, DollarSign, ChevronRight, TrendingUp, Sparkles, Building2, TrendingDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

interface StockDetailsProps {
  stock: Stock;
  prediction: PredictionResult | null;
  isPredicting: boolean;
  onTriggerPrediction: () => void;
}

export default function StockDetails({
  stock,
  prediction,
  isPredicting,
  onTriggerPrediction
}: StockDetailsProps) {
  const [activeTab, setActiveTab] = useState<"fundamental" | "profile" | "predictions">("fundamental");

  const isBullish = stock.change >= 0;

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-3xl flex flex-col justify-between border border-white/[0.06] transition-all" id="stock-profile-workspace">
      {/* Stock General Heading */}
      <div>
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-md">
              Sektor: {stock.sector}
            </span>
            <h2 className="text-2xl font-black text-white mt-3 tracking-tight flex items-center gap-2">
              <span>{stock.symbol}</span>
              <span className="text-xs font-normal text-slate-400 hidden sm:inline">| {stock.name}</span>
            </h2>
          </div>

          <div className="text-right">
            <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
              Rp {stock.price.toLocaleString("id-ID")}
            </div>
            <div className={`text-xs font-bold font-mono flex items-center justify-end gap-1 mt-1 ${
              isBullish ? "text-emerald-400" : "text-rose-400"
            }`}>
              {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isBullish ? "+" : ""}{stock.change.toFixed(2)}% Hari ini</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/[8%] mt-6 mb-5 overflow-x-auto gap-1 scrollbar-none">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab("fundamental")}
            className={`pb-3 px-4 text-xs font-bold transition-all shrink-0 cursor-pointer relative ${
              activeTab === "fundamental"
                ? "text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Metrik Fundamental
            {activeTab === "fundamental" && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-indigo-505 bg-gradient-to-r from-indigo-500 to-indigo-400" />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab("predictions")}
            className={`pb-3 px-4 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === "predictions"
                ? "text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Prediksi Harga</span>
            {activeTab === "predictions" && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-indigo-505 bg-gradient-to-r from-indigo-500 to-indigo-400" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 text-xs font-bold transition-all shrink-0 cursor-pointer relative ${
              activeTab === "profile"
                ? "text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Profil Emiten
            {activeTab === "profile" && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-indigo-505 bg-gradient-to-r from-indigo-500 to-indigo-400" />
            )}
          </motion.button>
        </div>

        {/* Tab contents */}
        {activeTab === "fundamental" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-slate-950/55 p-3 rounded-2xl border border-white/[0.04]">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">P/E Ratio</span>
                <span className="text-base font-extrabold font-mono text-white mt-1 block">{stock.fundamentals.peRatio}x</span>
                <span className="text-[9px] text-slate-400 block mt-1">Acuan Rata-rata: 15-20x</span>
              </div>

              <div className="bg-slate-950/55 p-3 rounded-2xl border border-white/[0.04]">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Price to Book (PBV)</span>
                <span className="text-base font-extrabold font-mono text-white mt-1 block">{stock.fundamentals.pbvRatio}x</span>
                <span className="text-[9px] text-slate-400 block mt-1 font-sans">Kelipatan nilai aset</span>
              </div>

              <div className="bg-slate-950/55 p-3 rounded-2xl border border-white/[0.04]">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">ROE</span>
                <span className={`text-base font-extrabold font-mono mt-1 block ${
                  stock.fundamentals.roe > 15 ? "text-emerald-400" : "text-white"
                }`}>{stock.fundamentals.roe}%</span>
                <span className="text-[9px] text-slate-400 block mt-1">Tingkat pengembalian modal</span>
              </div>

              <div className="bg-slate-950/55 p-3 rounded-2xl border border-white/[0.04]">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Yield Dividen</span>
                <span className="text-base font-extrabold font-mono text-amber-500 mt-1 block">{stock.fundamentals.dividendYield}%</span>
                <span className="text-[9px] text-slate-400 block mt-1">Imbal hasil dividen</span>
              </div>

              <div className="bg-slate-950/55 p-3 rounded-2xl border border-white/[0.04]">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Rasio DER</span>
                <span className={`text-base font-extrabold font-mono mt-1 block ${
                  stock.fundamentals.der < 1 ? "text-emerald-400" : "text-rose-400"
                }`}>{stock.fundamentals.der}x</span>
                <span className="text-[9px] text-slate-400 block mt-1">Rasio utang terhadap ekuitas</span>
              </div>

              <div className="bg-slate-950/55 p-3 rounded-2xl border border-white/[0.04]">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Current Ratio</span>
                <span className="text-base font-extrabold font-mono text-white mt-1 block">{stock.fundamentals.currentRatio}x</span>
                <span className="text-[9px] text-slate-400 block mt-1">Likuiditas aset lancar</span>
              </div>
            </div>

            {/* Dividend Hunter Corner */}
            <div className="p-4 rounded-2xl bg-amber-500/[4%] border border-amber-500/10 text-xs">
              <span className="font-bold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider text-[10px] mb-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Catatan Dividend Hunter:
              </span>
              <p className="text-slate-300 leading-relaxed font-sans font-medium">
                {stock.fundamentals.dividendHunterNote}
              </p>
            </div>

            {/* Financial Health rating banner */}
            <div className="flex items-center gap-3 bg-slate-950/65 p-3.5 rounded-2xl border border-white/[0.04] text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block font-mono">STATUS PENGAWASAN FINANSIAL:</span>
                <span className="text-slate-200 font-bold">{stock.fundamentals.financialStatus}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-4 animate-fadeIn text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/65 border border-white/[0.04] space-y-3">
              <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                <span className="text-slate-400">Nama Resmi Perusahaan</span>
                <span className="text-slate-150 font-bold text-right">{stock.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                <span className="text-slate-400">Kode Saham IDX</span>
                <span className="text-indigo-400 font-extrabold font-mono">{stock.symbol}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                <span className="text-slate-400">Kapitalisasi Pasar</span>
                <span className="text-slate-150 font-mono font-bold">{stock.fundamentals.marketCap}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                <span className="text-slate-400">Jumlah Saham Beredar</span>
                <span className="text-slate-150 font-mono font-bold">{stock.fundamentals.sharesOutstanding}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                <span className="text-slate-400">Sektor Industri</span>
                <span className="text-slate-150 font-semibold">{stock.sector}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Peringkat Prospek</span>
                <span className="text-amber-500 font-bold">{stock.fundamentals.prospectRating}</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-500/[4%] rounded-2xl border border-indigo-500/10 text-[11px] text-slate-400 flex items-start gap-2.5">
              <Building2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-sans font-medium">
                Emiten {stock.symbol} telah didaftarkan secara legal di Bursa Efek Indonesia (BEI/IDX). Data fluktuasi transasional di-update secara berkala untuk keperluan pengujian algoritma machine learning pada IHSG Stock Predictor.
              </p>
            </div>
          </div>
        )}

        {activeTab === "predictions" && (
          <div className="space-y-4 animate-fadeIn">
            {prediction ? (
              <div className="space-y-4 text-xs">
                {/* Prediction Action Header Card */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                      prediction.action.includes("BUY") 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {prediction.action.replace("_", " ")}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">REKOMENDASI MODEL</span>
                      <span className="font-extrabold text-white text-sm block mt-0.5">
                        {prediction.action === "STRONG_BUY" ? "BELI KUAT (STRONG BUY)" : prediction.action === "BUY" ? "BELI (BUY)" : prediction.action === "SELL" ? "JUAL (SELL)" : "TAHAN (HOLD)"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Kepercayaan</span>
                    <span className="text-sm font-extrabold font-mono text-indigo-400 block mt-0.5">{prediction.confidence}% Akurasi</span>
                  </div>
                </div>

                {/* target coordinates details */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-emerald-500/15">
                    <span className="text-[9px] text-slate-500 block uppercase font-sans font-bold">Harga Target (Take Profit)</span>
                    <span className="text-base font-extrabold text-emerald-400 mt-1 block">Rp {prediction.targetPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-rose-500/15">
                    <span className="text-[9px] text-slate-500 block uppercase font-sans font-bold">Batas Stop Loss</span>
                    <span className="text-base font-extrabold text-rose-400 mt-1 block">Rp {prediction.stopLoss.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Analytical breakdown narrative */}
                <div className="bg-slate-950/85 p-4 rounded-2xl border border-white/[0.04] space-y-3.5 text-xs">
                  <div>
                    <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[9px] mb-1">Analisa Bisnis & Makro</span>
                    <p className="text-slate-350 leading-relaxed font-sans">{prediction.reasoningText}</p>
                  </div>
                  
                  <div className="border-t border-white/[0.03] pt-3">
                    <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[9px] mb-1">Kalkulasi Struktur Teknikal (Candlestick)</span>
                    <p className="text-slate-350 leading-relaxed font-sans">{prediction.technicalAnalysisText}</p>
                  </div>

                  <div className="border-t border-white/[0.03] pt-3">
                    <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[9px] mb-1">Analisis Rasio Buku Ledger</span>
                    <p className="text-slate-350 leading-relaxed font-sans">{prediction.fundamentalAnalysisText}</p>
                  </div>
                </div>

                {/* Model Version Tag */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
                  <span>Engine: {prediction.modelCode}</span>
                  <span>Di-analisa: {prediction.timestamp}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-950/65 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Belum Ada Hasil Prediksi AI</h4>
                  <p className="text-slate-400 text-xs mt-1.5 max-w-sm font-sans mx-auto leading-relaxed">
                    Minta asisten model machine learning server untuk membaca pergerakaan candlestick hari ini secara cerdas.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prediksi CTA always pinned on the bottom inside a tab */}
      <div className="mt-6 border-t border-white/[0.04] pt-4">
        <motion.button
          whileHover={{ scale: isPredicting ? 1 : 1.02, y: isPredicting ? 0 : -2, boxShadow: isPredicting ? "none" : "0 8px 25px -4px rgba(99, 102, 241, 0.4)" }}
          whileTap={{ scale: isPredicting ? 1 : 0.98 }}
          onClick={onTriggerPrediction}
          disabled={isPredicting}
          className="w-full py-3.5 px-4 rounded-2xl font-black text-white text-xs tracking-wider uppercase bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:bg-slate-800 disabled:from-slate-850 disabled:to-slate-850 disabled:text-slate-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          {isPredicting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Memanggil Server AI Gemini...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 text-white animate-pulse" />
              <span>{prediction ? "Hitung Ulang Prediksi (Fundamental & Teknis)" : "Kalkulasi Prediksi Fundamental AI"}</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
