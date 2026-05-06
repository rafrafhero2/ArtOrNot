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
        <Route path="*" element={<PageWrap><NotFound /></PageWrap>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
