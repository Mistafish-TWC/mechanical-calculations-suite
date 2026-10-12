/**
 * ===================================================================
 * MECHANICAL SYSTEM CALCULATIONS SUITE - TOOL 7
 * WRA Grease Interceptor Sizing & Official Proposal Generator
 * ===================================================================
 * Compliant with Des Moines Metropolitan Wastewater Reclamation Authority (WRA)
 * Grease Interceptor Sizing Ordinance Guidelines & FOG Program Requirements.
 */

// Standard Commercial Grease Interceptor Nominal Capacities (Gallons)
const STANDARD_GI_SIZES = [1000, 1250, 1500, 1750, 2000, 2500, 3000, 4000, 5000, 6000, 7500, 10000];
const ORDINANCE_MINIMUM_GALLONS = 1000;

// Application State for Tool 7
let tool7State = {
  userModified: false,
  
  // Criteria & Facility Info
  proposalDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
  facilityName: "Restaurant Generic",
  address: "123 Generic Street",
  city: "Des Moines Metropolitan City",
  contactNameTitle: "General Engineering Group",
  phone: "(515) 555-5555",
  email: "ProjectManager@generalengineering.com",
  contactAddress: "123 Engineering Road, Des Moines, IA",
  contractor: "XYZ Plumbing Company",

  // Type of Food Service Establishment (FSE)
  fseType: "full_service", // full_service, assisted_living, single_service, grocery, church, school, other
  fseOtherText: "",

  // Sizing Variables
  peakMealsMode: "calc", // "calc" or "direct"
  seatingCapacity: 50,
  mealFactor: 1.3,
  peakMealsDirect: 65,
  peakMealsResult: 65,

  // Kitchen Waste Flow Rate
  kitchenType: "comm_no_dw_no_disp", // comm_dw_1disp (7), comm_dw_no_disp (6), comm_no_dw_1disp (6), comm_no_dw_no_disp (5), single_service (2)
  additionalDisposals: 0,
  wasteFlowRateResult: 5,

  // Retention Time
  retentionType: "commercial", // "commercial" (2.5) or "single" (1.5)
  retentionTime: 2.5, // 2.5 for commercial, 1.5 for single service

  // Storage Factor
  operatingHours: "16", // "8" (1.0), "12" (1.5), "16" (2.0), "20" (2.5), "24" (3.0), "single" (1.5)
  storageFactorResult: 2.0,

  // Calculation Results
  calculatedSize: 1625,
  recommendedStandardSize: 2000,
  proposedInstallation: "Install one 2,000-gallon grease interceptor",
  isProposedManual: false,

  // UI Flow
  activeStep: 1, // 1 to 5
  previewZoom: 100, // percentage

  // Submittal Checklist Items
  checklist: {
    proposal: true,
    blueprint: true,
    equipment: true,
    sitePlan: true,
    verification: false
  }
};

/**
 * Rounds a calculated grease interceptor capacity up to the nearest standard commercial tank size.
 * Ordinance minimum is 1,000 gallons.
 * @param {number} calcSize 
 * @returns {number}
 */
function getStandardRoundedGISize(calcSize) {
  if (calcSize <= ORDINANCE_MINIMUM_GALLONS) {
    return ORDINANCE_MINIMUM_GALLONS;
  }
  for (let i = 0; i < STANDARD_GI_SIZES.length; i++) {
    if (STANDARD_GI_SIZES[i] >= calcSize) {
      return STANDARD_GI_SIZES[i];
    }
  }
  // If larger than standard ladder maximum (10,000 gal), round up to next 1,000
  return Math.ceil(calcSize / 1000) * 1000;
}

/**
 * Calculates Peak Meals per Hour
 */
function calculatePeakMeals() {
  if (tool7State.peakMealsMode === 'direct') {
    tool7State.peakMealsResult = Math.max(1, Math.round(parseFloat(tool7State.peakMealsDirect) || 0));
  } else {
    const seats = Math.max(0, parseFloat(tool7State.seatingCapacity) || 0);
    const factor = parseFloat(tool7State.mealFactor) || 1.3;
    tool7State.peakMealsResult = Math.round(seats * factor);
  }
  return tool7State.peakMealsResult;
}

/**
 * Calculates Waste Flow Rate (GPM)
 */
function calculateWasteFlowRate() {
  let baseRate = 5;
  switch (tool7State.kitchenType) {
    case 'comm_dw_1disp':
      baseRate = 7;
      break;
    case 'comm_dw_no_disp':
      baseRate = 6;
      break;
    case 'comm_no_dw_1disp':
      baseRate = 6;
      break;
    case 'comm_no_dw_no_disp':
      baseRate = 5;
      break;
    case 'single_service':
      baseRate = 2;
      break;
    default:
      baseRate = 5;
  }

  // Each additional disposal beyond the first adds 1 GPM
  const extraDisp = Math.max(0, parseInt(tool7State.additionalDisposals, 10) || 0);
  tool7State.wasteFlowRateResult = baseRate + extraDisp;
  return tool7State.wasteFlowRateResult;
}

/**
 * Calculates Retention Time
 */
function calculateRetentionTime() {
  if (tool7State.retentionType === 'single') {
    tool7State.retentionTime = 1.5;
  } else {
    tool7State.retentionTime = 2.5;
  }
  return tool7State.retentionTime;
}

/**
 * Handle user selection of Retention Time option-a vs option-b
 * @param {'commercial'|'single'} type 
 */
function selectRetentionType(type) {
  tool7State.retentionType = (type === 'single' ? 'single' : 'commercial');
  tool7State.retentionTime = (tool7State.retentionType === 'single' ? 1.5 : 2.5);
  tool7State.userModified = true;
  window.tool7_modified = true;
  calculateGreaseInterceptor();
  saveActiveDraftState();
}

/**
 * Calculates Storage Factor
 */
function calculateStorageFactor() {
  if (tool7State.kitchenType === 'single_service' || tool7State.fseType === 'single_service' || tool7State.operatingHours === 'single') {
    tool7State.storageFactorResult = 1.5;
  } else {
    switch (tool7State.operatingHours) {
      case '8': tool7State.storageFactorResult = 1.0; break;
      case '12': tool7State.storageFactorResult = 1.5; break;
      case '16': tool7State.storageFactorResult = 2.0; break;
      case '20': tool7State.storageFactorResult = 2.5; break;
      case '24': tool7State.storageFactorResult = 3.0; break;
      default: tool7State.storageFactorResult = 2.0; break;
    }
  }
  return tool7State.storageFactorResult;
}

