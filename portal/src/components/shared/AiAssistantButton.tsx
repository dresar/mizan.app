import { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
const AiAssistantButton = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isOpen]);
  const getSystemContext = () => {
    try {
      const queries = queryClient.getQueryCache().findAll();
      const cacheData: Record<string, unknown> = {};
      queries.forEach(query => {
        if (query.state.status === 'success' && query.state.data) {
          const key = JSON.stringify(query.queryKey);
          const dataStr = JSON.stringify(query.state.data);
          if (dataStr.length < 10000) { 
            cacheData[key] = query.state.data;
          }
        }
      });
      return `
        Anda adalah asisten virtual "Pondok Pesantren Raudhatussalam" yang cerdas.
        DATA KONTEKS SISTEM SAAT INI (Dari Admin Panel):
        Berikut adalah data JSON yang tersedia di aplikasi saat ini (React Query Cache):
        ${JSON.stringify(cacheData, null, 2)}
        INSTRUKSI:
        1. Gunakan data di atas untuk menjawab pertanyaan pengguna secara akurat.
        2. Jika pengguna bertanya tentang data yang ada di konteks (seperti daftar santri, fasilitas, berita, dll), gunakan data tersebut.
        3. Jika data tidak ditemukan, katakan dengan jujur bahwa Anda tidak melihat data tersebut di sistem saat ini.
        4. Jawablah dengan sopan, ramah, dan islami.
        5. Selalu gunakan Bahasa Indonesia yang baik.
      `;
    } catch (error) {
      console.error("Error generating context:", error);
      return 'Anda adalah asisten virtual Pondok Pesantren Raudhatussalam. Jawablah dengan sopan, ramah, dan islami.';
    }
  };
  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiInput('');
    setIsAiLoading(true);
    try {
      const apiKey = import.meta.env.VITE_AI_API_KEY;
      const apiUrl = import.meta.env.VITE_AI_API_URL || 'https://one.apprentice.cyou/api/v1/chat/completions';
      const model = import.meta.env.VITE_AI_MODEL || 'gemini-2.5-flash';
      if (!apiKey) {
        throw new Error('API key AI belum diatur');
      }
      const systemPrompt = getSystemContext();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...aiMessages,
            { role: 'user', content: userMsg }
          ]
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        setAiMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
      } else {
        setAiMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti.' }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan koneksi. Silakan periksa internet Anda.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };
  return (
    <>
      {}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="AI Assistant"
        className={cn(
          "fixed z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform duration-200",
          "bg-indigo-600 hover:bg-indigo-700 text-white",
          "bottom-24 right-6", 
          isOpen && "rotate-90 bg-destructive hover:bg-destructive"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden shadow-2xl border border-border",
              "bg-background rounded-2xl",
              "bottom-40 right-4 left-4 h-[60vh]",
              "sm:bottom-24 sm:right-20 sm:left-auto sm:w-[380px] sm:h-[500px]"
            )}
          >
            {}
            <div className="bg-indigo-600 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    AI Assistant <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                  </h3>
                  <p className="text-xs text-indigo-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online • Konteks Aktif
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                onClick={() => setAiMessages([])}
                title="Reset Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            {}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 dark:bg-muted/10">
              {aiMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="font-medium text-foreground">Assalamu'alaikum, {user?.firstName || 'Sahabat'}!</p>
                  <p className="mt-2 px-4 text-xs leading-relaxed">
                    Saya sudah mempelajari data sistem terkini. Tanyakan apa saja tentang data pesantren, santri, atau fasilitas.
                  </p>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={cn("flex gap-2 max-w-[90%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm", 
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white" 
                      : "bg-white dark:bg-zinc-800 border border-border text-indigo-600 dark:text-indigo-400"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm", 
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white dark:bg-zinc-800 border border-border rounded-tl-none dark:text-zinc-100"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isAiLoading && (
                <div className="flex gap-2 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-border text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 border border-border rounded-tl-none shadow-sm flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-xs text-muted-foreground">Sedang berpikir...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input Area */}
            <div className="p-3 bg-background border-t border-border shrink-0">
              <form 
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAiSend();
                }}
              >
                <Input 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ketik pertanyaan..."
                  className="flex-1 rounded-full border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-600 bg-muted/20"
                  disabled={isAiLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn(
                    "rounded-full shrink-0 transition-all duration-200",
                    aiInput.trim() ? "bg-indigo-600 hover:bg-indigo-700 scale-100" : "bg-muted text-muted-foreground scale-90"
                  )}
                  disabled={!aiInput.trim() || isAiLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default AiAssistantButton;
