import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalculatedHealthMetrics, 
  HealthConditionId, 
  MealPlanDay, 
  Recipe, 
  ShoppingItem, 
  UserProfile 
} from './types';
import { calculateMetrics, HEALTH_CONDITIONS } from './utils/nutritionCalculator';
import { RECIPES_DATA } from './data/recipes';
import { Header } from './components/Header';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { HealthProfileModal } from './components/HealthProfileModal';
import { MealPlannerView } from './components/MealPlannerView';
import { ShoppingListView } from './components/ShoppingListView';
import { AIChefModal } from './components/AIChefModal';
import { 
  Search, 
  SlidersHorizontal, 
  HeartPulse, 
  Sparkles, 
  UtensilsCrossed, 
  Check, 
  Flame, 
  Play, 
  ShieldCheck, 
  ArrowUpDown,
  X
} from 'lucide-react';

const STORAGE_KEYS = {
  PROFILE: 'bep_user_profile_v1',
  FAVORITES: 'bep_favorites_v1',
  MEAL_PLAN: 'bep_meal_plan_v1',
  SHOPPING: 'bep_shopping_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  gender: 'female',
  age: 32,
  height: 160,
  weight: 56,
  activityLevel: 'moderate',
  goal: 'maintain',
  conditions: ['diabetes', 'hypertension'],
  dailyCalorieTarget: 1750,
};

