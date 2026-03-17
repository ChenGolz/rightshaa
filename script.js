
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js?v=50", { updateViaCache: "none" });
  });
}

const mapPoints = [
  {name:"מרכז חוסן — אופקים", type:"מרכז חוסן", lat:31.315, lng:34.621, address:"רח' קיבוץ גלויות 57, אופקים"},
  {name:"אמ״ן — אזור מערב הנגב (נתיבות)", type:"מרכז חוסן", lat:31.423, lng:34.589, address:"חר״ש 76, נתיבות"},
  {name:"אשכול (מגן)", type:"מרכז חוסן", lat:31.301, lng:34.429, address:"מגן"},
  {name:"מרכז חוסן — אשקלון", type:"מרכז חוסן", lat:31.669, lng:34.571, address:"רח' צה״ל 99, אשקלון"},
  {name:"בנימין (כוכב יעקב)", type:"מרכז חוסן", lat:31.880, lng:35.245, address:"כוכב יעקב"},
  {name:"גליל מזרחי (קרית שמונה)", type:"מרכז חוסן", lat:33.207, lng:35.570, address:"קרית שמונה"},
  {name:"גליל מערבי (כברי)", type:"מרכז חוסן", lat:33.016, lng:35.095, address:"כברי"},
  {name:"חברה בדואית (באר שבע)", type:"מרכז חוסן", lat:31.251, lng:34.791, address:"רח' שז״ר זלמן 35, באר שבע"},
  {name:"חוף אשקלון (בת הדר)", type:"מרכז חוסן", lat:31.625, lng:34.612, address:"בת הדר"},
  {name:"הודה (קרית ארבע)", type:"מרכז חוסן", lat:31.535, lng:35.111, address:"קרית ארבע"},
  {name:"עציון (אפרת)", type:"מרכז חוסן", lat:31.655, lng:35.148, address:"רח' בועז 1, אפרת"},
  {name:"שדות נגב (מעגלים)", type:"מרכז חוסן", lat:31.411, lng:34.603, address:"מעגלים"},
  {name:"שדרות", type:"מרכז חוסן", lat:31.523, lng:34.596, address:"רח' הרצל 68, שדרות"},
  {name:"שומרון (קרני שומרון)", type:"מרכז חוסן", lat:32.170, lng:35.098, address:"קרני שומרון"},
  {name:"שער הנגב (ספיר)", type:"מרכז חוסן", lat:31.557, lng:34.595, address:"ספיר"},
  {name:"ביטוח לאומי — ירושלים", type:"ביטוח לאומי", lat:31.778, lng:35.221, address:"בן שטח 4, ירושלים"}
];

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const letterForm = $("letterForm");
  const letterName = $("letterName");
  const letterId = $("letterId");
  const letterRelation = $("letterRelation");
  const letterDeceased = $("letterDeceased");
  const letterDate = $("letterDate");
  const letterTarget = $("letterTarget");
  const letterNeed = $("letterNeed");
  const letterPhone = $("letterPhone");
  const letterEmail = $("letterEmail");
  const letterOutput = $("letterOutput");
  const faqContactFallback = $("faqContactFallback");

  const trackerStart = $("trackerStart");
  const trackerOutput = $("trackerOutput");

  const trackerTrack = $("trackerTrack");

  const draftFields = ["letterName","letterId","letterRelation","letterDeceased","letterDate","letterTarget","letterNeed","letterPhone","letterEmail","letterOutput"];
  draftFields.forEach((id) => {
    const el = $(id);
    if (!el) return;
    const saved = localStorage.getItem("draft_" + id);
    if (saved) el.value = saved;
    el.addEventListener("input", () => localStorage.setItem("draft_" + id, el.value));
    el.addEventListener("change", () => localStorage.setItem("draft_" + id, el.value));
  });

  const setError = (id, text) => {
    const el = $(id + "Error");
    if (el) el.textContent = text || "";
  };

  const setInvalid = (el, invalid) => {
    if (!el) return;
    el.classList.toggle("input-invalid", !!invalid);
  };

  const isFutureDate = (value) => {
    if (!value) return false;
    const d = new Date(value);
    if (isNaN(d)) return false;
    const today = new Date();
    d.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return d > today;
  };

  const today = new Date().toISOString().split("T")[0];
  ["letterDate", "smartDeathDate", "trackerStart"].forEach((id) => {
    const el = $(id);
    if (el) el.max = today;
  });

  function buildLetterText() {
    const name = (letterName?.value || "").trim();
    const idNum = (letterId?.value || "").trim();
    const relation = (letterRelation?.value || "").trim();
    const deceased = (letterDeceased?.value || "").trim();
    const lossDate = (letterDate?.value || "").trim();
    const target = (letterTarget?.value || "הגורם המטפל").trim();
    const need = (letterNeed?.value || "");
    const phone = (letterPhone?.value || "").trim();
    const email = (letterEmail?.value || "").trim();
    const today = new Date().toLocaleDateString("he-IL");

    let lines = [];
    lines.push("תאריך: " + today);
    lines.push("");
    lines.push("לכבוד: " + target);
    lines.push("שלום רב,");
    lines.push("");

    let subjectLine = "הנדון: פנייה בנושא זכויות וסיוע בעקבות האובדן";
    if (need.includes("נפשי")) subjectLine = "הנדון: בקשה לסיוע נפשי וליווי רגשי למשפחת שכול";
    if (need.includes("מלג")) subjectLine = "הנדון: הגשת מועמדות למלגת לימודים וסיוע אקדמי";
    if (need.includes("מענק")) subjectLine = "הנדון: בקשה למימוש זכויות כלכליות ומענקי סיוע";

    lines.push(subjectLine);
    lines.push("");

    lines.push(`אני פונה אליכם כ${relation || "בן/בת משפחה"} של ${deceased || "יקירי"} ז"ל, אשר נפל/ה באירועי האובדן.`);
    lines.push("");

    switch (true) {
      case need.includes("נפשי"):
        lines.push("בתקופה מורכבת זו, משפחתנו מתמודדת עם השלכות האובדן והטראומה. אנו חשים צורך בליווי מקצועי ורגשי מותאם.");
        lines.push("אודה לבדיקת זכאותנו לטיפולים פרטניים או קבוצתיים במסגרת המענים הקיימים עבורנו.");
        break;
      case need.includes("מלג"):
        lines.push("כחלק מהרצון להמשיך בבנייה וצמיחה למרות הכאב הגדול, אני מעוניין/ת להשתלב בלימודים אקדמיים או מקצועיים.");
        lines.push("אודה לקבלת פרטים על מלגות ייעודיות למשפחות 7.10, קריטריונים להגשה ולוחות זמנים.");
        break;
      case need.includes("מענק") || need.includes("כלכלי"):
        lines.push("לאור שינוי נסיבות חיינו בעקבות האובדן, אנו זקוקים לבירור מעמיק של המענקים והתמיכות הכספיות המגיעות לנו.");
        lines.push("נבקש לקבל פירוט על מענקי דיור, מחיה או סיוע חד-פעמי שנועדו להקל על הנטל הכלכלי בתקופה זו.");
        break;
      default:
        lines.push(`אני פונה בבקשה לקבל מידע והכוונה בנוגע ל${need || "זכויות המגיעות לנו"}.`);
        lines.push("אודה לכם על הדרכה לגבי השלבים הבאים והמסמכים הנדרשים למיצוי זכויותינו.");
    }

    lines.push("");
    lines.push("להלן פרטיי לזיהוי וטיפול:");
    if (name) lines.push("• שם מלא: " + name);
    if (idNum) lines.push("• מספר זהות: " + idNum);
    if (lossDate) lines.push("• תאריך האובדן: " + lossDate);
    lines.push("");

    if (phone || email) {
      lines.push("אשמח ליצירת קשר בדרכים הבאות:");
      if (phone) lines.push("• טלפון: " + phone);
      if (email) lines.push("• אימייל: " + email);
      lines.push("");
    }

    lines.push("בברכה ובתודה מראש על הרגישות והעזרה,");
    if (name) lines.push(name);

    return lines.join("\n");
  }


  function hasMinimumLetterContent() {
    const hasName = !!(letterName?.value || "").trim();
    const hasNeed = !!(letterNeed?.value || "").trim();
    return hasName || hasNeed;
  }

  function updateLetterActionButtons() {
    const hasOutput = !!(letterOutput?.value || "").trim();
    const waBtn = $("sendLetterWhatsappBtn");
    if (waBtn) waBtn.disabled = !hasOutput;
  }

  const generateLetterBtn = $("generateLetter");
  if (letterForm) {
    letterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      setError("letterDate", "");
      setInvalid(letterName, false);
      setInvalid(letterNeed, false);

      if (!hasMinimumLetterContent()) {
        setInvalid(letterName, true);
        setInvalid(letterNeed, true);
        if (letterOutput) {
          letterOutput.value = "כדי ליצור מכתב, כדאי להזין לפחות שם מלא או לבחור נושא פנייה.";
        }
        updateLetterActionButtons();
        return;
      }

      if (isFutureDate(letterDate?.value)) {
        setError("letterDate", "נא להזין תאריך מהעבר.");
        return;
      }
      if (letterOutput) letterOutput.value = buildLetterText();
      updateLetterActionButtons();
    });
  } else if (generateLetterBtn) {
    generateLetterBtn.onclick = () => {
      setError("letterDate", "");
      setInvalid(letterName, false);
      setInvalid(letterNeed, false);

      if (!hasMinimumLetterContent()) {
        setInvalid(letterName, true);
        setInvalid(letterNeed, true);
        if (letterOutput) {
          letterOutput.value = "כדי ליצור מכתב, כדאי להזין לפחות שם מלא או לבחור נושא פנייה.";
        }
        updateLetterActionButtons();
        return;
      }

      if (isFutureDate(letterDate?.value)) {
        setError("letterDate", "נא להזין תאריך מהעבר.");
        return;
      }
      if (letterOutput) letterOutput.value = buildLetterText();
      updateLetterActionButtons();
    };
  }

  const copyLetterBtn = $("copyLetter");
  if (copyLetterBtn) copyLetterBtn.onclick = async () => {
    if (letterOutput && !letterOutput.value) letterOutput.value = buildLetterText();
    if (letterOutput) await navigator.clipboard.writeText(letterOutput.value);
    const old = copyLetterBtn.textContent;
    copyLetterBtn.textContent = "הועתק";
    setTimeout(() => copyLetterBtn.textContent = old, 1600);
    updateLetterActionButtons();
  };

  const sendLetterWhatsappBtn = $("sendLetterWhatsappBtn");
  if (sendLetterWhatsappBtn) sendLetterWhatsappBtn.onclick = () => {
    const text = (letterOutput?.value || "").trim();
    if (!text) return;
    const msg = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  function downloadPdf() {
    if (letterOutput && !letterOutput.value) letterOutput.value = buildLetterText();
    const wrapper = document.createElement("div");
    wrapper.style.padding = "32px";
    wrapper.style.fontFamily = "Arial, sans-serif";
    wrapper.style.direction = "rtl";
    wrapper.style.lineHeight = "1.8";
    wrapper.innerText = letterOutput?.value || "";
    if (window.html2pdf) {
      html2pdf().set({
        margin: 10,
        filename: "pniya-710.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }).from(wrapper).save();
    }
  }

  const downloadPdfBtn = $("downloadPdfBtn");
  if (downloadPdfBtn) downloadPdfBtn.onclick = downloadPdf;

  const clearDraftBtn = $("clearDraftBtn");
  if (clearDraftBtn) clearDraftBtn.onclick = () => {
    ["letterName","letterId","letterRelation","letterDeceased","letterDate","letterTarget","letterNeed","letterPhone","letterEmail","letterOutput"].forEach((id) => {
      localStorage.removeItem("draft_" + id);
      const el = $(id);
      if (el) el.value = "";
    });
    setError("letterDate", "");
    setInvalid(letterName, false);
    setInvalid(letterNeed, false);
    updateLetterActionButtons();
  };

  const generateMailBtn = $("generateMailBtn");
  if (generateMailBtn) generateMailBtn.onclick = () => {
    if (letterOutput && !letterOutput.value) {
      letterOutput.value = buildLetterText();
    }

    const name = (letterName?.value || "").trim();
    const idNum = (letterId?.value || "").trim();

    let subjectText = "פנייה בנושא זכויות וסיוע למשפחת 7.10";
    if (name && idNum) {
      subjectText += ` - ${name} (ת"ז ${idNum})`;
    } else if (name) {
      subjectText += ` - ${name}`;
    }

    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(letterOutput?.value || "").replace(/%0A/g, "%0D%0A");

    const emailTo = window.selectedOrgEmail || "";
    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
  };

  const buildTrackerBtn = $("buildTracker");
  if (buildTrackerBtn) buildTrackerBtn.onclick = () => {
    setError("trackerStart", "");
    if (!trackerStart?.value) {
      setError("trackerStart", "נא להזין תאריך התחלה.");
      return;
    }
    if (isFutureDate(trackerStart.value)) {
      setError("trackerStart", "נא להזין תאריך מהעבר.");
      return;
    }

    const base = new Date(trackerStart.value);
    const plus = (days) => {
      const d = new Date(base);
      d.setDate(d.getDate() + days);
      return d.toLocaleDateString("he-IL");
    };

    if (trackerOutput) {
      if ((trackerTrack?.value || "").includes("חוסן")) {
        trackerOutput.innerHTML = `
          <div class="timeline-item"><strong>בדיקת טיפול רגשי ראשון:</strong> ${plus(7)}</div>
          <div class="timeline-item"><strong>מעקב המשך טיפולי:</strong> ${plus(30)}</div>
          <div class="timeline-item"><strong>בדיקת מסגרת טיפול לילדים/נוער:</strong> ${plus(60)}</div>
          <div class="timeline-item"><strong>בדיקת המשך תמיכה נפשית:</strong> ${plus(180)}</div>
        `;
      } else {
        trackerOutput.innerHTML = `
          <div class="timeline-item"><strong>בדיקת הכרה / פתיחת תיק:</strong> ${plus(7)}</div>
          <div class="timeline-item"><strong>בדיקת טפסים וקצבאות:</strong> ${plus(30)}</div>
          <div class="timeline-item"><strong>בדיקת מסמכים / טופס 582:</strong> ${plus(60)}</div>
          <div class="timeline-item"><strong>בדיקת זכויות והמשך ליווי:</strong> ${plus(180)}</div>
        `;
      }
    }
  };

  const clearTrackerBtn = $("clearTracker");
  if (clearTrackerBtn) clearTrackerBtn.onclick = () => {
    if (trackerStart) trackerStart.value = "";
    if (trackerOutput) trackerOutput.innerHTML = "";
    setError("trackerStart", "");
  };

  const shareSiteBtn = $("shareSiteBtn");
  if (shareSiteBtn) shareSiteBtn.onclick = async () => {
    const url = window.location.href;
    const shareText = "מצאתי אתר שעוזר למשפחות שכולות מאירועי 7.10 להתמודד עם זכויות, בירוקרטיה ותמיכה: " + url;
    if (navigator.share) {
      try {
        await navigator.share({ title: "מרכז סיוע למשפחות שכולות 7.10", text: shareText, url });
        return;
      } catch (e) {}
    }
    const text = encodeURIComponent(shareText);
    window.open("https://wa.me/?text=" + text, "_blank");
  };

  const floatingBreatheBtn = $("floatingBreathe");
  if (floatingBreatheBtn) floatingBreatheBtn.onclick = () => {
    const breatheSection = $("breatheSection");
    if (breatheSection) breatheSection.scrollIntoView({behavior:"smooth"});
  };

  const breatheCircle = $("breatheCircle");
  const breatheInnerText = $("breatheInnerText");
  const breatheStatus = $("breatheStatus");
  let breatheInterval = null;
  const cycle = [["שאיפה","inhale"],["החזקה","hold"],["נשיפה","exhale"],["החזקה","hold"]];

  function stopBreathing() {
    if (breatheInterval) clearInterval(breatheInterval);
    breatheInterval = null;
    if (breatheCircle) breatheCircle.className = "breathe-circle";
    if (breatheInnerText) breatheInnerText.textContent = "נשימה";
    if (breatheStatus) breatheStatus.textContent = "מוכנים להתחיל";
  }

  const startBreatheBtn = $("startBreathe");
  if (startBreatheBtn) startBreatheBtn.onclick = () => {
    stopBreathing();
    let i = 0;
    let rounds = 4;
    function nextPhase() {
      if (rounds <= 0) {
        stopBreathing();
        if (breatheStatus) breatheStatus.textContent = "סיימתם דקה של נשימה.";
        return;
      }
      const [label, phase] = cycle[i];
      if (breatheCircle) breatheCircle.className = "breathe-circle " + phase;
      if (breatheInnerText) breatheInnerText.textContent = label;
      if (breatheStatus) breatheStatus.textContent = label + " — 4 שניות";
      i = (i + 1) % cycle.length;
      if (i === 0) rounds -= 1;
    }
    nextPhase();
    breatheInterval = setInterval(nextPhase, 4000);
  };

  const stopBreatheBtn = $("stopBreathe");
  if (stopBreatheBtn) stopBreatheBtn.onclick = stopBreathing;

  function downloadVCard(name, phone){
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=CELL:${phone}
END:VCARD`;
    const blob = new Blob([vcard], {type: "text/vcard;charset=utf-8"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  document.querySelectorAll(".save-contact-btn").forEach((btn) => {
    btn.addEventListener("click", () => downloadVCard(btn.dataset.name, btn.dataset.phone));
  });

  const askAiBtn = $("askAiBtn");
  if (askAiBtn) askAiBtn.onclick = () => {
    const rawQ = ($("aiQuestion")?.value || "");
    const q = rawQ.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"'׳״]/g, " ").replace(/\s+/g, " ").trim();
    const aiAnswer = $("aiAnswer");
    if (!aiAnswer) return;

    if (faqContactFallback) faqContactFallback.classList.add("hidden");

    if (!q) {
      aiAnswer.innerHTML = `<div class="timeline-item">כתבו שאלה קצרה כדי לקבל כיוון ראשוני.</div>`;
      if (faqContactFallback) faqContactFallback.classList.remove("hidden");
      return;
    }

    let answer = "לא מצאתי תשובה מדויקת. במקרים דחופים, מומלץ לחייג למוקד ביטוח לאומי בטלפון 6050* או לבדוק את אזור גורמי הסיוע באתר.";
    if (q.includes("לאן") || q.includes("קודם") || q.includes("first")) {
      answer = "ברוב המקרים כדאי להתחיל מביטוח לאומי — נפגעי פעולות איבה, ובמקביל לבדוק תמיכה רגשית דרך מרכז חוסן או נט״ל.";
    } else if (q.includes("ילד") || q.includes("ילדים") || q.includes("youth")) {
      answer = "לילדים ובני נוער כדאי לבדוק את עטופים באהבה, חמניות ונט״ל לפי הצורך הרגשי והמשפחתי.";
    } else if (q.includes("טופס") || q.includes("582")) {
      answer = "אם מדובר בזכויות למשפחה של נרצח בפעולת איבה, כדאי לבדוק את טופס 582 ואת עמודי המידע של ביטוח לאומי למשפחות השכולות.";
    } else if (q.includes("רגשי") || q.includes("טראומה") || q.includes("נפשי")) {
      answer = "לתמיכה רגשית, נקודת התחלה טובה היא מרכז חוסן או נט״ל, ובמקרים מסוימים גם OneFamily.";
    } else if (q.includes("כסף") || q.includes("קצבה") || q.includes("תגמול")) {
      answer = "לשאלות על כסף, קצבה או תגמול, נקודת ההתחלה המרכזית היא ביטוח לאומי — נפגעי פעולות איבה.";
    } else if (q.includes("עבודה") || q.includes("תעסוקה")) {
      answer = "בשאלות על עבודה, כושר תעסוקתי או המשך טיפול מול הרשויות, כדאי להתחיל מביטוח לאומי ובמקביל לבדוק אם יש ליווי רגשי רלוונטי.";
    } else if (q.includes("הלוויה") || q.includes("קבורה")) {
      answer = "בנושאי הלוויה וקבורה כדאי לבדוק מול הגוף הרשמי המטפל, ובמקרים של זכויות והחזרים — מול ביטוח לאומי.";
    } else if (q.includes("חו") || q.includes("בינלאומי") || q.includes("תרומות") || q.includes("פדרציות") || q.includes("אנגלית") || q.includes("onefamily")) {
      answer = "לסיוע מחו״ל כדאי לבדוק את קרן נפגעי הטרור של הסוכנות היהודית, את OneFamily, ובמידת הצורך גם לחפש עמותות נוספות דרך גיידסטאר ישראל.";
    } else if (q.includes("מלגות") || q.includes("לימודים")) {
      answer = "למלגות לימודים כדאי לבדוק את אזור מלגות והטבות באתר, כולל אור למשפחות, יד לבנים ומלגת קק״ל — קרן ניקולא באומן.";
    }
    aiAnswer.innerHTML = `<div class="timeline-item">${answer}</div>`;
    if (answer.startsWith("לא מצאתי") && faqContactFallback) faqContactFallback.classList.remove("hidden");
  };

  const helpMapEl = $("helpMap");
  let map = null;
  if (helpMapEl && window.L) {
    map = L.map("helpMap").setView([31.55, 34.75], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    mapPoints.forEach((p) => {
      L.marker([p.lat, p.lng]).addTo(map).bindPopup(
        `<strong>${p.name}</strong><br>${p.type}<br>${p.address}<br><small>מיקום להמחשה.</small>`
      );
    });
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  const locateMeBtn = $("locateMeBtn");
  if (locateMeBtn) locateMeBtn.onclick = () => {
    const btn = locateMeBtn;
    const mapStatus = $("mapStatus");
    const defaultLabel = "מצא מרכז קרוב אליי";
    btn.textContent = "מאתר מיקום... ⏳";
    btn.disabled = true;

    if (!navigator.geolocation) {
      if (mapStatus) mapStatus.textContent = "הדפדפן לא תומך באיתור מיקום.";
      btn.textContent = defaultLabel;
      btn.disabled = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        if (map) {
          map.setView([userLat, userLng], 10);
          L.marker([userLat, userLng]).addTo(map).bindPopup("המיקום שלי");
        }
        const nearest = mapPoints
          .map((p) => ({...p, distance: haversineKm(userLat, userLng, p.lat, p.lng)}))
          .sort((a,b) => a.distance - b.distance)[0];
        if (mapStatus && nearest) {
          mapStatus.textContent = `מתוך הנקודות שכבר הוזנו במפה, הקרוב ביותר הוא: ${nearest.name} (${nearest.distance.toFixed(1)} ק״מ)`;
        }
        btn.textContent = defaultLabel;
        btn.disabled = false;
      },
      () => {
        const mapStatus = $("mapStatus");
        if (mapStatus) mapStatus.textContent = "לא הצלחנו לקבל גישה למיקום.";
        btn.textContent = defaultLabel;
        btn.disabled = false;
      }
    );
  };


  const citySearchBtn = $("citySearchBtn");
  if (citySearchBtn) citySearchBtn.onclick = () => {
    const mapStatus = $("mapStatus");
    const term = ($("citySearchInput")?.value || "").trim().toLowerCase();
    if (!term) {
      if (mapStatus) mapStatus.textContent = "כתבו שם עיר או יישוב כדי לחפש.";
      return;
    }
    const match = mapPoints.find((p) => (p.name + " " + (p.address || "")).toLowerCase().includes(term));
    if (!match) {
      if (mapStatus) mapStatus.textContent = "לא מצאנו נקודה תואמת במפה. נסו עיר אחרת או השתמשו בכפתור איתור מיקום.";
      return;
    }
    if (map) {
      map.setView([match.lat, match.lng], 11);
      L.popup().setLatLng([match.lat, match.lng]).setContent(`<strong>${match.name}</strong><br>${match.address || ""}`).openOn(map);
    }
    if (mapStatus) mapStatus.textContent = `נמצאה נקודה: ${match.name}`;
  };

  const footer = document.querySelector(".site-footer");
  if (footer && floatingBreatheBtn && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          floatingBreatheBtn.style.opacity = "0";
          floatingBreatheBtn.style.pointerEvents = "none";
        } else {
          floatingBreatheBtn.style.opacity = "1";
          floatingBreatheBtn.style.pointerEvents = "auto";
        }
      });
    }, { threshold: 0.15 });
    observer.observe(footer);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-faq-tag]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = document.getElementById("aiQuestion");
      const askBtn = document.getElementById("askAiBtn");
      if (q) q.value = btn.dataset.faqTag;
      if (askBtn) askBtn.click();
      const faq = document.getElementById("aiAssistant");
      if (faq) faq.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  document.querySelectorAll('.checklist input').forEach((box) => {
    const key = "check_" + box.dataset.check;
    const saved = localStorage.getItem(key);
    if (saved === "true") box.checked = true;
    box.addEventListener("change", () => localStorage.setItem(key, String(box.checked)));
  });

  const copyChecklistBtn = document.getElementById("copyChecklistBtn");
  if (copyChecklistBtn) copyChecklistBtn.onclick = async () => {
    const labels = [...document.querySelectorAll(".checklist li")].map((li) => li.innerText.trim());
    await navigator.clipboard.writeText(labels.map(t => "• " + t).join("\n"));
    const old = copyChecklistBtn.textContent;
    copyChecklistBtn.textContent = "הועתק";
    setTimeout(() => copyChecklistBtn.textContent = old, 1500);
  };

  const clearChecklistBtn = document.getElementById("clearChecklistBtn");
  if (clearChecklistBtn) clearChecklistBtn.onclick = () => {
    document.querySelectorAll('.checklist input').forEach((box) => {
      box.checked = false;
      localStorage.removeItem("check_" + box.dataset.check);
    });
  };

  let currentOrgEmail = "";
  const modal = document.getElementById("contactModal");
  const orgNameEl = document.getElementById("targetOrgName");
  const modalNote = document.getElementById("contactModalNote");
  const closeModal = () => {
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  };
  document.querySelectorAll(".quick-contact-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentOrgEmail = btn.dataset.email || "";
      if (orgNameEl) orgNameEl.textContent = btn.dataset.org || "";
      if (modalNote) {
        modalNote.textContent = currentOrgEmail
          ? "אפשר ליצור טיוטת מייל ישירות לכתובת המוכרת לנו."
          : "לא שמרנו כאן כתובת מייל ישירה של הארגון, לכן תיפתח טיוטת מייל ללא נמען ותוכלו להשלים את הכתובת ידנית.";
      }
      if (modal) {
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
      }
      document.getElementById("qName")?.focus();
    });
  });
  document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.getElementById("sendQuickMailBtn")?.addEventListener("click", () => {
    const bodyText = (document.getElementById("letterOutput")?.value || "").trim();
    const emailTo = window.selectedOrgEmail || currentOrgEmail || "";
    const subject = encodeURIComponent("פנייה בנושא זכויות וסיוע - משפחת 7.10");
    const body = encodeURIComponent(bodyText).replace(/%0A/g, "%0D%0A");

    if (!bodyText) return;
    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
    closeModal();
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const benefitsData = [
    {
      title: "מענק סיוע כספי מיידי - הסוכנות היהודית",
      desc: "סיוע ראשוני למשפחות שאיבדו קרוב משפחה ב-7.10 דרך הקרן לנפגעי טרור.",
      link: "https://www.jewishagency.org/he/terror-victims-fund/",
      contactEmail: "fund@jafi.org",
      roles: ["parent", "partner", "child", "sibling"],
      tags: ["סיוע כספי", "דחוף"],
      defaultNeed: "מענק כספי"
    },
    {
      title: "טיפול רגשי ומרכזי חוסן - נט״ל",
      desc: "סיוע נפשי ממוקד טראומה ואובדן לכל בני המשפחה, כולל קו סיוע 24/7.",
      link: "https://www.natal.org.il/",
      contactEmail: "info@natal.org.il",
      roles: ["parent", "partner", "child", "sibling", "grandparent"],
      tags: ["סיוע נפשי", "טיפול"],
      defaultNeed: "סיוע נפשי"
    },
    {
      title: "מלגות לימודים - אור למשפחות",
      desc: "מלגות לימודים, ימי העצמה וליווי אישי לאחים והורים שכולים.",
      link: "https://www.or4family.org.il/",
      contactEmail: "office@or-lfamily.org",
      roles: ["parent", "sibling"],
      tags: ["מלגות", "לימודים"],
      defaultNeed: "מלגות"
    },
    {
      title: "עמותת חמניות - ליווי יתומים",
      desc: "קהילה תומכת וליווי רגשי חברתי לילדים ובני נוער שאיבדו הורה.",
      link: "https://www.hamaniot.org/",
      contactEmail: "office@hamaniot.org",
      roles: ["child"],
      tags: ["יתומים", "נוער"],
      defaultNeed: "סיוע נפשי"
    },
    {
      title: "OneFamily - מעטפת שיקום מלאה",
      desc: "ליווי רב-תחומי הכולל סיוע כלכלי, משפטי ופנאי למשפחות השכול.",
      link: "https://onefamilyovercomingtogether.org/he/",
      contactEmail: "info@onefamily.org.il",
      roles: ["parent", "partner", "child", "sibling"],
      tags: ["סיוע כללי", "שיקום"],
      defaultNeed: "מענק כספי"
    },
    {
      title: "ארגון יד לבנים - זכויות והנצחה",
      desc: "הארגון היציג לטיפול במשפחות השכולות, הנצחה וזכויות מול משרד הביטחון.",
      link: "https://yadlabanim.org/",
      contactEmail: "info@yadlabanim.org.il",
      roles: ["parent", "sibling"],
      tags: ["זכויות", "הנצחה"],
      defaultNeed: "כללי"
    }
  ];

  window.openQuickContact = function(orgName, orgEmail, defaultNeed) {
    const targetInput = document.getElementById("letterTarget");
    const needSelect = document.getElementById("letterNeed");
    const outputArea = document.getElementById("letterOutput");

    if (targetInput) targetInput.value = orgName;
    if (needSelect) needSelect.value = defaultNeed || "כללי";

    window.selectedOrgEmail = orgEmail || "";

    if (typeof buildLetterText === "function" && outputArea) {
      outputArea.value = buildLetterText();
    }

    const waBtn = document.getElementById("sendLetterWhatsappBtn");
    if (waBtn) waBtn.disabled = !(outputArea && outputArea.value.trim());

    document.getElementById("letters")?.scrollIntoView({ behavior: "smooth", block: "start" });

    const modal = document.getElementById("contactModal");
    if (modal) {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    }

    console.log(`מכתב ל-${orgName} הוכן בהצלחה.`);
  };

  const output = document.getElementById("matchedBenefitsOutput");
  const checks = () => [...document.querySelectorAll(".role-check:checked")].map(el => el.value);

  function renderMatchedBenefits() {
    if (!output) return;
    const selected = checks();
    localStorage.setItem("selected_roles", JSON.stringify(selected));

    if (!selected.length) {
      output.innerHTML = '<div class="empty-state">בחרו את הקרבה שלכם כדי לראות גופי סיוע רלוונטיים.</div>';
      return;
    }

    const matches = benefitsData.filter(item => item.roles.some(role => selected.includes(role)));
    const priorityWords = ["מענק", "נט״ל", "סיוע", "ביטוח"];
    matches.sort((a, b) => {
      const ap = priorityWords.some(w => a.title.includes(w)) ? 1 : 0;
      const bp = priorityWords.some(w => b.title.includes(w)) ? 1 : 0;
      return bp - ap;
    });

    output.innerHTML = matches.map(item => {
      const urgent = priorityWords.some(w => item.title.includes(w));
      return `
      <article class="benefit-card ${urgent ? "priority" : ""}">
        ${urgent ? `<div class="benefit-priority">כדאי לבדוק קודם</div>` : ""}
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        <div class="benefit-tags">
          ${item.tags.map(tag => `<span class="benefit-tag">${tag}</span>`).join("")}
        </div>
        <div class="benefit-actions">
          <button class="btn btn-primary btn-sm" type="button" onclick="openQuickContact('${item.title.replace(/'/g, "\'")}', '${(item.contactEmail || "").replace(/'/g, "\'")}', '${(item.defaultNeed || "כללי").replace(/'/g, "\'")}')">פנייה מהירה מהאתר</button>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">לאתר הארגון</a>
        </div>
      </article>`;
    }).join("");
  }

  const saved = JSON.parse(localStorage.getItem("selected_roles") || "[]");
  document.querySelectorAll(".role-check").forEach((cb) => {
    if (saved.includes(cb.value)) cb.checked = true;
    cb.addEventListener("change", renderMatchedBenefits);
  });

  document.getElementById("showBenefitsBtn")?.addEventListener("click", () => {
    renderMatchedBenefits();
    document.getElementById("matchedBenefits")?.scrollIntoView({behavior:"smooth", block:"start"});
  });

  document.getElementById("clearRolesBtn")?.addEventListener("click", () => {
    document.querySelectorAll(".role-check").forEach((cb) => cb.checked = false);
    localStorage.removeItem("selected_roles");
    renderMatchedBenefits();
  });

  renderMatchedBenefits();
});

document.addEventListener("DOMContentLoaded", () => {
  const backToTopBtn = document.getElementById("backToTopBtn");
  const globalResetBtn = document.getElementById("globalResetBtn");

  const toggleBackToTop = () => {
    if (!backToTopBtn) return;
    const scrolled = window.scrollY;
    const threshold = document.documentElement.scrollHeight * 0.35;
    backToTopBtn.classList.toggle("show", scrolled > threshold);
  };
  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  globalResetBtn?.addEventListener("click", () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("draft_") || key.startsWith("check_") || key === "selected_roles" || key.startsWith("step_")) {
        localStorage.removeItem(key);
      }
    });
    window.location.reload();
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".top-nav");
  const navToggleBtn = document.getElementById("navToggleBtn");
  const navLinks = document.getElementById("navLinks");

  if (nav && navToggleBtn && navLinks) {
    navToggleBtn.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("menu-open");
      navToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggleBtn.textContent = isOpen ? "✕ סגירה" : "☰ תפריט";
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 680) {
          nav.classList.remove("menu-open");
          navToggleBtn.setAttribute("aria-expanded", "false");
          navToggleBtn.textContent = "☰ תפריט";
        }
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === target);
      });
    });
  });
  const panels = [...document.querySelectorAll(".step-panel")];
  const badges = [...document.querySelectorAll(".step-badge")];
  function setStep(n){
    panels.forEach((p,idx)=>p.classList.toggle("active", idx===n-1));
    badges.forEach((b,idx)=>b.classList.toggle("active", idx===n-1));
  }
  document.getElementById("toStep2Btn")?.addEventListener("click", ()=>setStep(2));
  document.getElementById("backToStep1Btn")?.addEventListener("click", ()=>setStep(1));
  document.getElementById("toStep3Btn")?.addEventListener("click", ()=>setStep(3));
});
