import React from 'react';
import { ShieldAlert, Users, Terminal as TerminalIcon, Wind, LifeBuoy, Zap, Mail, Calendar, Brain, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useFirebase } from '../components/FirebaseProvider';
import { db, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, limit, getDocs } from '../lib/firebase';
import { generateWeeklySummary } from '../lib/gemini';
import { toast } from 'sonner';

export default function TheSanctuary() {
  const { user, profile, rewardXP } = useFirebase();
  const [entry, setEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [activeExercise, setActiveExercise] = useState<'none' | 'breathing' | 'grounding' | 'ifs'>('none');
  const [selectedPart, setSelectedPart] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'memories'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMemories(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleSundaySync = async () => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    const loadingToast = toast.loading("PREPARING_SUNDAY_SYNC_REPORT...");
    
    try {
      // Gather all necessary context for the report
      const [mSnap, aSnap, bSnap, eSnap, sSnap] = await Promise.all([
        getDocs(query(collection(db, 'users', user.uid, 'memories'), orderBy('createdAt', 'desc'), limit(20))),
        getDocs(query(collection(db, 'users', user.uid, 'artifacts'), orderBy('createdAt', 'desc'), limit(20))),
        getDocs(collection(db, 'users', user.uid, 'neural_bridges')),
        getDocs(query(collection(db, 'users', user.uid, 'expedition_logs'), orderBy('createdAt', 'desc'), limit(20))),
        getDocs(query(collection(db, 'users', user.uid, 'spatial_anchors'), orderBy('createdAt', 'desc'), limit(20)))
      ]);

      const context = {
        memories: mSnap.docs.map(d => d.data()),
        artifacts: aSnap.docs.map(d => d.data()),
        bridges: bSnap.docs.map(d => d.data()),
        expeditions: eSnap.docs.map(d => d.data()),
        anchors: sSnap.docs.map(d => d.data())
      };

      const summary = await generateWeeklySummary(profile, context);
      
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'mumblejinx@gmail.com',
          reportContent: summary
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success("SUNDAY_SYNC_COMPLETE: Report transmitted.", { id: loadingToast });
        await rewardXP(200, 100);
      } else {
        toast.error(`TRANSMISSION_ERROR: ${result.error}`, { id: loadingToast });
      }
    } catch (error: any) {
      toast.error(`SYNC_FAILED: ${error.message}`, { id: loadingToast });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !entry.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'memories'), {
        text: entry.trim(),
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'users', user.uid, 'logs'), {
        type: 'LOG',
        content: `Sanctuary_Grounding: Neural_Entry_Secured`,
        createdAt: serverTimestamp()
      });
      await rewardXP(80, 40);
      setEntry('');
      toast.success("MEMORY_ARCHIVED");
    } catch (err) {
      toast.error("COMMIT_FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ifsParts = [
    { id: 'protector', name: 'The Protector', goal: 'Shielding the core from perceived threats.', role: 'Caretaker' },
    { id: 'exile', name: 'The Exile', goal: 'Stored emotional fragments awaiting integration.', role: 'Vulnerable' },
    { id: 'firefighter', name: 'The Firefighter', goal: 'Immediate suppression of visceral spikes.', role: 'Crisis_Response' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-12 pb-32"
    >
      <div className="text-center space-y-4">
         <h2 className="text-6xl font-bold uppercase tracking-tighter text-primary">The Sanctuary</h2>
         <p className="text-[10px] font-mono tracking-[0.5em] text-on-surface-variant uppercase">Safe_Zone_Established // Node_004</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Exercises */}
        <aside className="lg:col-span-4 space-y-8">
           <div className="glass-panel p-8 border-t-8 border-primary">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <Wind className="w-4 h-4" /> Stoic_Equilibrium
              </h3>
              
              {activeExercise === 'breathing' ? (
                <div className="flex flex-col items-center py-6">
                   <motion.div 
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                   >
                     <span className="text-[10px] font-bold text-primary">BREATHE</span>
                   </motion.div>
                   <button 
                    onClick={() => setActiveExercise('none')}
                    className="mt-8 text-[10px] font-bold uppercase underline opacity-60 hover:opacity-100"
                   >
                     End_Calibration
                   </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs opacity-60 italic">Standardized pulse variance detected. Initiate breath calibration for neural stability.</p>
                  <button 
                    onClick={() => setActiveExercise('breathing')}
                    className="w-full py-4 bg-primary text-on-primary font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95"
                  >
                    Start_Breath_Matrix
                  </button>
                </div>
              )}
           </div>

           <div className="glass-panel p-8 border-t-8 border-secondary">
              <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-6 flex items-center gap-2">
                <Users className="w-4 h-4" /> IFS_Work_Center
              </h3>
              
              <div className="space-y-3">
                {ifsParts.map(part => (
                  <button 
                    key={part.id}
                    onClick={() => setSelectedPart(part)}
                    className={`w-full p-4 border text-left transition-all ${selectedPart?.id === part.id ? 'bg-secondary text-on-secondary border-secondary' : 'bg-surface-container-low border-outline-variant hover:border-secondary'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest">{part.name}</span>
                      <span className="text-[10px] opacity-40">[{part.role}]</span>
                    </div>
                    {selectedPart?.id === part.id && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] leading-relaxed mt-2 italic">
                        "{part.goal}"
                      </motion.p>
                    )}
                  </button>
                ))}
              </div>
           </div>

           <div className="glass-panel p-8 border-t-8 border-tertiary">
              <h3 className="text-xs font-bold uppercase tracking-widest text-tertiary mb-6 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Neural_Matrix_Sync
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-tertiary/5 border border-tertiary/20 space-y-2">
                    <p className="text-[10px] font-bold uppercase text-tertiary">Current_Directives</p>
                    <ul className="text-[9px] uppercase opacity-70 space-y-1">
                       <li>• Foster_Openness</li>
                       <li>• Build_Interpersonal_Trust</li>
                       <li>• Cultivate_Confidence</li>
                    </ul>
                 </div>
                 
                 <div className="flex flex-col gap-3">
                   <button 
                     onClick={handleSundaySync}
                     disabled={isSyncing}
                     className="w-full py-4 bg-tertiary text-on-tertiary font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {isSyncing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Mail className="w-3 h-3" />}
                     {isSyncing ? 'TRANSMITTING...' : 'INITIATE_SUNDAY_SYNC'}
                   </button>
                   <div className="flex items-center gap-2 text-[8px] opacity-40 uppercase font-mono">
                      <Calendar className="w-3 h-3"/> Destination: mumblejinx@gmail.com
                   </div>
                 </div>
              </div>
           </div>
        </aside>

        {/* Center: Interaction */}
        <main className="lg:col-span-8 flex flex-col gap-8">
           <div className="flex-grow glass-panel border-4 border-surface-container-highest flex flex-col min-h-[500px]">
              <div className="bg-surface-container-highest p-4 border-b border-outline-variant flex justify-between items-center">
                 <div className="flex gap-2">
                   <div className="w-2 h-2 bg-primary"></div>
                   <div className="w-2 h-2 bg-secondary"></div>
                   <div className="w-2 h-2 bg-tertiary"></div>
                 </div>
                 <span className="text-[10px] font-mono opacity-40 uppercase">Static_Terminal // Introspective_Mode</span>
              </div>
              
              <div className="flex-grow p-10 flex flex-col relative overflow-hidden">
                <div className="scanline absolute inset-0 opacity-5 pointer-events-none"></div>
                <div className="relative z-10 flex-grow">
                   {activeExercise === 'grounding' ? (
                     <div className="space-y-8 max-w-xl">
                        <h4 className="text-2xl font-bold text-error uppercase italic tracking-tighter">Grounding_Sequence_Active</h4>
                        <div className="space-y-4 text-sm font-mono opacity-80">
                           <p>&gt; Identify 5 things you can see...</p>
                           <p>&gt; Identify 4 things you can touch...</p>
                           <p>&gt; Identify 3 things you can hear...</p>
                           <p>&gt; Identify 2 things you can smell...</p>
                           <p>&gt; Identify 1 thing you can taste...</p>
                        </div>
                        <button 
                          onClick={() => setActiveExercise('none')}
                          className="px-8 py-3 bg-error text-white font-bold uppercase text-[10px] tracking-widest shadow-lg active:scale-95"
                        >
                          Protocol_Complete
                        </button>
                     </div>
                   ) : (
                     <div className="flex flex-col h-full">
                        <div className="mb-10 opacity-60 font-body leading-loose italic text-xl">
                          "I am restless. Things are calling me away. My body is a cage, but my mind is a sanctuary of infinite doors."
                        </div>
                        <form onSubmit={handleTerminalSubmit} className="flex-grow flex flex-col">
                          <textarea 
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            placeholder="Scribe your internal landscape..."
                            className="w-full h-full bg-transparent border-none focus:ring-0 p-0 text-xl font-body outline-none resize-none"
                          />
                        </form>
                     </div>
                   )}
                </div>
                
                {(!activeExercise || activeExercise === 'none') && (
                  <div className="flex justify-between items-end mt-10">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase opacity-30">Archive_Status</span>
                      <div className="flex gap-1">
                        {memories.slice(0, 5).map(m => <div key={m.id} className="w-4 h-1 bg-primary"></div>)}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleTerminalSubmit(e as any)}
                      disabled={isSubmitting || !entry.trim()}
                      className="px-10 py-4 bg-tertiary text-on-tertiary font-bold uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 shadow-lg"
                    >
                      Commit_Fragment
                    </button>
                  </div>
                )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => setActiveExercise('grounding')}
                className="p-8 border-2 border-error/40 bg-error/5 flex flex-col items-center gap-4 hover:bg-error/10 transition-all group shadow-sm"
              >
                <ShieldAlert className="w-8 h-8 text-error group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <h5 className="text-xs font-bold uppercase text-error mb-1">Total_Reset</h5>
                  <p className="text-[10px] uppercase opacity-40 text-error/60">Grounding Sequence</p>
                </div>
              </button>
              
              <a 
                href="https://www.crisistextline.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-8 border-2 border-secondary/40 bg-secondary/5 flex flex-col items-center gap-4 hover:bg-secondary/10 transition-all group shadow-sm no-underline"
              >
                <LifeBuoy className="w-8 h-8 text-secondary group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <h5 className="text-xs font-bold uppercase text-secondary mb-1">Support_Beacon</h5>
                  <p className="text-[10px] uppercase opacity-40 text-secondary/60">External Nodes</p>
                </div>
              </a>

              <button 
                onClick={() => {
                  const quotes = [
                    "Waste no more time arguing what a good man should be. Be one.",
                    "If it is not right, do not do it; if it is not true, do not say it.",
                    "The best revenge is to be unlike him who performed the injury."
                  ];
                  toast.info(`STOIC_REFLECT: "${quotes[Math.floor(Math.random() * quotes.length)]}"`);
                }}
                className="p-8 border-2 border-primary/40 bg-primary/5 flex flex-col items-center gap-4 hover:bg-primary/10 transition-all group shadow-sm"
              >
                <Zap className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <h5 className="text-xs font-bold uppercase text-primary mb-1">Flash_Calm</h5>
                  <p className="text-[10px] uppercase opacity-40 text-primary/60">Rapid Reflection</p>
                </div>
              </button>
           </div>
        </main>
      </div>
    </motion.div>
  );
}
