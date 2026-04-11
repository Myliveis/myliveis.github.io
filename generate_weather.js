import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// 🔐 جلب المفتاح من GitHub Secrets
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY غير موجود! تأكد من إضافته في GitHub Secrets.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 🌍 قائمة الدول
const countries = [
  "سوريا (SY)", "لبنان (LB)", "فلسطين (PS)", "الأردن (JO)", "العراق (IQ)",
  "مصر (EG)", "السعودية (SA)", "الكويت (KW)", "الإمارات (AE)", "قطر (QA)",
  "البحرين (BH)", "عمان (OM)", "اليمن (YE)", "ليبيا (LY)", "تونس (TN)",
  "الجزائر (DZ)", "المغرب (MA)", "موريتانيا (MR)", "السودان (SD)",
  "الصومال (SO)", "جيبوتي (DJ)", "جزر القمر (KM)"
];

async function generateWeather() {
  // ✅ استخدام النموذج الصحيح
  const model = genAI.getGenerativeModel({
   model: "gemini-2.0-flash"
  });

  const prompt = `
أنت خبير أرصاد جوية. قم بتوليد نشرة جوية قصيرة ومختصرة باللغة العربية لـ 22 دولة عربية لمدة 3 أيام (اليوم، غداً، بعد غد).

الدول هي: ${countries.join(", ")}.

يجب أن يكون المخرج بصيغة JSON صحيحة فقط (Valid JSON) بدون أي نص إضافي أو Markdown.

الشكل المطلوب:
{
  "SY": {
    "today": "نشرة اليوم...",
    "tomorrow": "نشرة الغد...",
    "after_tomorrow": "نشرة بعد غد..."
  },
  "LB": {
    "today": "...",
    "tomorrow": "...",
    "after_tomorrow": "..."
  }
}

استخدم رموز الدول ISO كمفاتيح. لا تضف أي نص خارج JSON.
`;

  try {
    console.log("🌤️ جاري الاتصال بـ Gemini لتوليد 66 نشرة جوية...");

    // ✅ طلب مع فرض JSON
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    let responseText = result.response.text();

    // 🔧 تنظيف احتياطي (في حال أضاف أي رموز)
    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // ✅ التحقق من JSON
    const weatherData = JSON.parse(responseText);

    // 💾 حفظ الملف
    fs.writeFileSync(
      "weather_data.json",
      JSON.stringify(weatherData, null, 2),
      "utf-8"
    );

    console.log("✅ تم تحديث ملف weather_data.json بنجاح!");

  } catch (error) {
    console.error("❌ حدث خطأ أثناء التوليد:");
    console.error(error);

    // 🧠 طباعة إضافية للتشخيص
    if (error.response) {
      console.error("📄 تفاصيل الاستجابة:", error.response);
    }

    process.exit(1);
  }
}

// 🚀 تشغيل العملية
generateWeather();
