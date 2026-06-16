import { useState } from "react";
import { Candlestick } from "../types";
import { Eye, EyeOff, TrendingUp, TrendingDown, Activity, BarChart4, Cpu } from "lucide-react";

interface TechnicalChartProps {
  candlesticks: Candlestick[];
  symbol: string;
  supportLevel?: number;
  resistanceLevel?: number;
  targetPrice?: number;
  stopLoss?: number;
  timeframe: "1D"|"1W"|"1M";
  setTimeframe: (tf: "1D"|"1W"|"1M") => void;
}

export default function TechnicalChart({
  candlesticks,
  symbol,
  supportLevel,
  resistanceLevel,
  targetPrice,
  stopLoss,
  timeframe,
  setTimeframe
}: TechnicalChartProps) {
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [activeIndicatorTab, setActiveIndicatorTab] = useState<"rsi" | "macd">("rsi");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!candlesticks || candlesticks.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center glass-panel rounded-3xl border border-white/5 text-slate-400 font-sans p-6 text-center">
        <Activity className="w-10 h-10 text-indigo-400 animate-pulse mb-3" />
        <span className="font-semibold text-sm">Menunggu Data Aliran IHSG...</span>
        <span className="text-xs text-slate-500 mt-1 font-mono">Sedang menyinkronkan dengan data perdagangan real-time</span>
      </div>
    );
  }

  // Display viewport of latest 35 candlesticks
  const viewportCount = 35;
  const data = candlesticks.slice(-viewportCount);

  // SVG dimensions
  const width = 800;
  const mainChartHeight = 250;
  const indicatorHeight = 85;
  const paddingRight = 65;
  const paddingLeft = 15;
  const paddingTop = 25;
  const paddingBottom = 15;

  const chartWidth = width - paddingLeft - paddingRight;

  // Find Min and Max values for Y axis scaling
  const closes = data.map((d) => d.close);
  const highs = data.map((d) => d.high);
  const lows = data.map((d) => d.low);
  const emas = data.map((d) => d.indicators?.ema20 || d.close);
  const bbUppers = showBB ? data.map((d) => d.indicators?.bbUpper || d.high) : [];
  const bbLowers = showBB ? data.map((d) => d.indicators?.bbLower || d.low) : [];

  let yMax = Math.max(...highs, ...emas, ...bbUppers, targetPrice || 0, resistanceLevel || 0) * 1.012;
  let yMin = Math.min(...lows, ...emas, ...bbLowers, stopLoss || 99999999, supportLevel || 99999999) * 0.988;

  if (yMin === 99999999 || yMin === undefined) {
    yMin = Math.min(...lows) * 0.985;
  }

  const yRange = yMax - yMin;

  // Coordinate Converters
  const getX = (index: number) => {
    return paddingLeft + (index * (chartWidth / (viewportCount - 1)));
  };

  const getY = (value: number) => {
    return paddingTop + mainChartHeight - ((value - yMin) / yRange) * (mainChartHeight - paddingTop - paddingBottom);
  };

  // Hover Info
  const hoverItem = hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < data.length ? data[hoveredIndex] : data[data.length - 1];

  // Bollinger Bands path generators
  const getBBFieldPath = () => {
    if (!showBB) return "";
    let path = "";
    for (let i = 0; i < data.length; i++) {
      const x = getX(i);
      const y = getY(data[i].indicators?.bbUpper || data[i].high);
      if (i === 0) path += `M ${x} ${y}`;
      else path += ` L ${x} ${y}`;
    }
    for (let i = data.length - 1; i >= 0; i--) {
      const x = getX(i);
      const y = getY(data[i].indicators?.bbLower || data[i].low);
      path += ` L ${x} ${y}`;
    }
    path += " Z";
    return path;
  };

  // EMA Path generator
  const getEMAPath = () => {
    let path = "";
    for (let i = 0; i < data.length; i++) {
      const val = data[i].indicators?.ema20 || data[i].close;
      const x = getX(i);
      const y = getY(val);
      if (i === 0) path += `M ${x} ${y}`;
      else path += ` L ${x} ${y}`;
    }
    return path;
  };

  // RSI/MACD coordinates helper
  const getRSIY = (rsiVal: number) => {
    const innerH = indicatorHeight - 20;
    return 10 + innerH - (rsiVal / 100) * innerH;
  };

  const getMACDY = (val: number, maxVal: number) => {
    const innerH = indicatorHeight - 20;
    const center = 10 + innerH / 2;
    if (maxVal === 0) return center;
    return center - (val / maxVal) * (innerH / 2);
  };

  // Compute max volume to scale volume bars
  const maxVolume = Math.max(...data.map((d) => d.volume));

  // Compute MACD max scaling
  const maxMACD = Math.max(...data.flatMap((d) => [
    Math.abs(d.indicators?.macdLine || 0),
    Math.abs(d.indicators?.macdSignal || 0),
    Math.abs(d.indicators?.macdHist || 0)
  ]));

  const itemIsBullish = hoverItem.close >= hoverItem.open;

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-3xl relative overflow-hidden transition-all border border-white/[0.06]" id="tech-chart-workspace">
      {/* Decorative accent glow */}
      <div className="absolute top-0 left-1/4 w-96 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 blur-sm opacity-60"></div>
      
      {/* Chart Headers & Active Ticker Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.06] mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
              Emiten: {symbol}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 text-[10px] font-mono tracking-tight">LIVE RECONCILIATION ACTIVE</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-extrabold text-white font-mono tracking-tight drop-shadow-sm">
              Rp {hoverItem.close.toLocaleString("id-ID")}
            </span>
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
              itemIsBullish
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}>
              O: {hoverItem.open} | H: {hoverItem.high} | L: {hoverItem.low} | Vol: {(hoverItem.volume / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        {/* Toolbar switches with premium layout */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex bg-slate-950/60 p-0.5 rounded-xl border border-white/5 mr-2">
            {(["1D", "1W", "1M"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  timeframe === tf
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showEMA 
                ? "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-md shadow-amber-950/20" 
                : "bg-slate-950/60 text-slate-500 border-white/5 hover:text-slate-300 hover:border-white/10"
            }`}
            title="Exponential Moving Average (20 periods)"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>EMA 20</span>
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showBB 
                ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-md shadow-indigo-950/20" 
                : "bg-slate-950/60 text-slate-500 border-white/5 hover:text-slate-300 hover:border-white/10"
            }`}
            title="Bollinger Bands (20, 2 StdDev)"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>BB Bands</span>
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showVolume 
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-md shadow-emerald-950/20" 
                : "bg-slate-950/60 text-slate-500 border-white/5 hover:text-slate-300 hover:border-white/10"
            }`}
            title="Volume Transaksi Saham"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>Volume</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Candlestick SVG Chart */}
      <div className="relative select-none bg-slate-950 border border-white/[0.04] p-3 rounded-2xl">
        <svg 
          viewBox={`0 0 ${width} ${mainChartHeight}`} 
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Grid lines with ultra-clean styling */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const val = yMin + p * yRange;
            const y = getY(val);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255,255,255,0.035)"
                  strokeDasharray="4,4"
                  strokeWidth={1}
                />
                <text
                  x={width - paddingRight + 8}
                  y={y + 3}
                  fill="#475569"
                  className="text-[9px] font-mono font-medium"
                >
                  {Math.round(val).toLocaleString("id-ID")}
                </text>
              </g>
            );
          })}

          {/* Golden Target Price & Stop-Loss Projections if available */}
          {targetPrice && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(targetPrice)}
                x2={width - paddingRight}
                y2={getY(targetPrice)}
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="6,4"
                className="opacity-70"
              />
              <rect
                x={width - paddingRight - 1}
                y={getY(targetPrice) - 7}
                width={56}
                height={14}
                fill="#065f46"
                stroke="#059669"
                strokeWidth={0.5}
                rx={3}
              />
              <text
                x={width - paddingRight + 4}
                y={getY(targetPrice) + 3}
                fill="#34d399"
                className="text-[8px] font-mono font-bold"
              >
                TP: {targetPrice}
              </text>
            </g>
          )}

          {stopLoss && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(stopLoss)}
                x2={width - paddingRight}
                y2={getY(stopLoss)}
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="6,4"
                className="opacity-70"
              />
              <rect
                x={width - paddingRight - 1}
                y={getY(stopLoss) - 7}
                width={56}
                height={14}
                fill="#991b1b"
                stroke="#dc2626"
                strokeWidth={0.5}
                rx={3}
              />
              <text
                x={width - paddingRight + 4}
                y={getY(stopLoss) + 3}
                fill="#fca5a5"
                className="text-[8px] font-mono font-bold"
              >
                SL: {stopLoss}
              </text>
            </g>
          )}

          {/* Support and Resistance Overlay Channels */}
          {supportLevel && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(supportLevel)}
                x2={width - paddingRight}
                y2={getY(supportLevel)}
                stroke="#06b6d4"
                strokeWidth={1}
                strokeDasharray="4,4"
                className="opacity-50"
              />
              <text
                x={paddingLeft + 5}
                y={getY(supportLevel) - 5}
                fill="#06b6d4"
                className="text-[8px] font-mono font-semibold"
              >
                S1 Support: Rp {supportLevel}
              </text>
            </g>
          )}

          {resistanceLevel && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(resistanceLevel)}
                x2={width - paddingRight}
                y2={getY(resistanceLevel)}
                stroke="#ec4899"
                strokeWidth={1}
                strokeDasharray="4,4"
                className="opacity-50"
              />
              <text
                x={paddingLeft + 5}
                y={getY(resistanceLevel) + 11}
                fill="#ec4899"
                className="text-[8px] font-mono font-semibold"
              >
                R1 Resistance: Rp {resistanceLevel}
              </text>
            </g>
          )}

          {/* Bollinger Bands Shaded area and Bounds lines */}
          {showBB && (
            <g>
              <path
                d={getBBFieldPath()}
                fill="rgba(99, 102, 241, 0.035)"
                stroke="rgba(99, 102, 241, 0.2)"
                strokeWidth={0.8}
              />
            </g>
          )}

          {/* Technical EMA 20 Line */}
          {showEMA && (
            <path
              d={getEMAPath()}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80"
            />
          )}

          {/* Translucent overlay volume bars drawn at the bottom region */}
          {showVolume && (
            <g opacity={0.25}>
              {data.map((d, i) => {
                const x = getX(i);
                const w = Math.max(3, (chartWidth / viewportCount) * 0.6);
                const h = (d.volume / maxVolume) * 50; 
                const y = mainChartHeight - h - paddingBottom;
                const fill = d.close >= d.open ? "#10b981" : "#f43f5e";
                return (
                  <rect
                    key={i}
                    x={x - w / 2}
                    y={y}
                    width={w}
                    height={h}
                    fill={fill}
                    rx={0.5}
                  />
                );
              })}
            </g>
          )}

          {/* Candlestick Glyphs */}
          {data.map((d, i) => {
            const x = getX(i);
            const openY = getY(d.open);
            const closeY = getY(d.close);
            const highY = getY(d.high);
            const lowY = getY(d.low);

            const isBullish = d.close >= d.open;
            const strokeColor = isBullish ? "#10b981" : "#f43f5e";
            const fillColor = isBullish ? "rgba(16, 185, 129, 0.85)" : "rgba(244, 63, 100, 0.85)";
            const candleWidth = Math.max(4, (chartWidth / viewportCount) * 0.7);

            return (
              <g key={i}>
                {/* Shadow wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={strokeColor}
                  strokeWidth={1.5}
                />
                {/* Real candle body with tiny corner radius for modern look */}
                <rect
                  x={x - candleWidth / 2}
                  y={Math.min(openY, closeY)}
                  width={candleWidth}
                  height={Math.max(2, Math.abs(openY - closeY))}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={0.8}
                  rx={1.5}
                />

                {/* Mouse hover zones */}
                <rect
                  x={x - (chartWidth / viewportCount) / 2}
                  y={0}
                  width={chartWidth / viewportCount}
                  height={mainChartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                />
              </g>
            );
          })}

          {/* Interactive Hover Crosshair */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={0}
                x2={getX(hoveredIndex)}
                y2={mainChartHeight}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(data[hoveredIndex].close)}
                r={5.5}
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth={1.5}
                className="shadow-lg"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Sub Graphs for RSI / MACD Oscillators */}
      <div className="mt-4 bg-slate-950/80 rounded-2xl p-4 border border-white/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Olah Sinyal Indikator</span>
          </span>
          <div className="flex bg-slate-900 border border-white/[0.05] p-0.5 rounded-lg">
            <button
              onClick={() => setActiveIndicatorTab("rsi")}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                activeIndicatorTab === "rsi" 
                  ? "bg-indigo-600 text-white shadow" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              RSI (14)
            </button>
            <button
              onClick={() => setActiveIndicatorTab("macd")}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                activeIndicatorTab === "macd" 
                  ? "bg-indigo-600 text-white shadow" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              MACD Hist
            </button>
          </div>
        </div>

        {/* Dynamic Indicator Graph */}
        <div className="h-[85px] w-full relative">
          <svg viewBox={`0 0 ${width} ${indicatorHeight}`} className="w-full h-full overflow-visible">
            {activeIndicatorTab === "rsi" ? (
              <g>
                {/* Bands boundaries: Oversold at 30, Overbought at 70 */}
                <line x1={paddingLeft} y1={getRSIY(70)} x2={width - paddingRight} y2={getRSIY(70)} stroke="#f43f5e" strokeWidth={1} strokeDasharray="3,3" opacity={0.5} />
                <line x1={paddingLeft} y1={getRSIY(30)} x2={width - paddingRight} y2={getRSIY(30)} stroke="#10b981" strokeWidth={1} strokeDasharray="3,3" opacity={0.5} />
                <rect x={paddingLeft} y={getRSIY(70)} width={chartWidth} height={getRSIY(30) - getRSIY(70)} fill="rgba(99, 102, 241, 0.015)" />

                <text x={width - paddingRight + 5} y={getRSIY(70) + 3} fill="#f43f5e" className="text-[8px] font-mono">70 Overbought</text>
                <text x={width - paddingRight + 5} y={getRSIY(30) + 3} fill="#10b981" className="text-[8px] font-mono">30 Oversold</text>

                {/* RSI curve path */}
                <path
                  d={(() => {
                    let path = "";
                    data.forEach((d, i) => {
                      const rsiVal = d.indicators?.rsi || 50;
                      const x = getX(i);
                      const y = getRSIY(rsiVal);
                      if (i === 0) path += `M ${x} ${y}`;
                      else path += ` L ${x} ${y}`;
                    });
                    return path;
                  })()}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                />

                {/* Current hovering node */}
                {hoveredIndex !== null && (
                  <circle
                    cx={getX(hoveredIndex)}
                    cy={getRSIY(data[hoveredIndex].indicators?.rsi || 50)}
                    r={4}
                    fill="#a78bfa"
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                )}
              </g>
            ) : (
              <g>
                <line x1={paddingLeft} y1={getMACDY(0, 1)} x2={width - paddingRight} y2={getMACDY(0, 1)} stroke="#334155" strokeWidth={1} />
                {data.map((d, i) => {
                  const x = getX(i);
                  const val = d.indicators?.macdHist || 0;
                  const zeroY = getMACDY(0, maxMACD || 1);
                  const valY = getMACDY(val, maxMACD || 1);
                  
                  const barW = Math.max(2, (chartWidth / viewportCount) * 0.4);
                  const positive = val > 0;
                  const fill = positive ? "rgba(16, 185, 129, 0.65)" : "rgba(244, 63, 94, 0.65)";

                  return (
                    <rect
                      key={i}
                      x={x - barW / 2}
                      y={positive ? valY : zeroY}
                      width={barW}
                      height={Math.max(1, Math.abs(zeroY - valY))}
                      fill={fill}
                      rx={0.5}
                    />
                  );
                })}
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
