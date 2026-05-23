import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, X, Download, FileText, Presentation, FileVideo, File, Link as LinkIcon, Maximize } from 'lucide-react';
import { cn } from '../lib/utils';

const iconMap = {
  document: FileText,
  presentation: Presentation,
  video: FileVideo,
  generic: File,
};

interface UploadCardProps {
  title: string;
  description: string;
  accept: string;
  type: keyof typeof iconMap;
  file: File | null;
  linkUrl?: string | null;
  onUpload: (file: File) => void;
  onLinkSave?: (url: string) => void;
  onRemove: () => void;
  className?: string;
  accentColor?: string;
  isEditMode?: boolean;
}

function getEmbedUrl(url: string, type: string) {
  if (!url) return '';
  if (type === 'video') {
     if (url.includes('youtube.com/watch?v=')) {
         try {
           const videoId = new URL(url).searchParams.get('v');
           if (videoId) return `https://www.youtube.com/embed/${videoId}`;
         } catch(e) {}
     }
     if (url.includes('youtu.be/')) {
         const videoId = url.split('youtu.be/')[1]?.split('?')[0];
         if (videoId) return `https://www.youtube.com/embed/${videoId}`;
     }
     if (url.includes('drive.google.com/file/d/')) {
         const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
         if (fileIdMatch && fileIdMatch[1]) {
             return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
         }
     }
     return url;
  }
  if (type === 'document' || type === 'presentation') {
     if (url.includes('docs.google.com')) {
         return url.replace(/\/(edit|view).*$/, '/preview');
     }
     if (url.match(/\.(ppt|pptx|doc|docx|xls|xlsx)$/i)) {
         return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
     }
  }
  return url;
}