/**
 * Master calculation function: Peak Meals * Flow Rate * Retention Time * Storage Factor
 */
function calculateGreaseInterceptor() {
  calculatePeakMeals();
  calculateWasteFlowRate();
  calculateRetentionTime();
  calculateStorageFactor();

  const pm = tool7State.peakMealsResult;
  const flow = tool7State.wasteFlowRateResult;
  const ret = tool7State.retentionTime;
  const sf = tool7State.storageFactorResult;

  // Formula: Peak Meals * Waste Flow Rate * Retention Time * Storage Factor
  const rawSize = Math.round(pm * flow * ret * sf);
  tool7State.calculatedSize = rawSize;
  tool7State.recommendedStandardSize = getStandardRoundedGISize(rawSize);

  // If user hasn't typed custom proposed text, update automatically to standard size
  if (!tool7State.isProposedManual) {
    tool7State.proposedInstallation = `Install one ${tool7State.recommendedStandardSize.toLocaleString()}-gallon grease interceptor`;
  }

  // Update UI Elements across Wizard & Proposal Preview
  updateUIFromState();
}

/**
 * Synchronizes UI inputs, summary badges, verification screen, and Proposal preview sheet
 */
function updateUIFromState() {
  // Sync Criteria Fields
  syncVal('facilityNameInput', tool7State.facilityName);
  syncVal('facilityAddressInput', tool7State.address);
  syncVal('facilityCityInput', tool7State.city);
  syncVal('contactNameInput', tool7State.contactNameTitle);
  syncVal('contactPhoneInput', tool7State.phone);
  syncVal('contactEmailInput', tool7State.email);
  syncVal('contactAddressDiffInput', tool7State.contactAddress);
  syncVal('plumbingContractorInput', tool7State.contractor);
  syncVal('proposalDateInput', tool7State.proposalDate);

  // Sync FSE Radio / Checkbox
  const fseRadios = document.querySelectorAll('input[name="fseTypeRadio"]');
  fseRadios.forEach(r => { r.checked = (r.value === tool7State.fseType); });
  const otherInput = document.getElementById('fseOtherTextInput');
  if (otherInput) {
    otherInput.value = tool7State.fseOtherText || '';
    otherInput.disabled = (tool7State.fseType !== 'other');
  }

  // Sync Step 3 Inputs
  syncVal('seatingCapacityInput', tool7State.seatingCapacity);
  syncVal('mealFactorSelect', tool7State.mealFactor);
  syncVal('peakMealsDirectInput', tool7State.peakMealsDirect);
  syncVal('additionalDisposalsInput', tool7State.additionalDisposals);

  const kitchenRadios = document.querySelectorAll('input[name="kitchenTypeRadio"]');
  kitchenRadios.forEach(r => { r.checked = (r.value === tool7State.kitchenType); });

  const retRadios = document.querySelectorAll('input[name="retentionTimeRadio"]');
  retRadios.forEach(r => { r.checked = (r.value === tool7State.retentionType); });

  const hoursRadios = document.querySelectorAll('input[name="operatingHoursRadio"]');
  hoursRadios.forEach(r => { r.checked = (r.value === tool7State.operatingHours); });

  // Sync Proposal Input
  const propInput = document.getElementById('proposedInstallationInput');
  if (propInput) propInput.value = tool7State.proposedInstallation;

  // Sync Badges and Metrics
  setText('metricCalculatedSize', tool7State.calculatedSize.toLocaleString() + ' gal');
  setText('metricRecommendedSize', tool7State.recommendedStandardSize.toLocaleString() + ' gal');
  setText('btnAutoRoundSizeDisplay', tool7State.recommendedStandardSize.toLocaleString() + ' gal');
  setText('metricPeakMeals', tool7State.peakMealsResult.toLocaleString());
  setText('metricFlowRate', tool7State.wasteFlowRateResult + ' GPM');
  setText('metricRetentionTime', tool7State.retentionTime + ' hrs');
  setText('metricStorageFactor', tool7State.storageFactorResult.toFixed(1));

  // Sync builder size dropdown if not manually altered
  if (!tool7State.isProposedManual) {
    const sizeSel = document.getElementById('propSizeSelect');
    if (sizeSel) sizeSel.value = String(tool7State.recommendedStandardSize);
    handlePresetBuilderChange();
  }
  updateCapacityAdequacyBadge();

  // Ordinance Minimum Status Indicator
  const ordBadge = document.getElementById('ordinanceComplianceBadge');
  if (ordBadge) {
    if (tool7State.calculatedSize < ORDINANCE_MINIMUM_GALLONS) {
      ordBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5";
      ordBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Below Ordinance Minimum (Mandatory 1,000 Gallons)`;
    } else {
      ordBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5";
      ordBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Compliant (≥ 1,000 Gal Ordinance Minimum)`;
    }
  }

  // Formula String Breakdown
  setText('formulaPeakMealsVal', tool7State.peakMealsResult);
  setText('formulaFlowRateVal', tool7State.wasteFlowRateResult);
  setText('formulaRetentionVal', tool7State.retentionTime);
  setText('formulaStorageVal', tool7State.storageFactorResult.toFixed(1));
  setText('formulaResultVal', tool7State.calculatedSize.toLocaleString());

  // Synchronize To-Scale Official Proposal Form Preview
  updateProposalPreview();
}

/**
 * Updates the 1:1 true-to-scale WRA Sizing Proposal Sheet Preview
 */
