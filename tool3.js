// TOOL 3 ENGINE (STORM DRAINAGE & MANNING)
    // ===================================================================
    const IPC_DATA = [
      { size: 2, vert: 34, s1_16: 15, s1_8: 22, s1_4: 31, s1_2: 44 },
      { size: 3, vert: 87, s1_16: 39, s1_8: 55, s1_4: 79, s1_2: 111 },
      { size: 4, vert: 180, s1_16: 81, s1_8: 115, s1_4: 163, s1_2: 231 },
      { size: 5, vert: 311, s1_16: 117, s1_8: 165, s1_4: 234, s1_2: 331 },
      { size: 6, vert: 538, s1_16: 243, s1_8: 344, s1_4: 487, s1_2: 689 },
      { size: 8, vert: 1117, s1_16: 505, s1_8: 714, s1_4: 1010, s1_2: 1429 },
      { size: 10, vert: 2050, s1_16: 927, s1_8: 1311, s1_4: 1855, s1_2: 2623 },
      { size: 12, vert: 3272, s1_16: 1480, s1_8: 2093, s1_4: 2960, s1_2: 4187 },
      { size: 15, vert: 5543, s1_16: 2508, s1_8: 3546, s1_4: 5016, s1_2: 7093 },
      { size: 18, vert: 9014, s1_16: 4078, s1_8: 5766, s1_4: 8157, s1_2: 11534 },
      { size: 20, vert: 11938, s1_16: 5401, s1_8: 7637, s1_4: 10803, s1_2: 15276 },
      { size: 24, vert: 19412, s1_16: 8783, s1_8: 12418, s1_4: 17566, s1_2: 24840 }
    ];

    var scheduleRows = [
      { id: 'Zone A - Drain 1', roofArea: 5000, wallArea: 0 },
      { id: 'Zone B - Drain 2', roofArea: 5000, wallArea: 0 }
    ];

    let userOverrodeHydPipeQS = false;
    let isHydFlowOverriddenQS = false;
    let userOverrodeHydPipeSched = false;
    let isHydFlowOverriddenSched = false;

    function onHydFlowUserInput(ctx, val) {
      if (ctx === 'QS') { isHydFlowOverriddenQS = true; document.getElementById('hydFlowOverrideToggleQS').checked = true; updateHydFlowOverrideUI('QS'); drawHydraulicCanvas('QS'); }
      else { isHydFlowOverriddenSched = true; document.getElementById('hydFlowOverrideToggleSched').checked = true; updateHydFlowOverrideUI('Sched'); drawHydraulicCanvas('Sched'); }
    }

    function toggleHydFlowOverride(ctx, checked) {
      if (ctx === 'QS') { isHydFlowOverriddenQS = checked; if (!checked) calculateQuickSize(); updateHydFlowOverrideUI('QS'); drawHydraulicCanvas('QS'); }
      else { isHydFlowOverriddenSched = checked; if (!checked) updateScheduleCalculations(); updateHydFlowOverrideUI('Sched'); drawHydraulicCanvas('Sched'); }
    }

    function updateHydFlowOverrideUI(ctx) {
      const isOverridden = ctx === 'QS' ? isHydFlowOverriddenQS : isHydFlowOverriddenSched;
      const badge = document.getElementById('hydFlowBadge' + ctx);
      const asterisk = document.getElementById('hydFlowOverrideAsterisk' + ctx);
      if (isOverridden) {
        if (badge) { badge.innerText = 'Overridden *'; badge.className = 'absolute right-2 top-2 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 pointer-events-none'; }
        if (asterisk) asterisk.classList.remove('hidden');
      } else {
        if (badge) { badge.innerText = 'Synced'; badge.className = 'absolute right-2 top-2 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 pointer-events-none'; }
        if (asterisk) asterisk.classList.add('hidden');
      }
    }

    function switchStormSubTab(tab) {
      ['quickSizer', 'networkBuilder', 'codeTables'].forEach(t => {
        const view = document.getElementById(t + 'View');
        const tabBtn = document.getElementById('tab-' + t);
        if (view) view.classList.toggle('hidden', t !== tab);
        if (tabBtn) {
          if (t === tab) {
            tabBtn.className = 'px-4 py-2.5 rounded-xl font-bold transition-all shadow-md bg-sky-600 text-white flex items-center gap-2 active-tab';
          } else {
            tabBtn.className = 'px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all flex items-center gap-2';
          }
        }
      });
      if (tab === 'quickSizer') setTimeout(() => drawHydraulicCanvas('QS'), 50);
      if (tab === 'networkBuilder') setTimeout(() => drawHydraulicCanvas('Sched'), 50);
    }

    function syncSlope(val) {
      ['qsPipeSlope', 'schedSlope', 'hydSlope'].forEach(id => { const el = document.getElementById(id); if (el) el.value = val; });
      calculateQuickSize(); updateScheduleCalculations(); drawHydraulicCanvas('QS'); drawHydraulicCanvas('Sched');
    }

    function syncStormMaterial(val) {
      ['qsPipeMaterial', 'schedMaterial'].forEach(id => { const el = document.getElementById(id); if (el) el.value = val; });
      calculateQuickSize(); updateScheduleCalculations(); drawHydraulicCanvas('QS'); drawHydraulicCanvas('Sched');
    }

    function handleCityChange() {
      const city = document.getElementById('citySelect')?.value;
      if (city) document.getElementById('rainfallRate').value = city;
      calculateQuickSize(); updateScheduleCalculations();
    }

    function slopeKey(s) { const val = parseFloat(s); return val === 0.0625 ? 's1_16' : (val === 0.25 ? 's1_4' : (val === 0.5 ? 's1_2' : 's1_8')); }
    function slopeLabel(slopeVal) {
      const s = parseFloat(slopeVal);
      if (s === 0.0625) return '1/16" per ft'; if (s === 0.25) return '1/4" per ft'; if (s === 0.5) return '1/2" per ft'; return '1/8" per ft';
    }

    function lookupPipeSize(typeKey, reqGPM, nFactor = 0.009) {
      const nVal = parseFloat(nFactor) || 0.009;
      const factor = 0.009 / nVal;
      for (let i = 0; i < IPC_DATA.length; i++) {
        const adjCap = IPC_DATA[i][typeKey] * factor;
        if (adjCap >= reqGPM) return IPC_DATA[i];
      }
      return null;
    }

    function calculateQuickSize() {
      const rain = parseFloat(document.getElementById('rainfallRate')?.value)||0;
      const area = parseFloat(document.getElementById('roofArea')?.value)||0;
      const slope = document.getElementById('qsPipeSlope')?.value || '0.125';
      const nMat = document.getElementById('qsPipeMaterial')?.value || '0.009';
      const numDrains = parseInt(document.getElementById('numDrains')?.value)||1;
      let wall = 0;
      document.querySelectorAll('.wall-area-input').forEach(i => wall += parseFloat(i.value)||0);

      const totalEff = area + (wall * 0.5);
      const totalGPM = totalEff * rain * 0.01039;

      const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
      setTxt('cardTotalArea', Math.round(totalEff).toLocaleString() + ' sq ft');
      setTxt('cardWallContribution', Math.round(wall * 0.5).toLocaleString() + ' sq ft');
      setTxt('cardFlowRate', Math.round(totalGPM).toLocaleString() + ' GPM');
      setTxt('cardCFS', (totalGPM * 0.002228).toFixed(2));
      setTxt('perDrainArea', Math.round(totalEff / numDrains).toLocaleString() + ' sq ft');
      setTxt('perDrainGPM', Math.round(totalGPM / numDrains).toLocaleString() + ' GPM');
      setTxt('calcTotalGPM', Math.round(totalGPM).toLocaleString() + ' GPM');

      const vertPipe = lookupPipeSize('vert', totalGPM / numDrains, nMat);
      const branchPipe = lookupPipeSize(slopeKey(slope), totalGPM / numDrains, nMat);
      const mainPipe = lookupPipeSize(slopeKey(slope), totalGPM, nMat);

      setTxt('cardHorizontalPipe', mainPipe ? `${mainPipe.size}" Pipe` : 'Over Capacity');
      setTxt('cardSlopeDisplay', slopeLabel(slope));
      setTxt('cardVerticalLeader', vertPipe ? `${vertPipe.size}" Pipe` : 'Over Capacity');
      setTxt('calcVerticalLeaderSize', vertPipe ? `${vertPipe.size}" Leader` : '> 24"');
      setTxt('calcBranchSize', branchPipe ? `${branchPipe.size}" Branch` : '> 24"');
      setTxt('calcHorizontalMainSize', mainPipe ? `${mainPipe.size}" Main` : '> 24"');
      setTxt('mainSlopeLabel', slopeLabel(slope));

      const hydFlowQS = document.getElementById('hydFlowRateQS');
      if (hydFlowQS && !isHydFlowOverriddenQS) { hydFlowQS.value = Math.round(totalGPM); updateHydFlowOverrideUI('QS'); }
      if (mainPipe) {
        const hydSelectQS = document.getElementById('hydPipeSizeQS');
        if (hydSelectQS && !userOverrodeHydPipeQS) hydSelectQS.value = mainPipe.size.toString();
      }

      renderSlopeComparisonTable(totalGPM, nMat);
      drawHydraulicCanvas('QS');
    }

    function renderSlopeComparisonTable(reqGPM, nMat = 0.009) {
      const tbody = document.getElementById('slopeComparisonTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      const slopes = [{ label: '1/8" per ft', key: 's1_8' }, { label: '1/4" per ft', key: 's1_4' }, { label: '1/2" per ft', key: 's1_2' }, { label: '1/16" per ft', key: 's1_16' }];
      const nVal = parseFloat(nMat) || 0.009;
      const factor = 0.009 / nVal;

      slopes.forEach(sl => {
        const pipe = lookupPipeSize(sl.key, reqGPM, nMat);
        const tr = document.createElement('tr');
        if (pipe) {
          const adjCap = Math.round(pipe[sl.key] * factor);
          const fill = ((reqGPM / adjCap) * 100).toFixed(1);
          tr.innerHTML = `<td class="p-2">${sl.label}</td><td class="p-2 text-sky-400 font-bold">${pipe.size}"</td><td class="p-2">${adjCap} GPM</td><td class="p-2">${fill}%</td>`;
        } else {
          tr.innerHTML = `<td class="p-2">${sl.label}</td><td class="p-2 text-rose-400">> 24"</td><td class="p-2">--</td><td class="p-2">--</td>`;
        }
        tbody.appendChild(tr);
      });
    }

    function addWallInput() {
      const div = document.createElement('div');
      div.className = 'flex gap-2 items-center wall-row';
      div.innerHTML = `<input type="text" placeholder="Wall Description" class="bg-slate-900 border border-slate-700 text-xs rounded p-1 text-white w-1/2"><input type="number" value="0" oninput="calculateQuickSize()" class="wall-area-input bg-slate-900 border border-slate-700 text-xs rounded p-1 text-white w-1/2 mono"><button onclick="removeWallRow(this)" class="text-slate-500 hover:text-rose-400"><i class="fa-solid fa-xmark"></i></button>`;
      document.getElementById('wallInputsContainer')?.appendChild(div);
      calculateQuickSize();
    }
    function removeWallRow(btn) { btn.closest('.wall-row')?.remove(); calculateQuickSize(); }

    function renderScheduleTable() {
      const tbody = document.getElementById('scheduleTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      scheduleRows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="p-2"><input type="text" value="${row.id}" onchange="scheduleRows[${idx}].id = this.value; updateScheduleCalculations()" class="bg-slate-950 border border-slate-700 text-xs rounded p-1 text-white w-full"></td>
          <td class="p-2"><input type="number" value="${row.roofArea}" oninput="scheduleRows[${idx}].roofArea = parseFloat(this.value)||0; updateScheduleCalculations()" class="bg-slate-950 border border-slate-700 text-xs rounded p-1 text-white w-20 mono"></td>
          <td class="p-2"><input type="number" value="${row.wallArea}" oninput="scheduleRows[${idx}].wallArea = parseFloat(this.value)||0; updateScheduleCalculations()" class="bg-slate-950 border border-slate-700 text-xs rounded p-1 text-white w-20 mono"></td>
          <td class="p-2 text-slate-300" id="schedEff_${idx}">0</td>
          <td class="p-2 text-cyan-400" id="schedGPM_${idx}">0 GPM</td>
          <td class="p-2 text-purple-300" id="schedVert_${idx}">--</td>
          <td class="p-2 text-emerald-400" id="schedBranch_${idx}">--</td>
          <td class="p-2 text-cyan-300 font-bold bg-cyan-950/30" id="schedCumulMain_${idx}">--</td>
          <td class="p-2 text-sky-500 font-bold bg-sky-950/30" id="schedFill_${idx}">--%</td>
          <td class="p-2 text-center"><button onclick="removeScheduleRow(${idx})" class="text-slate-500 hover:text-rose-400"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
      });
      updateScheduleCalculations();
    }

    function addScheduleRow() {
      const n = scheduleRows.length + 1;
      scheduleRows.push({ id: `Zone ${String.fromCharCode(64 + n)} - Drain ${n}`, roofArea: 5000, wallArea: 0 });
      renderScheduleTable();
    }
    function removeScheduleRow(idx) { scheduleRows.splice(idx, 1); renderScheduleTable(); }
    function clearSchedule() { scheduleRows = []; renderScheduleTable(); }

    function updateScheduleCalculations() {
      const rain = parseFloat(document.getElementById('schedRainfall')?.value)||3.4;
      const slope = document.getElementById('schedSlope')?.value||'0.125';
      const nMat = document.getElementById('schedMaterial')?.value||'0.009';
      let totRoof = 0, totWall = 0, totEff = 0, totGPM = 0, cumulGPM = 0;
      const nVal = parseFloat(nMat) || 0.009;
      const factor = 0.009 / nVal;

      scheduleRows.forEach((row, idx) => {
        const eff = row.roofArea + (row.wallArea * 0.5);
        const gpm = eff * rain * 0.01039;
        cumulGPM += gpm;
        totRoof += row.roofArea; totWall += row.wallArea; totEff += eff; totGPM += gpm;

        const vert = lookupPipeSize('vert', gpm, nMat);
        const branch = lookupPipeSize(slopeKey(slope), gpm, nMat);
        const cumulMain = lookupPipeSize(slopeKey(slope), cumulGPM, nMat);

        let fillRatioStr = '--';
        if (cumulMain) {
          const fullCap = cumulMain[slopeKey(slope)] * factor;
          fillRatioStr = ((cumulGPM / fullCap) * 100).toFixed(1) + '%';
        } else { fillRatioStr = '>100%'; }

        const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
        setTxt(`schedEff_${idx}`, Math.round(eff).toLocaleString());
        setTxt(`schedGPM_${idx}`, Math.round(gpm) + ' GPM');
        setTxt(`schedVert_${idx}`, vert ? `${vert.size}"` : '>24"');
        setTxt(`schedBranch_${idx}`, branch ? `${branch.size}"` : '>24"');
        setTxt(`schedCumulMain_${idx}`, cumulMain ? `${cumulMain.size}" Main` : '>24"');
        setTxt(`schedFill_${idx}`, fillRatioStr);
      });

      const vertPipe = lookupPipeSize('vert', totGPM, nMat);
      const mainPipe = lookupPipeSize(slopeKey(slope), totGPM, nMat);

      const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
      setTxt('schedTotalRoofArea', Math.round(totRoof).toLocaleString());
      setTxt('schedTotalWallArea', Math.round(totWall).toLocaleString());
      setTxt('schedTotalEffArea', Math.round(totEff).toLocaleString());
      setTxt('schedTotalGPM', Math.round(totGPM).toLocaleString() + ' GPM');
      setTxt('schedTotalVertLeader', vertPipe ? `${vertPipe.size}" Leader` : '>24"');
      setTxt('schedTotalHorizMain', mainPipe ? `${mainPipe.size}" Main` : '>24"');
      setTxt('schedTotalCumulMain', mainPipe ? `${mainPipe.size}" Main` : '>24"');

      let totalFillStr = '--';
      if (mainPipe) {
        const totalCap = mainPipe[slopeKey(slope)] * factor;
        totalFillStr = ((totGPM / totalCap) * 100).toFixed(1) + '%';
      }
      setTxt('schedTotalFill', totalFillStr);

      setTxt('schedCardCombinedMain', mainPipe ? `${mainPipe.size}" Main` : 'Over Capacity');
      if (mainPipe) {
        const cap = Math.round(mainPipe[slopeKey(slope)] * factor);
        const util = ((totGPM / cap) * 100).toFixed(1);
        setTxt('schedCardMainCap', `Capacity: ${cap} GPM (${util}% util)`);
      } else { setTxt('schedCardMainCap', 'Capacity: -- GPM'); }

      setTxt('schedCardTotalGPM', Math.round(totGPM).toLocaleString() + ' GPM');
      setTxt('schedCardTotalCFS', (totGPM * 0.002228).toFixed(2) + ' CFS');
      setTxt('schedCardTotalArea', Math.round(totEff).toLocaleString() + ' sq ft');
      setTxt('schedCardZoneCount', scheduleRows.length + ' active roof zones');
      setTxt('schedCardCombinedLeader', vertPipe ? `${vertPipe.size}" Leader` : 'Over Capacity');
      if (vertPipe) {
        setTxt('schedCardLeaderCap', `IPC Stack Rating: ${Math.round(vertPipe.vert * factor)} GPM`);
      } else { setTxt('schedCardLeaderCap', 'IPC Stack Rating: -- GPM'); }

      const hydFlowSched = document.getElementById('hydFlowRateSched');
      if (hydFlowSched && !isHydFlowOverriddenSched) { hydFlowSched.value = Math.round(totGPM); updateHydFlowOverrideUI('Sched'); }
      if (mainPipe) {
        const hydSelectSched = document.getElementById('hydPipeSizeSched');
        if (hydSelectSched && !userOverrodeHydPipeSched) hydSelectSched.value = mainPipe.size.toString();
      }
      drawHydraulicCanvas('Sched');
    }

    function escapeCsvField(val) {
      if (val === null || val === undefined) return '""';
      return '"' + String(val).replace(/"/g, '""') + '"';
    }

    function exportScheduleCSV() {
      let csv = "Zone ID,Roof Area (sq ft),Wall Area (sq ft),Effective Area (sq ft),Flow (GPM),Vertical Leader,Branch Size,Cumul Main,Fill Ratio (%)\n";
      const rainfall = parseFloat(document.getElementById('schedRainfall')?.value) || 3.4;
      const slope = document.getElementById('schedSlope')?.value || '0.125';
      const nMat = document.getElementById('schedMaterial')?.value || '0.009';
      let cumul = 0;
      const nVal = parseFloat(nMat) || 0.009;
      const factor = 0.009 / nVal;

      scheduleRows.forEach(row => {
        const eff = row.roofArea + (row.wallArea * 0.5);
        const gpm = eff * rainfall * 0.01039;
        cumul += gpm;
        const vert = lookupPipeSize('vert', gpm, nMat);
        const branch = lookupPipeSize(slopeKey(slope), gpm, nMat);
        const main = lookupPipeSize(slopeKey(slope), cumul, nMat);
        let fillStr = '--';
        if (main) { fillStr = ((cumul / (main[slopeKey(slope)] * factor)) * 100).toFixed(1) + '%'; }
        csv += `${escapeCsvField(row.id)},${row.roofArea},${row.wallArea},${Math.round(eff)},${gpm.toFixed(1)},${escapeCsvField(vert?vert.size+'"':'>24"')},${escapeCsvField(branch?branch.size+'"':'>24"')},${escapeCsvField(main?main.size+'"':'>24"')},${fillStr}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url); a.setAttribute('download', 'Storm_Drain_Schedule.csv'); a.click();
    }

    function drawHydraulicCanvas(ctxId) {
      const canvas = document.getElementById('hydraulicCanvas' + ctxId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const nominalDiaInches = parseFloat(document.getElementById('hydPipeSize' + ctxId)?.value) || 8;
      const pipeSlope = parseFloat(document.getElementById('qsPipeSlope')?.value) || 0.125;
      const flowGPM = parseFloat(document.getElementById('hydFlowRate' + ctxId)?.value) || 509;
      const nMatEl = ctxId === 'QS' ? document.getElementById('qsPipeMaterial') : document.getElementById('schedMaterial');
      const n = nMatEl ? (parseFloat(nMatEl.value) || 0.009) : 0.009;

      const D_ft = nominalDiaInches / 12, S = pipeSlope / 12, Q_cfs = flowGPM * 0.002228;
      const A_full = (Math.PI * Math.pow(D_ft, 2)) / 4, P_full = Math.PI * D_ft, R_full = A_full / P_full;
      const Q_full_cfs = (1.486 / n) * A_full * Math.pow(R_full, 2/3) * Math.sqrt(S);

      let ratio = (Q_full_cfs > 0 && Q_cfs > 0) ? Q_cfs / Q_full_cfs : 0;
      if (ratio > 1.0) ratio = 1.0;
      const depthRatio = (flowGPM > 0 && ratio > 0) ? Math.min(1.0, Math.max(0.02, Math.pow(ratio, 0.625))) : 0.0;
      const V_full = (A_full > 0) ? Q_full_cfs / A_full : 0;
      const V_actual = (depthRatio > 0) ? V_full * Math.pow(depthRatio, 0.67) : 0.0;

      const ipcPipeForSize = IPC_DATA.find(p => p.size === nominalDiaInches);
      const baseIPCCap = ipcPipeForSize ? ipcPipeForSize[slopeKey(pipeSlope)] : 714;
      const factor = 0.009 / n;
      const ipcCapGPM = Math.round(baseIPCCap * factor);
      const codeUtilPct = ipcCapGPM > 0 ? (flowGPM / ipcCapGPM) * 100 : 0;

      const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
      setTxt('metricVelocity' + ctxId, V_actual.toFixed(2) + ' ft/s');
      setTxt('metricDepthRatio' + ctxId, (depthRatio * 100).toFixed(1) + '%');
      setTxt('metricCodeUtil' + ctxId, codeUtilPct.toFixed(1) + '%');
      setTxt('metricIPCCap' + ctxId, ipcCapGPM + ' GPM');

      const badge = document.getElementById('hydraulicsStatusBadge' + ctxId);
      if (badge) {
        if (ratio >= 1.0 || codeUtilPct > 100) { badge.innerText = 'Surcharged / Over Capacity'; badge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-500 font-medium'; }
        else if (depthRatio > 0.8 || codeUtilPct > 80) { badge.innerText = 'High Flow Level (>80%)'; badge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium'; }
        else { badge.innerText = 'Optimal Open Channel Flow'; badge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-medium'; }
      }

      const centerX = W / 2, centerY = H / 2, radius = Math.min(W, H) * 0.38;
      const isLight = document.documentElement.classList.contains('light');

      ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#f1f5f9' : '#090d16'; ctx.fill();
      ctx.lineWidth = 6 * dpr; ctx.strokeStyle = isLight ? '#94a3b8' : '#334155'; ctx.stroke();

      const waterHeight = radius * 2 * depthRatio, waterTopY = (centerY + radius) - waterHeight;
      if (waterHeight > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(centerX, centerY, radius - (3 * dpr), 0, Math.PI * 2); ctx.clip();
        const grad = ctx.createLinearGradient(0, waterTopY, 0, centerY + radius);
        grad.addColorStop(0, '#0284c7'); grad.addColorStop(1, '#0369a1');
        ctx.fillStyle = grad; ctx.fillRect(centerX - radius, waterTopY, radius * 2, waterHeight);
        ctx.beginPath(); ctx.moveTo(centerX - radius, waterTopY); ctx.lineTo(centerX + radius, waterTopY);
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3 * dpr; ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
      ctx.font = `bold ${Math.round(13 * dpr)}px Inter, sans-serif`;
      ctx.textAlign = 'center'; ctx.fillText(`${nominalDiaInches}" ID Pipe`, centerX, centerY - radius - (10 * dpr));
    }

    function populateIPCTable() {
      const tbody = document.getElementById('ipcTableBody');
      if (!tbody) return; tbody.innerHTML = '';
      IPC_DATA.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="p-3 font-bold text-sky-400">${row.size}" Nominal</td><td class="p-3 text-purple-300">${row.vert} GPM</td><td class="p-3 text-slate-300">${row.s1_16} GPM</td><td class="p-3 text-sky-500">${row.s1_8} GPM</td><td class="p-3 text-emerald-600">${row.s1_4} GPM</td><td class="p-3 text-amber-300">${row.s1_2} GPM</td>`;
        tbody.appendChild(tr);
      });
    }

    // ===================================================================
    