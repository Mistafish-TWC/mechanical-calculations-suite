/**
 * ===================================================================
 * MECHANICAL SYSTEM CALCULATIONS SUITE - TOOL 8
 * Psychrometric Analyzer, AHU Process Modeler & Coil Load Sizer
 * ===================================================================
 * Governing Standards:
 * - ASHRAE Handbook—Fundamentals (Chapter 1: Psychrometrics)
 * - ASHRAE Handbook—Fundamentals (Chapter 14: Climatic Design Information)
 * - Trane Air Conditioning Clinic: Psychrometry (TRG-TRC001-EN)
 * - Legacy McQuay Psychrometric Analyzer v6.8 Reference Parity
 */

// -------------------------------------------------------------------
// 1. ASHRAE CLIMATIC DESIGN DATABASE (MIDWEST & NATIONAL HUBS)
// -------------------------------------------------------------------
const ASHRAE_CITIES = [
  { id: 'des_moines_ia', name: 'Des Moines, IA (DSM)', state: 'IA', elevFt: 958, patm: 14.187, summerDB: 93.0, summerWB: 75.0, winterDB: -7.0, winterWB: -7.8 },
  { id: 'wichita_ks', name: 'Wichita, KS (ICT)', state: 'KS', elevFt: 1332, patm: 13.993, summerDB: 100.0, summerWB: 73.0, winterDB: 7.0, winterWB: 5.5 },
  { id: 'omaha_ne', name: 'Omaha, NE (OMA)', state: 'NE', elevFt: 984, patm: 14.173, summerDB: 94.0, summerWB: 75.0, winterDB: -6.0, winterWB: -6.8 },
  { id: 'cedar_rapids_ia', name: 'Cedar Rapids, IA (CID)', state: 'IA', elevFt: 863, patm: 14.236, summerDB: 91.0, summerWB: 74.0, winterDB: -10.0, winterWB: -10.8 },
  { id: 'st_joseph_mo', name: 'St. Joseph, MO (STJ)', state: 'MO', elevFt: 827, patm: 14.255, summerDB: 95.0, summerWB: 76.0, winterDB: -2.0, winterWB: -3.0 },
  { id: 'kansas_city_mo', name: 'Kansas City, MO (MCI)', state: 'MO', elevFt: 1024, patm: 14.152, summerDB: 96.0, summerWB: 75.0, winterDB: 2.0, winterWB: 0.8 },
  { id: 'quad_cities_ia', name: 'Quad Cities / Davenport, IA (MLI)', state: 'IA', elevFt: 591, patm: 14.380, summerDB: 92.0, summerWB: 75.0, winterDB: -6.0, winterWB: -6.8 },
  { id: 'sioux_city_ia', name: 'Sioux City, IA (SUX)', state: 'IA', elevFt: 1096, patm: 14.115, summerDB: 93.0, summerWB: 74.0, winterDB: -9.0, winterWB: -9.8 },
  { id: 'waterloo_ia', name: 'Waterloo, IA (ALO)', state: 'IA', elevFt: 869, patm: 14.233, summerDB: 91.0, summerWB: 74.0, winterDB: -11.0, winterWB: -11.8 },
  { id: 'dubuque_ia', name: 'Dubuque, IA (DBQ)', state: 'IA', elevFt: 1056, patm: 14.136, summerDB: 89.0, summerWB: 73.0, winterDB: -9.0, winterWB: -9.8 },
  { id: 'lincoln_ne', name: 'Lincoln, NE (LNK)', state: 'NE', elevFt: 1191, patm: 14.066, summerDB: 96.0, summerWB: 74.0, winterDB: -5.0, winterWB: -5.8 },
  { id: 'sioux_falls_sd', name: 'Sioux Falls, SD (FSD)', state: 'SD', elevFt: 1427, patm: 13.944, summerDB: 92.0, summerWB: 73.0, winterDB: -11.0, winterWB: -11.8 },
  { id: 'minneapolis_mn', name: 'Minneapolis / St. Paul, MN (MSP)', state: 'MN', elevFt: 840, patm: 14.248, summerDB: 91.0, summerWB: 73.0, winterDB: -11.0, winterWB: -11.7 },
  { id: 'st_louis_mo', name: 'St. Louis, MO (STL)', state: 'MO', elevFt: 604, patm: 14.373, summerDB: 96.0, summerWB: 76.0, winterDB: 6.0, winterWB: 4.6 },
  { id: 'springfield_mo', name: 'Springfield, MO (SGF)', state: 'MO', elevFt: 1266, patm: 14.027, summerDB: 94.0, summerWB: 74.0, winterDB: 7.0, winterWB: 5.5 },
  { id: 'chicago_il', name: 'Chicago O\'Hare, IL (ORD)', state: 'IL', elevFt: 669, patm: 14.339, summerDB: 92.0, summerWB: 74.0, winterDB: -4.0, winterWB: -4.9 },
  { id: 'madison_wi', name: 'Madison, WI (MSN)', state: 'WI', elevFt: 866, patm: 14.235, summerDB: 89.0, summerWB: 73.0, winterDB: -9.0, winterWB: -9.8 },
  { id: 'denver_co', name: 'Denver, CO (DEN)', state: 'CO', elevFt: 5433, patm: 12.028, summerDB: 95.0, summerWB: 60.0, winterDB: -1.0, winterWB: -2.6 }
];

// -------------------------------------------------------------------
// 2. APPLICATION STATE FOR TOOL 8
// -------------------------------------------------------------------
var tool8State = {
  userModified: false,
  activeTab: 'schematic', // 'schematic' | 'chart' | 'report'

  // Job / Submittal Info
  jobName: 'Commercial AHU-1 Psychrometric Study',
  jobNumber: 'WALD-2026-08',
  systemTag: 'AHU-1 (Main Office VAV)',
  engineerName: '',
  reportNotes: 'Design analysis per ASHRAE Fundamentals Ch. 1. Coil capacities include sensible fan heat gain and adiabatic mass mixing.',

  // Multi-Unit Schedule Manager
  activeUnitIndex: 0,
  savedUnits: [],

  // Weather & Elevation
  seasonMode: 'summer',          // 'summer' | 'winter'
  cityId: 'des_moines_ia',
  useLocalElevation: false,      // false = 14.696 psia Sea Level; true = City Elevation psia
  patm: 14.696,                  // Barometric pressure (psia)
  elevFt: 0,                     // Elevation (ft)
  isWeatherOverridden: false,

  // System Topology & Fan Heat
  fanArrangement: 'draw_through', // 'draw_through' (Coil -> Fan) | 'blow_through' (Fan -> Coil)
  fanDeltaT: 2.0,                 // Supply Fan Sensible Heat Gain (°F)

  // Airflow Network (Bi-Directional OA% <-> OA CFM)
  supplyCFM: 4000,
  oaPct: 15.0,
  oaCFM: 600,
  lastEditedOA: 'pct',            // 'pct' | 'cfm'
  exhaustCFM: 100,
  exfiltrationCFM: 50,

  // Outside Air (OA) State Inputs
  oaDB: 93.0,
  oaInputMode: 'wb',              // 'wb' (°F WB) | 'rh' (%RH)
  oaWB: 74.99,
  oaRH: 43.7,

  // Room Air (RA) State Inputs
  roomDB: 72.0,
  roomInputMode: 'rh',            // 'rh' (%RH) | 'wb' (°F WB)
  roomRH: 50.0,
  roomWB: 60.09,

  // Cooling / Conditioning Coil Leaving Inputs
  coilLeavingDB: 55.0,
  coilAutoWB: true,               // Auto SAH/Twb coil curve solver
  coilInputMode: 'wb',            // 'wb' | 'rh'
  coilLeavingWB: 54.51,
  coilLeavingRH: 97.02,

  // Downstream Reheat (Summer/Winter Dehumidification or Zone Reheat)
  reheatEnabled: false,
  reheatTargetDB: 65.0,

  // Winter Heating & Humidifier Settings
  winterCoilLeavingDB: 65.0,
  humidifierMode: 'steam',        // 'steam' | 'water' | 'none'
  steamTempF: 212.0,              // 212°F -> 1150.6 Btu/lb
  waterTempF: 50.0,               // 50°F -> 18.0 Btu/lb
  winterMatchRoomW: true,         // Auto-humidify to match Room Humidity Ratio

  // Hydronic Coil Delta-T & Target Space Load Verification
  chwDeltaT: 12.0,                // Chilled Water Delta-T (°F)
  hwDeltaT: 20.0,                 // Hot Water Delta-T (°F)
  targetSpaceSensBtuH: 64800,     // Target Room Sensible Load (Btu/h)
  targetSpaceLatBtuH: 12000,      // Target Room Latent Load (Btu/h)

  // UI Layout Toggles
  showMiniChartOnTab1: true,      // Show live Mini-Psychrometric Chart on Tab 1
  showNodeCardsOnTab1: false,     // Collapsible 4-Card Node Inspector Drawer

  // Psychrometric Chart Display Layers
  chartShowRH: true,
  chartShowWB: true,
  chartShowEnthalpy: true,
  chartShowSHR: true,
  chartShowLabels: true,
  chartShowComfortZone: true
};

var lastTool8Results = null;
var psychChartHoverState = null;

// Safe numeric parser that properly preserves 0.0 (avoids falsy 0 || fallback bugs)
function numOr(val, fallback) {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
}

// -------------------------------------------------------------------
// 3. ASHRAE CHAPTER 1 PSYCHROMETRIC MATHEMATICAL ENGINE
// -------------------------------------------------------------------

function calcPatmFromElevation(elevFt) {
  const z = Math.max(-1000, Math.min(30000, numOr(elevFt, 0)));
  return 14.696 * Math.pow(1 - 6.8754e-6 * z, 5.2559);
}

function calcElevationFromPatm(patm) {
  const p = Math.max(5.0, Math.min(16.0, numOr(patm, 14.696)));
  const ratio = Math.pow(p / 14.696, 1 / 5.2559);
  return Math.round((1 - ratio) / 6.8754e-6);
}

function calcSatVaporPressure(tempF) {
  const tF = Math.max(-60, Math.min(200, numOr(tempF, 0)));
  const T = tF + 459.67; // Rankine
  let lnPws;
  if (tF < 32.0) {
    const C1 = -1.0214165e4;
    const C2 = -4.8932428;
    const C3 = -5.3765794e-3;
    const C4 = 1.9202377e-7;
    const C5 = 3.5575832e-10;
    const C6 = -9.0344688e-14;
    const C7 = 4.1635019;
    lnPws = (C1 / T) + C2 + C3 * T + C4 * T * T + C5 * Math.pow(T, 3) + C6 * Math.pow(T, 4) + C7 * Math.log(T);
  } else {
    const C8 = -1.0440397e4;
    const C9 = -1.1294650e1;
    const C10 = -2.7022355e-2;
    const C11 = 1.2890360e-5;
    const C12 = -2.4780681e-9;
    const C13 = 6.5459673;
    lnPws = (C8 / T) + C9 + C10 * T + C11 * T * T + C12 * Math.pow(T, 3) + C13 * Math.log(T);
  }
  return Math.exp(lnPws);
}

function calcSatHumidityRatio(tempF, patm) {
  const pws = calcSatVaporPressure(tempF);
  const pSafe = Math.min(pws, patm * 0.99);
  return 0.621945 * (pSafe / (patm - pSafe));
}

function calcDewPointFromPw(pw) {
  if (!pw || pw <= 1e-6) return -60.0;
  const alpha = Math.log(pw);
  let tdp;
  const tEst = 100.45 + 33.193 * alpha + 2.319 * alpha * alpha + 0.17074 * Math.pow(alpha, 3) + 1.2063 * Math.pow(pw, 0.1984);
  if (tEst < 32.0) {
    tdp = 90.12 + 26.142 * alpha + 0.8927 * alpha * alpha;
  } else {
    tdp = tEst;
  }
  for (let i = 0; i < 5; i++) {
    const f = calcSatVaporPressure(tdp) - pw;
    if (Math.abs(f) < 1e-7) break;
    const df = (calcSatVaporPressure(tdp + 0.01) - calcSatVaporPressure(tdp - 0.01)) / 0.02;
    if (Math.abs(df) > 1e-9) {
      tdp -= f / df;
    }
  }
  return Math.max(-60, Math.min(200, tdp));
}

function calcWFromDBWB(db, wb, patm) {
  const wbClamped = Math.min(db, wb);
  const wsStar = calcSatHumidityRatio(wbClamped, patm);
  let w;
  if (wbClamped >= 32.0) {
    w = ((1093.0 - 0.556 * wbClamped) * wsStar - 0.240 * (db - wbClamped)) /
        (1093.0 + 0.444 * db - wbClamped);
  } else {
    w = ((1220.0 - 0.04 * wbClamped) * wsStar - 0.240 * (db - wbClamped)) /
        (1220.0 + 0.444 * db - 0.48 * wbClamped);
  }
  return Math.max(0.00001, w);
}

