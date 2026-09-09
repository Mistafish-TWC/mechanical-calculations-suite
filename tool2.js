// TOOL 2 ENGINE (PUMPING ECONOMICS & MATRIX UP TO 24")
    // ===================================================================
    const tool2Database = {
      schedules: {
        "Schedule 10": [
          { nominal: "1/2\"", d: 0.674 }, { nominal: "3/4\"", d: 0.884 }, { nominal: "1\"", d: 1.097 }, { nominal: "1-1/4\"", d: 1.442 }, { nominal: "1-1/2\"", d: 1.682 }, 
          { nominal: "2\"", d: 2.157 }, { nominal: "2-1/2\"", d: 2.635 }, { nominal: "3\"", d: 3.260 }, { nominal: "4\"", d: 4.260 }, { nominal: "5\"", d: 5.295 }, { nominal: "6\"", d: 6.357 }, 
          { nominal: "8\"", d: 8.329 }, { nominal: "10\"", d: 10.420 }, { nominal: "12\"", d: 12.390 }, { nominal: "14\"", d: 13.500 }, { nominal: "16\"", d: 15.500 }, 
          { nominal: "18\"", d: 17.500 }, { nominal: "20\"", d: 19.500 }, { nominal: "24\"", d: 23.500 }
        ],
        "Schedule 40": [
          { nominal: "1/2\"", d: 0.622 }, { nominal: "3/4\"", d: 0.824 }, { nominal: "1\"", d: 1.049 }, { nominal: "1-1/4\"", d: 1.380 }, { nominal: "1-1/2\"", d: 1.610 }, 
          { nominal: "2\"", d: 2.067 }, { nominal: "2-1/2\"", d: 2.469 }, { nominal: "3\"", d: 3.068 }, { nominal: "4\"", d: 4.026 }, { nominal: "5\"", d: 5.047 }, { nominal: "6\"", d: 6.065 }, 
          { nominal: "8\"", d: 7.981 }, { nominal: "10\"", d: 10.020 }, { nominal: "12\"", d: 11.938 }, { nominal: "14\"", d: 13.126 }, { nominal: "16\"", d: 15.000 }, 
          { nominal: "18\"", d: 16.876 }, { nominal: "20\"", d: 18.812 }, { nominal: "24\"", d: 22.624 }
        ],
        "Schedule 80": [
          { nominal: "1/2\"", d: 0.546 }, { nominal: "3/4\"", d: 0.742 }, { nominal: "1\"", d: 0.957 }, { nominal: "1-1/4\"", d: 1.278 }, { nominal: "1-1/2\"", d: 1.500 }, 
          { nominal: "2\"", d: 1.939 }, { nominal: "2-1/2\"", d: 2.323 }, { nominal: "3\"", d: 2.900 }, { nominal: "4\"", d: 3.826 }, { nominal: "5\"", d: 4.813 }, { nominal: "6\"", d: 5.761 }, 
          { nominal: "8\"", d: 7.625 }, { nominal: "10\"", d: 9.564 }, { nominal: "12\"", d: 11.376 }, { nominal: "14\"", d: 12.500 }, { nominal: "16\"", d: 14.312 }, 
          { nominal: "18\"", d: 16.124 }, { nominal: "20\"", d: 17.938 }, { nominal: "24\"", d: 21.564 }
        ],
        "Schedule 160": [
          { nominal: "1/2\"", d: 0.466 }, { nominal: "3/4\"", d: 0.614 }, { nominal: "1\"", d: 0.815 }, { nominal: "1-1/4\"", d: 1.160 }, { nominal: "1-1/2\"", d: 1.338 }, 
          { nominal: "2\"", d: 1.689 }, { nominal: "2-1/2\"", d: 2.125 }, { nominal: "3\"", d: 2.626 }, { nominal: "4\"", d: 3.438 }, { nominal: "5\"", d: 4.313 }, { nominal: "6\"", d: 5.189 }, 
          { nominal: "8\"", d: 6.813 }, { nominal: "10\"", d: 8.500 }, { nominal: "12\"", d: 10.126 }, { nominal: "14\"", d: 11.188 }, { nominal: "16\"", d: 12.814 }, 
          { nominal: "18\"", d: 14.438 }, { nominal: "20\"", d: 16.062 }, { nominal: "24\"", d: 23.500 }
        ],
        "Schedule 5S": [
          { nominal: "1/2\"", d: 0.710 }, { nominal: "3/4\"", d: 0.920 }, { nominal: "1\"", d: 1.185 }, { nominal: "1-1/4\"", d: 1.530 }, { nominal: "1-1/2\"", d: 1.770 }, 
          { nominal: "2\"", d: 2.245 }, { nominal: "2-1/2\"", d: 2.709 }, { nominal: "3\"", d: 3.334 }, { nominal: "4\"", d: 4.334 }, { nominal: "5\"", d: 5.345 }, { nominal: "6\"", d: 6.407 }, 
          { nominal: "8\"", d: 8.407 }, { nominal: "10\"", d: 10.500 }, { nominal: "12\"", d: 12.500 }, { nominal: "16\"", d: 15.500 }, { nominal: "24\"", d: 23.500 }
        ],
        "Schedule 10S": [
          { nominal: "1/2\"", d: 0.674 }, { nominal: "3/4\"", d: 0.884 }, { nominal: "1\"", d: 1.097 }, { nominal: "1-1/4\"", d: 1.442 }, { nominal: "1-1/2\"", d: 1.682 }, 
          { nominal: "2\"", d: 2.157 }, { nominal: "2-1/2\"", d: 2.635 }, { nominal: "3\"", d: 3.260 }, { nominal: "4\"", d: 4.260 }, { nominal: "5\"", d: 5.295 }, { nominal: "6\"", d: 6.357 }, 
          { nominal: "8\"", d: 8.329 }, { nominal: "10\"", d: 10.420 }, { nominal: "12\"", d: 12.390 }, { nominal: "16\"", d: 15.500 }, { nominal: "24\"", d: 23.500 }
        ],
        "Schedule 40S": [
          { nominal: "1/2\"", d: 0.622 }, { nominal: "3/4\"", d: 0.824 }, { nominal: "1\"", d: 1.049 }, { nominal: "1-1/4\"", d: 1.380 }, { nominal: "1-1/2\"", d: 1.610 }, 
          { nominal: "2\"", d: 2.067 }, { nominal: "2-1/2\"", d: 2.469 }, { nominal: "3\"", d: 3.068 }, { nominal: "4\"", d: 4.026 }, { nominal: "5\"", d: 5.047 }, { nominal: "6\"", d: 6.065 }, 
          { nominal: "8\"", d: 7.981 }, { nominal: "10\"", d: 10.020 }, { nominal: "12\"", d: 11.938 }, { nominal: "16\"", d: 15.000 }, { nominal: "24\"", d: 22.624 }
        ],
        "Schedule 80S": [
          { nominal: "1/2\"", d: 0.546 }, { nominal: "3/4\"", d: 0.742 }, { nominal: "1\"", d: 0.957 }, { nominal: "1-1/4\"", d: 1.278 }, { nominal: "1-1/2\"", d: 1.500 }, 
          { nominal: "2\"", d: 1.939 }, { nominal: "2-1/2\"", d: 2.323 }, { nominal: "3\"", d: 2.900 }, { nominal: "4\"", d: 3.826 }, { nominal: "5\"", d: 4.813 }, { nominal: "6\"", d: 5.761 }, 
          { nominal: "8\"", d: 7.625 }, { nominal: "10\"", d: 9.564 }, { nominal: "12\"", d: 11.376 }, { nominal: "16\"", d: 14.312 }, { nominal: "24\"", d: 21.564 }
        ],
        "Type K": [
          { nominal: "1/2\"", d: 0.527 }, { nominal: "3/4\"", d: 0.745 }, { nominal: "1\"", d: 0.995 }, { nominal: "1-1/4\"", d: 1.245 }, { nominal: "1-1/2\"", d: 1.481 }, 
          { nominal: "2\"", d: 1.959 }, { nominal: "2-1/2\"", d: 2.435 }, { nominal: "3\"", d: 2.907 }, { nominal: "4\"", d: 3.857 }, { nominal: "5\"", d: 4.805 }, { nominal: "6\"", d: 5.741 }, 
          { nominal: "8\"", d: 7.583 }, { nominal: "10\"", d: 9.449 }, { nominal: "12\"", d: 11.315 }
        ],
        "Type L": [
          { nominal: "1/2\"", d: 0.545 }, { nominal: "3/4\"", d: 0.785 }, { nominal: "1\"", d: 1.025 }, { nominal: "1-1/4\"", d: 1.265 }, { nominal: "1-1/2\"", d: 1.505 }, 
          { nominal: "2\"", d: 1.985 }, { nominal: "2-1/2\"", d: 2.465 }, { nominal: "3\"", d: 2.945 }, { nominal: "4\"", d: 3.905 }, { nominal: "5\"", d: 4.875 }, { nominal: "6\"", d: 5.845 }, 
          { nominal: "8\"", d: 7.725 }, { nominal: "10\"", d: 9.625 }, { nominal: "12\"", d: 11.565 }
        ],
        "Type M": [
          { nominal: "1/2\"", d: 0.569 }, { nominal: "3/4\"", d: 0.811 }, { nominal: "1\"", d: 1.055 }, { nominal: "1-1/4\"", d: 1.291 }, { nominal: "1-1/2\"", d: 1.527 }, 
          { nominal: "2\"", d: 2.009 }, { nominal: "2-1/2\"", d: 2.495 }, { nominal: "3\"", d: 2.981 }, { nominal: "4\"", d: 3.935 }, { nominal: "5\"", d: 4.915 }, { nominal: "6\"", d: 5.881 }, 
          { nominal: "8\"", d: 7.785 }, { nominal: "10\"", d: 9.701 }, { nominal: "12\"", d: 11.617 }
        ],
        "SDR 9": [
          { nominal: "1/2\"", d: 0.653 }, { nominal: "3/4\"", d: 0.817 }, { nominal: "1\"", d: 1.023 }, { nominal: "1-1/4\"", d: 1.291 }, { nominal: "1-1/2\"", d: 1.478 }, 
          { nominal: "2\"", d: 1.847 }, { nominal: "2-1/2\"", d: 2.236 }, { nominal: "3\"", d: 2.722 }, { nominal: "4\"", d: 3.500 }, { nominal: "5\"", d: 4.327 }, { nominal: "6\"", d: 5.153 }, 
          { nominal: "8\"", d: 6.708 }, { nominal: "10\"", d: 8.361 }, { nominal: "12\"", d: 9.917 }, { nominal: "16\"", d: 12.444 }, { nominal: "20\"", d: 15.556 }, { nominal: "24\"", d: 18.667 }
        ],
        "SDR 11": [
          { nominal: "1/2\"", d: 0.687 }, { nominal: "3/4\"", d: 0.859 }, { nominal: "1\"", d: 1.076 }, { nominal: "1-1/4\"", d: 1.358 }, { nominal: "1-1/2\"", d: 1.555 }, 
          { nominal: "2\"", d: 1.943 }, { nominal: "2-1/2\"", d: 2.352 }, { nominal: "3\"", d: 2.864 }, { nominal: "4\"", d: 3.682 }, { nominal: "5\"", d: 4.552 }, { nominal: "6\"", d: 5.420 }, 
          { nominal: "8\"", d: 7.057 }, { nominal: "10\"", d: 8.795 }, { nominal: "12\"", d: 10.432 }, { nominal: "16\"", d: 13.091 }, { nominal: "20\"", d: 16.364 }, { nominal: "24\"", d: 19.636 }
        ],
        "SDR 17": [
          { nominal: "1/2\"", d: 0.741 }, { nominal: "3/4\"", d: 0.926 }, { nominal: "1\"", d: 1.160 }, { nominal: "1-1/4\"", d: 1.465 }, { nominal: "1-1/2\"", d: 1.676 }, 
          { nominal: "2\"", d: 2.096 }, { nominal: "2-1/2\"", d: 2.537 }, { nominal: "3\"", d: 3.088 }, { nominal: "4\"", d: 3.971 }, { nominal: "5\"", d: 4.909 }, { nominal: "6\"", d: 5.846 }, 
          { nominal: "8\"", d: 7.610 }, { nominal: "10\"", d: 9.485 }, { nominal: "12\"", d: 11.250 }, { nominal: "16\"", d: 14.118 }, { nominal: "20\"", d: 17.647 }, { nominal: "24\"", d: 21.176 }
        ],
        "SDR 7.4": [
          { nominal: "1/2\"", d: 0.613 }, { nominal: "3/4\"", d: 0.766 }, { nominal: "1\"", d: 0.959 }, { nominal: "1-1/4\"", d: 1.211 }, { nominal: "1-1/2\"", d: 1.386 }, 
          { nominal: "2\"", d: 1.733 }, { nominal: "2-1/2\"", d: 2.098 }, { nominal: "3\"", d: 2.554 }, { nominal: "4\"", d: 3.284 }, { nominal: "5\"", d: 4.059 }, { nominal: "6\"", d: 4.834 }, 
          { nominal: "8\"", d: 6.294 }, { nominal: "10\"", d: 7.845 }, { nominal: "12\"", d: 9.304 }, { nominal: "16\"", d: 11.676 }, { nominal: "20\"", d: 14.595 }, { nominal: "24\"", d: 23.514 }
        ],
        "CTS SDR 9": [
          { nominal: "1/2\"", d: 0.475 }, { nominal: "3/4\"", d: 0.671 }, { nominal: "1\"", d: 0.862 }, { nominal: "1-1/4\"", d: 1.054 }, { nominal: "1-1/2\"", d: 1.244 }, { nominal: "2\"", d: 1.629 }
        ],
        "Class 52": [
          { nominal: "3\"", d: 3.335 }, { nominal: "4\"", d: 4.095 }, { nominal: "6\"", d: 6.155 }, { nominal: "8\"", d: 8.205 }, { nominal: "10\"", d: 10.215 }, 
          { nominal: "12\"", d: 12.275 }, { nominal: "14\"", d: 14.332 }, { nominal: "16\"", d: 16.412 }, { nominal: "18\"", d: 18.492 }, { nominal: "20\"", d: 20.572 }, { nominal: "24\"", d: 24.632 }
        ]
      }
    };

    const tool2MaterialOptions = {
      carbon_steel: ["Schedule 10", "Schedule 40", "Schedule 80", "Schedule 160"],
      stainless_steel: ["Schedule 5S", "Schedule 10S", "Schedule 40S", "Schedule 80S"],
      copper: ["Type L", "Type K", "Type M"],
      pvc: ["Schedule 40", "Schedule 80"],
      cpvc: ["Schedule 40", "Schedule 80"],
      hdpe: ["SDR 9", "SDR 11", "SDR 17"],
      polypropylene: ["SDR 7.4", "SDR 9", "SDR 11"],
      pex: ["CTS SDR 9"],
      cast_iron: ["Class 52"]
    };

    const tool2DefaultRoughness = { carbon_steel: "140", stainless_steel: "140", copper: "140", pvc: "150", cpvc: "150", hdpe: "150", polypropylene: "150", pex: "150", cast_iron: "120" };
    const tool2PlasticMaterials = ['pvc', 'cpvc', 'hdpe', 'polypropylene', 'pex'];

    function populateSchedules(material) {
      const schedSelect = document.getElementById('pipeSchedule');
      if (!schedSelect) return;
      schedSelect.innerHTML = '';
      const options = tool2MaterialOptions[material] || tool2MaterialOptions.carbon_steel;
      options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt; el.innerText = opt;
        schedSelect.appendChild(el);
      });
      if (options.includes("Schedule 40")) schedSelect.value = "Schedule 40";
      else if (options.includes("Type L")) schedSelect.value = "Type L";
      else if (options.includes("SDR 11")) schedSelect.value = "SDR 11";
      else if (options.includes("CTS SDR 9")) schedSelect.value = "CTS SDR 9";
      else if (options.includes("Class 52")) schedSelect.value = "Class 52";
      else if (options.length > 0) schedSelect.value = options[0];

      const label = document.getElementById('scheduleLabel');
      if (label) {
        if (material === "copper") label.innerText = "Copper Tubing Type";
        else if (['hdpe', 'polypropylene', 'pex'].includes(material)) label.innerText = "Standard Dimension Ratio (SDR)";
        else if (material === "cast_iron") label.innerText = "Ductile Iron Class";
        else label.innerText = "Schedule / Rating";
      }
    }

    function updateRoughnessOptions() {
      const material = document.getElementById('pipeMaterial')?.value || 'carbon_steel';
      const opt150 = document.getElementById('optC150');
      const roughnessSelect = document.getElementById('pipeRoughness');
      const isPlastic = tool2PlasticMaterials.includes(material);
      if (opt150) { opt150.disabled = !isPlastic; opt150.style.display = isPlastic ? '' : 'none'; }
      if (!isPlastic && roughnessSelect && roughnessSelect.value === "150") roughnessSelect.value = tool2DefaultRoughness[material] || "140";
    }

    function handleMaterialChange() {
      const material = document.getElementById('pipeMaterial')?.value || 'carbon_steel';
      populateSchedules(material);
      updateRoughnessOptions();
      const rSelect = document.getElementById('pipeRoughness');
      if (rSelect) rSelect.value = tool2DefaultRoughness[material] || "140";
      calculateSizingMatrix();
    }

    function handleFluidChange() {
      const fluid = document.getElementById('fluidType')?.value || 'water';
      const tempSlider = document.getElementById('temperature');
      const glycolGroup = document.getElementById('glycolGroup');
      if (glycolGroup) {
        if (fluid === 'water') {
          glycolGroup.style.display = 'none';
          if (tempSlider) { tempSlider.min = "40"; if (parseInt(tempSlider.value) < 40) tempSlider.value = "40"; }
        } else {
          glycolGroup.style.display = 'block';
          if (tempSlider) tempSlider.min = "20";
        }
      }
      updateTemperatureLabel();
      calculateSizingMatrix();
    }

    function updateTemperatureLabel() { const el = document.getElementById('tempValue'); if (el) el.innerText = document.getElementById('temperature')?.value || '60'; }
    function updateGlycolLabel() { const el = document.getElementById('glycolValue'); if (el) el.innerText = (document.getElementById('glycolPct')?.value || '30') + "%"; }
    function updateFittingLabel() { const el = document.getElementById('fittingValue'); if (el) el.innerText = (document.getElementById('fittingAllowance')?.value || '50') + "%"; }

    function getFluidProperties(tempF, glycolPct, fluidType) {
      const T = parseFloat(tempF), W = parseFloat(glycolPct) / 100.0;
      if (fluidType === 'water') {
        const density = 62.427 * (1 - (Math.pow(T - 39.8, 2) * (T + 283)) / (508929.2 * (T + 68.1)));
        const sg = density / 62.371;
        const tempC = (T - 32) * 5 / 9;
        const visc = 1.002 * Math.exp((1.1709 * (20 - tempC) - 0.001827 * Math.pow(20 - tempC, 2)) / (tempC + 96));
        return { sg, viscosityCP: visc };
      } else {
        let baseSg = 1.0, tempCoeff = 0.0003, scale = 2.5;
        if (fluidType === 'ethylene') { baseSg = (1.000 + 0.150 * W - 0.012 * Math.pow(W, 2)); tempCoeff = 0.00028 + 0.00025 * W; scale = 2.2; }
        else if (fluidType === 'propylene') { baseSg = (1.000 + 0.092 * W - 0.008 * Math.pow(W, 2)); tempCoeff = 0.00030 + 0.00020 * W; scale = 3.6; }
        const sg = baseSg - tempCoeff * (T - 60);
        const tempC = (T - 32) * 5 / 9;
        const viscWater = 1.002 * Math.exp((1.1709 * (20 - tempC) - 0.001827 * Math.pow(20 - tempC, 2)) / (tempC + 96));
        const viscMix = viscWater * Math.exp(scale * W * Math.pow(520 / (T + 460), 2.2));
        return { sg: Math.max(0.8, sg), viscosityCP: Math.max(0.15, viscMix) };
      }
    }

    var activeTool2TargetMode = 'velocity';

    function setTool2TargetMode(mode) {
      activeTool2TargetMode = mode;
      const btnVel = document.getElementById('btn-tool2-mode-velocity');
      const btnFrict = document.getElementById('btn-tool2-mode-friction');
      const grpVel = document.getElementById('groupTargetVelocity');
      const grpFrict = document.getElementById('groupTargetFriction');

      const activeClass = "flex-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm bg-indigo-600 text-white flex items-center justify-center gap-1.5";
      const inactiveClass = "flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-1.5";

      if (mode === 'velocity') {
        if (btnVel) btnVel.className = activeClass;
        if (btnFrict) btnFrict.className = inactiveClass;
        if (grpVel) grpVel.classList.remove('hidden');
        if (grpFrict) grpFrict.classList.add('hidden');
      } else {
        if (btnFrict) btnFrict.className = activeClass;
        if (btnVel) btnVel.className = inactiveClass;
        if (grpFrict) grpFrict.classList.remove('hidden');
        if (grpVel) grpVel.classList.add('hidden');
      }
      calculateSizingMatrix();
    }

    function calculateSizingMatrix() {
      const gpm = parseFloat(document.getElementById('flowRate')?.value || 150);
      const targetV = parseFloat(document.getElementById('targetVelocity')?.value || 6.0);
      const targetFriction = parseFloat(document.getElementById('targetFriction')?.value || 4.0);
      const activeSched = document.getElementById('pipeSchedule')?.value || "Schedule 40";
      const length = parseFloat(document.getElementById('systemLength')?.value || 250);
      const fittingPct = parseFloat(document.getElementById('fittingAllowance')?.value || 50);
      const equivalentLength = length * (1 + (fittingPct / 100));

      const elecRate = parseFloat(document.getElementById('electricityRate')?.value || 0.12);
      const hours = parseFloat(document.getElementById('operatingHours')?.value || 8760);
      const eff = parseFloat(document.getElementById('systemEfficiency')?.value || 80) / 100.0;
      const tempF = parseFloat(document.getElementById('temperature')?.value || 60);
      const glycolPct = parseFloat(document.getElementById('glycolPct')?.value || 30);
      const fluidType = document.getElementById('fluidType')?.value || 'water';

      const resultsBody = document.getElementById('matrixBody');
      if (!resultsBody) return;
      resultsBody.innerHTML = '';

      if (isNaN(gpm) || gpm <= 0 || !tool2Database.schedules[activeSched]) return;

      const pipesList = tool2Database.schedules[activeSched];
      const fluidProps = getFluidProperties(tempF, glycolPct, fluidType);

      const sgDisplay = document.getElementById('displaySG'); if (sgDisplay) sgDisplay.innerText = fluidProps.sg.toFixed(3);
      const viscDisplay = document.getElementById('displayVisc'); if (viscDisplay) viscDisplay.innerText = fluidProps.viscosityCP.toFixed(2) + " cP";
      const isDarcyModel = fluidType !== 'water' || tempF !== 60;
      const methDisplay = document.getElementById('displayMethod'); if (methDisplay) methDisplay.innerText = isDarcyModel ? 'Darcy-Weisbach & Colebrook-White Model' : 'Hazen-Williams Empirical Model';

      let bestIdx = -1, minDiff = Infinity;
      const calculatedRows = [];

      pipesList.forEach((pipe, idx) => {
        const v = (0.4085 * gpm) / Math.pow(pipe.d, 2);
        let headLoss100 = 0;

        if (!isDarcyModel) {
          const cFactor = parseFloat(document.getElementById('pipeRoughness')?.value || 140);
          headLoss100 = 0.2083 * Math.pow(100 / cFactor, 1.852) * Math.pow(gpm, 1.852) / Math.pow(pipe.d, 4.8655);
        } else {
          const reynolds = (3159.8 * gpm * fluidProps.sg) / (pipe.d * fluidProps.viscosityCP);
          const cFactor = parseFloat(document.getElementById('pipeRoughness')?.value || 140);
          let epsilon = cFactor >= 150 ? 0.00006 : (cFactor >= 140 ? 0.0018 : (cFactor >= 120 ? 0.0070 : 0.0250));
          let f = 0.02;
          if (reynolds < 2100) f = 64 / reynolds;
          else if (reynolds >= 2100 && reynolds < 4000) {
            const fLam = 64 / 2100, fTurb = 0.25 / Math.pow(Math.log10((epsilon / pipe.d) / 3.7 + 5.74 / Math.pow(4000, 0.9)), 2);
            f = fLam + ((reynolds - 2100) / 1900) * (fTurb - fLam);
          } else {
            f = 0.25 / Math.pow(Math.log10((epsilon / pipe.d) / 3.7 + 5.74 / Math.pow(reynolds, 0.9)), 2);
          }
          headLoss100 = 3.1119 * f * Math.pow(gpm, 2) / Math.pow(pipe.d, 5);
        }

        const totalHeadLoss = headLoss100 * (equivalentLength / 100);
        const kW = (gpm * totalHeadLoss * fluidProps.sg * 0.7457) / (3960 * eff);
        const annualCost = kW * hours * elecRate;

        calculatedRows.push({ nominal: pipe.nominal, velocity: v, headLoss100, annualCost });

        if (activeTool2TargetMode === 'velocity') {
          if (v <= 10.0) {
            const diff = Math.abs(v - targetV);
            if (diff < minDiff) { minDiff = diff; bestIdx = idx; }
          }
        } else {
          if (v <= 10.0) {
            const diff = Math.abs(headLoss100 - targetFriction);
            if (diff < minDiff) { minDiff = diff; bestIdx = idx; }
          }
        }
      });

      if (bestIdx === -1 && calculatedRows.length > 0) {
        bestIdx = 0;
        let minTargetDiff = Infinity;
        calculatedRows.forEach((row, idx) => {
          const diff = activeTool2TargetMode === 'velocity' ? Math.abs(row.velocity - targetV) : Math.abs(row.headLoss100 - targetFriction);
          if (diff < minTargetDiff) { minTargetDiff = diff; bestIdx = idx; }
        });
      }

      const bestFitCost = calculatedRows[bestIdx] ? calculatedRows[bestIdx].annualCost : 0;

      calculatedRows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        let badgeHtml = '';

        if (idx === bestIdx) {
          tr.className = 'best-fit-row font-bold';
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-600 text-white shadow-sm">Best Fit</span>`;
        } else if (row.velocity > 10.0) {
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-500 border border-rose-500/30">High Velocity</span>`;
        } else if (row.velocity < 2.0) {
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">Oversized</span>`;
        } else {
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">Recommended</span>`;
        }

        let savingsHtml = idx === bestIdx ? `<span class="text-slate-400 font-semibold">— Baseline</span>` : '';
        if (idx !== bestIdx) {
          const delta = bestFitCost - row.annualCost;
          savingsHtml = delta > 0 
            ? `<span class="text-emerald-400 font-bold font-mono">+$${delta.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr</span>`
            : `<span class="text-rose-400 font-bold font-mono">-$${Math.abs(delta).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr</span>`;
        }

        tr.innerHTML = `
          <td class="p-3 font-bold">${row.nominal}</td>
          <td class="p-3 font-mono">${row.velocity.toFixed(2)}</td>
          <td class="p-3 font-mono">${row.headLoss100.toFixed(3)}</td>
          <td class="p-3">${badgeHtml}</td>
          <td class="p-3 font-mono">$${row.annualCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="p-3">${savingsHtml}</td>
        `;
        resultsBody.appendChild(tr);
      });
    }

    // ===================================================================
    