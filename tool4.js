// ===================================================================
// TOOL 4 ENGINE (HVAC DUCTULATOR)
// ===================================================================
var activeDuctMode = 'friction';
var currentDuctCFM = 2500;
var currentDuctFriction = 0.08;
var currentDuctVelocity = 1200;
var currentDuctX = 18;
var currentDuctY = 16;
var isPlenumLimitLocked = false;
var plenumLimitY = 15;
var recommendedDuctSize = null;

function setDuctMode(mode) {
  activeDuctMode = mode;
  const lblFrict = document.getElementById('lbl-mode-friction');
  const lblVel = document.getElementById('lbl-mode-velocity');
  const grpFrict = document.getElementById('ductFrictionGroup');
  const grpVel = document.getElementById('ductVelocityGroup');
  
  if (mode === 'friction') {
    if (lblFrict) lblFrict.className = "cursor-pointer flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-teal-600 text-white";
    if (lblVel) lblVel.className = "cursor-pointer flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all";
    if (grpFrict) grpFrict.classList.remove('opacity-50', 'pointer-events-none');
    if (grpVel) grpVel.classList.add('opacity-50', 'pointer-events-none');
  } else {
    if (lblVel) lblVel.className = "cursor-pointer flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-teal-600 text-white";
    if (lblFrict) lblFrict.className = "cursor-pointer flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all";
    if (grpVel) grpVel.classList.remove('opacity-50', 'pointer-events-none');
    if (grpFrict) grpFrict.classList.add('opacity-50', 'pointer-events-none');
  }
  calculateDuctulator('mode');
}

function onDuctCFMInput(src, val) {
  const num = Math.max(10, Math.min(50000, parseFloat(val) || 10));
  currentDuctCFM = num;
  const slider = document.getElementById('ductSliderCFM');
  const input = document.getElementById('ductInputCFM');
  const display = document.getElementById('ductDisplayCFM');
  
  if (slider) slider.value = Math.min(50000, num);
  if (input && document.activeElement !== input) input.value = Math.round(num);
  if (display) display.innerText = num.toLocaleString() + ' CFM';
  calculateDuctulator('cfm');
}

function onDuctFrictionInput(src, val) {
  const num = Math.max(0.01, Math.min(2.0, parseFloat(val) || 0.08));
  currentDuctFriction = num;
  const slider = document.getElementById('ductSliderFriction');
  const input = document.getElementById('ductInputFriction');
  const display = document.getElementById('ductDisplayFriction');
  
  if (slider) slider.value = Math.min(1.0, num);
  if (input && document.activeElement !== input) input.value = num.toFixed(2);
  if (display) display.innerText = num.toFixed(2) + ' in. w.g.';
  calculateDuctulator('friction');
}

function onDuctVelocityInput(src, val) {
  const num = Math.max(100, Math.min(6000, parseFloat(val) || 1200));
  currentDuctVelocity = num;
  const slider = document.getElementById('ductSliderVelocity');
  const input = document.getElementById('ductInputVelocity');
  const display = document.getElementById('ductDisplayVelocity');
  
  if (slider) slider.value = Math.min(4000, num);
  if (input && document.activeElement !== input) input.value = Math.round(num);
  if (display) display.innerText = Math.round(num).toLocaleString() + ' FPM';
  calculateDuctulator('velocity');
}

function calcHuebscherDe(a, b) {
  if (a <= 0 || b <= 0) return 0;
  return 1.30 * Math.pow(a * b, 0.625) / Math.pow(a + b, 0.25);
}

function syncDuctX(src, val) {
  const num = Math.max(4, Math.min(120, parseInt(val, 10) || 18));
  currentDuctX = num;
  const slider = document.getElementById('ductSliderX');
  const input = document.getElementById('ductInputX');
  const display = document.getElementById('ductDisplayX');
  
  if (slider) slider.value = num;
  if (input && document.activeElement !== input) input.value = num;
  if (display) display.innerText = num + '"';
  calculateDuctulator('x');
}

function syncDuctY(src, val) {
  let num = Math.max(4, Math.min(120, parseInt(val, 10) || 16));
  if (isPlenumLimitLocked && num > plenumLimitY) {
    num = plenumLimitY;
  }
  currentDuctY = num;
  const slider = document.getElementById('ductSliderY');
  const input = document.getElementById('ductInputY');
  const display = document.getElementById('ductDisplayY');
  
  if (slider) slider.value = num;
  if (input && document.activeElement !== input) input.value = num;
  if (display) display.innerText = num + '"';
  calculateDuctulator('y');
}

function togglePlenumLimit(forceState) {
  if (typeof forceState === 'boolean') {
    isPlenumLimitLocked = forceState;
  } else {
    isPlenumLimitLocked = !isPlenumLimitLocked;
  }
  updatePlenumLimitUI();
  calculateDuctulator('limit_toggle');
  savePlenumLimitDraft();
}

function onPlenumLimitInput(val) {
  const num = Math.max(4, Math.min(60, parseInt(val, 10) || 15));
  plenumLimitY = num;
  const inp = document.getElementById('inputPlenumLimitY');
  if (inp && document.activeElement !== inp) inp.value = num;
  updatePlenumLimitUI();
  if (isPlenumLimitLocked) {
    calculateDuctulator('limit_change');
  }
  savePlenumLimitDraft();
}

