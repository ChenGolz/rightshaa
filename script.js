
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
   ? "1" : "0");
};
if (null === "1") document.body.classList.add("dark");
document.getElementById("printPlanBtn").onclick = () => window.print();

// letter generator
function buildLetter(){
  const name = document.getElementById("letterName").value || "________";
  const id = document.getElementById("letterId").value || "________";
  const relation = document.getElementById("letterRelation").value || "בן/בת משפחה";
  const deceased = document.getElementById("letterDeceased").value || "________";
  const date = document.getElementById("letterDate").value || "________";
  const target = document.getElementById("letterTarget").value || "________";
  const need = document.getElementById("letterNeed").value || "מידע על זכויות וסיוע";
  const phone = document.getElementById("letterPhone").value || "________";
  const email = document.getElementById("letterEmail").value || "________";
  const text = `לכבוד ${target},

שלום רב,

שמי ${name}, ת"ז ${id}, ואני ${relation} של ${deceased}, אשר נפטר/ה בתאריך ${date}.

אני פונה אליכם בבקשה לקבל ${need}, וכן מידע נוסף על הזכויות, המסמכים והצעדים הבאים שעשויים להיות רלוונטיים עבורי ועבור משפחתי.

אשמח לקבל הכוונה להמשך טיפול.

בברכה,
${name}
טלפון: ${phone}
אימייל: ${email}`;
  document.getElementById("letterOutput").value = text;
}
document.getElementById("generateLetter").onclick = buildLetter;
document.getElementById("copyLetter").onclick = async () => {
  const out = document.getElementById("letterOutput");
  if (!out.value) buildLetter();
  await navigator.clipboard.writeText(out.value);
  const btn = document.getElementById("copyLetter");
  const old = btn.textContent;
  btn.textContent = "הועתק";
  setTimeout(() => btn.textContent = old, 2000);
};
document.getElementById("printLetter").onclick = () => {
  if (!document.getElementById("letterOutput").value) buildLetter();
  const printBlock = document.getElementById("printLetterBlock");
  printBlock.innerText = document.getElementById("letterOutput").value;
  window.print();
};

// benefits timeline
document.getElementById("buildTracker").onclick = () => {
  const track = document.getElementById("trackerTrack").value;
  const start = document.getElementById("trackerStart").value;
  const out = document.getElementById("trackerOutput");
  if (!start){ out.innerHTML = "<div class='timeline-item'>נא להזין תאריך התחלה.</div>"; return; }
  const base = new Date(start);
  const plus = days => { const d = new Date(base); d.setDate(d.getDate()+days); return d; };
  const fmt = d => d.toLocaleDateString('he-IL');
  const items = track === "משרד הביטחון"
    ? [
      ["בדיקת פתיחת תיק והכרה", plus(7)],
      ["בדיקת טיפול רגשי וליווי משפחתי", plus(30)],
      ["בדיקת זכויות לימודים / סיוע כלכלי", plus(180)],
      ["בדיקת חלונות זמן שיכולים לפוג", plus(365)]
    ]
    : [
      ["בדיקת פתיחת תיק והכרה", plus(7)],
      ["בדיקת מענק ראשוני והחזרים", plus(30)],
      ["בדיקת טיפול רגשי / סל סיוע", plus(180)],
      ["בדיקת זכויות שעלולות לפוג", plus(365)]
    ];
  out.innerHTML = items.map(([label, d]) => `<div class="timeline-item"><strong>${label}:</strong> ${fmt(d)}</div>`).join("");
};
document.getElementById("clearTracker").onclick = () => {
  document.getElementById("trackerStart").value = "";
  document.getElementById("trackerOutput").innerHTML = "";
};

