export type Gender = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'     // Ít vận động, ngồi văn phòng
  | 'light'         // Vận động nhẹ 1-3 ngày/tuần
  | 'moderate'      // Vận động vừa phải 3-5 ngày/tuần
  | 'active'        // Vận động nhiều 6-7 ngày/tuần
  | 'extra_active'; // Vận động cường độ cao, lao động nặng

export type Goal =
  | 'lose_weight_fast'  // Giảm cân nhanh an toàn (-500 kcal)
  | 'lose_weight_mild'  // Giảm mỡ từ từ (-300 kcal)
  | 'maintain'          // Duy trì cân nặng
  | 'gain_muscle'       // Tăng cơ nạc (+250 kcal)
  | 'gain_weight';      // Tăng cân (+400 kcal)

export type HealthConditionId =
  | 'diabetes'        // Tiểu đường / Tiền tiểu đường
  | 'hypertension'    // Cao huyết áp / Bệnh tim mạch
  | 'cardiovascular'  // Mỡ máu cao / Xơ vữa động mạch
  | 'gastritis'       // Đau dạ dày / Trào ngược dạ dày (GERD)
  | 'gout'            // Bệnh gút (Axit uric cao)
  | 'kidney'          // Bệnh thận / Cần giảm gánh nặng lọc
  | 'overweight'      // Béo phì / Thừa cân
  | 'fitness'         // Thể hình / Gymer tăng cơ
  | 'vegetarian'      // Ăn chay (chay có trứng, sữa)
  | 'vegan'           // Thuần chay (100% thực vật)
  | 'keto'            // Keto / Low carb
  | 'eat_clean';      // Eat clean / Thực dưỡng tự nhiên

export interface HealthCondition {
  id: HealthConditionId;
  name: string;
  shortDesc: string;
  iconName: string;
  colorClass: string;
  dietaryRule: string;
}

export interface UserProfile {
  name?: string;
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  goal: Goal;
  conditions: HealthConditionId[];
  dailyCalorieTarget?: number;
}

export interface CalculatedHealthMetrics {
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetWaterMl: number;
  macros: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
  };
  sodiumLimitMg: number;
  fiberTargetGrams: number;
  dietaryRecommendations: string[];
  warnings: string[];
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: 'meat_seafood' | 'vegetable' | 'grain' | 'seasoning' | 'dairy_egg' | 'other';
  notes?: string;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  description: string;
  videoTimestamp?: number; // seconds from start of video
  durationSeconds?: number; // cooking timer
  tips?: string;
}

export interface NutritionFacts {
  calories: number; // kcal per serving
  protein: number;  // g
  carbs: number;    // g
  fat: number;      // g
  fiber: number;    // g
  sodium: number;   // mg
  sugar?: number;   // g
  giIndex: 'Thấp' | 'Trung bình' | 'Cao';
}

export interface CautionNote {
  condition: HealthConditionId;
  note: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'soup' | 'snack' | 'drink';
  cuisine: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: 'Dễ' | 'Trung bình' | 'Nâng cao';
  calories: number;
  servings: number; // default baseline servings
  image: string;
  videoUrl: string; // YouTube embed URL
  videoId: string;
  videoDuration: string;
  tags: string[];
  suitableFor: HealthConditionId[];
  cautionFor?: CautionNote[];
  nutrition: NutritionFacts;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  healthHighlights: string[];
  chefTips: string;
}

export interface MealPlanDay {
  date: string;
  breakfast: string[]; // recipe ids
  lunch: string[];
  dinner: string[];
  snack: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: 'meat_seafood' | 'vegetable' | 'grain' | 'seasoning' | 'dairy_egg' | 'other';
  checked: boolean;
  recipeSource: string;
}
