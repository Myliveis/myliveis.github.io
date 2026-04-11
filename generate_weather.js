import fs from "fs";

// 🔐 جلب المفتاح
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ المفتاح غير موجود!");
  process.exit(1);
}

const countries = [
  "سوريا (SY)", "لبنان (LB)", "فلسطين (PS)", "الأردن (JO)", "العراق (IQ)",
  "مصر (EG)", "السعودية (SA)", "الكويت (KW)", "الإمارات (AE)", "قطر (QA)",
  "البحرين (BH)", "عمان (OM)", "اليمن (YE)", "ليبيا (LY)", "تونس (TN)",
  "الجزائر (DZ)", "المغرب (MA)", "موريتانيا (MR)", "السودان (SD)",
  "الصومال (SO)", "جيبوتي (DJ)", "جزر القمر (KM)"
];

async function generateWeather() {
  const prompt = `أنت خبير أرصاد جوية. قم بتوليد نشرة جوية قصيرة باللغة العربية لـ 22 دولة لمدة 3 أيام (اليوم، غداً، بعد غد).
الدول: ${countries.join(", ")}.
المخرج يجب أن يكون Valid JSON فقط باستخدام رموز ISO كمفاتيح، بهذا الشكل:
{"SY": {"today": "...", "tomorrow": "...", "after_tomorrow": "..."}}`;

  // الرابط المباشر والصريح لسيرفر جوجل (لا يمكن أن يخطئ)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    console.log("🌤️ جاري الاتصال بـ Gemini عبر الاتصال المباشر (بدون مكتبات)...");

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`خطأ من السيرفر: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text;

    // تنظيف النص
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // تحويل وحفظ
    const weatherData = JSON.parse(responseText);
    fs.writeFileSync("weather_data.json", JSON.stringify(weatherData, null, 2), "utf-8");
    
    console.log("✅ تم سحب البيانات وحفظ الملف بنجاح ساحق!");

  } catch (error) {
    console.error("❌ فشل الاتصال المباشر:", error.message);
    process.exit(1);
  }
}

generateWeather();