// Leaflet map
let map;
function initMap(){
  if (!window.L) return;
  map = L.map('helpMap').setView([31.8, 34.95], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  mapPoints.forEach(p => {
    const marker = L.marker([p.lat, p.lng]).addTo(map);
    marker.bindPopup(`<strong>${p.name}</strong><br>${p.type}<br>${p.address || ""}<br><small>כתובת מתוך מקור רשמי; מיקום המפה הוא להמחשה.</small>`);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initMap();
});

// breathe tool (modal + inline share same logic)
function setupBreather(circleId, statusId, startId, stopId){
  const circle = document.getElementById(circleId);
  const status = document.getElementById(statusId);
  let interval = null;
  const cycle = [["שאיפה","inhale"],["החזקה","hold"],["נשיפה","exhale"],["החזקה","hold"]];
  function setPhase(phase){ circle.className = "breathe-circle " + phase; }
  function stop(){
    if (interval) clearInterval(interval);
    interval = null;
    setPhase("");
    status.textContent = "מוכנים להתחיל";
  }
  function start(){
    stop();
    let i = 0; let rounds = 4;
    function nextPhase(){
      if (rounds <= 0){ stop(); status.textContent = "סיימתם דקה של נשימה."; return; }
      const [label, phase] = cycle[i];
      status.textContent = label + " — 4 שניות";
      setPhase(phase);
      i = (i + 1) % cycle.length;
      if (i === 0) rounds -= 1;
    }
    nextPhase();
    interval = setInterval(nextPhase, 4000);
  }
  document.getElementById(startId).onclick = start;
  document.getElementById(stopId).onclick = stop;
  return {start, stop};
}
const modalBreather = setupBreather("breatheCircle", "breatheStatus", "startBreathe", "stopBreathe");
setupBreather("breatheCircleInline", "breatheStatusInline", "startBreatheInline", "stopBreatheInline");

const modal = document.getElementById("breatheModal");
document.getElementById("openBreatheTop").onclick = () => modal.classList.remove("hidden");
document.getElementById("closeBreathe").onclick = () => { modal.classList.add("hidden"); modalBreather.stop(); };

// candle
function updateCandleUI(){
  const until = Number(null || "0");
  const candle = document.getElementById("candle");
  const status = document.getElementById("candleStatus");
  if (!until || Date.now() > until){
    localStorage.removeItem("candle_until");
    candle.classList.remove("lit");
    status.textContent = "הנר כבוי.";
    return;
  }
  candle.classList.add("lit");
  status.textContent = "הנר דולק בדפדפן שלכם ל‑24 שעות.";
}
document.getElementById("lightCandle").onclick = () => {
   + 24*60*60*1000));
  updateCandleUI();
};
document.getElementById("clearCandle").onclick = () => {
  localStorage.removeItem("candle_until");
  updateCandleUI();
};
updateCandleUI();


// validation + persistence
const letterFieldIds = ["letterName","letterId","letterDeceased","letterDate","letterPhone","letterEmail"];
letterFieldIds.forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  const saved = null;
  if (saved) el.value = saved;
  el.addEventListener("input", () => );
});
["letterRelation","letterTarget","letterNeed","trackerTrack","trackerStart"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  const saved = null;
  if (saved) el.value = saved;
  el.addEventListener("change", () => );
});

const originalBuildLetter = buildLetter;
buildLetter = function(){
  const dateVal = document.getElementById("letterDate").value;
  if (dateVal && new Date(dateVal) > new Date()){
    alert("נא להזין תאריך עבר תקין.");
    return;
  }
  originalBuildLetter();
}

const originalTrackerHandler = document.getElementById("buildTracker").onclick;
document.getElementById("buildTracker").onclick = () => {
  const start = document.getElementById("trackerStart").value;
  if (start && new Date(start) > new Date()){
    alert("נא להזין תאריך עבר תקין.");
    return;
  }
  originalTrackerHandler();
};

// accessibility: modal focus
const breatheModal = document.getElementById("breatheModal");
const closeBreatheBtn = document.getElementById("closeBreathe");
document.getElementById("openBreatheTop").addEventListener("click", () => {
  setTimeout(() => closeBreatheBtn.focus(), 0);
});
closeBreatheBtn.setAttribute("aria-label","סגירת חלון הנשימה");

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  const ld = document.getElementById("letterDate");
  const ts = document.getElementById("trackerStart");
  if (ld) ld.max = today;
  if (ts) ts.max = today;
});


function setFieldError(id, msg){
  const el = document.getElementById(id + "Error");
  if (el) el.textContent = msg || "";
}
function isFutureDate(value){
  return value && new Date(value) > new Date();
}

// override validations to be inline
document.getElementById("generateLetter").addEventListener("click", () => {
  const dateVal = document.getElementById("letterDate").value;
  setFieldError("letterDate", "");
  if (isFutureDate(dateVal)){
    setFieldError("letterDate", "תאריך לא יכול להיות בעתיד.");
  }
}, true);

document.getElementById("buildTracker").addEventListener("click", () => {
  const dateVal = document.getElementById("trackerStart").value;
  setFieldError("trackerStart", "");
  if (isFutureDate(dateVal)){
    setFieldError("trackerStart", "תאריך לא יכול להיות בעתיד.");
  }
}, true);

// friendly validation replacing alert behavior
const oldBuildLetterV15 = buildLetter;
buildLetter = function(){
  const dateVal = document.getElementById("letterDate").value;
  setFieldError("letterDate", "");
  if (isFutureDate(dateVal)) return;
  oldBuildLetterV15();
};

const oldTrackerBuildV15 = document.getElementById("buildTracker").onclick;
document.getElementById("buildTracker").onclick = () => {
  const start = document.getElementById("trackerStart").value;
  setFieldError("trackerStart", "");
  if (isFutureDate(start)) return;
  oldTrackerBuildV15();
};

