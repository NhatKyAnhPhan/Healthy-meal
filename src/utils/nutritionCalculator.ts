import { CalculatedHealthMetrics, HealthCondition, HealthConditionId, UserProfile } from '../types';

export const HEALTH_CONDITIONS: HealthCondition[] = [
  {
    id: 'diabetes',
    name: 'Tiểu đường / Tiền tiểu đường',
    shortDesc: 'Kiểm soát đường huyết, tinh bột chuyển hóa chậm (GI thấp)',
    iconName: 'Activity',
    colorClass: 'bg-amber-100 text-amber-800 border-amber-200',
    dietaryRule: 'Giảm carbohydrate tinh chế, chia nhỏ bữa ăn, ưu tiên chất xơ hòa tan.',
  },
  {
    id: 'hypertension',
    name: 'Cao huyết áp / Tim mạch',
    shortDesc: 'Chế độ DASH, kiểm soát Natri (<1500mg), giàu Kali & Magie',
    iconName: 'HeartPulse',
    colorClass: 'bg-rose-100 text-rose-800 border-rose-200',
    dietaryRule: 'Hạn chế muối và nước mắm mặn, ăn nhiều chuối, rau xanh lá, cá béo giàu omega-3.',
  },
  {
    id: 'cardiovascular',
    name: 'Mỡ máu cao / Xơ vữa',
    shortDesc: 'Hạn chế chất béo bão hòa, tăng chất béo tốt không bão hòa',
    iconName: 'ShieldAlert',
    colorClass: 'bg-red-100 text-red-800 border-red-200',
    dietaryRule: 'Bỏ da mỡ động vật, dùng dầu oliu, dầu hạt lanh, ăn nhiều yến mạch và đậu.',
  },
  {
    id: 'gastritis',
    name: 'Dạ dày / Trào ngược dạ dày (GERD)',
    shortDesc: 'Thức ăn mềm, dễ tiêu hóa, chống viêm niêm mạc',
    iconName: 'Flame',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-200',
    dietaryRule: 'Tuyệt đối tránh chua, cay nóng, chiên ngập dầu; không ăn quá no sát giờ ngủ.',
  },
  {
    id: 'gout',
    name: 'Bệnh Gút (Axit Uric cao)',
    shortDesc: 'Kiêng thực phẩm giàu nhân purin, đào thải axit uric',
    iconName: 'AlertCircle',
    colorClass: 'bg-purple-100 text-purple-800 border-purple-200',
    dietaryRule: 'Hạn chế tối đa thịt đỏ, lòng mề nội tạng, hải sản đậm, uống từ 2.5 - 3L nước.',
  },
  {
    id: 'kidney',
    name: 'Bệnh thận mạn / Giảm tải lọc',
    shortDesc: 'Kiểm soát chặt chẽ lượng đạm, natri, photpho và kali',
    iconName: 'Filter',
    colorClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    dietaryRule: 'Ưu tiên đạm sinh học cao với số lượng vừa đủ theo chỉ định, giảm mặn.',
  },
  {
    id: 'overweight',
    name: 'Giảm cân / Thâm hụt calo',
    shortDesc: 'Đốt mỡ tự nhiên, no lâu không đói cồn cào',
    iconName: 'TrendingDown',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dietaryRule: 'Tạo thâm hụt năng lượng 300-500 kcal, tăng cường protein nạc và rau củ.',
  },
  {
    id: 'fitness',
    name: 'Tập Gym / Tăng cơ săn chắc',
    shortDesc: 'Hàm lượng protein cao (1.8-2.2g/kg) phục hồi sợi cơ',
    iconName: 'Dumbbell',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-200',
    dietaryRule: 'Bổ sung protein sau tập, carb phức hợp cung cấp năng lượng tập luyện bền bỉ.',
  },
  {
    id: 'vegetarian',
    name: 'Ăn chay lành mạnh',
    shortDesc: 'Chế độ thực vật phong phú, đủ đạm và vi chất',
    iconName: 'Leaf',
    colorClass: 'bg-lime-100 text-lime-800 border-lime-200',
    dietaryRule: 'Phối hợp các loại đậu đỗ, nấm, hạt dinh dưỡng và ngũ cốc nguyên cám để đủ acid amin.',
  },
  {
    id: 'eat_clean',
    name: 'Eat Clean / Thực dưỡng nguyên bản',
    shortDesc: 'Ít chế biến, tối giản gia vị công nghiệp, tươi ngon',
    iconName: 'Sparkles',
    colorClass: 'bg-teal-100 text-teal-800 border-teal-200',
    dietaryRule: 'Nói không với chất bảo quản, đường tinh luyện, ưu tiên hấp, luộc, áp chảo.',
  },
  {
    id: 'keto',
    name: 'Keto / Low-Carb',
    shortDesc: 'Hạn chế tối đa tinh bột, kích hoạt trạng thái ketosis',
    iconName: 'Zap',
    colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dietaryRule: 'Carb dưới 30g/ngày, bổ sung chất béo tốt từ bơ, quả bơ, hạt óc chó, dầu dừa.',
  },
];

