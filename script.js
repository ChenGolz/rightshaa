
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js?v=31", { updateViaCache: "none" });
  });
}

const mapPoints = [
  {name:"מרכז חוסן — אופקים", type:"מרכז חוסן", lat:31.315, lng:34.621, address:"קיבוץ גלויות 57, אופקים"},
  {name:"מרכז חוסן — נתיבות", type:"מרכז חוסן", lat:31.423, lng:34.589, address:"חר״ש 76, נתיבות"},
  {name:"מרכז חוסן — אשקלון", type:"מרכז חוסן", lat:31.669, lng:34.571, address:"צה״ל 99, אשקלון"},
  {name:"ביטוח לאומי — ירושלים", type:"ביטוח לאומי", lat:31.778, lng:35.221, address:"בן שטח 4, ירושלים"}
];

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

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

  const smartDeathDate = $("smartDeathDate");
  const smartTimelineOutput = $("smartTimelineOutput");
  const trackerStart = $("trackerStart");
  const trackerOutput = $("trackerOutput");
  const trackerTrack = $("trackerTrack");

  const setError = (id, text) => {
    const el = $(id + "Error");
    if (el) el.textContent = text || "";
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
    const need = (letterNeed?.value || "מידע על זכויות וסיוע").trim();
    const phone = (letterPhone?.value || "").trim();
    const email = (letterEmail?.value || "").trim();

    const lines = [];
    lines.push("לכבוד " + target + ",");
    lines.push("");
    lines.push("שלום רב,");
    lines.push("אני פונה אליכם בבקשה לקבל מידע, הכוונה וסיוע בנוגע לזכויות של משפחה שכולה מאירועי 7 באוקטובר 2023.");
    lines.push("");

    if (name || idNum || relation || deceased || lossDate) {
      lines.push("להלן פרטי הפנייה:");
      if (name) lines.push("• שם הפונה: " + name);
      if (idNum) lines.push("• תעודת זהות: " + idNum);
      if (deceased) lines.push("• שם הנפטר/ת: " + deceased);
      if (relation) lines.push("• קרבה לנפטר/ת: " + relation);
      if (lossDate) lines.push("• תאריך האובדן: " + lossDate);
      lines.push("");
    }

    lines.push("נושא הפנייה: בקשה ל" + need + ".");
    lines.push("אודה לקבלת מידע נוסף על הזכויות, המסמכים הנדרשים והשלבים הבאים להמשך טיפול.");
    lines.push("");

    if (phone || email) {
      lines.push("ניתן לחזור אליי באמצעות:");
      if (phone) lines.push("• טלפון: " + phone);
      if (email) lines.push("• אימייל: " + email);
      lines.push("");
    }

    lines.push("תודה רבה על זמנכם ועל עזרתכם.");
    lines.push("");
    lines.push("בברכה,");
    if (name) lines.push(name);

    return lines.join("\\n");
  }

  const requestForm = $("requestForm");
  if (requestForm) {
    requestForm.addEventListener("submit", (e) => e.preventDefault());
  }

  $("generateLetter").onclick = () => {
    setError("letterDate", "");
    if (isFutureDate(letterDate.value)) {
      setError("letterDate", "נא להזין תאריך מהעבר.");
      return;
    }
    letterOutput.value = buildLetterText();
  };

  $("copyLetter").onclick = async () => {
    if (!letterOutput.value) letterOutput.value = buildLetterText();
    await navigator.clipboard.writeText(letterOutput.value);
    const old = $("copyLetter").textContent;
    $("copyLetter").textContent = "הועתק";
    setTimeout(() => $("copyLetter").textContent = old, 1600);
  };

  function downloadPdf() {
    if (!letterOutput.value) letterOutput.value = buildLetterText();
    const wrapper = document.createElement("div");
    wrapper.style.padding = "32px";
    wrapper.style.fontFamily = "Arial, sans-serif";
    wrapper.style.direction = "rtl";
    wrapper.style.lineHeight = "1.8";
    wrapper.innerText = letterOutput.value || "";
    html2pdf().set({
      margin: 10,
      filename: "pniya-710.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(wrapper).save();
  }
  $("downloadPdfBtn").onclick = downloadPdf;
  $("downloadPdfTop").onclick = downloadPdf;

  $("generateMailBtn").onclick = () => {
    if (!letterOutput.value) letterOutput.value = buildLetterText();

    const name = (letterName?.value || "").trim();
    const idNum = (letterId?.value || "").trim();
    const deceased = (letterDeceased?.value || "").trim();

    let subjectText = "פנייה בנושא זכויות וסיוע למשפחת 7.10";
    if (deceased && idNum) {
      subjectText += ` - ${deceased} / ת"ז ${idNum}`;
    } else if (deceased) {
      subjectText += ` - ${deceased}`;
    } else if (name && idNum) {
      subjectText += ` - ${name} (ת"ז ${idNum})`;
    } else if (name) {
      subjectText += ` - ${name}`;
    } else if (idNum) {
      subjectText += ` - ת"ז ${idNum}`;
    }

    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(letterOutput.value || "").replace(/%0A/g, "%0D%0A");
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  function calculateDates(dateValue) {
    const d = new Date(dateValue);
    const shiva = new Date(d); shiva.setDate(d.getDate() + 7);
    const shloshim = new Date(d); shloshim.setDate(d.getDate() + 30);
    const elevenMonths = new Date(d); elevenMonths.setMonth(d.getMonth() + 11);
    const year = new Date(d); year.setFullYear(d.getFullYear() + 1);
    return { shiva, shloshim, elevenMonths, year };
  }

  function renderSmartTimeline(value) {
    const dates = calculateDates(value);
    smartTimelineOutput.innerHTML = `
      <div class="timeline-item"><strong>סיום השבעה:</strong> ${dates.shiva.toLocaleDateString("he-IL")}</div>
      <div class="timeline-item"><strong>שלושים:</strong> ${dates.shloshim.toLocaleDateString("he-IL")}</div>
      <div class="timeline-item"><strong>י״א חודש:</strong> ${dates.elevenMonths.toLocaleDateString("he-IL")}</div>
      <div class="timeline-item"><strong>אזכרת שנה:</strong> ${dates.year.toLocaleDateString("he-IL")}</div>
    `;
  }

  if (letterDate) {
    letterDate.addEventListener("input", () => {
      setError("letterDate", isFutureDate(letterDate.value) ? "נא להזין תאריך מהעבר." : "");
    });
    letterDate.addEventListener("change", () => {
      if (letterDate.value && !isFutureDate(letterDate.value)) {
        smartDeathDate.value = letterDate.value;
        renderSmartTimeline(letterDate.value);
      }
    });
  }

  $("buildSmartTimeline").onclick = () => {
    setError("smartDeathDate", "");
    if (!smartDeathDate.value) {
      setError("smartDeathDate", "נא להזין תאריך.");
      return;
    }
    if (isFutureDate(smartDeathDate.value)) {
      setError("smartDeathDate", "נא להזין תאריך מהעבר.");
      return;
    }
    renderSmartTimeline(smartDeathDate.value);
  };

  $("clearSmartTimeline").onclick = () => {
    smartDeathDate.value = "";
    smartTimelineOutput.innerHTML = "";
    setError("smartDeathDate", "");
  };

  $("addMemorialCalendarBtn").onclick = () => {
    const sourceDate = smartDeathDate.value || letterDate.value;
    setError("smartDeathDate", "");
    if (!sourceDate) {
      setError("smartDeathDate", "נא להזין תאריך קודם.");
      return;
    }
    if (isFutureDate(sourceDate)) {
      setError("smartDeathDate", "נא להזין תאריך מהעבר.");
      return;
    }
    const memorialDate = new Date(sourceDate);
    memorialDate.setFullYear(memorialDate.getFullYear() + 1);
    const endDate = new Date(memorialDate);
    endDate.setHours(endDate.getHours() + 1);
    const start = memorialDate.toISOString().replace(/[-:]|\\.\\d{3}/g, "").slice(0,15) + "Z";
    const end = endDate.toISOString().replace(/[-:]|\\.\\d{3}/g, "").slice(0,15) + "Z";
    const title = encodeURIComponent("אזכרת שנה ליקירנו");
    window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}`, "_blank");
  };

  $("buildTracker").onclick = () => {
    setError("trackerStart", "");
    if (!trackerStart.value) {
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

    if (trackerTrack.value.includes("חוסן")) {
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
  };

  $("clearTracker").onclick = () => {
    trackerStart.value = "";
    trackerOutput.innerHTML = "";
    setError("trackerStart", "");
  };

  $("shareSiteBtn").onclick = () => {
    const url = window.location.href;
    const text = encodeURIComponent("מצאתי אתר שעוזר למשפחות שכולות מאירועי 7.10 להתמודד עם זכויות, בירוקרטיה ותמיכה: " + url);
    window.open("https://wa.me/?text=" + text, "_blank");
  };

  $("floatingBreathe").onclick = () => {
    $("breatheSection").scrollIntoView({behavior:"smooth"});
  };

  const breatheCircle = $("breatheCircle");
  const breatheInnerText = $("breatheInnerText");
  const breatheStatus = $("breatheStatus");
  let breatheInterval = null;
  const cycle = [["שאיפה","inhale"],["החזקה","hold"],["נשיפה","exhale"],["החזקה","hold"]];

  function stopBreathing() {
    if (breatheInterval) clearInterval(breatheInterval);
    breatheInterval = null;
    breatheCircle.className = "breathe-circle";
    breatheInnerText.textContent = "נשימה";
    breatheStatus.textContent = "מוכנים להתחיל";
  }

  $("startBreathe").onclick = () => {
    stopBreathing();
    let i = 0;
    let rounds = 4;
    function nextPhase() {
      if (rounds <= 0) {
        stopBreathing();
        breatheStatus.textContent = "סיימתם דקה של נשימה.";
        return;
      }
      const [label, phase] = cycle[i];
      breatheCircle.className = "breathe-circle " + phase;
      breatheInnerText.textContent = label;
      breatheStatus.textContent = label + " — 4 שניות";
      i = (i + 1) % cycle.length;
      if (i === 0) rounds -= 1;
    }
    nextPhase();
    breatheInterval = setInterval(nextPhase, 4000);
  };

  $("stopBreathe").onclick = stopBreathing;

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

  $("askAiBtn").onclick = () => {
    const q = ($("aiQuestion").value || "").toLowerCase().trim();
    const aiAnswer = $("aiAnswer");
    if (!q) {
      aiAnswer.innerHTML = `<div class="timeline-item">כתבו שאלה קצרה כדי לקבל כיוון ראשוני.</div>`;
      return;
    }

    let answer = "לא מצאתי תשובה מדויקת. במקרים דחופים, מומלץ לחייג למוקד ביטוח לאומי בטלפון 6050* או להיעזר במוקדי החירום שמופיעים באתר.";
    if (q.includes("לאן") || q.includes("קודם") || q.includes("first")) {
      answer = "ברוב המקרים כדאי להתחיל מביטוח לאומי — נפגעי פעולות איבה, ובמקביל לבדוק תמיכה רגשית דרך מרכז חוסן או נט״ל.";
    } else if (q.includes("ילד") || q.includes("ילדים") || q.includes("youth")) {
      answer = "לילדים ובני נוער כדאי לבדוק את עטופים באהבה, חמניות, ונט״ל לפי הצורך הרגשי והמשפחתי.";
    } else if (q.includes("טופס") || q.includes("582")) {
      answer = "אם מדובר בזכויות למשפחה של נרצח בפעולת איבה, כדאי לבדוק את טופס 582 ואת עמודי המידע של ביטוח לאומי למשפחות השכולות.";
    } else if (q.includes("כסף") || q.includes("כלכל") || q.includes("תגמול") || q.includes("קצבה")) {
      answer = "לשאלות על קצבאות, תגמולים או סיוע כספי, נקודת ההתחלה הטובה ביותר היא ביטוח לאומי — נפגעי פעולות איבה, וכן פורטל זכויות 7.10 שמופיע באתר.";
    } else if (q.includes("עבודה") || q.includes("תעסוק")) {
      answer = "לשאלות תעסוקה, הכנסות או אובדן כושר עבודה, כדאי להתחיל מביטוח לאומי ולבדוק גם מסמכים רפואיים ותעסוקתיים רלוונטיים.";
    } else if (q.includes("הלוויה") || q.includes("קבורה")) {
      answer = "בנושאי קבורה, הלוויה או החזרים, כדאי לבדוק את עמודי המידע של ביטוח לאומי למשפחות השכולות ולפנות לגורם הרשמי המלווה.";
    } else if (q.includes("רגשי") || q.includes("טראומה") || q.includes("נפשי")) {
      answer = "לתמיכה רגשית, נקודת התחלה טובה היא מרכז חוסן או נט״ל, ובמקרים מסוימים גם OneFamily.";
    }
    aiAnswer.innerHTML = `<div class="timeline-item">${answer}</div>`;
  };

  const map = L.map("helpMap").setView([31.55, 34.75], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  mapPoints.forEach((p) => {
    L.marker([p.lat, p.lng]).addTo(map).bindPopup(
      `<strong>${p.name}</strong><br>${p.type}<br>${p.address}<br><small>מיקום להמחשה.</small>`
    );
  });

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

  $("locateMeBtn").onclick = () => {
    const btn = $("locateMeBtn");
    const mapStatus = $("mapStatus");
    const defaultLabel = "מצא מרכז קרוב אליי";
    btn.textContent = "מאתר מיקום... ⏳";
    btn.disabled = true;

    if (!navigator.geolocation) {
      mapStatus.textContent = "הדפדפן לא תומך באיתור מיקום.";
      btn.textContent = defaultLabel;
      btn.disabled = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        map.setView([userLat, userLng], 10);
        L.marker([userLat, userLng]).addTo(map).bindPopup("המיקום שלי");

        const nearest = mapPoints
          .map((p) => ({...p, distance: haversineKm(userLat, userLng, p.lat, p.lng)}))
          .sort((a,b) => a.distance - b.distance)[0];

        if (nearest) {
          mapStatus.textContent = `מתוך הנקודות שכבר הוזנו במפה, הקרוב ביותר הוא: ${nearest.name} (${nearest.distance.toFixed(1)} ק״מ)`;
        }
        btn.textContent = defaultLabel;
        btn.disabled = false;
      },
      () => {
        mapStatus.textContent = "לא הצלחנו לקבל גישה למיקום.";
        btn.textContent = defaultLabel;
        btn.disabled = false;
      }
    );
  };
});


document.addEventListener("DOMContentLoaded", () => {
  const floating = document.getElementById("floatingBreathe");
  const footer = document.querySelector("footer");
  if (floating && footer && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        floating.style.opacity = entry.isIntersecting ? "0" : "1";
        floating.style.pointerEvents = entry.isIntersecting ? "none" : "auto";
        floating.style.transform = entry.isIntersecting ? "translateY(12px)" : "translateY(0)";
      });
    }, { threshold: 0.1 });
    observer.observe(footer);
  }
});