// smart timeline
function calculateDates(deathDate) {
  const d = new Date(deathDate);
  const shivaEnd = new Date(d); shivaEnd.setDate(d.getDate() + 7);
  const thirtyDays = new Date(d); thirtyDays.setDate(d.getDate() + 30);
  const elevenMonths = new Date(d); elevenMonths.setMonth(d.getMonth() + 11);
  const oneYear = new Date(d); oneYear.setFullYear(d.getFullYear() + 1);
  return {
      shiva: shivaEnd.toLocaleDateString('he-IL'),
      shloshim: thirtyDays.toLocaleDateString('he-IL'),
      elevenMonths: elevenMonths.toLocaleDateString('he-IL'),
      year: oneYear.toLocaleDateString('he-IL')
  };
}
const smartDeathDate = document.getElementById("smartDeathDate");
const savedSmartDate = null;
if (savedSmartDate) smartDeathDate.value = savedSmartDate;
smartDeathDate.addEventListener("change", ()=> );

document.getElementById("buildSmartTimeline").onclick = () => {
  const val = smartDeathDate.value;
  setFieldError("smartDeathDate", "");
  if (!val) return;
  if (isFutureDate(val)){
    setFieldError("smartDeathDate", "תאריך לא יכול להיות בעתיד.");
    return;
  }
  const out = document.getElementById("smartTimelineOutput");
  const dates = calculateDates(val);
  out.innerHTML = `
    <div class="timeline-item"><strong>סיום השבעה:</strong> ${dates.shiva}</div>
    <div class="timeline-item"><strong>שלושים:</strong> ${dates.shloshim}</div>
    <div class="timeline-item"><strong>י״א חודש:</strong> ${dates.elevenMonths}</div>
    <div class="timeline-item"><strong>אזכרת שנה:</strong> ${dates.year}</div>
  `;
};
document.getElementById("clearSmartTimeline").onclick = () => {
  smartDeathDate.value = "";
  document.getElementById("smartTimelineOutput").innerHTML = "";
  localStorage.removeItem("persist_smartDeathDate");
};

// vCard contacts
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
document.querySelectorAll(".save-contact-btn").forEach(btn => {
  btn.addEventListener("click", () => downloadVCard(btn.dataset.name, btn.dataset.phone));
});

// private journal
const journal = document.getElementById("privateJournal");
const journalStatus = document.getElementById("journalStatus");
const savedJournal = null;
if (savedJournal) journal.value = savedJournal;
document.getElementById("saveJournalBtn").onclick = () => {
  
  journalStatus.textContent = "נשמר רק בדפדפן שלך.";
};
document.getElementById("clearJournalBtn").onclick = () => {
  journal.value = "";
  localStorage.removeItem("privateJournal");
  journalStatus.textContent = "נמחק מהדפדפן.";
};

// auto dark mode suggestion
document.addEventListener("DOMContentLoaded", () => {
  const hour = new Date().getHours();
  if (hour >= 19 && !null && !document.body.classList.contains("dark")){
    const should = confirm("השעה מאוחרת. לעבור למצב לילה כדי להקל על העיניים?");
    
    if (should){
      document.body.classList.add("dark");
      
    }
  }
});

// put text inside breath circles
function attachBreathInnerText(startId, stopId, innerId, statusId){
  const inner = document.getElementById(innerId);
  const status = document.getElementById(statusId);
  const origStart = document.getElementById(startId).onclick;
  const origStop = document.getElementById(stopId).onclick;
  if (origStart){
    document.getElementById(startId).onclick = () => {
      origStart();
      const observer = new MutationObserver(() => {
        const t = status.textContent.split("—")[0].trim() || "נשימה";
        inner.textContent = t;
      });
      observer.observe(status, {childList:true, characterData:true, subtree:true});
      document.getElementById(stopId)._observer = observer;
    };
  }
  document.getElementById(stopId).onclick = () => {
    if (document.getElementById(stopId)._observer) document.getElementById(stopId)._observer.disconnect();
    inner.textContent = "נשימה";
    origStop && origStop();
  };
}
attachBreathInnerText("startBreathe", "stopBreathe", "breatheInnerText", "breatheStatus");
attachBreathInnerText("startBreatheInline", "stopBreatheInline", "breatheInnerTextInline", "breatheStatusInline");


document.getElementById("downloadPdfBtn").onclick = () => {
  if (!document.getElementById("letterOutput").value) buildLetter();
  const wrapper = document.createElement("div");
  wrapper.style.padding = "32px";
  wrapper.style.fontFamily = "Arial, sans-serif";
  wrapper.style.direction = "rtl";
  wrapper.style.lineHeight = "1.8";
  wrapper.innerText = document.getElementById("letterOutput").value;
  html2pdf().set({
    margin: 10,
    filename: "letter.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  }).from(wrapper).save();
};


function setError(id, message){
  const el = document.getElementById(id + "Error");
  if (el) el.textContent = message || "";
}
function isFutureDateValue(v){
  if (!v) return false;
  const d = new Date(v);
  const now = new Date();
  d.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  return d > now;
}

// make max dates current
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  ["letterDate","trackerStart","smartDeathDate"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.max = today;
  });
});

