import React from 'react';
import { CalculatedHealthMetrics, MealPlanDay, Recipe, UserProfile } from '../types';
import { 
  Calendar, 
  Flame, 
  Sparkles, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Info,
  Utensils
} from 'lucide-react';

interface MealPlannerViewProps {
  mealPlan: MealPlanDay;
  recipes: Recipe[];
  userProfile: UserProfile;
  metrics: CalculatedHealthMetrics;
  onRemoveFromMeal: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', recipeId: string) => void;
  onAutoGenerateMenu: () => void;
  onExportToShoppingList: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenRecipeCatalog: () => void;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  mealPlan,
  recipes,
  userProfile,
  metrics,
  onRemoveFromMeal,
  onAutoGenerateMenu,
  onExportToShoppingList,
  onSelectRecipe,
  onOpenRecipeCatalog,
}) => {
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  // Calculate total nutrients planned for today
  const allPlannedIds = [
    ...mealPlan.breakfast,
    ...mealPlan.lunch,
    ...mealPlan.dinner,
    ...mealPlan.snack,
  ];

  const totalCalories = allPlannedIds.reduce((sum, id) => {
    const r = recipeMap.get(id);
    return sum + (r ? r.calories : 0);
  }, 0);

  const totalProtein = allPlannedIds.reduce((sum, id) => {
    const r = recipeMap.get(id);
    return sum + (r ? r.nutrition.protein : 0);
  }, 0);

  const totalCarbs = allPlannedIds.reduce((sum, id) => {
    const r = recipeMap.get(id);
    return sum + (r ? r.nutrition.carbs : 0);
  }, 0);

  const totalFat = allPlannedIds.reduce((sum, id) => {
    const r = recipeMap.get(id);
    return sum + (r ? r.nutrition.fat : 0);
  }, 0);

  const targetCal = metrics.targetCalories || 1800;
  const calPercent = Math.round((totalCalories / targetCal) * 100);
  const diffCal = targetCal - totalCalories;

  let calStatus = 'Cân bằng hoàn hảo';
  let calStatusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (calPercent < 75) {
    calStatus = 'Hơi thiếu năng lượng';
    calStatusColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (calPercent > 110) {
    calStatus = 'Vượt mục tiêu calo';
    calStatusColor = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  const mealSlots: { id: 'breakfast' | 'lunch' | 'dinner' | 'snack'; title: string; subtitle: string; icon: string }[] = [
    { id: 'breakfast', title: 'Bữa Sáng', subtitle: 'Khởi đầu ngày mới (~25% Calo)', icon: '☀️' },
    { id: 'lunch', title: 'Bữa Trưa', subtitle: 'Nạp năng lượng chính (~35% Calo)', icon: '🍲' },
    { id: 'dinner', title: 'Bữa Tối', subtitle: 'Thanh nhẹ, dễ tiêu (~30% Calo)', icon: '🌙' },
    { id: 'snack', title: 'Bữa Xế & Đồ Uống', subtitle: 'Bổ sung vi khoáng (~10% Calo)', icon: '🥑' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Kế hoạch dinh dưỡng hôm nay</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
              Thực Đơn Cá Nhân Hóa Theo Calo & Bệnh Lý
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Tự động khớp món ăn ngon với mục tiêu <strong>{targetCal} kcal</strong> và tình trạng: 
              {userProfile.conditions.length > 0 ? (
                <span className="ml-1 underline font-semibold">{userProfile.conditions.join(', ')}</span>
              ) : (
                ' Ăn uống khoa học'
              )}.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onAutoGenerateMenu}
              className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Gợi Ý Thực Đơn Tự Động</span>
            </button>

            {allPlannedIds.length > 0 && (
              <button
                type="button"
                onClick={onExportToShoppingList}
                className="px-4 py-2.5 bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Gom Đi Chợ ({allPlannedIds.length} món)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Macro Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Calorie Meter (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="font-bold text-stone-900 text-sm sm:text-base font-serif">
                Tiến Độ Calo Trong Ngày
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${calStatusColor}`}>
              {calStatus}
            </span>
          </div>

          {/* Numbers */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-stone-900">{totalCalories}</span>
              <span className="text-stone-400 text-sm"> / {targetCal} kcal</span>
            </div>
            <div className="text-right text-xs text-stone-500">
              {diffCal >= 0 ? (
                <span>Còn lại: <strong className="text-emerald-700 font-bold">{diffCal} kcal</strong></span>
              ) : (
                <span className="text-rose-600 font-bold">Vượt: {Math.abs(diffCal)} kcal</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calPercent > 110 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(calPercent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>0 kcal</span>
            <span>Mục tiêu: {targetCal} kcal</span>
            <span>{calPercent}% Đạt được</span>
          </div>
        </div>

        {/* Macros Breakdown (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-stone-900 text-sm font-serif">
            Cân Bằng Dinh Dưỡng Đa Lượng
          </h3>

          <div className="space-y-2.5 text-xs">
            {/* Protein */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-600 font-medium">Protein (Đạm)</span>
                <span className="font-bold text-blue-900">{totalProtein}g / {metrics.macros.proteinGrams}g</span>
              </div>
              <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${Math.min((totalProtein / (metrics.macros.proteinGrams || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-600 font-medium">Carbs (Tinh bột)</span>
                <span className="font-bold text-amber-900">{totalCarbs}g / {metrics.macros.carbsGrams}g</span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min((totalCarbs / (metrics.macros.carbsGrams || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-600 font-medium">Lipid (Chất béo)</span>
                <span className="font-bold text-rose-900">{totalFat}g / {metrics.macros.fatGrams}g</span>
              </div>
              <div className="w-full h-2 rounded-full bg-rose-100 overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${Math.min((totalFat / (metrics.macros.fatGrams || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Meal Slots List */}
      <div className="space-y-4">
        {mealSlots.map((slot) => {
          const itemIds = mealPlan[slot.id];
          const slotCalories = itemIds.reduce((sum, id) => {
            const r = recipeMap.get(id);
            return sum + (r ? r.calories : 0);
          }, 0);

          return (
            <div key={slot.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
              
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{slot.icon}</span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base font-serif">
                      {slot.title}
                    </h3>
                    <p className="text-[11px] text-stone-500">{slot.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {slotCalories} kcal
                  </span>
                  <button
                    type="button"
                    onClick={onOpenRecipeCatalog}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors text-xs flex items-center gap-1 font-medium"
                    title="Chọn thêm món vào bữa này"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Thêm món</span>
                  </button>
                </div>
              </div>

              {/* Slot Dishes */}
              {itemIds.length === 0 ? (
                <div 
                  onClick={onOpenRecipeCatalog}
                  className="py-6 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer transition-all space-y-1.5"
                >
                  <Utensils className="w-5 h-5" />
                  <span className="text-xs font-medium">Chưa có món cho {slot.title}. Bấm vào đây để chọn món ngon</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {itemIds.map((recipeId) => {
                    const r = recipeMap.get(recipeId);
                    if (!r) return null;

                    return (
                      <div
                        key={recipeId}
                        className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div 
                          onClick={() => onSelectRecipe(r)}
                          className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
                        >
                          <img
                            src={r.image}
                            alt={r.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-xs text-stone-900 group-hover:text-emerald-700 transition-colors truncate">
                              {r.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                              <span className="text-emerald-700 font-semibold">{r.calories} kcal</span>
                              <span>•</span>
                              <span>{r.prepTime + r.cookTime}p</span>
                            </div>
                          </div>
                        </div>

                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => onRemoveFromMeal(slot.id, recipeId)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                          title="Bỏ món này ra khỏi bữa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
