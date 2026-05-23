import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, ClipboardType, CheckCircle2 } from 'lucide-react';
import localforage from 'localforage';
import { cn } from '../lib/utils';

export function SurveyEmbedCard({ 
  isEditMode = true,
  surveyUrl = null,
  onUpdateUrl
}: { 
  isEditMode?: boolean,
  surveyUrl?: string | null,
  onUpdateUrl?: (url: string | null) => void 
}) {
  const [url, setUrl] = useState('');
  
  useEffect(() => {
    setUrl(surveyUrl || '');
  }, [surveyUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && onUpdateUrl) {
      onUpdateUrl(url.trim());
    }
  };

  const handleClear = () => {
    setUrl('');
    if (onUpdateUrl) {
      onUpdateUrl(null);
    }
  };

  const isEmbedded = !!surveyUrl;

  return (
    <div 
      className="w-full h-full min-h-[350px] bg-zinc-900/50 rounded-3xl border border-white/5 flex flex-col hover:border-white/15 transition-all duration-300 shadow-xl overflow-hidden hover:shadow-[0_0_40px_-15px_rgba(249,115,22,0.1)] group/survey"
    >
      <div className="flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-white/5 relative z-10 bg-zinc-900/50">
        <div className="flex items-center space-x-3">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-inner group-hover/survey:shadow-orange-500/20 transition-all"
          >
            <ClipboardType size={20} />
          </motion.div>
          <div>
            <h3 className="text-xl font-display font-medium text-white transition-colors group-hover/survey:text-orange-50">Live Survey</h3>
            <p className="text-sm text-zinc-400 transition-colors group-hover/survey:text-zinc-300">Share your thoughts</p>
          </div>
        </div>
        {isEmbedded && isEditMode && (
          <button 
            onClick={handleClear}
            className="text-xs font-medium px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-full transition-all border border-white/5 hover:border-white/20 active:scale-95 shadow-sm"
          >
            Remove Link
          </button>
        )}
      </div>

      <div className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {!isEmbedded ? (
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
                  <form onSubmit={handleSubmit} className="flex flex-col items-center">
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 rounded-full bg-zinc-800/80 mb-6 flex items-center justify-center text-zinc-500 shadow-xl border border-white/5 relative"
                    >
                      <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-full opacity-0 group-hover/survey:opacity-100 transition-opacity duration-500" />
                      <Link size={28} className="relative z-10 group-hover/survey:text-zinc-300 transition-colors" />
                    </motion.div>
                    <h4 className="text-lg font-medium text-white mb-2">Embed External Form</h4>
                    <p className="text-sm text-zinc-400 mb-8 font-light">
                      Paste the link to your Google Form, Typeform, or Survey.
                    </p>
                    
                    <div className="w-full flex bg-zinc-950 rounded-full border border-zinc-800 focus-within:border-orange-500/40 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all overflow-hidden p-1.5 shadow-inner">
                      <input
                        type="url"
                        placeholder="https://forms.gle/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className="flex-1 bg-transparent px-4 py-2 outline-none text-sm text-zinc-300 w-full placeholder:text-zinc-600 focus:placeholder:text-zinc-700 font-mono"
                      />
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-white text-zinc-950 px-6 py-2.5 text-sm font-semibold rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition-colors"
                      >
                        Connect
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
                    className="p-4 rounded-2xl mb-4 shadow-lg relative opacity-50 grayscale bg-orange-400/10 text-orange-400 border border-orange-400/30"
                  >
                    <ClipboardType size={32} className="relative z-10" />
                  </motion.div>
                  <h3 className="text-xl font-display font-medium text-white/50 mb-2">Live Survey</h3>
                  <p className="text-sm text-zinc-600 max-w-[250px] leading-relaxed">
                    Survey link has not been provided yet.
                  </p>
                </motion.div>
            )
          ) : (
            <motion.div
              key="iframe"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full h-full bg-zinc-950"
            >
              <iframe 
                src={url}
                className="w-full h-full border-none opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.5s_forwards]"
                title="External Survey"
                loading="lazy"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