export function UploadCard({ 
  title, 
  description, 
  accept, 
  type, 
  file, 
  linkUrl,
  onUpload, 
  onLinkSave,
  onRemove, 
  className, 
  accentColor = "text-indigo-400 border-indigo-400/30 bg-indigo-400/10",
  isEditMode = true
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const docContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setObjectUrl(null);
    }
  }, [file]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (docContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        docContainerRef.current.requestFullscreen();
      }
    }
  };

  const IconWrapper = iconMap[type] || iconMap.generic;
  const isFilled = file || linkUrl;
  const isPdf = file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));

  return (
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative rounded-[2rem] overflow-hidden shadow-xl border transition-all duration-300",
        isFilled ? "border-white/10 bg-zinc-900" : "border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-white/20 hover:shadow-[0_0_40px_-15px_rgba(255,255,255,0.05)]",
        isDragging && !isFilled && "border-white/40 bg-zinc-900/90 scale-[1.02]",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence mode="wait">
        {!isFilled ? (
          isEditMode ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-full min-h-[300px] text-center"
            >
              <div className="flex-1 flex flex-col items-center justify-center w-full p-8 cursor-pointer group" onClick={() => inputRef.current?.click()}>
                <input 
                  type="file" 
                  ref={inputRef} 
                  className="hidden" 
                  accept={accept}
                  onChange={handleFileChange}
                />
                {isDragging && (
                  <motion.div 
                    layoutId="drag-border"
                    className="absolute inset-4 rounded-[1.5rem] border-2 border-dashed border-white/30 pointer-events-none" 
                  />
                )}
                <motion.div 
                  animate={isDragging ? { scale: 1.2, rotate: [0, -10, 10, -10, 0] } : { y: [0, -6, 0] }}
                  transition={isDragging ? { duration: 0.5 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className={cn("p-4 rounded-2xl mb-4 transition-transform duration-500 group-hover:scale-110 shadow-lg relative", accentColor)}
                >
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <UploadCloud size={32} className="relative z-10" />
                </motion.div>
                <h3 className="text-xl font-display font-medium text-white mb-2 transition-colors group-hover:text-zinc-200">{title}</h3>
                <p className="text-sm text-zinc-400 max-w-[250px] leading-relaxed transition-colors group-hover:text-zinc-300">
                  {description} <br /> 
                  <span className="opacity-60 text-xs mt-3 inline-block font-mono tracking-widest uppercase py-1 px-3 rounded-full bg-black/20 border border-white/5">Click or drag</span>
                </p>
              </div>
              {onLinkSave && (
                <div className="w-full px-8 pb-8 pt-0">
                  <form onSubmit={(e) => { e.preventDefault(); if (tempUrl) onLinkSave(tempUrl); setTempUrl(''); }} className="w-full flex bg-zinc-950/80 rounded-full border border-white/10 overflow-hidden focus-within:border-white/30 transition-all p-1.5 shadow-inner">
                    <div className="pl-3 pr-2 flex items-center text-zinc-500"><LinkIcon size={16}/></div>
                    <input type="url" value={tempUrl} onChange={(e) => setTempUrl(e.target.value)} placeholder="Or paste public share link..." className="flex-1 bg-transparent px-2 py-2 outline-none text-sm text-zinc-300 placeholder:text-zinc-600 font-mono" />
                    <button type="submit" className="bg-white text-zinc-950 px-5 py-2 text-xs font-bold rounded-full hover:bg-zinc-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">Embed</button>
                  </form>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state-readonly"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center"
            >
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className={cn("p-4 rounded-2xl mb-4 shadow-lg relative opacity-50 grayscale", accentColor)}
              >
                <IconWrapper size={32} className="relative z-10" />
              </motion.div>
              <h3 className="text-xl font-display font-medium text-white/50 mb-2">{title}</h3>
              <p className="text-sm text-zinc-600 max-w-[250px] leading-relaxed">
                Content has not been uploaded yet.
              </p>
            </motion.div>
          )
        ) : (
          <motion.div
            key="filled-state"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full h-full flex flex-col group relative"
          >
            {/* Header overlay for removing */}
            {isEditMode && (
              <div className="absolute top-4 right-4 z-50 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  className="p-2.5 rounded-full bg-zinc-950/80 text-zinc-300 hover:text-white hover:bg-red-500 backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95 border border-white/10"
                  title="Remove item"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Video Player or Document iframe */}
            {type === 'video' ? (
              <div className="w-full h-full bg-black relative rounded-[2rem] overflow-hidden group/video flex flex-col justify-center">
                {linkUrl ? (
                  <iframe src={getEmbedUrl(linkUrl, type)} className="w-full h-full border-none" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                ) : objectUrl ? (
                  <video 
                    src={objectUrl} 
                    controls 
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>
            ) : linkUrl ? (
              <div ref={docContainerRef} className="w-full h-full bg-zinc-950 relative rounded-[2rem] overflow-hidden group/doc flex flex-col">
                  <iframe src={getEmbedUrl(linkUrl, type)} className="w-full h-full border-none bg-zinc-900" allowFullScreen />
                  
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
            ) : isPdf ? (
              <div ref={docContainerRef} className="w-full h-full bg-zinc-950 relative rounded-[2rem] overflow-hidden group/doc flex flex-col">
                  <iframe src={`${objectUrl}#toolbar=0&view=FitH`} className="w-full h-full border-none bg-zinc-900" title={file?.name} />
                  
                  <div className="absolute top-4 left-4 z-40 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                    <button 
                      onClick={handleFullscreen}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-950/80 text-white font-medium rounded-full shadow-lg hover:bg-zinc-800 border border-white/10 transition-all backdrop-blur-md"
                    >
                      <Maximize size={14} />
                      <span className="text-xs">Full Screen</span>
                    </button>
                  </div>

                  <div className="absolute bottom-5 right-5 z-40 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                    <a 
                      href={objectUrl!} 
                      download={file?.name}
                      className="flex items-center space-x-2 px-4 py-2 bg-zinc-900/90 text-white font-medium rounded-full shadow-lg hover:scale-105 hover:bg-zinc-800 border border-white/10 transition-all active:scale-95"
                    >
                      <Download size={14} strokeWidth={2.5} />
                      <span className="text-xs text-zinc-300">Save PDF</span>
                    </a>
                  </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-8 bg-gradient-to-b from-zinc-800/10 to-zinc-900/50 rounded-[2rem]">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className={cn("p-6 rounded-[2rem] shadow-2xl mb-6 relative", accentColor)}
                >
                  <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-50" />
                  <IconWrapper size={64} strokeWidth={1.5} className="relative z-10" />
                </motion.div>
                
                <h4 className="text-xl font-display font-medium text-white mb-2 text-center break-all max-w-[80%] line-clamp-2">
                  {file?.name}
                </h4>
                <p className="text-zinc-500 text-sm mb-8 font-mono">
                  {file ? (file.size / (1024 * 1024)).toFixed(2) : 0} MB
                </p>
                <div className="flex space-x-3">
                   <a 
                    href={objectUrl!} 
                    download={file?.name}
                    className="flex items-center space-x-2 px-6 py-3 bg-white text-zinc-950 font-medium rounded-full shadow-lg hover:scale-105 hover:bg-zinc-200 hover:shadow-white/20 transition-all active:scale-95 z-40 relative"
                  >
                    <Download size={18} strokeWidth={2.5} />
                    <span>Download File</span>
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
