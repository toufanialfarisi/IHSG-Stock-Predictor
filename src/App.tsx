import { useState, useEffect, useRef } from "react";
import { Stock, Candlestick, PredictionResult, EvaluationStats, RetrainingResponse } from "./types";
import TechnicalChart from "./components/TechnicalChart";
import SelfEvaluation from "./components/SelfEvaluation";
import { motion, AnimatePresence } from "motion/react";
import ModelRetrainer from "./components/ModelRetrainer";
import StockDetails from "./components/StockDetails";
import UserGuideModal from "./components/UserGuideModal";
import { 
  Search, Bell, Sparkles, TrendingUp, TrendingDown, Bot, ShieldAlert, 
  Activity, Volume2, VolumeX, LayoutDashboard, Brain, Cpu, Clock, HelpCircle
} from "lucide-react";

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BBCA");
  const [activeStock, setActiveStock] = useState<Stock | null>(null);
  const [candlesticks, setCandlesticks] = useState<Candlestick[]>([]);
  const [modelState, setModelState] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeframe, setTimeframe] = useState<"1D"|"1W"|"1M">("1D");
  const [showGuide, setShowGuide] = useState<boolean>(false);
  
  const [showWatchlistOnly, setShowWatchlistOnly] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("watchlist") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (e: any, symbol: string) => {
    e.stopPropagation();
    setWatchlist(prev => prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]);
  };
  
  // Predictions and evaluations states
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [evalStats, setEvalStats] = useState<EvaluationStats | null>(null);
  const [isLoadingEval, setIsLoadingEval] = useState<boolean>(false);

  // Real-time market alerts and floating notifications
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeToast, setActiveToast] = useState<any | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [ihsgPrice, setIhsgPrice] = useState<number>(7245.50);
  const [ihsgChange, setIhsgChange] = useState<number>(0.34);

  // Simulation controls
  const [simPercent, setSimPercent] = useState<string>("4.5");
  const [simAction, setSimAction] = useState<"BUY" | "SELL">("BUY");

  // Keep track of the last processed Alert ID to prevent duplicate popups
  const lastAlertIdRef = useRef<string | null>(null);

  // Current system clock
  const [currentTime, setCurrentTime] = useState<string>("");

  // Update clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Initial Fetch stocks
  useEffect(() => {
    fetchStocksList();
    const interval = setInterval(fetchStocksList, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch specific stock details when selection shifts
  useEffect(() => {
    fetchStockDetailsAndHistory(selectedSymbol);
    setPrediction(null);
  }, [selectedSymbol]);

  // 3. Poll Volatility Alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/market-alerts");
        if (response.ok) {
          const alertsList = await response.json();
          setAlerts(alertsList);

          // Handle new high frequency push alert
          if (alertsList.length > 0) {
            const newest = alertsList[0];
            if (lastAlertIdRef.current === null) {
              lastAlertIdRef.current = newest.id;
            } else if (lastAlertIdRef.current !== newest.id) {
              lastAlertIdRef.current = newest.id;
              setActiveToast(newest);
              if (soundEnabled) {
                playSimulatedAlertBeep();
              }
              // Auto dismiss
              setTimeout(() => {
                setActiveToast((curr: any) => curr?.id === newest.id ? null : curr);
              }, 7000);
            }
          }
        }
      } catch (error) {
        console.warn("Unable to fetch alerts:", error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2500);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Autocomplete search states
  const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Click outside search listener to close popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Retrieve real-time IHSG composite JCI indices from Yahoo Finance
  useEffect(() => {
    const fetchIHSG = async () => {
      try {
        const response = await fetch("/api/ihsg-index");
        if (response.ok) {
          const data = await response.json();
          setIhsgPrice(data.price);
          setIhsgChange(data.change);
        }
      } catch (e) {
        console.warn("Gagal mengambil data live IHSG:", e);
      }
    };
    fetchIHSG();
    const interval = setInterval(fetchIHSG, 6000);
    return () => clearInterval(interval);
  }, []);

  // Autocomplete dynamic search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setAutocompleteResults(data);
          setShowAutocomplete(true);
        }
      } catch (error) {
        console.warn("Error running autocomplete suggestion search:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStocksList = async () => {
    try {
      const response = await fetch("/api/stocks");
      if (response.ok) {
        const data = await response.json();
        setStocks(data);
        if (activeStock) {
          const fresh = data.find((s: Stock) => s.symbol === activeStock.symbol);
          if (fresh) setActiveStock(fresh);
        }
      }
    } catch (error) {
      console.warn("Error fetching stocks list:", error);
    }
  };

  useEffect(() => {
    if (!activeStock || !selectedSymbol) return;
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/stocks/${selectedSymbol}/history?tf=${timeframe}`);
        if (response.ok) {
          const data = await response.json();
          setCandlesticks(data);
        }
      } catch (error) {
        console.warn("Error fetching timeframe history:", error);
      }
    };
    fetchHistory();
  }, [timeframe, selectedSymbol]);

  const fetchStockDetailsAndHistory = async (symbol: string) => {
    try {
      const response = await fetch(`/api/stocks/${symbol}?tf=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setActiveStock(data.stock);
        // Default history provided by stocks api endpoint might be overriden above if tf !== 1D
        // Wait, the new endpoint /api/stocks/:symbol handles ?tf in our modified server.ts?
        // Actually earlier we didn't add ?tf to /api/stocks/:symbol, only to /api/stocks/:symbol/history.
        // Let's just use the default here, and re-fetch if needed.
        if (timeframe === "1D") {
          setCandlesticks(data.candlesticks);
        }
        setModelState(data.modelState);
        fetchEvaluationStatistics(symbol);
      }
    } catch (error) {
      console.warn("Error fetching details for symbol:", symbol, error);
    }
  };

  const fetchEvaluationStatistics = async (symbol: string) => {
    setIsLoadingEval(true);
    try {
      const response = await fetch(`/api/evaluation-stats/${symbol}`);
      if (response.ok) {
        const data = await response.json();
        setEvalStats(data);
      }
    } catch (e) {
      console.warn("Error evaluasi statistics:", e);
    } finally {
      setIsLoadingEval(false);
    }
  };

  const handleTriggerPrediction = async () => {
    if (!activeStock) return;
    setIsPredicting(true);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: activeStock.symbol })
      });
      if (response.ok) {
        const data = await response.json();
        setPrediction(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSimulateVolatilityAction = async () => {
    if (!activeStock) return;
    try {
      const response = await fetch("/api/market-alerts/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: activeStock.symbol,
          action: simAction,
          percent: parseFloat(simPercent) * (simAction === "SELL" ? -1 : 1)
        })
      });
      if (response.ok) {
        fetchStocksList();
      }
    } catch (e) {
      console.warn("Simulation failed:", e);
    }
  };

  const handleRetrainingCompleted = (result: RetrainingResponse) => {
    fetchStockDetailsAndHistory(selectedSymbol);
  };

  const playSimulatedAlertBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn("Beep audio blocked by browser gestures:", e);
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    const symbolMatch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const queryMatch = symbolMatch || nameMatch;
    
    if (showWatchlistOnly) {
      return queryMatch && watchlist.includes(stock.symbol);
    }
    return queryMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden select-none">
      
      {/* Absolute ambient backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/[2.5%] blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-violet-500/[2%] blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Real-time Push alert notification toast with entry animations */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4.5 rounded-2xl shadow-2xl border backdrop-blur-md ${
              activeToast.severity === "critical" 
                ? "bg-slate-900/90 border-rose-500/30 shadow-rose-950/20" 
                : "bg-slate-900/90 border-amber-500/30 shadow-amber-950/20"
            }`}
            id="market-volatility-toast"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                activeToast.severity === "critical" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
              }`}>
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    activeToast.severity === "critical" ? "bg-rose-500/10 text-rose-300" : "bg-amber-500/10 text-amber-300"
                  }`}>
                    Laporan Volatilitas: {activeToast.symbol}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono shrink-0">{activeToast.timestamp}</span>
                </div>
                <p className="text-xs text-slate-200 mt-2 font-medium leading-relaxed font-sans">
                  {activeToast.message}
                </p>
                
                <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-white/[5%] pt-2.5">
                  <span className={`text-[10px] font-mono font-extrabold ${
                    activeToast.percentChange > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    Anomali: {activeToast.percentChange > 0 ? "+" : ""}{activeToast.percentChange.toFixed(2)}%
                  </span>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setActiveToast(null)}
                    className="text-[9px] bg-slate-950 hover:bg-slate-900 border border-white/[0.08] hover:border-indigo-500/20 p-1.5 px-3.5 rounded-md hover:text-white transition-all font-bold cursor-pointer"
                  >
                    Tutup
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
          TOP NAVIGATION BAR (Indonesian Market Index Ticker)
          ---------------------------------------------------- */}
      <header className="bg-slate-900/40 backdrop-blur-lg border-b border-white/[0.04] sticky top-0 z-40 py-4 px-6 relative" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black text-xs tracking-widest uppercase shadow-md shadow-indigo-950/40">
              IDX AI
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>IHSG Stock Predictor</span>
                <span className="px-2 py-0.5 text-[8px] font-bold bg-amber-500/10 text-amber-400 rounded border border-amber-500/20 uppercase tracking-widest font-mono">Premium Console</span>
              </h1>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-widest font-bold">Model Pembelajaran Mesin Berkelanjutan</p>
            </div>
          </div>

          {/* Real-time Composite Index ticker bar */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Clock */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 py-2 px-3 rounded-xl border border-white/[0.04] text-slate-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>WIB: {currentTime || "00:00:00"}</span>
            </div>

            <div className="bg-slate-950/60 py-2 px-3.5 rounded-xl border border-white/[0.04] flex items-center gap-3">
              <span className="text-slate-500 text-[10px] uppercase font-sans font-bold tracking-wider">KOMPOSIT (IHSG)</span>
              <span className="font-extrabold text-white">Rp {ihsgPrice.toLocaleString("id-ID")}</span>
              <span className={`flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md ${
                ihsgChange >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}>
                {ihsgChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{ihsgChange >= 0 ? "+" : ""}{ihsgChange.toFixed(2)}%</span>
              </span>
            </div>

            {/* Guide Button */}
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 py-2 px-3 rounded-xl border border-indigo-500/20 transition-all focus:outline-none"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:block text-xs font-bold tracking-wide uppercase">Panduan</span>
            </button>

            {/* Sound alert toggle controls */}
            <motion.button
              whileHover={{ scale: 1.05, y: -0.5 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) {
                  playSimulatedAlertBeep();
                }
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow shadow-indigo-950/40" 
                  : "bg-slate-950/70 border-white/[0.04] text-slate-500 hover:text-slate-350 hover:border-white/12"
              }`}
              title={soundEnabled ? "Nonaktifkan suara bip" : "Aktifkan suara bip alarm volatilitas"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------
          MAIN SCREEN WORKSPACE GRID (Bento layout)
          ---------------------------------------------------- */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10" id="dashboard-bento">
        
        {/* SIDEBAR NAVIGATION: STOCK LIST & MARKET NOTIFS DRUMS (Cols 3) */}
        <div className="lg:col-span-3 flex flex-col gap-6" id="sidebar-panel">
          
          {/* Ticker Selector Card */}
          <div className="glass-panel rounded-3xl p-4.5 shadow-3xl flex-1 flex flex-col min-h-[400px] border border-white/[0.06]">
            <div className="mb-4 relative" ref={searchContainerRef} id="search-autocomplete-box">
              <input
                type="text"
                placeholder="Cari kode IDX / emiten..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) {
                    setShowAutocomplete(true);
                  }
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() === "") {
                    setShowAutocomplete(false);
                  }
                }}
                className="w-full bg-slate-950/80 border border-white/[0.04] rounded-2xl py-2.5 px-3 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all font-sans font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3.5" />

              {/* Autocomplete suggestions overlay popup with sleek animations */}
              <AnimatePresence>
                {showAutocomplete && (autocompleteResults.length > 0 || isSearching) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-12 left-0 right-0 z-50 bg-slate-900/98 border border-white/[0.08] backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-white/[0.04]"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-[10px] text-slate-400 font-mono flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span>Mencari IDX Realtime...</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.04]">
                        {autocompleteResults.map((item) => (
                          <div
                            key={item.symbol}
                            onClick={() => {
                              setSelectedSymbol(item.symbol.toUpperCase());
                              setSearchQuery("");
                              setShowAutocomplete(false);
                              // Warm load immediately
                              fetchStockDetailsAndHistory(item.symbol.toUpperCase());
                              fetchStocksList();
                            }}
                            className="p-3 text-left hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center justify-between gap-1.5 group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                                  {item.symbol}
                                </span>
                                <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-505/10 px-1 py-0.2 rounded font-mono font-bold scale-90">
                                  {item.symbol === "^JKSE" ? "IDX INDEX" : "IDX STOCK"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans font-medium">
                                {item.name}
                              </div>
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono max-w-[100px] truncate shrink-0">
                              {item.sector}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mb-3 text-[10px] font-black text-slate-500 font-mono uppercase tracking-wider">
              <span>Daftar Saham Terdaftar</span>
              <div className="flex bg-slate-950/60 rounded-lg p-0.5 border border-white/5">
                <button
                  onClick={() => setShowWatchlistOnly(false)}
                  className={`px-2 py-1 rounded-md transition-all ${!showWatchlistOnly ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setShowWatchlistOnly(true)}
                  className={`px-2 py-1 rounded-md transition-all ${showWatchlistOnly ? "bg-amber-500/20 text-amber-300" : "text-slate-500 hover:text-slate-300"}`}
                >
                  ⭐ Fav
                </button>
              </div>
            </div>
            
            {/* Scrollable stock listing */}
            <div className="flex-1 overflow-y-auto max-h-[350px] lg:max-h-[500px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 pr-0.5">
              {filteredStocks.map((stock) => {
                const stockIsBullish = stock.change >= 0;
                const isSelected = stock.symbol === selectedSymbol;
                const isWatchlisted = watchlist.includes(stock.symbol);
                return (
                  <motion.button
                    whileHover={{ scale: 1.015, x: 3, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.08)" }}
                    whileTap={{ scale: 0.985 }}
                    key={stock.symbol}
                    onClick={() => setSelectedSymbol(stock.symbol)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer relative ${
                      isSelected 
                        ? "bg-indigo-600/15 border-indigo-500/40 text-white shadow-md shadow-indigo-950/20 font-semibold" 
                        : "bg-slate-950/50 border-white/[0.03] hover:border-white/12 hover:bg-slate-900/50 text-slate-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={(e) => toggleWatchlist(e, stock.symbol)}
                          className={`shrink-0 transition-colors ${
                            isWatchlisted ? "text-amber-400" : "text-slate-600 hover:text-amber-400/50"
                          }`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill={isWatchlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        </button>
                        <span className={`font-mono text-xs font-black ${isSelected ? "text-indigo-300" : "text-white"}`}>
                          {stock.symbol}
                        </span>
                        <span className="text-[9px] text-slate-400 font-sans truncate max-w-[80px] hidden sm:inline-block font-bold">{stock.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block font-sans mt-0.5 ml-4 font-bold uppercase tracking-wide">{stock.sector.split(" ")[0]}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black font-mono text-white">
                        Rp {stock.price.toLocaleString("id-ID")}
                      </div>
                      <span className={`text-[9px] font-mono font-black block mt-0.5 ${
                        stockIsBullish ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"
                      }`}>
                        {stockIsBullish ? "+" : ""}{stock.change.toFixed(2)}%
                      </span>
                    </div>
                  </motion.button>
                );
              })}

              {filteredStocks.length === 0 && (
                <div className="text-center py-10 text-xs text-slate-500 font-mono font-semibold">
                  Emiten tidak terdaftar.
                </div>
              )}
            </div>
          </div>

          {/* SYSTEM TESTING: Volatility injection simulator panel */}
          <div className="glass-panel rounded-3xl p-4.5 shadow-3xl border border-white/[0.06]">
            <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 mb-2.5 uppercase tracking-wider">
              <Bot className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Suntik Volatilitas IHSG</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed mb-3.5 font-medium">
              Uji ketahanan kalkulasi alarm model AI Anda secara paksa dengan menusukkan volatilitas buatan pada history trading.
            </p>

             <div className="space-y-3.5 text-xs">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setSimAction("BUY")}
                  className={`flex-1 py-2 px-2 text-center font-black rounded-xl border text-[10px] uppercase cursor-pointer transition-all ${
                    simAction === "BUY" 
                      ? "bg-emerald-500/15 text-emerald-350 border-emerald-500/40 font-extrabold shadow-md shadow-emerald-950/35" 
                      : "bg-slate-950/60 text-slate-500 border-white/[0.04] hover:text-slate-400"
                  }`}
                >
                  Sinyal BUY
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setSimAction("SELL")}
                  className={`flex-1 py-2 px-2 text-center font-black rounded-xl border text-[10px] uppercase cursor-pointer transition-all ${
                    simAction === "SELL" 
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/40 font-extrabold shadow-md shadow-rose-950/35" 
                      : "bg-slate-950/60 text-slate-500 border-white/[0.04] hover:text-slate-400"
                  }`}
                >
                  Sinyal SELL
                </motion.button>
              </div>

              <div>
                <label className="text-[9px] font-bold font-mono text-slate-500 block mb-1 uppercase tracking-wider">Porsi Lonjakan Harga (%)</label>
                <select
                  value={simPercent}
                  onChange={(e) => setSimPercent(e.target.value)}
                  className="w-full bg-slate-950 border border-white/[0.04] rounded-xl p-2 text-xs text-slate-205 focus:outline-none"
                >
                  <option value="2.8">2.8% (Intraday Normal)</option>
                  <option value="4.5">4.5% (Volatilitas Tinggi)</option>
                  <option value="7.2">7.2% (Anomali Ekstrem)</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.025, y: -1, boxShadow: "0 4px 15px rgba(99, 102, 241, 0.2)" }}
                whileTap={{ scale: 0.975 }}
                onClick={handleSimulateVolatilityAction}
                className="w-full py-2.5 bg-indigo-650 bg-gradient-to-r from-indigo-650 to-violet-650 hover:from-indigo-600 hover:to-violet-600 border border-indigo-505/20 rounded-xl text-[10px] font-black uppercase tracking-wider text-white select-none transition-all cursor-pointer shadow-md"
              >
                Tembakkan Trigger Volt
              </motion.button>
            </div>
          </div>
        </div>

        {/* CORE WORK AREA: CHART VIEWS & MACHINE LEARNING TIERS (Cols 9) */}
        {activeStock ? (
          <div className="lg:col-span-9 space-y-6" id="core-trading-desk">
            
            {/* Interactive Workspace Candlestick charts */}
            <TechnicalChart 
              candlesticks={candlesticks} 
              symbol={activeStock.symbol}
              supportLevel={prediction?.supportLevel}
              resistanceLevel={prediction?.resistanceLevel}
              targetPrice={prediction?.targetPrice}
              stopLoss={prediction?.stopLoss}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />

            {/* Profile detail panels & Reinforcement Weight optimization modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <StockDetails 
                stock={activeStock}
                prediction={prediction}
                isPredicting={isPredicting}
                onTriggerPrediction={handleTriggerPrediction}
              />

              <ModelRetrainer 
                symbol={activeStock.symbol}
                onTrainCompleted={handleRetrainingCompleted}
              />

            </div>

            {/* Diagnostic system cross evaluator stats */}
            <SelfEvaluation 
              evaluationStats={evalStats}
              isLoading={isLoadingEval}
              onRefresh={() => fetchEvaluationStatistics(activeStock.symbol)}
            />

            {/* Alerts history logs block styled like a high-end terminal log */}
            <div className="glass-panel rounded-3xl p-5 shadow-3xl border border-white/[0.06]">
              <div className="flex items-center justify-between border-b border-white/[5%] pb-3 mb-3.5">
                <span className="text-xs font-extrabold text-white flex items-center gap-2 uppercase font-mono tracking-wider">
                  <Bell className="w-4 h-4 text-rose-500 shrink-0" />
                  Pusat Riwayat Deteksi Volatilitas (Live Logs)
                </span>
                <span className="text-[9px] text-slate-505 font-mono font-bold uppercase">Uji: {alerts.length} Laporan Sinyal</span>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1 select-text">
                {alerts.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 bg-slate-950/80 rounded-xl text-xs flex justify-between items-start gap-4 border border-white/[0.03] hover:border-white/[0.06] transition-all">
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-mono font-bold uppercase shrink-0 h-fit ${
                        item.percentChange > 0 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                          : "bg-rose-500/10 text-rose-450 border border-rose-500/15"
                      }`}>
                        {item.symbol}
                      </span>
                      <p className="text-slate-300 font-sans leading-relaxed text-[11px] font-medium">{item.message}</p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0 font-bold">{item.timestamp}</span>
                  </div>
                ))}

                {alerts.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-xs font-mono font-semibold">
                    Belum mendeteksi anomali volatilitas pasar ekstrem.
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-9 glass-panel border border-white/[0.06] rounded-3xl flex flex-col items-center justify-center min-h-[500px]">
            <div className="w-12 h-12 rounded-full border border-white/[0.08] animate-pulse flex items-center justify-center text-slate-400 mb-4 bg-slate-950">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-sm text-slate-400 font-sans font-bold">Menghubungkan ke Bursa Efek Indonesia...</span>
            <span className="text-[11px] text-slate-500 mt-1 font-mono">Sinkronisasi data real-time aliran IHSG</span>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900/30 border-t border-white/[0.04] py-5 px-6 text-center text-xs text-slate-500 font-sans mt-auto">
        <p className="font-medium">© 2026 IHSG Stock Predictor Dashboard • Menggunakan model Machine Learning Mandiri Kontinu & Google Gemini.</p>
      </footer>
      {/* Modals & Portals */}
      <UserGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

    </div>
  );
}
