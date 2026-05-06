import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarView from "@/components/AvatarView";
import { Send, Smile } from "lucide-react";
import { sendChat, subscribeChat } from "@/lib/game";
import { loadProfile } from "@/lib/avatar";
import type { Avatar } from "@/lib/avatar";

const EMOJIS = ["😂","😭","🤔","😱","🙃","🔥","💀","🎨","🤡","😎","👀","✨","💯","🤝","🤬","🥲","😏","🙏","🤷","😬","🥶","🤯","😈","🫠","👻","🎉","🤌","🫡","🦄","🍕"];

export default function Chat({
  code, uid, nickname, avatar, disabled, disabledHint,
}: { code: string; uid: string; nickname: string; avatar: Avatar; disabled?: boolean; disabledHint?: string }) {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeChat(code, setMsgs), [code]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }); }, [msgs.length]);

  const send = async () => {
    if (!text.trim() || disabled) return;
    await sendChat(code, { uid, nickname, avatar, text: text.trim().slice(0, 240) });
    setText("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2"
            >
              <AvatarView avatar={m.avatar} size={28} />
              <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground">{m.nickname}</div>
                <div className="text-sm break-words">{m.text}</div>
              </div>
            </motion.div>
          ))}
          {msgs.length === 0 && (
            <div className="text-center text-muted-foreground text-xs py-8">No messages yet. Say hi 👋</div>
          )}
        </AnimatePresence>
      </div>
      <div className="border-t border-white/[0.06] p-3 relative">
        {showEmoji && (
          <div className="absolute bottom-full left-3 mb-2 p-2 rounded-2xl glass grid grid-cols-10 gap-1 max-w-xs z-10">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => { setText((t) => t + e); setShowEmoji(false); }} className="text-lg hover:bg-white/10 rounded-md w-7 h-7">{e}</button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEmoji((v) => !v)} className="text-muted-foreground hover:text-foreground p-1.5">
            <Smile size={18}/>
          </button>
          <input
            value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={disabled}
            placeholder={disabled ? (disabledHint ?? "Chat disabled") : "Message..."}
            className="flex-1 bg-white/5 rounded-full px-4 py-2 text-sm border border-white/[0.06] focus:border-primary outline-none disabled:opacity-50"
          />
          <button onClick={send} disabled={disabled || !text.trim()} className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-30">
            <Send size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}