function updatePlenumLimitUI() {
  const btn = document.getElementById('btnTogglePlenumLimit');
  const icon = document.getElementById('iconPlenumLock');
  const text = document.getElementById('textPlenumLock');
  const badge = document.getElementById('badgePlenumLimitStatus');
  const sliderY = document.getElementById('ductSliderY');

  if (isPlenumLimitLocked) {
    if (btn) {
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/25 border border-sky-500';
    }
    if (icon) {
      icon.className = 'fa-solid fa-lock text-white';
    }
    if (text) {
      text.innerText = 'Height Limit Locked';
    }
    if (badge) {
      badge.classList.remove('hidden');
      badge.innerText = `Max ${plenumLimitY}"`;
    }
    if (sliderY) {
      sliderY.max = plenumLimitY;
    }
  } else {
    if (btn) {
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700';
    }
    if (icon) {
      icon.className = 'fa-solid fa-lock-open text-slate-400';
    }
    if (text) {
      text.innerText = 'Lock Height (Plenum Limit)';
    }
    if (badge) {
      badge.classList.add('hidden');
    }
    if (sliderY) {
      sliderY.max = 120;
    }
    const box = document.getElementById('ductRecSizeBox');
    if (box) box.classList.add('hidden');
  }
}

function findOptimalRecommendedDuct(Q, De_exact, maxY) {
  const candidates = [];
  for (let y = 4; y <= maxY; y++) {
    for (let x = 4; x <= 120; x++) {
      const de = calcHuebscherDe(x, y);
      if (de >= De_exact) {
        const aspect = Math.max(x, y) / Math.min(x, y);
        const area = (x * y) / 144.0;
        const vel = area > 0 ? Q / area : 0;
        const isEven = (x % 2 === 0 && y % 2 === 0);
        if (aspect <= 2.5) {
          candidates.push({
            x: x,
            y: y,
            de: de,
            aspect: aspect,
            vel: vel,
            area: area,
            isEven: isEven,
            yClearance: maxY - y
          });
        }
        break;
      }
    }
  }

  if (candidates.length === 0) {
    let best = null;
    let minAsp = 999;
    for (let y = 4; y <= maxY; y++) {
      for (let x = 4; x <= 120; x++) {
        const de = calcHuebscherDe(x, y);
        if (de >= De_exact) {
          const aspect = Math.max(x, y) / Math.min(x, y);
          const area = (x * y) / 144.0;
          const vel = area > 0 ? Q / area : 0;
          if (aspect < minAsp) {
            minAsp = aspect;
            best = { x, y, de, aspect, vel, area, isEven: (x % 2 === 0 && y % 2 === 0), yClearance: maxY - y };
          }
          break;
        }
      }
    }
    return best;
  }

  candidates.sort((a, b) => {
    const evenA = a.isEven ? 0 : 1;
    const evenB = b.isEven ? 0 : 1;
    if (evenA !== evenB) return evenA - evenB;

    const velBracketA = Math.round(a.vel / 15.0);
    const velBracketB = Math.round(b.vel / 15.0);
    if (velBracketA !== velBracketB) return velBracketA - velBracketB;

    const clearA = a.yClearance >= 2 ? -1 : 0;
    const clearB = b.yClearance >= 2 ? -1 : 0;
    if (clearA !== clearB) return clearA - clearB;

    return a.aspect - b.aspect;
  });

  return candidates[0];
}

function applyRecommendedDuctSize() {
  if (!recommendedDuctSize) return;
  currentDuctX = recommendedDuctSize.x;
  currentDuctY = recommendedDuctSize.y;

  const dX = document.getElementById('ductDisplayX');
  const iX = document.getElementById('ductInputX');
  const sX = document.getElementById('ductSliderX');
  if (dX) dX.innerText = currentDuctX + '"';
  if (iX) iX.value = currentDuctX;
  if (sX) sX.value = Math.min(120, currentDuctX);

  const dY = document.getElementById('ductDisplayY');
  const iY = document.getElementById('ductInputY');
  const sY = document.getElementById('ductSliderY');
  if (dY) dY.innerText = currentDuctY + '"';
  if (iY) iY.value = currentDuctY;
  if (sY) sY.value = Math.min(plenumLimitY, currentDuctY);

  calculateDuctulator('applied_rec');
}