export function calculateMetrics(profile: UserProfile): CalculatedHealthMetrics {
  const { gender, age, height, weight, activityLevel, goal, conditions } = profile;

  // 1. BMI (Asian-Pacific Standard)
  const heightM = height / 100;
  const bmi = Number((weight / (heightM * heightM)).toFixed(1));
  let bmiCategory = 'Bình thường';
  let bmiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';

  if (bmi < 18.5) {
    bmiCategory = 'Thiếu cân (Gầy)';
    bmiColor = 'text-amber-600 bg-amber-50 border-amber-200';
  } else if (bmi <= 22.9) {
    bmiCategory = 'Thể trạng lý tưởng';
    bmiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  } else if (bmi <= 24.9) {
    bmiCategory = 'Thừa cân (Tiền béo phì)';
    bmiColor = 'text-orange-600 bg-orange-50 border-orange-200';
  } else {
    bmiCategory = 'Béo phì';
    bmiColor = 'text-rose-600 bg-rose-50 border-rose-200';
  }

  // 2. BMR (Mifflin-St Jeor)
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  bmr = Math.round(bmr);

  // 3. TDEE
  const activityFactors: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extra_active: 1.9,
  };
  const factor = activityFactors[activityLevel] || 1.2;
  const tdee = Math.round(bmr * factor);

  // 4. Target Calories based on Goal
  let targetCalories = tdee;
  if (goal === 'lose_weight_fast') {
    targetCalories = Math.round(tdee - 500);
  } else if (goal === 'lose_weight_mild') {
    targetCalories = Math.round(tdee - 300);
  } else if (goal === 'maintain') {
    targetCalories = tdee;
  } else if (goal === 'gain_muscle') {
    targetCalories = Math.round(tdee + 250);
  } else if (goal === 'gain_weight') {
    targetCalories = Math.round(tdee + 450);
  }

  // Safety floor
  const minSafe = gender === 'male' ? 1400 : 1200;
  if (targetCalories < minSafe) {
    targetCalories = minSafe;
  }

  // 5. Macro Distribution
  let proteinPercent = 25;
  let carbsPercent = 50;
  let fatPercent = 25;

  if (conditions.includes('keto')) {
    carbsPercent = 5;
    proteinPercent = 25;
    fatPercent = 70;
  } else if (conditions.includes('fitness') || goal === 'gain_muscle') {
    proteinPercent = 30;
    carbsPercent = 45;
    fatPercent = 25;
  } else if (conditions.includes('diabetes')) {
    proteinPercent = 28;
    carbsPercent = 42;
    fatPercent = 30;
  } else if (conditions.includes('overweight') || goal === 'lose_weight_fast') {
    proteinPercent = 30;
    carbsPercent = 40;
    fatPercent = 30;
  } else if (conditions.includes('kidney')) {
    proteinPercent = 15;
    carbsPercent = 60;
    fatPercent = 25;
  }

  const proteinGrams = Math.round((targetCalories * (proteinPercent / 100)) / 4);
  const carbsGrams = Math.round((targetCalories * (carbsPercent / 100)) / 4);
  const fatGrams = Math.round((targetCalories * (fatPercent / 100)) / 9);

  // 6. Water intake
  let targetWaterMl = Math.round(weight * 35);
  if (activityLevel === 'moderate') targetWaterMl += 300;
  if (activityLevel === 'active' || activityLevel === 'extra_active') targetWaterMl += 600;
  if (conditions.includes('gout')) targetWaterMl = Math.max(targetWaterMl, 2800);

  // 7. Sodium limit
  let sodiumLimitMg = 2300;
  if (conditions.includes('hypertension') || conditions.includes('cardiovascular')) {
    sodiumLimitMg = 1500;
  } else if (conditions.includes('kidney')) {
    sodiumLimitMg = 1800;
  }

  // 8. Fiber target
  let fiberTargetGrams = gender === 'male' ? 35 : 28;
  if (conditions.includes('diabetes') || conditions.includes('cardiovascular')) {
    fiberTargetGrams = Math.max(fiberTargetGrams, 35);
  }

  // 9. Recommendations & Warnings
  const dietaryRecommendations: string[] = [];
  const warnings: string[] = [];

  if (conditions.includes('diabetes')) {
    dietaryRecommendations.push('Ưu tiên tinh bột có chỉ số GI thấp: Gạo lứt, yến mạch nguyên hạt, khoai lang luộc.');
    dietaryRecommendations.push('Tránh uống nước ép hoa quả lọc bã; hãy ăn cả quả nguyên miếng để có chất xơ.');
    warnings.push('Hạn chế tối đa bánh kẹo ngọt, nước ngọt có ga và trái cây chỉ số đường huyết cao (sầu riêng, nhãn, mít).');
  }

  if (conditions.includes('hypertension')) {
    dietaryRecommendations.push('Áp dụng chế độ DASH: Giàu Kali từ rau xanh, chuối, khoai tây, nấm và hạt dinh dưỡng.');
    warnings.push('Cảnh báo Natri: Giới hạn dưới 1500mg Natri/ngày (tương đương 1 thìa cà phê muối gạt). Tránh dưa cà muối mặn, mì tôm.');
  }

  if (conditions.includes('gastritis')) {
    dietaryRecommendations.push('Chia nhỏ bữa ăn làm 4-5 bữa trong ngày để dịch vị dạ dày không bào mòn niêm mạc.');
    dietaryRecommendations.push('Món ăn nên nấu mềm, hầm kỹ, ấm nóng vừa phải (tránh quá nóng hoặc quá lạnh).');
    warnings.push('Tránh thức ăn có vị chua mạnh (chanh, giấm), cay nồng (ớt, hạt tiêu nhiều) và không uống rượu bia, cà phê đặc.');
  }

  if (conditions.includes('gout')) {
    dietaryRecommendations.push('Uống nhiều nước lọc (tối thiểu 2.5 lít/ngày) để tăng đào thải acid uric qua đường tiết niệu.');
    warnings.push('Kiêng thịt đỏ (bò, dê, cừu), nội tạng động vật, tôm cua ghẹ biển đậm và nước hầm xương đậm đặc.');
  }

  if (conditions.includes('cardiovascular')) {
    dietaryRecommendations.push('Tăng cường chất béo không bão hòa Omega-3 từ cá hồi, cá thu, hạt óc chó, hạt chia.');
    warnings.push('Hạn chế đồ chiên ngập dầu mỡ, bơ động vật, mỡ lợn và thức ăn chế biến sẵn.');
  }

  if (dietaryRecommendations.length === 0) {
    dietaryRecommendations.push('Duy trì đĩa ăn cân bằng theo mô hình "Healthy Plate": 1/2 rau củ, 1/4 đạm nạc, 1/4 tinh bột phức hợp.');
    dietaryRecommendations.push('Uống đủ nước và duy trì vận động ít nhất 150 phút mỗi tuần.');
  }

  return {
    bmi,
    bmiCategory,
    bmiColor,
    bmr,
    tdee,
    targetCalories,
    targetWaterMl,
    macros: {
      proteinGrams,
      carbsGrams,
      fatGrams,
      proteinPercent,
      carbsPercent,
      fatPercent,
    },
    sodiumLimitMg,
    fiberTargetGrams,
    dietaryRecommendations,
    warnings,
  };
}