// inline validation for letter date
const letterDateEl = document.getElementById("letterDate");
if (letterDateEl){
  letterDateEl.addEventListener("input", () => {
    setError("letterDate", isFutureDateValue(letterDateEl.value) ? "נא להזין תאריך מהעבר." : "");
  });
}

// preserve / sync date into smart timeline
const smartDateEl = document.getElementById("smartDeathDate");
if (smartDateEl){
  const saved = null;
  if (saved) smartDateEl.value = saved;
  smartDateEl.addEventListener("input", () => {
    
    setError("smartDeathDate", isFutureDateValue(smartDateEl.value) ? "נא להזין תאריך מהעבר." : "");
  });
}
if (letterDateEl && smartDateEl){
  letterDateEl.addEventListener("change", function(e){
    if (e.target.value && !smartDateEl.value) {
      smartDateEl.value = e.target.value;
      
    } else if (e.target.value) {
      smartDateEl.value = e.target.value;
      
    }
    if (e.target.value && !isFutureDateValue(e.target.value)) {
      buildSmartTimelineFromDate(e.target.value);
    }
  });
}

// override letter generation validation if needed
const originalGenerateLetterHandler = document.getElementById("generateLetter").onclick;
document.getElementById("generateLetter").onclick = () => {
  setError("letterDate", "");
  if (isFutureDateValue(letterDateEl.value)) {
    setError("letterDate", "נא להזין תאריך מהעבר.");
    return;
  }
  originalGenerateLetterHandler && originalGenerateLetterHandler();
};

// tracker validation without alerts
const trackerStartEl = document.getElementById("trackerStart");
const oldTrackerBtnHandler = document.getElementById("buildTracker").onclick;
document.getElementById("buildTracker").onclick = () => {
  setError("trackerStart", "");
  if (isFutureDateValue(trackerStartEl.value)) {
    setError("trackerStart", "נא להזין תאריך מהעבר.");
    return;
  }
  oldTrackerBtnHandler && oldTrackerBtnHandler();
};

// smart timeline
function calculateDates(deathDate) {
  const d = new Date(deathDate);
  const shiva = new Date(d); shiva.setDate(d.getDate() + 7);
  const shloshim = new Date(d); shloshim.setDate(d.getDate() + 30);
  const elevenMonths = new Date(d); elevenMonths.setMonth(d.getMonth() + 11);
  const oneYear = new Date(d); oneYear.setFullYear(d.getFullYear() + 1);
  return {
    shiva: shiva.toLocaleDateString('he-IL'),
    shloshim: shloshim.toLocaleDateString('he-IL'),
    elevenMonths: elevenMonths.toLocaleDateString('he-IL'),
    year: oneYear.toLocaleDateString('he-IL'),
    yearDate: oneYear
  };
}
function buildSmartTimelineFromDate(value){
  const out = document.getElementById("smartTimelineOutput");
  const dates = calculateDates(value);
  out.innerHTML = `
    <div class="timeline-item"><strong>סיום השבעה:</strong> ${dates.shiva}</div>
    <div class="timeline-item"><strong>שלושים:</strong> ${dates.shloshim}</div>
    <div class="timeline-item"><strong>י״א חודש:</strong> ${dates.elevenMonths}</div>
    <div class="timeline-item"><strong>אזכרת שנה:</strong> ${dates.year}</div>
  `;
}
document.getElementById("buildSmartTimeline").onclick = () => {
  const value = smartDateEl.value;
  setError("smartDeathDate", "");
  if (!value) return;
  if (isFutureDateValue(value)) {
    setError("smartDeathDate", "נא להזין תאריך מהעבר.");
    return;
  }
  buildSmartTimelineFromDate(value);
};
document.getElementById("clearSmartTimeline").onclick = () => {
  smartDateEl.value = "";
  localStorage.removeItem("persist_smartDeathDate");
  document.getElementById("smartTimelineOutput").innerHTML = "";
  setError("smartDeathDate", "");
};

