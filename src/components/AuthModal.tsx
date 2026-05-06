import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, signInWithGoogle } from "@/lib/firebase";
import { LogIn, Mail, Lock, X, ChevronRight } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useToast } from "./ui/use-toast";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast({ title: "Welcome!", description: "Signed in with Google" });
      onClose();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!", description: "Signed in successfully" });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account created!", description: "Welcome to ArtOrNot" });
      }
      onClose();
    } catch (e: any) {
      toast({ title: "Auth Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#161616] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
            style={{ willChange: "transform, opacity" }}
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-white p-2 transition-colors">
              <X size={20} />
            </button>

            <div className="p-10 pt-14">
              <div className="text-center mb-10">
                <h2 className="font-heading text-4xl font-bold mb-3 tracking-tight">
                  {isLogin ? "Welcome Back" : "Join the fun"}
                </h2>
                <p className="text-[#888880] text-lg">
                  {isLogin ? "Sign in to keep your progress" : "Create an account to earn credits"}
                </p>
              </div>

              <div className="space-y-5">
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">or use email</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <form onSubmit={handleEmail} className="space-y-4">
                  <div className="space-y-3">
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                      <input
                        type="email"
                        placeholder="Email address"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-sm focus:border-primary/50 outline-none transition-all focus:bg-white/[0.05]"
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                      <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-sm focus:border-primary/50 outline-none transition-all focus:bg-white/[0.05]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_12px_24px_rgba(232,255,71,0.15)]"
                  >
                    {isLogin ? "Sign In" : "Sign Up"}
                    <ChevronRight size={18} />
                  </button>
                </form>

                <div className="text-center pt-4">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-[#888880] hover:text-primary transition-colors font-medium"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white/[0.02] py-5 text-center border-t border-white/5">
              <p className="text-[10px] text-white/10 uppercase tracking-[0.3em] font-medium">
                ArtOrNot — Play with friends
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