function calcWBFromDBW(db, w, patm) {
  const wsAtDB = calcSatHumidityRatio(db, patm);
  if (w >= wsAtDB) return db;

  let low = -60.0;
  let high = db;
  for (let i = 0; i < 32; i++) {
    const mid = 0.5 * (low + high);
    const wEst = calcWFromDBWB(db, mid, patm);
    if (Math.abs(wEst - w) < 1e-7) return mid;
    if (wEst < w) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return 0.5 * (low + high);
}

function calcStateFromDBW(db, wInput, patm) {
  const p = Math.max(8.0, Math.min(16.0, numOr(patm, 14.696)));
  const tdb = Math.max(-50.0, Math.min(160.0, numOr(db, 70.0)));
  const wsMax = calcSatHumidityRatio(tdb, p);
  const w = Math.max(0.00001, Math.min(wsMax, numOr(wInput, 0.0001)));

  const pw = (p * w) / (0.621945 + w);
  const pws = calcSatVaporPressure(tdb);
  const rh = Math.max(0.1, Math.min(100.0, (pw / pws) * 100.0));
  const wb = calcWBFromDBW(tdb, w, p);
  const dp = Math.min(tdb, calcDewPointFromPw(pw));
  const h = 0.240 * tdb + w * (1061.0 + 0.444 * tdb);
  const v = (0.370486 * (tdb + 459.67) * (1.0 + 1.607858 * w)) / p;
  const grains = w * 7000.0;
  const pwInHg = pw * 2.03602;

  return {
    db: tdb,
    wb: wb,
    rh: rh,
    dp: dp,
    h: h,
    w: w,
    grains: grains,
    v: v,
    pw: pw,
    pwInHg: pwInHg,
    pws: pws,
    patm: p
  };
}

function calcStateFromDBWB(db, wb, patm) {
  const tdb = numOr(db, 70.0);
  const twb = Math.min(tdb, numOr(wb, tdb));
  const w = calcWFromDBWB(tdb, twb, patm);
  const st = calcStateFromDBW(tdb, w, patm);
  st.wb = twb;
  return st;
}

function calcStateFromDBRH(db, rhPct, patm) {
  const p = Math.max(8.0, Math.min(16.0, numOr(patm, 14.696)));
  const tdb = numOr(db, 70.0);
  const rh = Math.max(0.5, Math.min(100.0, numOr(rhPct, 50.0)));
  const pws = calcSatVaporPressure(tdb);
  const pw = Math.min(pws * (rh / 100.0), p * 0.99);
  const w = 0.621945 * (pw / (p - pw));
  const st = calcStateFromDBW(tdb, w, p);
  st.rh = rh;
  return st;
}

function solveAutoCoolingCoilState(enteringState, targetLeavingDB, patm) {
  const tEC = enteringState.db;
  const wEC = enteringState.w;
  const tLC = Math.min(tEC, numOr(targetLeavingDB, 55.0));

  if (tLC >= tEC - 0.01) {
    return calcStateFromDBW(tLC, wEC, patm);
  }

  // McQuay v6.8 Auto SAH/Twb coil leaving model:
  // Dehumidifies to 97.02% RH at the leaving coil DB (e.g. 54.51°F WB / 0.008918 lb/lb at 55.0°F DB),
  // and when entering air humidity ratio wEC is lower (e.g. Room 72°F/45% RH or 57°F Coil DB),
  // clamps wLC = wEC in real time because a cooling coil cannot add moisture.
  const stCoilSat = calcStateFromDBRH(tLC, 97.02, patm);
  const wLC = Math.min(wEC, stCoilSat.w);

  return calcStateFromDBW(tLC, wLC, patm);
}

/**
 * Solves Cooling Coil Apparatus Dew Point (ADP) and Coil Bypass Factor (BF)
 * per ASHRAE Fundamentals straight-line coil process model.
 */
function solveCoilADPAndBypassFactor(stateEC, stateLC, patm) {
  const dT = stateEC.db - stateLC.db;
  const dW = stateEC.w - stateLC.w;

  // Sensible-only cooling (no moisture removal)
  if (dT <= 0.05 || dW <= 1e-6) {
    return {
      adpF: stateLC.dp,
      bypassFactor: dT > 0.05 && stateEC.db > stateLC.dp
        ? Math.max(0, Math.min(1, (stateLC.db - stateLC.dp) / (stateEC.db - stateLC.dp)))
        : 0,
      contactFactor: 1.0,
      isSensibleOnly: true,
      adpImpossible: false
    };
  }

  const slope = dW / dT;
  const f = (t) => {
    const wLine = stateLC.w - slope * (stateLC.db - t);
    const wSat = calcSatHumidityRatio(t, patm);
    return wLine - wSat;
  };

  let high = stateLC.db;
  let fHigh = f(high); // >= 0 since stateLC.w <= wSat(stateLC.db)
  if (Math.abs(fHigh) < 1e-6) {
    const bf = (stateLC.db - high) / dT;
    return { adpF: high, bypassFactor: bf, contactFactor: 1 - bf, isSensibleOnly: false, adpImpossible: false };
  }

  // Search downwards from stateLC.db to -20°F for crossing where f(t) <= 0
  let low = null;
  for (let t = stateLC.db - 0.5; t >= -30; t -= 0.5) {
    if (f(t) <= 0) {
      low = t;
      break;
    }
  }

  if (low === null) {
    // Process line is too steep and misses the saturation curve entirely
    return {
      adpF: stateLC.dp,
      bypassFactor: 0,
      contactFactor: 1.0,
      isSensibleOnly: false,
      adpImpossible: true
    };
  }

  let a = low;
  let b = low + 0.5;
  for (let i = 0; i < 28; i++) {
    const mid = 0.5 * (a + b);
    if (f(mid) <= 0) {
      a = mid;
    } else {
      b = mid;
    }
  }
  const adpF = 0.5 * (a + b);
  const bypassFactor = Math.max(0, Math.min(1, (stateLC.db - adpF) / (stateEC.db - adpF)));
  return {
    adpF,
    bypassFactor,
    contactFactor: 1.0 - bypassFactor,
    isSensibleOnly: false,
    adpImpossible: false
  };
}

// -------------------------------------------------------------------
// 4. FULL AHU SYSTEM & COIL SOLVER (SUMMER & WINTER MODES)
// -------------------------------------------------------------------

function calculateTool8() {
  const s = tool8State;
  const patm = Math.max(8.0, Math.min(16.0, numOr(s.patm, 14.696)));

  // 1. Bi-Directional Airflow Balance (Non-destructive to user inputs while typing)
  const supplyCFM = Math.max(50, Math.min(500000, numOr(s.supplyCFM, 4000)));
  let oaCFM, oaPct;

  if (s.lastEditedOA === 'cfm') {
    oaCFM = Math.max(0, Math.min(supplyCFM, numOr(s.oaCFM, 0)));
    oaPct = supplyCFM > 0 ? (oaCFM / supplyCFM) * 100.0 : 0;
    s.oaPct = oaPct;
  } else {
    oaPct = Math.max(0, Math.min(100, numOr(s.oaPct, 0)));
    oaCFM = Math.round((oaPct / 100.0) * supplyCFM);
    s.oaCFM = oaCFM;
  }

  const recircRACFM = Math.max(0, supplyCFM - oaCFM);
  const exhaustCFM = Math.max(0, numOr(s.exhaustCFM, 0));
  const exfilCFM = Math.max(0, numOr(s.exfiltrationCFM, 0));
  const reliefCFM = oaCFM - exhaustCFM - exfilCFM;

  // 2. Outside Air (OA) State (Use local clamped WB so typing DB never clobbers s.oaWB)
  const oaDB = Math.max(-50, Math.min(150, numOr(s.oaDB, 93.0)));
  let stateOA;
  if (s.oaInputMode === 'rh') {
    const oaRH = Math.max(1, Math.min(100, numOr(s.oaRH, 50.0)));
    stateOA = calcStateFromDBRH(oaDB, oaRH, patm);
    s.oaWB = parseFloat(stateOA.wb.toFixed(2));
  } else {
    const effOAWB = Math.min(oaDB, numOr(s.oaWB, 74.99));
    stateOA = calcStateFromDBWB(oaDB, effOAWB, patm);
    s.oaRH = parseFloat(stateOA.rh.toFixed(1));
  }

  // 3. Room / Return Air (RA) State (Use local clamped WB so typing DB never clobbers s.roomWB)
  const roomDB = Math.max(40, Math.min(115, numOr(s.roomDB, 72.0)));
  let stateRA;
  if (s.roomInputMode === 'wb') {
    const effRoomWB = Math.min(roomDB, numOr(s.roomWB, 60.09));
    stateRA = calcStateFromDBWB(roomDB, effRoomWB, patm);
    s.roomRH = parseFloat(stateRA.rh.toFixed(1));
  } else {
    const roomRH = Math.max(5, Math.min(98, numOr(s.roomRH, 50.0)));
    stateRA = calcStateFromDBRH(roomDB, roomRH, patm);
    s.roomWB = parseFloat(stateRA.wb.toFixed(2));
  }

  // 4. Adiabatic Mixing Box (OA + Recirculated RA -> Mixed Air MA)
  const mDotOA_mix = oaCFM / stateOA.v;
  const mDotRA_mix = recircRACFM / stateRA.v;
  const mDotTotal_mix = mDotOA_mix + mDotRA_mix;
  const massFracOA = mDotTotal_mix > 0 ? (mDotOA_mix / mDotTotal_mix) : (oaPct / 100.0);

  const wMA = massFracOA * stateOA.w + (1.0 - massFracOA) * stateRA.w;
  const hMA = massFracOA * stateOA.h + (1.0 - massFracOA) * stateRA.h;
  const dbMA = (hMA - 1061.0 * wMA) / (0.240 + 0.444 * wMA);
  const stateMA = calcStateFromDBW(dbMA, wMA, patm);

  const fanDeltaT = Math.max(0, Math.min(20, numOr(s.fanDeltaT, 0)));

  let stateAfterPreheat = stateMA;
  let stateAfterHumid = stateMA;
  let stateEnteringCoil = stateMA;
  let stateLeavingCoil = stateMA;
  let stateAfterReheat = stateMA;
  let stateSupplyAir = stateMA;

  let preheatBtuH = 0;
  let humidRateLbH = 0;
  let humidEnthalpyBtulb = 0;
  let coolingTotalBtuH = 0;
  let coolingSensibleBtuH = 0;
  let coolingLatentBtuH = 0;
  let coolingTons = 0;
  let coilSHR = 1.0;
  let coilDeltaH = 0.0;
  let coilADP = stateMA.dp;
  let coilBypassFactor = 0.0;
  let adpImpossible = false;
  let condensateLbH = 0;
  let condensateGPH = 0;
  let condensateEnthalpy = 0;
  let reheatBtuH = 0;

  if (s.seasonMode === 'summer') {
    if (s.fanArrangement === 'blow_through') {
      stateEnteringCoil = calcStateFromDBW(stateMA.db + fanDeltaT, stateMA.w, patm);
    } else {
      stateEnteringCoil = stateMA;
    }

    const targetCoilDB = Math.min(stateEnteringCoil.db, numOr(s.coilLeavingDB, 55.0));
    if (s.coilAutoWB) {
      stateLeavingCoil = solveAutoCoolingCoilState(stateEnteringCoil, targetCoilDB, patm);
      s.coilLeavingWB = parseFloat(stateLeavingCoil.wb.toFixed(2));
      s.coilLeavingRH = parseFloat(stateLeavingCoil.rh.toFixed(2));
    } else if (s.coilInputMode === 'rh') {
      stateLeavingCoil = calcStateFromDBRH(targetCoilDB, numOr(s.coilLeavingRH, 95.0), patm);
      if (stateLeavingCoil.w > stateEnteringCoil.w) {
        stateLeavingCoil = calcStateFromDBW(targetCoilDB, stateEnteringCoil.w, patm);
      }
      s.coilLeavingWB = parseFloat(stateLeavingCoil.wb.toFixed(2));
    } else {
      const clampedWB = Math.min(targetCoilDB, numOr(s.coilLeavingWB, targetCoilDB));
      stateLeavingCoil = calcStateFromDBWB(targetCoilDB, clampedWB, patm);
      if (stateLeavingCoil.w > stateEnteringCoil.w) {
        stateLeavingCoil = calcStateFromDBW(targetCoilDB, stateEnteringCoil.w, patm);
      }
      s.coilLeavingRH = parseFloat(stateLeavingCoil.rh.toFixed(2));
    }

    const adpInfo = solveCoilADPAndBypassFactor(stateEnteringCoil, stateLeavingCoil, patm);
    coilADP = adpInfo.adpF;
    coilBypassFactor = adpInfo.bypassFactor;
    adpImpossible = adpInfo.adpImpossible;

    let stateBeforeReheat;
    if (s.fanArrangement === 'draw_through') {
      stateBeforeReheat = calcStateFromDBW(stateLeavingCoil.db + fanDeltaT, stateLeavingCoil.w, patm);
    } else {
      stateBeforeReheat = stateLeavingCoil;
    }

    if (s.reheatEnabled && numOr(s.reheatTargetDB, 65.0) > stateBeforeReheat.db) {
      const targetRHDB = numOr(s.reheatTargetDB, 65.0);
      stateAfterReheat = calcStateFromDBW(targetRHDB, stateBeforeReheat.w, patm);
      stateSupplyAir = stateAfterReheat;
    } else {
      stateAfterReheat = stateBeforeReheat;
      stateSupplyAir = stateBeforeReheat;
    }

    const refV = s.fanArrangement === 'draw_through' ? stateLeavingCoil.v : stateEnteringCoil.v;
    const mDotDaHr = (supplyCFM * 60.0) / refV;

    const deltaW = Math.max(0, stateEnteringCoil.w - stateLeavingCoil.w);
    condensateLbH = mDotDaHr * deltaW;
    condensateGPH = condensateLbH / 8.335;
    condensateEnthalpy = Math.max(0, 1.005 * (stateLeavingCoil.db - 32.0));

    const deltaH = Math.max(0, (stateEnteringCoil.h - stateLeavingCoil.h) - deltaW * condensateEnthalpy);
    coilDeltaH = Math.max(0, stateEnteringCoil.h - stateLeavingCoil.h);
    coolingTotalBtuH = mDotDaHr * deltaH;
    coolingTons = coolingTotalBtuH / 12000.0;

    const hSensIntermediate = 0.240 * stateEnteringCoil.db + stateLeavingCoil.w * (1061.0 + 0.444 * stateEnteringCoil.db);
    coolingSensibleBtuH = Math.min(coolingTotalBtuH, Math.max(0, mDotDaHr * (hSensIntermediate - stateLeavingCoil.h)));
    coolingLatentBtuH = Math.max(0, coolingTotalBtuH - coolingSensibleBtuH);
    coilSHR = coolingTotalBtuH > 1 ? (coolingSensibleBtuH / coolingTotalBtuH) : 1.0;

    if (s.reheatEnabled && stateSupplyAir.db > stateBeforeReheat.db) {
      reheatBtuH = mDotDaHr * (stateSupplyAir.h - stateBeforeReheat.h);
    }

  } else {
    const targetWinterDB = numOr(s.winterCoilLeavingDB, 65.0);
    let targetW = stateMA.w;
    if (s.winterMatchRoomW && s.humidifierMode !== 'none') {
      targetW = Math.max(stateMA.w, stateRA.w);
    } else if (!s.winterMatchRoomW && s.humidifierMode !== 'none') {
      const manualSt = s.coilInputMode === 'rh'
        ? calcStateFromDBRH(targetWinterDB, numOr(s.coilLeavingRH, 40.0), patm)
        : calcStateFromDBWB(targetWinterDB, Math.min(targetWinterDB, numOr(s.coilLeavingWB, 50.0)), patm);
      targetW = Math.max(stateMA.w, manualSt.w);
    }

    stateLeavingCoil = calcStateFromDBW(targetWinterDB, targetW, patm);
    if (s.winterMatchRoomW || s.coilInputMode === 'rh') {
      s.coilLeavingWB = parseFloat(stateLeavingCoil.wb.toFixed(2));
    }
    if (s.winterMatchRoomW || s.coilInputMode === 'wb') {
      s.coilLeavingRH = parseFloat(stateLeavingCoil.rh.toFixed(2));
    }

    let stateBeforeReheat;
    if (s.fanArrangement === 'draw_through') {
      stateBeforeReheat = calcStateFromDBW(stateLeavingCoil.db + fanDeltaT, stateLeavingCoil.w, patm);
      stateEnteringCoil = stateLeavingCoil;
    } else {
      stateBeforeReheat = stateLeavingCoil;
      stateEnteringCoil = calcStateFromDBW(stateLeavingCoil.db - fanDeltaT, stateLeavingCoil.w, patm);
    }

    const mDotDaHr = (supplyCFM * 60.0) / stateLeavingCoil.v;

    if (s.reheatEnabled && numOr(s.reheatTargetDB, 65.0) > stateBeforeReheat.db) {
      const targetRHDB = numOr(s.reheatTargetDB, 65.0);
      stateAfterReheat = calcStateFromDBW(targetRHDB, stateBeforeReheat.w, patm);
      stateSupplyAir = stateAfterReheat;
      reheatBtuH = mDotDaHr * (stateSupplyAir.h - stateBeforeReheat.h);
    } else {
      stateAfterReheat = stateBeforeReheat;
      stateSupplyAir = stateBeforeReheat;
    }

    const deltaW_hum = Math.max(0, stateLeavingCoil.w - stateMA.w);
    if (s.humidifierMode === 'steam') {
      const tSteam = numOr(s.steamTempF, 212.0);
      humidEnthalpyBtulb = 1061.0 + 0.4226 * tSteam;
      humidRateLbH = mDotDaHr * deltaW_hum;
    } else if (s.humidifierMode === 'water') {
      const tWater = numOr(s.waterTempF, 50.0);
      humidEnthalpyBtulb = Math.max(0, 1.00 * (tWater - 32.0));
      humidRateLbH = mDotDaHr * deltaW_hum;
    } else {
      humidEnthalpyBtulb = 0;
      humidRateLbH = 0;
    }

    const hBeforeHeating = s.fanArrangement === 'blow_through'
      ? calcStateFromDBW(stateMA.db + fanDeltaT, stateMA.w, patm).h
      : stateMA.h;

    const totalEnthalpyNeeded = mDotDaHr * (stateLeavingCoil.h - hBeforeHeating);
    const humidHeatContribution = humidRateLbH * humidEnthalpyBtulb;
    preheatBtuH = Math.max(0, totalEnthalpyNeeded - humidHeatContribution);
    coilDeltaH = Math.max(0, stateLeavingCoil.h - hBeforeHeating);

    const hAfterPreheat = hBeforeHeating + (mDotDaHr > 0 ? preheatBtuH / mDotDaHr : 0);
    const dbAfterPreheat = (hAfterPreheat - 1061.0 * stateMA.w) / (0.240 + 0.444 * stateMA.w);
    stateAfterPreheat = calcStateFromDBW(dbAfterPreheat, stateMA.w, patm);
    stateAfterHumid = stateLeavingCoil;
  }

  // 5. Space / Room Sensible, Latent & Total Load Calculations
  const mDotRoomHr = (supplyCFM * 60.0) / stateSupplyAir.v;
  const cpmSA = 0.240 + 0.444 * stateSupplyAir.w;
  const roomSensibleMassBtuH = mDotRoomHr * cpmSA * (stateRA.db - stateSupplyAir.db);
  const roomSensibleBtuH = 1.08 * supplyCFM * (stateRA.db - stateSupplyAir.db); // Standard 1.08 reference for McQuay parity
  const roomLatentSignedBtuH = mDotRoomHr * 1076.0 * (stateRA.w - stateSupplyAir.w);
  const roomLatentBtuH = Math.max(0, roomLatentSignedBtuH);
  const roomTotalBtuH = roomSensibleBtuH >= 0
    ? (roomSensibleBtuH + roomLatentBtuH)
    : Math.abs(roomSensibleBtuH);
  const roomTons = roomTotalBtuH / 12000.0;
  const roomSHR = (roomSensibleBtuH > 0 && roomTotalBtuH > 1)
    ? (roomSensibleBtuH / roomTotalBtuH)
    : 1.0;

  const chwDeltaT = Math.max(4.0, numOr(s.chwDeltaT, 12.0));
  const hwDeltaT = Math.max(5.0, numOr(s.hwDeltaT, 20.0));
  const chwGPM = coolingTotalBtuH > 0 ? coolingTotalBtuH / (500.0 * chwDeltaT) : 0;
  const preheatGPM = preheatBtuH > 0 ? preheatBtuH / (500.0 * hwDeltaT) : 0;
  const reheatGPM = reheatBtuH > 0 ? reheatBtuH / (500.0 * hwDeltaT) : 0;
  const totalHeatingBtuH = preheatBtuH + reheatBtuH;
  const hwGPM = totalHeatingBtuH > 0 ? totalHeatingBtuH / (500.0 * hwDeltaT) : 0;

  // 6. Automated Engineering Diagnostics & Empathy Warnings
  const diagnostics = [];
  if (s.seasonMode === 'summer' && stateSupplyAir.w > stateRA.w + 0.0001) {
    diagnostics.push({
      level: 'amber',
      icon: 'fa-droplet-slash',
      title: 'Space Latent Reversal (Supply Air Wetter Than Room Setpoint)',
      msg: `Supply Air moisture (${stateSupplyAir.grains.toFixed(1)} gr/lb, ${stateSupplyAir.dp.toFixed(1)}°F DP) exceeds Room setpoint (${stateRA.grains.toFixed(1)} gr/lb, ${stateRA.dp.toFixed(1)}°F DP). Lower Coil Leaving DB below ${stateRA.dp.toFixed(1)}°F to dehumidify the space.`
    });
  }
  if (stateMA.db <= 35.0 && preheatBtuH < 100) {
    diagnostics.push({
      level: 'rose',
      icon: 'fa-icicles',
      title: 'Hydronic Coil Freeze Protection Alert (MA ≤ 35°F)',
      msg: `Mixed Air is ${stateMA.db.toFixed(1)}°F entering the AHU without active preheat. Specify a preheat coil, glycol loop, or low-limit freeze-stat.`
    });
  }
  if (s.seasonMode === 'winter' && s.humidifierMode !== 'none' && stateLeavingCoil.rh >= 90.0) {
    diagnostics.push({
      level: 'amber',
      icon: 'fa-cloud-Showers-heavy',
      title: 'High Duct Relative Humidity Warning (≥ 90% RH)',
      msg: `Leaving humidifier relative humidity is ${stateLeavingCoil.rh.toFixed(1)}% RH at ${stateLeavingCoil.db.toFixed(1)}°F DB. Increase preheat/discharge DB to prevent duct condensation on downstream filters or lining.`
    });
  }
  if (reliefCFM < 0) {
    diagnostics.push({
      level: 'rose',
      icon: 'fa-wind',
      title: `Negative Building Pressurization (${Math.round(reliefCFM)} CFM Deficit)`,
      msg: `Room Exhaust (${Math.round(exhaustCFM)} CFM) + Exfiltration (${Math.round(exfilCFM)} CFM) exceeds Outside Air intake (${Math.round(oaCFM)} CFM), inducing ${Math.round(Math.abs(reliefCFM))} CFM of unconditioned infiltration.`
    });
  }
  if (s.seasonMode === 'summer' && !s.coilAutoWB && adpImpossible) {
    diagnostics.push({
      level: 'rose',
      icon: 'fa-triangle-exclamation',
      title: 'Physically Unachievable Coil Process Line (No Saturation ADP)',
      msg: `The manual coil leaving condition (${stateLeavingCoil.db.toFixed(1)}°F DB / ${stateLeavingCoil.wb.toFixed(2)}°F WB) is too dry to intersect the saturation curve without desiccant or overcooling + reheat.`
    });
  }

  lastTool8Results = {
    patm,
    supplyCFM,
    oaPct,
    oaCFM,
    recircRACFM,
    exhaustCFM,
    exfilCFM,
    reliefCFM,
    massFracOA,
    fanDeltaT,
    diagnostics,
    states: {
      OA: stateOA,
      RA: stateRA,
      MA: stateMA,
      Preheat: stateAfterPreheat,
      EC: stateEnteringCoil,
      LC: stateLeavingCoil,
      Reheat: stateAfterReheat,
      SA: stateSupplyAir
    },
    loads: {
      preheatBtuH,
      humidRateLbH,
      humidRateGPH: humidRateLbH / 8.335,
      humidEnthalpyBtulb,
      coolingTotalBtuH,
      coolingSensibleBtuH,
      coolingLatentBtuH,
      coolingTons,
      coilSHR,
      coilDeltaH,
      coilADP,
      coilBypassFactor,
      adpImpossible,
      condensateLbH,
      condensateGPH,
      condensateEnthalpy,
      reheatBtuH,
      roomSensibleBtuH,
      roomSensibleMassBtuH,
      roomLatentSignedBtuH,
      roomLatentBtuH,
      roomTotalBtuH,
      roomTons,
      roomSHR,
      chwGPM,
      preheatGPM,
      reheatGPM,
      hwGPM
    }
  };

  updateTool8DOM(lastTool8Results);
  drawPsychrometricChart('psychChartCanvas', false);
  if (s.showMiniChartOnTab1) {
    drawPsychrometricChart('psychMiniChartCanvas', false);
  }
  updateTool8SubmittalPreview();
}

// -------------------------------------------------------------------
// 5. DOM UPDATER & INTERACTIVE CONTROLS (SCHEMATIC + CARDS + TABLE)
// -------------------------------------------------------------------

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function setElHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setInputValIfNotFocused(id, val) {
  const el = document.getElementById(id);
  if (el && document.activeElement !== el) {
    el.value = val;
  }
}

function updateTool8DOM(res) {
  if (!res) return;
  const s = tool8State;
  const st = res.states;
  const ld = res.loads;

  // 1. Sync Top Toolbar & Tab 2 Quick-Adjust Inputs
  setInputValIfNotFocused('psychPatmInput', res.patm.toFixed(3));
  setInputValIfNotFocused('psychFanDeltaTInput', res.fanDeltaT.toFixed(1));
  setInputValIfNotFocused('psychSupplyCFMInput', Math.round(res.supplyCFM));
  setInputValIfNotFocused('psychOAPctInput', parseFloat(res.oaPct.toFixed(1)));
  setInputValIfNotFocused('psychOACFMInput', Math.round(res.oaCFM));
  setInputValIfNotFocused('psychExhaustCFMInput', Math.round(res.exhaustCFM));
  setInputValIfNotFocused('psychExfilCFMInput', Math.round(res.exfilCFM));

  // Sync Tab 2 Quick-Adjust Strip
  setInputValIfNotFocused('chartQuickOAPct', parseFloat(res.oaPct.toFixed(1)));
  setInputValIfNotFocused('chartQuickOADB', st.OA.db.toFixed(1));
  setInputValIfNotFocused('chartQuickRoomDB', st.RA.db.toFixed(1));
  setInputValIfNotFocused('chartQuickRoomRH', st.RA.rh.toFixed(1));
  const activeCoilDB = s.seasonMode === 'summer' ? s.coilLeavingDB : s.winterCoilLeavingDB;
  setInputValIfNotFocused('chartQuickCoilDB', numOr(activeCoilDB, 55.0).toFixed(1));
  setInputValIfNotFocused('chartQuickSupplyCFM', Math.round(res.supplyCFM));

  // Sync Hydronic GPM & Target Space Load Inputs (Tab 1 & Tab 3)
  setInputValIfNotFocused('psychCHWDeltaTInput', numOr(s.chwDeltaT, 12.0).toFixed(1));
  setInputValIfNotFocused('psychHWDeltaTInput', numOr(s.hwDeltaT, 20.0).toFixed(1));
  setInputValIfNotFocused('tab1CHWDeltaTInput', numOr(s.chwDeltaT, 12.0).toFixed(1));
  setInputValIfNotFocused('tab1HWDeltaTInput', numOr(s.hwDeltaT, 20.0).toFixed(1));
  setInputValIfNotFocused('tab1TargetSensInput', Math.round(numOr(s.targetSpaceSensBtuH, 64800)));
  setInputValIfNotFocused('tab1TargetLatInput', Math.round(numOr(s.targetSpaceLatBtuH, 12000)));
  setInputValIfNotFocused('psychSystemTagInput', s.systemTag || 'AHU-1');
  setInputValIfNotFocused('tab1SystemTagInput', s.systemTag || 'AHU-1');

  // 2. Sync McQuay Visual Schematic Inputs & Readouts
  setInputValIfNotFocused('mcqPatmInput', res.patm.toFixed(3));
  setInputValIfNotFocused('mcqOAPctInput', parseFloat(res.oaPct.toFixed(1)));
  setInputValIfNotFocused('mcqOACFMInput', Math.round(res.oaCFM));
  setInputValIfNotFocused('mcqExhaustCFMInput', Math.round(res.exhaustCFM));
  setInputValIfNotFocused('mcqExfilCFMInput', Math.round(res.exfilCFM));
  setInputValIfNotFocused('mcqSupplyCFMInputDT', Math.round(res.supplyCFM));
  setInputValIfNotFocused('mcqSupplyCFMInputBT', Math.round(res.supplyCFM));

  const reliefEl = document.getElementById('mcqReliefCFM');
  if (reliefEl) {
    reliefEl.innerText = `${Math.round(res.reliefCFM)} cfm`;
    reliefEl.className = res.reliefCFM < 0
      ? 'text-sm font-extrabold mono text-rose-400'
      : 'text-sm font-extrabold mono';
  }
  setElText('mcqRecircCFM', `${Math.round(res.recircRACFM)} cfm`);
  setElText('mcqRAReadoutDB', `${st.RA.db.toFixed(1)}°F`);
  setElText('mcqRAReadoutRH', `${st.RA.rh.toFixed(1)} %RH`);
  setElHTML('mcqRAReadoutList', `
    <div>${st.RA.h.toFixed(4)} Btu/lb</div>
    <div>${st.RA.w.toFixed(6)} lb(w)/lb <span class="mcq-sub-accent">(${st.RA.grains.toFixed(1)} gr)</span></div>
    <div>${st.RA.v.toFixed(5)} ft³/lb</div>
  `);

  // OA Inputs & Readouts on Visual Schematic + Card
  setInputValIfNotFocused('mcqOADBInput', st.OA.db.toFixed(1));
  setInputValIfNotFocused('psychOADBInput', st.OA.db.toFixed(1));
  const oaSecVal = s.oaInputMode === 'rh' ? st.OA.rh.toFixed(1) : st.OA.wb.toFixed(2);
  setInputValIfNotFocused('mcqOASecInput', oaSecVal);
  setInputValIfNotFocused('psychOASecInput', oaSecVal);

  const oaModeLabel = s.oaInputMode === 'rh' ? '%RH ⇄' : '°F wb ⇄';
  setElText('mcqOAModeBtn', oaModeLabel);
  setElText('psychOAModeToggleBtn', oaModeLabel);

  setElHTML('mcqOAReadoutList', `
    <div>${st.OA.h.toFixed(3)} Btu/lb</div>
    <div>${st.OA.w.toFixed(6)} lb(w)/lb <span class="mcq-sub-accent">(${st.OA.grains.toFixed(1)} gr)</span></div>
    <div>${st.OA.v.toFixed(5)} ft³/lb</div>
    <div>${s.oaInputMode === 'rh' ? st.OA.wb.toFixed(2) + '°F wb' : st.OA.rh.toFixed(1) + ' %RH'}</div>
    <div>${st.OA.dp.toFixed(1)}°F dp | ${st.OA.pw.toFixed(3)} psia</div>
  `);

  // Mixed Air Readout on Visual Schematic
  setElText('mcqMADB', `${st.MA.db.toFixed(2)}°F`);
  setElHTML('mcqMAReadoutList', `
    <div>${st.MA.h.toFixed(4)} Btu/lb</div>
    <div>${st.MA.w.toFixed(6)} lb(w)/lb <span class="mcq-sub-accent">(${st.MA.grains.toFixed(1)} gr)</span></div>
    <div>${st.MA.v.toFixed(5)} ft³/lb</div>
    <div>${st.MA.wb.toFixed(2)}°F wb (${st.MA.rh.toFixed(1)}% RH)</div>
  `);

  // Heating Coil & Humidifier Callouts on Visual Schematic
  setElText('mcqPreheatBtu', `${Math.round(ld.preheatBtuH).toLocaleString()} Btu/h`);
  setElText('mcqHumidLbH', `${ld.humidRateLbH.toFixed(2)} lb/h`);
  setElText('mcqSteamEnthalpyText', `°F : ${(1061.0 + 0.4226 * numOr(s.steamTempF, 212)).toFixed(1)} Btu/lb`);

  // Sync both Winter Humidifier Radio Groups
  document.querySelectorAll('input[name="psychHumidModeRadio"], input[name="mcqHumidModeRadio"]').forEach(r => {
    r.checked = (r.value === s.humidifierMode);
  });

  // Draw-Through vs Blow-Through Positioning on Visual Schematic
  const mcqBTFanGroup = document.getElementById('mcqBlowThroughFanGroup');
  const mcqDTFanGroup = document.getElementById('mcqDrawThroughFanGroup');
  if (s.fanArrangement === 'blow_through') {
    if (mcqBTFanGroup) mcqBTFanGroup.classList.remove('hidden');
    if (mcqDTFanGroup) mcqDTFanGroup.classList.add('hidden');
    setElText('mcqBTFanDB', `${st.EC.db.toFixed(2)}°F`);
    setElHTML('mcqBTFanList', `
      <div>${st.EC.h.toFixed(3)} Btu/lb</div>
      <div>${st.EC.v.toFixed(5)} ft³/lb</div>
    `);
  } else {
    if (mcqBTFanGroup) mcqBTFanGroup.classList.add('hidden');
    if (mcqDTFanGroup) mcqDTFanGroup.classList.remove('hidden');
    const stAfterDTFan = calcStateFromDBW(st.LC.db + res.fanDeltaT, st.LC.w, res.patm);
    setElText('mcqDTFanDB', `${stAfterDTFan.db.toFixed(1)}°F`);
    setElHTML('mcqDTFanList', `
      <div>${stAfterDTFan.h.toFixed(4)} Btu/lb</div>
      <div>${stAfterDTFan.v.toFixed(5)} ft³/lb</div>
    `);
  }

  // Cooling Coil Callout & Inputs on Visual Schematic
  if (s.seasonMode === 'summer') {
    setElHTML('mcqCoolingCalloutTop', `
      <div class="font-extrabold">${ld.coolingTons.toFixed(1)} ton</div>
      <div class="font-bold">${Math.round(ld.coolingTotalBtuH).toLocaleString()} Btu/h</div>
      <div class="text-[10px] font-bold">Δh: ${ld.coilDeltaH.toFixed(2)} Btu/lb</div>
      ${ld.condensateLbH > 0.05 ? `<div class="text-[10px]">${ld.condensateLbH.toFixed(1)} lb/h at ${ld.condensateEnthalpy.toFixed(1)} Btu/lb</div>` : ''}
    `);
  } else {
    setElHTML('mcqCoolingCalloutTop', `<div class="font-bold">0 Btu/h</div><div class="text-[10px] font-bold">Δh: ${ld.coilDeltaH.toFixed(2)} Btu/lb</div>`);
  }

  setInputValIfNotFocused('mcqCoilDBInput', numOr(activeCoilDB, 55.0).toFixed(1));
  setInputValIfNotFocused('psychCoilDBInput', numOr(activeCoilDB, 55.0).toFixed(1));

  const coilSecVal = s.coilInputMode === 'rh' ? st.LC.rh.toFixed(2) : st.LC.wb.toFixed(2);
  setInputValIfNotFocused('mcqCoilSecInput', coilSecVal);
  setInputValIfNotFocused('psychCoilSecInput', coilSecVal);

  const isAutoActive = (s.seasonMode === 'summer' && s.coilAutoWB) || (s.seasonMode === 'winter' && s.winterMatchRoomW);
  ['mcqCoilSecInput', 'psychCoilSecInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = false;
      el.classList.remove('opacity-75');
    }
  });
  ['mcqCoilAutoWBCheck', 'psychCoilAutoWBCheck'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = isAutoActive;
  });
  setElText('mcqCoilAutoStatusText', isAutoActive ? 'Auto SAH/Twb' : 'Manual WB/RH (Click Auto)');

  const coilModeLabel = s.coilInputMode === 'rh' ? '%RH ⇄' : '°F wb ⇄';
  setElText('mcqCoilModeBtn', coilModeLabel);
  setElText('psychCoilModeToggleBtn', coilModeLabel);

  const adpLine = s.seasonMode === 'summer'
    ? `<div>Δh ${ld.coilDeltaH.toFixed(2)} Btu/lb | ADP ${ld.coilADP.toFixed(1)}°F | BF ${(ld.coilBypassFactor * 100).toFixed(1)}%</div>`
    : `<div>Δh ${ld.coilDeltaH.toFixed(2)} Btu/lb | ${st.LC.dp.toFixed(1)}°F dp | SHR ${ld.coilSHR.toFixed(2)}</div>`;

  setElHTML('mcqCoilReadoutList', `
    <div>${st.LC.h.toFixed(4)} Btu/lb</div>
    <div>${st.LC.w.toFixed(6)} lb(w)/lb <span class="mcq-sub-accent">(${st.LC.grains.toFixed(1)} gr)</span></div>
    <div>${st.LC.v.toFixed(5)} ft³/lb</div>
    <div>${st.LC.rh.toFixed(2)} %RH • ${st.LC.dp.toFixed(1)}°F dp</div>
    ${adpLine}
  `);

  // Downstream Reheat Node on Visual Schematic
  const mcqReheatGroup = document.getElementById('mcqReheatGroup');
  if (mcqReheatGroup) {
    if (s.reheatEnabled) {
      mcqReheatGroup.classList.remove('hidden');
      setElText('mcqReheatLoadText', `${Math.round(ld.reheatBtuH).toLocaleString()} Btu/h`);
      setElText('mcqReheatOutDB', `${st.SA.db.toFixed(1)}°F`);
      setElText('mcqReheatSubList', `${st.SA.h.toFixed(2)} Btu/lb • ${st.SA.rh.toFixed(1)}% RH`);
    } else {
      mcqReheatGroup.classList.add('hidden');
    }
  }

  // Room Box Inputs & Readouts on Visual Schematic
  setInputValIfNotFocused('mcqRoomDBInput', st.RA.db.toFixed(1));
  setInputValIfNotFocused('psychRoomDBInput', st.RA.db.toFixed(1));
  const roomSecVal = s.roomInputMode === 'wb' ? st.RA.wb.toFixed(2) : st.RA.rh.toFixed(1);
  setInputValIfNotFocused('mcqRoomSecInput', roomSecVal);
  setInputValIfNotFocused('psychRoomSecInput', roomSecVal);

  const roomModeLabel = s.roomInputMode === 'wb' ? '°F wb ⇄' : '%RH ⇄';
  setElText('mcqRoomModeBtn', roomModeLabel);
  setElText('psychRoomModeToggleBtn', roomModeLabel);

  setElHTML('mcqRoomReadoutList', `
    <div>${st.RA.h.toFixed(4)} Btu/lb</div>
    <div>${st.RA.w.toFixed(6)} lb(w)/lb <span class="mcq-sub-accent">(${st.RA.grains.toFixed(1)} gr)</span></div>
    <div>${st.RA.v.toFixed(5)} ft³/lb</div>
    <div>${s.roomInputMode === 'rh' ? st.RA.wb.toFixed(2) + '°F wb' : st.RA.rh.toFixed(1) + ' %RH'}</div>
    <div>${st.RA.dp.toFixed(1)}°F dp</div>
  `);
  setElText('mcqRoomSensibleText', `${Math.round(Math.abs(ld.roomSensibleBtuH)).toLocaleString()} Btu/h Sens`);
  setElText('mcqRoomLatentText', `${Math.round(ld.roomLatentSignedBtuH).toLocaleString()} Btu/h Lat`);

  // Sync Reheat Checkbox & Input
  const reheatCheck = document.getElementById('psychReheatToggle');
  if (reheatCheck) reheatCheck.checked = !!s.reheatEnabled;
  setInputValIfNotFocused('psychReheatDBInput', numOr(s.reheatTargetDB, 65.0).toFixed(1));

  // Update Weather Override Badge
  const weatherBadge = document.getElementById('psychWeatherBadge');
  const cityObj = ASHRAE_CITIES.find(c => c.id === s.cityId) || ASHRAE_CITIES[0];
  if (weatherBadge) {
    if (s.isWeatherOverridden) {
      weatherBadge.className = 'status-pill-amber text-[10px] font-bold px-2 py-0.5 rounded border';
      weatherBadge.innerHTML = `<i class="fa-solid fa-pen"></i> Custom Override *`;
    } else {
      weatherBadge.className = 'status-pill-emerald text-[10px] font-bold px-2 py-0.5 rounded border';
      weatherBadge.innerHTML = `<i class="fa-solid fa-check"></i> ASHRAE (${cityObj.elevFt.toLocaleString()} ft)`;
    }
  }

  // Update Top 4 KPI Cards
  if (s.seasonMode === 'summer') {
    setElText('kpiCard1Title', 'Cooling Coil Total Capacity');
    setElText('kpiCard1Main', `${ld.coolingTons.toFixed(1)} Tons`);
    setElHTML('kpiCard1Sub', `<span class="text-sky-400 font-bold mono">${Math.round(ld.coolingTotalBtuH).toLocaleString()} Btu/h</span> • Δh ${ld.coilDeltaH.toFixed(2)} • ~${ld.chwGPM.toFixed(1)} GPM`);

    setElText('kpiCard2Title', 'Condensate, SHR & Coil ADP');
    setElText('kpiCard2Main', `${ld.condensateLbH.toFixed(1)} lb/h`);
    setElHTML('kpiCard2Sub', `<span class="text-cyan-400 font-bold mono">${ld.condensateGPH.toFixed(2)} GPH</span> • SHR <span class="font-bold text-white mono">${ld.coilSHR.toFixed(2)}</span> • ADP <span class="font-bold text-emerald-400 mono">${ld.coilADP.toFixed(1)}°F</span>`);
  } else {
    setElText('kpiCard1Title', 'Preheat / Heating Coil Load');
    setElText('kpiCard1Main', `${(ld.preheatBtuH / 1000).toFixed(1)} MBH`);
    setElHTML('kpiCard1Sub', `<span class="text-rose-400 font-bold mono">${Math.round(ld.preheatBtuH).toLocaleString()} Btu/h</span> • Δh ${ld.coilDeltaH.toFixed(2)} • ~${ld.hwGPM.toFixed(1)} GPM`);

    setElText('kpiCard2Title', 'Winter Humidification Load');
    setElText('kpiCard2Main', `${ld.humidRateLbH.toFixed(2)} lb/h`);
    setElHTML('kpiCard2Sub', `<span class="text-teal-400 font-bold mono">${ld.humidRateGPH.toFixed(2)} GPH</span> (${s.humidifierMode.toUpperCase()} @ ${ld.humidEnthalpyBtulb.toFixed(1)} Btu/lb)`);
  }

  setElText('kpiCard3Main', `${Math.round(res.supplyCFM).toLocaleString()} CFM`);
  const pressStatus = res.reliefCFM >= 0
    ? `<span class="text-emerald-400 font-bold">+${Math.round(res.reliefCFM)} CFM Relief</span>`
    : `<span class="text-rose-400 font-bold">⚠️ ${Math.round(res.reliefCFM)} CFM (Neg Press)</span>`;
  setElHTML('kpiCard3Sub', `OA: <span class="font-bold text-white mono">${Math.round(res.oaCFM)}</span> (${res.oaPct.toFixed(0)}%) • ${pressStatus}`);

  const roomSensLabel = ld.roomSensibleBtuH >= 0 ? 'Sens' : 'Heat';
  const roomLatText = ld.roomLatentSignedBtuH >= 0
    ? `Lat: <span class="font-bold text-cyan-400 mono">${(ld.roomLatentBtuH / 1000).toFixed(1)}</span> MBH`
    : `<span class="font-bold text-amber-400 mono">⚠️ +${(Math.abs(ld.roomLatentSignedBtuH) / 1000).toFixed(1)} MBH Wet</span>`;
  setElText('kpiCard4Main', `${Math.round(Math.abs(ld.roomSensibleBtuH)).toLocaleString()} Btu/h`);
  setElHTML('kpiCard4Sub', `${roomSensLabel} • ${roomLatText} • SHR: <span class="font-bold text-violet-400 mono">${ld.roomSHR.toFixed(2)}</span>`);

  // Update Engineering Diagnostics Banner
  const diagContainer = document.getElementById('tool8DiagnosticsBanner');
  if (diagContainer) {
    if (res.diagnostics && res.diagnostics.length > 0) {
      diagContainer.classList.remove('hidden');
      diagContainer.innerHTML = res.diagnostics.map(d => {
        const cls = d.level === 'rose'
          ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
          : 'bg-amber-950/60 border-amber-500/50 text-amber-200';
        const iconCls = d.level === 'rose' ? 'text-rose-400' : 'text-amber-400';
        return `
          <div class="flex items-start gap-2.5 p-2.5 rounded-xl border ${cls} text-xs">
            <i class="fa-solid ${d.icon} ${iconCls} mt-0.5 text-sm"></i>
            <div>
              <span class="font-extrabold">${d.title}:</span>
              <span class="opacity-95 ml-1">${d.msg}</span>
            </div>
          </div>
        `;
      }).join('');
    } else {
      diagContainer.classList.add('hidden');
      diagContainer.innerHTML = '';
    }
  }

  // Update Tab 1 Hydronic & Space Load Verification Bar
  setElText('tab1CHWGPMReadout', `${ld.chwGPM.toFixed(1)} GPM`);
  setElText('tab1HWGPMReadout', `${ld.hwGPM.toFixed(1)} GPM`);
  setElText('tab1CoilDeltaHReadout', `${ld.coilDeltaH.toFixed(2)} Btu/lb`);
  setElText('tab1CoilADPReadout', `${ld.coilADP.toFixed(1)}°F`);
  setElText('tab1CoilBFReadout', `${(ld.coilBypassFactor * 100).toFixed(1)}%`);

  const targetSens = numOr(s.targetSpaceSensBtuH, 64800);
  const targetLat = numOr(s.targetSpaceLatBtuH, 12000);
  const deltaTFanSupply = Math.max(1.0, st.RA.db - st.SA.db);
  const reqCFMForSens = Math.round(targetSens / (1.08 * deltaTFanSupply));
  const sensOk = ld.roomSensibleBtuH >= targetSens * 0.98;
  const latOk = ld.roomLatentSignedBtuH >= targetLat * 0.95;
  setElHTML('tab1SpaceCheckStatus', `
    <div class="flex flex-wrap items-center gap-2 text-[11px] mono">
      <span class="${sensOk ? 'status-pill-emerald' : 'status-pill-amber'} px-2 py-0.5 rounded border font-bold">
        Sens: ${(ld.roomSensibleBtuH / 1000).toFixed(1)} / ${(targetSens / 1000).toFixed(1)} MBH ${sensOk ? '✓' : `(Need ~${reqCFMForSens.toLocaleString()} CFM)`}
      </span>
      <span class="${latOk ? 'status-pill-emerald' : 'status-pill-rose'} px-2 py-0.5 rounded border font-bold">
        Lat: ${(ld.roomLatentSignedBtuH / 1000).toFixed(1)} / ${(targetLat / 1000).toFixed(1)} MBH ${latOk ? '✓' : '⚠️'}
      </span>
    </div>
  `);

  // Update Detailed Node Cards below the Visual Schematic
  setElText('schemReliefCFM', `${Math.round(res.reliefCFM).toLocaleString()} cfm`);
  const reliefBadge = document.getElementById('schemReliefBadge');
  if (reliefBadge) {
    if (res.reliefCFM < 0) {
      reliefBadge.className = 'status-pill-rose text-[10px] font-bold px-2 py-0.5 rounded border';
      reliefBadge.innerText = '⚠️ NEGATIVE PRESSURE';
    } else {
      reliefBadge.className = 'status-pill-emerald text-[10px] font-bold px-2 py-0.5 rounded border';
      reliefBadge.innerText = 'Relief Air Out';
    }
  }

  setElText('schemRecircCFM', `${Math.round(res.recircRACFM).toLocaleString()} cfm`);
  setElText('schemRAReadout', `${st.RA.db.toFixed(1)}°F | ${st.RA.rh.toFixed(1)}% RH | ${st.RA.h.toFixed(2)} Btu/lb | ${st.RA.w.toFixed(5)} lb/lb (${st.RA.grains.toFixed(1)} gr)`);

  setElHTML('schemOADetails', `
    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] mono">
      <span class="text-slate-400">Enthalpy:</span><span class="text-right font-semibold text-white">${st.OA.h.toFixed(3)} Btu/lb</span>
      <span class="text-slate-400">Hum. Ratio:</span><span class="text-right font-semibold text-white">${st.OA.w.toFixed(6)} lb/lb</span>
      <span class="text-slate-400">Grains:</span><span class="text-right font-bold text-violet-400">${st.OA.grains.toFixed(1)} gr/lb</span>
      <span class="text-slate-400">Spec. Vol:</span><span class="text-right text-slate-200">${st.OA.v.toFixed(4)} ft³/lb</span>
      <span class="text-slate-400">${s.oaInputMode === 'rh' ? 'Wet Bulb:' : 'Rel. Hum:'}</span>
      <span class="text-right font-bold text-sky-400">${s.oaInputMode === 'rh' ? st.OA.wb.toFixed(2) + '°F wb' : st.OA.rh.toFixed(1) + ' %RH'}</span>
      <span class="text-slate-400">Dew Point:</span><span class="text-right text-slate-200">${st.OA.dp.toFixed(1)}°F dp</span>
      <span class="text-slate-400">Vapor Press:</span><span class="text-right text-slate-300">${st.OA.pw.toFixed(3)} psia</span>
    </div>
  `);

  setElText('schemMADB', `${st.MA.db.toFixed(2)}°F`);
  setElHTML('schemMADetails', `
    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] mono">
      <span class="text-slate-400">Wet Bulb:</span><span class="text-right font-bold text-emerald-400">${st.MA.wb.toFixed(2)}°F wb</span>
      <span class="text-slate-400">Rel. Hum:</span><span class="text-right text-sky-400 font-semibold">${st.MA.rh.toFixed(1)} %RH</span>
      <span class="text-slate-400">Enthalpy:</span><span class="text-right font-semibold text-white">${st.MA.h.toFixed(4)} Btu/lb</span>
      <span class="text-slate-400">Hum. Ratio:</span><span class="text-right font-semibold text-white">${st.MA.w.toFixed(6)} lb/lb</span>
      <span class="text-slate-400">Grains:</span><span class="text-right font-bold text-violet-400">${st.MA.grains.toFixed(1)} gr/lb</span>
      <span class="text-slate-400">Spec. Vol:</span><span class="text-right text-slate-200">${st.MA.v.toFixed(5)} ft³/lb</span>
      <span class="text-slate-400">Dew Point:</span><span class="text-right text-slate-200">${st.MA.dp.toFixed(1)}°F dp</span>
    </div>
  `);

  setElText('schemPreheatLoad', `${Math.round(ld.preheatBtuH).toLocaleString()} Btu/h`);
  setElText('schemHumidLoad', `${ld.humidRateLbH.toFixed(2)} lb/h`);

  const btFanCard = document.getElementById('schemBlowThroughFanBox');
  const dtFanCard = document.getElementById('schemDrawThroughFanBox');
  if (s.fanArrangement === 'blow_through') {
    if (btFanCard) btFanCard.classList.remove('hidden');
    if (dtFanCard) dtFanCard.classList.add('hidden');
    setElText('schemBTFanLeavingDB', `${st.EC.db.toFixed(2)}°F`);
    setElText('schemBTFanLeavingH', `${st.EC.h.toFixed(3)} Btu/lb`);
    setElText('schemBTFanLeavingV', `${st.EC.v.toFixed(5)} ft³/lb`);
  } else {
    if (btFanCard) btFanCard.classList.add('hidden');
    if (dtFanCard) dtFanCard.classList.remove('hidden');
    setElText('schemDTFanLeavingDB', `${(st.LC.db + res.fanDeltaT).toFixed(1)}°F`);
    const stAfterDTFan = calcStateFromDBW(st.LC.db + res.fanDeltaT, st.LC.w, res.patm);
    setElText('schemDTFanLeavingH', `${stAfterDTFan.h.toFixed(4)} Btu/lb`);
    setElText('schemDTFanLeavingV', `${stAfterDTFan.v.toFixed(5)} ft³/lb`);
  }

  if (s.seasonMode === 'summer') {
    setElText('schemCoolingTons', `${ld.coolingTons.toFixed(1)} ton`);
    setElText('schemCoolingBtu', `${Math.round(ld.coolingTotalBtuH).toLocaleString()} Btu/h`);
    setElText('schemCondensateText', ld.condensateLbH > 0.05
      ? `${ld.condensateLbH.toFixed(1)} lb/h (${ld.condensateGPH.toFixed(2)} GPH) @ ${ld.condensateEnthalpy.toFixed(1)} Btu/lb`
      : `0.0 lb/h (Sensible Only)`);
  } else {
    setElText('schemCoolingTons', `0.0 ton`);
    setElText('schemCoolingBtu', `0 Btu/h (Winter Mode)`);
    setElText('schemCondensateText', `Heating & Humidification Active`);
  }

  setElHTML('schemCoilLeavingDetails', `
    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] mono">
      <span class="text-slate-400">Enthalpy:</span><span class="text-right font-semibold text-white">${st.LC.h.toFixed(4)} Btu/lb</span>
      <span class="text-slate-400">Coil Δh:</span><span class="text-right font-bold text-emerald-400">${ld.coilDeltaH.toFixed(2)} Btu/lb</span>
      <span class="text-slate-400">Hum. Ratio:</span><span class="text-right font-semibold text-white">${st.LC.w.toFixed(6)} lb/lb</span>
      <span class="text-slate-400">Grains:</span><span class="text-right font-bold text-violet-400">${st.LC.grains.toFixed(1)} gr/lb</span>
      <span class="text-slate-400">Spec. Vol:</span><span class="text-right text-slate-200">${st.LC.v.toFixed(5)} ft³/lb</span>
      <span class="text-slate-400">Rel. Hum:</span><span class="text-right font-bold text-sky-400">${st.LC.rh.toFixed(2)} %RH</span>
      <span class="text-slate-400">Dew Point / ADP:</span><span class="text-right text-slate-200">${st.LC.dp.toFixed(1)}°F / ${ld.coilADP.toFixed(1)}°F</span>
      <span class="text-slate-400">Coil SHR / BF:</span><span class="text-right font-bold text-amber-400">${ld.coilSHR.toFixed(2)} / ${(ld.coilBypassFactor * 100).toFixed(1)}%</span>
    </div>
  `);

  const reheatBox = document.getElementById('schemReheatDetailsBox');
  if (reheatBox) {
    if (s.reheatEnabled) {
      reheatBox.classList.remove('hidden');
      setElText('schemReheatBtu', `${Math.round(ld.reheatBtuH).toLocaleString()} Btu/h`);
      setElText('schemReheatSADB', `${st.SA.db.toFixed(1)}°F DB / ${st.SA.wb.toFixed(1)}°F WB (${st.SA.rh.toFixed(1)}% RH)`);
    } else {
      reheatBox.classList.add('hidden');
    }
  }

  setElHTML('schemRoomDetails', `
    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] mono">
      <span class="text-slate-400">Enthalpy:</span><span class="text-right font-semibold text-white">${st.RA.h.toFixed(4)} Btu/lb</span>
      <span class="text-slate-400">Hum. Ratio:</span><span class="text-right font-semibold text-white">${st.RA.w.toFixed(6)} lb/lb</span>
      <span class="text-slate-400">Grains:</span><span class="text-right font-bold text-violet-400">${st.RA.grains.toFixed(1)} gr/lb</span>
      <span class="text-slate-400">Spec. Vol:</span><span class="text-right text-slate-200">${st.RA.v.toFixed(5)} ft³/lb</span>
      <span class="text-slate-400">${s.roomInputMode === 'rh' ? 'Wet Bulb:' : 'Rel. Hum:'}</span>
      <span class="text-right font-bold text-emerald-400">${s.roomInputMode === 'rh' ? st.RA.wb.toFixed(2) + '°F wb' : st.RA.rh.toFixed(1) + ' %RH'}</span>
      <span class="text-slate-400">Dew Point:</span><span class="text-right text-slate-200">${st.RA.dp.toFixed(1)}°F dp</span>
      <span class="text-slate-400">Vapor Press:</span><span class="text-right text-slate-300">${st.RA.pw.toFixed(3)} psia</span>
    </div>
  `);
  setElText('schemRoomSensibleLoad', `${Math.round(Math.abs(ld.roomSensibleBtuH)).toLocaleString()} Sens | ${Math.round(ld.roomLatentSignedBtuH).toLocaleString()} Lat Btu/h`);

  renderMultiUnitTagBar();
  renderStatePointScheduleTable(res);
}

