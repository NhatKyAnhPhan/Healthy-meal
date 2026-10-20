import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client safely with server-side API Key
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// API: Health Profile Analysis & Nutrition Recommendations
app.post('/api/ai/analyze-health', async (req, res) => {
  try {
    const { profile, calculatedMetrics } = req.body;

    if (!aiClient) {
      return res.json({
        success: true,
        isFallback: true,
        advice: generateFallbackAdvice(profile, calculatedMetrics),
      });
    }

    const prompt = `
Bạn là chuyên gia Dinh dưỡng lâm sàng và Bác sĩ Y học dự phòng giàu kinh nghiệm tại Việt Nam.
Hãy phân tích hồ sơ sức khỏe sau đây và đưa ra tư vấn dinh dưỡng chi tiết, chuẩn y khoa, dễ hiểu:

Thông tin người dùng:
- Giới tính: ${profile.gender === 'male' ? 'Nam' : 'Nữ'}
- Tuổi: ${profile.age} tuổi
- Chiều cao: ${profile.height} cm, Cân nặng: ${profile.weight} kg
- Chỉ số BMI: ${calculatedMetrics?.bmi?.toFixed(1) || 'N/A'} (${calculatedMetrics?.bmiCategory || 'N/A'})
- Nhu cầu năng lượng TDEE ước tính: ${calculatedMetrics?.tdee || 2000} kcal/ngày
- Mục tiêu calo hàng ngày khuyến nghị: ${calculatedMetrics?.targetCalories || 1800} kcal/ngày
- Mục tiêu cá nhân: ${profile.goal}
- Tiền sử bệnh lý / Tình trạng sức khỏe: ${profile.conditions?.join(', ') || 'Bình thường'}
- Mức độ vận động: ${profile.activityLevel}

Hãy trả về phản hồi định dạng JSON với cấu trúc sau:
{
  "summary": "Tóm tắt ngắn gọn tình trạng thể trạng và mục tiêu dinh dưỡng (2-3 câu)",
  "calorieAdvice": "Lời khuyên về mức tiêu thụ calo và phân bổ các bữa trong ngày",
  "recommendedFoods": ["3-5 nhóm thực phẩm cực tốt nên ăn nhiều"],
  "foodsToAvoid": ["3-5 thực phẩm cần kiêng hoặc hạn chế tối đa theo bệnh lý"],
  "cookingTips": ["3 lưu ý khi nấu ăn và nêm nếm gia vị phù hợp bệnh lý"],
  "waterAndHabits": "Lời khuyên về uống nước, vận động và thói quen sinh hoạt",
  "macroAdvice": "Gợi ý tỉ lệ Đạm : Tinh bột : Béo phù hợp"
}
Trả về CHỈ JSON hợp lệ, không bọc markdown thừa ngoài JSON nếu có thể.
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      advice: parsed,
    });
  } catch (error: any) {
    console.error('Error in analyze-health:', error);
    // Return reliable structured fallback
    return res.json({
      success: true,
      isFallback: true,
      advice: generateFallbackAdvice(req.body.profile, req.body.calculatedMetrics),
    });
  }
});

// API: Customize Recipe for Health Conditions
app.post('/api/ai/customize-recipe', async (req, res) => {
  try {
    const { recipe, profile, userRequest } = req.body;

    if (!aiClient) {
      return res.json({
        success: true,
        isFallback: true,
        customization: generateFallbackRecipeCustomization(recipe, profile),
      });
    }

    const prompt = `
Bạn là Bác sĩ dinh dưỡng kiêm Bếp trưởng ẩm thực lành mạnh.
Hãy điều chỉnh công thức món "${recipe.title}" để phù hợp tối ưu nhất cho người dùng có đặc điểm sau:
- Bệnh lý / Chế độ ăn: ${profile.conditions?.join(', ') || 'Ăn uống lành mạnh thông thường'}
- Mục tiêu calo: ${profile.targetCalories || 1800} kcal/ngày
- Yêu cầu đặc biệt của người dùng: ${userRequest || 'Tối ưu hóa cho sức khỏe'}

Nguyên liệu gốc:
${recipe.ingredients.map((i: any) => `- ${i.name}: ${i.amount} ${i.unit}`).join('\n')}

Hãy trả về JSON:
{
  "safetyRating": "An toàn" | "Cần gia giảm" | "Không khuyến khích",
  "clinicalNote": "Giải thích tác động của món ăn này lên bệnh lý của người dùng",
  "ingredientSubstitutions": [
    {
      "original": "Tên nguyên liệu gốc",
      "substitute": "Nguyên liệu thay thế tốt hơn cho bệnh lý",
      "reason": "Lý do thay thế y khoa/dinh dưỡng"
    }
  ],
  "cookingAdjustment": "Hướng dẫn cách nấu hoặc nêm nếm thay đổi (ví dụ giảm muối, không xào dầu, hấp thay vì rán...)",
  "portionAdvice": "Khẩu phần gợi ý ăn bao nhiêu để không vượt calo hoặc đường huyết",
  "modifiedCaloriesPerServing": 320
}
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      customization: parsed,
    });
  } catch (error: any) {
    console.error('Error in customize-recipe:', error);
    return res.json({
      success: true,
      isFallback: true,
      customization: generateFallbackRecipeCustomization(req.body.recipe, req.body.profile),
    });
  }
});

