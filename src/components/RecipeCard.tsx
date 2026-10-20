import React from 'react';
import { Recipe, UserProfile } from '../types';
import { 
  Clock, 
  Flame, 
  Play, 
  Bookmark, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Check,
  ChefHat
} from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  userProfile: UserProfile;
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onQuickAddToMeal: (recipe: Recipe) => void;
  isPlannedToday: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  userProfile,
  isFavorite,
  onToggleFavorite,
  onSelectRecipe,
  onQuickAddToMeal,
  isPlannedToday,
}) => {
  // Check if recipe is suitable for user's selected conditions
  const matchedConditions = userProfile.conditions.filter((cond) =>
    recipe.suitableFor.includes(cond)
  );

  // Check if any caution applies to user's conditions
  const relevantCautions = recipe.cautionFor?.filter((caution) =>
    userProfile.conditions.includes(caution.condition)
  ) || [];

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden flex flex-col">
      
      {/* Thumbnail + Video Badge + Quick Favorite */}
      <div 
        onClick={() => onSelectRecipe(recipe)}
        className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 cursor-pointer"
      >
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-black/20 pointer-events-none" />

        {/* Video badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
          <Play className="w-3 h-3 fill-red-500 text-red-500" />
          <span>Video ({recipe.videoDuration})</span>
        </div>

        {/* Calorie Badge on top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-stone-900 text-xs font-bold shadow-sm">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{recipe.calories} kcal</span>
        </div>

        {/* Favorite Button on top right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-white/85 text-stone-700 hover:bg-white hover:text-rose-500'
          }`}
          title={isFavorite ? 'Bỏ lưu' : 'Lưu vào danh sách yêu thích'}
        >
          <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* GI Index Badge */}
        <div className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/90 text-stone-800 backdrop-blur-md border border-stone-200">
          GI {recipe.nutrition.giIndex}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-2">
          
          {/* Metadata Row: Cook Time & Cuisine */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {recipe.cuisine}
            </span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{recipe.prepTime + recipe.cookTime} phút</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectRecipe(recipe)}
            className="font-bold text-stone-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors cursor-pointer font-serif"
          >
            {recipe.title}
          </h3>

          {/* Subtitle / clinical benefit */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {recipe.subtitle}
          </p>
        </div>

        {/* Health Tags & Cautions */}
        <div className="space-y-1.5 pt-1">
          {/* Matched condition pill */}
          {matchedConditions.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Phù hợp thể trạng của bạn</span>
            </div>
          )}

          {/* Relevant caution note if any */}
          {relevantCautions.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{relevantCautions[0].note}</span>
            </div>
          )}

          {/* Nutrition Mini Row */}
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-stone-100 text-center text-[11px] text-stone-600">
            <div className="bg-stone-50 py-1 rounded">
              <span className="text-stone-400 block text-[9px] uppercase font-bold">Đạm</span>
              <strong className="text-stone-800">{recipe.nutrition.protein}g</strong>
            </div>
            <div className="bg-stone-50 py-1 rounded">
              <span className="text-stone-400 block text-[9px] uppercase font-bold">Carb</span>
              <strong className="text-stone-800">{recipe.nutrition.carbs}g</strong>
            </div>
            <div className="bg-stone-50 py-1 rounded">
              <span className="text-stone-400 block text-[9px] uppercase font-bold">Béo</span>
              <strong className="text-stone-800">{recipe.nutrition.fat}g</strong>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center gap-2">
          
          <button
            type="button"
            onClick={() => onSelectRecipe(recipe)}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-emerald-600 hover:text-white text-stone-800 transition-all flex items-center justify-center gap-1.5"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Xem công thức & video</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAddToMeal(recipe);
            }}
            className={`p-2 rounded-xl transition-all border ${
              isPlannedToday
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
            }`}
            title={isPlannedToday ? 'Đã có trong thực đơn hôm nay' : 'Thêm nhanh vào thực đơn'}
          >
            {isPlannedToday ? (
              <Check className="w-4 h-4 text-emerald-700" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>

        </div>

      </div>

    </div>
  );
};