function renderStatePointScheduleTable(res) {
  const tbody = document.getElementById('psychStateTableBody');
  if (!tbody || !res) return;
  const st = res.states;
  const s = tool8State;

  const rows = [
    { code: 'OA', name: 'Outside Air Intake', badge: 'status-pill-sky', cfm: res.oaCFM, state: st.OA },
    { code: 'RA', name: 'Recirculated Return Air', badge: 'status-pill-amber', cfm: res.recircRACFM, state: st.RA },
    { code: 'MA', name: 'Mixed Air (Entering AHU)', badge: 'status-pill-violet', cfm: res.supplyCFM, state: st.MA },
    ...(s.seasonMode === 'winter' && Math.abs(st.Preheat.db - st.MA.db) > 0.05
      ? [{ code: 'PH', name: 'Leaving Preheat Coil', badge: 'status-pill-rose', cfm: res.supplyCFM, state: st.Preheat }]
      : []),
    ...(s.seasonMode === 'summer' || s.fanArrangement === 'blow_through'
      ? [{
          code: 'EC',
          name: s.fanArrangement === 'blow_through' ? 'Entering Coil (Post-Fan)' : 'Entering Cooling Coil',
          badge: 'status-pill-sky',
          cfm: res.supplyCFM,
          state: st.EC
        }]
      : []),
    {
      code: 'LC',
      name: s.seasonMode === 'summer' ? 'Leaving Cooling Coil' : 'Leaving Humidifier / Heating Deck',
      badge: 'status-pill-emerald',
      cfm: res.supplyCFM,
      state: st.LC
    },
    {
      code: 'SA',
      name: s.reheatEnabled ? 'Supply Air (Post-Reheat)' : 'Supply Air (Delivered to Room)',
      badge: 'status-pill-emerald',
      cfm: res.supplyCFM,
      state: st.SA
    }
  ];

  tbody.innerHTML = rows.map(r => `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <td class="p-2.5 font-sans">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold border ${r.badge}">${r.code}</span>
          <span class="font-bold text-white text-xs">${r.name}</span>
        </div>
      </td>
      <td class="p-2.5 text-right font-bold text-slate-200">${Math.round(r.cfm).toLocaleString()}</td>
      <td class="p-2.5 text-right font-bold text-rose-400">${r.state.db.toFixed(2)}°F</td>
      <td class="p-2.5 text-right font-bold text-emerald-400">${r.state.wb.toFixed(2)}°F</td>
      <td class="p-2.5 text-right font-semibold text-sky-400">${r.state.rh.toFixed(1)}%</td>
      <td class="p-2.5 text-right text-slate-200">${r.state.dp.toFixed(1)}°F</td>
      <td class="p-2.5 text-right font-semibold text-white">${r.state.h.toFixed(3)}</td>
      <td class="p-2.5 text-right text-slate-300">${r.state.w.toFixed(6)}</td>
      <td class="p-2.5 text-right font-bold text-violet-400">${r.state.grains.toFixed(1)}</td>
      <td class="p-2.5 text-right text-slate-300">${r.state.v.toFixed(4)}</td>
      <td class="p-2.5 text-right text-slate-300">${r.state.pw.toFixed(3)} <span class="text-[10px] text-slate-400">(${r.state.pwInHg.toFixed(2)}")</span></td>
    </tr>
  `).join('');
}

