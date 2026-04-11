import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

// سحب المفتاح من بيئة جيتهوب الآمنة (لن يكون مكشوفاً في الكود)
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const countries = [
    "سوريا (SY)", "لبنان (LB)", "فلسطين (PS)", "الأردن (JO)", "العراق (IQ)",
    "مصر (EG)", "السعودية (SA)", "الكويت (KW)", "الإمارات (AE)", "قطر (QA)",
    "البحرين (BH)", "عمان (OM)", "اليمن (YE)", "ليبيا (LY)", "تونس (TN)",
    "الجزائر (DZ)", "المغرب (MA)", "موريتانيا (MR)", "السودان (SD)", 
    "الصومال (SO)", "جيبوتي (DJ)", "جزر القمر (KM)"
];

async function generateWeather() {
   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    أنت خبير أرصاد جوية. قم بتوليد نشرة جوية قصيرة ومختصرة باللغة العربية لـ 22 دولة عربية لمدة 3 أيام (اليوم، غداً، بعد غد).
    الدول هي: ${countries.join(", ")}.
    
    يجب أن يكون المخرج حصرياً بصيغة JSON صحيحة (Valid JSON) بدون أي نص إضافي أو علامات Markdown، ويكون الهيكل كالتالي:
    {
      "SY": {
        "today": "نشرة اليوم...",
        "tomorrow": "نشرة الغد...",
        "after_tomorrow": "نشرة بعد غد..."
      },
      "LB": { ... }
    }
    استخدم رموز الدول ISO كمفاتيح. لا تضف أي كلمة خارج كود الـ JSON.
    `;

    try {
        console.log("جاري الاتصال بـ Gemini لتوليد 66 نشرة جوية...");
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        
        // تنظيف النص في حال أضاف Gemini علامات ```json
        responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        // التحقق من صحة الـ JSON
        const weatherData = JSON.parse(responseText);

        // حفظ البيانات في ملف weather_data.json
        fs.writeFileSync('weather_data.json', JSON.stringify(weatherData, null, 2), 'utf-8');
        console.log("تم تحديث ملف weather_data.json بنجاح!");

    } catch (error) {
        console.error("حدث خطأ أثناء التوليد:", error);
        process.exit(1); // إيقاف العملية بخطأ
    }
}

generateWeather();
