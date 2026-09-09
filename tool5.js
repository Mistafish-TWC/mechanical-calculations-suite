// TOOL 5: FUEL GAS PIPE SIZING CALCULATOR ENGINE (NFPA 54 & IFGC)
// ===================================================================
var activeGasSubTab = 'quickSizer';
var currentGasLoadUnit = 'btu'; // 'btu', 'mbh', 'cfh'

const GAS_PROPERTIES = {
  natural_gas: { name: 'Natural Gas', specificGravity: 0.60, heatingValue: 1000, isLiquid: false },
  propane: { name: 'Undiluted Propane (LP)', specificGravity: 1.50, heatingValue: 2500, isLiquid: false },
  butane: { name: 'Commercial Butane', specificGravity: 2.00, heatingValue: 3200, isLiquid: false },
  diesel_fuel: { name: '#2 Diesel Fuel / Fuel Oil', specificGravity: 0.85, heatingValue: 138500, isLiquid: true }
};

const GAS_PIPE_DATABASE = {
  sch40_steel: {
    name: "Schedule 40 Black Steel",
    cFactor: 2313,
    sizes: [
      { nominal: '1/2"',   d: 0.622 },
      { nominal: '3/4"',   d: 0.824 },
      { nominal: '1"',     d: 1.049 },
      { nominal: '1-1/4"', d: 1.380 },
      { nominal: '1-1/2"', d: 1.610 },
      { nominal: '2"',     d: 2.067 },
      { nominal: '2-1/2"', d: 2.469 },
      { nominal: '3"',     d: 3.068 },
      { nominal: '4"',     d: 4.026 },
      { nominal: '5"',     d: 5.047 },
      { nominal: '6"',     d: 6.065 },
      { nominal: '8"',     d: 7.981 },
      { nominal: '10"',    d: 10.020 },
      { nominal: '12"',    d: 11.938 }
    ]
  },
  sch80_steel: {
    name: "Schedule 80 Black Steel",
    cFactor: 2313,
    sizes: [
      { nominal: '1/2"',   d: 0.546 },
      { nominal: '3/4"',   d: 0.742 },
      { nominal: '1"',     d: 0.957 },
      { nominal: '1-1/4"', d: 1.278 },
      { nominal: '1-1/2"', d: 1.500 },
      { nominal: '2"',     d: 1.939 },
      { nominal: '2-1/2"', d: 2.323 },
      { nominal: '3"',     d: 2.900 },
      { nominal: '4"',     d: 3.826 },
      { nominal: '5"',     d: 4.813 },
      { nominal: '6"',     d: 5.761 },
      { nominal: '8"',     d: 7.625 },
      { nominal: '10"',    d: 9.562 },
      { nominal: '12"',    d: 11.374 }
    ]
  },
  csst: {
    name: "CSST Corrugated Stainless",
    cFactor: 1880,
    sizes: [
      { nominal: '1/2" (EHD 18)',   d: 0.580 },
      { nominal: '3/4" (EHD 23)',   d: 0.820 },
      { nominal: '1" (EHD 31)',     d: 1.060 },
      { nominal: '1-1/4" (EHD 37)', d: 1.310 },
      { nominal: '1-1/2" (EHD 48)', d: 1.580 },
      { nominal: '2" (EHD 60)',     d: 2.060 }
    ]
  },
  copper_l: {
    name: "Copper Tubing (Type L)",
    cFactor: 2313,
    sizes: [
      { nominal: '1/4"',   d: 0.245 },
      { nominal: '3/8"',   d: 0.375 },
      { nominal: '1/2"',   d: 0.495 },
      { nominal: '5/8"',   d: 0.625 },
      { nominal: '3/4"',   d: 0.745 },
      { nominal: '1"',     d: 0.995 },
      { nominal: '1-1/4"', d: 1.245 },
      { nominal: '1-1/2"', d: 1.481 },
      { nominal: '2"',     d: 1.959 }
    ]
  },
  pe_plastic: {
    name: "PE Plastic Underground (SDR 11)",
    cFactor: 2313,
    sizes: [
      { nominal: '1/2" IPS',   d: 0.673 },
      { nominal: '3/4" IPS',   d: 0.860 },
      { nominal: '1" IPS',     d: 1.077 },
      { nominal: '1-1/4" IPS', d: 1.358 },
      { nominal: '1-1/2" IPS', d: 1.554 },
      { nominal: '2" IPS',     d: 1.943 }
    ]
  }
};

function switchGasSubTab(tab) {
  activeGasSubTab = tab;
  const v1 = document.getElementById('gasQuickSizerView');
  const v2 = document.getElementById('gasNetworkBuilderView');
  const v3 = document.getElementById('gasCodeTablesView');

  const b1 = document.getElementById('tab-gasQuickSizer');
  const b2 = document.getElementById('tab-gasNetworkBuilder');
  const b3 = document.getElementById('tab-gasCodeTables');

  if (v1) v1.classList.add('hidden');
  if (v2) v2.classList.add('hidden');
  if (v3) v3.classList.add('hidden');

  const inactiveClass = "px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all flex items-center gap-2";
  const activeClass = "px-4 py-2.5 rounded-xl font-bold transition-all shadow-md bg-amber-600 text-white flex items-center gap-2 active-tab";

  if (b1) b1.className = inactiveClass;
  if (b2) b2.className = inactiveClass;
  if (b3) b3.className = inactiveClass;

  if (tab === 'quickSizer') {
    if (v1) v1.classList.remove('hidden');
    if (b1) b1.className = activeClass;
    calculateGasSizing();
    setTimeout(drawGasCanvas, 50);
  } else if (tab === 'networkBuilder') {
    if (v2) v2.classList.remove('hidden');
    if (b2) b2.className = activeClass;
    renderGasScheduleTable();
  } else if (tab === 'codeTables') {
    if (v3) v3.classList.remove('hidden');
    if (b3) b3.className = activeClass;
    renderGasCodeTables();
  }
}

function setGasLoadUnit(newUnit) {
  if (currentGasLoadUnit === newUnit) return;
  const inputEl = document.getElementById('gasInputLoadValue');
  const gasType = document.getElementById('gasFuelTypeSelect')?.value || 'natural_gas';
  const hv = GAS_PROPERTIES[gasType].heatingValue;
  let val = parseFloat(inputEl?.value || 500000);

  let btuVal = val;
  if (currentGasLoadUnit === 'mbh') btuVal = val * 1000;
  else if (currentGasLoadUnit === 'cfh') btuVal = val * (hv / 1000) * 1000;

  let newVal = btuVal;
  if (newUnit === 'mbh') newVal = btuVal / 1000;
  else if (newUnit === 'cfh') newVal = btuVal / ((hv / 1000) * 1000);

  currentGasLoadUnit = newUnit;
  if (inputEl) inputEl.value = Math.round(newVal);

  const btnBtu = document.getElementById('btnGasUnitBTU');
  const btnMbh = document.getElementById('btnGasUnitMBH');
  const btnCfh = document.getElementById('btnGasUnitCFH');
  const lbl = document.getElementById('gasInputLoadUnitLabel');

  const activeClass = "px-3 py-1 bg-amber-600 text-white rounded-lg font-bold shadow transition text-xs";
  const inactiveClass = "px-3 py-1 bg-slate-800 text-slate-400 hover:text-white rounded-lg font-medium transition text-xs";

  if (btnBtu) btnBtu.className = newUnit === 'btu' ? activeClass : inactiveClass;
  if (btnMbh) btnMbh.className = newUnit === 'mbh' ? activeClass : inactiveClass;
  if (btnCfh) btnCfh.className = newUnit === 'cfh' ? activeClass : inactiveClass;

  if (lbl) {
    if (newUnit === 'btu') lbl.innerText = 'Appliance Thermal / Flow Load (BTU/hr)';
    else if (newUnit === 'mbh') lbl.innerText = 'Appliance Thermal Load (MBH - 1,000 BTU/hr)';
    else lbl.innerText = 'Volumetric Gas Flow Load (CFH - cu ft/hr)';
  }

  calculateGasSizing();
}

