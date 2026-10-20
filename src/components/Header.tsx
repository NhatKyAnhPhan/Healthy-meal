import React from 'react';
import { CalculatedHealthMetrics, UserProfile } from '../types';
import { 
  UtensilsCrossed, 
  HeartPulse, 
  Calendar, 
  ShoppingCart, 
  Sparkles, 
  Flame, 
  Activity, 
  Bookmark,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'recipes' | 'profile' | 'planner' | 'shopping' | 'favorites';
  setCurrentTab: (tab: 'recipes' | 'profile' | 'planner' | 'shopping' | 'favorites') => void;
  userProfile: UserProfile;
  metrics: CalculatedHealthMetrics;
  onOpenProfileModal: () => void;
  onOpenAIChefModal: () => void;
  shoppingCount: number;
  favoritesCount: number;
  plannedCalories: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userProfile,
  metrics,
  onOpenProfileModal,
  onOpenAIChefModal,
  shoppingCount,
  favoritesCount,
  plannedCalories,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentTab('recipes')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-stone-900 tracking-tight font-serif">
                  Bếp Sống Khỏe
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 tracking-wider">
                  Dinh Dưỡng Y Khoa
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden md:block">
                Công thức ngon • Video từng bước • Cá nhân hóa calo & bệnh lý
              </p>
            </div>
          </div>

          {/* User Health Summary Pill - Clickable to open profile */}
          <div 
            onClick={onOpenProfileModal}
            className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-stone-50 border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer transition-all text-xs"
            title="Bấm để chỉnh sửa chỉ số cơ thể & bệnh lý"
          >
            <div className="flex items-center gap-1.5 font-medium text-stone-700">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>BMI: <strong>{metrics.bmi}</strong></span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${metrics.bmiColor}`}>
                {metrics.bmiCategory}
              </span>
            </div>
            <div className="w-px h-3.5 bg-stone-300" />
            <div className="flex items-center gap-1.5 font-medium text-stone-700">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Mục tiêu: <strong className="text-emerald-700">{metrics.targetCalories}</strong> kcal</span>
            </div>
            {userProfile.conditions.length > 0 && (
              <>
                <div className="w-px h-3.5 bg-stone-300" />
                <span className="text-[11px] px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-medium">
                  {userProfile.conditions.length} bệnh lý/chế độ
                </span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAIChefModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-sm hover:from-teal-600 hover:to-emerald-700 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">Hỏi Bác Sĩ & Đầu Bếp AI</span>
              <span className="sm:hidden">AI Chef</span>
            </button>

            {/* Health Profile Edit Button (Mobile/Tablet) */}
            <button
              onClick={onOpenProfileModal}
              className="lg:hidden p-2 rounded-xl text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
              title="Hồ sơ sức khỏe"
            >
              <HeartPulse className="w-5 h-5 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 border-t border-stone-100 text-xs sm:text-sm">
          
          <button
            onClick={() => setCurrentTab('recipes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              currentTab === 'recipes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Kho Công Thức ({10}+ món)</span>
          </button>

          <button
            onClick={() => setCurrentTab('planner')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              currentTab === 'planner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Thực Đơn Ngày</span>
            {plannedCalories > 0 && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
                currentTab === 'planner' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {plannedCalories} kcal
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('shopping')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              currentTab === 'shopping'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Danh Sách Đi Chợ</span>
            {shoppingCount > 0 && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === 'shopping' ? 'bg-emerald-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {shoppingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('favorites')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              currentTab === 'favorites'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Món Đã Lưu ({favoritesCount})</span>
          </button>

          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-stone-600 hover:bg-stone-100 transition-colors shrink-0"
          >
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span>Tính Calo & Bệnh Lý</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
