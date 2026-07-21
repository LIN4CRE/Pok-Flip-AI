import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  TrendingUp, 
  HelpCircle, 
  Zap,
  RotateCcw
} from 'lucide-react';
import { sendPokeBotMessage } from '../lib/geminiApi';

interface PokeBotAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const PokeBotAssistant: React.FC<PokeBotAssistantProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: "👋 Hi! I am **PokéBot AI**, your conversational market analyst and card flipping strategist. Ask me about eBay/TCGplayer price spreads, PSA gem rates, or quick arbitrage strategies!",
      time: 'Just now'
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const quickPrompts = [
    "What modern PSA 10 slabs have >25% profit under $500?",
    "Should I buy a 1st Edition Base Set Charizard PSA 8 right now?",
    "How much are eBay fees on a $1,250 Umbreon VMAX sale?"
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsSending(true);

    try {
      const replyText = await sendPokeBotMessage(textToSend);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center">
                <span>PokéBot AI Strategist</span>
                <Sparkles className="w-3.5 h-3.5 ml-1 text-amber-400" />
              </div>
              <div className="text-[10px] text-emerald-400">Powered by Gemini 3.6 Flash Engine</div>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center space-x-2 text-amber-400 text-xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing market pricing spreadsheets...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 space-y-1.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Quick Market Queries:</div>
          <div className="flex flex-col gap-1">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-left text-[11px] text-slate-300 hover:text-amber-400 truncate bg-slate-900 hover:bg-slate-850 p-1.5 rounded-lg border border-slate-800 transition-colors"
              >
                ⚡ {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask PokéBot anything about card flipping..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isSending || !inputPrompt.trim()}
              className="p-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