export default function App() {
  // 1. User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Calculate live health metrics
  const metrics = useMemo(() => {
    return calculateMetrics(userProfile);
  }, [userProfile]);

  // Keep userProfile.dailyCalorieTarget synced with calculated metrics
  useEffect(() => {
    if (userProfile.dailyCalorieTarget !== metrics.targetCalories) {
      setUserProfile((prev) => ({ ...prev, dailyCalorieTarget: metrics.targetCalories }));
    }
  }, [metrics.targetCalories]);

  // Save profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  }, [userProfile]);

  // 2. Active Tab
  const [currentTab, setCurrentTab] = useState<'recipes' | 'profile' | 'planner' | 'shopping' | 'favorites'>('recipes');

  // 3. Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : ['canh-chua-ca-hoi', 'uc-ga-nuong-mat-ong-chanh'];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }, [favorites]);

  const toggleFavorite = (recipeId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(recipeId);
      const updated = exists ? prev.filter((id) => id !== recipeId) : [...prev, recipeId];
      showToast(exists ? 'Đã bỏ lưu món ăn' : 'Đã lưu vào danh sách yêu thích');
      return updated;
    });
  };

  // 4. Meal Plan State
  const [mealPlan, setMealPlan] = useState<MealPlanDay>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEAL_PLAN);
      return saved ? JSON.parse(saved) : {
        date: new Date().toISOString().split('T')[0],
        breakfast: ['pho-ga-gao-lut-thanh-trong'],
        lunch: ['canh-chua-ca-hoi', 'ca-hap-gung-hanh-xi-dau'],
        dinner: ['uc-ga-nuong-mat-ong-chanh'],
        snack: ['sinh-to-xanh-kale-bo-chia'],
      };
    } catch {
      return {
        date: new Date().toISOString().split('T')[0],
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEAL_PLAN, JSON.stringify(mealPlan));
    } catch (e) {
      console.error('Failed to save meal plan:', e);
    }
  }, [mealPlan]);

  // 5. Shopping List State
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOPPING);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(shoppingList));
    } catch (e) {
      console.error('Failed to save shopping list:', e);
    }
  }, [shoppingList]);

  // 6. UI Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealCategory, setSelectedMealCategory] = useState<string>('all');
  const [selectedConditionFilter, setSelectedConditionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'calories_asc' | 'calories_desc' | 'time_asc'>('recommended');

  // 7. Modals State
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAIChefModalOpen, setIsAIChefModalOpen] = useState(false);

  // 8. Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Planned Calories calculation
  const recipeMap = useMemo(() => new Map(RECIPES_DATA.map((r) => [r.id, r])), []);
  const plannedCalories = useMemo(() => {
    const allIds = [
      ...mealPlan.breakfast,
      ...mealPlan.lunch,
      ...mealPlan.dinner,
      ...mealPlan.snack,
    ];
    return allIds.reduce((sum, id) => {
      const r = recipeMap.get(id);
      return sum + (r ? r.calories : 0);
    }, 0);
  }, [mealPlan, recipeMap]);

  // Add recipe to Shopping List
  const handleAddToShoppingList = (recipe: Recipe, servings: number) => {
    const ratio = servings / (recipe.servings || 2);
    const newItems: ShoppingItem[] = recipe.ingredients.map((ing) => ({
      id: `${recipe.id}-${ing.name}-${Date.now()}-${Math.random()}`,
      name: ing.name,
      amount: Number((ing.amount * ratio).toFixed(1)),
      unit: ing.unit,
      category: ing.category,
      checked: false,
      recipeSource: recipe.title,
    }));

    setShoppingList((prev) => [...prev, ...newItems]);
    showToast(`Đã thêm ${newItems.length} nguyên liệu của món "${recipe.title}" vào danh sách đi chợ!`);
  };

  // Add recipe to Meal Plan slot
  const handleAddToMealPlan = (recipe: Recipe, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setMealPlan((prev) => {
      const currentList = prev[mealType];
      if (currentList.includes(recipe.id)) {
        showToast(`Món này đã có trong ${mealType === 'breakfast' ? 'bữa sáng' : mealType === 'lunch' ? 'bữa trưa' : mealType === 'dinner' ? 'bữa tối' : 'bữa xế'}!`);
        return prev;
      }
      showToast(`Đã thêm món "${recipe.title}" vào ${mealType === 'breakfast' ? 'bữa sáng' : mealType === 'lunch' ? 'bữa trưa' : mealType === 'dinner' ? 'bữa tối' : 'bữa xế'}!`);
      return {
        ...prev,
        [mealType]: [...currentList, recipe.id],
      };
    });
  };

  // Quick add to meal from card
  const handleQuickAddToMeal = (recipe: Recipe) => {
    // Automatically pick suitable slot or default to lunch/dinner
    let targetSlot: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch';
    if (recipe.category === 'breakfast') targetSlot = 'breakfast';
    else if (recipe.category === 'dinner' || recipe.category === 'soup') targetSlot = 'dinner';
    else if (recipe.category === 'drink' || recipe.category === 'snack') targetSlot = 'snack';

    handleAddToMealPlan(recipe, targetSlot);
  };

  // Remove from meal slot
  const handleRemoveFromMeal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', recipeId: string) => {
    setMealPlan((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((id) => id !== recipeId),
    }));
    showToast('Đã xóa món khỏi thực đơn.');
  };

  // Auto-generate balanced daily menu matching user's health & calories
  const handleAutoGenerateMenu = () => {
    // Find recipes matching user conditions
    const suitablePool = RECIPES_DATA.filter((r) => {
      if (userProfile.conditions.length === 0) return true;
      return userProfile.conditions.some((c) => r.suitableFor.includes(c));
    });

    const breakfastOptions = (suitablePool.length > 0 ? suitablePool : RECIPES_DATA).filter(
      (r) => r.category === 'breakfast' || r.calories < 300
    );
    const lunchOptions = (suitablePool.length > 0 ? suitablePool : RECIPES_DATA).filter(
      (r) => r.category === 'lunch' || (r.calories >= 250 && r.calories <= 450)
    );
    const dinnerOptions = (suitablePool.length > 0 ? suitablePool : RECIPES_DATA).filter(
      (r) => r.category === 'dinner' || r.category === 'soup'
    );
    const snackOptions = (suitablePool.length > 0 ? suitablePool : RECIPES_DATA).filter(
      (r) => r.category === 'drink' || r.category === 'snack' || r.calories <= 220
    );

    const b = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)] || RECIPES_DATA[3];
    const l = lunchOptions[Math.floor(Math.random() * lunchOptions.length)] || RECIPES_DATA[1];
    const d = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)] || RECIPES_DATA[0];
    const s = snackOptions[Math.floor(Math.random() * snackOptions.length)] || RECIPES_DATA[6];

    setMealPlan({
      date: new Date().toISOString().split('T')[0],
      breakfast: [b.id],
      lunch: [l.id],
      dinner: [d.id],
      snack: [s.id],
    });

    showToast('✨ Đã tự động tạo thực đơn chuẩn y khoa phù hợp với lượng calo & thể trạng của bạn!');
  };

  // Export all planned items to shopping list
  const handleExportToShoppingList = () => {
    const allIds = [
      ...mealPlan.breakfast,
      ...mealPlan.lunch,
      ...mealPlan.dinner,
      ...mealPlan.snack,
    ];

    const newItems: ShoppingItem[] = [];
    allIds.forEach((id) => {
      const r = recipeMap.get(id);
      if (r) {
        r.ingredients.forEach((ing) => {
          newItems.push({
            id: `${r.id}-${ing.name}-${Date.now()}-${Math.random()}`,
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            category: ing.category,
            checked: false,
            recipeSource: r.title,
          });
        });
      }
    });

    setShoppingList((prev) => [...prev, ...newItems]);
    showToast(`Đã xuất ${newItems.length} nguyên liệu của thực đơn hôm nay vào danh sách đi chợ!`);
    setCurrentTab('shopping');
  };

  // Filter & Sort Recipes
  const filteredRecipes = useMemo(() => {
    let list = [...RECIPES_DATA];

    // If favorites tab
    if (currentTab === 'favorites') {
      list = list.filter((r) => favorites.includes(r.id));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => 
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    // Meal Category
    if (selectedMealCategory !== 'all') {
      list = list.filter((r) => r.category === selectedMealCategory);
    }

    // Health condition filter
    if (selectedConditionFilter === 'my_health') {
      if (userProfile.conditions.length > 0) {
        list = list.filter((r) => 
          userProfile.conditions.some((c) => r.suitableFor.includes(c))
        );
      }
    } else if (selectedConditionFilter !== 'all') {
      list = list.filter((r) => 
        r.suitableFor.includes(selectedConditionFilter as HealthConditionId)
      );
    }

    // Sorting
    if (sortBy === 'calories_asc') {
      list.sort((a, b) => a.calories - b.calories);
    } else if (sortBy === 'calories_desc') {
      list.sort((a, b) => b.calories - a.calories);
    } else if (sortBy === 'time_asc') {
      list.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
    } else {
      // 'recommended': prioritize matching user conditions
      list.sort((a, b) => {
        const aMatches = userProfile.conditions.filter((c) => a.suitableFor.includes(c)).length;
        const bMatches = userProfile.conditions.filter((c) => b.suitableFor.includes(c)).length;
        return bMatches - aMatches;
      });
    }

    return list;
  }, [
    searchQuery, 
    selectedMealCategory, 
    selectedConditionFilter, 
    sortBy, 
    userProfile.conditions, 
    currentTab, 
    favorites
  ]);

  return (
    <div className="min-h-screen bg-stone-50/60 text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-bounce border border-stone-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userProfile={userProfile}
        metrics={metrics}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAIChefModal={() => setIsAIChefModalOpen(true)}
        shoppingCount={shoppingList.filter((i) => !i.checked).length}
        favoritesCount={favorites.length}
        plannedCalories={plannedCalories}
      />

      {/* Main Body Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        
        {/* VIEW 1: RECIPES CATALOG & FAVORITES */}
        {(currentTab === 'recipes' || currentTab === 'favorites') && (
          <div className="space-y-6">
            
            {/* Hero Banner with Health Metrics Callout */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-stone-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold border border-white/10">
                  <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dinh Dưỡng Cá Nhân Hóa & Công Thức Chuẩn Y Khoa</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif leading-tight">
                  Nấu Ngon Chuẩn Vị, Khỏe Đẹp Theo Thể Trạng Của Bạn
                </h1>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
                  Video hướng dẫn chi tiết từng bước, định lượng chuẩn xác, tự động tính toán calo tiêu thụ và điều chỉnh công thức an toàn cho người tiểu đường, cao huyết áp, đau dạ dày và gút.
                </p>

                {/* Health Metrics Strip Inside Banner */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
                  <div 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 cursor-pointer backdrop-blur-md border border-white/20 transition-colors"
                  >
                    <span className="text-stone-300">Thể trạng:</span>
                    <strong className="text-white">{metrics.bmiCategory} (BMI {metrics.bmi})</strong>
                  </div>

                  <div 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/40 cursor-pointer backdrop-blur-md border border-emerald-400/30 transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>Calo mục tiêu: <strong>{metrics.targetCalories} kcal/ngày</strong></span>
                  </div>

                  {userProfile.conditions.length > 0 && (
                    <div 
                      onClick={() => setIsProfileModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/30 hover:bg-rose-500/40 cursor-pointer backdrop-blur-md border border-rose-400/30 transition-colors text-[11px]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-300" />
                      <span>{userProfile.conditions.length} chế độ bệnh lý đã kích hoạt</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="underline text-emerald-200 hover:text-white font-medium text-xs ml-1"
                  >
                    Thay đổi chỉ số
                  </button>
                </div>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
              
              {/* Row 1: Search & Sort */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Tìm món ăn, nguyên liệu (vd: cá hồi, ức gà, gạo lứt, canh chua...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-stone-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="recommended">Gợi ý phù hợp nhất</option>
                    <option value="calories_asc">Calo: Thấp đến cao</option>
                    <option value="calories_desc">Calo: Cao đến thấp</option>
                    <option value="time_asc">Nấu nhanh nhất</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Health Conditions & Dietary Filters */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                  <span>Lọc theo bệnh lý & sức khỏe:</span>
                  {selectedConditionFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedConditionFilter('all')}
                      className="text-emerald-700 hover:underline capitalize"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  
                  {/* All */}
                  <button
                    type="button"
                    onClick={() => setSelectedConditionFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedConditionFilter === 'all'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    Tất Cả
                  </button>

                  {/* My Health filter */}
                  {userProfile.conditions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedConditionFilter('my_health')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        selectedConditionFilter === 'my_health'
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Phù Hợp Với Tôi ({userProfile.conditions.length} bệnh lý)</span>
                    </button>
                  )}

                  {/* Individual conditions */}
                  {HEALTH_CONDITIONS.map((cond) => {
                    const isActive = selectedConditionFilter === cond.id;
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setSelectedConditionFilter(cond.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {cond.name.split('/')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Meal Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-stone-100 text-xs">
                {[
                  { id: 'all', label: 'Tất cả bữa ăn' },
                  { id: 'breakfast', label: 'Bữa Sáng ☀️' },
                  { id: 'lunch', label: 'Bữa Trưa 🍲' },
                  { id: 'dinner', label: 'Bữa Tối 🌙' },
                  { id: 'soup', label: 'Canh & Súp 🥣' },
                  { id: 'drink', label: 'Sinh Tố & Thức Uống 🥑' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedMealCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                      selectedMealCategory === cat.id
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Recipe Grid Header Info */}
            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <span>
                Tìm thấy <strong>{filteredRecipes.length}</strong> công thức nấu ăn ngon
              </span>
              {currentTab === 'favorites' && (
                <span className="font-medium text-rose-600">Đang xem các món đã lưu</span>
              )}
            </div>

            {/* Recipes Grid */}
            {filteredRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
                <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-base font-bold text-stone-800 font-serif">
                  Không tìm thấy công thức phù hợp
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc bệnh lý để xem đầy đủ công thức.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMealCategory('all');
                    setSelectedConditionFilter('all');
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    userProfile={userProfile}
                    isFavorite={favorites.includes(recipe.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelectRecipe={setSelectedRecipe}
                    onQuickAddToMeal={handleQuickAddToMeal}
                    isPlannedToday={[
                      ...mealPlan.breakfast,
                      ...mealPlan.lunch,
                      ...mealPlan.dinner,
                      ...mealPlan.snack,
                    ].includes(recipe.id)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: MEAL PLANNER */}
        {currentTab === 'planner' && (
          <MealPlannerView
            mealPlan={mealPlan}
            recipes={RECIPES_DATA}
            userProfile={userProfile}
            metrics={metrics}
            onRemoveFromMeal={handleRemoveFromMeal}
            onAutoGenerateMenu={handleAutoGenerateMenu}
            onExportToShoppingList={handleExportToShoppingList}
            onSelectRecipe={setSelectedRecipe}
            onOpenRecipeCatalog={() => setCurrentTab('recipes')}
          />
        )}

        {/* VIEW 3: SHOPPING LIST */}
        {currentTab === 'shopping' && (
          <ShoppingListView
            items={shoppingList}
            onToggleItem={(id) => {
              setShoppingList((prev) =>
                prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
              );
            }}
            onRemoveItem={(id) => {
              setShoppingList((prev) => prev.filter((it) => it.id !== id));
            }}
            onAddItem={(name, amount, unit, category) => {
              setShoppingList((prev) => [
                ...prev,
                {
                  id: `custom-${Date.now()}`,
                  name,
                  amount,
                  unit,
                  category,
                  checked: false,
                  recipeSource: 'Tự thêm',
                },
              ]);
              showToast(`Đã thêm "${name}" vào danh sách đi chợ!`);
            }}
            onClearChecked={() => {
              setShoppingList((prev) => prev.filter((it) => !it.checked));
              showToast('Đã xóa các món đã mua.');
            }}
            onClearAll={() => {
              setShoppingList([]);
              showToast('Đã làm trống danh sách đi chợ.');
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-stone-900 font-serif">
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              <span>Bếp Sống Khỏe</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Ứng dụng gợi ý công thức nấu ăn ngon, video từng bước và dinh dưỡng cá nhân hóa chuẩn y khoa.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setIsProfileModalOpen(true)} className="hover:text-emerald-700">
              Hồ sơ sức khỏe & Calo
            </button>
            <span>•</span>
            <button onClick={() => setIsAIChefModalOpen(true)} className="hover:text-emerald-700">
              Hỏi Bác Sĩ Dinh Dưỡng
            </button>
            <span>•</span>
            <button onClick={() => setCurrentTab('recipes')} className="hover:text-emerald-700">
              Kho Công Thức
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Health Profile & Calorie Calculator Modal */}
      <HealthProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={(updated) => {
          setUserProfile(updated);
          showToast('Hồ sơ sức khỏe đã được cập nhật thành công!');
        }}
      />

      {/* 2. Recipe Detail with Video & Cooking Mode Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        userProfile={userProfile}
        isFavorite={selectedRecipe ? favorites.includes(selectedRecipe.id) : false}
        onToggleFavorite={toggleFavorite}
        onAddToShoppingList={handleAddToShoppingList}
        onAddToMealPlan={handleAddToMealPlan}
      />

      {/* 3. AI Clinical Nutritionist & Chef Chat Modal */}
      <AIChefModal
        isOpen={isAIChefModalOpen}
        onClose={() => setIsAIChefModalOpen(false)}
        userProfile={userProfile}
        currentRecipe={selectedRecipe}
      />

    </div>
  );
}
