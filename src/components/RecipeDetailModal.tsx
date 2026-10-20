import React, { useState, useEffect, useRef } from 'react';
import { CautionNote, Recipe, UserProfile } from '../types';
import { 
  X, 
  Play, 
  Clock, 
  Flame, 
  Users, 
  ChefHat, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Timer, 
  ShoppingCart, 
  Calendar, 
  Bookmark, 
  Plus, 
  RotateCcw,
  Check,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  userProfile: UserProfile;
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onAddToShoppingList: (recipe: Recipe, servings: number) => void;
  onAddToMealPlan: (recipe: Recipe, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  userProfile,
  isFavorite,
  onToggleFavorite,
  onAddToShoppingList,
  onAddToMealPlan,
}) => {
  if (!recipe) return null;

  const [activeTab, setActiveTab] = useState<'video_steps' | 'nutrition' | 'ai_customizer'>('video_steps');
  const [servings, setServings] = useState<number>(recipe.servings || 2);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  
  // Timer state for step timers
  const [activeTimerStep, setActiveTimerStep] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Audio Speech state (Voice Reader)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingStep, setSpeakingStep] = useState<number | null>(null);

  // Video embed timestamp
  const [videoTimestampUrl, setVideoTimestampUrl] = useState<string>(recipe.videoUrl);

  // AI Customization state
  const [aiCustomization, setAiCustomization] = useState<any | null>(null);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [customRequestInput, setCustomRequestInput] = useState<string>('');

  // Ratio for ingredient & nutrient scaling
  const scaleRatio = servings / (recipe.servings || 2);

  // Sound alert when timer finishes
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // AudioContext might be blocked until user gesture
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, timeLeft]);

  // Voice Reader cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStartTimer = (stepNumber: number, durationSeconds: number) => {
    setActiveTimerStep(stepNumber);
    setTimeLeft(durationSeconds);
    setTimerRunning(true);
  };

  const handleToggleTimer = () => {
    setTimerRunning((prev) => !prev);
  };

  const handleResetTimer = (durationSeconds: number) => {
    setTimeLeft(durationSeconds);
    setTimerRunning(false);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Speak step description using Web Speech API (Vietnamese)
  const handleSpeakStep = (stepNumber: number, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking && speakingStep === stepNumber) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingStep(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingStep(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingStep(null);
    };

    setIsSpeaking(true);
    setSpeakingStep(stepNumber);
    window.speechSynthesis.speak(utterance);
  };

  const jumpToVideoStep = (seconds?: number) => {
    if (seconds !== undefined) {
      const sep = recipe.videoUrl.includes('?') ? '&' : '?';
      setVideoTimestampUrl(`${recipe.videoUrl}${sep}start=${seconds}&autoplay=1`);
    }
  };

  const toggleStepCompleted = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  // AI Customization fetch
  const handleRequestCustomization = async () => {
    setIsCustomizing(true);
    try {
      const res = await fetch('/api/ai/customize-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe,
          profile: userProfile,
          userRequest: customRequestInput || 'Điều chỉnh an toàn theo bệnh lý của tôi',
        }),
      });
      const data = await res.json();
      if (data.success && data.customization) {
        setAiCustomization(data.customization);
      }
    } catch (err) {
      console.error('Failed to customize recipe with AI:', err);
    } finally {
      setIsCustomizing(false);
    }
  };

  // User daily calorie quota percent
  const caloriePercent = Math.round((recipe.calories * 100) / (userProfile.dailyCalorieTarget || 1800));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
              {recipe.cuisine}
            </span>
            <h2 className="font-bold text-stone-900 text-base sm:text-lg truncate font-serif">
              {recipe.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Favorite button */}
            <button
              type="button"
              onClick={() => onToggleFavorite(recipe.id)}
              className={`p-2 rounded-xl transition-all ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
              title={isFavorite ? 'Bỏ lưu' : 'Lưu món'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          
          {/* Main Grid: Left Side Video & Details (7 cols), Right Side Ingredients & Nutrition (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Video Player & Step-by-Step Instructions */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Responsive Video Embed Player */}
              <div className="rounded-2xl overflow-hidden bg-stone-950 aspect-16/9 shadow-lg relative border border-stone-200">
                <iframe
                  src={videoTimestampUrl}
                  title={recipe.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Navigation Tabs */}
              <div className="flex p-1 bg-stone-100 rounded-xl text-xs sm:text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('video_steps')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'video_steps'
                      ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ChefHat className="w-4 h-4 text-emerald-600" />
                  <span>Hướng Dẫn Từng Bước ({recipe.steps.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('nutrition')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'nutrition'
                      ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-rose-500" />
                  <span>Dinh Dưỡng & Y Khoa</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ai_customizer');
                    if (!aiCustomization) handleRequestCustomization();
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'ai_customizer'
                      ? 'bg-white text-teal-800 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                  <span>AI Tùy Biến Bệnh Lý</span>
                </button>
              </div>

              {/* TAB 1: Step by Step Cooking Instructions */}
              {activeTab === 'video_steps' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2 font-serif">
                      <span>Các bước thực hiện chi tiết</span>
                      <span className="text-xs font-normal text-stone-500">
                        (Bấm vào nút thời gian để nhảy video)
                      </span>
                    </h3>
                    <div className="text-xs text-stone-500">
                      Đã hoàn thành: {Object.values(completedSteps).filter(Boolean).length}/{recipe.steps.length}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {recipe.steps.map((step) => {
                      const isDone = !!completedSteps[step.stepNumber];
                      const isTimerActiveForThis = activeTimerStep === step.stepNumber;

                      return (
                        <div
                          key={step.stepNumber}
                          className={`p-4 rounded-xl border transition-all ${
                            isDone 
                              ? 'bg-emerald-50/40 border-emerald-200/80 opacity-90' 
                              : 'bg-white border-stone-200 hover:border-emerald-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5">
                              {/* Checkbox */}
                              <button
                                type="button"
                                onClick={() => toggleStepCompleted(step.stepNumber)}
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-stone-300 hover:border-emerald-500 bg-white'
                                }`}
                              >
                                {isDone && <Check className="w-4 h-4" />}
                              </button>

                              <h4 className={`font-bold text-sm ${isDone ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                                Bước {step.stepNumber}: {step.title}
                              </h4>
                            </div>

                            {/* Jump Video Timestamp Button */}
                            {step.videoTimestamp !== undefined && (
                              <button
                                type="button"
                                onClick={() => jumpToVideoStep(step.videoTimestamp)}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-600 text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                                title="Nhảy video đến bước này"
                              >
                                <Play className="w-3 h-3 fill-red-500 text-red-500" />
                                <span>{formatSeconds(step.videoTimestamp)}</span>
                              </button>
                            )}
                          </div>

                          {/* Description */}
                          <p className={`text-xs sm:text-sm leading-relaxed ${isDone ? 'text-stone-500' : 'text-stone-700'}`}>
                            {step.description}
                          </p>

                          {/* Chef tip if any */}
                          {step.tips && (
                            <div className="mt-2.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5">
                              <ChefHat className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span><strong>Mẹo bếp trưởng:</strong> {step.tips}</span>
                            </div>
                          )}

                          {/* Interactive Step Actions: Voice Reader & Step Timer */}
                          <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            
                            {/* Voice Reader button */}
                            <button
                              type="button"
                              onClick={() => handleSpeakStep(step.stepNumber, `${step.title}. ${step.description}`)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-medium ${
                                isSpeaking && speakingStep === step.stepNumber
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              {isSpeaking && speakingStep === step.stepNumber ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                                  <span>Dừng đọc</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Đọc to rảnh tay</span>
                                </>
                              )}
                            </button>

                            {/* Step Timer if duration is provided */}
                            {step.durationSeconds && (
                              <div className="flex items-center gap-1.5">
                                {isTimerActiveForThis ? (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold">
                                    <Timer className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                                    <span>{formatSeconds(timeLeft)}</span>
                                    <button
                                      type="button"
                                      onClick={handleToggleTimer}
                                      className="ml-1 text-[10px] underline"
                                    >
                                      {timerRunning ? 'Tạm dừng' : 'Tiếp tục'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleResetTimer(step.durationSeconds!)}
                                      className="p-1 hover:text-stone-900"
                                      title="Đặt lại"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleStartTimer(step.stepNumber, step.durationSeconds!)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                                  >
                                    <Timer className="w-3.5 h-3.5 text-stone-500" />
                                    <span>Hẹn giờ ({Math.round(step.durationSeconds / 60)} phút)</span>
                                  </button>
                                )}
                              </div>
                            )}

                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: Clinical Nutrition & Health Analysis */}
              {activeTab === 'nutrition' && (
                <div className="space-y-4">
                  
                  {/* Quota summary box */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
                      <span>Đóng góp vào mục tiêu calo hàng ngày</span>
                      <span>{caloriePercent}% TDEE của bạn</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-emerald-200 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${Math.min(caloriePercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-600">
                      Một khẩu phần món này cung cấp <strong>{Math.round(recipe.calories * scaleRatio)} kcal</strong> trên tổng mục tiêu {userProfile.dailyCalorieTarget || 1800} kcal/ngày.
                    </p>
                  </div>

                  {/* Health Highlights */}
                  <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2.5">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Lợi ích lâm sàng nổi bật</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {recipe.healthHighlights.map((hl, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Health Cautions if any */}
                  {recipe.cautionFor && recipe.cautionFor.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                      <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Cảnh báo & Lưu ý đặc biệt</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-amber-800">
                        {recipe.cautionFor.map((c: CautionNote, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-bold uppercase text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-900 shrink-0">
                              {c.condition}
                            </span>
                            <span>{c.note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Comprehensive Nutrition Table */}
                  <div className="rounded-xl border border-stone-200 overflow-hidden text-xs">
                    <div className="bg-stone-100 px-4 py-2 font-bold text-stone-800">
                      Bảng Thành Phần Dinh Dưỡng Chi Tiết (Cho {servings} người ăn)
                    </div>
                    <div className="divide-y divide-stone-200 bg-white">
                      <div className="flex justify-between px-4 py-2 font-semibold text-stone-900">
                        <span>Năng lượng (Calories)</span>
                        <span className="text-emerald-700">{Math.round(recipe.nutrition.calories * scaleRatio)} kcal</span>
                      </div>
                      <div className="flex justify-between px-4 py-2 text-stone-700">
                        <span>Chất đạm (Protein)</span>
                        <span>{Math.round(recipe.nutrition.protein * scaleRatio)} g</span>
                      </div>
                      <div className="flex justify-between px-4 py-2 text-stone-700">
                        <span>Tinh bột (Carbohydrates)</span>
                        <span>{Math.round(recipe.nutrition.carbs * scaleRatio)} g</span>
                      </div>
                      <div className="flex justify-between px-4 py-2 text-stone-700">
                        <span>Chất béo (Lipid)</span>
                        <span>{Math.round(recipe.nutrition.fat * scaleRatio)} g</span>
                      </div>
                      <div className="flex justify-between px-4 py-2 text-stone-700">
                        <span>Chất xơ tiêu hóa (Fiber)</span>
                        <span>{Math.round(recipe.nutrition.fiber * scaleRatio)} g</span>
                      </div>
                      <div className="flex justify-between px-4 py-2 text-stone-700">
                        <span>Hàm lượng Natri (Muối)</span>
                        <span>{Math.round(recipe.nutrition.sodium * scaleRatio)} mg</span>
                      </div>
                      <div className="flex justify-between px-4 py-2 text-stone-700">
                        <span>Chỉ số đường huyết (GI)</span>
                        <span className="font-bold text-emerald-700">{recipe.nutrition.giIndex}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: AI Recipe Customizer according to user's medical condition */}
              {activeTab === 'ai_customizer' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-600 animate-pulse" />
                      <h4 className="font-bold text-teal-900 text-sm">
                        AI Điều Chỉnh Công Thức Cho Bệnh Lý Của Bạn
                      </h4>
                    </div>
                    <p className="text-xs text-teal-800 leading-relaxed">
                      Đang cá nhân hóa cho hồ sơ: <strong>{userProfile.conditions.join(', ') || 'Ăn uống lành mạnh thông thường'}</strong>.
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Yêu cầu thêm (vd: Tôi không ăn được hành, muốn giảm cay...)"
                        value={customRequestInput}
                        onChange={(e) => setCustomRequestInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-teal-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={handleRequestCustomization}
                        disabled={isCustomizing}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {isCustomizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>Tùy biến</span>
                      </button>
                    </div>
                  </div>

                  {isCustomizing ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-2 text-stone-500 text-xs">
                      <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                      <p>AI đang thay thế nguyên liệu và cân đối lượng muối cho bạn...</p>
                    </div>
                  ) : aiCustomization ? (
                    <div className="space-y-3.5 text-xs">
                      
                      {/* Safety Rating */}
                      <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                        <span className="font-semibold text-stone-700">Mức độ an toàn với thể trạng:</span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {aiCustomization.safetyRating || 'An toàn'}
                        </span>
                      </div>

                      {/* Clinical note */}
                      {aiCustomization.clinicalNote && (
                        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 leading-relaxed">
                          <strong className="text-stone-900 block mb-1">Lời khuyên y khoa:</strong>
                          {aiCustomization.clinicalNote}
                        </div>
                      )}

                      {/* Substitutions */}
                      {aiCustomization.ingredientSubstitutions && aiCustomization.ingredientSubstitutions.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-bold text-stone-900">Nguyên liệu & Gia vị nên thay thế:</h5>
                          <div className="space-y-2">
                            {aiCustomization.ingredientSubstitutions.map((sub: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg bg-white border border-stone-200 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-stone-500 line-through">{sub.original}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
                                  <span className="font-bold text-emerald-700">{sub.substitute}</span>
                                </div>
                                <p className="text-[11px] text-stone-500 italic">{sub.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cooking Adjustments */}
                      {aiCustomization.cookingAdjustment && (
                        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900">
                          <strong className="block mb-1">Điều chỉnh cách nấu:</strong>
                          {aiCustomization.cookingAdjustment}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

            </div>

            {/* Right Column: Servings Scaler & Ingredients (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Serving Scaler */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-800 font-bold text-xs sm:text-sm">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Điều chỉnh khẩu phần ăn</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">
                    {Math.round(recipe.calories * scaleRatio)} kcal / {servings} người
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-200/70 rounded-lg">
                  {[1, 2, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setServings(num)}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                        servings === num
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {num} người
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-500 text-center">
                  Định lượng nguyên liệu tự động nhân chia tương ứng
                </p>
              </div>

              {/* Ingredients List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base font-serif">
                    Nguyên liệu chuẩn bị
                  </h3>
                  <span className="text-xs text-stone-500">{recipe.ingredients.length} món</span>
                </div>

                <div className="rounded-xl border border-stone-200 overflow-hidden divide-y divide-stone-100 bg-white shadow-2xs">
                  {recipe.ingredients.map((ing, idx) => {
                    const scaledAmount = Number((ing.amount * scaleRatio).toFixed(1));
                    return (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-stone-50/80 transition-colors">
                        <div>
                          <span className="font-medium text-stone-900">{ing.name}</span>
                          {ing.notes && (
                            <span className="block text-[11px] text-stone-400">{ing.notes}</span>
                          )}
                        </div>
                        <div className="font-bold text-emerald-800 text-right shrink-0">
                          {scaledAmount} {ing.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add to shopping list button */}
                <button
                  type="button"
                  onClick={() => onAddToShoppingList(recipe, servings)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-700" />
                  <span>Thêm nguyên liệu vào Danh Sách Đi Chợ</span>
                </button>
              </div>

              {/* Add to Meal Plan Selector */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Xếp vào Thực Đơn Hôm Nay:</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'breakfast', label: 'Bữa Sáng' },
                    { id: 'lunch', label: 'Bữa Trưa' },
                    { id: 'dinner', label: 'Bữa Tối' },
                    { id: 'snack', label: 'Bữa Xế/Phụ' },
                  ].map((meal) => (
                    <button
                      key={meal.id}
                      type="button"
                      onClick={() => onAddToMealPlan(recipe, meal.id as any)}
                      className="py-2 px-3 rounded-lg bg-white hover:bg-emerald-600 hover:text-white border border-stone-200 text-stone-700 font-medium transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{meal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