// -------------------------------------------------------------------
// 6. INTERACTIVE HTML5 PSYCHROMETRIC CHART ENGINE
// -------------------------------------------------------------------

function drawPsychrometricChart(canvasId = 'psychChartCanvas', forceLightForPrint = false) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !lastTool8Results) return;

  const rect = canvas.getBoundingClientRect();
  const cssW = rect.width > 100 ? rect.width : 920;
  const cssH = rect.height > 100 ? rect.height : 540;
  const dpr = window.devicePixelRatio || 1;

  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
  }

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);

  const isLight = forceLightForPrint || document.documentElement.classList.contains('light');
  const patm = lastTool8Results.patm;
  const st = lastTool8Results.states;
  const s = tool8State;

  const minObsDB = Math.min(st.OA.db, st.RA.db, st.LC.db, 20);
  const tMin = minObsDB < 15 ? Math.floor((minObsDB - 5) / 10) * 10 : 20;
  const tMax = Math.max(115, Math.ceil((Math.max(st.OA.db, st.RA.db) + 5) / 10) * 10);
  const wMax = 0.030;

  const padL = 52;
  const padR = 88;
  const padT = 36;
  const padB = 48;
  const plotW = cssW - padL - padR;
  const plotH = cssH - padT - padB;

  const xOfT = (t) => padL + ((t - tMin) / (tMax - tMin)) * plotW;
  const yOfW = (w) => padT + plotH - (Math.max(0, Math.min(wMax, w)) / wMax) * plotH;
  const tOfX = (x) => tMin + ((x - padL) / plotW) * (tMax - tMin);
  const wOfY = (y) => ((padT + plotH - y) / plotH) * wMax;

  ctx.fillStyle = isLight ? '#ffffff' : '#090d16';
  ctx.fillRect(0, 0, cssW, cssH);

  ctx.fillStyle = isLight ? '#f8fafc' : '#0f172a';
  ctx.fillRect(padL, padT, plotW, plotH);

  ctx.save();
  ctx.beginPath();
  ctx.rect(padL, padT, plotW, plotH);
  ctx.clip();

  ctx.beginPath();
  ctx.moveTo(xOfT(tMin), padT);
  for (let t = tMin; t <= tMax; t += 1) {
    const ws = calcSatHumidityRatio(t, patm);
    ctx.lineTo(xOfT(t), yOfW(ws));
  }
  ctx.lineTo(xOfT(tMax), padT);
  ctx.closePath();
  ctx.fillStyle = isLight ? '#f1f5f9' : '#090d16';
  ctx.fill();

  for (let t = Math.ceil(tMin / 5) * 5; t <= tMax; t += 5) {
    const ws = calcSatHumidityRatio(t, patm);
    const x = xOfT(t);
    const yTop = yOfW(Math.min(wMax, ws));
    ctx.beginPath();
    ctx.moveTo(x, padT + plotH);
    ctx.lineTo(x, yTop);
    ctx.strokeStyle = (t % 10 === 0)
      ? (isLight ? 'rgba(100, 116, 139, 0.32)' : 'rgba(148, 163, 184, 0.18)')
      : (isLight ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.08)');
    ctx.lineWidth = (t % 10 === 0) ? 1.0 : 0.6;
    ctx.stroke();
  }

  for (let w = 0.002; w <= wMax; w += 0.002) {
    const y = yOfW(w);
    const tSat = calcDewPointFromPw((patm * w) / (0.621945 + w));
    const xLeft = xOfT(Math.max(tMin, tSat));
    ctx.beginPath();
    ctx.moveTo(xLeft, y);
    ctx.lineTo(padL + plotW, y);
    ctx.strokeStyle = isLight ? 'rgba(100, 116, 139, 0.25)' : 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  if (s.chartShowRH) {
    for (let rh = 10; rh <= 90; rh += 10) {
      ctx.beginPath();
      let started = false;
      for (let t = tMin; t <= tMax; t += 1.5) {
        const pws = calcSatVaporPressure(t);
        const pw = Math.min(pws * (rh / 100.0), patm * 0.99);
        const w = 0.621945 * (pw / (patm - pw));
        if (w <= wMax * 1.02) {
          const x = xOfT(t);
          const y = yOfW(w);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = (rh === 50)
        ? (isLight ? 'rgba(2, 132, 199, 0.55)' : 'rgba(56, 189, 248, 0.42)')
        : (isLight ? 'rgba(2, 132, 199, 0.28)' : 'rgba(56, 189, 248, 0.20)');
      ctx.lineWidth = (rh === 50) ? 1.3 : 0.85;
      ctx.stroke();

      if (rh % 20 === 0 || rh === 50) {
        const tLbl = 82;
        const pws = calcSatVaporPressure(tLbl);
        const pw = pws * (rh / 100.0);
        const wLbl = 0.621945 * (pw / (patm - pw));
        if (wLbl < wMax - 0.002) {
          ctx.fillStyle = isLight ? '#0369a1' : '#38bdf8';
          ctx.font = '600 9px "JetBrains Mono", monospace';
          ctx.fillText(`${rh}%`, xOfT(tLbl) - 8, yOfW(wLbl) - 3);
        }
      }
    }
  }

  if (s.chartShowWB) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    for (let twb = Math.ceil(tMin / 5) * 5; twb <= 90; twb += 5) {
      const wsStar = calcSatHumidityRatio(twb, patm);
      if (wsStar > wMax) continue;
      const tDryZero = twb + ((1093 - 0.556 * twb) * wsStar) / 0.240;
      ctx.beginPath();
      ctx.moveTo(xOfT(twb), yOfW(wsStar));
      ctx.lineTo(xOfT(Math.min(tMax + 20, tDryZero)), yOfW(0));
      ctx.strokeStyle = isLight ? 'rgba(5, 150, 105, 0.35)' : 'rgba(16, 185, 129, 0.25)';
      ctx.lineWidth = (twb % 10 === 0) ? 1.0 : 0.65;
      ctx.stroke();

      if (twb % 10 === 0 && twb >= 30 && twb <= 80) {
        ctx.fillStyle = isLight ? '#047857' : '#34d399';
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.fillText(`${twb}°F WB`, xOfT(twb) + 4, yOfW(wsStar) + 10);
      }
    }
    ctx.restore();
  }

  ctx.beginPath();
  for (let t = tMin; t <= tMax; t += 1) {
    const ws = calcSatHumidityRatio(t, patm);
    const x = xOfT(t);
    const y = yOfW(ws);
    if (t === tMin) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // ASHRAE Standard 55 Comfort Zone Overlay (68.5°F - 79.0°F DB, 30% - 60% RH, W <= 0.012)
  if (s.chartShowComfortZone) {
    ctx.save();
    const czPts = [
      { db: 68.5, w: calcStateFromDBRH(68.5, 30, patm).w },
      { db: 79.0, w: calcStateFromDBRH(79.0, 30, patm).w },
      { db: 77.5, w: Math.min(0.012, calcStateFromDBRH(77.5, 60, patm).w) },
      { db: 67.5, w: Math.min(0.012, calcStateFromDBRH(67.5, 60, patm).w) }
    ];
    ctx.beginPath();
    czPts.forEach((p, idx) => {
      const px = xOfT(p.db);
      const py = yOfW(p.w);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = isLight ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.12)';
    ctx.fill();
    ctx.strokeStyle = isLight ? 'rgba(5, 150, 105, 0.55)' : 'rgba(52, 211, 153, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = isLight ? '#047857' : '#34d399';
    ctx.font = '700 9px "Inter", sans-serif';
    ctx.fillText('ASHRAE 55 Comfort', xOfT(69.2), yOfW(czPts[0].w) - 5);
    ctx.restore();
  }

  if (s.chartShowSHR) {
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(xOfT(st.SA.db), yOfW(st.SA.w));
    ctx.lineTo(xOfT(st.RA.db), yOfW(st.RA.w));
    ctx.strokeStyle = isLight ? '#7c3aed' : '#a78bfa';
    ctx.lineWidth = 2.0;
    ctx.stroke();
    ctx.restore();
  }

  const drawProcessSegment = (ptA, ptB, color, dashed = false, width = 2.6) => {
    const x1 = xOfT(ptA.db), y1 = yOfW(ptA.w);
    const x2 = xOfT(ptB.db), y2 = yOfW(ptB.w);
    if (Math.hypot(x2 - x1, y2 - y1) < 1.5) return;
    ctx.save();
    if (dashed) ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();

    const mx = 0.55 * x2 + 0.45 * x1;
    const my = 0.55 * y2 + 0.45 * y1;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx - 8 * Math.cos(ang - 0.4), my - 8 * Math.sin(ang - 0.4));
    ctx.lineTo(mx - 8 * Math.cos(ang + 0.4), my - 8 * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  drawProcessSegment(st.OA, st.MA, isLight ? '#d97706' : '#fbbf24', true, 2.0);
  drawProcessSegment(st.RA, st.MA, isLight ? '#d97706' : '#fbbf24', true, 2.0);

  if (s.seasonMode === 'summer') {
    if (s.fanArrangement === 'blow_through') {
      drawProcessSegment(st.MA, st.EC, '#f97316', false, 2.5);
    }
    drawProcessSegment(st.EC, st.LC, isLight ? '#0284c7' : '#38bdf8', false, 3.0);
    drawProcessSegment(st.LC, st.SA, '#ef4444', false, 2.5);
  } else {
    drawProcessSegment(st.MA, st.Preheat, '#ef4444', false, 2.8);
    drawProcessSegment(st.Preheat, st.LC, '#14b8a6', false, 2.8);
    drawProcessSegment(st.LC, st.SA, '#f97316', false, 2.4);
  }

  const stateNodes = [
    { key: 'OA', label: `OA (${st.OA.db.toFixed(1)}°F)`, pt: st.OA, color: '#0ea5e9', offset: [8, -10] },
    { key: 'RA', label: `RA (${st.RA.db.toFixed(1)}°F)`, pt: st.RA, color: '#f59e0b', offset: [8, -10] },
    { key: 'MA', label: `MA (${st.MA.db.toFixed(1)}°F)`, pt: st.MA, color: '#a855f7', offset: [8, 14] },
    ...(Math.abs(st.EC.db - st.MA.db) > 0.2 ? [{ key: 'EC', label: `EC (${st.EC.db.toFixed(1)}°F)`, pt: st.EC, color: '#6366f1', offset: [8, -10] }] : []),
    ...(s.seasonMode === 'winter' && Math.abs(st.Preheat.db - st.MA.db) > 0.5 ? [{ key: 'PH', label: `PH (${st.Preheat.db.toFixed(1)}°F)`, pt: st.Preheat, color: '#ef4444', offset: [6, 14] }] : []),
    { key: 'LC', label: `LC (${st.LC.db.toFixed(1)}°F)`, pt: st.LC, color: '#06b6d4', offset: [-68, -10] },
    { key: 'SA', label: `SA (${st.SA.db.toFixed(1)}°F)`, pt: st.SA, color: '#10b981', offset: [8, 15] }
  ];

  stateNodes.forEach(node => {
    const cx = xOfT(node.pt.db);
    const cy = yOfW(node.pt.w);

    ctx.beginPath();
    ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = node.color + '33';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 4.8, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isLight ? '#ffffff' : '#0f172a';
    ctx.stroke();

    if (s.chartShowLabels) {
      const lx = cx + node.offset[0];
      const ly = cy + node.offset[1];
      ctx.font = '700 10.5px "Inter", sans-serif';
      const tw = ctx.measureText(node.label).width;
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(lx - 4, ly - 10, tw + 8, 14, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
      ctx.fillText(node.label, lx, ly);
    }
  });

  if (psychChartHoverState && !forceLightForPrint && canvasId === 'psychChartCanvas') {
    const hx = psychChartHoverState.x;
    const hy = psychChartHoverState.y;
    if (hx >= padL && hx <= padL + plotW && hy >= padT && hy <= padT + plotH) {
      const hDB = tOfX(hx);
      const hW = wOfY(hy);
      const wsMax = calcSatHumidityRatio(hDB, patm);
      if (hW >= 0 && hW <= wsMax * 1.01) {
        const stHover = calcStateFromDBW(hDB, Math.min(hW, wsMax), patm);
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = isLight ? '#475569' : '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx, padT); ctx.lineTo(hx, padT + plotH);
        ctx.moveTo(padL, hy); ctx.lineTo(padL + plotW, hy);
        ctx.stroke();
        ctx.restore();

        const readoutEl = document.getElementById('psychChartHoverReadout');
        if (readoutEl) {
          readoutEl.innerHTML = `
            <span class="text-rose-400 font-bold">DB: ${stHover.db.toFixed(1)}°F</span> •
            <span class="text-emerald-400 font-bold">WB: ${stHover.wb.toFixed(1)}°F</span> •
            <span class="text-sky-400 font-bold">RH: ${stHover.rh.toFixed(1)}%</span> •
            <span>DP: ${stHover.dp.toFixed(1)}°F</span> •
            <span class="text-white font-semibold">h: ${stHover.h.toFixed(2)} Btu/lb</span> •
            <span class="text-violet-400 font-bold">W: ${stHover.w.toFixed(5)} (${stHover.grains.toFixed(1)} gr/lb)</span>
          `;
        }
      }
    }
  }

  ctx.restore();

  ctx.strokeStyle = isLight ? '#cbd5e1' : '#334155';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(padL, padT, plotW, plotH);

  ctx.fillStyle = isLight ? '#334155' : '#94a3b8';
  ctx.font = '600 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  for (let t = Math.ceil(tMin / 10) * 10; t <= tMax; t += 10) {
    const x = xOfT(t);
    ctx.fillText(`${t}°F`, x, padT + plotH + 16);
  }
  ctx.font = '700 11px "Inter", sans-serif';
  ctx.fillStyle = isLight ? '#0f172a' : '#e2e8f0';
  ctx.fillText('Dry-Bulb Temperature (°F)', padL + plotW / 2, cssH - 10);

  ctx.textAlign = 'left';
  ctx.font = '600 9.5px "JetBrains Mono", monospace';
  for (let w = 0; w <= wMax + 0.0001; w += 0.004) {
    const y = yOfW(w);
    const gr = Math.round(w * 7000);
    ctx.fillStyle = isLight ? '#334155' : '#94a3b8';
    ctx.fillText(`${w.toFixed(3)} (${gr}g)`, padL + plotW + 6, y + 3);
  }

  ctx.textAlign = 'left';
  ctx.font = '700 12px "Inter", sans-serif';
  ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
  const modeTitle = s.seasonMode === 'summer' ? 'SUMMER COOLING & DEHUMIDIFICATION' : 'WINTER HEATING & HUMIDIFICATION';
  const fanTitle = s.fanArrangement === 'draw_through' ? 'Draw-Through' : 'Blow-Through';
  ctx.fillText(`ASHRAE Psychrometric Process Chart — ${modeTitle} (${fanTitle}, ${patm.toFixed(3)} psia)`, padL, 22);

  if (s.chartShowSHR && cssW > 520) {
    ctx.save();
    ctx.fillStyle = isLight ? 'rgba(255,255,255,0.94)' : 'rgba(15,23,42,0.88)';
    ctx.strokeStyle = isLight ? '#cbd5e1' : '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(padL + 14, padT + 12, 148, 108, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLight ? '#0f172a' : '#e2e8f0';
    ctx.font = '700 10px "Inter", sans-serif';
    ctx.fillText('SHR & ADP Summary', padL + 24, padT + 27);
    ctx.font = '600 9.5px "JetBrains Mono", monospace';
    ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
    ctx.fillText(`Coil SHR: ${lastTool8Results.loads.coilSHR.toFixed(2)}`, padL + 24, padT + 41);
    ctx.fillStyle = isLight ? '#059669' : '#34d399';
    ctx.fillText(`ADP: ${lastTool8Results.loads.coilADP.toFixed(1)}°F (BF ${(lastTool8Results.loads.coilBypassFactor*100).toFixed(0)}%)`, padL + 24, padT + 54);
    ctx.fillStyle = isLight ? '#7c3aed' : '#a78bfa';
    ctx.fillText(`Room SHR: ${lastTool8Results.loads.roomSHR.toFixed(2)}`, padL + 24, padT + 67);

    const sx = padL + 30, sy = padT + 98;
    ctx.strokeStyle = isLight ? '#94a3b8' : '#475569';
    ctx.beginPath();
    ctx.moveTo(sx, sy); ctx.lineTo(sx + 80, sy);
    ctx.stroke();

    const coilAngle = Math.atan2(yOfW(st.EC.w) - yOfW(st.LC.w), xOfT(st.EC.db) - xOfT(st.LC.db));
    ctx.strokeStyle = isLight ? '#0284c7' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 60 * Math.cos(coilAngle), sy - 60 * Math.sin(Math.abs(coilAngle)) * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// -------------------------------------------------------------------
// 7. ENGINEERED SUBMITTAL REPORT PREVIEW & VECTOR PDF GENERATOR
// -------------------------------------------------------------------

function updateTool8SubmittalPreview() {
  if (!lastTool8Results) return;
  const s = tool8State;
  const res = lastTool8Results;
  const st = res.states;
  const ld = res.loads;

  const projName = document.getElementById('projectNameInput')?.value || s.jobName || 'Commercial AHU Psychrometric Analysis';
  const author = document.getElementById('projectAuthorInput')?.value || s.engineerName || 'Mechanical Engineering Group';
  const cityObj = ASHRAE_CITIES.find(c => c.id === s.cityId) || ASHRAE_CITIES[0];

  setElText('subReportJobName', projName);
  setElText('subReportJobNo', s.jobNumber || 'WALD-2026-08');
  setElText('subReportSystemTag', s.systemTag || 'AHU-1');
  setElText('subReportEngineer', author);
  setElText('subReportDate', new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  setElText('subReportLocation', `${cityObj.name} (${res.patm.toFixed(3)} psia / ${s.useLocalElevation ? cityObj.elevFt + ' ft' : 'Sea Level'})`);
  setElText('subReportMode', `${s.seasonMode.toUpperCase()} MODE • ${s.fanArrangement === 'draw_through' ? 'DRAW-THROUGH FAN' : 'BLOW-THROUGH FAN'} (+${res.fanDeltaT.toFixed(1)}°F Fan Heat)`);
  setElText('subReportNotes', s.reportNotes || '');

  const equipSummaryEl = document.getElementById('subReportEquipSummary');
  if (equipSummaryEl) {
    equipSummaryEl.innerHTML = `
      <div class="grid grid-cols-4 gap-2 text-[11px]">
        <div class="p-2 border border-slate-300 rounded bg-slate-50">
          <div class="text-[9px] font-bold uppercase text-slate-500">Airflow Balance</div>
          <div class="font-bold text-slate-900 mono mt-0.5">Supply: ${Math.round(res.supplyCFM).toLocaleString()} CFM</div>
          <div class="text-[10px] text-slate-700 mono">OA: ${Math.round(res.oaCFM)} CFM (${res.oaPct.toFixed(1)}%)</div>
          <div class="text-[10px] text-slate-700 mono">RA: ${Math.round(res.recircRACFM)} | Rel: ${Math.round(res.reliefCFM)} CFM</div>
        </div>
        <div class="p-2 border border-slate-300 rounded bg-slate-50">
          <div class="text-[9px] font-bold uppercase text-slate-500">Cooling Coil Performance</div>
          <div class="font-bold text-slate-900 mono mt-0.5">${ld.coolingTons.toFixed(2)} Tons (${Math.round(ld.coolingTotalBtuH).toLocaleString()} Btu/h)</div>
          <div class="text-[10px] text-slate-700 mono">Sens: ${(ld.coolingSensibleBtuH/1000).toFixed(1)} / Lat: ${(ld.coolingLatentBtuH/1000).toFixed(1)} MBH</div>
          <div class="text-[10px] text-slate-700 mono">SHR: ${ld.coilSHR.toFixed(2)} | ADP: ${ld.coilADP.toFixed(1)}°F | ~${ld.chwGPM.toFixed(1)} GPM</div>
        </div>
        <div class="p-2 border border-slate-300 rounded bg-slate-50">
          <div class="text-[9px] font-bold uppercase text-slate-500">Heating & Reheat Coils</div>
          <div class="font-bold text-slate-900 mono mt-0.5">Preheat: ${Math.round(ld.preheatBtuH).toLocaleString()} Btu/h</div>
          <div class="text-[10px] text-slate-700 mono">Reheat: ${Math.round(ld.reheatBtuH).toLocaleString()} Btu/h</div>
          <div class="text-[10px] text-slate-700 mono">Est. HW Flow: ${ld.hwGPM.toFixed(1)} GPM</div>
        </div>
        <div class="p-2 border border-slate-300 rounded bg-slate-50">
          <div class="text-[9px] font-bold uppercase text-slate-500">Humidification & Space</div>
          <div class="font-bold text-slate-900 mono mt-0.5">Humid: ${ld.humidRateLbH.toFixed(2)} lb/h (${s.humidifierMode})</div>
          <div class="text-[10px] text-slate-700 mono">Space Sens: ${Math.round(Math.abs(ld.roomSensibleBtuH)).toLocaleString()} Btu/h</div>
          <div class="text-[10px] text-slate-700 mono">Space Lat: ${Math.round(ld.roomLatentSignedBtuH).toLocaleString()} Btu/h (SHR ${ld.roomSHR.toFixed(2)})</div>
        </div>
      </div>
    `;
  }

  const subTableBody = document.getElementById('subReportStateTableBody');
  if (subTableBody) {
    const nodes = [
      { id: 'OA', name: 'Outside Air Intake', cfm: res.oaCFM, pt: st.OA },
      { id: 'RA', name: 'Return Air (Recirc)', cfm: res.recircRACFM, pt: st.RA },
      { id: 'MA', name: 'Mixed Air', cfm: res.supplyCFM, pt: st.MA },
      ...(s.seasonMode === 'winter' && Math.abs(st.Preheat.db - st.MA.db) > 0.05
        ? [{ id: 'PH', name: 'Leaving Preheat Coil', cfm: res.supplyCFM, pt: st.Preheat }]
        : []),
      ...(s.seasonMode === 'summer' || s.fanArrangement === 'blow_through'
        ? [{ id: 'EC', name: 'Entering Coil', cfm: res.supplyCFM, pt: st.EC }]
        : []),
      { id: 'LC', name: 'Leaving Coil', cfm: res.supplyCFM, pt: st.LC },
      { id: 'SA', name: 'Supply Air to Space', cfm: res.supplyCFM, pt: st.SA }
    ];
    subTableBody.innerHTML = nodes.map(n => `
      <tr class="border-b border-slate-300 text-[10px] mono text-slate-900">
        <td class="py-1.5 px-2 font-sans font-bold">${n.id} — ${n.name}</td>
        <td class="py-1.5 px-2 text-right font-bold">${Math.round(n.cfm).toLocaleString()}</td>
        <td class="py-1.5 px-2 text-right font-bold">${n.pt.db.toFixed(2)}</td>
        <td class="py-1.5 px-2 text-right">${n.pt.wb.toFixed(2)}</td>
        <td class="py-1.5 px-2 text-right">${n.pt.rh.toFixed(1)}%</td>
        <td class="py-1.5 px-2 text-right">${n.pt.dp.toFixed(1)}</td>
        <td class="py-1.5 px-2 text-right font-bold">${n.pt.h.toFixed(3)}</td>
        <td class="py-1.5 px-2 text-right">${n.pt.w.toFixed(6)}</td>
        <td class="py-1.5 px-2 text-right font-bold">${n.pt.grains.toFixed(1)}</td>
        <td class="py-1.5 px-2 text-right">${n.pt.v.toFixed(4)}</td>
        <td class="py-1.5 px-2 text-right">${n.pt.pw.toFixed(3)}</td>
      </tr>
    `).join('');
  }

  drawPsychrometricChart('subReportChartCanvas', true);
}

async function exportTool8SubmittalPDF() {
  if (!lastTool8Results) calculateTool8();
  const res = lastTool8Results;
  const st = res.states;
  const ld = res.loads;
  const s = tool8State;

  if (typeof PDFLib === 'undefined') {
    window.print();
    return;
  }

  try {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const black = rgb(0.06, 0.09, 0.16);
    const darkGray = rgb(0.28, 0.33, 0.41);
    const brandBlue = rgb(0.01, 0.41, 0.63);
    const lightBg = rgb(0.95, 0.96, 0.98);
    const borderGray = rgb(0.78, 0.82, 0.88);

    const mx = 36;
    const contentW = 540;
    let y = 748;

    page.drawRectangle({ x: mx, y: y - 24, width: contentW, height: 34, color: brandBlue });
    page.drawText('PSYCHROMETRIC & COIL LOAD ENGINEERING SUBMITTAL', {
      x: mx + 12, y: y - 8, size: 12, font: fontBold, color: rgb(1, 1, 1)
    });
    page.drawText('ASHRAE Fundamentals Ch. 1 • Mechanical System Calculations Suite (v5.00)', {
      x: mx + 12, y: y - 19, size: 7.5, font: fontRegular, color: rgb(0.9, 0.95, 1)
    });
    y -= 38;

    const cityObj = ASHRAE_CITIES.find(c => c.id === s.cityId) || ASHRAE_CITIES[0];
    const projName = document.getElementById('projectNameInput')?.value || s.jobName || 'Commercial AHU Psychrometric Study';
    const author = document.getElementById('projectAuthorInput')?.value || s.engineerName || 'Mechanical Engineering';
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    page.drawRectangle({ x: mx, y: y - 44, width: contentW, height: 44, color: lightBg, borderColor: borderGray, borderWidth: 0.8 });
    page.drawText(`Project: ${projName}`, { x: mx + 8, y: y - 13, size: 8.5, font: fontBold, color: black });
    page.drawText(`Job No: ${s.jobNumber || 'N/A'}`, { x: mx + 290, y: y - 13, size: 8.5, font: fontBold, color: black });
    page.drawText(`Date: ${dateStr}`, { x: mx + 430, y: y - 13, size: 8.5, font: fontRegular, color: black });

    page.drawText(`System Tag: ${s.systemTag || 'AHU-1'}`, { x: mx + 8, y: y - 26, size: 8, font: fontRegular, color: darkGray });
    page.drawText(`Location: ${cityObj.name} (${res.patm.toFixed(3)} psia)`, { x: mx + 170, y: y - 26, size: 8, font: fontRegular, color: darkGray });
    page.drawText(`Engineer: ${author}`, { x: mx + 400, y: y - 26, size: 8, font: fontRegular, color: darkGray });

    const modeDesc = `Operating Mode: ${s.seasonMode.toUpperCase()} | Topology: ${s.fanArrangement === 'draw_through' ? 'Draw-Through (Coil -> Fan)' : 'Blow-Through (Fan -> Coil)'} | Fan Heat: +${res.fanDeltaT.toFixed(1)} °F`;
    page.drawText(modeDesc, { x: mx + 8, y: y - 38, size: 8, font: fontBold, color: brandBlue });
    y -= 56;

    page.drawText('1. AIRFLOW & COIL SIZING SUMMARY', { x: mx, y, size: 9.5, font: fontBold, color: black });
    y -= 6;
    const boxW = (contentW - 12) / 4;
    const drawSummaryCard = (idx, title, line1, line2, line3) => {
      const bx = mx + idx * (boxW + 4);
      page.drawRectangle({ x: bx, y: y - 48, width: boxW, height: 46, borderColor: borderGray, borderWidth: 0.8 });
      page.drawText(title, { x: bx + 6, y: y - 11, size: 7, font: fontBold, color: brandBlue });
      page.drawText(line1, { x: bx + 6, y: y - 22, size: 8.5, font: fontBold, color: black });
      page.drawText(line2, { x: bx + 6, y: y - 32, size: 7.5, font: fontRegular, color: darkGray });
      page.drawText(line3, { x: bx + 6, y: y - 42, size: 7.5, font: fontRegular, color: darkGray });
    };

    drawSummaryCard(0, 'AIRFLOW BALANCE',
      `Supply: ${Math.round(res.supplyCFM).toLocaleString()} CFM`,
      `OA: ${Math.round(res.oaCFM).toLocaleString()} CFM (${res.oaPct.toFixed(1)}%)`,
      `RA: ${Math.round(res.recircRACFM)} | Relief: ${Math.round(res.reliefCFM)} CFM`
    );
    drawSummaryCard(1, 'COOLING COIL LOAD',
      `${ld.coolingTons.toFixed(2)} Tons (${Math.round(ld.coolingTotalBtuH).toLocaleString()} Btu/h)`,
      `Sens: ${(ld.coolingSensibleBtuH/1000).toFixed(1)} / Lat: ${(ld.coolingLatentBtuH/1000).toFixed(1)} MBH`,
      `SHR: ${ld.coilSHR.toFixed(2)} | ADP: ${ld.coilADP.toFixed(1)}°F | ~${ld.chwGPM.toFixed(1)} GPM`
    );
    drawSummaryCard(2, 'HEATING & REHEAT COILS',
      `Preheat: ${Math.round(ld.preheatBtuH).toLocaleString()} Btu/h`,
      `Reheat: ${Math.round(ld.reheatBtuH).toLocaleString()} Btu/h`,
      `Est. Hot Water: ~${ld.hwGPM.toFixed(1)} GPM HW`
    );
    drawSummaryCard(3, 'MOISTURE & SPACE LOAD',
      s.seasonMode === 'summer' ? `Condensate: ${ld.condensateLbH.toFixed(1)} lb/h` : `Humidifier: ${ld.humidRateLbH.toFixed(2)} lb/h`,
      `Space Sens: ${Math.round(Math.abs(ld.roomSensibleBtuH)).toLocaleString()} Btu/h`,
      `Space Lat: ${Math.round(ld.roomLatentSignedBtuH).toLocaleString()} Btu/h (SHR ${ld.roomSHR.toFixed(2)})`
    );
    y -= 62;

    page.drawText('2. PSYCHROMETRIC STATE POINT SCHEDULE', { x: mx, y, size: 9.5, font: fontBold, color: black });
    y -= 6;

    const cols = [
      { label: 'State Point', x: mx + 4 },
      { label: 'CFM', x: mx + 125 },
      { label: 'DB (°F)', x: mx + 165 },
      { label: 'WB (°F)', x: mx + 208 },
      { label: '%RH', x: mx + 250 },
      { label: 'DP (°F)', x: mx + 286 },
      { label: 'h (Btu/lb)', x: mx + 326 },
      { label: 'W (lb/lb)', x: mx + 382 },
      { label: 'Grains', x: mx + 436 },
      { label: 'v (ft³/lb)', x: mx + 474 },
      { label: 'Pw (psia)', x: mx + 510 }
    ];

    page.drawRectangle({ x: mx, y: y - 15, width: contentW, height: 15, color: lightBg, borderColor: borderGray, borderWidth: 0.8 });
    cols.forEach(c => page.drawText(c.label, { x: c.x, y: y - 10, size: 7, font: fontBold, color: black }));
    y -= 15;

    const tableRows = [
      { name: 'OA - Outside Air Intake', cfm: res.oaCFM, pt: st.OA },
      { name: 'RA - Return Air (Recirc)', cfm: res.recircRACFM, pt: st.RA },
      { name: 'MA - Mixed Air', cfm: res.supplyCFM, pt: st.MA },
      ...(s.seasonMode === 'winter' && Math.abs(st.Preheat.db - st.MA.db) > 0.05
        ? [{ name: 'PH - Leaving Preheat Coil', cfm: res.supplyCFM, pt: st.Preheat }]
        : []),
      ...(s.seasonMode === 'summer' || s.fanArrangement === 'blow_through'
        ? [{ name: 'EC - Entering Coil', cfm: res.supplyCFM, pt: st.EC }]
        : []),
      { name: 'LC - Leaving Coil', cfm: res.supplyCFM, pt: st.LC },
      { name: 'SA - Supply Air to Space', cfm: res.supplyCFM, pt: st.SA }
    ];

    tableRows.forEach((r, idx) => {
      const rowY = y - 14;
      page.drawRectangle({
        x: mx, y: rowY, width: contentW, height: 14,
        color: idx % 2 === 1 ? rgb(0.98, 0.98, 0.99) : rgb(1, 1, 1),
        borderColor: borderGray, borderWidth: 0.5
      });
      page.drawText(r.name, { x: cols[0].x, y: rowY + 4, size: 7.5, font: fontBold, color: black });
      page.drawText(Math.round(r.cfm).toLocaleString(), { x: cols[1].x, y: rowY + 4, size: 7.5, font: fontRegular, color: black });
      page.drawText(r.pt.db.toFixed(2), { x: cols[2].x, y: rowY + 4, size: 7.5, font: fontBold, color: black });
      page.drawText(r.pt.wb.toFixed(2), { x: cols[3].x, y: rowY + 4, size: 7.5, font: fontRegular, color: black });
      page.drawText(r.pt.rh.toFixed(1) + '%', { x: cols[4].x, y: rowY + 4, size: 7.5, font: fontRegular, color: black });
      page.drawText(r.pt.dp.toFixed(1), { x: cols[5].x, y: rowY + 4, size: 7.5, font: fontRegular, color: black });
      page.drawText(r.pt.h.toFixed(3), { x: cols[6].x, y: rowY + 4, size: 7.5, font: fontBold, color: black });
      page.drawText(r.pt.w.toFixed(6), { x: cols[7].x, y: rowY + 4, size: 7.5, font: fontRegular, color: black });
      page.drawText(r.pt.grains.toFixed(1), { x: cols[8].x, y: rowY + 4, size: 7.5, font: fontBold, color: black });
      page.drawText(r.pt.v.toFixed(4), { x: cols[9].x, y: rowY + 4, size: 7.5, font: fontRegular, color: black });
      page.drawText(r.pt.pw.toFixed(3), { x: cols[10].x, y: rowY + 4, size: 7.5, font: fontRegular, color: black });
      y -= 14;
    });

    y -= 16;

    page.drawText('3. ASHRAE PSYCHROMETRIC PROCESS CHART', { x: mx, y, size: 9.5, font: fontBold, color: black });
    y -= 8;

    drawPsychrometricChart('subReportChartCanvas', true);
    const chartCanvas = document.getElementById('subReportChartCanvas') || document.getElementById('psychChartCanvas');
    if (chartCanvas) {
      const pngDataUrl = chartCanvas.toDataURL('image/png');
      const pngImage = await pdfDoc.embedPng(pngDataUrl);
      const chartH = 290;
      page.drawRectangle({ x: mx, y: y - chartH, width: contentW, height: chartH, borderColor: borderGray, borderWidth: 1 });
      page.drawImage(pngImage, { x: mx + 2, y: y - chartH + 2, width: contentW - 4, height: chartH - 4 });
      y -= (chartH + 14);
    }

    if (s.reportNotes) {
      page.drawText(`Engineering Notes: ${s.reportNotes.slice(0, 130)}`, { x: mx, y, size: 7.5, font: fontRegular, color: darkGray });
      y -= 14;
    }

    page.drawLine({ start: { x: mx, y: 36 }, end: { x: mx + contentW, y: 36 }, thickness: 0.8, color: borderGray });
    page.drawText('Generated by Mechanical System Calculations Suite (Commercial Engineering Edition) — The Waldinger Corporation', {
      x: mx, y: 24, size: 7.5, font: fontRegular, color: darkGray
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const safeName = (projName || 'Psychrometric_Submittal').replace(/[^a-z0-9_-]/gi, '_');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}_${s.systemTag.replace(/[^a-z0-9_-]/gi, '_')}_Psychrometric_Report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof showToast === 'function') {
      showToast('PDF Submittal Exported', 'Downloaded Engineered Psychrometric & Coil Report PDF!');
    }
  } catch (err) {
    console.error('Error generating Tool 8 PDF:', err);
    window.print();
  }
}

// -------------------------------------------------------------------
// 8. CENTRALIZED UI EVENT HANDLERS & WORKFLOW TOOLS
// -------------------------------------------------------------------

/**
 * Centralized, non-destructive input handler for all Schematic, Card, and Toolbar inputs.
 * Guards against partial keystrokes ("", "-", ".", "-.") so typing multi-digit or negative
 * numbers never clobbers peer fields mid-typing.
 */
function handleTool8Input(field, rawValue) {
  const s = tool8State;

  // Handle text/string fields first (System Tag, Job Number, Report Notes)
  if (field === 'systemTag' || field === 'jobNumber' || field === 'reportNotes') {
    s.userModified = true;
    window.tool8_modified = true;
    s[field] = String(rawValue ?? '');
    if (field === 'systemTag') {
      setInputValIfNotFocused('psychSystemTagInput', s.systemTag);
      setInputValIfNotFocused('tab1SystemTagInput', s.systemTag);
      renderMultiUnitTagBar();
    }
    updateTool8SubmittalPreview();
    return;
  }

  const trimmed = String(rawValue ?? '').trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
    return;
  }
  const num = parseFloat(trimmed);
  if (!Number.isFinite(num)) return;

  s.userModified = true;
  window.tool8_modified = true;

  switch (field) {
    case 'patm':
      s.patm = num;
      s.isWeatherOverridden = true;
      break;
    case 'fanDeltaT':
      s.fanDeltaT = num;
      break;
    case 'supplyCFM':
      s.supplyCFM = num;
      break;
    case 'oaPct':
      s.oaPct = num;
      s.lastEditedOA = 'pct';
      break;
    case 'oaCFM':
      s.oaCFM = num;
      s.lastEditedOA = 'cfm';
      break;
    case 'oaDB':
      s.oaDB = num;
      s.isWeatherOverridden = true;
      break;
    case 'oaSec':
      if (s.oaInputMode === 'rh') s.oaRH = num;
      else s.oaWB = num;
      s.isWeatherOverridden = true;
      break;
    case 'roomDB':
      s.roomDB = num;
      break;
    case 'roomSec':
      if (s.roomInputMode === 'wb') s.roomWB = num;
      else s.roomRH = num;
      break;
    case 'coilDB':
      if (s.seasonMode === 'summer') s.coilLeavingDB = num;
      else s.winterCoilLeavingDB = num;
      break;
    case 'coilSec':
      if (s.seasonMode === 'summer') s.coilAutoWB = false;
      else s.winterMatchRoomW = false;
      if (s.coilInputMode === 'rh') s.coilLeavingRH = num;
      else s.coilLeavingWB = num;
      break;
    case 'exhaustCFM':
      s.exhaustCFM = num;
      break;
    case 'exfilCFM':
    case 'exfiltrationCFM':
      s.exfiltrationCFM = num;
      break;
    case 'reheatDB':
      s.reheatTargetDB = num;
      s.reheatEnabled = true;
      break;
    case 'steamTemp':
    case 'steamTempF':
      s.steamTempF = num;
      break;
    case 'waterTemp':
    case 'waterTempF':
      s.waterTempF = num;
      break;
    case 'chwDeltaT':
      s.chwDeltaT = num;
      break;
    case 'hwDeltaT':
      s.hwDeltaT = num;
      break;
    case 'targetSpaceSens':
    case 'targetSpaceSensBtuH':
    case 'targetRoomSensibleBtuH':
      s.targetSpaceSensBtuH = num;
      break;
    case 'targetSpaceLat':
    case 'targetSpaceLatBtuH':
    case 'targetRoomLatentBtuH':
      s.targetSpaceLatBtuH = num;
      break;
  }

  calculateTool8();
}

function toggleCoilAutoWB(checked) {
  const isChecked = checked !== undefined ? !!checked : true;
  if (tool8State.seasonMode === 'summer') {
    tool8State.coilAutoWB = isChecked;
  } else {
    tool8State.winterMatchRoomW = isChecked;
  }
  ['mcqCoilAutoWBCheck', 'psychCoilAutoWBCheck'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = isChecked;
  });
  tool8State.userModified = true;
  window.tool8_modified = true;
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function restoreCoilAutoWB() {
  toggleCoilAutoWB(true);
}

function setHumidifierMode(mode) {
  tool8State.humidifierMode = mode;
  tool8State.userModified = true;
  window.tool8_modified = true;
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function toggleMiniChartOnTab1() {
  tool8State.showMiniChartOnTab1 = !tool8State.showMiniChartOnTab1;
  const panel = document.getElementById('tab1MiniChartPanel');
  const btn = document.getElementById('btnToggleMiniChart');
  if (panel) panel.classList.toggle('hidden', !tool8State.showMiniChartOnTab1);
  if (btn) {
    btn.innerHTML = tool8State.showMiniChartOnTab1
      ? '<i class="fa-solid fa-eye-slash text-violet-400"></i> Hide Live Mini-Chart'
      : '<i class="fa-solid fa-chart-area text-violet-400"></i> Show Live Mini-Chart';
  }
  if (tool8State.showMiniChartOnTab1) {
    setTimeout(() => drawPsychrometricChart('psychMiniChartCanvas', false), 30);
  }
}

function toggleNodeCardsOnTab1() {
  tool8State.showNodeCardsOnTab1 = !tool8State.showNodeCardsOnTab1;
  const drawer = document.getElementById('tab1NodeCardsDrawer');
  const btn = document.getElementById('btnToggleNodeCards');
  if (drawer) drawer.classList.toggle('hidden', !tool8State.showNodeCardsOnTab1);
  if (btn) {
    btn.innerHTML = tool8State.showNodeCardsOnTab1
      ? '<i class="fa-solid fa-chevron-up text-violet-400"></i> Hide 4-Card Node Inspector'
      : '<i class="fa-solid fa-grip text-violet-400"></i> Show 4-Card Node Inspector';
  }
}

/**
 * Automatically solves for the required Supply CFM (and Leaving Coil DB if needed for latent load)
 * to satisfy the user's Target Space Sensible & Latent Loads.
 */
function solveCFMForTargetSpaceLoad() {
  if (!lastTool8Results) calculateTool8();
  const s = tool8State;
  const st = lastTool8Results.states;

  const targetSens = Math.max(1000, numOr(s.targetSpaceSensBtuH, 64800));
  const targetLat = Math.max(0, numOr(s.targetSpaceLatBtuH, 12000));

  // If Supply Air moisture is wetter than Room and user has a positive space latent load,
  // lower Coil Leaving DB so Supply Air Dew Point can absorb the latent load
  const fanRise = s.fanArrangement === 'draw_through' ? numOr(s.fanDeltaT, 2.0) : 0;
  let supplyDB = st.SA.db;
  if (s.seasonMode === 'summer' && !s.reheatEnabled && st.RA.db - supplyDB < 5.0) {
    s.coilLeavingDB = Math.max(45.0, st.RA.db - 18.0);
    supplyDB = s.coilLeavingDB + fanRise;
  }

  const deltaT = Math.max(4.0, st.RA.db - supplyDB);
  const solvedCFM = Math.round((targetSens / (1.08 * deltaT)) / 25) * 25;
  s.supplyCFM = Math.max(100, Math.min(500000, solvedCFM));

  // Check if Coil Leaving DB needs to be lowered to meet Target Latent Load at solvedCFM
  if (s.seasonMode === 'summer' && targetLat > 0) {
    const mDotEst = (s.supplyCFM * 60.0) / st.SA.v;
    const reqDeltaW = targetLat / (mDotEst * 1076.0);
    const reqW_SA = Math.max(0.003, st.RA.w - reqDeltaW);
    const stAtCurrentCoil = calcStateFromDBRH(s.coilLeavingDB, 97.02, lastTool8Results.patm);
    if (stAtCurrentCoil.w > reqW_SA) {
      // Find DB where 97.02% RH gives reqW_SA
      const reqPw = (lastTool8Results.patm * reqW_SA) / (0.621945 + reqW_SA);
      const reqDP = calcDewPointFromPw(reqPw);
      s.coilLeavingDB = parseFloat(Math.max(42.0, Math.min(s.coilLeavingDB, reqDP + 0.7)).toFixed(1));
      s.coilAutoWB = true;
    }
  }

  s.userModified = true;
  window.tool8_modified = true;
  calculateTool8();
  if (typeof showToast === 'function') {
    showToast('Airflow & Coil Sized for Space Load', `Solved Supply Air = ${s.supplyCFM.toLocaleString()} CFM (Coil DB: ${s.coilLeavingDB}°F).`);
  }
}

// -------------------------------------------------------------------
// MULTI-UNIT AHU SCHEDULE MANAGER (SAVE / SWITCH / DUPLICATE TAGS)
// -------------------------------------------------------------------

const UNIT_SNAPSHOT_KEYS = [
  'systemTag', 'seasonMode', 'cityId', 'useLocalElevation', 'patm', 'elevFt', 'isWeatherOverridden',
  'fanArrangement', 'fanDeltaT', 'supplyCFM', 'oaPct', 'oaCFM', 'lastEditedOA', 'exhaustCFM', 'exfiltrationCFM',
  'oaDB', 'oaInputMode', 'oaWB', 'oaRH', 'roomDB', 'roomInputMode', 'roomRH', 'roomWB',
  'coilLeavingDB', 'coilAutoWB', 'coilInputMode', 'coilLeavingWB', 'coilLeavingRH',
  'reheatEnabled', 'reheatTargetDB', 'winterCoilLeavingDB', 'humidifierMode', 'steamTempF', 'waterTempF',
  'winterMatchRoomW', 'chwDeltaT', 'hwDeltaT', 'targetSpaceSensBtuH', 'targetSpaceLatBtuH'
];

function extractUnitSnapshot(stateObj) {
  const snap = {};
  UNIT_SNAPSHOT_KEYS.forEach(k => { snap[k] = stateObj[k]; });
  return snap;
}

function ensureSavedUnitsInitialized() {
  if (!Array.isArray(tool8State.savedUnits) || tool8State.savedUnits.length === 0) {
    tool8State.savedUnits = [extractUnitSnapshot(tool8State)];
    tool8State.activeUnitIndex = 0;
  }
}

function syncActiveUnitToSchedule() {
  ensureSavedUnitsInitialized();
  const idx = Math.max(0, Math.min(tool8State.savedUnits.length - 1, tool8State.activeUnitIndex || 0));
  tool8State.savedUnits[idx] = extractUnitSnapshot(tool8State);
}

function selectUnitFromSchedule(index) {
  ensureSavedUnitsInitialized();
  syncActiveUnitToSchedule();
  if (index < 0 || index >= tool8State.savedUnits.length) return;
  tool8State.activeUnitIndex = index;
  const snap = tool8State.savedUnits[index];
  UNIT_SNAPSHOT_KEYS.forEach(k => {
    if (snap[k] !== undefined) tool8State[k] = snap[k];
  });
  syncTopControlsFromState();
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function addNewUnitToSchedule() {
  ensureSavedUnitsInitialized();
  syncActiveUnitToSchedule();
  const nextNum = tool8State.savedUnits.length + 1;
  const newSnap = extractUnitSnapshot(tool8State);
  newSnap.systemTag = `AHU-${nextNum} (Zone ${nextNum})`;
  tool8State.savedUnits.push(newSnap);
  tool8State.activeUnitIndex = tool8State.savedUnits.length - 1;
  tool8State.systemTag = newSnap.systemTag;
  tool8State.userModified = true;
  window.tool8_modified = true;
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  if (typeof showToast === 'function') {
    showToast('Added Unit to Schedule', `Created ${newSnap.systemTag} (duplicated from current settings).`);
  }
}

function deleteUnitFromSchedule(index, event) {
  if (event) event.stopPropagation();
  ensureSavedUnitsInitialized();
  if (tool8State.savedUnits.length <= 1) return;
  tool8State.savedUnits.splice(index, 1);
  if (tool8State.activeUnitIndex >= tool8State.savedUnits.length) {
    tool8State.activeUnitIndex = tool8State.savedUnits.length - 1;
  }
  const snap = tool8State.savedUnits[tool8State.activeUnitIndex];
  UNIT_SNAPSHOT_KEYS.forEach(k => {
    if (snap[k] !== undefined) tool8State[k] = snap[k];
  });
  syncTopControlsFromState();
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function renderMultiUnitTagBar() {
  ensureSavedUnitsInitialized();
  syncActiveUnitToSchedule();
  const container = document.getElementById('tool8MultiUnitBar');
  if (!container) return;

  container.innerHTML = tool8State.savedUnits.map((u, idx) => {
    const active = idx === tool8State.activeUnitIndex;
    const cls = active
      ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700';
    const delBtn = tool8State.savedUnits.length > 1
      ? `<span onclick="deleteUnitFromSchedule(${idx}, event)" class="ml-1.5 opacity-70 hover:opacity-100 text-[10px]" title="Remove Unit">✕</span>`
      : '';
    return `
      <button onclick="selectUnitFromSchedule(${idx})" class="px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${cls}">
        <i class="fa-solid fa-fan text-[10px]"></i>
        <span>${u.systemTag || ('AHU-' + (idx + 1))}</span>
        <span class="text-[10px] opacity-80 mono">(${Math.round(u.supplyCFM || 4000)} cfm)</span>
        ${delBtn}
      </button>
    `;
  }).join('');
}

function switchTool8Tab(tab) {
  tool8State.activeTab = tab;
  ['schematic', 'chart', 'report'].forEach(t => {
    const view = document.getElementById('tool8-' + t + '-view');
    const btn = document.getElementById('tab-btn-tool8-' + t);
    if (view) view.classList.toggle('hidden', t !== tab);
    if (btn) {
      if (t === tab) {
        btn.className = 'px-4 py-2.5 rounded-xl font-bold transition-all shadow-md bg-violet-600 text-white flex items-center gap-2 active-tab';
      } else {
        btn.className = 'px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all flex items-center gap-2 inactive-tab-btn';
      }
    }
  });

  if (tab === 'chart') {
    setTimeout(() => drawPsychrometricChart('psychChartCanvas', false), 40);
  } else if (tab === 'report') {
    setTimeout(() => updateTool8SubmittalPreview(), 40);
  } else if (tab === 'schematic' && tool8State.showMiniChartOnTab1) {
    setTimeout(() => drawPsychrometricChart('psychMiniChartCanvas', false), 40);
  }
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function updateSeasonAndFanButtonsDOM() {
  const mode = tool8State.seasonMode;
  const btnSummer = document.getElementById('btnSeasonSummer');
  const btnWinter = document.getElementById('btnSeasonWinter');
  if (btnSummer && btnWinter) {
    if (mode === 'summer') {
      btnSummer.className = 'flex-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow transition flex items-center justify-center gap-1.5 active-season-btn';
      btnWinter.className = 'flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 inactive-seg-btn';
    } else {
      btnWinter.className = 'flex-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 text-white shadow transition flex items-center justify-center gap-1.5 active-season-btn';
      btnSummer.className = 'flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 inactive-seg-btn';
    }
  }

  const winterPanel = document.getElementById('winterHumidifierPanel');
  const mcqHumidBox = document.getElementById('mcqWinterHumidifierBox');
  if (winterPanel) winterPanel.classList.toggle('hidden', mode !== 'winter');
  if (mcqHumidBox) mcqHumidBox.classList.toggle('hidden', mode !== 'winter');

  const arr = tool8State.fanArrangement;
  const btnDT = document.getElementById('btnFanDrawThrough');
  const btnBT = document.getElementById('btnFanBlowThrough');
  if (btnDT && btnBT) {
    if (arr === 'draw_through') {
      btnDT.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-violet-600 text-white shadow transition flex items-center justify-center gap-1.5 active-fan-btn';
      btnBT.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 inactive-seg-btn';
    } else {
      btnBT.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-violet-600 text-white shadow transition flex items-center justify-center gap-1.5 active-fan-btn';
      btnDT.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 inactive-seg-btn';
    }
  }
}

function setPsychSeasonMode(mode, applyCityPreset = true) {
  tool8State.seasonMode = mode;
  tool8State.userModified = true;
  window.tool8_modified = true;

  updateSeasonAndFanButtonsDOM();
  if (applyCityPreset && !tool8State.isWeatherOverridden) {
    applyCityWeatherPreset(false);
  }
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function setPsychFanArrangement(arr) {
  tool8State.fanArrangement = arr;
  tool8State.userModified = true;
  window.tool8_modified = true;

  updateSeasonAndFanButtonsDOM();
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function handlePsychCityChange(cityId) {
  tool8State.cityId = cityId;
  tool8State.userModified = true;
  window.tool8_modified = true;
  applyCityWeatherPreset(true);
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function toggleLocalElevationPressure(checked) {
  tool8State.useLocalElevation = !!checked;
  tool8State.userModified = true;
  window.tool8_modified = true;
  const cityObj = ASHRAE_CITIES.find(c => c.id === tool8State.cityId) || ASHRAE_CITIES[0];
  tool8State.patm = checked ? cityObj.patm : 14.696;
  tool8State.elevFt = checked ? cityObj.elevFt : 0;
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function applyCityWeatherPreset(resetOverrideFlag = true) {
  const cityObj = ASHRAE_CITIES.find(c => c.id === tool8State.cityId) || ASHRAE_CITIES[0];
  if (resetOverrideFlag) tool8State.isWeatherOverridden = false;

  tool8State.patm = tool8State.useLocalElevation ? cityObj.patm : 14.696;
  tool8State.elevFt = tool8State.useLocalElevation ? cityObj.elevFt : 0;

  if (tool8State.seasonMode === 'summer') {
    tool8State.oaDB = cityObj.summerDB;
    tool8State.oaWB = cityObj.summerWB;
    tool8State.oaInputMode = 'wb';
    const st = calcStateFromDBWB(cityObj.summerDB, cityObj.summerWB, tool8State.patm);
    tool8State.oaRH = parseFloat(st.rh.toFixed(1));
  } else {
    tool8State.oaDB = cityObj.winterDB;
    tool8State.oaWB = cityObj.winterWB;
    tool8State.oaInputMode = 'wb';
    const st = calcStateFromDBWB(cityObj.winterDB, cityObj.winterWB, tool8State.patm);
    tool8State.oaRH = parseFloat(st.rh.toFixed(1));
  }
}

function toggleOAInputMode() {
  tool8State.oaInputMode = tool8State.oaInputMode === 'wb' ? 'rh' : 'wb';
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function toggleRoomInputMode() {
  tool8State.roomInputMode = tool8State.roomInputMode === 'rh' ? 'wb' : 'rh';
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function toggleCoilInputMode() {
  tool8State.coilInputMode = tool8State.coilInputMode === 'wb' ? 'rh' : 'wb';
  calculateTool8();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

// -------------------------------------------------------------------
// 9. SUITE 6-POINT STATE SYNCHRONIZATION (GET / IMPORT / INIT)
// -------------------------------------------------------------------

function syncTopControlsFromState() {
  const citySel = document.getElementById('psychCitySelect');
  if (citySel && tool8State.cityId) citySel.value = tool8State.cityId;

  const elevCheck = document.getElementById('psychLocalElevCheck');
  if (elevCheck) elevCheck.checked = !!tool8State.useLocalElevation;

  const reheatCheck = document.getElementById('psychReheatToggle');
  if (reheatCheck) reheatCheck.checked = !!tool8State.reheatEnabled;

  document.querySelectorAll('input[name="psychHumidModeRadio"], input[name="mcqHumidModeRadio"]').forEach(r => {
    r.checked = (r.value === tool8State.humidifierMode);
  });

  setInputValIfNotFocused('psychJobNoInput', tool8State.jobNumber);
  setInputValIfNotFocused('psychSystemTagInput', tool8State.systemTag);
  setInputValIfNotFocused('tab1SystemTagInput', tool8State.systemTag);
  setInputValIfNotFocused('psychReportNotesInput', tool8State.reportNotes);
  setInputValIfNotFocused('psychSteamTempInput', tool8State.steamTempF);
  setInputValIfNotFocused('mcqSteamTempInput', tool8State.steamTempF);
  setInputValIfNotFocused('psychWaterTempInput', tool8State.waterTempF);
  setInputValIfNotFocused('mcqWaterTempInput', tool8State.waterTempF);
  setInputValIfNotFocused('psychCHWDeltaTInput', tool8State.chwDeltaT);
  setInputValIfNotFocused('psychHWDeltaTInput', tool8State.hwDeltaT);
  setInputValIfNotFocused('tab1CHWDeltaTInput', tool8State.chwDeltaT);
  setInputValIfNotFocused('tab1HWDeltaTInput', tool8State.hwDeltaT);

  updateSeasonAndFanButtonsDOM();
}

function getTool8State() {
  syncActiveUnitToSchedule();
  return Object.assign({}, tool8State, {
    userModified: !!(tool8State.userModified || window.tool8_modified)
  });
}

function importTool8State(data) {
  if (!data) return;
  const savedModified = !!data.userModified;

  Object.keys(tool8State).forEach(k => {
    if (data[k] !== undefined) {
      tool8State[k] = data[k];
    }
  });
  tool8State.userModified = savedModified;
  window.tool8_modified = savedModified;

  ensureSavedUnitsInitialized();
  syncTopControlsFromState();

  const miniPanel = document.getElementById('tab1MiniChartPanel');
  if (miniPanel) miniPanel.classList.toggle('hidden', !tool8State.showMiniChartOnTab1);
  const cardsDrawer = document.getElementById('tab1NodeCardsDrawer');
  if (cardsDrawer) cardsDrawer.classList.toggle('hidden', !tool8State.showNodeCardsOnTab1);

  calculateTool8();
  if (tool8State.activeTab) switchTool8Tab(tool8State.activeTab);
}

function resetTool8() {
  if (typeof resetActiveDraftToDefaults === 'function') {
    resetActiveDraftToDefaults();
  }
}

function initTool8() {
  const citySel = document.getElementById('psychCitySelect');
  if (citySel) {
    citySel.innerHTML = ASHRAE_CITIES.map(c =>
      `<option value="${c.id}">${c.name} — Summer ${c.summerDB}°/${c.summerWB}°F | Winter ${c.winterDB}°F</option>`
    ).join('');
    citySel.value = tool8State.cityId;
  }

  ensureSavedUnitsInitialized();

  ['psychChartCanvas', 'psychMiniChartCanvas'].forEach(cid => {
    const chartCanvas = document.getElementById(cid);
    if (chartCanvas && cid === 'psychChartCanvas') {
      chartCanvas.addEventListener('mousemove', (e) => {
        const rect = chartCanvas.getBoundingClientRect();
        psychChartHoverState = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        drawPsychrometricChart('psychChartCanvas', false);
      });
      chartCanvas.addEventListener('mouseleave', () => {
        psychChartHoverState = null;
        drawPsychrometricChart('psychChartCanvas', false);
      });
    }
  });

  window.addEventListener('resize', () => {
    if (tool8State.activeTab === 'chart') drawPsychrometricChart('psychChartCanvas', false);
    if (tool8State.activeTab === 'report') drawPsychrometricChart('subReportChartCanvas', true);
    if (tool8State.activeTab === 'schematic' && tool8State.showMiniChartOnTab1) {
      drawPsychrometricChart('psychMiniChartCanvas', false);
    }
  });

  window.addEventListener('beforeprint', () => {
    drawPsychrometricChart('psychMiniChartCanvas', true);
    drawPsychrometricChart('psychChartCanvas', true);
    drawPsychrometricChart('subReportChartCanvas', true);
  });

  window.addEventListener('afterprint', () => {
    drawPsychrometricChart('psychMiniChartCanvas', false);
    drawPsychrometricChart('psychChartCanvas', false);
    drawPsychrometricChart('subReportChartCanvas', true);
  });

  calculateTool8();
}
