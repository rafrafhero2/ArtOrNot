import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import Landing from "./pages/Landing";
import Customizer from "./pages/Customizer";
import Create from "./pages/Create";
import Join from "./pages/Join";
import Room from "./pages/Room";
import NotFound from "./pages/NotFound";
import Wardrobe from "./pages/Wardrobe";
import Shop from "./pages/Shop";

import CustomCursor from "@/components/CustomCursor";
import { GemGainAnimation } from "@/components/ArtGem";
import { CrateDrop } from "@/components/CrateDrop";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

const queryClient = new QueryClient();

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as any },
};

function PageWrap({ children }: { children: React.ReactNode }) {
  return <motion.div {...pageTransition}>{children}</motion.div>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrap><Landing /></PageWrap>} />
        <Route path="/me" element={<PageWrap><Customizer /></PageWrap>} />
        <Route path="/create" element={<PageWrap><Create /></PageWrap>} />
        <Route path="/join" element={<PageWrap><Join /></PageWrap>} />
        <Route path="/join/:code" element={<PageWrap><Join /></PageWrap>} />
        <Route path="/room/:code" element={<PageWrap><Room /></PageWrap>} />
        <Route path="/room/:code/game" element={<PageWrap><Room /></PageWrap>} />
        <Route path="/wardrobe" element={<PageWrap><Wardrobe /></PageWrap>} />
        <Route path="/shop" element={<PageWrap><Shop /></PageWrap>} />
        <Route path="*" element={<PageWrap><NotFound /></PageWrap>} />
      </Routes>
    </AnimatePresence>
  );
}

declare global {
  interface Window {
    testGems: (amount?: number) => void;
    testCrate: (rarity?: string) => void;
  }
}

const App = () => {
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [crateConfig, setCrateConfig] = useState<{ show: boolean, rarity?: any }>({ show: false });
  const { profile, updateProfile } = useProfile();

  useEffect(() => {
    window.testGems = (amount = 50) => {
      setRewardAmount(amount);
      setTimeout(() => setRewardAmount(null), 3000);
    };

    window.testCrate = (rarity?: string) => {
      // rarity can be Common, Rare, Epic, Legendary, Secret
      const r = rarity ? rarity.charAt(0).toUpperCase() + rarity.slice(1) : undefined;
      setCrateConfig({ show: true, rarity: r });
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimatePresence>
          {rewardAmount !== null && (
            <GemGainAnimation amount={rewardAmount} onComplete={() => setRewardAmount(null)} />
          )}
          {crateConfig.show && (
            <CrateDrop 
              forcedRarity={crateConfig.rarity}
              onComplete={(reward) => {
                setCrateConfig({ show: false });
                const p = { ...profile };
                if (reward.type === "gems") {
                  p.credits += reward.amount;
                  window.testGems(reward.amount);
                } else if (reward.type === "hat") {
                  if (!p.unlockedHats.includes(reward.id)) {
                    p.unlockedHats = [...p.unlockedHats, reward.id];
                  }
                  toast.success(`New Hat: ${reward.label}!`);
                }
                updateProfile(p);
              }} 
            />
          )}
        </AnimatePresence>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CustomCursor />
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
