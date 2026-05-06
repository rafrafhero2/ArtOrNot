import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Dice5, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import AvatarView from "@/components/AvatarView";
import { loadProfile } from "@/lib/avatar";
import { createRoom, generateCode } from "@/lib/game";
import { ensureAuth } from "@/lib/firebase";
import { ThemeBackground } from "@/components/ThemeBackground";

export default function Create() {
  const navigate = useNavigate();
  const [code, setCode] = useState(generateCode());
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const profile = loadProfile();

  useEffect(() => {
    if (!profile) navigate("/me?next=/create");
  }, []);

  if (!profile) return null;

  const link = `${window.location.origin}/join/${code}`;

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Invite link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const start = async () => {
    setBusy(true);
    try {
      const u = await ensureAuth();
      await createRoom(code, {
        uid: u.uid, nickname: profile.nickname, avatar: profile.avatar,
        isHost: true, score: 0, connected: true,
      });
      navigate(`/room/${code}`);
    } catch (e: any) {
      toast.error(e.message ?? "Could not create room");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">
      <ThemeBackground />
      <div className="relative z-10 flex flex-col h-full">
      <nav className="container py-6">
        <Link to="/me?next=/create" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <ArrowLeft size={16}/> Back
        </Link>
      </nav>
      <div className="container max-w-2xl pb-20">
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card-surface p-8 md:p-12">
          <div className="flex items-center gap-4">
            <AvatarView avatar={profile.avatar} size={56} />
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Host</div>
              <div className="font-display text-xl">{profile.nickname}</div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Room code</div>
            <div className="mt-3 inline-flex items-center gap-3">
              <div className="font-mono font-bold text-6xl md:text-7xl tracking-[0.2em] text-primary select-all">{code}</div>
              <button
                onClick={() => setCode(generateCode())}
                className="btn-ghost text-sm"
                title="New code"
              ><Dice5 size={16}/></button>
            </div>
            <div className="mt-6">
              <button onClick={copy} className="btn-ghost text-sm inline-flex items-center gap-2">
                {copied ? <Check size={14}/> : <Copy size={14}/>}
                {copied ? "Copied" : "Copy invite link"}
              </button>
              <div className="text-xs text-muted-foreground mt-2 break-all">{link}</div>
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button onClick={start} disabled={busy} className="btn-primary disabled:opacity-50">
              {busy ? "Creating..." : "Open lobby →"}
            </button>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
