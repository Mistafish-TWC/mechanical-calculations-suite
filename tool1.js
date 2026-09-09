// TOOL 1 ENGINE (PLUMBING FIXTURES)
    // ===================================================================
    const MATERIAL_DATABASE = {
      copper: {
        name: 'Copper Tubing',
        types: {
          type_l: { name: 'Type L', badge: 'Copper L', coldMaxVel: 8.0, hotMaxVel: 5.0, sizes: [{ label: '½"', id: 0.545 }, { label: '¾"', id: 0.785 }, { label: '1"', id: 1.025 }, { label: '1-¼"', id: 1.265 }, { label: '1-½"', id: 1.505 }, { label: '2"', id: 1.985 }, { label: '2-½"', id: 2.465 }, { label: '3"', id: 2.945 }] },
          type_k: { name: 'Type K', badge: 'Copper K', coldMaxVel: 8.0, hotMaxVel: 5.0, sizes: [{ label: '½"', id: 0.527 }, { label: '¾"', id: 0.745 }, { label: '1"', id: 0.995 }, { label: '1-¼"', id: 1.245 }, { label: '1-½"', id: 1.481 }, { label: '2"', id: 1.959 }, { label: '2-½"', id: 2.435 }, { label: '3"', id: 2.907 }] },
          type_m: { name: 'Type M', badge: 'Copper M', coldMaxVel: 8.0, hotMaxVel: 5.0, sizes: [{ label: '½"', id: 0.569 }, { label: '¾"', id: 0.811 }, { label: '1"', id: 1.055 }, { label: '1-¼"', id: 1.291 }, { label: '1-½"', id: 1.527 }, { label: '2"', id: 2.009 }, { label: '2-½"', id: 2.495 }, { label: '3"', id: 2.981 }] }
        }
      },
      stainless: {
        name: 'Stainless Steel (304/316)',
        types: {
          sch_10s: { name: 'Schedule 10S', badge: 'SS Sch 10S', coldMaxVel: 10.0, hotMaxVel: 8.0, sizes: [{ label: '½"', id: 0.674 }, { label: '¾"', id: 0.884 }, { label: '1"', id: 1.097 }, { label: '1-¼"', id: 1.442 }, { label: '1-½"', id: 1.682 }, { label: '2"', id: 2.157 }] },
          sch_40s: { name: 'Schedule 40S', badge: 'SS Sch 40S', coldMaxVel: 10.0, hotMaxVel: 8.0, sizes: [{ label: '½"', id: 0.622 }, { label: '¾"', id: 0.824 }, { label: '1"', id: 1.049 }, { label: '1-¼"', id: 1.380 }, { label: '1-½"', id: 1.610 }, { label: '2"', id: 2.067 }] },
          sch_80s: { name: 'Schedule 80S', badge: 'SS Sch 80S', coldMaxVel: 10.0, hotMaxVel: 8.0, sizes: [{ label: '½"', id: 0.546 }, { label: '¾"', id: 0.742 }, { label: '1"', id: 0.957 }, { label: '1-¼"', id: 1.278 }, { label: '1-½"', id: 1.500 }, { label: '2"', id: 1.939 }] }
        }
      },
      cpvc: {
        name: 'CPVC Pipe',
        types: {
          sch_80: { name: 'Schedule 80', badge: 'CPVC Sch 80', coldMaxVel: 8.0, hotMaxVel: 8.0, sizes: [{ label: '½"', id: 0.546 }, { label: '¾"', id: 0.742 }, { label: '1"', id: 0.957 }, { label: '1-¼"', id: 1.278 }, { label: '1-½"', id: 1.500 }, { label: '2"', id: 2.067 }] },
          sch_40: { name: 'Schedule 40', badge: 'CPVC Sch 40', coldMaxVel: 8.0, hotMaxVel: 8.0, sizes: [{ label: '½"', id: 0.622 }, { label: '¾"', id: 0.824 }, { label: '1"', id: 1.049 }, { label: '1-¼"', id: 1.380 }, { label: '1-½"', id: 1.610 }, { label: '2"', id: 2.067 }] }
        }
      },
      pex: { name: 'PEX Tubing', types: { sdr_9: { name: 'CTS SDR-9', badge: 'PEX SDR-9', coldMaxVel: 8.0, hotMaxVel: 8.0, sizes: [{ label: '½"', id: 0.475 }, { label: '¾"', id: 0.671 }, { label: '1"', id: 0.862 }, { label: '1-¼"', id: 1.054 }, { label: '1-½"', id: 1.244 }, { label: '2"', id: 1.629 }] } } }
    };

    const DRAIN_SLOPE_LIMITS = {
      '1_16': { label: '1/16"/ft (0.5%)', shortLabel: '1/16"/ft', sizes: [{ maxDfu: 120, label: '4" Drain' }, { maxDfu: 300, label: '5" Sewer' }, { maxDfu: 560, label: '6" Sewer' }, { maxDfu: 1400, label: '8" Sewer' }, { maxDfu: 2500, label: '10" Sewer' }] },
      '1_8': { label: '1/8"/ft (1.0%)', shortLabel: '1/8"/ft', sizes: [{ maxDfu: 36, label: '3" Drain' }, { maxDfu: 180, label: '4" Drain' }, { maxDfu: 390, label: '5" Sewer' }, { maxDfu: 700, label: '6" Sewer' }, { maxDfu: 1600, label: '8" Sewer' }, { maxDfu: 2900, label: '10" Sewer' }] },
      '1_4': { label: '1/4"/ft (2.0%)', shortLabel: '1/4"/ft', sizes: [{ maxDfu: 2, label: '1-½" Waste' }, { maxDfu: 21, label: '2" Waste' }, { maxDfu: 42, label: '3" Drain' }, { maxDfu: 216, label: '4" Drain' }, { maxDfu: 480, label: '5" Sewer' }, { maxDfu: 840, label: '6" Sewer' }, { maxDfu: 1920, label: '8" Sewer' }, { maxDfu: 3500, label: '10" Sewer' }] },
      '1_2': { label: '1/2"/ft (4.0%)', shortLabel: '1/2"/ft', sizes: [{ maxDfu: 3, label: '1-½" Waste' }, { maxDfu: 26, label: '2" Waste' }, { maxDfu: 50, label: '3" Drain' }, { maxDfu: 250, label: '4" Drain' }, { maxDfu: 575, label: '5" Sewer' }, { maxDfu: 1000, label: '6" Sewer' }, { maxDfu: 2300, label: '8" Sewer' }, { maxDfu: 4200, label: '10" Sewer' }] }
    };

    const DRAIN_VERTICAL_LIMITS = { label: 'Vertical Stack', shortLabel: 'Vert. Stack', sizes: [{ maxDfu: 4, label: '1-½" Stack' }, { maxDfu: 24, label: '2" Stack' }, { maxDfu: 48, label: '3" Stack' }, { maxDfu: 240, label: '4" Stack' }, { maxDfu: 540, label: '5" Stack' }, { maxDfu: 960, label: '6" Stack' }, { maxDfu: 2200, label: '8" Stack' }, { maxDfu: 3800, label: '10" Stack' }] };

    const FIXTURE_DB = {
      IPC: {
        lavatory: { label: 'Lavatory (Commercial / Public)', cold: 0.75, hot: 0.75, total: 1.0, dfu: 1.0, category: 'Bathroom' },
        wc_valve: { label: 'Water Closet (Flushometer)', cold: 5.0, hot: 0.0, total: 5.0, dfu: 4.0, category: 'Commercial', isFlushometer: true },
        urinal_valve: { label: 'Urinal (Flushometer)', cold: 5.0, hot: 0.0, total: 5.0, dfu: 4.0, category: 'Commercial', isFlushometer: true },
        wc_tank: { label: 'Water Closet (Flush Tank)', cold: 2.5, hot: 0.0, total: 2.5, dfu: 3.0, category: 'Bathroom' },
        shower: { label: 'Shower Head (Standard)', cold: 1.0, hot: 1.0, total: 1.5, dfu: 2.0, category: 'Bathroom' },
        tub_shower: { label: 'Bathtub / Shower Combo', cold: 1.5, hot: 1.5, total: 2.0, dfu: 2.0, category: 'Bathroom' },
        bathtub_fill: { label: 'Bathtub Fill Valve (1/2")', cold: 1.5, hot: 1.5, total: 2.0, dfu: 2.0, category: 'Bathroom' },
        bathtub_fill_heavy: { label: 'Bathtub Fill Valve (3/4")', cold: 7.5, hot: 7.5, total: 10.0, dfu: 3.0, category: 'Bathroom' },
        bidet: { label: 'Bidet', cold: 0.75, hot: 0.75, total: 1.0, dfu: 1.0, category: 'Bathroom' },
        kitchen_sink: { label: 'Kitchen Sink (Commercial / Domestic)', cold: 1.0, hot: 1.0, total: 1.5, dfu: 2.0, category: 'Kitchen' },
        bar_sink_pub: { label: 'Bar Sink (Commercial)', cold: 1.0, hot: 1.0, total: 1.5, dfu: 2.0, category: 'Kitchen' },
        bar_sink_priv: { label: 'Bar Sink (Private)', cold: 0.75, hot: 0.75, total: 1.0, dfu: 1.0, category: 'Kitchen' },
        dishwasher: { label: 'Dishwasher (Commercial / Domestic)', cold: 0.0, hot: 1.5, total: 1.5, dfu: 2.0, category: 'Kitchen' },
        urinal_tank: { label: 'Urinal (Flush Tank)', cold: 2.5, hot: 0.0, total: 2.5, dfu: 2.0, category: 'Commercial' },
        drinking_fountain: { label: 'Drinking Fountain / Cooler', cold: 0.5, hot: 0.0, total: 0.5, dfu: 0.5, category: 'Commercial' },
        food_prep_sink: { label: 'Commercial Food Prep Sink', cold: 2.25, hot: 2.25, total: 3.0, dfu: 3.0, category: 'Commercial' },
        commercial_disposer: { label: 'Commercial Food Disposer', cold: 1.0, hot: 0.0, total: 1.0, dfu: 3.0, category: 'Commercial' },
        washfountain: { label: 'Washfountain (Circular)', cold: 3.0, hot: 3.0, total: 4.0, dfu: 2.0, category: 'Commercial' },
        clothes_washer: { label: 'Clothes Washer (Commercial / Domestic)', cold: 1.0, hot: 1.0, total: 1.4, dfu: 2.0, category: 'Utility' },
        laundry_sink: { label: 'Laundry Sink / Tray', cold: 1.0, hot: 1.0, total: 1.5, dfu: 2.0, category: 'Utility' },
        service_sink: { label: 'Service / Mop Sink', cold: 1.5, hot: 1.5, total: 2.0, dfu: 2.0, category: 'Utility' },
        floor_drain_2: { label: 'Floor Drain (Restroom 2")', cold: 0.0, hot: 0.0, total: 0.0, dfu: 2.0, category: 'Utility' },
        floor_drain_3: { label: 'Floor Drain (Restroom 3")', cold: 0.0, hot: 0.0, total: 0.0, dfu: 3.0, category: 'Utility' },
        floor_drain_4: { label: 'Floor Drain (Restroom 4")', cold: 0.0, hot: 0.0, total: 0.0, dfu: 4.0, category: 'Utility' },
        clinical_sink: { label: 'Clinical / Flushing Rim Sink', cold: 3.0, hot: 3.0, total: 4.0, dfu: 6.0, category: 'Medical' },
        dental_unit: { label: 'Dental Unit / Cuspidor', cold: 1.0, hot: 0.0, total: 1.0, dfu: 1.0, category: 'Medical' },
        hose_bibb: { label: 'Hose Bibb (First 1/2")', cold: 2.5, hot: 0.0, total: 2.5, dfu: 0.0, category: 'Exterior' },
        hose_bibb_add: { label: 'Hose Bibb (Each Addl)', cold: 1.0, hot: 0.0, total: 1.0, dfu: 0.0, category: 'Exterior' },
        lawn_sprinkler: { label: 'Lawn Sprinkler Head', cold: 1.0, hot: 0.0, total: 1.0, dfu: 0.0, category: 'Exterior' },
        mobile_home: { label: 'Mobile Home Service Conn.', cold: 12.0, hot: 0.0, total: 12.0, dfu: 6.0, category: 'Exterior' }
      },
      UPC: {
        lavatory: { label: 'Lavatory (Commercial / Public)', cold: 0.75, hot: 0.75, total: 1.0, dfu: 1.0, category: 'Bathroom' },
        wc_valve: { label: 'Water Closet (Flushometer)', cold: 40.0, hot: 0.0, total: 40.0, dfu: 4.0, category: 'Commercial', isFlushometer: true },
        urinal_valve: { label: 'Urinal (Flushometer)', cold: 20.0, hot: 0.0, total: 20.0, dfu: 2.0, category: 'Commercial', isFlushometer: true },
        wc_tank: { label: 'Water Closet (Flush Tank)', cold: 2.5, hot: 0.0, total: 2.5, dfu: 3.0, category: 'Bathroom' },
        shower: { label: 'Shower Head (Standard)', cold: 1.5, hot: 1.5, total: 2.0, dfu: 2.0, category: 'Bathroom' },
        tub_shower: { label: 'Bathtub / Shower Combo', cold: 1.5, hot: 1.5, total: 2.0, dfu: 2.0, category: 'Bathroom' },
        bathtub_fill: { label: 'Bathtub Fill Valve (1/2")', cold: 3.0, hot: 3.0, total: 4.0, dfu: 2.0, category: 'Bathroom' },
        bathtub_fill_heavy: { label: 'Bathtub Fill Valve (3/4")', cold: 7.5, hot: 7.5, total: 10.0, dfu: 3.0, category: 'Bathroom' },
        bidet: { label: 'Bidet', cold: 1.0, hot: 1.0, total: 1.0, dfu: 1.0, category: 'Bathroom' },
        kitchen_sink: { label: 'Kitchen Sink (Commercial / Domestic)', cold: 1.5, hot: 1.5, total: 2.0, dfu: 2.0, category: 'Kitchen' },
        bar_sink_pub: { label: 'Bar Sink (Commercial)', cold: 1.5, hot: 1.5, total: 2.0, dfu: 2.0, category: 'Kitchen' },
        bar_sink_priv: { label: 'Bar Sink (Private)', cold: 0.75, hot: 0.75, total: 1.0, dfu: 1.0, category: 'Kitchen' },
        dishwasher: { label: 'Dishwasher (Commercial / Domestic)', cold: 0.0, hot: 1.5, total: 1.5, dfu: 2.0, category: 'Kitchen' },
        urinal_tank: { label: 'Urinal (Flush Tank)', cold: 2.0, hot: 0.0, total: 2.0, dfu: 2.0, category: 'Commercial' },
        drinking_fountain: { label: 'Drinking Fountain / Cooler', cold: 0.5, hot: 0.0, total: 0.5, dfu: 0.5, category: 'Commercial' },
        food_prep_sink: { label: 'Commercial Food Prep Sink', cold: 2.25, hot: 2.25, total: 3.0, dfu: 3.0, category: 'Commercial' },
        commercial_disposer: { label: 'Commercial Food Disposer', cold: 1.0, hot: 0.0, total: 1.0, dfu: 3.0, category: 'Commercial' },
        washfountain: { label: 'Washfountain (Circular)', cold: 3.0, hot: 3.0, total: 4.0, dfu: 3.0, category: 'Commercial' },
        clothes_washer: { label: 'Clothes Washer (Commercial / Domestic)', cold: 3.0, hot: 3.0, total: 4.0, dfu: 3.0, category: 'Utility' },
        laundry_sink: { label: 'Laundry Sink / Tray', cold: 1.15, hot: 1.15, total: 1.5, dfu: 2.0, category: 'Utility' },
        service_sink: { label: 'Service / Mop Sink', cold: 2.25, hot: 2.25, total: 3.0, dfu: 3.0, category: 'Utility' },
        floor_drain_2: { label: 'Floor Drain (Restroom 2")', cold: 0.0, hot: 0.0, total: 0.0, dfu: 2.0, category: 'Utility' },
        floor_drain_3: { label: 'Floor Drain (Restroom 3")', cold: 0.0, hot: 0.0, total: 0.0, dfu: 3.0, category: 'Utility' },
        floor_drain_4: { label: 'Floor Drain (Restroom 4")', cold: 0.0, hot: 0.0, total: 0.0, dfu: 6.0, category: 'Utility' },
        clinical_sink: { label: 'Clinical / Flushing Rim Sink', cold: 6.0, hot: 2.0, total: 8.0, dfu: 6.0, category: 'Medical' },
        dental_unit: { label: 'Dental Unit / Cuspidor', cold: 1.0, hot: 0.0, total: 1.0, dfu: 1.0, category: 'Medical' },
        hose_bibb: { label: 'Hose Bibb (First 1/2")', cold: 2.5, hot: 0.0, total: 2.5, dfu: 0.0, category: 'Exterior' },
        hose_bibb_add: { label: 'Hose Bibb (Each Addl)', cold: 1.0, hot: 0.0, total: 1.0, dfu: 0.0, category: 'Exterior' },
        lawn_sprinkler: { label: 'Lawn Sprinkler Head', cold: 1.0, hot: 0.0, total: 1.0, dfu: 0.0, category: 'Exterior' },
        mobile_home: { label: 'Mobile Home Service Conn.', cold: 12.0, hot: 0.0, total: 12.0, dfu: 12.0, category: 'Exterior' }
      }
    };

    const HUNTER_CURVE = {
      tank: [[0, 0], [2, 2.0], [4, 4.0], [5, 5.0], [8, 6.5], [10, 8.0], [15, 11.0], [20, 14.0], [25, 17.0], [30, 20.0], [40, 24.0], [50, 28.0], [70, 35.0], [100, 43.0], [150, 52.0], [200, 65.0], [250, 75.0], [300, 85.0], [400, 105.0], [500, 125.0]],
      valve: [[0, 0], [5, 15.0], [10, 27.0], [15, 31.0], [20, 35.0], [25, 38.0], [30, 42.0], [40, 46.0], [50, 50.0], [70, 58.0], [100, 68.0], [150, 80.0], [200, 92.0], [250, 102.0], [300, 112.0], [400, 128.0], [500, 143.0]]
    };

    const PRESET_SCHEDULES = {
      commercial_restroom: [{ key: 'wc_valve', qty: 6 }, { key: 'urinal_valve', qty: 3 }, { key: 'lavatory', qty: 6 }, { key: 'floor_drain_2', qty: 3 }, { key: 'service_sink', qty: 1 }],
      commercial_kitchen: [{ key: 'food_prep_sink', qty: 3 }, { key: 'commercial_disposer', qty: 2 }, { key: 'bar_sink_pub', qty: 2 }, { key: 'dishwasher', qty: 2 }, { key: 'floor_drain_3', qty: 4 }, { key: 'service_sink', qty: 1 }],
      medical_clinic: [{ key: 'lavatory', qty: 12 }, { key: 'wc_valve', qty: 4 }, { key: 'clinical_sink', qty: 2 }, { key: 'dental_unit', qty: 4 }, { key: 'service_sink', qty: 2 }, { key: 'floor_drain_2', qty: 4 }],
      multi_family: [{ key: 'wc_tank', qty: 20 }, { key: 'lavatory', qty: 20 }, { key: 'tub_shower', qty: 20 }, { key: 'kitchen_sink', qty: 20 }, { key: 'dishwasher', qty: 20 }, { key: 'clothes_washer', qty: 20 }],
      residential: [{ key: 'wc_tank', qty: 3 }, { key: 'lavatory', qty: 3 }, { key: 'tub_shower', qty: 2 }, { key: 'shower', qty: 1 }, { key: 'kitchen_sink', qty: 1 }, { key: 'dishwasher', qty: 1 }, { key: 'clothes_washer', qty: 1 }, { key: 'hose_bibb', qty: 2 }]
    };

    var activeCode = 'IPC', activeSystem = 'valve', activeMaterialFamily = 'copper', activeMaterialType = 'type_l';
    var activeDrainSlope = '1_4', activeDrainType = 'horizontal', customColdVelocity = null, customHotVelocity = null;
    var continuousGPM = 0.0, fixtureRows = [], rowCounter = 1;

    function setCustomVelocity(type, val) {
      const v = parseFloat(val);
      if (type === 'cold') customColdVelocity = isNaN(v) ? null : v;
      if (type === 'hot') customHotVelocity = isNaN(v) ? null : v;
      calculateTool1();
    }

    function getActiveMaterial() {
      const family = MATERIAL_DATABASE[activeMaterialFamily] || MATERIAL_DATABASE.copper;
      const mat = family.types[activeMaterialType] || Object.values(family.types)[0];
      return { family, mat };
    }

    function setCode(code) {
      activeCode = code;
      const btnIpc = document.getElementById('btn-code-ipc');
      const btnUpc = document.getElementById('btn-code-upc');
      const badge = document.getElementById('breakdown-code-badge');
      const activeClass = "flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm bg-sky-600 text-white flex items-center justify-center gap-1.5";
      const inactiveClass = "flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-1.5";

      if (btnIpc && btnUpc) {
        if (code === 'IPC') { btnIpc.className = activeClass; btnUpc.className = inactiveClass; }
        else { btnUpc.className = activeClass; btnIpc.className = inactiveClass; }
      }
      if (badge) badge.innerText = `${code} Standard`;
      renderRows();
      calculateTool1();
    }

    function setSystem(sys) {
      activeSystem = sys;
      const btnTank = document.getElementById('btn-sys-tank');
      const btnValve = document.getElementById('btn-sys-valve');
      const activeClass = "flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm bg-sky-600 text-white flex items-center justify-center gap-1.5";
      const inactiveClass = "flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-1.5";

      if (btnTank && btnValve) {
        if (sys === 'tank') { btnTank.className = activeClass; btnValve.className = inactiveClass; }
        else { btnValve.className = activeClass; btnTank.className = inactiveClass; }
      }
      calculateTool1();
    }

    function setDrainSlope(s) { activeDrainSlope = s; calculateTool1(); }
    function setDrainType(t) { activeDrainType = t; calculateTool1(); }
    function updateContinuousGPM(v) { continuousGPM = parseFloat(v)||0; calculateTool1(); }
    function onMaterialFamilyChange(fam) { activeMaterialFamily = fam; populateMaterialTypes(); calculateTool1(); }
    function setMaterialType(t) { activeMaterialType = t; calculateTool1(); }

    function loadPreset(presetKey) {
      if (!presetKey || !PRESET_SCHEDULES[presetKey]) return;
      fixtureRows = [];
      PRESET_SCHEDULES[presetKey].forEach(item => { fixtureRows.push({ id: rowCounter++, key: item.key, qty: item.qty }); });
      renderRows();
      calculateTool1();
    }

    function resetAll() {
      fixtureRows = [];
      customColdVelocity = null;
      customHotVelocity = null;
      const select = document.getElementById('preset-select');
      if (select) select.value = '';
      renderRows();
      calculateTool1();
    }

    function populateMaterialTypes() {
      const typeSelect = document.getElementById('material-type-select');
      if (!typeSelect) return;
      const fam = MATERIAL_DATABASE[activeMaterialFamily] || MATERIAL_DATABASE.copper;
      typeSelect.innerHTML = Object.keys(fam.types).map(k => `<option value="${k}">${fam.types[k].name}</option>`).join('');
    }

    function addFixtureRow() { fixtureRows.push({ id: rowCounter++, isCustom: false, key: 'lavatory', qty: 1 }); renderRows(); calculateTool1(); }
    function addCustomFixtureRow() { fixtureRows.push({ id: rowCounter++, isCustom: true, desc: 'Custom Equipment', qty: 1, cold: 1.0, hot: 0.0, dfu: 1.0 }); renderRows(); calculateTool1(); }
    function removeFixtureRow(id) { fixtureRows = fixtureRows.filter(r => r.id !== id); renderRows(); calculateTool1(); }
    function clearFixtureSchedule() {
      fixtureRows = [];
      const select = document.getElementById('preset-select');
      if (select) select.value = '';
      renderRows();
      calculateTool1();
    }
    function updateRow(id, field, val) {
      const r = fixtureRows.find(x => x.id === id);
      if (r) { r[field] = field === 'qty' ? Math.max(0, parseInt(val, 10)||0) : val; calculateTool1(); }
    }
    function updateCustomRow(id, field, val) {
      const r = fixtureRows.find(x => x.id === id);
      if (r) {
        if (field === 'desc') r.desc = val;
        else if (field === 'qty') r.qty = Math.max(0, parseInt(val, 10)||0);
        else r[field] = Math.max(0, parseFloat(val)||0);
        calculateTool1();
      }
    }

    function renderRows() {
      const tbody = document.getElementById('fixture-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';
      const db = FIXTURE_DB[activeCode];
      const categories = {};
      Object.keys(db).forEach(k => {
        const cat = db[k].category || 'General';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ key: k, label: db[k].label });
      });

      fixtureRows.forEach(row => {
        const tr = document.createElement('tr');
        if (row.isCustom) {
          const tot = ((parseFloat(row.cold)||0) + (parseFloat(row.hot)||0)).toFixed(2);
          tr.innerHTML = `
            <td class="py-2 px-4">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30 whitespace-nowrap">Custom</span>
                <input type="text" value="${row.desc || ''}" oninput="updateCustomRow(${row.id}, 'desc', this.value)" placeholder="Custom Fixture Description" class="bg-slate-900 border border-indigo-500/50 text-xs text-white rounded p-1 w-full font-semibold focus:border-indigo-400 outline-none">
              </div>
            </td>
            <td class="py-2 px-3 text-center"><input type="number" min="0" value="${row.qty}" oninput="updateCustomRow(${row.id}, 'qty', this.value)" class="bg-slate-900 border border-slate-700 text-xs text-center w-16 text-white rounded p-1 font-bold"></td>
            <td class="py-2 px-4 text-right"><input type="number" min="0" step="0.1" value="${row.cold}" oninput="updateCustomRow(${row.id}, 'cold', this.value)" class="bg-slate-900 border border-sky-500/50 text-xs text-right w-20 text-sky-400 rounded p-1 font-bold mono outline-none"></td>
            <td class="py-2 px-4 text-right"><input type="number" min="0" step="0.1" value="${row.hot}" oninput="updateCustomRow(${row.id}, 'hot', this.value)" class="bg-slate-900 border border-rose-500/50 text-xs text-right w-20 text-rose-400 rounded p-1 font-bold mono outline-none"></td>
            <td class="py-2 px-4 text-right font-bold text-white mono" id="row-total-${row.id}">${tot}</td>
            <td class="py-2 px-4 text-right"><input type="number" min="0" step="0.1" value="${row.dfu}" oninput="updateCustomRow(${row.id}, 'dfu', this.value)" class="bg-slate-900 border border-emerald-500/50 text-xs text-right w-20 text-emerald-400 rounded p-1 font-bold mono outline-none"></td>
            <td class="py-2 px-4 text-center"><button onclick="removeFixtureRow(${row.id})" class="text-slate-500 hover:text-rose-400"><i class="fa-solid fa-trash"></i></button></td>
          `;
        } else {
          let optionsHtml = '';
          Object.keys(categories).forEach(catName => {
            optionsHtml += `<optgroup label="── ${catName} ──">`;
            categories[catName].forEach(item => { optionsHtml += `<option value="${item.key}" ${item.key === row.key ? 'selected' : ''}>${item.label}</option>`; });
            optionsHtml += `</optgroup>`;
          });

          tr.innerHTML = `
            <td class="py-2 px-4"><select onchange="updateRow(${row.id}, 'key', this.value)" class="bg-slate-900 border border-slate-700 text-xs text-white rounded p-1 w-full">${optionsHtml}</select></td>
            <td class="py-2 px-3 text-center"><input type="number" min="0" value="${row.qty}" oninput="updateRow(${row.id}, 'qty', this.value)" class="bg-slate-900 border border-slate-700 text-xs text-center w-16 text-white rounded p-1 font-bold"></td>
            <td class="py-2 px-4 text-right text-sky-400" id="row-cold-${row.id}">-</td>
            <td class="py-2 px-4 text-right text-rose-400" id="row-hot-${row.id}">-</td>
            <td class="py-2 px-4 text-right font-bold text-white" id="row-total-${row.id}">-</td>
            <td class="py-2 px-4 text-right text-emerald-400" id="row-dfu-${row.id}">-</td>
            <td class="py-2 px-4 text-center"><button onclick="removeFixtureRow(${row.id})" class="text-slate-500 hover:text-rose-400"><i class="fa-solid fa-trash"></i></button></td>
          `;
        }
        tbody.appendChild(tr);
      });
      const emptyState = document.getElementById('empty-state');
      if (emptyState) emptyState.classList.toggle('hidden', fixtureRows.length > 0);
    }

    function interpolateGPM(wsfu, systemType) {
      if (wsfu <= 0) return 0;
      const points = HUNTER_CURVE[systemType];
      if (!points) return 0;
      if (wsfu >= points[points.length - 1][0]) {
        const last = points[points.length - 1], prev = points[points.length - 2];
        return parseFloat((last[1] + (wsfu - last[0]) * ((last[1] - prev[1]) / (last[0] - prev[0]))).toFixed(1));
      }
      for (let i = 0; i < points.length - 1; i++) {
        if (wsfu >= points[i][0] && wsfu <= points[i+1][0]) {
          return parseFloat((points[i][1] + ((wsfu - points[i][0]) / (points[i+1][0] - points[i][0])) * (points[i+1][1] - points[i][1])).toFixed(1));
        }
      }
      return 0;
    }

    function getUpcWcValveWsfu(qty) {
      const scale = [40, 30, 20, 15];
      let sum = 0;
      for (let i = 0; i < qty; i++) sum += (i < scale.length) ? scale[i] : 10;
      return sum;
    }

    function getUpcUrinalValveWsfu(qty) {
      const scale = [20, 15, 10, 8];
      let sum = 0;
      for (let i = 0; i < qty; i++) sum += (i < scale.length) ? scale[i] : 5;
      return sum;
    }

    function getPipeRecommendation(gpmVal, isHot = false, isMainService = false, customVelOverride = null) {
      const g = parseFloat(gpmVal);
      if (g <= 0) return { sizeText: 'N/A', velocity: 0, vLimit: 0 };
      const { mat } = getActiveMaterial();
      let vLimit = customVelOverride !== null ? customVelOverride : (isHot ? mat.hotMaxVel : mat.coldMaxVel);
      let foundSize = null;
      for (let i = 0; i < mat.sizes.length; i++) {
        const size = mat.sizes[i];
        if (g <= (vLimit * size.id * size.id) / 0.4085) { foundSize = size; break; }
      }
      if (!foundSize) {
        const largest = mat.sizes[mat.sizes.length - 1];
        const actualV = (0.4085 * g) / (largest.id * largest.id);
        return { sizeText: `> ${largest.label} ${mat.badge}`, velocity: actualV, vLimit };
      }
      let label = `${foundSize.label} ${mat.badge}`;
      if (isMainService && foundSize.label === '½"') {
        const size34 = mat.sizes.find(s => s.label === '¾"') || foundSize;
        const actualV = (0.4085 * g) / (size34.id * size34.id);
        return { sizeText: `¾" ${mat.badge} (Commercial Floor)`, velocity: actualV, vLimit };
      }
      const actualV = (0.4085 * g) / (foundSize.id * foundSize.id);
      return { sizeText: label, velocity: actualV, vLimit };
    }

    function getDrainPipeRecommendation(dfu, totalWCCount = 0) {
      if (dfu <= 0 && totalWCCount <= 0) return 'N/A';
      const data = activeDrainType === 'vertical' ? DRAIN_VERTICAL_LIMITS : DRAIN_SLOPE_LIMITS[activeDrainSlope];
      let minSizeIdx = 0;

      // Rule A: Minimum 3" Pipe for Water Closets (IPC 704.1 / UPC 703.1)
      if (totalWCCount > 0) {
        const idx3 = data.sizes.findIndex(s => s.label.startsWith('3"'));
        if (idx3 !== -1 && minSizeIdx < idx3) {
          minSizeIdx = idx3;
        }
      }

      // Rule B: Maximum Water Closets on 3" Horizontal Drain (IPC Table 710.1(2) / UPC Table 703.2)
      // Max 3 WCs on 3" Building Drain / Max 2 on Horizontal Branch. If > 3 WCs, requires 4" Drain.
      if (activeDrainType === 'horizontal' && totalWCCount > 3) {
        const idx4 = data.sizes.findIndex(s => s.label.startsWith('4"'));
        if (idx4 !== -1 && minSizeIdx < idx4) {
          minSizeIdx = idx4;
        }
      }

      // Rule C: Maximum Water Closets on 3" Vertical Stack (IPC Table 710.1(1) / UPC Table 703.2)
      const wcStackLimit = activeCode === 'UPC' ? 4 : 6;
      if (activeDrainType === 'vertical' && totalWCCount > wcStackLimit) {
        const idx4 = data.sizes.findIndex(s => s.label.startsWith('4"'));
        if (idx4 !== -1 && minSizeIdx < idx4) {
          minSizeIdx = idx4;
        }
      }

      for (let i = minSizeIdx; i < data.sizes.length; i++) {
        if (dfu <= data.sizes[i].maxDfu) return data.sizes[i].label;
      }
      return `> ${data.sizes[data.sizes.length - 1].label}`;
    }

    // VENT SIZING DATA TABLES (UPC Table 703.2 / 904.1 & IPC Table 906.1)
    const VENT_SIZING_TABLES = {
      UPC: [
        { sizeLabel: '1-½"', minNumericSize: 1.5, maxDfu: 8 },
        { sizeLabel: '2"', minNumericSize: 2.0, maxDfu: 24 },
        { sizeLabel: '3"', minNumericSize: 3.0, maxDfu: 84 },
        { sizeLabel: '4"', minNumericSize: 4.0, maxDfu: 256 },
        { sizeLabel: '5"', minNumericSize: 5.0, maxDfu: 600 },
        { sizeLabel: '6"', minNumericSize: 6.0, maxDfu: 1300 }
      ],
      IPC: [
        { sizeLabel: '1-¼"', minNumericSize: 1.25, maxDfu: 2 },
        { sizeLabel: '1-½"', minNumericSize: 1.5, maxDfu: 10 },
        { sizeLabel: '2"', minNumericSize: 2.0, maxDfu: 21 },
        { sizeLabel: '3"', minNumericSize: 3.0, maxDfu: 102 },
        { sizeLabel: '4"', minNumericSize: 4.0, maxDfu: 538 },
        { sizeLabel: '5"', minNumericSize: 5.0, maxDfu: 1100 },
        { sizeLabel: '6"', minNumericSize: 6.0, maxDfu: 2300 }
      ]
    };

    function getVentPipeRecommendation(dfu, totalWCCount = 0, drainPipeSizeLabel = '', code = 'UPC') {
      if (dfu <= 0 && totalWCCount <= 0) return { sizeText: 'N/A', constraint: '-' };

      let numericDrainSize = 0.0;
      if (drainPipeSizeLabel.includes('1-½') || drainPipeSizeLabel.includes('1-1/2')) numericDrainSize = 1.5;
      else if (drainPipeSizeLabel.includes('2"')) numericDrainSize = 2.0;
      else if (drainPipeSizeLabel.includes('3"')) numericDrainSize = 3.0;
      else if (drainPipeSizeLabel.includes('4"')) numericDrainSize = 4.0;
      else if (drainPipeSizeLabel.includes('5"')) numericDrainSize = 5.0;
      else if (drainPipeSizeLabel.includes('6"')) numericDrainSize = 6.0;
      else if (drainPipeSizeLabel.includes('8"')) numericDrainSize = 8.0;

      // Rule 1: Half-Diameter Rule (d_vent >= 0.5 * d_drain)
      let minVentNumericSize = numericDrainSize > 0 ? (numericDrainSize / 2.0) : 0.0;
      let activeConstraint = minVentNumericSize > 0 ? `≥ ½ Drain (${minVentNumericSize}")` : '';

      // Rule 2: Water Closet Vent Floor (Min 2" Vent for Water Closets - UPC 904.1 / IPC 906.1)
      if (totalWCCount > 0 && minVentNumericSize < 2.0) {
        minVentNumericSize = 2.0;
        activeConstraint = 'WC Floor (Min 2")';
      }

      // Rule 3: Minimum Vent Floor (UPC 1-1/2" / IPC 1-1/4")
      if (code === 'UPC' && minVentNumericSize < 1.5) {
        minVentNumericSize = 1.5;
        if (!activeConstraint) activeConstraint = 'UPC 1-½" Floor';
      } else if (code === 'IPC' && minVentNumericSize < 1.25) {
        minVentNumericSize = 1.25;
        if (!activeConstraint) activeConstraint = 'IPC 1-¼" Floor';
      }

      const table = VENT_SIZING_TABLES[code] || VENT_SIZING_TABLES.UPC;
      for (let i = 0; i < table.length; i++) {
        const v = table[i];
        if (v.minNumericSize >= minVentNumericSize && dfu <= v.maxDfu) {
          return {
            sizeText: `${v.sizeLabel} Vent Line`,
            constraint: activeConstraint || `${code} DFU Cap`
          };
        }
      }

      const largest = table[table.length - 1];
      return {
        sizeText: `> ${largest.sizeLabel} Vent Stack`,
        constraint: 'Exceeds Table'
      };
    }

    function calculateTool1() {
      const db = FIXTURE_DB[activeCode];
            let tCold = 0, tHot = 0, tTot = 0, tDfu = 0, tQty = 0, totalWCCount = 0, hasFlushometer = false;
      const breakdownMap = {};

      fixtureRows.forEach(r => {
        if (r.isCustom) {
          const desc = (r.desc || '').toLowerCase();
          if (desc.includes('water closet') || desc.includes('wc') || desc.includes('toilet') || desc.includes('flushometer closet')) {
            totalWCCount += (parseInt(r.qty, 10) || 0);
          }
          const c = (parseFloat(r.cold) || 0) * r.qty;
          const h = (parseFloat(r.hot) || 0) * r.qty;
          const tot = c + h;
          const d = (parseFloat(r.dfu) || 0) * r.qty;
          
          tCold += c; tHot += h; tTot += tot; tDfu += d; tQty += r.qty;

          const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
          setEl(`row-total-${r.id}`, tot.toFixed(2));

          const customKey = `custom_${r.id}`;
          breakdownMap[customKey] = { label: `[Custom] ${r.desc || 'Custom Fixture'}`, qty: r.qty, cold: c, hot: h, total: tot, dfu: d, unitC: parseFloat(r.cold)||0, unitH: parseFloat(r.hot)||0, unitT: (parseFloat(r.cold)||0)+(parseFloat(r.hot)||0), unitD: parseFloat(r.dfu)||0 };
        } else {
                    const f = db[r.key]; if (!f) return;
          if (r.key === 'wc_valve' || r.key === 'wc_tank') {
            totalWCCount += (parseInt(r.qty, 10) || 0);
          }
          if (f.isFlushometer && r.qty > 0) hasFlushometer = true;
          let c = f.cold * r.qty, h = f.hot * r.qty, tot = f.total * r.qty, d = f.dfu * r.qty;
          if (activeCode === 'UPC') {
            if (r.key === 'wc_valve') { c = getUpcWcValveWsfu(r.qty); h = 0; tot = c; }
            else if (r.key === 'urinal_valve') { c = getUpcUrinalValveWsfu(r.qty); h = 0; tot = c; }
          }
          tCold += c; tHot += h; tTot += tot; tDfu += d; tQty += r.qty;
          
          const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
          setEl(`row-cold-${r.id}`, c.toFixed(2));
          setEl(`row-hot-${r.id}`, h.toFixed(2));
          setEl(`row-total-${r.id}`, tot.toFixed(2));
          setEl(`row-dfu-${r.id}`, d.toFixed(1));

          if (!breakdownMap[r.key]) breakdownMap[r.key] = { label: f.label, qty: 0, cold: 0, hot: 0, total: 0, dfu: 0, unitC: f.cold, unitH: f.hot, unitT: f.total, unitD: f.dfu };
          breakdownMap[r.key].qty += r.qty; breakdownMap[r.key].cold += c; breakdownMap[r.key].hot += h; breakdownMap[r.key].total += tot; breakdownMap[r.key].dfu += d;
        }
      });

      const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
      setTxt('foot-total-qty', tQty);
      setTxt('foot-total-cold', tCold.toFixed(2));
      setTxt('foot-total-hot', tHot.toFixed(2));
      setTxt('foot-total-wsfu', tTot.toFixed(2));
      setTxt('foot-total-dfu', tDfu.toFixed(1));

      const coldGPM = (interpolateGPM(tCold, activeSystem) + continuousGPM).toFixed(1);
      const hotGPM = interpolateGPM(tHot, 'tank').toFixed(1);
      const totalGPM = (interpolateGPM(tTot, activeSystem) + continuousGPM).toFixed(1);

      const activeMat = getActiveMaterial().mat;
      const coldVelLimit = customColdVelocity !== null ? customColdVelocity : activeMat.coldMaxVel;
      const hotVelLimit = customHotVelocity !== null ? customHotVelocity : activeMat.hotMaxVel;

      const coldSel = document.getElementById('cold-velocity-select');
      if (coldSel) coldSel.value = coldVelLimit.toFixed(1);
      const coldPipeResult = getPipeRecommendation(coldGPM, false, false, coldVelLimit);
      setTxt('metric-cold-wsfu', tCold.toFixed(1));
      setTxt('metric-cold-gpm', coldGPM + ' GPM');
      setTxt('metric-cold-pipe', coldPipeResult.sizeText);
      setTxt('metric-cold-vel-display', parseFloat(coldGPM) > 0 ? `${coldPipeResult.velocity.toFixed(2)} fps` : '0.0 fps');

      const hotSel = document.getElementById('hot-velocity-select');
      if (hotSel) hotSel.value = hotVelLimit.toFixed(1);
      const hotPipeResult = getPipeRecommendation(hotGPM, true, false, hotVelLimit);
      setTxt('metric-hot-wsfu', tHot.toFixed(1));
      setTxt('metric-hot-gpm', hotGPM + ' GPM');
      setTxt('metric-hot-pipe', hotPipeResult.sizeText);
      setTxt('metric-hot-vel-display', parseFloat(hotGPM) > 0 ? `${hotPipeResult.velocity.toFixed(2)} fps` : '0.0 fps');

      const totalPipeResult = getPipeRecommendation(totalGPM, false, true, coldVelLimit);
      setTxt('metric-total-wsfu', tTot.toFixed(1));
      setTxt('metric-total-gpm', totalGPM + ' GPM');
      setTxt('metric-total-pipe', totalPipeResult.sizeText);
      setTxt('metric-total-vel-display', parseFloat(totalGPM) > 0 ? `${totalPipeResult.velocity.toFixed(2)} fps` : '0.0 fps');

            const calculatedDrainSize = getDrainPipeRecommendation(tDfu, totalWCCount);
      setTxt('metric-dfu', tDfu.toFixed(1));
      setTxt('metric-dfu-pipe', calculatedDrainSize);

      const ventResult = getVentPipeRecommendation(tDfu, totalWCCount, calculatedDrainSize, activeCode);
      setTxt('metric-vent-pipe', ventResult.sizeText);
      setTxt('metric-vent-constraint', ventResult.constraint);

      const drainData = activeDrainType === 'vertical' ? DRAIN_VERTICAL_LIMITS : DRAIN_SLOPE_LIMITS[activeDrainSlope];
      setTxt('metric-slope-label', activeDrainType === 'vertical' ? 'Vertical Stack' : `Horiz. @ ${drainData.shortLabel}`);

      const alertEl = document.getElementById('flushometer-alert');
      if (alertEl) alertEl.classList.toggle('hidden', !hasFlushometer);

      const breakdownBody = document.getElementById('breakdown-table-body');
      if (breakdownBody) {
        breakdownBody.innerHTML = '';
        Object.values(breakdownMap).forEach(b => {
          const tr = document.createElement('tr');
          const share = tTot > 0 ? ((b.total / tTot) * 100).toFixed(1) : '0.0';
          tr.innerHTML = `
            <td class="py-2 px-4 font-bold text-white">${b.label}</td>
            <td class="py-2 px-3 text-center">${b.qty}</td>
            <td class="py-2 px-3 text-center text-slate-400">${b.unitC}/${b.unitH}/${b.unitT}/${b.unitD}</td>
            <td class="py-2 px-4 text-right text-sky-400">${b.cold.toFixed(2)}</td>
            <td class="py-2 px-4 text-right text-rose-400">${b.hot.toFixed(2)}</td>
            <td class="py-2 px-4 text-right font-bold text-white">${b.total.toFixed(2)}</td>
            <td class="py-2 px-4 text-right text-emerald-400">${b.dfu.toFixed(1)}</td>
            <td class="py-2 px-4 text-right text-slate-300 font-bold">${share}%</td>
          `;
          breakdownBody.appendChild(tr);
        });
      }
      updateReferenceCard();
    }

    function updateReferenceCard() {
      const { family, mat } = getActiveMaterial();
      const refMatName = document.getElementById('ref-material-name');
      const refVelBadge = document.getElementById('ref-velocity-badge');
      if (refMatName) refMatName.innerText = `${family.name} (${mat.name})`;

      let coldVel = customColdVelocity !== null ? customColdVelocity : mat.coldMaxVel;
      let hotVel = customHotVelocity !== null ? customHotVelocity : mat.hotMaxVel;
      if (refVelBadge) refVelBadge.innerText = `Limits: Cold ≤ ${coldVel.toFixed(1)} fps | Hot ≤ ${hotVel.toFixed(1)} fps`;

      const coldList = document.getElementById('ref-cold-list');
      const hotList = document.getElementById('ref-hot-list');
      const coldTitle = document.getElementById('ref-cold-title');
      const hotTitle = document.getElementById('ref-hot-title');
      if (coldTitle) coldTitle.innerText = `Cold Water (${mat.badge} - Max ${coldVel.toFixed(1)} fps)`;
      if (hotTitle) hotTitle.innerText = `Hot Water (${mat.badge} - Max ${hotVel.toFixed(1)} fps)`;

      if (coldList) {
        coldList.innerHTML = mat.sizes.map(s => {
          const maxGpm = ((coldVel * s.id * s.id) / 0.4085).toFixed(1);
          return `<div>${s.label} Pipe: <strong class="text-sky-500">${maxGpm} GPM</strong></div>`;
        }).join('');
      }
      if (hotList) {
        hotList.innerHTML = mat.sizes.map(s => {
          const maxGpm = ((hotVel * s.id * s.id) / 0.4085).toFixed(1);
          return `<div>${s.label} Pipe: <strong class="text-rose-500">${maxGpm} GPM</strong></div>`;
        }).join('');
      }

      const drainData = activeDrainType === 'vertical' ? DRAIN_VERTICAL_LIMITS : DRAIN_SLOPE_LIMITS[activeDrainSlope];
      const refDrainSub = document.getElementById('ref-drain-sub');
      if (refDrainSub) {
        refDrainSub.innerText = activeDrainType === 'vertical' ? 'Max DFU capacity for Vertical Stack:' : `Max DFU capacity @ ${drainData.label}:`;
      }
      const drainList = document.getElementById('ref-drain-list');
      if (drainList) {
        drainList.innerHTML = drainData.sizes.map(s => {
          const shortLabel = s.label.split(' ')[0];
          return `<div>${shortLabel} Pipe: <strong class="text-emerald-600">${s.maxDfu} DFU</strong></div>`;
        }).join('');
      }
    }

    // ===================================================================
    