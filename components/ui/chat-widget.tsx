"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget({ contextData, brandName }: { contextData: any, brandName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Merhaba! Ben ${brandName} için özel reklam analistinizim. Bugünün metrikleri, dönüşüm hunisi ve ROAS hakkında sorularınızı yanıtlayabilirim. Size nasıl yardımcı olabilirim?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: contextData, // Gösterge panelindeki güncel metrikler
          brandName
        })
      });

      if (!response.ok) throw new Error("API yanıt vermedi");
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString() + "a",
        role: "assistant",
        content: data.reply
      }]);
    } catch (error) {
       setMessages(prev => [...prev, {
        id: "err",
        role: "assistant",
        content: "Üzgünüm, şu anda yanıt sistemimde bir sorun oluştu. Lütfen tekrar deneyin."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-slate-900 shadow-xl flex items-center justify-center hover:scale-105 transition-all duration-300 z-50 group hover:shadow-indigo-500/30"
        >
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
          <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] rounded-2xl bg-white shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-slate-900 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                 <Bot className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="font-semibold text-sm">AI Analist</h3>
                 <p className="text-xs text-blue-100 opacity-90">{brandName} Verileri Aktif</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-900/80 hover:text-slate-900 hover:bg-white/20 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 space-y-4 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                   <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                      <Bot className="w-4 h-4 text-indigo-600" />
                   </div>
                )}
                
                <div className={`text-sm px-4 py-2.5 max-w-[80%] shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#F5403F] text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                 <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                    <Bot className="w-4 h-4 text-indigo-600" />
                 </div>
                 <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 flex items-center gap-1 shadow-sm">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Verilerle ilgili bir şey sorun..."
                className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all pr-10"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-1 w-8 h-8 flex items-center justify-center bg-[#F5403F] text-white rounded-full hover:bg-[#D93635] disabled:opacity-50 disabled:hover:bg-[#F5403F] transition-colors"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <div className="text-center mt-2">
               <span className="text-[10px] text-gray-400">Yapay Zeka hata yapabilir.</span>
            </div>
          </form>

        </div>
      )}
    </>
  );
}
