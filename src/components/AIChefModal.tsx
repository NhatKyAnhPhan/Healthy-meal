import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Recipe } from '../types';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Flame, 
  HeartPulse, 
  HelpCircle,
  ChefHat
} from 'lucide-react';

interface AIChefModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  currentRecipe?: Recipe | null;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIChefModal: React.FC<AIChefModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentRecipe,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Xin chào! Tôi là Bác sĩ Dinh dưỡng & Đầu bếp AI của Bếp Sống Khỏe. Tôi đã nắm rõ hồ sơ thể trạng và mục tiêu calo (${userProfile.dailyCalorieTarget || 1800} kcal/ngày)${userProfile.conditions.length > 0 ? ` cùng các tình trạng sức khỏe: ${userProfile.conditions.join(', ')}` : ''} của bạn. Bạn cần tư vấn điều chỉnh món ăn, chọn thực đơn hay mẹo nấu ăn chuẩn y khoa nào hôm nay?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask-chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          profile: userProfile,
          currentRecipe,
        }),
      });
      const data = await res.json();
      const botMsg: Message = {
        sender: 'assistant',
        text: data.reply || 'Xin lỗi, tôi chưa thể trả lời lúc này. Bạn vui lòng thử lại nhé!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error asking AI chef:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Hệ thống đang bảo trì một chút. Lời khuyên chung là: luôn cân đối khẩu phần theo đĩa ăn chuẩn y tế (1/2 rau củ, 1/4 đạm nạc, 1/4 tinh bột phức), giảm muối dưới 3-5g/ngày và hạn chế đồ chiên xào nhiều dầu.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'Tôi bị tiểu đường & mỡ máu, tối nay nấu món gì ngon và an toàn nhất?',
    'Cách nêm canh chua không dùng đường tinh luyện cho người ăn kiêng?',
    'Bị đau dạ dày trào ngược nên chọn gia vị gì thay ớt và tiêu?',
    'Bệnh gút thì nên thay thịt bò bằng loại đạm nào tốt nhất?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[85vh] max-h-[700px]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-serif flex items-center gap-2">
                <span>Bác Sĩ Dinh Dưỡng & Đầu Bếp AI</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              </h3>
              <p className="text-[11px] text-emerald-100">
                Tư vấn thực đơn & gia vị chuẩn theo bệnh lý của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Context Strip */}
        <div className="px-5 py-2 bg-stone-50 border-b border-stone-200 text-xs text-stone-600 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="font-semibold text-stone-800 shrink-0">Hồ sơ của bạn:</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium shrink-0">
            {userProfile.dailyCalorieTarget || 1800} kcal/ngày
          </span>
          {userProfile.conditions.map((c) => (
            <span key={c} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium shrink-0">
              {c}
            </span>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-50/50">
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isUser ? 'text-emerald-100 text-right' : 'text-stone-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center shrink-0 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200 text-xs text-stone-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Bác sĩ Dinh dưỡng AI đang suy nghĩ câu trả lời...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sample Questions Pills */}
        <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200 overflow-x-auto no-scrollbar flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 transition-colors shrink-0 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Hỏi về món ăn, gia vị, calo hoặc chế độ bệnh lý..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-40 disabled:hover:bg-emerald-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