function syncGasFuelType() {
  const gasType = document.getElementById('gasFuelTypeSelect')?.value || 'natural_gas';
  const dropSelect = document.getElementById('gasAllowableDropSelect');
  const pressSelect = document.getElementById('gasPressureModeSelect');
  if (!dropSelect) return;

  if (gasType === 'diesel_fuel') {
    if (pressSelect) pressSelect.value = '0.5';
    dropSelect.innerHTML = `
      <option value="0.5" selected>0.5 in. w.g. (Standard Gravity Feed)</option>
      <option value="1.0">1.0 in. w.g. (Pump Suction / Pressurized Main)</option>
    `;
  } else {
    syncGasPressureDropDropdown();
  }

  const gasTypeLL = document.getElementById('gasFuelTypeSelectLL');
  if (gasTypeLL && gasTypeLL.value !== gasType) gasTypeLL.value = gasType;
}

function syncGasPressureDropDropdown() {
  const pressPsi = parseFloat(document.getElementById('gasPressureModeSelect')?.value || '0.5');
  const dropSelect = document.getElementById('gasAllowableDropSelect');
  const dropSelectLL = document.getElementById('gasAllowableDropSelectLL');

  let chosenHtml = '';
  if (pressPsi <= 0.5) {
    chosenHtml = `
      <option value="0.5" selected>0.5 in. w.g. (Standard Low Press Drop)</option>
      <option value="1.0">1.0 in. w.g. (Elevated Low Press Drop)</option>
    `;
  } else if (pressPsi <= 2.0) {
    chosenHtml = `
      <option value="0.5_psi">0.5 psi Drop (2.0 psi System)</option>
      <option value="1.0_psi" selected>1.0 psi Drop (Standard 2.0 psi System Drop)</option>
    `;
  } else if (pressPsi <= 5.0) {
    chosenHtml = `
      <option value="1.0_psi">1.0 psi Drop (5.0 psi System)</option>
      <option value="2.0_psi">2.0 psi Drop (5.0 psi System)</option>
      <option value="3.5_psi" selected>3.5 psi Drop (Standard 5.0 psi System Drop)</option>
    `;
  } else {
    chosenHtml = `
      <option value="2.0_psi">2.0 psi Drop (10.0 psi System)</option>
      <option value="5.0_psi" selected>5.0 psi Drop (Standard 10.0 psi System Drop)</option>
    `;
  }

  if (dropSelect) dropSelect.innerHTML = chosenHtml;
  if (dropSelectLL) dropSelectLL.innerHTML = chosenHtml;

  const pressLL = document.getElementById('gasPressureModeSelectLL');
  if (pressLL && pressLL.value !== String(pressPsi)) pressLL.value = String(pressPsi);
}

function syncGasPressureDropDropdownLL() {
  const pressSelectLL = document.getElementById('gasPressureModeSelectLL');
  const dropSelectLL = document.getElementById('gasAllowableDropSelectLL');
  const dropSelect1 = document.getElementById('gasAllowableDropSelect');
  if (!pressSelectLL) return;

  const pressPsi = parseFloat(pressSelectLL.value || '0.5');

  let chosenHtml = '';
  if (pressPsi <= 0.5) {
    chosenHtml = `
      <option value="0.5" selected>0.5 in. w.g. (Standard Low Press Drop)</option>
      <option value="1.0">1.0 in. w.g. (Elevated Low Press Drop)</option>
    `;
  } else if (pressPsi <= 2.0) {
    chosenHtml = `
      <option value="0.5_psi">0.5 psi Drop (2.0 psi System)</option>
      <option value="1.0_psi" selected>1.0 psi Drop (Standard 2.0 psi System Drop)</option>
    `;
  } else if (pressPsi <= 5.0) {
    chosenHtml = `
      <option value="1.0_psi">1.0 psi Drop (5.0 psi System)</option>
      <option value="2.0_psi">2.0 psi Drop (5.0 psi System)</option>
      <option value="3.5_psi" selected>3.5 psi Drop (Standard 5.0 psi System Drop)</option>
    `;
  } else {
    chosenHtml = `
      <option value="2.0_psi">2.0 psi Drop (10.0 psi System)</option>
      <option value="5.0_psi" selected>5.0 psi Drop (Standard 10.0 psi System Drop)</option>
    `;
  }

  if (dropSelectLL) dropSelectLL.innerHTML = chosenHtml;
  if (dropSelect1) dropSelect1.innerHTML = chosenHtml;

  const pressSelect1 = document.getElementById('gasPressureModeSelect');
  if (pressSelect1 && pressSelect1.value !== String(pressPsi)) pressSelect1.value = String(pressPsi);

  calculateGasSizing();
  renderGasScheduleTable();
}

function syncGasLength(source, val) {
  const numVal = parseFloat(val) || 10;
  const inEl = document.getElementById('gasInputLength');
  const slEl = document.getElementById('gasSliderLength');
  if (inEl && source !== 'input') inEl.value = numVal;
  if (slEl && source !== 'slider') slEl.value = Math.min(1000, numVal);

  const fittingPct = parseFloat(document.getElementById('gasSliderFitting')?.value || 20);
  const addFt = Math.round(numVal * (fittingPct / 100));

  const lbl1 = document.getElementById('gasFittingValue');
  if (lbl1) lbl1.innerText = `${fittingPct}% (+${addFt} ft)`;

  const totalLen = numVal * (1 + fittingPct / 100);
  const totalLbl = document.getElementById('gasTotalEquivLength');
  if (totalLbl) totalLbl.innerText = `${totalLen.toFixed(1)} ft`;

  calculateGasSizing();
}

function syncGasFitting(val) {
  const numVal = parseFloat(val) || 0;
  const lbl = document.getElementById('gasFittingValue');
  const lengthFt = parseFloat(document.getElementById('gasInputLength')?.value || 100);
  const addFt = Math.round(lengthFt * (numVal / 100));
  if (lbl) lbl.innerText = `${numVal}% (+${addFt} ft)`;

  const totalLen = lengthFt * (1 + numVal / 100);
  const totalLbl = document.getElementById('gasTotalEquivLength');
  if (totalLbl) totalLbl.innerText = `${totalLen.toFixed(1)} ft`;

  calculateGasSizing();
}

