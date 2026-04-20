import React from 'react';
import { Terminal, Lock, ShieldAlert, LogIn } from 'lucide-react';
import { loginWithGoogle, logout } from '../lib/firebase';
import { motion } from 'motion/react';

export const LoginScreen = () => {
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError('DOMAIN_UNAUTHORIZED: Add "localhost" to Firebase Console > Auth > Settings.');
      } else {
        setError(err.message || 'AUTHENTICATION_FAILED');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full pixel-border-primary bg-surface-container p-8 text-center relative overflow-hidden"
      >
        <div className="scanline absolute inset-0 opacity-10"></div>
        <Terminal className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-tertiary uppercase tracking-tighter mb-2">ANAIS_V4.0 AUTHORIZATION</h1>
        <p className="text-on-surface-variant mb-8 text-sm uppercase tracking-widest font-bold">Secure Entry Protocol Required</p>
        
        {error && (
          <div className="mb-6 p-3 bg-error/10 border border-error text-error text-[10px] font-mono leading-tight uppercase text-left">
            [!] ERROR_DETECTED:
            <br />
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin}
          className="w-full bg-primary text-surface py-4 font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <LogIn className="w-5 h-5" />
          Authenticate_With_Google
        </button>
      </motion.div>
    </div>
  );
};

export const AccessDeniedScreen = ({ user }: { user: any }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full border-4 border-error bg-surface-container p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-error animate-pulse"></div>
        <ShieldAlert className="w-16 h-16 text-error mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-error uppercase tracking-tighter mb-4">ACCESS_VIOLATION_ENTRY_DENIED</h1>
        <p className="text-on-surface mb-6 text-sm leading-relaxed">
          The identity <span className="text-error font-bold">{user?.email}</span> is not whitelisted for this core terminal. Entry is restricted to established architect IDs.
        </p>
        
        <button 
          onClick={logout}
          className="w-full border-2 border-error text-error py-3 font-bold uppercase tracking-widest hover:bg-error/10 active:scale-95 transition-all cursor-pointer"
        >
          Terminate_Session_&_Retry
        </button>
      </motion.div>
    </div>
  );
};