function generateGoogleCalendarLink(deathDate) {
  const memorialDate = new Date(deathDate);
  memorialDate.setFullYear(memorialDate.getFullYear() + 1);
  const start = memorialDate.toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0,15) + "Z";
  const endDate = new Date(memorialDate);
  endDate.setHours(endDate.getHours() + 1);
  const end = endDate.toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0,15) + "Z";
  const title = encodeURIComponent("אזכרת שנה ליקירנו");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}`;
}
document.getElementById("addMemorialCalendarBtn").onclick = () => {
  const value = smartDateEl.value || letterDateEl.value;
  setError("smartDeathDate", "");
  if (!value) {
    setError("smartDeathDate", "נא להזין תאריך קודם.");
    return;
  }
  if (isFutureDateValue(value)) {
    setError("smartDeathDate", "נא להזין תאריך מהעבר.");
    return;
  }
  window.open(generateGoogleCalendarLink(value), "_blank");
};

// map geolocation
function haversineKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
document.addEventListener("DOMContentLoaded", () => {
  const locateBtn = document.getElementById("locateMeBtn");
  const mapStatus = document.getElementById("mapStatus");
  if (locateBtn) {
    locateBtn.addEventListener("click", () => {
      mapStatus.textContent = "";
      mapStatus.className = "note";
      if (!navigator.geolocation) {
        mapStatus.textContent = "הדפדפן לא תומך באיתור מיקום.";
        mapStatus.classList.add("map-status-error");
        return;
      }
      navigator.geolocation.getCurrentPosition((pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        if (window.map) {
          map.setView([userLat, userLng], 10);
          if (window._userMarker) map.removeLayer(window._userMarker);
          window._userMarker = L.marker([userLat, userLng]).addTo(map).bindPopup("מצא מרכז קרוב אליי");
        }
        const nearest = mapPoints
          .map(p => ({...p, distance: haversineKm(userLat, userLng, p.lat, p.lng)}))
          .sort((a,b) => a.distance - b.distance)[0];
        if (nearest) {
          mapStatus.textContent = `מתוך הנקודות שכבר הוזנו במפה, הקרוב ביותר הוא: ${nearest.name} (${nearest.distance.toFixed(1)} ק״מ)`;
          mapStatus.classList.add("map-status-ok");
        }
      }, () => {
        mapStatus.textContent = "לא הצלחנו לקבל גישה למיקום.";
        mapStatus.classList.add("map-status-error");
      });
    });
  }
});

// first 72h checklist persistence
document.querySelectorAll("[data-checklist]").forEach(box => {
  const key = box.dataset.checklist;
  box.checked = null === "true";
  box.addEventListener("change", () => ));
});

// true PDF download for generated letter
const pdfBtn = document.getElementById("downloadPdfBtn");
if (pdfBtn) {
  pdfBtn.addEventListener("click", () => {
    if (!document.getElementById("letterOutput").value && typeof buildLetter === "function") buildLetter();
    const wrapper = document.createElement("div");
    wrapper.style.padding = "32px";
    wrapper.style.fontFamily = "Arial, sans-serif";
    wrapper.style.direction = "rtl";
    wrapper.style.lineHeight = "1.8";
    wrapper.innerText = document.getElementById("letterOutput").value || "";
    html2pdf().set({
      margin: 10,
      filename: "letter.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(wrapper).save();
  });
}


// PWA service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}

// improved geolocation button feedback
document.addEventListener("DOMContentLoaded",()=>{
  const geoBtn = document.getElementById("locateMeBtn");
  if(!geoBtn) return;

  geoBtn.addEventListener("click",()=>{
    geoBtn.textContent = "מאתר מיקום... ⏳";
    geoBtn.disabled = true;

    navigator.geolocation.getCurrentPosition((pos)=>{
      geoBtn.textContent = "מצא מרכז קרוב אליי";
      geoBtn.disabled = false;
    },()=>{
      geoBtn.textContent = "שגיאה באיתור מיקום";
      geoBtn.disabled = false;
    });
  });
});

document.addEventListener("DOMContentLoaded",()=>{
 const btn=document.getElementById("shareSiteBtn");
 if(!btn) return;
 btn.onclick=()=>{
   const url=window.location.href;
   const text=encodeURIComponent("מצאתי אתר שעוזר למשפחות שכולות להתמודד עם הבירוקרטיה: "+url);
   window.open("https://wa.me/?text="+text,"_blank");
 };
});

document.addEventListener("DOMContentLoaded",()=>{
const fb=document.getElementById("floatingBreathe");
if(!fb) return;
fb.onclick=()=>{
 const el=document.getElementById("breatheSection")||document.getElementById("breathe");
 if(el) el.scrollIntoView({behavior:"smooth"});
};
});

document.addEventListener("DOMContentLoaded",()=>{
 const geoBtn=document.getElementById("locateMeBtn");
 if(!geoBtn) return;

 geoBtn.addEventListener("click",()=>{
  geoBtn.textContent="מאתר מיקום... ⏳";
  geoBtn.disabled=true;

  navigator.geolocation.getCurrentPosition(()=>{
    geoBtn.textContent="מצא מרכז קרוב אליי";
    geoBtn.disabled=false;
  },()=>{
    geoBtn.textContent="שגיאה באיתור מיקום";
    geoBtn.disabled=false;
  });
 });
});




// v23 robust request generator / privacy-safe mode
document.addEventListener("DOMContentLoaded", () => {
  const byId = (id) => document.getElementById(id);

  const letterName = byId("letterName");
  const letterId = byId("letterId");
  const letterRelation = byId("letterRelation");
  const letterDeceased = byId("letterDeceased");
  const letterDate = byId("letterDate");
  const letterTarget = byId("letterTarget");
  const letterNeed = byId("letterNeed");
  const letterPhone = byId("letterPhone");
  const letterEmail = byId("letterEmail");
  const letterOutput = byId("letterOutput");

  const generateLetterBtn = byId("generateLetter");
  const copyLetterBtn = byId("copyLetter");
  const pdfBtn = byId("downloadPdfBtn");
  const mailBtn = byId("generateMailBtn");

  function setError(id, text){
    const el = byId(id + "Error");
    if (el) el.textContent = text || "";
  }

  function isFutureDateValue(v){
    if (!v) return false;
    const d = new Date(v);
    if (isNaN(d)) return false;
    const today = new Date();
    d.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return d > today;
  }

  if (letterDate){
    const today = new Date().toISOString().split("T")[0];
    letterDate.max = today;
    letterDate.addEventListener("input", () => {
      setError("letterDate", isFutureDateValue(letterDate.value) ? "נא להזין תאריך מהעבר." : "");
    });
  }

  function buildGeneralLetter(){
    const name = (letterName?.value || "").trim();
    const idNum = (letterId?.value || "").trim();
    const relation = (letterRelation?.value || "").trim();
    const deceased = (letterDeceased?.value || "").trim();
    const lossDate = (letterDate?.value || "").trim();
    const target = (letterTarget?.value || "הגורם המטפל").trim();
    const need = (letterNeed?.value || "מידע על זכויות וסיוע").trim();
    const phone = (letterPhone?.value || "").trim();
    const email = (letterEmail?.value || "").trim();

    let lines = [];
    lines.push("לכבוד " + target + ",");
    lines.push("");
    lines.push("שלום רב,");
    lines.push("");

    if (name || idNum || relation || deceased || lossDate) {
      let intro = "אני פונה אליכם";
      const details = [];
      if (name) details.push("שמי " + name);
      if (idNum) details.push("ת״ז " + idNum);
      if (relation) details.push(relation + " של");
      if (deceased) details.push(deceased);
      if (lossDate) details.push("שהלך/ה לעולמו/ה בתאריך " + lossDate);
      if (details.length) intro = details.join(" ");
      lines.push(intro + ".");
    } else {
      lines.push("אני פונה אליכם בבקשה לקבל מידע, הכוונה וסיוע בנוגע לזכויות של משפחה שכולה.");
    }

    lines.push("");
    lines.push("אבקש לקבל " + need + ", וכן מידע נוסף על הזכויות, המסמכים הנדרשים והשלבים הבאים להמשך טיפול.");
    lines.push("");

    if (phone || email) {
      lines.push("ניתן לחזור אליי באמצעות:");
      if (phone) lines.push("טלפון: " + phone);
      if (email) lines.push("אימייל: " + email);
      lines.push("");
    }

    lines.push("תודה רבה על זמנכם ועל עזרתכם.");
    lines.push("");
    lines.push("בברכה,");

    if (name) lines.push(name);

    return lines.join("\n");
  }

  if (generateLetterBtn && letterOutput){
    generateLetterBtn.onclick = () => {
      setError("letterDate", "");
      if (letterDate && isFutureDateValue(letterDate.value)) {
        setError("letterDate", "נא להזין תאריך מהעבר.");
        return;
      }
      letterOutput.value = buildGeneralLetter();
    };
  }

  if (copyLetterBtn && letterOutput){
    copyLetterBtn.onclick = async () => {
      if (!letterOutput.value) letterOutput.value = buildGeneralLetter();
      await navigator.clipboard.writeText(letterOutput.value);
      const old = copyLetterBtn.textContent;
      copyLetterBtn.textContent = "הועתק";
      setTimeout(() => copyLetterBtn.textContent = old, 1800);
    };
  }

  if (pdfBtn && letterOutput){
    pdfBtn.onclick = () => {
      if (!letterOutput.value) letterOutput.value = buildGeneralLetter();
      const wrapper = document.createElement("div");
      wrapper.style.padding = "32px";
      wrapper.style.fontFamily = "Arial, sans-serif";
      wrapper.style.direction = "rtl";
      wrapper.style.lineHeight = "1.8";
      wrapper.innerText = letterOutput.value;
      if (window.html2pdf) {
        html2pdf().set({
          margin: 10,
          filename: "letter.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        }).from(wrapper).save();
      } else {
        window.print();
      }
    };
  }

  if (mailBtn && letterOutput){
    mailBtn.onclick = () => {
      if (!letterOutput.value) letterOutput.value = buildGeneralLetter();
      const subject = encodeURIComponent("בקשה למידע וסיוע למשפחה שכולה");
      const body = encodeURIComponent(letterOutput.value);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };
  }

  // Privacy: never store request-generator personal fields
  ["letterName","letterId","letterRelation","letterDeceased","letterDate","letterTarget","letterNeed","letterPhone","letterEmail"]
    .forEach((id) => {
      const el = byId(id);
      if (!el) return;
      try { localStorage.removeItem("persist_" + id); } catch(e) {}
      try { sessionStorage.removeItem("persist_" + id); } catch(e) {}
    });
});

// smart timeline reliable version
document.addEventListener("DOMContentLoaded", () => {
  const byId = (id) => document.getElementById(id);
  const smartDeathDate = byId("smartDeathDate");
  const smartOut = byId("smartTimelineOutput");
  const smartBuildBtn = byId("buildSmartTimeline");
  const smartClearBtn = byId("clearSmartTimeline");
  const memorialBtn = byId("addMemorialCalendarBtn");
  const letterDate = byId("letterDate");

  function setError(id, text){
    const el = byId(id + "Error");
    if (el) el.textContent = text || "";
  }
  function isFutureDateValue(v){
    if (!v) return false;
    const d = new Date(v);
    if (isNaN(d)) return false;
    const today = new Date();
    d.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return d > today;
  }
  function calculateDates(dateValue){
    const d = new Date(dateValue);
    const shiva = new Date(d); shiva.setDate(d.getDate() + 7);
    const shloshim = new Date(d); shloshim.setDate(d.getDate() + 30);
    const elevenMonths = new Date(d); elevenMonths.setMonth(d.getMonth() + 11);
    const year = new Date(d); year.setFullYear(d.getFullYear() + 1);
    return {shiva, shloshim, elevenMonths, year};
  }
  function renderTimeline(dateValue){
    if (!smartOut || !dateValue) return;
    const dates = calculateDates(dateValue);
    smartOut.innerHTML = `
      <div class="timeline-item"><strong>סיום השבעה:</strong> ${dates.shiva.toLocaleDateString('he-IL')}</div>
      <div class="timeline-item"><strong>שלושים:</strong> ${dates.shloshim.toLocaleDateString('he-IL')}</div>
      <div class="timeline-item"><strong>י״א חודש:</strong> ${dates.elevenMonths.toLocaleDateString('he-IL')}</div>
      <div class="timeline-item"><strong>אזכרת שנה:</strong> ${dates.year.toLocaleDateString('he-IL')}</div>
    `;
  }

  if (smartDeathDate){
    const today = new Date().toISOString().split("T")[0];
    smartDeathDate.max = today;
    smartDeathDate.addEventListener("input", () => {
      setError("smartDeathDate", isFutureDateValue(smartDeathDate.value) ? "נא להזין תאריך מהעבר." : "");
    });
  }

  if (letterDate && smartDeathDate){
    letterDate.addEventListener("change", () => {
      if (letterDate.value && !isFutureDateValue(letterDate.value)) {
        smartDeathDate.value = letterDate.value;
        renderTimeline(letterDate.value);
      }
    });
  }

  if (smartBuildBtn && smartDeathDate){
    smartBuildBtn.onclick = () => {
      setError("smartDeathDate", "");
      if (!smartDeathDate.value) return;
      if (isFutureDateValue(smartDeathDate.value)) {
        setError("smartDeathDate", "נא להזין תאריך מהעבר.");
        return;
      }
      renderTimeline(smartDeathDate.value);
    };
  }

  if (smartClearBtn && smartDeathDate && smartOut){
    smartClearBtn.onclick = () => {
      smartDeathDate.value = "";
      smartOut.innerHTML = "";
      setError("smartDeathDate", "");
    };
  }

  if (memorialBtn){
    memorialBtn.onclick = () => {
      const sourceDate = (smartDeathDate && smartDeathDate.value) || (letterDate && letterDate.value);
      setError("smartDeathDate", "");
      if (!sourceDate) {
        setError("smartDeathDate", "נא להזין תאריך קודם.");
        return;
      }
      if (isFutureDateValue(sourceDate)) {
        setError("smartDeathDate", "נא להזין תאריך מהעבר.");
        return;
      }
      const year = new Date(sourceDate);
      year.setFullYear(year.getFullYear() + 1);
      const end = new Date(year); end.setHours(end.getHours() + 1);
      const startStr = year.toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0,15) + "Z";
      const endStr = end.toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0,15) + "Z";
      const title = encodeURIComponent("אזכרת שנה ליקירנו");
      window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}`, "_blank");
    };
  }
});

