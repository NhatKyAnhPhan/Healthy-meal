import React, { useState, useMemo } from 'react';
import { ActivityLevel, Goal, HealthConditionId, UserProfile } from '../types';
import { calculateMetrics, HEALTH_CONDITIONS } from '../utils/nutritionCalculator';
import { 
  X, 
  Activity, 
  Flame, 
  Droplets, 
  HeartPulse, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Scale, 
  Save, 
  Info,
  Loader2,
  Stethoscope
} from 'lucide-react';

interface HealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const HealthProfileModal: React.FC<HealthProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [aiAdvice, setAiAdvice] = useState<any | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'ai_consultation'>('metrics');

  // Compute live metrics dynamically as user tweaks inputs
  const liveMetrics = useMemo(() => {
    return calculateMetrics(formData);
  }, [formData]);

  if (!isOpen) return null;

  const handleConditionToggle = (id: HealthConditionId) => {
    setFormData((prev) => {
      const exists = prev.conditions.includes(id);
      const updated = exists 
        ? prev.conditions.filter((c) => c !== id)
        : [...prev.conditions, id];
      return { ...prev, conditions: updated };
    });
  };

  const handleSave = () => {
    onSaveProfile(formData);
    onClose();
  };

  const fetchAIAnalysis = async () => {
    setIsLoadingAI(true);
    setActiveTab('ai_consultation');
    try {
      const res = await fetch('/api/ai/analyze-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: formData,
          calculatedMetrics: liveMetrics,
        }),
      });
      const data = await res.json();
      if (data.success && data.advice) {
        setAiAdvice(data.advice);
      }
    } catch (err) {
      console.error('Failed to get AI analysis:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Calculate ideal weight range (BMI 18.5 - 22.9 for Asian)
  const heightM = formData.height / 100;
  const minIdealWeight = Math.round(18.5 * heightM * heightM);
  const maxIdealWeight = Math.round(22.9 * heightM * heightM);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">
                Hồ Sơ Sức Khỏe & Tính Calo Cá Nhân Hóa
              </h2>
              <p className="text-xs text-stone-500">
                Tính toán chính xác theo chuẩn nhân trắc học Châu Á & lâm sàng y khoa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Form Inputs (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Gender, Age, Height, Weight Row */}
              <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/80 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  1. Chỉ số nhân trắc học cơ bản
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Gender */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-stone-600 mb-1">Giới tính</label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-stone-200/60 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: 'male' })}
                        className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                          formData.gender === 'male' 
                            ? 'bg-white text-emerald-700 shadow-xs font-semibold' 
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Nam
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: 'female' })}
                        className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                          formData.gender === 'female' 
                            ? 'bg-white text-emerald-700 shadow-xs font-semibold' 
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Nữ
                      </button>
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Tuổi</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="12"
                        max="100"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || 25 })}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-stone-400">tuổi</span>
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Chiều cao</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="100"
                        max="220"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) || 160 })}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-stone-400">cm</span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Cân nặng</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="30"
                        max="200"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) || 55 })}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-stone-400">kg</span>
                    </div>
                  </div>
                </div>

                {/* Ideal weight range hint */}
                <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Khoảng cân nặng lý tưởng cho chiều cao {formData.height}cm là: <strong className="text-emerald-700">{minIdealWeight} - {maxIdealWeight} kg</strong>.
                  </span>
                </div>
              </div>

              {/* Activity Level */}
              <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  2. Mức độ vận động thể chất
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'sedentary', label: 'Ít vận động', desc: 'Ngồi văn phòng, ít đi lại (hệ số x1.2)' },
                    { id: 'light', label: 'Vận động nhẹ', desc: 'Tập thể dục 1-3 buổi/tuần (x1.375)' },
                    { id: 'moderate', label: 'Vừa phải', desc: 'Tập luyện 3-5 buổi/tuần (x1.55)' },
                    { id: 'active', label: 'Năng động', desc: 'Vận động nhiều 6-7 buổi/tuần (x1.725)' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, activityLevel: act.id as ActivityLevel })}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                        formData.activityLevel === act.id
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-medium ring-1 ring-emerald-500'
                          : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="font-semibold text-stone-900">{act.label}</div>
                      <div className="text-[11px] text-stone-500">{act.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Goal */}
              <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  3. Mục tiêu thể trạng
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'lose_weight_fast', label: 'Giảm mỡ nhanh', desc: 'Thâm hụt -500 kcal/ngày' },
                    { id: 'lose_weight_mild', label: 'Giảm cân từ từ', desc: 'Thâm hụt -300 kcal/ngày' },
                    { id: 'maintain', label: 'Duy trì cân nặng', desc: 'Giữ năng lượng cân bằng' },
                    { id: 'gain_muscle', label: 'Tăng cơ săn chắc', desc: 'Dư thừa nhẹ +250 kcal' },
                    { id: 'gain_weight', label: 'Tăng cân khỏe mạnh', desc: 'Bổ sung +450 kcal' },
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, goal: goal.id as Goal })}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                        formData.goal === goal.id
                          ? 'border-amber-500 bg-amber-50 text-amber-900 font-medium ring-1 ring-amber-500'
                          : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="font-semibold text-stone-900">{goal.label}</div>
                      <div className="text-[10px] text-stone-500">{goal.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Health Conditions & Diets (The requested core feature) */}
              <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    4. Tiền sử bệnh lý & Chế độ ăn kiêng
                  </h3>
                  <span className="text-[11px] text-stone-400">Chọn các mục áp dụng</span>
                </div>

                <p className="text-xs text-stone-500">
                  Hệ thống sẽ lọc công thức nấu ăn phù hợp nhất và tự động điều chỉnh cảnh báo nguyên liệu, gia vị, đường huyết và huyết áp.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {HEALTH_CONDITIONS.map((cond) => {
                    const isSelected = formData.conditions.includes(cond.id);
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => handleConditionToggle(cond.id)}
                        className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-medium ring-1 ring-emerald-600'
                            : 'border-stone-200 bg-white hover:bg-stone-100/80 text-stone-700'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900">{cond.name}</div>
                          <div className="text-[11px] text-stone-500 line-clamp-1">{cond.shortDesc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Live Calculated Metrics & Nutrition Targets (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Tab Selector between Calculated Metrics vs AI Advice */}
              <div className="flex p-1 bg-stone-200/60 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('metrics')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all ${
                    activeTab === 'metrics'
                      ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Chỉ Số & Calo Khuyến Nghị
                </button>
                <button
                  type="button"
                  onClick={fetchAIAnalysis}
                  className={`flex-1 py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'ai_consultation'
                      ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                  <span>Tư Vấn AI Bác Sĩ</span>
                </button>
              </div>

              {activeTab === 'metrics' ? (
                <div className="bg-gradient-to-b from-stone-50 to-white rounded-xl border border-stone-200 p-5 space-y-5">
                  
                  {/* BMI Card */}
                  <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Chỉ số khối cơ thể (BMI)</span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] border ${liveMetrics.bmiColor}`}>
                        {liveMetrics.bmiCategory}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-stone-900">{liveMetrics.bmi}</span>
                      <span className="text-xs text-stone-500">kg/m² (Tiêu chuẩn WHO Châu Á)</span>
                    </div>
                    {/* Visual BMI Bar */}
                    <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden flex">
                      <div className="bg-amber-400 h-full" style={{ width: '25%' }} title="Gầy (<18.5)" />
                      <div className="bg-emerald-500 h-full" style={{ width: '35%' }} title="Bình thường (18.5 - 22.9)" />
                      <div className="bg-orange-400 h-full" style={{ width: '20%' }} title="Thừa cân (23 - 24.9)" />
                      <div className="bg-rose-500 h-full" style={{ width: '20%' }} title="Béo phì (>=25)" />
                    </div>
                  </div>

                  {/* Daily Calorie Intake Recommendation (THE USER'S EXPLICIT REQUEST) */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20 space-y-2">
                    <div className="flex items-center justify-between text-xs text-emerald-100">
                      <span>Calo Tiêu Thụ Hàng Ngày Gợi Ý</span>
                      <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight">{liveMetrics.targetCalories}</span>
                      <span className="text-sm font-medium text-emerald-100">kcal / ngày</span>
                    </div>
                    <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                      Nhu cầu duy trì (TDEE): <strong>{liveMetrics.tdee} kcal</strong>. Đã điều chỉnh theo mục tiêu của bạn để đạt hiệu quả an toàn.
                    </p>
                  </div>

                  {/* Macros Breakdown (Grams & Percentages) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-600 font-semibold">
                      <span>Phân Bổ Dinh Dưỡng Đa Lượng (Macros)</span>
                      <span className="text-[11px] text-stone-400">Đạm : Tinh bột : Béo</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {/* Protein */}
                      <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-[11px] text-blue-700 font-medium">Protein (Đạm)</div>
                        <div className="text-lg font-bold text-blue-900">{liveMetrics.macros.proteinGrams}g</div>
                        <div className="text-[10px] text-blue-600">{liveMetrics.macros.proteinPercent}% Calo</div>
                      </div>

                      {/* Carbs */}
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="text-[11px] text-amber-700 font-medium">Carbs (Tinh bột)</div>
                        <div className="text-lg font-bold text-amber-900">{liveMetrics.macros.carbsGrams}g</div>
                        <div className="text-[10px] text-amber-600">{liveMetrics.macros.carbsPercent}% Calo</div>
                      </div>

                      {/* Fat */}
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                        <div className="text-[11px] text-rose-700 font-medium">Lipid (Chất béo)</div>
                        <div className="text-lg font-bold text-rose-900">{liveMetrics.macros.fatGrams}g</div>
                        <div className="text-[10px] text-rose-600">{liveMetrics.macros.fatPercent}% Calo</div>
                      </div>
                    </div>
                  </div>

                  {/* Water & Sodium Limits */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-900">
                      <Droplets className="w-4 h-4 text-cyan-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-cyan-700">Nước lọc tối thiểu</div>
                        <div className="font-bold">{liveMetrics.targetWaterMl} ml / ngày</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-stone-600">Giới hạn Natri</div>
                        <div className="font-bold">&lt; {liveMetrics.sodiumLimitMg} mg / ngày</div>
                      </div>
                    </div>
                  </div>

                  {/* Warnings & Recommendations tailored to diseases */}
                  {(liveMetrics.warnings.length > 0 || liveMetrics.dietaryRecommendations.length > 0) && (
                    <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs">
                      <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-amber-700" />
                        Lưu ý y khoa quan trọng:
                      </div>
                      <ul className="space-y-1 text-amber-800 text-[11px] list-disc pl-4">
                        {liveMetrics.warnings.map((w, i) => (
                          <li key={i} className="font-medium text-rose-700">{w}</li>
                        ))}
                        {liveMetrics.dietaryRecommendations.slice(0, 2).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Analyze trigger button */}
                  <button
                    type="button"
                    onClick={fetchAIAnalysis}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Hỏi AI Bác Sĩ Dinh Dưỡng Đánh Giá Chuyên Sâu</span>
                  </button>

                </div>
              ) : (
                /* AI Consultation Tab */
                <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-4 text-xs">
                  {isLoadingAI ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3 text-stone-500">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                      <p className="font-medium text-stone-700">Bác sĩ Dinh dưỡng AI đang phân tích hồ sơ bệnh lý...</p>
                      <p className="text-[11px]">Đang rà soát tương tác thực phẩm và mục tiêu chuyển hóa</p>
                    </div>
                  ) : aiAdvice ? (
                    <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                      
                      {/* Summary */}
                      <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs">
                        <div className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Đánh giá tổng quan:
                        </div>
                        <p className="text-stone-700 leading-relaxed text-[11px]">{aiAdvice.summary}</p>
                      </div>

                      {/* Calorie distribution advice */}
                      {aiAdvice.calorieAdvice && (
                        <div className="p-3 bg-white rounded-lg border border-stone-200">
                          <div className="font-bold text-stone-800 mb-1">Phân bổ bữa ăn:</div>
                          <p className="text-stone-600 text-[11px] leading-relaxed">{aiAdvice.calorieAdvice}</p>
                        </div>
                      )}

                      {/* Recommended foods */}
                      {aiAdvice.recommendedFoods && (
                        <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
                          <div className="font-bold text-emerald-900 mb-1">Thực phẩm vàng khuyên dùng:</div>
                          <ul className="list-disc pl-4 space-y-1 text-emerald-800 text-[11px]">
                            {aiAdvice.recommendedFoods.map((f: string, idx: number) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Foods to avoid */}
                      {aiAdvice.foodsToAvoid && (
                        <div className="p-3 bg-rose-50/70 rounded-lg border border-rose-200">
                          <div className="font-bold text-rose-900 mb-1">Thực phẩm cần kiêng hoặc tránh:</div>
                          <ul className="list-disc pl-4 space-y-1 text-rose-800 text-[11px]">
                            {aiAdvice.foodsToAvoid.map((f: string, idx: number) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Cooking tips */}
                      {aiAdvice.cookingTips && (
                        <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
                          <div className="font-bold text-amber-900 mb-1">Lưu ý khi nêm nếm & nấu nướng:</div>
                          <ul className="list-disc pl-4 space-y-1 text-amber-800 text-[11px]">
                            {aiAdvice.cookingTips.map((t: string, idx: number) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-3">
                      <Stethoscope className="w-10 h-10 text-stone-300 mx-auto" />
                      <p className="text-stone-600 font-medium">Bấm nút bên dưới để nhận phân tích y khoa chi tiết từ AI</p>
                      <button
                        type="button"
                        onClick={fetchAIAnalysis}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium shadow-xs hover:bg-emerald-700"
                      >
                        Bắt đầu phân tích hồ sơ
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Hồ sơ sẽ được lưu tự động trên thiết bị của bạn.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs sm:text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu & Áp Dụng Thực Đơn</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
