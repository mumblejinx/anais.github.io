import { Database, Clock, MapPin, Activity, Terminal as TerminalIcon, Plus, Image as ImageIcon, X, Link as LinkIcon, ExternalLink, Globe, Trash2, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../components/FirebaseProvider';
import { db, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit, uploadFile, deleteDoc, doc, startAfter, getDocs } from '../lib/firebase';
import { toast } from 'sonner';
import { AnaisAvatar } from '../components/AnaisAvatar';

export default function InnerWorld() {
  const { user, profile, rewardXP } = useFirebase();
  const [truth, setTruth] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [bridgePlatform, setBridgePlatform] = useState('');
  const [bridgeUrl, setBridgeUrl] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'intake' | 'bridges'>('intake');

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [memories, setMemories] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [bridges, setBridges] = useState<any[]>([]);
  
  const [counts, setCounts] = useState({
    memories: 0,
    artifacts: 0,
    bridges: 0
  });

  useEffect(() => {
    if (!user) return;

    const unsubscribeMemories = onSnapshot(query(collection(db, 'users', user.uid, 'memories'), orderBy('createdAt', 'desc'), limit(15)), (snap) => {
      setMemories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCounts(prev => ({ ...prev, memories: snap.size }));
    });

    const unsubscribeArtifacts = onSnapshot(collection(db, 'users', user.uid, 'artifacts'), (snap) => {
      setCounts(prev => ({ ...prev, artifacts: snap.size }));
    });

    const unsubscribeBridges = onSnapshot(query(collection(db, 'users', user.uid, 'neural_bridges'), orderBy('createdAt', 'desc')), (snap) => {
      setBridges(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCounts(prev => ({ ...prev, bridges: snap.size }));
    });

    return () => {
      unsubscribeMemories();
      unsubscribeArtifacts();
      unsubscribeBridges();
    };
  }, [user]);

  const handleAddBridge = async () => {
    if (!user || !bridgePlatform.trim() || !bridgeUrl.trim() || isBridging) return;
    setIsBridging(true);
    const loadingToast = toast.loading("ESTABLISHING_BRIDGE...");
    
    try {
      await addDoc(collection(db, 'users', user.uid, 'neural_bridges'), {
        platform: bridgePlatform.trim(),
        url: bridgeUrl.trim(),
        createdAt: serverTimestamp()
      });
      await rewardXP(100, 40);
      setBridgePlatform('');
      setBridgeUrl('');
      toast.success("BRIDGE_LINKED", { id: loadingToast });
    } catch (e) {
      toast.error("LINK_FAILED", { id: loadingToast });
    } finally {
      setIsBridging(false);
    }
  };

  const handleSyncTruth = async () => {
    if (!user || (!truth.trim() && !selectedImage) || isSyncing) return;
    setIsSyncing(true);
    const loadingToast = toast.loading("SYNCING_VISCERAL_DATA...");
    
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadFile(`users/${user.uid}/memories/${Date.now()}`, selectedImage);
      }

      await addDoc(collection(db, 'users', user.uid, 'memories'), {
        text: truth.trim(),
        imageUrl,
        createdAt: serverTimestamp()
      });

      setTruth('');
      setSelectedImage(null);
      setImagePreview(null);
      toast.success("TRUTH_INGESTED", { id: loadingToast });
      
      rewardXP(150, 60).catch(e => console.error("Truth XP failed:", e));
    } catch (e: any) {
      console.error("Sync failure details:", e);
      const errorMsg = e?.message || "Void connection timeout.";
      toast.error(`SYNC_FAILED: ${errorMsg}`, { id: loadingToast });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-32"
    >
      <section className="md:col-span-8 space-y-12">
        <div className="flex flex-col md:flex-row bg-surface-container-low border-b-4 border-secondary">
          <button 
            onClick={() => setActiveTab('intake')}
            className={`py-4 md:flex-1 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${activeTab === 'intake' ? 'bg-secondary text-on-secondary' : 'hover:bg-secondary/10 border-b border-secondary/20 md:border-b-0'}`}
          >
            <TerminalIcon className="w-4 h-4" /> Intake_Terminal
          </button>
          <button 
            onClick={() => setActiveTab('bridges')}
            className={`py-4 md:flex-1 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${activeTab === 'bridges' ? 'bg-secondary text-on-secondary' : 'hover:bg-secondary/10'}`}
          >
            <LinkIcon className="w-4 h-4" /> Neural_Bridges
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'intake' ? (
            <motion.div 
              key="intake"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-8 border-l-8 border-secondary space-y-6"
            >
              <h3 className="text-2xl font-bold uppercase tracking-widest text-secondary flex items-center gap-3">
                <Brain className="w-6 h-6" /> Visceral_Intake
              </h3>
              <p className="text-on-surface-variant font-body leading-relaxed italic">
                "Describe the visceral impact of musicians, artists, or websites. How do they shift your internal landscape?"
              </p>
              <textarea 
                value={truth}
                onChange={(e) => setTruth(e.target.value)}
                className="w-full bg-surface-container-lowest border-2 border-outline-variant p-4 font-mono text-sm min-h-[160px] focus:border-secondary outline-none"
                placeholder="The frequencies of this artist resonate with my..."
              />
              <div className="flex justify-between items-center">
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-surface-container-highest border border-secondary text-secondary text-[10px] font-bold uppercase hover:bg-secondary/10"
                 >
                   Attach_Fragment
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                     const f = e.target.files?.[0];
                     if (f) { setSelectedImage(f); setImagePreview(URL.createObjectURL(f)); }
                   }} />
                 </button>
                 <button 
                  onClick={handleSyncTruth}
                  disabled={isSyncing || (!truth.trim() && !selectedImage)}
                  className="bg-secondary text-on-secondary px-10 py-4 font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50"
                 >
                   SYNC_TRUTH
                 </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="bridges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-8 border-l-8 border-tertiary space-y-6"
            >
              <h3 className="text-2xl font-bold uppercase tracking-widest text-tertiary flex items-center gap-3">
                <LinkIcon className="w-6 h-6" /> Neural_Bridges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <input 
                  value={bridgePlatform}
                  onChange={e => setBridgePlatform(e.target.value)}
                  placeholder="Platform (SoundCloud)"
                  className="bg-surface-container-lowest border border-outline-variant p-3 text-sm focus:border-tertiary outline-none"
                 />
                 <input 
                  value={bridgeUrl}
                  onChange={e => setBridgeUrl(e.target.value)}
                  placeholder="URL"
                  className="bg-surface-container-lowest border border-outline-variant p-3 text-sm focus:border-tertiary outline-none"
                 />
                 <button 
                  onClick={handleAddBridge}
                  disabled={isBridging || !bridgePlatform || !bridgeUrl}
                  className="bg-tertiary text-on-tertiary font-bold uppercase tracking-widest py-3 hover:brightness-110 disabled:opacity-50"
                 >
                   ESTABLISH_LINK
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                {bridges.map(b => (
                  <div key={b.id} className="p-4 bg-surface-container-low border border-outline-variant flex justify-between items-center group">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-tertiary">{b.platform}</p>
                      <p className="text-[10px] text-on-surface-variant truncate max-w-[200px]">{b.url}</p>
                    </div>
                    <LinkIcon className="w-4 h-4 text-tertiary opacity-40" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <aside className="md:col-span-4 space-y-8">
        {/* The Vessel: Dynamic Visualization */}
        <div className="bg-surface-container-high p-8 border-t-8 border-primary relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 animate-pulse opacity-20"></div>
          <div className="relative z-10 flex flex-col items-center">
            <h4 className="text-primary font-bold text-sm uppercase mb-8 tracking-widest">The_Vessel_Matrix</h4>
            <div className="relative w-48 h-48">
               <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full"
               />
               <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-2 border-primary/40 rounded-full"
               />
               <div className="absolute inset-8 bg-surface-container-lowest border-4 border-primary p-2 overflow-hidden group-hover:scale-105 transition-transform duration-700">
                  <AnaisAvatar variant="vessel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTDtuCc-_H3f86cYequ6xRHkoMLA1_vXXOnwmY9be9-RPcyGzqjmJcY7x-bi2tLM90j7kVNcPi-Mq1Vzo2RRxN-bt_Ggt2eAE1sbTeSdVwb8rJlZzpjvTreEQ8GqF8xXI-1JWxNlZn9Re-PDAyS6CV4UzT5emfVaZp64NxJ84zhDhiz_sfRj-r9S0YRwXQx1FQHmP5lHQfgD7ezKBkyMZ7ARFroOaRbvieG4yzsbLx2HEDayDasCt2TrTkboAiPfXb8Rvdoc6fG_ji" />
               </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              <div className="p-3 bg-surface-container-lowest border border-primary/20 text-center">
                <p className="text-[10px] uppercase opacity-60">SYNC_LEVEL</p>
                <p className="font-bold text-primary">{profile?.lvl || 1}</p>
              </div>
              <div className="p-3 bg-surface-container-lowest border border-primary/20 text-center">
                <p className="text-[10px] uppercase opacity-60">RESONANCE</p>
                <p className="font-bold text-secondary">{profile?.soulResonance || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="p-6 border-4 border-dotted border-outline-variant bg-surface-container-low/30">
          <h5 className="text-[10px] font-bold mb-4 opacity-60 uppercase tracking-widest">Protocol_Overview</h5>
          <div className="space-y-3">
             <div className="flex justify-between text-[10px] uppercase">
               <span>Memories:</span>
               <span className="font-bold">{counts.memories}</span>
             </div>
              <div className="flex justify-between text-[10px] uppercase">
               <span>Total_Archive:</span>
               <span className="font-bold">{counts.artifacts}</span>
             </div>
             <div className="flex justify-between text-[10px] uppercase">
               <span>Bridges:</span>
               <span className="font-bold">{counts.bridges}</span>
             </div>
          </div>
        </div>
      </aside>
    </motion.div>
  );
}
