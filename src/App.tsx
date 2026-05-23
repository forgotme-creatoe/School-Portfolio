import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock } from 'lucide-react';
import localforage from 'localforage';
import { Hero } from './components/Hero';
import { UploadCard } from './components/UploadCard';
import { SurveyChart } from './components/SurveyChart';
import { ParticlesBackground } from './components/ParticlesBackground';

export default function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [essayFile, setEssayFile] = useState<File | null>(null);
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [essayLink, setEssayLink] = useState<string | null>(null);
  const [pptLink, setPptLink] = useState<string | null>(null);
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [surveyUrl, setSurveyUrl] = useState<string | null>(null);
  const [chartDataUrl, setChartDataUrl] = useState<string | null>(null);

  // Load saved data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const savedEssay = await localforage.getItem<File>('essayFile');
        const savedPpt = await localforage.getItem<File>('pptFile');
        const savedVideo = await localforage.getItem<File>('videoFile');
        
        if (savedEssay) setEssayFile(savedEssay);
        if (savedPpt) setPptFile(savedPpt);
        if (savedVideo) setVideoFile(savedVideo);
      } catch (err) {
        console.error("Error loading files from local storage", err);
      } finally {
        setIsInitialized(true);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    import('./lib/firebase').then(({ db, auth }) => {
      import('firebase/firestore').then(({ doc, onSnapshot }) => {
        const docRef = doc(db, 'config', 'global');
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setEssayLink(data.essayLink || null);
            setPptLink(data.pptLink || null);
            setVideoLink(data.videoLink || null);
            setSurveyUrl(data.surveyUrl || null);
            setChartDataUrl(data.chartDataUrl || null);
          }
        }, (error) => {
           console.error("Error fetching config:", error);
        });
        return () => unsubscribe();
      });
    });
  }, []);

  const handleUpdateFile = async (key: string, file: File | null, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    setter(file);
    try {
      if (file) {
        await localforage.setItem(key, file);
      } else {
        await localforage.removeItem(key);
      }
    } catch (err) {
      console.error(`Error saving ${key}`, err);
    }
  };

  const handleUpdateLink = async (key: string, url: string | null) => {
    try {
      const { db, auth, OperationType, handleFirestoreError } = await import('./lib/firebase');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      const docRef = doc(db, 'config', 'global');
      try {
        await setDoc(docRef, { [key]: url || null, updatedAt: serverTimestamp() }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'config/global');
      }
    } catch (err) {
      console.error(`Error saving ${key} to Firestore`, err);
      alert("Failed to update. Make sure you are authenticated as the portfolio owner.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30, filter: "blur(10px)" },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
  };

  if (!isInitialized) return null; // Wait for storage to load

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-zinc-800 font-sans relative overflow-hidden">
      <ParticlesBackground />
      {/* Background ambient glow - fixed positioning */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-500/5 blur-[120px] pointer-events-none" 
      />

      {/* Admin Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={async () => {
            if (!isEditMode) {
              try {
                const { auth } = await import('./lib/firebase');
                const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
                
                if (!auth.currentUser) {
                  const provider = new GoogleAuthProvider();
                  provider.setCustomParameters({
                    prompt: 'select_account'
                  });
                  await signInWithPopup(auth, provider);
                }
                
                // Once logged in (or if already logged in)
                if (auth.currentUser.email === 'pratham.tyagi369@gmail.com') {
                  setIsEditMode(true);
                } else {
                  alert("Access denied: You must be signed in as pratham.tyagi369@gmail.com to edit.");
                  await auth.signOut();
                }
              } catch (err: any) {
                 console.error("Auth error", err);
                 alert(`Could not sign in to edit mode: ${err.message || err}`);
              }
            } else {
              setIsEditMode(false);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg backdrop-blur-md border ${
            isEditMode 
              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30" 
              : "bg-zinc-900/50 text-zinc-400 border-white/5 hover:text-white hover:bg-zinc-800/80"
          }`}
        >
          {isEditMode ? <Unlock size={16} /> : <Lock size={16} />}
          {isEditMode ? "Edit Mode Active" : "View Mode"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full pb-32 relative z-10 pt-10">
        <Hero />
        
        {/* Bento Grid Board */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-[380px]"
        >
          
          {/* Main Podcast Video Player - takes up 2 cols on lg screens */}
          <motion.div variants={itemVariants} className="lg:col-span-2 relative h-full w-full group/bento">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500/30 to-indigo-500/30 rounded-[2rem] blur opacity-0 group-hover/bento:opacity-100 transition duration-1000 group-hover/bento:duration-200 pointer-events-none" />
            <UploadCard
              title="Podcast Video"
              description="Upload video file or paste a YouTube link."
              accept="video/*"
              type="video"
              file={videoFile}
              linkUrl={videoLink}
              onUpload={(f) => handleUpdateFile('videoFile', f, setVideoFile)}
              onLinkSave={(url) => handleUpdateLink('videoLink', url)}
              onRemove={() => { handleUpdateFile('videoFile', null, setVideoFile); handleUpdateLink('videoLink', null); }}
              isEditMode={isEditMode}
              className="h-full w-full relative bg-zinc-950"
              accentColor="text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/30"
            />
          </motion.div>

          {/* Essay Document */}
          <motion.div variants={itemVariants} className="col-span-1 relative h-full w-full group/bento">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-[2rem] blur opacity-0 group-hover/bento:opacity-100 transition duration-1000 group-hover/bento:duration-200 pointer-events-none" />
             <UploadCard
              title="Project Essay"
              description="Upload document or paste Google Docs link."
              accept=".docx, .pdf, .doc"
              type="document"
              file={essayFile}
              linkUrl={essayLink}
              onUpload={(f) => handleUpdateFile('essayFile', f, setEssayFile)}
              onLinkSave={(url) => handleUpdateLink('essayLink', url)}
              onRemove={() => { handleUpdateFile('essayFile', null, setEssayFile); handleUpdateLink('essayLink', null); }}
              isEditMode={isEditMode}
              className="h-full w-full relative bg-zinc-950"
              accentColor="text-blue-400 bg-blue-400/10 border-blue-400/40"
            />
          </motion.div>
          
          {/* Survey Chart Module */}
          <motion.div variants={itemVariants} className="col-span-1 lg:col-span-3 relative h-full w-full group/bento">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/30 to-green-500/30 rounded-[2rem] blur opacity-0 group-hover/bento:opacity-100 transition duration-1000 group-hover/bento:duration-200 pointer-events-none" />
            <div className="h-full w-full relative bg-zinc-950 rounded-3xl">
               <SurveyChart isEditMode={isEditMode} chartDataUrl={chartDataUrl} onUpdateUrl={(url) => handleUpdateLink('chartDataUrl', url)} />
            </div>
          </motion.div>

          {/* Presentation Slide Deck */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-3 lg:row-span-1 border-t border-white/5 pt-6 mt-2 pb-12 relative h-[400px] w-full group/bento">
            <UploadCard
              title="Presentation Deck"
              description="Upload PowerPoint or paste Google Slides link."
              accept=".pptx, .ppt, .key"
              type="presentation"
              file={pptFile}
              linkUrl={pptLink}
              onUpload={(f) => handleUpdateFile('pptFile', f, setPptFile)}
              onLinkSave={(url) => handleUpdateLink('pptLink', url)}
              onRemove={() => { handleUpdateFile('pptFile', null, setPptFile); handleUpdateLink('pptLink', null); }}
              isEditMode={isEditMode}
              className="h-full w-full relative bg-zinc-950 shadow-2xl"
              accentColor="text-amber-400 bg-amber-400/10 border-amber-400/40"
            />
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