// geolocation with loading feedback
document.addEventListener("DOMContentLoaded", () => {
  const geoBtn = document.getElementById("locateMeBtn");
  const mapStatus = document.getElementById("mapStatus");
  if (!geoBtn) return;
  const defaultLabel = "מצא מרכז קרוב אליי";

  geoBtn.addEventListener("click", () => {
    geoBtn.textContent = "מאתר מיקום... ⏳";
    geoBtn.disabled = true;
    if (!navigator.geolocation) {
      if (mapStatus) mapStatus.textContent = "הדפדפן לא תומך באיתור מיקום.";
      geoBtn.textContent = defaultLabel;
      geoBtn.disabled = false;
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        geoBtn.textContent = defaultLabel;
        geoBtn.disabled = false;
      },
      () => {
        if (mapStatus) mapStatus.textContent = "לא הצלחנו לקבל גישה למיקום.";
        geoBtn.textContent = defaultLabel;
        geoBtn.disabled = false;
      }
    );
  });
});

// share button
document.addEventListener("DOMContentLoaded", () => {
  const shareBtn = document.getElementById("shareSiteBtn");
  if (!shareBtn) return;
  shareBtn.onclick = () => {
    const url = window.location.href;
    const text = encodeURIComponent("מצאתי אתר שעוזר למשפחות שכולות להתמודד עם בירוקרטיה, זכויות ותמיכה: " + url);
    window.open("https://wa.me/?text=" + text, "_blank");
  };
});

