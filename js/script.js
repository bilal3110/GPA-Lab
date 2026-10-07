(function () {
  "use strict";

  const STORAGE_KEY = "gpa-lab-v1";

  const GRADE_OPTIONS = [
    { label: "A+", points: 4.0 },
    { label: "A",  points: 4.0 },
    { label: "A-", points: 3.7 },
    { label: "B+", points: 3.3 },
    { label: "B",  points: 3.0 },
    { label: "B-", points: 2.7 },
    { label: "C+", points: 2.3 },
    { label: "C",  points: 2.0 },
    { label: "D",  points: 1.0 },
    { label: "F",  points: 0.0 },
  ];

  function classifyGpa(v) {
    if (v >= 3.7) return { tier: "excellent", label: "First Class Honours" };
    if (v >= 3.3) return { tier: "great",     label: "Dean's List eligible" };
    if (v >= 2.7) return { tier: "good",      label: "Solid standing" };
    if (v >= 2.0) return { tier: "fair",      label: "Satisfactory" };
    if (v >  0)   return { tier: "low",       label: "Below passing" };
    return { tier: "", label: "—" };
  }
  function classifyAttendance(v) {
    if (v >= 90) return { tier: "excellent", label: "Excellent" };
    if (v >= 75) return { tier: "good",      label: "On track" };
    if (v >= 60) return { tier: "fair",      label: "Watch closely" };
    return { tier: "low", label: "At risk" };
  }
  function classifyRequired(v, targetMet, unreachable) {
    if (unreachable) return { tier: "low", label: "Impossible to reach" };
    if (targetMet)    return { tier: "excellent", label: "Target met" };
    if (v <= 3)       return { tier: "good",      label: "Easy fix" };
    if (v <= 10)      return { tier: "fair",      label: "Manageable" };
    return { tier: "low", label: "Tough climb" };
  }

  const ICON = {
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  };

  const state = {
    activeTab: "cgpa",
    cgpa:  [], 
    gpa:   [],    
    grade: [],    
    attendance: { total: "", attended: "" },
    required:    { current: "", target: "", total: "" },
  };


  const $  = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const tabsEl       = $("#tabs");
  const tabIndicator = $(".tab-indicator", tabsEl);
  const tabButtons   = $$(".tab-btn", tabsEl);
  const sections     = {
    cgpa:       $("#cgpa-calc"),
    gpa:        $("#gpa-calc"),
    grade:      $("#grade-calc"),
    attendance: $("#attendance-calc"),
  };
  const rowsContainer = {
    cgpa:  $("#cgpa-rows"),
    gpa:   $("#gpa-rows"),
    grade: $("#grade-rows"),
  };
  const emptyStates = {
    cgpa: $("#cgpa-empty"),
  };
  const toastStack = $("#toastStack");


  function toast(message, variant = "info") {
    const el = document.createElement("div");
    el.className = `toast toast--${variant}`;
    el.setAttribute("role", "status");
    const icon =
      variant === "success"
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
        : variant === "error" || variant === "warn"
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    el.innerHTML = `${icon}<span>${message}</span>`;
    toastStack.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-leaving");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 2400);
  }

  function switchTab(name) {
    if (!sections[name]) return;
    state.activeTab = name;

    tabButtons.forEach((btn) => {
      const selected = btn.dataset.tab === name;
      btn.setAttribute("aria-selected", selected ? "true" : "false");
      btn.tabIndex = selected ? 0 : -1;
    });
    Object.entries(sections).forEach(([key, el]) => {
      const isActive = key === name;
      el.hidden = !isActive;
    });

    positionIndicator();
    persist();
  }

  function positionIndicator() {
    const activeBtn = tabButtons.find((b) => b.getAttribute("aria-selected") === "true");
    if (!activeBtn || !tabIndicator) return;
    const navRect = tabsEl.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    tabIndicator.style.width = `${btnRect.width}px`;
    tabIndicator.style.transform = `translateX(${btnRect.left - navRect.left}px)`;
  }

  tabsEl.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const idx = tabButtons.findIndex((b) => b === document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (idx + dir + tabButtons.length) % tabButtons.length;
    tabButtons[next].focus();
    switchTab(tabButtons[next].dataset.tab);
  });

  tabButtons.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));



  function buildRow(type, data = {}) {
    const row = document.createElement("div");
    row.className = `row row-${type[0]}col`; 
    row.setAttribute("role", "listitem");

    let inner = "";
    if (type === "cgpa") {
      inner = `
        <div>
          <span class="row-label-mobile">Semester</span>
          <input type="text"   class="cell-name"    placeholder="e.g. Semester 1" value="${escapeAttr(data.name)}" autocomplete="off" />
          <span class="field-error">Required</span>
        </div>
        <div>
          <span class="row-label-mobile">GPA (0 – 4)</span>
          <input type="number" class="cell-gpa"     placeholder="0.00 – 4.00" value="${escapeAttr(data.gpa)}" min="0" max="4" step="0.01" inputmode="decimal" />
          <span class="field-error">Must be 0 – 4</span>
        </div>
        <div>
          <span class="row-label-mobile">Credits</span>
          <input type="number" class="cell-credits" placeholder="Credits"     value="${escapeAttr(data.credits)}" min="1" step="1" inputmode="numeric" />
          <span class="field-error">Must be > 0</span>
        </div>
        <button type="button" class="btn btn-icon btn-remove-row" aria-label="Remove row">
          ${ICON.trash}
        </button>`;
    } else {
      const isLetter = type === "grade";
      const gradesHtml = GRADE_OPTIONS.map((g) => `<option value="${g.points}"${data.grade == g.points ? " selected" : ""}>${g.label} (${g.points.toFixed(1)})</option>`).join("");
      inner = `
        <div>
          <span class="row-label-mobile">${isLetter ? "Course" : "Course"}</span>
          <input type="text"   class="cell-name"    placeholder="e.g. Calculus I" value="${escapeAttr(data.name)}" autocomplete="off" />
          <span class="field-error">Required</span>
        </div>
        <div>
          <span class="row-label-mobile">Grade</span>
          <select class="cell-grade">
            <option value="">Select grade</option>
            ${gradesHtml}
          </select>
          <span class="field-error">Required</span>
        </div>
        <div>
          <span class="row-label-mobile">Credits</span>
          <input type="number" class="cell-credits" placeholder="Credits" value="${escapeAttr(data.credits)}" min="1" step="1" inputmode="numeric" />
          <span class="field-error">Must be > 0</span>
        </div>
        <button type="button" class="btn btn-icon btn-remove-row" aria-label="Remove row">
          ${ICON.trash}
        </button>`;
    }
    row.innerHTML = inner;
    return row;
  }

  function escapeAttr(s) {
    return (s == null ? "" : String(s))
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function addRow(type, data = {}) {
    const container = rowsContainer[type];
    const rowEl = buildRow(type, data);
    container.appendChild(rowEl);

    if (emptyStates[type]) emptyStates[type].hidden = true;

    wireRowEvents(rowEl, type);
    syncFromDOM(type);
  }

  function wireRowEvents(row, type) {
    row.querySelector(".btn-remove-row").addEventListener("click", () => removeRowEl(row, type));
    row.querySelectorAll("input, select").forEach((el) => {
      el.addEventListener("input", () => {
        syncFromDOM(type);
        const field = el.closest(".field") || el.parentElement;
        field.classList.remove("has-error");
        el.classList.remove("is-invalid");
      });
      el.addEventListener("change", () => syncFromDOM(type));
    });
  }

  function removeRowEl(row, type) {
    row.classList.add("is-removing");
    row.addEventListener("animationend", () => {
      row.remove();
      if (emptyStates[type] && rowsContainer[type].children.length === 0) {
        emptyStates[type].hidden = false;
      }
      syncFromDOM(type);
      toast("Row removed", "info");
    }, { once: true });
  }

  function syncFromDOM(type) {
    const rows = rowsContainer[type].querySelectorAll(".row");
    const arr = Array.from(rows).map((r) => ({
      name:    (r.querySelector(".cell-name")?.value    || "").trim(),
      gpa:     r.querySelector(".cell-gpa")?.value     ?? "",
      grade:   r.querySelector(".cell-grade")?.value   ?? "",
      credits: r.querySelector(".cell-credits")?.value ?? "",
    }));
    state[type] = arr;
    persist();
  }

  function validateRows(type) {
    const errors = [];
    const rows = rowsContainer[type].querySelectorAll(".row");
    rows.forEach((r, idx) => {
      r.querySelectorAll("input, select").forEach((el) => el.classList.remove("is-invalid"));
      r.querySelectorAll(".field").forEach((el) => el.classList.remove("has-error"));

      const name    = (r.querySelector(".cell-name")?.value    || "").trim();
      const credits = r.querySelector(".cell-credits")?.value;
      const numCredits = parseFloat(credits);

      if (!name) {
        const el = r.querySelector(".cell-name");
        el.classList.add("is-invalid");
        el.closest(".field") || el.parentElement.classList.add("has-error");
        errors.push({ idx, field: "name", message: "Name is required" });
      }
      if (!credits || isNaN(numCredits) || numCredits <= 0) {
        const el = r.querySelector(".cell-credits");
        el.classList.add("is-invalid");
        el.closest(".field") || el.parentElement.classList.add("has-error");
        errors.push({ idx, field: "credits", message: "Credits must be > 0" });
      }

      if (type === "cgpa") {
        const gpa = parseFloat(r.querySelector(".cell-gpa")?.value);
        if (isNaN(gpa) || gpa < 0 || gpa > 4) {
          const el = r.querySelector(".cell-gpa");
          el.classList.add("is-invalid");
          el.closest(".field") || el.parentElement.classList.add("has-error");
          errors.push({ idx, field: "gpa", message: "GPA must be 0 – 4" });
        }
      } else {
        const grade = r.querySelector(".cell-grade")?.value;
        if (grade === "") {
          const el = r.querySelector(".cell-grade");
          el.classList.add("is-invalid");
          el.closest(".field") || el.parentElement.classList.add("has-error");
          errors.push({ idx, field: "grade", message: "Pick a grade" });
        }
      }
    });
    return { ok: errors.length === 0, errors };
  }


  function calculateCGPA() {
    const v = validateRows("cgpa");
    if (!v.ok || state.cgpa.length === 0) {
      toast("Fix highlighted fields and try again", "warn");
      return;
    }
    let totalPoints = 0, totalCredits = 0;
    state.cgpa.forEach((r) => {
      totalPoints  += parseFloat(r.gpa) * parseFloat(r.credits);
      totalCredits += parseFloat(r.credits);
    });
    const cgpa = totalPoints / totalCredits;
    renderResult({
      resultId:   "cgpa-result",
      valueId:    "cgpa-value",
      value:      cgpa,
      format:     (n) => n.toFixed(2),
      classify:   classifyGpa,
      classTextId: "cgpa-classification-text",
      breakdown: {
        count: { label: "Semesters",     value: state.cgpa.length },
        credits: { label: "Total credits", value: totalCredits },
        points: { label: "Quality points", value: totalPoints.toFixed(1) },
      },
      breakdownIds: {
        count:   "cgpa-sem-count",
        credits: "cgpa-credits",
        points:  "cgpa-points",
      },
      copyId:    "cgpa",
      summaryFn: (val, br) => `My CGPA is ${val} across ${br.count.value} semesters (${br.credits.value} credits).`,
    });
  }

  function calculateGPA() {
    const v = validateRows("gpa");
    if (!v.ok || state.gpa.length === 0) {
      toast("Fix highlighted fields and try again", "warn");
      return;
    }
    let totalPoints = 0, totalCredits = 0;
    state.gpa.forEach((r) => {
      totalPoints  += parseFloat(r.grade) * parseFloat(r.credits);
      totalCredits += parseFloat(r.credits);
    });
    const gpa = totalPoints / totalCredits;
    renderResult({
      resultId:   "gpa-result",
      valueId:    "gpa-value",
      value:      gpa,
      format:     (n) => n.toFixed(2),
      classify:   classifyGpa,
      classTextId: "gpa-classification-text",
      breakdown: {
        count: { label: "Courses",       value: state.gpa.length },
        credits: { label: "Total credits", value: totalCredits },
        points: { label: "Quality points", value: totalPoints.toFixed(1) },
      },
      breakdownIds: { count: "gpa-course-count", credits: "gpa-credits", points: "gpa-points" },
      copyId: "gpa",
      summaryFn: (val, br) => `Semester GPA: ${val} across ${br.count.value} courses (${br.credits.value} credits).`,
    });
  }

  function calculateGradeCGPA() {
    const v = validateRows("grade");
    if (!v.ok || state.grade.length === 0) {
      toast("Fix highlighted fields and try again", "warn");
      return;
    }
    let totalPoints = 0, totalCredits = 0;
    state.grade.forEach((r) => {
      totalPoints  += parseFloat(r.grade) * parseFloat(r.credits);
      totalCredits += parseFloat(r.credits);
    });
    const cgpa = totalPoints / totalCredits;
    renderResult({
      resultId:   "grade-result",
      valueId:    "grade-cgpa-value",
      value:      cgpa,
      format:     (n) => n.toFixed(2),
      classify:   classifyGpa,
      classTextId: "grade-classification-text",
      breakdown: {
        count: { label: "Courses",       value: state.grade.length },
        credits: { label: "Total credits", value: totalCredits },
        points: { label: "Quality points", value: totalPoints.toFixed(1) },
      },
      breakdownIds: { count: "grade-course-count", credits: "grade-credits", points: "grade-points" },
      copyId: "grade",
      summaryFn: (val, br) => `CGPA from course grades: ${val} across ${br.count.value} courses (${br.credits.value} credits).`,
    });
  }

  function calculateAttendance() {
    const total = parseFloat($("#total-classes").value);
    const attended = parseFloat($("#attended-classes").value);

    clearFieldError("total-classes");
    clearFieldError("attended-classes");

    if (isNaN(total) || total <= 0) {
      markFieldError("total-classes");
      toast("Enter total classes held", "warn");
      return;
    }
    if (isNaN(attended) || attended < 0) {
      markFieldError("attended-classes");
      toast("Enter classes attended", "warn");
      return;
    }
    if (attended > total) {
      markFieldError("attended-classes");
      toast("Attended can't exceed total", "warn");
      return;
    }

    const pct = (attended / total) * 100;
    const cls = classifyAttendance(pct);

    renderResult({
      resultId:    "attendance-result",
      valueId:     "attendance-percentage",
      value:       pct,
      format:      (n) => `${n.toFixed(1)}%`,
      classify:    classifyAttendance,
      classTextId: "attendance-classification-text",
      ring:        { max: 100 },
      skipBreakdown: true,
      copyId: "attendance",
      summaryFn: (val, br) => `Current attendance: ${val}.`,
    });
  }

  function calculateRequiredClasses() {
    const cur  = parseFloat($("#current-attendance").value);
    const tgt  = parseFloat($("#target-attendance").value);
    const tot  = parseFloat($("#current-total").value);

    ["current-attendance", "target-attendance", "current-total"].forEach(clearFieldError);

    if (isNaN(cur) || cur < 0 || cur > 100) { markFieldError("current-attendance"); }
    if (isNaN(tgt) || tgt < 0 || tgt > 100) { markFieldError("target-attendance"); }
    if (isNaN(tot) || tot < 0)              { markFieldError("current-total"); }

    if (isNaN(cur) || isNaN(tgt) || isNaN(tot) || cur < 0 || cur > 100 || tgt < 0 || tgt > 100 || tot < 0) {
      toast("Enter valid percentages (0–100) and class count", "warn");
      return;
    }

    let display, targetMet, unreachable = false;
    if (tgt <= cur) {
      display = 0;
      targetMet = true;
    } else if (tgt >= 100) {
      display = 0;
      targetMet = false;
      unreachable = true;
      const x = Math.ceil((tgt * tot - 100 * attended) / (100 - tgt) - 1e-9);
      display = Math.max(0, x);
      targetMet = false;
    }

    renderResult({
      resultId:    "required-result",
      valueId:     "required-classes",
      value:       display,
      format:      (n) => String(n),
      classify:    (n) => classifyRequired(n, targetMet, unreachable),
      classTextId: "required-classification-text",
      ring:        { max: 30, scale: (v) => Math.min(v, 30) },
      skipBreakdown: true,
      copyId: "required",
      summaryFn: (val) => targetMet ? `Target already met — keep it up!` : `Attend ${val} more consecutive classes to hit your target.`,
    });
  }

  function renderResult(cfg) {
    const resultEl = $("#" + cfg.resultId);
    const valueEl  = $("#" + cfg.valueId);
    const classEl  = $("#" + cfg.classTextId);

    const cls = cfg.classify(cfg.value);
    resultEl.dataset.tier = cls.tier;

    animateNumber(valueEl, 0, cfg.value, cfg.format, 700);

    classEl.textContent = cls.label;

    if (!cfg.skipBreakdown && cfg.breakdownIds) {
      $("#" + cfg.breakdownIds.count).textContent   = cfg.breakdown.count.value;
      $("#" + cfg.breakdownIds.credits).textContent = cfg.breakdown.credits.value;
      $("#" + cfg.breakdownIds.points).textContent  = cfg.breakdown.points.value;
    }

    const ring = resultEl.querySelector(".result-ring .meter");
    if (ring) {
      const max = cfg.ring?.max ?? 4;
      const scale = cfg.ring?.scale ?? ((v) => v);
      const fraction = Math.max(0, Math.min(1, scale(cfg.value) / max));
      const circumference = 2 * Math.PI * 52;
      ring.style.strokeDasharray  = String(circumference);
      ring.style.strokeDashoffset = String(circumference);
      requestAnimationFrame(() => {
        ring.style.strokeDashoffset = String(circumference * (1 - fraction));
      });
    }

    resultEl.classList.remove("is-shown");
    void resultEl.offsetWidth;
    resultEl.classList.add("is-shown");

    resultEl.dataset.summary = cfg.summaryFn(cfg.format(cfg.value), cfg.breakdown || {});

    if (window.innerWidth < 720) {
      setTimeout(() => resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" }), 320);
    }

    toast("Calculated", "success");
  }

  function animateNumber(el, from, to, format, duration = 600) {
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = from + (to - from) * eased;
      el.textContent = format(cur);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = format(to);
    }
    requestAnimationFrame(tick);
  }

  function clearFieldError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("is-invalid");
  }
  function markFieldError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("is-invalid");
  }

  function persist() {
    state.attendance = {
      total:     $("#total-classes").value,
      attended:  $("#attended-classes").value,
    };
    state.required = {
      current: $("#current-attendance").value,
      target:  $("#target-attendance").value,
      total:   $("#current-total").value,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { }
  }

  function restore() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) { saved = null; }
    if (!saved || typeof saved !== "object") return;

    state.activeTab = saved.activeTab || "cgpa";
    ["cgpa", "gpa", "grade"].forEach((type) => {
      const rows = Array.isArray(saved[type]) ? saved[type] : [];
      rowsContainer[type].innerHTML = "";
      if (rows.length === 0) {
        if (emptyStates[type]) emptyStates[type].hidden = false;
        state[type] = [];
      } else {
        rows.forEach((r) => addRow(type, r));
      }
    });
    if (saved.attendance) {
      $("#total-classes").value    = saved.attendance.total    || "";
      $("#attended-classes").value = saved.attendance.attended || "";
    }
    if (saved.required) {
      $("#current-attendance").value = saved.required.current || "";
      $("#target-attendance").value  = saved.required.target  || "";
      $("#current-total").value      = saved.required.total   || "";
    }
  }

  function resetAll() {
    const has = state.cgpa.length || state.gpa.length || state.grade.length ||
                state.attendance.total || state.attendance.attended ||
                state.required.current || state.required.target || state.required.total;
    if (has && !confirm("Reset all inputs across every calculator? This can't be undone.")) return;
    ["cgpa", "gpa", "grade"].forEach((t) => {
      rowsContainer[t].innerHTML = "";
      state[t] = [];
      if (emptyStates[t]) emptyStates[t].hidden = false;
    });
    ["cgpa-result", "gpa-result", "grade-result", "attendance-result", "required-result"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) { el.classList.remove("is-shown"); el.dataset.tier = ""; }
    });
    ["total-classes", "attended-classes", "current-attendance", "target-attendance", "current-total"].forEach((id) => {
      const el = document.getElementById(id); if (el) el.value = "";
    });
    state.attendance = { total: "", attended: "" };
    state.required   = { current: "", target: "", total: "" };
    persist();
    toast("All inputs cleared", "info");
  }

  function loadSample() {
    state.cgpa = [
      { name: "Semester 1", gpa: "3.4", credits: "18" },
      { name: "Semester 2", gpa: "3.7", credits: "20" },
      { name: "Semester 3", gpa: "3.9", credits: "17" },
      { name: "Semester 4", gpa: "3.8", credits: "19" },
    ];
    state.gpa = [
      { name: "Calculus II", grade: "3.7", credits: "4" },
      { name: "Physics I",   grade: "3.3", credits: "4" },
      { name: "English",     grade: "4.0", credits: "3" },
      { name: "Intro CS",    grade: "3.7", credits: "3" },
    ];
    state.grade = [
      { name: "Linear Algebra", grade: "3.3", credits: "3" },
      { name: "Statistics",     grade: "3.0", credits: "3" },
      { name: "Mechanics",      grade: "2.7", credits: "4" },
      { name: "Communication",  grade: "4.0", credits: "2" },
    ];
    ["cgpa", "gpa", "grade"].forEach((type) => {
      rowsContainer[type].innerHTML = "";
      if (emptyStates[type]) emptyStates[type].hidden = true;
      state[type].forEach((r) => addRow(type, r));
    });
    state.attendance = { total: "40", attended: "36" };
    state.required   = { current: "82", target: "85", total: "40" };
    $("#total-classes").value     = "40";
    $("#attended-classes").value  = "36";
    $("#current-attendance").value = "82";
    $("#target-attendance").value  = "85";
    $("#current-total").value      = "40";
    persist();
    toast("Sample data loaded — try the calculators", "success");
  }

  function clearTab(type) {
    const map = { cgpa: "CGPA", gpa: "GPA", grade: "Grades" };
    if (!confirm(`Clear all ${map[type] || type} inputs?`)) return;
    rowsContainer[type].innerHTML = "";
    state[type] = [];
    if (emptyStates[type]) emptyStates[type].hidden = false;
    document.querySelectorAll(`#${type}-result`).forEach((el) => {
      el.classList.remove("is-shown");
    });
    persist();
    toast(`${map[type] || type} cleared`, "info");
  }

  async function copyResult(tabKey) {
    const el = $(`#${tabKey === "required" ? "required-result" : (tabKey === "attendance" ? "attendance-result" : `${tabKey}-result`)}`);
    const summary = el?.dataset.summary;
    if (!summary) { toast("Nothing to copy yet", "warn"); return; }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(summary);
      } else {
        const ta = document.createElement("textarea");
        ta.value = summary;
        ta.style.position = "absolute"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      toast("Result copied", "success");
    } catch (_) {
      toast("Copy failed", "error");
    }
  }

  function bindEvents() {
    $("#sampleBtn").addEventListener("click", loadSample);
    $("#resetBtn").addEventListener("click", resetAll);

    document.querySelectorAll("[data-empty-add]").forEach((b) => {
      b.addEventListener("click", () => addRow(b.dataset.emptyAdd));
    });

    document.querySelectorAll("[data-add]").forEach((b) => {
      b.addEventListener("click", () => addRow(b.dataset.add));
    });

    document.querySelectorAll("[data-calc]").forEach((b) => {
      b.addEventListener("click", () => {
        const key = b.dataset.calc;
        if (key === "cgpa") calculateCGPA();
        else if (key === "gpa") calculateGPA();
        else if (key === "grade") calculateGradeCGPA();
        else if (key === "attendance") calculateAttendance();
        else if (key === "required") calculateRequiredClasses();
      });
    });

    document.querySelectorAll("[data-clear]").forEach((b) => {
      b.addEventListener("click", () => clearTab(b.dataset.clear));
    });

    document.querySelectorAll("[data-copy]").forEach((b) => {
      b.addEventListener("click", () => copyResult(b.dataset.copy));
    });

    ["total-classes", "attended-classes", "current-attendance", "target-attendance", "current-total"]
      .forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", () => {
          el.classList.remove("is-invalid");
          persist();
        });
      });

    document.addEventListener("keydown", (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if (!(isMac ? e.metaKey : e.ctrlKey) || e.key !== "Enter") return;
      const map = { cgpa: "cgpa", gpa: "gpa", grade: "grade", attendance: "attendance" };
      const key = map[state.activeTab];
      if (!key) return;
      e.preventDefault();
      document.querySelector(`[data-calc="${key}"]`)?.click();
    });
  }

  window.showCalculator = (type) => switchTab(type);
  window.addSemester    = () => addRow("cgpa");
  window.removeSemester = (btn) => removeRowEl(btn.closest(".row"), "cgpa");
  window.calculateCGPA  = calculateCGPA;
  window.addCourse      = () => addRow("gpa");
  window.removeCourse   = (btn) => removeRowEl(btn.closest(".row"), "gpa");
  window.calculateGPA   = calculateGPA;
  window.addGradeCourse = () => addRow("grade");
  window.removeGradeCourse = (btn) => removeRowEl(btn.closest(".row"), "grade");
  window.calculateGradeCGPA = calculateGradeCGPA;
  window.calculateAttendance = calculateAttendance;
  window.calculateRequiredClasses = calculateRequiredClasses;


  document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    bindEvents();

    restore();
    ["cgpa", "gpa", "grade"].forEach((type) => {
      if (rowsContainer[type].children.length === 0) {
        if (emptyStates[type]) emptyStates[type].hidden = false;
        if (type === "gpa") addRow("gpa");
      }
    });

    switchTab(state.activeTab || "cgpa");

    requestAnimationFrame(positionIndicator);
    window.addEventListener("resize", positionIndicator);
  });
})();