import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Radio, RefreshCw, Database, Maximize } from 'lucide-react';
import localforage from 'localforage';
import { cn } from '../lib/utils';

const mockDataTemplate = [
  { name: 'Excellent', count: 42 },
  { name: 'Good', count: 28 },
  { name: 'Average', count: 14 },
  { name: 'Poor', count: 5 },
  { name: 'N/A', count: 2 },
];

export function SurveyChart({ 
  isEditMode = true,
  chartDataUrl = null,
  onUpdateUrl
}: { 
  isEditMode?: boolean;
  chartDataUrl?: string | null;
  onUpdateUrl?: (url: string | null) => void;
}) {
  const [dataUrl, setDataUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(mockDataTemplate);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDataUrl(chartDataUrl || '');
  }, [chartDataUrl]);

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chartContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        chartContainerRef.current.requestFullscreen();
      }
    }
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const valueToSave = dataUrl.trim() || 'mock';
    
    // Simulate data fetch delay
    setTimeout(() => {
      setIsLoading(false);
      if (onUpdateUrl) {
         onUpdateUrl(valueToSave);
      }
      if (valueToSave === 'mock') {
        setDataUrl('');
      }
    }, 1500);
  };

  const handleDisconnect = () => {
    setDataUrl('');
    if (onUpdateUrl) {
       onUpdateUrl(null);
    }
  };

  const syncData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setChartData([...chartData].map(item => ({ ...item, count: item.count + Math.floor(Math.random() * 5) })));
      setIsLoading(false);
    }, 800);
  };

  const isLinked = !!chartDataUrl;

  return (
    <div 
      className="w-full h-full min-h-[350px] bg-zinc-900/50 rounded-3xl border border-white/5 flex flex-col transition-all duration-300 shadow-xl overflow-hidden hover:border-white/15 hover:shadow-[0_0_40px_-15px_rgba(45,212,191,0.1)] group/chart"
    >
      <div className="flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-white/5 relative z-10 bg-zinc-900/50">
        <div className="flex items-center space-x-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-2.5 rounded-xl bg-teal-400/10 text-teal-400 border border-teal-400/20 shadow-inner group-hover/chart:shadow-teal-400/20 transition-all"
          >
            <BarChart3 size={20} />
          </motion.div>
          <div>
            <h3 className="text-xl font-display font-medium text-white flex items-center gap-2 transition-colors group-hover/chart:text-teal-50">
              Survey
              {isLinked && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] uppercase font-bold tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.2)]" title="Connected">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_5px_rgba(34,197,94,0.5)]" /> Live Sync
                </span>
              )}
            </h3>
            <p className="text-sm text-zinc-400 transition-colors group-hover/chart:text-zinc-300">Class feedback statistics</p>
          </div>
        </div>
        
        {isLinked && (
          <div className="flex items-center gap-3">
            <button 
              onClick={syncData}
              disabled={isLoading}
              className="p-2 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-teal-400 hover:bg-zinc-800 hover:border-teal-400/30 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
              title="Sync Data"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-teal-400" : ""} />
            </button>
            {isEditMode && (
              <button 
                onClick={handleDisconnect}
                className="text-xs font-medium px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-700 hover:border-white/20 rounded-full transition-all active:scale-95 shadow-sm"
              >
                Settings
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {!isLinked ? (
            isEditMode ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
                transition={{ type: "spring", damping: 25 }}
                className="absolute inset-0 flex flex-col justify-center items-center p-8 bg-gradient-to-b from-zinc-800/10 to-zinc-900/50"
              >
                <div className="max-w-sm w-full text-center relative z-10">
                  <form onSubmit={handleConnect} className="flex flex-col items-center">
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="w-16 h-16 rounded-full bg-zinc-800/80 mb-6 flex items-center justify-center text-zinc-500 shadow-xl border border-white/5 relative"
                    >
                      <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full opacity-0 group-hover/chart:opacity-100 transition-opacity duration-500" />
                      <Database size={28} className="relative z-10 group-hover/chart:text-zinc-300 transition-colors" />
                    </motion.div>
                    <h4 className="text-lg font-medium text-white mb-2">Connect Results Data</h4>
                    <p className="text-sm text-zinc-400 mb-8 font-light">
                      Paste the link to your custom survey results dashboard or website to embed it here. Leave blank to use mock chart data.
                    </p>
                    
                    <div className="w-full flex bg-zinc-950 rounded-full border border-zinc-800 focus-within:border-teal-500/40 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all overflow-hidden p-1.5 shadow-inner">
                      <input
                        type="url"
                        placeholder="https://api.example.com/results"
                        value={dataUrl}
                        onChange={(e) => setDataUrl(e.target.value)}
                        className="flex-1 bg-transparent px-4 py-2 outline-none text-sm text-zinc-300 w-full placeholder:text-zinc-600 focus:placeholder:text-zinc-700 font-mono"
                      />
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading}
                        className="bg-white text-zinc-950 px-6 py-2.5 text-sm font-semibold rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isLoading && <RefreshCw size={14} className="animate-[spin_1s_linear_infinite]" />}
                        {isLoading ? 'Connecting...' : 'Connect'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : (
                <motion.div
                  key="setup-readonly"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center"
                >
                  <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="p-4 rounded-2xl mb-4 shadow-lg relative opacity-50 grayscale bg-teal-400/10 text-teal-400 border border-teal-400/30"
                  >
                    <Database size={32} className="relative z-10" />
                  </motion.div>
                  <h3 className="text-xl font-display font-medium text-white/50 mb-2">Survey</h3>
                  <p className="text-sm text-zinc-600 max-w-[250px] leading-relaxed">
                    Data source has not been connected yet.
                  </p>
                </motion.div>
            )
          ) : (
            <motion.div
              key="iframe"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full h-full relative"
            >
              {dataUrl === 'mock' ? (
                <div className="w-full h-full p-6 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" strokeOpacity={0.4} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 13, fontWeight: 500 }} 
                        dy={15}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#71717a', fontSize: 12 }}
                        dx={-5}
                      />
                      <Tooltip 
                        cursor={{ fill: '#27272a', opacity: 0.5 }}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 16px' }}
                        itemStyle={{ color: '#fff', fontWeight: 600 }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out">
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? '#2dd4bf' : index === 1 ? '#e879f9' : '#818cf8'} 
                            className="transition-all duration-300 hover:opacity-80 drop-shadow-md"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div ref={chartContainerRef} className="w-full h-full relative group/doc">
                  <iframe 
                    src={dataUrl}
                    className="w-full h-full border-none opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.5s_forwards] rounded-b-3xl bg-zinc-900"
                    title="External Survey Data"
                    loading="lazy"
                  />
                  
                  <div className="absolute top-4 left-4 z-40 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                    <button 
                      onClick={handleFullscreen}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-950/80 text-white font-medium rounded-full shadow-lg hover:bg-zinc-800 border border-white/10 transition-all backdrop-blur-md"
                    >
                      <Maximize size={14} />
                      <span className="text-xs">Full Screen</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