// floating breathe button
document.addEventListener("DOMContentLoaded", () => {
  const fb = document.getElementById("floatingBreathe");
  if (!fb) return;
  fb.onclick = () => {
    const el = document.getElementById("breatheSection") || document.getElementById("breathe");
    if (el) el.scrollIntoView({behavior:"smooth"});
  };
});


// focused 7.10 labels for tracker
document.addEventListener("DOMContentLoaded", () => {
  const trackerTrack = document.getElementById("trackerTrack");
  const buildTracker = document.getElementById("buildTracker");
  const trackerOutput = document.getElementById("trackerOutput");
  const trackerStart = document.getElementById("trackerStart");
  const setTrackerError = (msg) => {
    const el = document.getElementById("trackerStartError");
    if (el) el.textContent = msg || "";
  };

  if (buildTracker && trackerOutput && trackerStart) {
    buildTracker.onclick = () => {
      setTrackerError("");
      if (!trackerStart.value) {
        setTrackerError("נא להזין תאריך התחלה.");
        return;
      }
      const d = new Date(trackerStart.value);
      const today = new Date();
      d.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      if (d > today) {
        setTrackerError("נא להזין תאריך מהעבר.");
        return;
      }

      const plus = (days) => {
        const x = new Date(d);
        x.setDate(x.getDate() + days);
        return x.toLocaleDateString('he-IL');
      };

      if (trackerTrack && trackerTrack.value.includes("חוסן")) {
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
  }
});


// v24 UI polish
document.addEventListener("DOMContentLoaded", () => {
  const floatingBreathe = document.getElementById("floatingBreathe");
  if (floatingBreathe) {
    floatingBreathe.onclick = () => {
      const target = document.getElementById("breatheSection");
      if (target) target.scrollIntoView({behavior:"smooth", block:"start"});
    };
  }

  // If there are multiple download buttons, keep the first visible one working
  const pdfButtons = Array.from(document.querySelectorAll("#downloadPdfBtn"));
  pdfButtons.forEach((btn) => {
    btn.onclick = () => {
      const output = document.getElementById("letterOutput");
      if (!output) return;
      if (!output.value) {
        const gen = document.getElementById("generateLetter");
        if (gen) gen.click();
      }
      const wrapper = document.createElement("div");
      wrapper.style.padding = "32px";
      wrapper.style.fontFamily = "Arial, sans-serif";
      wrapper.style.direction = "rtl";
      wrapper.style.lineHeight = "1.8";
      wrapper.innerText = output.value || "";
      if (window.html2pdf) {
        html2pdf().set({
          margin: 10,
          filename: "pniya-710.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        }).from(wrapper).save();
      }
    };
  });

  const mailBtn = document.getElementById("generateMailBtn");
  if (mailBtn) {
    mailBtn.onclick = () => {
      const output = document.getElementById("letterOutput");
      if (!output) return;
      if (!output.value) {
        const gen = document.getElementById("generateLetter");
        if (gen) gen.click();
      }
      const subject = encodeURIComponent("פנייה בנושא זכויות וסיוע למשפחת 7.10");
      const body = encodeURIComponent(output.value || "");
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };
  }
});