function calculateDuctulator(changedSource) {
  if (currentDuctFriction <= 0) currentDuctFriction = 0.001;
  if (currentDuctVelocity <= 0) currentDuctVelocity = 10;
  
  const Q = Math.max(0, currentDuctCFM);
  let De_exact = 0;
  
  if (activeDuctMode === 'friction') {
    De_exact = Math.pow((0.10913 * Math.pow(Q, 1.9)) / currentDuctFriction, 1 / 5.02);
    currentDuctVelocity = De_exact > 0 ? Q / ((Math.PI * Math.pow(De_exact, 2)) / 576) : 0;
  } else {
    De_exact = Math.sqrt((4 * ((144 * Q) / currentDuctVelocity)) / Math.PI);
    currentDuctFriction = De_exact > 0 ? (0.10913 * Math.pow(Q, 1.9)) / Math.pow(De_exact, 5.02) : 0;
  }

  if (activeDuctMode === 'velocity') {
    const dF = document.getElementById('ductDisplayFriction');
    const iF = document.getElementById('ductInputFriction');
    const sF = document.getElementById('ductSliderFriction');
    if (dF) dF.innerText = currentDuctFriction.toFixed(2) + ' in. w.g.';
    if (iF && document.activeElement !== iF) iF.value = currentDuctFriction.toFixed(2);
    if (sF) sF.value = currentDuctFriction;
  } else {
    const dV = document.getElementById('ductDisplayVelocity');
    const iV = document.getElementById('ductInputVelocity');
    const sV = document.getElementById('ductSliderVelocity');
    if (dV) dV.innerText = Math.round(currentDuctVelocity).toLocaleString() + ' FPM';
    if (iV && document.activeElement !== iV) iV.value = Math.round(currentDuctVelocity);
    if (sV) sV.value = Math.min(4000, currentDuctVelocity);
  }

  const D_round = Math.max(1, Math.ceil(De_exact));
  const A_round = (Math.PI * Math.pow(D_round, 2)) / 576;
  const V_round = A_round > 0 ? Q / A_round : 0;
  let Q_round_max = activeDuctMode === 'friction' ? Math.pow((currentDuctFriction * Math.pow(D_round, 5.02)) / 0.10913, 1 / 1.9) : currentDuctVelocity * A_round;

  let X = currentDuctX;
  let Y = currentDuctY;
  
  if (isPlenumLimitLocked && changedSource !== 'applied_rec') {
    if (changedSource !== 'y') {
      Y = plenumLimitY;
      currentDuctY = Y;
      let solvedX = 1;
      while (calcHuebscherDe(solvedX, Y) < De_exact && solvedX < 200) solvedX++;
      X = solvedX;
      currentDuctX = X;
    } else {
      if (Y > plenumLimitY) {
        Y = plenumLimitY;
        currentDuctY = Y;
      }
      let solvedX = 1;
      while (calcHuebscherDe(solvedX, Y) < De_exact && solvedX < 200) solvedX++;
      X = solvedX;
      currentDuctX = X;
    }
    const dX = document.getElementById('ductDisplayX');
    const iX = document.getElementById('ductInputX');
    const sX = document.getElementById('ductSliderX');
    if (dX) dX.innerText = X + '"';
    if (iX && document.activeElement !== iX) iX.value = X;
    if (sX) sX.value = Math.min(120, X);

    const dY = document.getElementById('ductDisplayY');
    const iY = document.getElementById('ductInputY');
    const sY = document.getElementById('ductSliderY');
    if (dY) dY.innerText = Y + '"';
    if (iY && document.activeElement !== iY) iY.value = Y;
    if (sY) sY.value = Math.min(plenumLimitY, Y);
  } else if (changedSource === 'applied_rec') {
    X = currentDuctX;
    Y = currentDuctY;
  } else {
    // Normal unlocked standard sizing
    if (changedSource !== 'y') {
      let solvedY = 1;
      while (calcHuebscherDe(X, solvedY) < De_exact && solvedY < 200) solvedY++;
      Y = solvedY;
      currentDuctY = Y;
      const dY = document.getElementById('ductDisplayY');
      const iY = document.getElementById('ductInputY');
      const sY = document.getElementById('ductSliderY');
      if (dY) dY.innerText = Y + '"';
      if (iY && document.activeElement !== iY) iY.value = Y;
      if (sY) sY.value = Math.min(120, Y);
    } else {
      let solvedX = 1;
      while (calcHuebscherDe(solvedX, Y) < De_exact && solvedX < 200) solvedX++;
      X = solvedX;
      currentDuctX = X;
      const dX = document.getElementById('ductDisplayX');
      const iX = document.getElementById('ductInputX');
      const sX = document.getElementById('ductSliderX');
      if (dX) dX.innerText = X + '"';
      if (iX && document.activeElement !== iX) iX.value = X;
      if (sX) sX.value = Math.min(120, X);
    }
  }

  const De_rect = calcHuebscherDe(X, Y);
  const A_rect_ft = (X * Y) / 144;
  const V_rect = A_rect_ft > 0 ? Q / A_rect_ft : 0;
  let Q_rect_max = activeDuctMode === 'friction' ? Math.pow((currentDuctFriction * Math.pow(De_rect, 5.02)) / 0.10913, 1 / 1.9) : currentDuctVelocity * A_rect_ft;
  const minSide = Math.min(X, Y);
  const aspectRatio = minSide > 0 ? Math.max(X, Y) / minSide : 1.0;

  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
  setTxt('ductOutputRoundDia', D_round + '"');
  setTxt('ductOutputRoundExact', De_exact.toFixed(2) + '"');
  setTxt('ductOutputRoundFPM', Math.round(V_round).toLocaleString() + ' FPM');
  setTxt('ductOutputRoundMaxCap', Math.round(Q_round_max).toLocaleString() + ' CFM');
  setTxt('ductOutputRectDims', X + '" × ' + Y + '"');
  setTxt('ductOutputRectDe', De_rect.toFixed(2) + '"');
  setTxt('ductOutputRectFPM', Math.round(V_rect).toLocaleString() + ' FPM');
  setTxt('ductOutputRectMaxCap', Math.round(Q_rect_max).toLocaleString() + ' CFM');

  const aspectBadge = document.getElementById('ductOutputAspectBadge');
  if (aspectBadge) {
    if (aspectRatio <= 2.5) {
      aspectBadge.innerText = `Aspect ${aspectRatio.toFixed(1)}:1 (Optimal)`;
      aspectBadge.className = 'text-[10px] font-bold bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded border border-emerald-500/30';
    } else if (aspectRatio <= 4.0) {
      aspectBadge.innerText = `Aspect ${aspectRatio.toFixed(1)}:1 (High)`;
      aspectBadge.className = 'text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30';
    } else {
      aspectBadge.innerText = `Aspect ${aspectRatio.toFixed(1)}:1 (>4:1 Exceeds SMACNA)`;
      aspectBadge.className = 'text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30';
    }
  }

  // Handle Optimal Recommended Size Box when Plenum Limit is Active
  const recBox = document.getElementById('ductRecSizeBox');
  if (isPlenumLimitLocked && recBox) {
    recommendedDuctSize = findOptimalRecommendedDuct(Q, De_exact, plenumLimitY);
    if (recommendedDuctSize) {
      recBox.classList.remove('hidden');
      const recDims = document.getElementById('recDuctDims');
      const recVel = document.getElementById('recDuctVelocity');
      const recDe = document.getElementById('recDuctDe');
      const recBadge = document.getElementById('recDuctAspectBadge');
      const btnText = document.getElementById('btnApplyRecSizeText');
      const btn = document.getElementById('btnApplyRecSize');
      const reasonText = document.getElementById('recDuctReasonText');

      if (recDims) recDims.innerText = `${recommendedDuctSize.x}" × ${recommendedDuctSize.y}"`;
      if (recVel) recVel.innerText = `${Math.round(recommendedDuctSize.vel).toLocaleString()} FPM`;
      if (recDe) recDe.innerText = `${recommendedDuctSize.de.toFixed(2)}"`;
      if (recBadge) recBadge.innerText = `Aspect ${recommendedDuctSize.aspect.toFixed(1)}:1 (Optimal)`;

      const isCurrentApplied = (X === recommendedDuctSize.x && Y === recommendedDuctSize.y);
      if (isCurrentApplied) {
        if (btnText) btnText.innerText = `Applied (${recommendedDuctSize.x}" × ${recommendedDuctSize.y}")`;
        if (btn) {
          btn.className = 'px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 opacity-90 cursor-default';
        }
        if (reasonText) reasonText.innerText = `Optimal sizing applied. Meets aspect limit & lowest velocity under ${plenumLimitY}" limit.`;
      } else {
        if (btnText) btnText.innerText = `Apply Recommended (${recommendedDuctSize.x}" × ${recommendedDuctSize.y}")`;
        if (btn) {
          btn.className = 'px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl transition shadow-md shadow-amber-600/20 flex items-center gap-1.5 shrink-0 cursor-pointer';
        }
        if (reasonText) reasonText.innerText = `Evaluated for lowest velocity & commercial increments under ${plenumLimitY}" plenum limit.`;
      }
    } else {
      recBox.classList.add('hidden');
    }
  } else if (recBox) {
    recBox.classList.add('hidden');
  }

  setTxt('metricDuctArea', `${A_rect_ft.toFixed(2)} sq ft (${X * Y} sq in)`);
  setTxt('metricDuctFriction', `${currentDuctFriction.toFixed(3)} in. w.g. / 100 ft`);

  const noiseBadge = document.getElementById('ductNoiseBadge');
  const acousticTxt = document.getElementById('metricDuctAcoustic');
  
  if (V_rect < 700) {
    if (noiseBadge) { noiseBadge.innerText = 'NC 25-30: Ultra Quiet'; noiseBadge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-medium'; }
    if (acousticTxt) acousticTxt.innerText = 'NC 25-30 (Quiet / Studio)';
  } else if (V_rect <= 1200) {
    if (noiseBadge) { noiseBadge.innerText = 'NC 30-35: Commercial Office'; noiseBadge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-600 font-medium'; }
    if (acousticTxt) acousticTxt.innerText = 'NC 30-35 (Commercial Office)';
  } else if (V_rect <= 1800) {
    if (noiseBadge) { noiseBadge.innerText = 'NC 35-40: Main Supply Trunk'; noiseBadge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium'; }
    if (acousticTxt) acousticTxt.innerText = 'NC 35-40 (Main Supply Trunk)';
  } else {
    if (noiseBadge) { noiseBadge.innerText = '> NC 40: High Velocity / Industrial'; noiseBadge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-500 font-medium'; }
    if (acousticTxt) acousticTxt.innerText = '> NC 40 (Industrial Velocity)';
  }

  drawDuctCanvas();
}

function drawDuctCanvas() {
  const canvas = document.getElementById('ductCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  
  const isLight = document.documentElement.classList.contains('light');
  const X = currentDuctX, Y = currentDuctY, Q = currentDuctCFM;

  let De_exact = activeDuctMode === 'friction'
    ? Math.pow((0.10913 * Math.pow(Q, 1.9)) / currentDuctFriction, 1 / 5.02)
    : Math.sqrt((4 * ((144 * Q) / currentDuctVelocity)) / Math.PI);
    
  const D_round = Math.ceil(De_exact);

  const maxInches = Math.max(D_round, X, Y, 12);
  const availableW = W / 2 - (40 * dpr);
  const availableH = H - (60 * dpr);
  const scale = Math.min(availableW / maxInches, availableH / maxInches);

  // Left Section: Round Duct
  const leftCenterX = W * 0.25;
  const centerY = H * 0.5;
  const roundRadius = (D_round / 2) * scale;

  ctx.beginPath();
  ctx.arc(leftCenterX, centerY, roundRadius, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(20, 184, 166, 0.25)';
  ctx.fill();
  ctx.lineWidth = 3 * dpr;
  ctx.strokeStyle = isLight ? '#0284c7' : '#2dd4bf';
  ctx.stroke();

  ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
  ctx.font = `bold ${Math.round(13 * dpr)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${D_round}" Round`, leftCenterX, centerY + (4 * dpr));

  // Right Section: Rectangular Duct
  const rightCenterX = W * 0.75;
  const rectW = X * scale;
  const rectH = Y * scale;
  const rectX = rightCenterX - rectW / 2;
  const rectY = centerY - rectH / 2;

  ctx.beginPath();
  ctx.rect(rectX, rectY, rectW, rectH);
  ctx.fillStyle = isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(245, 158, 11, 0.25)';
  ctx.fill();
  ctx.lineWidth = 3 * dpr;
  ctx.strokeStyle = isLight ? '#d97706' : '#fbbf24';
  ctx.stroke();

  ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
  ctx.font = `bold ${Math.round(13 * dpr)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${X}" x ${Y}"`, rightCenterX, centerY + (4 * dpr));

  // Section Headers
  ctx.fillStyle = isLight ? '#334155' : '#f1f5f9';
  ctx.font = `bold ${Math.round(11 * dpr)}px Inter, sans-serif`;
  ctx.fillText('ROUND DUCT', leftCenterX, (25 * dpr));
  ctx.fillText('RECTANGULAR DUCT', rightCenterX, (25 * dpr));
}

// ===================================================================
// TOOL 4 SUBPAGE NAVIGATION & REVERSE CFM LOOKUP ENGINE
// ===================================================================
var activeTool4Tab = 'direct';
var revDuctMode = 'friction';
var revDuctFriction = 0.08;
var revDuctVelocity = 1200;
var revDuctRoundD = 18;
var revDuctX = 18;
var revDuctY = 16;

function switchTool4Tab(tab) {
  activeTool4Tab = tab;
  const btnDirect = document.getElementById('tool4-tab-btn-direct');
  const btnReverse = document.getElementById('tool4-tab-btn-reverse');
  const pageDirect = document.getElementById('tool4-subpage-direct');
  const pageReverse = document.getElementById('tool4-subpage-reverse');

  if (tab === 'direct') {
    if (btnDirect) {
      btnDirect.className = 'px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 bg-teal-600 text-white shadow-md shadow-teal-600/25';
    }
    if (btnReverse) {
      btnReverse.className = 'px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800';
    }
    if (pageDirect) pageDirect.classList.remove('hidden');
    if (pageReverse) pageReverse.classList.add('hidden');
    requestAnimationFrame(() => {
      drawDuctCanvas();
    });
  } else {
    if (btnReverse) {
      btnReverse.className = 'px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 bg-teal-600 text-white shadow-md shadow-teal-600/25';
    }
    if (btnDirect) {
      btnDirect.className = 'px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800';
    }
    if (pageDirect) pageDirect.classList.add('hidden');
    if (pageReverse) pageReverse.classList.remove('hidden');
    requestAnimationFrame(() => {
      drawReverseDuctCanvas();
    });
  }
  saveTool4ReverseDraft();
}

function setRevDuctMode(mode) {
  revDuctMode = mode;
  const lblFrict = document.getElementById('lbl-rev-mode-friction');
  const lblVel = document.getElementById('lbl-rev-mode-velocity');
  const grpFrict = document.getElementById('revDuctFrictionGroup');
  const grpVel = document.getElementById('revDuctVelocityGroup');

  if (mode === 'friction') {
    if (lblFrict) lblFrict.className = 'cursor-pointer flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-teal-600 text-white';
    if (lblVel) lblVel.className = 'cursor-pointer flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all';
    if (grpFrict) grpFrict.classList.remove('opacity-50', 'pointer-events-none');
    if (grpVel) grpVel.classList.add('opacity-50', 'pointer-events-none');
  } else {
    if (lblVel) lblVel.className = 'cursor-pointer flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-teal-600 text-white';
    if (lblFrict) lblFrict.className = 'cursor-pointer flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all';
    if (grpVel) grpVel.classList.remove('opacity-50', 'pointer-events-none');
    if (grpFrict) grpFrict.classList.add('opacity-50', 'pointer-events-none');
  }
  calculateReverseDuctulator('mode');
}

function onRevDuctFrictionInput(src, val) {
  const num = Math.max(0.01, Math.min(2.0, parseFloat(val) || 0.08));
  revDuctFriction = num;
  const slider = document.getElementById('revDuctSliderFriction');
  const input = document.getElementById('revDuctInputFriction');
  const display = document.getElementById('revDuctDisplayFriction');

  if (slider) slider.value = Math.min(1.0, num);
  if (input && document.activeElement !== input) input.value = num.toFixed(2);
  if (display) display.innerText = num.toFixed(2) + ' in. w.g.';
  calculateReverseDuctulator('friction');
}

function onRevDuctVelocityInput(src, val) {
  const num = Math.max(100, Math.min(6000, parseFloat(val) || 1200));
  revDuctVelocity = num;
  const slider = document.getElementById('revDuctSliderVelocity');
  const input = document.getElementById('revDuctInputVelocity');
  const display = document.getElementById('revDuctDisplayVelocity');

  if (slider) slider.value = Math.min(4000, num);
  if (input && document.activeElement !== input) input.value = Math.round(num);
  if (display) display.innerText = Math.round(num).toLocaleString() + ' FPM';
  calculateReverseDuctulator('velocity');
}

// Find closest rectangular height Y for a given width X to achieve target equivalent diameter De
function solveBestRectY(X, targetDe) {
  let bestY = 4;
  let minDiff = 999999;
  for (let y = 4; y <= 120; y++) {
    const de = calcHuebscherDe(X, y);
    const diff = Math.abs(de - targetDe);
    if (diff < minDiff) {
      minDiff = diff;
      bestY = y;
    }
  }
  return bestY;
}

// Tandem Handler 1: Round Duct Diameter Changed
function onRevDuctRoundInput(src, val) {
  const num = Math.max(4, Math.min(100, parseInt(val, 10) || 18));
  revDuctRoundD = num;

  const slider = document.getElementById('revDuctSliderRound');
  const input = document.getElementById('revDuctInputRound');
  const display = document.getElementById('revDuctDisplayRound');

  if (slider) slider.value = Math.min(60, num);
  if (input && document.activeElement !== input) input.value = num;
  if (display) display.innerText = num + '"';

  // Tandem coupling: Update Rectangular Height Y while keeping Width X constant
  const solvedY = solveBestRectY(revDuctX, num);
  revDuctY = solvedY;

  const sliderY = document.getElementById('revDuctSliderY');
  const inputY = document.getElementById('revDuctInputY');
  const displayY = document.getElementById('revDuctDisplayY');
  if (sliderY) sliderY.value = Math.min(120, solvedY);
  if (inputY && document.activeElement !== inputY) inputY.value = solvedY;
  if (displayY) displayY.innerText = solvedY + '"';

  calculateReverseDuctulator('round');
}

// Tandem Handler 2: Rectangular Width (Side X) Changed
function onRevDuctXInput(src, val) {
  const num = Math.max(4, Math.min(120, parseInt(val, 10) || 18));
  revDuctX = num;

  const slider = document.getElementById('revDuctSliderX');
  const input = document.getElementById('revDuctInputX');
  const display = document.getElementById('revDuctDisplayX');

  if (slider) slider.value = num;
  if (input && document.activeElement !== input) input.value = num;
  if (display) display.innerText = num + '"';

  // Tandem coupling: Update Round Duct diameter to match equivalent diameter
  const equivD = Math.max(4, Math.min(100, Math.round(calcHuebscherDe(revDuctX, revDuctY))));
  revDuctRoundD = equivD;

  const sliderRound = document.getElementById('revDuctSliderRound');
  const inputRound = document.getElementById('revDuctInputRound');
  const displayRound = document.getElementById('revDuctDisplayRound');
  if (sliderRound) sliderRound.value = Math.min(60, equivD);
  if (inputRound && document.activeElement !== inputRound) inputRound.value = equivD;
  if (displayRound) displayRound.innerText = equivD + '"';

  calculateReverseDuctulator('x');
}

// Tandem Handler 3: Rectangular Height (Side Y) Changed
function onRevDuctYInput(src, val) {
  const num = Math.max(4, Math.min(120, parseInt(val, 10) || 16));
  revDuctY = num;

  const slider = document.getElementById('revDuctSliderY');
  const input = document.getElementById('revDuctInputY');
  const display = document.getElementById('revDuctDisplayY');

  if (slider) slider.value = num;
  if (input && document.activeElement !== input) input.value = num;
  if (display) display.innerText = num + '"';

  // Tandem coupling: Update Round Duct diameter to match equivalent diameter
  const equivD = Math.max(4, Math.min(100, Math.round(calcHuebscherDe(revDuctX, revDuctY))));
  revDuctRoundD = equivD;

  const sliderRound = document.getElementById('revDuctSliderRound');
  const inputRound = document.getElementById('revDuctInputRound');
  const displayRound = document.getElementById('revDuctDisplayRound');
  if (sliderRound) sliderRound.value = Math.min(60, equivD);
  if (inputRound && document.activeElement !== inputRound) inputRound.value = equivD;
  if (displayRound) displayRound.innerText = equivD + '"';

  calculateReverseDuctulator('y');
}

// Main Reverse Calculation Routine
function calculateReverseDuctulator(changedSource) {
  if (revDuctFriction <= 0) revDuctFriction = 0.001;
  if (revDuctVelocity <= 0) revDuctVelocity = 10;

  const D_round = Math.max(1, revDuctRoundD);
  const A_round = (Math.PI * Math.pow(D_round, 2)) / 576; // sq ft
  const X = revDuctX;
  const Y = revDuctY;
  const A_rect_ft = (X * Y) / 144; // sq ft
  const De_rect = calcHuebscherDe(X, Y);

  let Q_round = 0;
  let V_round = 0;
  let Q_rect = 0;
  let V_rect = 0;
  let evaluatedFriction = revDuctFriction;

  if (revDuctMode === 'friction') {
    // Airflow solved from Colebrook / Huebscher friction equation:
    // hf = 0.10913 * Q^1.9 / De^5.02 => Q = ((hf * De^5.02) / 0.10913)^(1 / 1.9)
    Q_round = Math.pow((revDuctFriction * Math.pow(D_round, 5.02)) / 0.10913, 1 / 1.9);
    V_round = A_round > 0 ? Q_round / A_round : 0;

    Q_rect = Math.pow((revDuctFriction * Math.pow(De_rect, 5.02)) / 0.10913, 1 / 1.9);
    V_rect = A_rect_ft > 0 ? Q_rect / A_rect_ft : 0;
    evaluatedFriction = revDuctFriction;
  } else {
    // Velocity constraint mode
    V_round = revDuctVelocity;
    Q_round = V_round * A_round;

    V_rect = revDuctVelocity;
    Q_rect = V_rect * A_rect_ft;

    evaluatedFriction = De_rect > 0 ? (0.10913 * Math.pow(Q_rect, 1.9)) / Math.pow(De_rect, 5.02) : 0;

    const dF = document.getElementById('revDuctDisplayFriction');
    const iF = document.getElementById('revDuctInputFriction');
    const sF = document.getElementById('revDuctSliderFriction');
    if (dF) dF.innerText = evaluatedFriction.toFixed(2) + ' in. w.g.';
    if (iF && document.activeElement !== iF) iF.value = evaluatedFriction.toFixed(2);
    if (sF) sF.value = Math.min(1.0, evaluatedFriction);
  }

  const minSide = Math.min(X, Y);
  const aspectRatio = minSide > 0 ? Math.max(X, Y) / minSide : 1.0;

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.innerText = txt;
  };

  // Update Round outputs
  setTxt('revDuctOutputRoundDiaBadge', `${D_round}" Round`);
  setTxt('revDuctOutputRoundCFM', Math.round(Q_round).toLocaleString() + ' CFM');
  setTxt('revDuctOutputRoundArea', `${A_round.toFixed(2)} sq ft`);
  setTxt('revDuctOutputRoundFPM', Math.round(V_round).toLocaleString() + ' FPM');
  setTxt('revDuctOutputRoundFriction', evaluatedFriction.toFixed(3) + ' in. w.g.');

  // Update Rectangular outputs
  setTxt('revDuctOutputRectCFM', Math.round(Q_rect).toLocaleString() + ' CFM');
  setTxt('revDuctOutputRectDe', De_rect.toFixed(2) + '"');
  setTxt('revDuctOutputRectDims', `${X}" × ${Y}"`);
  setTxt('revDuctOutputRectFPM', Math.round(V_rect).toLocaleString() + ' FPM');
  setTxt('revDuctOutputRectArea', `${A_rect_ft.toFixed(2)} sq ft`);

  // Aspect ratio badge
  const aspectBadge = document.getElementById('revDuctOutputAspectBadge');
  if (aspectBadge) {
    if (aspectRatio <= 2.5) {
      aspectBadge.innerText = `Aspect ${aspectRatio.toFixed(1)}:1 (Optimal)`;
      aspectBadge.className = 'text-[10px] font-bold bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded border border-emerald-500/30';
    } else if (aspectRatio <= 4.0) {
      aspectBadge.innerText = `Aspect ${aspectRatio.toFixed(1)}:1 (High)`;
      aspectBadge.className = 'text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30';
    } else {
      aspectBadge.innerText = `Aspect ${aspectRatio.toFixed(1)}:1 (>4:1 Exceeds SMACNA)`;
      aspectBadge.className = 'text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30';
    }
  }

  // Cross section & acoustic noise metrics
  setTxt('revMetricDuctArea', `${A_rect_ft.toFixed(2)} sq ft (${X * Y} sq in)`);
  setTxt('revMetricDuctFriction', `${evaluatedFriction.toFixed(3)} in. w.g. / 100 ft`);

  const noiseBadge = document.getElementById('revDuctNoiseBadge');
  const acousticTxt = document.getElementById('revMetricDuctAcoustic');
  if (V_rect < 700) {
    if (noiseBadge) {
      noiseBadge.innerText = 'NC 25-30: Ultra Quiet';
      noiseBadge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-medium';
    }
    if (acousticTxt) acousticTxt.innerText = 'NC 25-30 (Quiet / Studio)';
  } else if (V_rect <= 1200) {
    if (noiseBadge) {
      noiseBadge.innerText = 'NC 30-35: Commercial Office';
      noiseBadge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-600 font-medium';
    }
    if (acousticTxt) acousticTxt.innerText = 'NC 30-35 (Commercial Office)';
  } else if (V_rect <= 1800) {
    if (noiseBadge) {
      noiseBadge.innerText = 'NC 35-40: Main Supply Trunk';
      noiseBadge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium';
    }
    if (acousticTxt) acousticTxt.innerText = 'NC 35-40 (Main Supply Trunk)';
  } else {
    if (noiseBadge) {
      noiseBadge.innerText = '> NC 40: High Velocity / Industrial';
      noiseBadge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-500 font-medium';
    }
    if (acousticTxt) acousticTxt.innerText = '> NC 40 (Industrial Velocity)';
  }

  drawReverseDuctCanvas();
  saveTool4ReverseDraft();
}

function drawReverseDuctCanvas() {
  const canvas = document.getElementById('revDuctCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const parent = canvas.parentElement;
  if (!parent) return;
  const rect = parent.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const isLight = document.documentElement.classList.contains('light');
  const X = revDuctX, Y = revDuctY, D_round = revDuctRoundD;

  const maxInches = Math.max(D_round, X, Y, 12);
  const availableW = W / 2 - (40 * dpr);
  const availableH = H - (60 * dpr);
  const scale = Math.min(availableW / maxInches, availableH / maxInches);

  // Left Section: Round Duct
  const leftCenterX = W * 0.25;
  const centerY = H * 0.5;
  const roundRadius = (D_round / 2) * scale;

  ctx.beginPath();
  ctx.arc(leftCenterX, centerY, roundRadius, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(20, 184, 166, 0.25)';
  ctx.fill();
  ctx.lineWidth = 3 * dpr;
  ctx.strokeStyle = isLight ? '#0284c7' : '#2dd4bf';
  ctx.stroke();

  ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
  ctx.font = `bold ${Math.round(13 * dpr)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${D_round}" Round`, leftCenterX, centerY + (4 * dpr));

  // Right Section: Rectangular Duct
  const rightCenterX = W * 0.75;
  const rectW = X * scale;
  const rectH = Y * scale;
  const rectX = rightCenterX - rectW / 2;
  const rectY = centerY - rectH / 2;

  ctx.beginPath();
  ctx.rect(rectX, rectY, rectW, rectH);
  ctx.fillStyle = isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(245, 158, 11, 0.25)';
  ctx.fill();
  ctx.lineWidth = 3 * dpr;
  ctx.strokeStyle = isLight ? '#d97706' : '#fbbf24';
  ctx.stroke();

  ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
  ctx.font = `bold ${Math.round(13 * dpr)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${X}" x ${Y}"`, rightCenterX, centerY + (4 * dpr));

  // Section Headers
  ctx.fillStyle = isLight ? '#334155' : '#f1f5f9';
  ctx.font = `bold ${Math.round(11 * dpr)}px Inter, sans-serif`;
  ctx.fillText('ROUND DUCT', leftCenterX, (25 * dpr));
  ctx.fillText('RECTANGULAR DUCT', rightCenterX, (25 * dpr));
}

// Local draft preservation for Tool 4 Reverse Engine
function saveTool4ReverseDraft() {
  try {
    const revState = {
      activeTab: activeTool4Tab,
      mode: revDuctMode,
      friction: revDuctFriction,
      velocity: revDuctVelocity,
      roundD: revDuctRoundD,
      x: revDuctX,
      y: revDuctY
    };
    localStorage.setItem('ps_tool4_reverse_draft', JSON.stringify(revState));
  } catch (e) {}
}

function loadTool4ReverseDraft() {
  try {
    const rawSession = localStorage.getItem('mech_suite_active_draft_v446');
    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session && session.tool4 && (session.tool4.revDuctRoundD !== undefined || session.tool4.activeTool4Tab !== undefined)) {
        return; // Active session governs
      }
    }
    const raw = localStorage.getItem('ps_tool4_reverse_draft');
    if (!raw) return;
    const revState = JSON.parse(raw);
    if (revState.mode && typeof setRevDuctMode === 'function') {
      setRevDuctMode(revState.mode);
    }
    if (revState.friction) onRevDuctFrictionInput('program', revState.friction);
    if (revState.velocity) onRevDuctVelocityInput('program', revState.velocity);
    if (revState.roundD) {
      revDuctRoundD = revState.roundD;
      const s = document.getElementById('revDuctSliderRound');
      const i = document.getElementById('revDuctInputRound');
      const d = document.getElementById('revDuctDisplayRound');
      if (s) s.value = revState.roundD;
      if (i) i.value = revState.roundD;
      if (d) d.innerText = revState.roundD + '"';
    }
    if (revState.x) {
      revDuctX = revState.x;
      const s = document.getElementById('revDuctSliderX');
      const i = document.getElementById('revDuctInputX');
      const d = document.getElementById('revDuctDisplayX');
      if (s) s.value = revState.x;
      if (i) i.value = revState.x;
      if (d) d.innerText = revState.x + '"';
    }
    if (revState.y) {
      revDuctY = revState.y;
      const s = document.getElementById('revDuctSliderY');
      const i = document.getElementById('revDuctInputY');
      const d = document.getElementById('revDuctDisplayY');
      if (s) s.value = revState.y;
      if (i) i.value = revState.y;
      if (d) d.innerText = revState.y + '"';
    }
    calculateReverseDuctulator('program');
    if (revState.activeTab && revState.activeTab !== activeTool4Tab) {
      switchTool4Tab(revState.activeTab);
    }
  } catch (e) {}
}

function savePlenumLimitDraft() {
  try {
    localStorage.setItem('ps_duct_plenum_limit', JSON.stringify({
      isLocked: isPlenumLimitLocked,
      limitY: plenumLimitY
    }));
  } catch (e) {}
}

function loadPlenumLimitDraft() {
  try {
    const rawSession = localStorage.getItem('mech_suite_active_draft_v446');
    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session && session.tool4 && session.tool4.isPlenumLimitLocked !== undefined) {
        return; // Active session governs
      }
    }
    const raw = localStorage.getItem('ps_duct_plenum_limit');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.limitY === 'number') {
      onPlenumLimitInput(parsed.limitY);
    }
    if (typeof parsed.isLocked === 'boolean' && parsed.isLocked) {
      isPlenumLimitLocked = true;
      updatePlenumLimitUI();
      calculateDuctulator('limit_restore');
    }
  } catch (e) {}
}

// Auto-load reverse subtool and plenum limit state on boot
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    loadPlenumLimitDraft();
    loadTool4ReverseDraft();
  }, 30);
});