function syncGasMaxVelocity(source, val) {
  const numVal = parseFloat(val) || 30;
  const inEl = document.getElementById('gasInputMaxVelocity');
  const slEl = document.getElementById('gasSliderMaxVelocity');
  if (inEl && source !== 'input') inEl.value = numVal;
  if (slEl && source !== 'slider') slEl.value = Math.min(60, Math.max(10, numVal));

  calculateGasSizing();
}

function solveGasSegmentSize(flowCFH, lengthFt, gasType, matKey, pressPsi, allowDropStr, fittingPct, maxVelCap) {
  const prop = GAS_PROPERTIES[gasType];
  const pipeDef = GAS_PIPE_DATABASE[matKey];
  const sizes = pipeDef.sizes;
  const spGr = prop.specificGravity;
  const leq = lengthFt * (1 + fittingPct / 100);

  let targetAllowableDrop = 0.5;
  if (typeof allowDropStr === 'string' && allowDropStr.includes('psi')) {
    targetAllowableDrop = parseFloat(allowDropStr);
  } else {
    targetAllowableDrop = parseFloat(allowDropStr) || 0.5;
  }

  let codeMinSize = sizes[sizes.length - 1].nominal;
  let recommendedSize = sizes[sizes.length - 1].nominal;
  let codeMinVelocity = 0;
  let actualDrop = 0;
  let isVelocityWarning = false;
  let foundCodeMin = false;
  let maxPermissibleCFH = 0;

  const cFactorCalc = pipeDef.cFactor || 2313.0;

  if (pressPsi <= 0.5) {
    for (let i = 0; i < sizes.length; i++) {
      const s = sizes[i];
      const d = s.d;

      const pDrop = (Math.pow(flowCFH, 1.848) * spGr * leq) / (Math.pow(cFactorCalc, 1.848) * Math.pow(d, 4.847));
      const areaSqFt = (Math.PI * Math.pow(d / 12, 2)) / 4;
      const cfps = flowCFH / 3600;
      const velFPS = cfps / areaSqFt;

      if (!foundCodeMin && pDrop <= targetAllowableDrop) {
        codeMinSize = s.nominal;
        codeMinVelocity = velFPS;
        actualDrop = pDrop;
        foundCodeMin = true;

        const t = targetAllowableDrop / (spGr * leq);
        maxPermissibleCFH = cFactorCalc * Math.pow(d, 2.623) * Math.pow(t, 0.541);
      }

      if (pDrop <= targetAllowableDrop && velFPS <= maxVelCap) {
        recommendedSize = s.nominal;
        break;
      }
    }
  } else {
    const p1Abs = pressPsi + 14.7;
    const compRatio = 14.7 / p1Abs;

    for (let i = 0; i < sizes.length; i++) {
      const s = sizes[i];
      const d = s.d;

      const termInside = Math.pow(flowCFH / (cFactorCalc * Math.pow(d, 2.623)), 1 / 0.541) * (spGr * leq);
      const p2AbsSquare = Math.max(0, Math.pow(p1Abs, 2) - termInside);
      const p2Abs = Math.sqrt(p2AbsSquare);
      const pDrop = p1Abs - p2Abs;

      const areaSqFt = (Math.PI * Math.pow(d / 12, 2)) / 4;
      const actualCFH = flowCFH * compRatio;
      const cfps = actualCFH / 3600;
      const velFPS = cfps / areaSqFt;

      if (!foundCodeMin && pDrop <= targetAllowableDrop) {
        codeMinSize = s.nominal;
        codeMinVelocity = velFPS;
        actualDrop = pDrop;
        foundCodeMin = true;

        const p1 = p1Abs;
        const p2 = Math.max(14.7, p1 - targetAllowableDrop);
        const term = (Math.pow(p1, 2) - Math.pow(p2, 2)) / (spGr * leq);
        maxPermissibleCFH = cFactorCalc * Math.pow(d, 2.623) * Math.pow(Math.max(0, term), 0.541);
      }

      if (pDrop <= targetAllowableDrop && velFPS <= maxVelCap) {
        recommendedSize = s.nominal;
        break;
      }
    }
  }

  if (!foundCodeMin) {
    codeMinSize = `>${sizes[sizes.length - 1].nominal}`;
    recommendedSize = `>${sizes[sizes.length - 1].nominal}`;
  }

  if (codeMinVelocity > maxVelCap) {
    isVelocityWarning = true;
  }

  return {
    codeMinSize: codeMinSize,
    recommendedSize: recommendedSize,
    actualDrop: actualDrop,
    velocityFPS: codeMinVelocity,
    isVelocityWarning: isVelocityWarning,
    maxPermissibleCFH: maxPermissibleCFH
  };
}

function calculateGasSizing() {
  const gasType = document.getElementById('gasFuelTypeSelect')?.value || 'natural_gas';
  const matKey = document.getElementById('gasMaterialSelect')?.value || 'sch40_steel';
  const pressPsi = parseFloat(document.getElementById('gasPressureModeSelect')?.value || '0.5');
  const allowDrop = document.getElementById('gasAllowableDropSelect')?.value || '0.5';
  const loadVal = parseFloat(document.getElementById('gasInputLoadValue')?.value || 500000);
  const lenInput = parseFloat(document.getElementById('gasInputLength')?.value || 100);
  const fittingPct = parseFloat(document.getElementById('gasSliderFitting')?.value || 20);
  const maxVelCap = parseFloat(document.getElementById('gasInputMaxVelocity')?.value || 30);

  const hv = GAS_PROPERTIES[gasType].heatingValue;
  let cfh = 500;
  if (currentGasLoadUnit === 'btu') cfh = loadVal / hv;
  else if (currentGasLoadUnit === 'mbh') cfh = (loadVal * 1000) / hv;
  else cfh = loadVal;

  cfh = Math.max(1, cfh);

  const res = solveGasSegmentSize(cfh, lenInput, gasType, matKey, pressPsi, allowDrop, fittingPct, maxVelCap);

  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };

  setTxt('metricGasCodeMinSize', res.codeMinSize);
  setTxt('metricGasRecommendedSize', res.recommendedSize);
  setTxt('metricGasActualDrop', res.actualDrop.toFixed(2) + (pressPsi <= 0.5 ? ' in.w.g.' : ' psi'));
  setTxt('metricGasDropLimit', `Max Allowable: ${allowDrop} ${pressPsi <= 0.5 ? 'in.w.g.' : 'psi'}`);
  setTxt('metricGasVelocity', res.velocityFPS.toFixed(1) + ' ft/s');
  setTxt('metricGasCFH', `${Math.round(cfh).toLocaleString()} CFH (${Math.round(cfh * hv / 1000).toLocaleString()} MBH)`);

  const vAlert = document.getElementById('gasVelocityAlert');
  const rAlert = document.getElementById('gasRegulatorAlert');
  const pAlert = document.getElementById('gasPeAlert');

  const isLight = document.documentElement.classList.contains('light');

  if (vAlert) {
    if (res.isVelocityWarning) {
      vAlert.classList.remove('hidden');
      vAlert.className = isLight ? "p-4 rounded-xl border flex items-start gap-3 transition-all bg-amber-50 border-amber-300 text-amber-950 font-medium" : "p-4 rounded-xl border flex items-start gap-3 transition-all bg-amber-950/40 border-amber-500/50 text-amber-200 font-medium";
    } else {
      vAlert.classList.add('hidden');
    }
  }

  if (rAlert) {
    if (pressPsi > 0.5) {
      rAlert.classList.remove('hidden');
      rAlert.className = isLight ? "p-4 rounded-xl border flex items-start gap-3 transition-all bg-sky-50 border-sky-300 text-sky-950 font-medium" : "p-4 rounded-xl border flex items-start gap-3 transition-all bg-sky-950/40 border-sky-500/50 text-sky-200 font-medium";
    } else {
      rAlert.classList.add('hidden');
    }
  }

  if (pAlert) {
    if (matKey === 'pe_plastic') {
      pAlert.classList.remove('hidden');
      pAlert.className = isLight ? "p-4 rounded-xl border flex items-start gap-3 transition-all bg-emerald-50 border-emerald-300 text-emerald-950 font-medium" : "p-4 rounded-xl border flex items-start gap-3 transition-all bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-medium";
    } else {
      pAlert.classList.add('hidden');
    }
  }

  drawGasCanvas();
}