function updateProposalPreview() {
  // 1. Criteria at top of form
  setText('pvDate', tool7State.proposalDate || '—');
  setText('pvFacilityName', tool7State.facilityName || '—');
  setText('pvAddress', tool7State.address || '—');
  setText('pvCity', tool7State.city || '—');
  setText('pvContactName', tool7State.contactNameTitle || '—');
  setText('pvPhone', tool7State.phone || '—');
  setText('pvEmail', tool7State.email || '—');
  setText('pvContactAddressDiff', tool7State.contactAddress || '—');
  setText('pvContractor', tool7State.contractor || '—');

  // 2. FSE Type Checkboxes (Clean Black 'X')
  const fseTypes = ['full_service', 'assisted_living', 'other', 'single_service', 'grocery', 'church', 'school'];
  fseTypes.forEach(type => {
    const el = document.getElementById('pvFse_' + type);
    if (el) {
      el.innerText = (tool7State.fseType === type) ? 'X' : '';
    }
  });
  setText('pvFseOtherText', (tool7State.fseType === 'other') ? tool7State.fseOtherText : '');

  // 3. Peak Meals Boxes
  if (tool7State.peakMealsMode === 'direct') {
    setText('pvSeats', '—');
    setText('pvMealFactor', '—');
    setText('pvPeakMealsBox1', tool7State.peakMealsResult);
  } else {
    setText('pvSeats', tool7State.seatingCapacity);
    setText('pvMealFactor', tool7State.mealFactor);
    setText('pvPeakMealsBox1', tool7State.peakMealsResult);
  }

  // 4. Waste Flow Rate (values entered cleanly in black, no red markings)
  // Options a-e indicate corresponding values
  setText('pvWasteRate_a', '7');
  setText('pvWasteRate_b', '6');
  setText('pvWasteRate_c', '6');
  setText('pvWasteRate_d', '5');
  setText('pvWasteRate_e', '2');

  // 5. Retention Time Options
  setText('pvRetention_a', '2.5');
  setText('pvRetention_b', '1.5');

  // 6. Storage Factor Options
  setText('pvStorage_a', '1');
  setText('pvStorage_b', '1.5');
  setText('pvStorage_c', '2');
  setText('pvStorage_d', '2.5');
  setText('pvStorage_e', '3');
  setText('pvStorage_f', '1.5');

  // 7. Master Sizing Calculation Summary Boxes
  setText('pvSummaryPeakMeals', tool7State.peakMealsResult);
  setText('pvSummaryWasteFlow', tool7State.wasteFlowRateResult);
  setText('pvSummaryRetention', tool7State.retentionTime);
  setText('pvSummaryStorage', tool7State.storageFactorResult.toFixed(1).replace(/\.0$/, ''));
  setText('pvSummaryCalculatedGI', tool7State.calculatedSize.toLocaleString());

  // 8. Proposed Installation Line
  setText('pvProposedInstallation', tool7State.proposedInstallation);

  // 9. Submission Checklist (Checkmarks or Xs)
  setCheck('pvCheck_proposal', tool7State.checklist.proposal);
  setCheck('pvCheck_blueprint', tool7State.checklist.blueprint);
  setCheck('pvCheck_equipment', tool7State.checklist.equipment);
  setCheck('pvCheck_sitePlan', tool7State.checklist.sitePlan);
  setCheck('pvCheck_verification', tool7State.checklist.verification);
}

function setCheck(id, isChecked) {
  const el = document.getElementById(id);
  if (el) el.innerText = isChecked ? 'X' : '';
}

function syncVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) {
    if (document.activeElement !== el) {
      el.value = val;
    }
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = (text !== undefined && text !== null) ? text : '';
}

/**
 * Handle Step Wizard Navigation
 * @param {number} stepNum 1 to 5
 */