// API: Ask Chef & Nutritionist AI
app.post('/api/ai/ask-chef', async (req, res) => {
  try {
    const { message, profile, currentRecipe } = req.body;

    if (!aiClient) {
      return res.json({
        success: true,
        reply: `Dạ chào bạn! Để hỗ trợ tốt nhất cho tình trạng ${profile?.conditions?.join(', ') || 'sức khỏe'} của bạn, nguyên tắc quan trọng nhất là cân đối năng lượng theo mục tiêu ${profile?.targetCalories || 1800} kcal/ngày. Nếu cần điều chỉnh công thức hay gia vị, hãy ưu tiên các loại gia vị tự nhiên như gừng, tỏi, tiêu, hành lá thay vì bột ngọt hay nêm mặn nhé!`,
      });
    }

    const prompt = `
Bạn là chuyên gia dinh dưỡng và đầu bếp chuyên nghiệp "Bếp Sống Khỏe".
Trả lời câu hỏi của người dùng bằng tiếng Việt, giọng điệu ấm áp, ân cần, giàu chuyên môn y học và ẩm thực thực chiến:
Người dùng:
- Tuổi: ${profile?.age || 30}, Cân nặng: ${profile?.weight || 60}kg, Chiều cao: ${profile?.height || 165}cm
- Bệnh lý: ${profile?.conditions?.join(', ') || 'Không có'}
- Calo mục tiêu: ${profile?.targetCalories || 1800} kcal
${currentRecipe ? `- Đang xem món: "${currentRecipe.title}" (${currentRecipe.calories} kcal/phần)` : ''}

Câu hỏi của người dùng:
"${message}"

Hãy đưa ra câu trả lời súc tích, có giải pháp cụ thể, nguyên liệu thay thế và cách chế biến an toàn. Tránh dài dòng lý thuyết suông.
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      reply: response.text,
    });
  } catch (error: any) {
    console.error('Error in ask-chef:', error);
    return res.json({
      success: true,
      reply: 'Hệ thống AI Bếp Sống Khỏe tạm thời bận. Nguyên tắc chung cho thực đơn lành mạnh là: giảm bớt gia vị mặn ngọt công nghiệp, tăng cường rau củ hấp/luộc giàu chất xơ và đạm nạc từ cá, ức gà, đậu hũ!',
    });
  }
});

// Fallback logic for offline / no-key cases
function generateFallbackAdvice(profile: any, metrics: any) {
  const conditions: string[] = profile?.conditions || [];
  const recFoods = [
    'Rau xanh đậm màu (cải bó xôi, súp lơ xanh, rau muống luộc)',
    'Nguồn đạm nạc: Ức gà, cá hồi, cá basa hấp, đậu hũ non, trứng gà',
    'Tinh bột chuyển hóa chậm: Gạo lứt, yến mạch nguyên hạt, khoai lang luộc',
  ];
  const avoidFoods = [
    'Thực phẩm chiên rán ngập dầu, da động vật, mỡ động vật',
    'Đồ uống có đường, nước ngọt có ga, bánh kẹo ngọt công nghiệp',
    'Thực phẩm đóng hộp chế biến sẵn chứa lượng natri cực cao',
  ];
  const tips = [
    'Ưu tiên phương pháp luộc, hấp, áp chảo không dầu hoặc nướng nồi chiên không dầu',
    'Nêm gia vị bằng thảo mộc tự nhiên (gừng, sả, nghệ, hành khô, chanh) để giảm phụ thuộc muối',
    'Ăn rau củ trước bữa ăn để tăng cảm giác no và làm chậm quá trình hấp thu đường',
  ];

  if (conditions.includes('diabetes')) {
    avoidFoods.unshift('Cơm trắng, bánh mì trắng, bánh ngọt, chè, hoa quả ngọt nhiều đường (sầu riêng, xoài chín)');
    recFoods.unshift('Ngũ cốc nguyên cám, đậu đỗ, rau củ giàu chất xơ hòa tan giúp ổn định đường huyết');
    tips.push('Chia nhỏ bữa ăn (3 bữa chính + 1-2 bữa phụ nhẹ) tránh tăng đường huyết đột biến');
  }
  if (conditions.includes('hypertension')) {
    avoidFoods.unshift('Mắm tôm, dưa cà muối chua, đồ khô mặn, mì tôm gói');
    recFoods.unshift('Thực phẩm giàu Kali & Magie: Chuối, bí đỏ, bơ, măng tây, rau bina');
    tips.push('Giới hạn lượng muối dưới 3-5g mỗi ngày (khoảng 1 thìa cà phê gạt)');
  }
  if (conditions.includes('gastritis')) {
    avoidFoods.unshift('Ớt cay, tiêu nhiều, dấm chua, chanh nguyên chất lúc đói, cà phê đặc');
    recFoods.unshift('Cháo loãng, canh bí đỏ hạt sen, nghệ mật ong, chuối tây, sữa hạt ấm');
    tips.push('Không ăn quá no hoặc để quá đói, nhai kỹ, không nằm ngay sau khi ăn');
  }
  if (conditions.includes('gout')) {
    avoidFoods.unshift('Nội tạng động vật, thịt bò/dê đỏ, hải sản (cua, sò, tôm biển đậm), bia rượu');
    recFoods.unshift('Sữa ít béo, đậu hũ non vừa phải, anh đào (cherry), rau củ ít purin, uống nhiều nước');
    tips.push('Uống đủ 2.5 - 3 lít nước lọc mỗi ngày để hỗ trợ thận đào thải axit uric');
  }

  return {
    summary: `Chỉ số BMI của bạn là ${metrics?.bmi?.toFixed(1) || 22} (${metrics?.bmiCategory || 'Bình thường'}). Mục tiêu calo tiêu thụ tối ưu là khoảng ${metrics?.targetCalories || 1800} kcal/ngày.`,
    calorieAdvice: `Phân bổ calo lý tưởng: Bữa sáng 25% (~${Math.round((metrics?.targetCalories || 1800) * 0.25)} kcal), Bữa trưa 35% (~${Math.round((metrics?.targetCalories || 1800) * 0.35)} kcal), Bữa tối 30% (~${Math.round((metrics?.targetCalories || 1800) * 0.3)} kcal), Bữa phụ 10% (~${Math.round((metrics?.targetCalories || 1800) * 0.1)} kcal).`,
    recommendedFoods: recFoods.slice(0, 4),
    foodsToAvoid: avoidFoods.slice(0, 4),
    cookingTips: tips.slice(0, 4),
    waterAndHabits: `Khuyến nghị uống khoảng ${metrics?.waterMl || 2000} ml nước lọc mỗi ngày. Vận động nhẹ nhàng ít nhất 30 phút mỗi ngày.`,
    macroAdvice: `Khuyến nghị dinh dưỡng: Đạm ${metrics?.macros?.proteinGrams || 110}g (${Math.round((metrics?.macros?.proteinGrams || 110) * 4 / (metrics?.targetCalories || 1800) * 100)}%), Tinh bột ${metrics?.macros?.carbsGrams || 200}g, Chất béo ${metrics?.macros?.fatGrams || 50}g.`,
  };
}

function generateFallbackRecipeCustomization(recipe: any, profile: any) {
  const conditions = profile?.conditions || [];
  const substitutions: any[] = [];
  let note = `Món ăn này rất phù hợp với chế độ ăn khoa học.`;
  let safetyRating = 'An toàn';

  if (conditions.includes('hypertension')) {
    substitutions.push({
      original: 'Nước mắm truyền thống / Muối',
      substitute: 'Nước tương ít muối (low-sodium) hoặc nước mắm giảm mặn 50%, tăng cường hành tỏi tiêu',
      reason: 'Hạ hàm lượng Natri bảo vệ huyết áp và tim mạch.',
    });
  }
  if (conditions.includes('diabetes')) {
    substitutions.push({
      original: 'Đường cát trắng / Mật ong',
      substitute: 'Đường ăn kiêng cỏ ngọt Stevia hoặc vị ngọt tự nhiên từ củ cải / hành tây hầm',
      reason: 'Không làm tăng chỉ số đường huyết sau ăn.',
    });
  }
  if (conditions.includes('gastritis')) {
    substitutions.push({
      original: 'Ớt cay / Tiêu cay nồng',
      substitute: 'Gừng tươi thái lát nhẹ và lá tía tô',
      reason: 'Làm ấm bụng, giảm co thắt và bảo vệ niêm mạc dạ dày.',
    });
  }
  if (conditions.includes('gout')) {
    substitutions.push({
      original: 'Thịt đỏ / Hải sản đậm vị',
      substitute: 'Ức gà xé hoặc trứng gà luộc / đậu phụ trắng mềm',
      reason: 'Hàm lượng nhân purin thấp, không kích hoạt cơn đau gút.',
    });
  }

  return {
    safetyRating,
    clinicalNote: note,
    ingredientSubstitutions: substitutions.length > 0 ? substitutions : [
      {
        original: 'Dầu ăn chiên rán',
        substitute: 'Dầu oliu nguyên chất hoặc xịt dầu ăn dạng phun sương',
        reason: 'Giảm 70% lượng calo từ chất béo xấu.',
      },
    ],
    cookingAdjustment: 'Ưu tiên hấp cách thủy hoặc áp chảo nhanh chống dính để giữ trọn vẹn vitamin và không làm oxy hóa chất béo.',
    portionAdvice: 'Khẩu phần 1 người ăn vừa vặn, kết hợp cùng 1 chén cơm gạo lứt hoặc khoai lang.',
    modifiedCaloriesPerServing: Math.max(recipe?.calories - 45, 180),
  };
}

// Development with Vite vs Production static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bếp Sống Khỏe Server is running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