function drawGasCanvas() {
  const canvas = document.getElementById('gasVisualizerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const parent = canvas.parentElement;
  const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;

  const isLight = document.documentElement.classList.contains('light');

  const gasType = document.getElementById('gasFuelTypeSelect')?.value || 'natural_gas';
  const matKey = document.getElementById('gasMaterialSelect')?.value || 'sch40_steel';
  const pressPsi = parseFloat(document.getElementById('gasPressureModeSelect')?.value || '0.5');
  const allowDrop = document.getElementById('gasAllowableDropSelect')?.value || '0.5';
  const loadVal = parseFloat(document.getElementById('gasInputLoadValue')?.value || 500000);
  const lenInput = parseFloat(document.getElementById('gasInputLength')?.value || 100);
  const fittingPct = parseFloat(document.getElementById('gasSliderFitting')?.value || 20);
  const maxVelCap = parseFloat(document.getElementById('gasInputMaxVelocity')?.value || 30);
  const hv = GAS_PROPERTIES[gasType].heatingValue;

  let cfh = 500;
  if (currentGasLoadUnit === 'btu') cfh = loadVal / hv;
  else if (currentGasLoadUnit === 'mbh') cfh = (loadVal * 1000) / hv;
  else cfh = loadVal;
  cfh = Math.max(1, cfh);

  const res = solveGasSegmentSize(cfh, lenInput, gasType, matKey, pressPsi, allowDrop, fittingPct, maxVelCap);

  const velStr = document.getElementById('metricGasVelocity')?.innerText || '16.9 ft/s';
  const vel = parseFloat(velStr) || res.velocityFPS;
  const maxMBH = (res.maxPermissibleCFH * hv) / 1000;
  const maxCFH = res.maxPermissibleCFH;

  let wallColor = '#475569';
  let pipeBadge = 'Sch 40 Steel';
  if (matKey === 'sch80_steel') { wallColor = '#334155'; pipeBadge = 'Sch 80 Heavy Steel'; }
  else if (matKey === 'csst') { wallColor = '#eab308'; pipeBadge = 'CSST Stainless'; }
  else if (matKey === 'copper_l') { wallColor = '#f97316'; pipeBadge = 'Type L Copper'; }
  else if (matKey === 'pe_plastic') { wallColor = '#10b981'; pipeBadge = 'PE Plastic SDR 11'; }

  const centerX = w / 2;
  const pipeCenterX = Math.max(100, centerX - 110);
  const rightX = Math.min(w - 110, centerX + 60);

  const pipeCenterY = h / 2 - 16;
  const outerRadius = Math.min(46, Math.max(28, h * 0.21));
  const innerRadius = Math.round(outerRadius * 0.75);

  ctx.beginPath();
  ctx.arc(pipeCenterX, pipeCenterY, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = wallColor;
  ctx.fill();
  ctx.strokeStyle = isLight ? '#cbd5e1' : '#1e293b';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pipeCenterX, pipeCenterY, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? '#f1f5f9' : '#020617';
  ctx.fill();
  ctx.strokeStyle = isLight ? '#94a3b8' : '#334155';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pipeCenterX, pipeCenterY, innerRadius - 4, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.25)';
  ctx.fill();

  ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${res.codeMinSize} (${pipeBadge})`, pipeCenterX, pipeCenterY + outerRadius + 18);

  const isLiquid = GAS_PROPERTIES[gasType].isLiquid;
  ctx.fillStyle = isLight ? '#b45309' : '#fbbf24';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(`Max Load: ${Math.round(maxMBH).toLocaleString()} MBH`, pipeCenterX, pipeCenterY + outerRadius + 32);
  ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
  ctx.font = '9px sans-serif';
  ctx.fillText(`(${Math.round(maxCFH).toLocaleString()} ${isLiquid ? 'GPH' : 'CFH'} Cap)`, pipeCenterX, pipeCenterY + outerRadius + 44);

  const barW = 28;
  const barH = h - 60;
  const barY = 30;

  ctx.fillStyle = isLight ? '#e2e8f0' : '#1e293b';
  ctx.fillRect(rightX, barY, barW, barH);
  ctx.strokeStyle = isLight ? '#cbd5e1' : '#475569';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rightX, barY, barW, barH);

  const fillPct = Math.min(1.0, vel / 40.0);
  const fillH = barH * fillPct;

  const gradient = ctx.createLinearGradient(0, barY + barH, 0, barY);
  gradient.addColorStop(0, '#10b981');
  gradient.addColorStop(0.65, '#f59e0b');
  gradient.addColorStop(1.0, '#ef4444');

  ctx.fillStyle = gradient;
  ctx.fillRect(rightX, barY + barH - fillH, barW, fillH);

  const limitY = barY + barH - (barH * (maxVelCap / 40.0));
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 2]);
  ctx.beginPath();
  ctx.moveTo(rightX - 4, limitY);
  ctx.lineTo(rightX + barW + 4, limitY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Velocity', rightX + barW + 6, barY + 12);
  ctx.fillStyle = vel > maxVelCap ? '#ef4444' : '#10b981';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(vel.toFixed(1) + ' ft/s', rightX + barW + 6, barY + 28);
  ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
  ctx.font = '9px sans-serif';
  ctx.fillText(`Limit: ${maxVelCap} ft/s`, rightX + barW + 6, barY + 42);
}

// -------------------------------------------------------------------
// LONGEST LENGTH SUB-TAB 2 ENGINE & BRANCH SIZING SCHEDULE
// -------------------------------------------------------------------
var gasNetworkRows = [
  { id: 'unit_a', desc: 'Unit A (Longest Run)', branch: 'main', loadVal: 100 },
  { id: 'unit_b', desc: 'Unit B', branch: 'main', loadVal: 100 },
  { id: 'unit_c', desc: 'Unit C (Branch 1 End)', branch: 'branch_1', loadVal: 100 },
  { id: 'unit_d', desc: 'Unit D (Branch 1 Tap)', branch: 'branch_1', loadVal: 100 },
  { id: 'unit_e', desc: 'Unit E', branch: 'main', loadVal: 100 },
  { id: 'unit_f', desc: 'Unit F (Branch 2 End)', branch: 'branch_2', loadVal: 100 },
  { id: 'unit_g', desc: 'Unit G (Branch 2 Mid)', branch: 'branch_2', loadVal: 100 },
  { id: 'unit_h', desc: 'Unit H (Branch 2 Tap)', branch: 'branch_2', loadVal: 100 },
  { id: 'unit_i', desc: 'Unit I (Nearest Meter)', branch: 'main', loadVal: 100 }
];
var gasScheduleLoadUnit = 'mbh'; // 'btuh', 'mbh', 'cfh'

const GAS_BRANCH_METADATA = {
  main: { label: 'Main (Direct)', color: 'sky', badgeClass: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  branch_1: { label: 'Branch 1', color: 'pink', badgeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  branch_2: { label: 'Branch 2', color: 'emerald', badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  branch_3: { label: 'Branch 3', color: 'purple', badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  branch_4: { label: 'Branch 4', color: 'amber', badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
};

function getBranchBadgeHtml(branchKey) {
  const meta = GAS_BRANCH_METADATA[branchKey] || { 
    label: branchKey ? branchKey.replace('_', ' ').toUpperCase() : 'Branch', 
    badgeClass: 'bg-slate-700 text-slate-300 border-slate-600' 
  };
  return `<span class="px-2 py-0.5 text-[10px] font-bold rounded-lg border ${meta.badgeClass}">${meta.label}</span>`;
}

function syncGasFuelTypeLL() {
  const val = document.getElementById('gasFuelTypeSelectLL')?.value;
  if (document.getElementById('gasFuelTypeSelect') && val) document.getElementById('gasFuelTypeSelect').value = val;
  syncGasFuelType();
  renderGasScheduleTable();
}

function syncGasLengthLL(source, val) {
  const numVal = parseFloat(val) || 10;
  const inEl = document.getElementById('gasInputLengthLL');
  const slEl = document.getElementById('gasSliderLengthLL');
  if (inEl && source !== 'input') inEl.value = numVal;
  if (slEl && source !== 'slider') slEl.value = Math.min(1000, numVal);

  const fittingPct = parseFloat(document.getElementById('gasSliderFittingLL')?.value || 20);
  const addFt = Math.round(numVal * (fittingPct / 100));

  const lbl = document.getElementById('gasFittingValueLL');
  if (lbl) lbl.innerText = `${fittingPct}% (+${addFt} ft)`;

  const totalLen = numVal * (1 + fittingPct / 100);
  const totalLbl = document.getElementById('gasTotalEquivLengthLL');
  if (totalLbl) totalLbl.innerText = `${totalLen.toFixed(1)} ft`;

  renderGasScheduleTable();
}

function syncGasFittingLL(val) {
  const numVal = parseFloat(val) || 0;
  const lbl = document.getElementById('gasFittingValueLL');
  const lengthFt = parseFloat(document.getElementById('gasInputLengthLL')?.value || 750);
  const addFt = Math.round(lengthFt * (numVal / 100));
  if (lbl) lbl.innerText = `${numVal}% (+${addFt} ft)`;

  const totalLen = lengthFt * (1 + numVal / 100);
  const totalLbl = document.getElementById('gasTotalEquivLengthLL');
  if (totalLbl) totalLbl.innerText = `${totalLen.toFixed(1)} ft`;

  renderGasScheduleTable();
}

function syncGasConnLengthLL(source, val) {
  const numVal = Math.min(20, Math.max(1, parseFloat(val) || 20));
  const inEl = document.getElementById('gasInputConnLengthLL');
  const slEl = document.getElementById('gasSliderConnLengthLL');
  if (inEl && source !== 'input') inEl.value = numVal;
  if (slEl && source !== 'slider') slEl.value = numVal;

  renderGasScheduleTable();
}

function setGasScheduleLoadUnit(newUnit) {
  if (gasScheduleLoadUnit === newUnit) return;
  const gasType = document.getElementById('gasFuelTypeSelectLL')?.value || document.getElementById('gasFuelTypeSelect')?.value || 'natural_gas';
  const hv = GAS_PROPERTIES[gasType].heatingValue;

  gasNetworkRows.forEach(row => {
    let val = parseFloat(row.loadVal) || 0;
    let btuVal = val;
    if (gasScheduleLoadUnit === 'btuh') btuVal = val;
    else if (gasScheduleLoadUnit === 'mbh') btuVal = val * 1000;
    else if (gasScheduleLoadUnit === 'cfh') btuVal = val * (hv / 1000) * 1000;

    let newVal = btuVal;
    if (newUnit === 'btuh') newVal = btuVal;
    else if (newUnit === 'mbh') newVal = btuVal / 1000;
    else if (newUnit === 'cfh') newVal = btuVal / ((hv / 1000) * 1000);

    row.loadVal = Math.round(newVal);
  });

  gasScheduleLoadUnit = newUnit;

  const bBtu = document.getElementById('btnGasScheduleUnitBTU');
  const bMbh = document.getElementById('btnGasScheduleUnitMBH');
  const bCfh = document.getElementById('btnGasScheduleUnitCFH');

  const actClass = "px-1.5 py-0.5 bg-amber-600 text-white rounded font-bold transition text-[10px]";
  const inactClass = "px-1.5 py-0.5 bg-slate-800 text-slate-400 hover:text-white rounded transition text-[10px]";

  if (bBtu) bBtu.className = newUnit === 'btuh' ? actClass : inactClass;
  if (bMbh) bMbh.className = newUnit === 'mbh' ? actClass : inactClass;
  if (bCfh) bCfh.className = newUnit === 'cfh' ? actClass : inactClass;

  renderGasScheduleTable();
}

function addGasNetworkSegment() {
  const n = gasNetworkRows.length;
  const zoneLetter = String.fromCharCode(65 + (n % 26)) + (n >= 26 ? Math.floor(n / 26) : '');
  const desc = `Unit ${zoneLetter}`;
  const defaultVal = gasScheduleLoadUnit === 'mbh' ? 100 : (gasScheduleLoadUnit === 'cfh' ? 100 : 100000);

  gasNetworkRows.push({
    id: `unit_${zoneLetter.toLowerCase()}`,
    desc: desc,
    branch: 'main',
    loadVal: defaultVal
  });
  renderGasScheduleTable();
}

function addGasBranchGroup() {
  const existingBranches = new Set(gasNetworkRows.map(r => r.branch).filter(b => b && b.startsWith('branch_')));
  let nextNum = 1;
  while (existingBranches.has(`branch_${nextNum}`)) {
    nextNum++;
  }
  const branchKey = `branch_${nextNum}`;

  const n = gasNetworkRows.length;
  const zoneLetter = String.fromCharCode(65 + (n % 26)) + (n >= 26 ? Math.floor(n / 26) : '');
  const defaultVal = gasScheduleLoadUnit === 'mbh' ? 100 : (gasScheduleLoadUnit === 'cfh' ? 100 : 100000);

  gasNetworkRows.push({
    id: `unit_${zoneLetter.toLowerCase()}`,
    desc: `Unit ${zoneLetter} (Branch ${nextNum} End)`,
    branch: branchKey,
    loadVal: defaultVal
  });
  renderGasScheduleTable();
}

function loadExampleBenchmark() {
  gasScheduleLoadUnit = 'mbh';
  const bBtu = document.getElementById('btnGasScheduleUnitBTU');
  const bMbh = document.getElementById('btnGasScheduleUnitMBH');
  const bCfh = document.getElementById('btnGasScheduleUnitCFH');
  if (bBtu) bBtu.className = "px-1.5 py-0.5 bg-slate-800 text-slate-400 hover:text-white rounded transition text-[10px]";
  if (bMbh) bMbh.className = "px-1.5 py-0.5 bg-amber-600 text-white rounded font-bold transition text-[10px]";
  if (bCfh) bCfh.className = "px-1.5 py-0.5 bg-slate-800 text-slate-400 hover:text-white rounded transition text-[10px]";

  const inLen = document.getElementById('gasInputLengthLL');
  const slLen = document.getElementById('gasSliderLengthLL');
  if (inLen) inLen.value = 750;
  if (slLen) slLen.value = 750;

  const inFit = document.getElementById('gasSliderFittingLL');
  if (inFit) inFit.value = 20;

  const inConn = document.getElementById('gasInputConnLengthLL');
  const slConn = document.getElementById('gasSliderConnLengthLL');
  if (inConn) inConn.value = 20;
  if (slConn) slConn.value = 20;

  syncGasLengthLL('program', 750);
  syncGasFittingLL(20);
  syncGasConnLengthLL('program', 20);

  gasNetworkRows = [
    { id: 'unit_a', desc: 'Unit A (Longest Run - 750ft)', branch: 'main', loadVal: 100 },
    { id: 'unit_b', desc: 'Unit B (Main Branch Tap)', branch: 'main', loadVal: 100 },
    { id: 'unit_c', desc: 'Unit C (Branch 1 Farthest)', branch: 'branch_1', loadVal: 100 },
    { id: 'unit_d', desc: 'Unit D (Branch 1 Main Tap)', branch: 'branch_1', loadVal: 100 },
    { id: 'unit_e', desc: 'Unit E (Main Tap)', branch: 'main', loadVal: 100 },
    { id: 'unit_f', desc: 'Unit F (Branch 2 Farthest)', branch: 'branch_2', loadVal: 100 },
    { id: 'unit_g', desc: 'Unit G (Branch 2 Mid)', branch: 'branch_2', loadVal: 100 },
    { id: 'unit_h', desc: 'Unit H (Branch 2 Main Tap)', branch: 'branch_2', loadVal: 100 },
    { id: 'unit_i', desc: 'Unit I (Nearest to Meter)', branch: 'main', loadVal: 100 }
  ];

  renderGasScheduleTable();
  if (typeof showToast === 'function') {
    showToast('Benchmark Loaded', 'Loaded 900 MBH (9-Unit) Commercial Gas Benchmark System.');
  }
}

function moveGasRow(idx, direction) {
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= gasNetworkRows.length) return;
  const temp = gasNetworkRows[idx];
  gasNetworkRows[idx] = gasNetworkRows[targetIdx];
  gasNetworkRows[targetIdx] = temp;
  renderGasScheduleTable();
}

function changeGasRowBranch(idx, newBranch) {
  if (gasNetworkRows[idx]) {
    gasNetworkRows[idx].branch = newBranch;
    renderGasScheduleTable();
  }
}

function renderGasScheduleTable() {
  const tbody = document.getElementById('gasScheduleTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (gasNetworkRows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="p-6 text-center text-slate-500 font-sans">No equipment loads added yet. Click <strong>"Add Load"</strong>, <strong>"+ New Branch"</strong>, or <strong>"9-Unit Example"</strong> to build your gas tree.</td></tr>`;
    updateGasNetworkSummary();
    return;
  }

  const gasType = document.getElementById('gasFuelTypeSelectLL')?.value || document.getElementById('gasFuelTypeSelect')?.value || 'natural_gas';
  const matKey = document.getElementById('gasMaterialSelectLL')?.value || document.getElementById('gasMaterialSelect')?.value || 'sch40_steel';
  const pressPsi = parseFloat(document.getElementById('gasPressureModeSelectLL')?.value || document.getElementById('gasPressureModeSelect')?.value || '0.5');
  const allowDrop = parseFloat(document.getElementById('gasAllowableDropSelectLL')?.value || document.getElementById('gasAllowableDropSelect')?.value || '0.5');
  const fittingPct = parseFloat(document.getElementById('gasSliderFittingLL')?.value || document.getElementById('gasSliderFitting')?.value || '20');
  const lengthFt = parseFloat(document.getElementById('gasInputLengthLL')?.value || document.getElementById('gasInputLength')?.value || '750');
  const connLengthFt = parseFloat(document.getElementById('gasInputConnLengthLL')?.value || '20');
  const maxVelCap = parseFloat(document.getElementById('gasInputMaxVelocity')?.value || '30');
  const hv = GAS_PROPERTIES[gasType].heatingValue;

  // Collect distinct branches currently in table for dropdown
  const branchKeysSet = new Set(['main', 'branch_1', 'branch_2', 'branch_3']);
  gasNetworkRows.forEach(r => { if (r.branch) branchKeysSet.add(r.branch); });
  const allBranchKeys = Array.from(branchKeysSet);

  let runningMainBTU = 0;
  const branchCumulativeBTU = {};
  let unitLabel = gasScheduleLoadUnit.toUpperCase();

  gasNetworkRows.forEach((row, idx) => {
    const letter = String.fromCharCode(65 + (idx % 26)) + (idx >= 26 ? Math.floor(idx / 26) : '');
    const currentBranch = row.branch || 'main';
    
    // Appliance unit load in BTU and CFH
    let rowBTU = 0;
    const val = parseFloat(row.loadVal) || 0;
    if (gasScheduleLoadUnit === 'btuh') rowBTU = val;
    else if (gasScheduleLoadUnit === 'mbh') rowBTU = val * 1000;
    else if (gasScheduleLoadUnit === 'cfh') rowBTU = val * (hv / 1000) * 1000;

    const unitCFH = Math.max(1, rowBTU / (hv / 1000) / 1000);

    // 1. Unit Final Connection Sizing (at connLengthFt after regulator, 0% fitting)
    const connRes = solveGasSegmentSize(unitCFH, connLengthFt, gasType, matKey, pressPsi, allowDrop, 0, maxVelCap);

    // 2. Unit Piping Leg Sizing (at total longest length with fitting allowance)
    const legRes = solveGasSegmentSize(unitCFH, lengthFt, gasType, matKey, pressPsi, allowDrop, fittingPct, maxVelCap);

    // 3. Branch Pipe Sizing (accumulates loads on the same branch from farthest branch device to main tap)
    let branchPipeDisplay = `<span class="text-slate-500 font-sans text-[11px]">— (Direct)</span>`;
    if (currentBranch !== 'main') {
      branchCumulativeBTU[currentBranch] = (branchCumulativeBTU[currentBranch] || 0) + rowBTU;
      const branchCFH = Math.max(1, branchCumulativeBTU[currentBranch] / (hv / 1000) / 1000);
      const brRes = solveGasSegmentSize(branchCFH, lengthFt, gasType, matKey, pressPsi, allowDrop, fittingPct, maxVelCap);
      const brLoadMBH = (branchCumulativeBTU[currentBranch] / 1000).toFixed(0);
      branchPipeDisplay = `<span class="text-pink-300 font-bold">${brRes.codeMinSize}</span> <span class="text-[10px] text-slate-400 font-normal">(${brLoadMBH}M)</span>`;
    }

    // 4. Main Header Sizing (accumulates all downstream appliances in flow order to meter)
    runningMainBTU += rowBTU;
    const mainCumCFH = Math.max(1, runningMainBTU / (hv / 1000) / 1000);
    const mainRes = solveGasSegmentSize(mainCumCFH, lengthFt, gasType, matKey, pressPsi, allowDrop, fittingPct, maxVelCap);

    let displayMainLoad = '';
    if (gasScheduleLoadUnit === 'btuh') displayMainLoad = `${Math.round(runningMainBTU).toLocaleString()} BTUH`;
    else if (gasScheduleLoadUnit === 'mbh') displayMainLoad = `${(runningMainBTU / 1000).toFixed(0)} MBH`;
    else displayMainLoad = `${Math.round(mainCumCFH).toLocaleString()} CFH`;

    // Generate Branch options dropdown HTML
    let branchSelectHtml = `<select onchange="changeGasRowBranch(${idx}, this.value)" class="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-[11px] font-bold outline-none focus:border-amber-500 w-full ${currentBranch === 'main' ? 'text-sky-400' : 'text-pink-400'}">`;
    allBranchKeys.forEach(bk => {
      const bMeta = GAS_BRANCH_METADATA[bk] || { label: bk.replace('_', ' ').toUpperCase() };
      branchSelectHtml += `<option value="${bk}" ${bk === currentBranch ? 'selected' : ''}>${bMeta.label}</option>`;
    });
    branchSelectHtml += `</select>`;

    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-800/40 transition-colors";
    tr.innerHTML = `
      <td class="p-3 text-center font-bold text-amber-400 font-sans">${letter}</td>
      <td class="p-3 font-sans">${branchSelectHtml}</td>
      <td class="p-3 font-sans">
        <input type="text" value="${row.desc || `Unit ${letter}`}" onchange="gasNetworkRows[${idx}].desc=this.value; renderGasScheduleTable();" class="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-sans w-full outline-none focus:border-amber-500">
      </td>
      <td class="p-3">
        <div class="flex items-center gap-1">
          <input type="number" value="${row.loadVal}" min="1" step="10" onchange="gasNetworkRows[${idx}].loadVal=parseFloat(this.value)||0; renderGasScheduleTable();" class="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-400 font-bold mono w-20 outline-none focus:border-amber-500">
          <span class="text-[10px] text-slate-400 font-sans">${unitLabel}</span>
        </div>
      </td>
      <td class="p-3 text-center text-cyan-400 bg-cyan-950/10 font-bold" title="Sized at ${connLengthFt} ft">${connRes.codeMinSize}</td>
      <td class="p-3 text-center text-emerald-400 bg-emerald-950/10 font-bold" title="Sized at ${lengthFt} ft (+${fittingPct}%)">${legRes.codeMinSize}</td>
      <td class="p-3 text-center bg-pink-950/10 font-bold">${branchPipeDisplay}</td>
      <td class="p-3 text-amber-300 bg-amber-950/20 font-bold">
        <span class="text-amber-400 text-sm font-extrabold">${mainRes.codeMinSize}</span>
        <div class="text-[10px] text-slate-400 font-normal mt-0.5">${displayMainLoad} (${Math.round(mainCumCFH).toLocaleString()} CFH)</div>
      </td>
      <td class="p-3 text-slate-300 text-[11px]">
        <span>${mainRes.actualDrop.toFixed(2)} ${pressPsi<=0.5?'in':'psi'}</span> &bull; 
        <span class="${mainRes.isVelocityWarning?'text-amber-400 font-bold':''}">${mainRes.velocityFPS.toFixed(1)} fps</span>
      </td>
      <td class="p-3 text-center">
        <div class="flex items-center justify-center gap-1">
          <button onclick="moveGasRow(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="text-slate-400 hover:text-white disabled:opacity-20 px-1.5 py-0.5 bg-slate-800 rounded text-[10px]" title="Move device upstream/closer to farthest point">
            <i class="fa-solid fa-arrow-up"></i>
          </button>
          <button onclick="moveGasRow(${idx}, 1)" ${idx === gasNetworkRows.length - 1 ? 'disabled' : ''} class="text-slate-400 hover:text-white disabled:opacity-20 px-1.5 py-0.5 bg-slate-800 rounded text-[10px]" title="Move device downstream/closer to meter">
            <i class="fa-solid fa-arrow-down"></i>
          </button>
          <button onclick="gasNetworkRows.splice(${idx},1); renderGasScheduleTable();" class="text-rose-400 hover:text-rose-300 px-1.5 py-0.5 bg-rose-500/10 rounded border border-rose-500/20 text-[10px]" title="Delete load">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateGasNetworkSummary();
}

function updateGasNetworkSummary() {
  const gasType = document.getElementById('gasFuelTypeSelectLL')?.value || document.getElementById('gasFuelTypeSelect')?.value || 'natural_gas';
  const matKey = document.getElementById('gasMaterialSelectLL')?.value || document.getElementById('gasMaterialSelect')?.value || 'sch40_steel';
  const pressPsi = parseFloat(document.getElementById('gasPressureModeSelectLL')?.value || document.getElementById('gasPressureModeSelect')?.value || '0.5');
  const allowDrop = parseFloat(document.getElementById('gasAllowableDropSelectLL')?.value || document.getElementById('gasAllowableDropSelect')?.value || '0.5');
  const fittingPct = parseFloat(document.getElementById('gasSliderFittingLL')?.value || document.getElementById('gasSliderFitting')?.value || '20');
  const lengthFt = parseFloat(document.getElementById('gasInputLengthLL')?.value || document.getElementById('gasInputLength')?.value || '750');
  const maxVelCap = parseFloat(document.getElementById('gasInputMaxVelocity')?.value || '30');
  const hv = GAS_PROPERTIES[gasType].heatingValue;

  let totalBTU = 0;
  let totalUnitLoad = 0;

  gasNetworkRows.forEach(r => {
    const val = parseFloat(r.loadVal) || 0;
    totalUnitLoad += val;
    if (gasScheduleLoadUnit === 'btuh') totalBTU += val;
    else if (gasScheduleLoadUnit === 'mbh') totalBTU += val * 1000;
    else if (gasScheduleLoadUnit === 'cfh') totalBTU += val * (hv / 1000) * 1000;
  });

  const totalCFH = Math.max(0, totalBTU / (hv / 1000) / 1000);
  const mainRes = solveGasSegmentSize(totalCFH, lengthFt, gasType, matKey, pressPsi, allowDrop, fittingPct, maxVelCap);

  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };

  let unitLabel = gasScheduleLoadUnit.toUpperCase();
  setTxt('gasTotalUnitLoad', `${totalUnitLoad.toLocaleString()} ${unitLabel}`);
  setTxt('gasMainPipeSize', `${mainRes.codeMinSize} (${Math.round(totalBTU / 1000)} MBH / ${Math.round(totalCFH)} CFH)`);
  setTxt('gasMainDropVel', `${mainRes.actualDrop.toFixed(2)} ${pressPsi<=0.5?'in.w.g.':'psi'} &bull; ${mainRes.velocityFPS.toFixed(1)} ft/s`);
}

function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  return str.replace(/"/g, '""');
}

function clearGasSchedule() {
  gasNetworkRows = [];
  renderGasScheduleTable();
}

function exportGasScheduleCSV() {
  if (!gasNetworkRows || gasNetworkRows.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Empty Schedule', 'No equipment items to export in schedule.', false);
    } else {
      alert('No equipment items in the schedule to export.');
    }
    return;
  }

  let csv = "Zone,Connection Line,Description,Unit Load,Unit Load Unit,Unit Connection Size (at Conn Length),Piping Leg Size (at Longest Run),Branch Cumulative Load (MBH),Branch Pipe Size,Main Cumulative Load (MBH),Main Cumulative Flow (CFH),Main Trunk Pipe Size,Main Pressure Drop,Main Velocity (ft/s)\n";
  const gasType = document.getElementById('gasFuelTypeSelectLL')?.value || 'natural_gas';
  const matKey = document.getElementById('gasMaterialSelectLL')?.value || 'sch40_steel';
  const pressPsi = parseFloat(document.getElementById('gasPressureModeSelectLL')?.value || '0.5');
  const allowDrop = parseFloat(document.getElementById('gasAllowableDropSelectLL')?.value || '0.5');
  const fittingPct = parseFloat(document.getElementById('gasSliderFittingLL')?.value || '20');
  const lengthFt = parseFloat(document.getElementById('gasInputLengthLL')?.value || '750');
  const connLengthFt = parseFloat(document.getElementById('gasInputConnLengthLL')?.value || '20');
  const maxVelCap = parseFloat(document.getElementById('gasInputMaxVelocity')?.value || '30');
  const hv = GAS_PROPERTIES[gasType].heatingValue;

  let runningBTU = 0;
  let totalUnitLoad = 0;
  const branchCumul = {};

  gasNetworkRows.forEach((row, idx) => {
    const letter = String.fromCharCode(65 + (idx % 26)) + (idx >= 26 ? Math.floor(idx / 26) : '');
    const val = parseFloat(row.loadVal) || 0;
    totalUnitLoad += val;
    const currentBranch = row.branch || 'main';

    let btuVal = val;
    if (gasScheduleLoadUnit === 'btuh') btuVal = val;
    else if (gasScheduleLoadUnit === 'mbh') btuVal = val * 1000;
    else if (gasScheduleLoadUnit === 'cfh') btuVal = val * (hv / 1000) * 1000;

    const unitCFH = Math.max(1, btuVal / (hv / 1000) / 1000);
    const connRes = solveGasSegmentSize(unitCFH, connLengthFt, gasType, matKey, pressPsi, allowDrop, 0, maxVelCap);
    const legRes = solveGasSegmentSize(unitCFH, lengthFt, gasType, matKey, pressPsi, allowDrop, fittingPct, maxVelCap);

    let branchMBH = 0;
    let branchPipeSize = 'N/A (Main)';
    if (currentBranch !== 'main') {
      branchCumul[currentBranch] = (branchCumul[currentBranch] || 0) + btuVal;
      branchMBH = Math.round(branchCumul[currentBranch] / 1000);
      const brCFH = Math.max(1, branchCumul[currentBranch] / (hv / 1000) / 1000);
      const brRes = solveGasSegmentSize(brCFH, lengthFt, gasType, matKey, pressPsi, allowDrop, fittingPct, maxVelCap);
      branchPipeSize = brRes.codeMinSize;
    }

    runningBTU += btuVal;
    const cumCFH = Math.max(1, runningBTU / (hv / 1000) / 1000);
    const mainRes = solveGasSegmentSize(cumCFH, lengthFt, gasType, matKey, pressPsi, allowDrop, fittingPct, maxVelCap);

    csv += `"${letter}","${escapeCsvField(currentBranch)}","${escapeCsvField(row.desc)}",${val},"${gasScheduleLoadUnit.toUpperCase()}","${connRes.codeMinSize}","${legRes.codeMinSize}",${branchMBH},"${branchPipeSize}",${Math.round(runningBTU / 1000)},${Math.round(cumCFH)},"${mainRes.codeMinSize}",${mainRes.actualDrop.toFixed(2)},${mainRes.velocityFPS.toFixed(1)}\n`;
  });

  // Add Summary Footer row to CSV
  const totalCFH = Math.max(0, runningBTU / (hv / 1000) / 1000);
  const mainFinalRes = solveGasSegmentSize(totalCFH, lengthFt, gasType, matKey, pressPsi, allowDrop, fittingPct, maxVelCap);
  csv += `"MAIN","Main Header","Total Connected Demand (to Meter)",${totalUnitLoad},"${gasScheduleLoadUnit.toUpperCase()}","--","--",0,"--",${Math.round(runningBTU / 1000)},${Math.round(totalCFH)},"${mainFinalRes.codeMinSize}",${mainFinalRes.actualDrop.toFixed(2)},${mainFinalRes.velocityFPS.toFixed(1)}\n`;

  // Prepend UTF-8 BOM so Excel opens with correct formatting
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Longest_Length_Gas_Schedule_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (typeof showToast === 'function') {
    showToast('Schedule Exported', 'Downloaded Longest Length Equipment Schedule (.csv)');
  }
}

function renderGasCodeTables() {
  const tbody = document.getElementById('gasCodeTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const gasType = document.getElementById('gasFuelTypeSelect')?.value || 'natural_gas';
  const matKey = document.getElementById('gasMaterialSelect')?.value || 'sch40_steel';
  const pressPsi = parseFloat(document.getElementById('gasPressureModeSelect')?.value || '0.5');
  const allowDropRaw = document.getElementById('gasAllowableDropSelect')?.value || '0.5';

  const prop = GAS_PROPERTIES[gasType] || GAS_PROPERTIES.natural_gas;
  const pipeMat = GAS_PIPE_DATABASE[matKey] || GAS_PIPE_DATABASE.sch40_steel;
  const spGr = prop.specificGravity;
  const cFactor = pipeMat.cFactor || 2313.0;

  const allowDrop = parseFloat(String(allowDropRaw).replace('_psi', '')) || 0.5;

  const lengths = [10, 20, 30, 40, 50, 60, 80, 100, 150, 200];

  pipeMat.sizes.forEach(s => {
    const d = s.d;
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-800/40 transition-colors";
    let rowHtml = `<td class="p-3 font-bold text-amber-400 font-sans">${s.nominal}</td>`;
    
    lengths.forEach(lenFt => {
      let capCFH = 0;
      if (pressPsi <= 0.5) {
        const t = allowDrop / (spGr * lenFt);
        capCFH = cFactor * Math.pow(d, 2.623) * Math.pow(t, 0.541);
      } else {
        const p1Abs = pressPsi + 14.7;
        const p2Abs = Math.max(14.7, p1Abs - allowDrop);
        const term = (Math.pow(p1Abs, 2) - Math.pow(p2Abs, 2)) / (spGr * lenFt);
        capCFH = cFactor * Math.pow(d, 2.623) * Math.pow(Math.max(0, term), 0.541);
      }
      const capInt = Math.round(capCFH);
      rowHtml += `<td class="p-3 font-mono">${capInt.toLocaleString()}</td>`;
    });
    
    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });
}