function setWizardStep(stepNum) {
  tool7State.activeStep = stepNum;
  for (let i = 1; i <= 5; i++) {
    const pane = document.getElementById('step-pane-' + i);
    const navBtn = document.getElementById('wizard-step-btn-' + i);
    if (pane) {
      if (i === stepNum) {
        pane.classList.remove('hidden');
        pane.classList.add('animate-fade-in');
      } else {
        pane.classList.add('hidden');
        pane.classList.remove('animate-fade-in');
      }
    }
    if (navBtn) {
      if (i === stepNum) {
        navBtn.classList.add('active-step-tab');
        navBtn.classList.remove('text-slate-400');
      } else {
        navBtn.classList.remove('active-step-tab');
        navBtn.classList.add('text-slate-400');
      }
    }
  }

  // Scroll to top of content when changing step
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Switch Peak Meals Input Mode (Formula vs Direct)
 * @param {'calc'|'direct'} mode 
 */
function setPeakMealsMode(mode) {
  tool7State.peakMealsMode = mode;
  tool7State.userModified = true;
  window.tool7_modified = true;

  const btnCalc = document.getElementById('btnModePeakCalc');
  const btnDirect = document.getElementById('btnModePeakDirect');
  const blockCalc = document.getElementById('peakMealsCalcBlock');
  const blockDirect = document.getElementById('peakMealsDirectBlock');

  if (mode === 'calc') {
    if (btnCalc) btnCalc.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 shadow-md";
    if (btnDirect) btnDirect.className = "px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white";
    if (blockCalc) blockCalc.classList.remove('hidden');
    if (blockDirect) blockDirect.classList.add('hidden');
  } else {
    if (btnCalc) btnCalc.className = "px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white";
    if (btnDirect) btnDirect.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 shadow-md";
    if (blockCalc) blockCalc.classList.add('hidden');
    if (blockDirect) blockDirect.classList.remove('hidden');
  }

  calculateGreaseInterceptor();
  saveActiveDraftState();
}

/**
 * Preset selection for FSE Type
 * @param {string} type 
 */
function selectFSEType(type) {
  tool7State.fseType = type;
  tool7State.userModified = true;
  window.tool7_modified = true;

  // Auto-adjust meal factor or kitchen recommendations based on establishment
  if (type === 'full_service') {
    tool7State.mealFactor = 1.3;
    tool7State.kitchenType = 'comm_no_dw_no_disp';
  } else if (type === 'assisted_living') {
    tool7State.mealFactor = 1.3;
    tool7State.kitchenType = 'comm_dw_1disp';
  } else if (type === 'single_service') {
    tool7State.mealFactor = 1.0;
    tool7State.kitchenType = 'single_service';
    tool7State.operatingHours = 'single';
  } else if (type === 'church') {
    tool7State.mealFactor = 1.0;
  } else if (type === 'grocery') {
    tool7State.mealFactor = 1.0;
  } else if (type === 'school') {
    tool7State.mealFactor = 1.3;
  }

  calculateGreaseInterceptor();
  saveActiveDraftState();
}

/**
 * Handle user typing or editing the Proposed Installation text directly
 * @param {string} val 
 */
function handleProposedInput(val) {
  tool7State.proposedInstallation = val;
  tool7State.isProposedManual = true;
  tool7State.userModified = true;
  window.tool7_modified = true;
  updateProposalPreview();
  updateCapacityAdequacyBadge();
  saveActiveDraftState();
}

/**
 * Apply the Quantity & Size preset builder directly to the Proposed Installation line
 */
function applyProposedPreset() {
  const qty = parseInt(document.getElementById('propQtySelect')?.value || '1', 10);
  const size = parseInt(document.getElementById('propSizeSelect')?.value || '2000', 10);
  const qtyWords = ['one', 'two', 'three', 'four'];
  const qtyWord = (qty >= 1 && qty <= 4) ? qtyWords[qty - 1] : String(qty);
  const noun = qty > 1 ? 'grease interceptors' : 'grease interceptor';
  const text = `Install ${qtyWord} ${size.toLocaleString()}-gallon ${noun}`;
  
  tool7State.proposedInstallation = text;
  tool7State.isProposedManual = true;
  tool7State.userModified = true;
  window.tool7_modified = true;

  const input = document.getElementById('proposedInstallationInput');
  if (input) input.value = text;
  
  updateProposalPreview();
  updateCapacityAdequacyBadge();
  saveActiveDraftState();
  showToast('Proposed Line Updated', `Populated "${text}" into Step 5.`);
}

/**
 * Live updates the builder's designated capacity text strip
 */
function handlePresetBuilderChange() {
  const qty = parseInt(document.getElementById('propQtySelect')?.value || '1', 10);
  const size = parseInt(document.getElementById('propSizeSelect')?.value || '2000', 10);
  const total = qty * size;
  const txt = document.getElementById('designatedTotalCapText');
  if (txt) {
    txt.innerText = `${total.toLocaleString()} gal (${qty} × ${size.toLocaleString()} gal)`;
  }
}

/**
 * Updates the capacity adequacy badge in Step 4 comparing designated gallons with calculated requirement
 */
function updateCapacityAdequacyBadge() {
  const text = tool7State.proposedInstallation || '';
  const match = text.match(/([\d,]+)[\s-]*gal/i);
  let extractedCap = 0;
  if (match) {
    extractedCap = parseInt(match[1].replace(/,/g, ''), 10) || 0;
    if (/two|\b2\b/i.test(text)) extractedCap *= 2;
    else if (/three|\b3\b/i.test(text)) extractedCap *= 3;
    else if (/four|\b4\b/i.test(text)) extractedCap *= 4;
  }

  const badge = document.getElementById('capacityAdequacyBadge');
  if (badge) {
    if (extractedCap > 0) {
      if (extractedCap >= tool7State.calculatedSize) {
        badge.className = "text-emerald-400 font-bold flex items-center gap-1";
        badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Meets Calculated Size (${tool7State.calculatedSize.toLocaleString()} gal)`;
      } else {
        badge.className = "text-amber-400 font-bold flex items-center gap-1";
        badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Below Calculated Size (${tool7State.calculatedSize.toLocaleString()} gal)`;
      }
    } else {
      badge.className = "text-slate-400 font-medium flex items-center gap-1";
      badge.innerHTML = `<i class="fa-solid fa-circle-info"></i> Custom Engineer Specification`;
    }
  }

  const livePreview = document.getElementById('proposedLineLivePreview');
  if (livePreview) {
    livePreview.innerText = `"${tool7State.proposedInstallation}"`;
  }
}

/**
 * Reset Proposed Text to Auto-Calculated Standard Size
 */
function resetProposedToAuto() {
  tool7State.isProposedManual = false;
  tool7State.proposedInstallation = `Install one ${tool7State.recommendedStandardSize.toLocaleString()}-gallon grease interceptor`;
  
  const el = document.getElementById('proposedInstallationInput');
  if (el) el.value = tool7State.proposedInstallation;

  const qtySel = document.getElementById('propQtySelect');
  if (qtySel) qtySel.value = '1';
  const sizeSel = document.getElementById('propSizeSelect');
  if (sizeSel) sizeSel.value = String(tool7State.recommendedStandardSize);

  handlePresetBuilderChange();
  updateCapacityAdequacyBadge();
  updateProposalPreview();
  saveActiveDraftState();
  showToast('Standard Size Reset', `Proposed installation reset to ${tool7State.recommendedStandardSize.toLocaleString()} gallons.`);
}

/**
 * Set Zoom Level of Proposal Preview (75%, 100%, 125%, Fit)
 * @param {number} pct 
 */
function setPreviewZoom(pct) {
  tool7State.previewZoom = pct;
  const sheet = document.getElementById('proposalPreviewSheet');
  if (sheet) {
    sheet.style.transform = `scale(${pct / 100})`;
    sheet.style.transformOrigin = 'top center';
  }
}

/**
 * Native Browser Print for 1:1 High-Resolution Letter Proposal Sheet
 */
function printProposalForm() {
  saveActiveDraftState();
  // Ensure we are on Step 5 and the preview is updated
  if (tool7State.activeStep !== 5) {
    setWizardStep(5);
  }
  updateProposalPreview();
  // Allow DOM to settle before opening native print dialog
  setTimeout(() => {
    window.print();
  }, 120);
}

/**
 * Client-Side PDF Generation & Download via PDF-Lib
 */
async function downloadProposalPDF() {
  try {
    showToast('Generating PDF', 'Building authentic WRA Proposal PDF document...', true);

    if (typeof PDFLib === 'undefined') {
      // If CDN failed or is blocked by network, ensure Step 5 is selected and open print-to-PDF
      if (tool7State.activeStep !== 5) {
        setWizardStep(5);
      }
      updateProposalPreview();
      showToast('Print / Save to PDF', 'PDF library unavailable offline. Opening print dialog to Save as PDF...', false);
      setTimeout(() => {
        window.print();
      }, 150);
      return;
    }

    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard US Letter (8.5 x 11 inches at 72 dpi)
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const black = rgb(0, 0, 0);
    const darkGray = rgb(0.2, 0.2, 0.2);
    const lineGray = rgb(0.5, 0.5, 0.5);

    // Document Margins
    const mx = 40;
    let y = height - 40;

    // 1. Header Box & Logos
    // Top border box for Title
    page.drawRectangle({
      x: 160,
      y: y - 28,
      width: 292,
      height: 30,
      borderColor: black,
      borderWidth: 1.5,
    });
    page.drawText('WRA Grease Interceptor Sizing Proposal', {
      x: 175,
      y: y - 18,
      size: 13,
      font: fontBold,
      color: black
    });

    // WRA Oval Logo (Left)
    page.drawEllipse({
      x: 80,
      y: y - 14,
      xScale: 32,
      yScale: 20,
      borderColor: rgb(0.08, 0.35, 0.65),
      borderWidth: 2,
    });
    page.drawText('WRA', {
      x: 62,
      y: y - 20,
      size: 15,
      font: fontBold,
      color: rgb(0.08, 0.35, 0.65)
    });

    // FOG Badge (Right)
    page.drawCircle({
      x: 520,
      y: y - 14,
      size: 20,
      borderColor: rgb(0.85, 0.2, 0.1),
      borderWidth: 2,
    });
    page.drawText('FOG', {
      x: 507,
      y: y - 19,
      size: 12,
      font: fontBold,
      color: rgb(0.85, 0.2, 0.1)
    });
    page.drawText('FATS - OIL - GREASE', {
      x: 485,
      y: y - 38,
      size: 6,
      font: fontBold,
      color: rgb(0.85, 0.2, 0.1)
    });

    y -= 52;

    // 2. Criteria Fields
    const drawFieldLine = (label, value, xStart, yPos, length) => {
      page.drawText(label, { x: xStart, y: yPos, size: 9, font: fontBold, color: black });
      const labelWidth = fontBold.widthOfTextAtSize(label, 9);
      const lineStart = xStart + labelWidth + 4;
      const lineEnd = xStart + length;
      page.drawLine({
        start: { x: lineStart, y: yPos - 2 },
        end: { x: lineEnd, y: yPos - 2 },
        thickness: 0.8,
        color: black
      });
      if (value) {
        page.drawText(String(value), {
          x: lineStart + 4,
          y: yPos,
          size: 9,
          font: fontRegular,
          color: black
        });
      }
    };

    drawFieldLine('Date:', tool7State.proposalDate, mx, y, 532);
    y -= 18;
    drawFieldLine('Facility Name:', tool7State.facilityName, mx, y, 532);
    y -= 18;
    drawFieldLine('Address:', tool7State.address, mx, y, 320);
    drawFieldLine('City:', tool7State.city, mx + 330, y, 202);
    y -= 18;
    drawFieldLine('Contact Name and Title:', tool7State.contactNameTitle, mx, y, 532);
    y -= 18;
    drawFieldLine('Phone:', tool7State.phone, mx, y, 240);
    drawFieldLine('Email:', tool7State.email, mx + 250, y, 282);
    y -= 18;
    drawFieldLine('Contact Address (if different):', tool7State.contactAddress, mx, y, 532);
    y -= 18;
    drawFieldLine('Plumbing Contractor:', tool7State.contractor, mx, y, 532);
    y -= 22;

    // 3. Type of Food Service Establishment (FSE)
    page.drawText('Type of Food Service Establishment (FSE)', { x: mx, y, size: 9.5, font: fontBold, color: black });
    y -= 15;

    const drawBoxCheck = (xPos, yPos, label, isChecked) => {
      page.drawRectangle({ x: xPos, y: yPos, width: 10, height: 10, borderColor: black, borderWidth: 1 });
      if (isChecked) {
        page.drawText('X', { x: xPos + 2, y: yPos + 1.5, size: 8, font: fontBold, color: black });
      }
      page.drawText(label, { x: xPos + 15, y: yPos + 1.5, size: 8.5, font: fontRegular, color: black });
    };

    drawBoxCheck(mx + 10, y, 'Full Service Restaurant', tool7State.fseType === 'full_service');
    drawBoxCheck(mx + 170, y, 'Assisted Living / Nursing Facility', tool7State.fseType === 'assisted_living');
    drawBoxCheck(mx + 380, y, 'Other: ' + (tool7State.fseType === 'other' ? tool7State.fseOtherText : '____________'), tool7State.fseType === 'other');
    y -= 14;

    drawBoxCheck(mx + 10, y, 'Single Service Restaurant', tool7State.fseType === 'single_service');
    drawBoxCheck(mx + 170, y, 'Grocery', tool7State.fseType === 'grocery');
    drawBoxCheck(mx + 280, y, 'Church', tool7State.fseType === 'church');
    drawBoxCheck(mx + 380, y, 'School / Daycare', tool7State.fseType === 'school');
    y -= 18;

    // 4. Ordinance Header Rule
    page.drawText('Grease Interceptor Sizing – Must not be less than the Ordinance minimum of 1000 gallons.', {
      x: mx,
      y,
      size: 9.5,
      font: fontBold,
      color: black
    });
    // Underline
    page.drawLine({
      start: { x: mx, y: y - 2 },
      end: { x: mx + 532, y: y - 2 },
      thickness: 1,
      color: black
    });
    y -= 18;

    // Section 1: Peak Meals per Hour
    page.drawText('1.  Peak Meals per Hour (if unknown use formula below)', { x: mx, y, size: 9, font: fontBold, color: black });
    y -= 14;

    // Small notes on the right
    page.drawText('* Church: include all area(s) used for meal service', { x: mx + 310, y, size: 7.5, font: fontRegular, color: darkGray });
    page.drawText('* Assisted Living / Nursing Facility: equal to max', { x: mx + 310, y: y - 9, size: 7.5, font: fontRegular, color: darkGray });
    page.drawText('  number of residents (per State license)', { x: mx + 310, y: y - 18, size: 7.5, font: fontRegular, color: darkGray });
    page.drawText('** Meal Factor: 1.3 (for 45-minute meal) or', { x: mx + 310, y: y - 27, size: 7.5, font: fontRegular, color: darkGray });
    page.drawText('   1.0 (for intermittent use FSE)', { x: mx + 310, y: y - 36, size: 7.5, font: fontRegular, color: darkGray });

    // Formula table headers
    page.drawText('Seating Capacity or\nOccupancy of FSE*', { x: mx + 20, y: y - 8, size: 8, font: fontRegular, color: black });
    page.drawText('X', { x: mx + 115, y: y - 8, size: 9, font: fontBold, color: black });
    page.drawText('Meal\nFactor**', { x: mx + 135, y: y - 8, size: 8, font: fontRegular, color: black });
    page.drawText('=', { x: mx + 195, y: y - 8, size: 9, font: fontBold, color: black });
    page.drawText('Peak Meals\nper Hour', { x: mx + 215, y: y - 8, size: 8, font: fontRegular, color: black });

    // Formula Boxes
    page.drawRectangle({ x: mx + 25, y: y - 40, width: 60, height: 24, borderColor: black, borderWidth: 1 });
    page.drawRectangle({ x: mx + 130, y: y - 40, width: 45, height: 24, borderColor: black, borderWidth: 1 });
    page.drawRectangle({ x: mx + 215, y: y - 40, width: 60, height: 24, borderColor: black, borderWidth: 1 });

    // Clean black values
    const seatsStr = (tool7State.peakMealsMode === 'calc') ? String(tool7State.seatingCapacity) : '—';
    const factorStr = (tool7State.peakMealsMode === 'calc') ? String(tool7State.mealFactor) : '—';
    page.drawText(seatsStr, { x: mx + 45, y: y - 33, size: 11, font: fontBold, color: black });
    page.drawText(factorStr, { x: mx + 140, y: y - 33, size: 11, font: fontBold, color: black });
    page.drawText(String(tool7State.peakMealsResult), { x: mx + 235, y: y - 33, size: 11, font: fontBold, color: black });

    y -= 55;

    // Section 2: Waste Flow Rate
    page.drawText('2.  Waste Flow Rate', { x: mx, y, size: 9, font: fontBold, color: black });
    y -= 12;

    const drawListRow = (item, val) => {
      page.drawText(item, { x: mx + 15, y, size: 8, font: fontRegular, color: black });
      page.drawText(val, { x: mx + 490, y, size: 8.5, font: fontBold, color: black });
      y -= 11;
    };

    drawListRow('a.  Commercial, equipped kitchen with dishwasher & one garbage disposal*', '7');
    drawListRow('b.  Commercial, equipped kitchen with dishwasher, no garbage disposal', '6');
    drawListRow('c.  Commercial, equipped kitchen with no dishwasher, one garbage disposal*', '6');
    drawListRow('d.  Commercial, equipped kitchen with no dishwasher, no garbage disposal', '5');
    drawListRow('e.  Single service kitchen**', '2');
    page.drawText('* Each additional garbage disposal, add one (1) gallon', { x: mx + 15, y, size: 7.5, font: fontRegular, color: darkGray });
    y -= 9;
    page.drawText('** Single service kitchen = no garbage disposal, no dishwasher and all service is single use', { x: mx + 15, y, size: 7.5, font: fontRegular, color: darkGray });
    y -= 14;

    // Section 3: Retention Time
    page.drawText('3.  Retention Time', { x: mx, y, size: 9, font: fontBold, color: black });
    y -= 11;
    drawListRow('a.  Commercial kitchen', '2.5');
    drawListRow('b.  Single service kitchen', '1.5');
    y -= 4;

    // Section 4: Storage Factor
    page.drawText('4.  Storage Factor', { x: mx, y, size: 9, font: fontBold, color: black });
    y -= 11;
    drawListRow('a.  Commercial Kitchen up to 8 hours of operation', '1');
    drawListRow('b.  Commercial Kitchen up to 12 hours of operation', '1.5');
    drawListRow('c.  Commercial kitchen up to 16 hours of operation', '2');
    drawListRow('d.  Commercial kitchen up to 20 hours of operation', '2.5');
    drawListRow('e.  Commercial kitchen up to 24 hours of operation', '3');
    drawListRow('f.  Single service kitchen', '1.5');
    y -= 6;

    // Final Calculation Formula Header
    page.drawText('Peak Meals\nper Hour', { x: mx + 10, y: y - 5, size: 7.5, font: fontRegular, color: black });
    page.drawText('X', { x: mx + 85, y: y - 5, size: 9, font: fontBold, color: black });
    page.drawText('Waste Flow\nRate', { x: mx + 115, y: y - 5, size: 7.5, font: fontRegular, color: black });
    page.drawText('X', { x: mx + 185, y: y - 5, size: 9, font: fontBold, color: black });
    page.drawText('Retention\nTime', { x: mx + 215, y: y - 5, size: 7.5, font: fontRegular, color: black });
    page.drawText('X', { x: mx + 285, y: y - 5, size: 9, font: fontBold, color: black });
    page.drawText('Storage\nFactor', { x: mx + 315, y: y - 5, size: 7.5, font: fontRegular, color: black });
    page.drawText('=', { x: mx + 375, y: y - 5, size: 10, font: fontBold, color: black });
    page.drawText('Calculated\nGI Size', { x: mx + 420, y: y - 5, size: 8, font: fontBold, color: black });

    // Formula Boxes
    page.drawRectangle({ x: mx + 10, y: y - 35, width: 55, height: 24, borderColor: black, borderWidth: 1 });
    page.drawRectangle({ x: mx + 110, y: y - 35, width: 55, height: 24, borderColor: black, borderWidth: 1 });
    page.drawRectangle({ x: mx + 210, y: y - 35, width: 55, height: 24, borderColor: black, borderWidth: 1 });
    page.drawRectangle({ x: mx + 310, y: y - 35, width: 55, height: 24, borderColor: black, borderWidth: 1 });
    page.drawRectangle({ x: mx + 400, y: y - 35, width: 110, height: 24, borderColor: black, borderWidth: 1.5 });

    // Sub-box "Minimum 1,000 gallons"
    page.drawRectangle({ x: mx + 400, y: y - 50, width: 110, height: 13, borderColor: black, borderWidth: 0.8 });
    page.drawText('Minimum 1,000 gallons', { x: mx + 418, y: y - 46, size: 7, font: fontOblique, color: darkGray });

    // Black values in calculation boxes
    page.drawText(String(tool7State.peakMealsResult), { x: mx + 28, y: y - 28, size: 11, font: fontBold, color: black });
    page.drawText(String(tool7State.wasteFlowRateResult), { x: mx + 133, y: y - 28, size: 11, font: fontBold, color: black });
    page.drawText(String(tool7State.retentionTime), { x: mx + 228, y: y - 28, size: 11, font: fontBold, color: black });
    page.drawText(String(tool7State.storageFactorResult.toFixed(1).replace(/\.0$/, '')), { x: mx + 333, y: y - 28, size: 11, font: fontBold, color: black });
    page.drawText(tool7State.calculatedSize.toLocaleString(), { x: mx + 430, y: y - 28, size: 12, font: fontBold, color: black });

    y -= 65;

    // Proposed installation
    page.drawText('Proposed installation is as follows:', { x: mx, y, size: 9, font: fontBold, color: black });
    const propLineStart = mx + 180;
    page.drawLine({ start: { x: propLineStart, y: y - 2 }, end: { x: mx + 532, y: y - 2 }, thickness: 1, color: black });
    page.drawText(tool7State.proposedInstallation, { x: propLineStart + 5, y: y, size: 9, font: fontBold, color: black });
    y -= 18;

    // Submittal Requirements
    page.drawText('The following must be submitted for an official sizing request:', { x: mx, y, size: 8.5, font: fontBold, color: black });
    y -= 12;

    const drawSubCheck = (label, isChecked) => {
      page.drawRectangle({ x: mx + 20, y: y, width: 8, height: 8, borderColor: black, borderWidth: 0.8 });
      if (isChecked) {
        page.drawText('X', { x: mx + 21.5, y: y + 1, size: 6.5, font: fontBold, color: black });
      }
      page.drawText(label, { x: mx + 34, y: y + 1, size: 7.5, font: fontRegular, color: black });
      y -= 10;
    };

    drawSubCheck('Completed Grease Interceptor Sizing Proposal (completed by a professional engineer or licensed plumber)', tool7State.checklist.proposal);
    drawSubCheck('Kitchen plumbing blueprint', tool7State.checklist.blueprint);
    drawSubCheck('Kitchen equipment list', tool7State.checklist.equipment);
    drawSubCheck('FSE site plan showing seating capacity OR square feet / occupancy', tool7State.checklist.sitePlan);
    drawSubCheck('Verification of current Grease Interceptor size by a professional engineer or licensed plumber (if applicable)', tool7State.checklist.verification);
    y -= 4;

    // Authority Contact Footer
    page.drawText('Submit to: Jason Merk, WRA FOG Program (515) 323-8063 (fax) OR jcmerk@dmgov.org', {
      x: mx + 50,
      y,
      size: 8,
      font: fontBold,
      color: black
    });
    y -= 9;
    page.drawText('Des Moines Metropolitan Wastewater Reclamation Authority', {
      x: mx + 105,
      y,
      size: 8,
      font: fontRegular,
      color: darkGray
    });
    y -= 9;
    page.drawText('3000 Vandalia Road, Des Moines, IA 50317, (515) 323-8000', {
      x: mx + 115,
      y,
      size: 7.5,
      font: fontRegular,
      color: darkGray
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const safeName = (tool7State.facilityName || 'WRA_Proposal').replace(/[^a-z0-9_-]/gi, '_');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}_Grease_Interceptor_Proposal.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('PDF Exported', 'Official Proposal PDF generated and downloaded successfully!');
  } catch (err) {
    console.error('Error creating PDF:', err);
    showToast('Print Fallback', 'Opening browser print dialog to save as PDF...', false);
    window.print();
  }
}

/**
 * Returns current Tool 7 state for global session saving
 */
function getTool7State() {
  return {
    userModified: tool7State.userModified || !!window.tool7_modified,
    proposalDate: tool7State.proposalDate,
    facilityName: tool7State.facilityName,
    address: tool7State.address,
    city: tool7State.city,
    contactNameTitle: tool7State.contactNameTitle,
    phone: tool7State.phone,
    email: tool7State.email,
    contactAddress: tool7State.contactAddress,
    contractor: tool7State.contractor,
    fseType: tool7State.fseType,
    fseOtherText: tool7State.fseOtherText,
    peakMealsMode: tool7State.peakMealsMode,
    seatingCapacity: tool7State.seatingCapacity,
    mealFactor: tool7State.mealFactor,
    peakMealsDirect: tool7State.peakMealsDirect,
    kitchenType: tool7State.kitchenType,
    additionalDisposals: tool7State.additionalDisposals,
    retentionType: tool7State.retentionType,
    retentionTime: tool7State.retentionTime,
    operatingHours: tool7State.operatingHours,
    storageFactor: tool7State.storageFactorResult,
    calculatedSize: tool7State.calculatedSize,
    recommendedStandardSize: tool7State.recommendedStandardSize,
    proposedInstallation: tool7State.proposedInstallation,
    isProposedManual: tool7State.isProposedManual,
    activeStep: tool7State.activeStep,
    checklist: tool7State.checklist
  };
}

/**
 * Imports state from saved session
 * @param {Object} data 
 */
function importTool7State(data) {
  if (!data) return;
  if (data.proposalDate !== undefined) tool7State.proposalDate = data.proposalDate;
  if (data.facilityName !== undefined) tool7State.facilityName = data.facilityName;
  if (data.address !== undefined) tool7State.address = data.address;
  if (data.city !== undefined) tool7State.city = data.city;
  if (data.contactNameTitle !== undefined) tool7State.contactNameTitle = data.contactNameTitle;
  if (data.phone !== undefined) tool7State.phone = data.phone;
  if (data.email !== undefined) tool7State.email = data.email;
  if (data.contactAddress !== undefined) tool7State.contactAddress = data.contactAddress;
  if (data.contractor !== undefined) tool7State.contractor = data.contractor;
  if (data.fseType !== undefined) tool7State.fseType = data.fseType;
  if (data.fseOtherText !== undefined) tool7State.fseOtherText = data.fseOtherText;
  if (data.peakMealsMode !== undefined) tool7State.peakMealsMode = data.peakMealsMode;
  if (data.seatingCapacity !== undefined) tool7State.seatingCapacity = data.seatingCapacity;
  if (data.mealFactor !== undefined) tool7State.mealFactor = data.mealFactor;
  if (data.peakMealsDirect !== undefined) tool7State.peakMealsDirect = data.peakMealsDirect;
  if (data.kitchenType !== undefined) tool7State.kitchenType = data.kitchenType;
  if (data.additionalDisposals !== undefined) tool7State.additionalDisposals = data.additionalDisposals;
  if (data.retentionType !== undefined) {
    tool7State.retentionType = data.retentionType;
  } else if (data.retentionTime !== undefined) {
    tool7State.retentionType = (data.retentionTime === 1.5 ? 'single' : 'commercial');
  }
  if (data.retentionTime !== undefined) tool7State.retentionTime = data.retentionTime;
  if (data.operatingHours !== undefined) tool7State.operatingHours = data.operatingHours;
  if (data.storageFactor !== undefined) tool7State.storageFactorResult = data.storageFactor;
  if (data.calculatedSize !== undefined) tool7State.calculatedSize = data.calculatedSize;
  if (data.recommendedStandardSize !== undefined) tool7State.recommendedStandardSize = data.recommendedStandardSize;
  if (data.proposedInstallation !== undefined) tool7State.proposedInstallation = data.proposedInstallation;
  if (data.isProposedManual !== undefined) tool7State.isProposedManual = data.isProposedManual;
  if (data.activeStep !== undefined) tool7State.activeStep = data.activeStep;
  if (data.checklist) tool7State.checklist = Object.assign({}, tool7State.checklist, data.checklist);

  tool7State.userModified = !!data.userModified;

  setPeakMealsMode(tool7State.peakMealsMode);
  calculateGreaseInterceptor();
  if (tool7State.activeStep) setWizardStep(tool7State.activeStep);
}

/**
 * Initialize Tool 7 Listeners & Bindings on DOM load
 */
function initTool7() {
  // Bind Criteria Inputs
  const bindInput = (id, prop) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        tool7State[prop] = e.target.value;
        tool7State.userModified = true;
        window.tool7_modified = true;
        updateProposalPreview();
      });
    }
  };

  bindInput('facilityNameInput', 'facilityName');
  bindInput('facilityAddressInput', 'address');
  bindInput('facilityCityInput', 'city');
  bindInput('contactNameInput', 'contactNameTitle');
  bindInput('contactPhoneInput', 'phone');
  bindInput('contactEmailInput', 'email');
  bindInput('contactAddressDiffInput', 'contactAddress');
  bindInput('plumbingContractorInput', 'contractor');
  bindInput('proposalDateInput', 'proposalDate');

  // Bind Proposed Installation input
  const propInput = document.getElementById('proposedInstallationInput');
  if (propInput) {
    propInput.addEventListener('input', (e) => {
      tool7State.proposedInstallation = e.target.value;
      tool7State.isProposedManual = true;
      tool7State.userModified = true;
      window.tool7_modified = true;
      updateProposalPreview();
    });
  }

  // Bind Sizing Variable Inputs
  const seatInput = document.getElementById('seatingCapacityInput');
  if (seatInput) {
    seatInput.addEventListener('input', (e) => {
      tool7State.seatingCapacity = parseFloat(e.target.value) || 0;
      tool7State.userModified = true;
      window.tool7_modified = true;
      calculateGreaseInterceptor();
    });
  }

  const factorSelect = document.getElementById('mealFactorSelect');
  if (factorSelect) {
    factorSelect.addEventListener('change', (e) => {
      tool7State.mealFactor = parseFloat(e.target.value) || 1.3;
      tool7State.userModified = true;
      window.tool7_modified = true;
      calculateGreaseInterceptor();
    });
  }

  const directInput = document.getElementById('peakMealsDirectInput');
  if (directInput) {
    directInput.addEventListener('input', (e) => {
      tool7State.peakMealsDirect = parseFloat(e.target.value) || 0;
      tool7State.userModified = true;
      window.tool7_modified = true;
      calculateGreaseInterceptor();
    });
  }

  const dispInput = document.getElementById('additionalDisposalsInput');
  if (dispInput) {
    dispInput.addEventListener('input', (e) => {
      tool7State.additionalDisposals = parseInt(e.target.value, 10) || 0;
      tool7State.userModified = true;
      window.tool7_modified = true;
      calculateGreaseInterceptor();
    });
  }

  // Radio Groups
  document.querySelectorAll('input[name="fseTypeRadio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) selectFSEType(e.target.value);
    });
  });

  const otherTextInput = document.getElementById('fseOtherTextInput');
  if (otherTextInput) {
    otherTextInput.addEventListener('input', (e) => {
      tool7State.fseOtherText = e.target.value;
      tool7State.userModified = true;
      window.tool7_modified = true;
      updateProposalPreview();
    });
  }

  document.querySelectorAll('input[name="kitchenTypeRadio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        tool7State.kitchenType = e.target.value;
        if (e.target.value === 'single_service') {
          tool7State.retentionType = 'single';
          tool7State.retentionTime = 1.5;
        }
        tool7State.userModified = true;
        window.tool7_modified = true;
        calculateGreaseInterceptor();
      }
    });
  });

  document.querySelectorAll('input[name="retentionTimeRadio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectRetentionType(e.target.value);
      }
    });
  });

  document.querySelectorAll('input[name="operatingHoursRadio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        tool7State.operatingHours = e.target.value;
        tool7State.userModified = true;
        window.tool7_modified = true;
        calculateGreaseInterceptor();
      }
    });
  });

  // Bind Submittal Checklist Checkboxes
  const bindCheck = (id, prop) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        tool7State.checklist[prop] = e.target.checked;
        tool7State.userModified = true;
        window.tool7_modified = true;
        updateProposalPreview();
      });
    }
  };

  bindCheck('checkSubProposal', 'proposal');
  bindCheck('checkSubBlueprint', 'blueprint');
  bindCheck('checkSubEquipment', 'equipment');
  bindCheck('checkSubSitePlan', 'sitePlan');
  bindCheck('checkSubVerification', 'verification');

  // Initial Calculation Run
  calculateGreaseInterceptor();
}
