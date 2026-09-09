function isTool1Active(t) { return !!(t && (t.userModified || (t.fixtureRows && t.fixtureRows.length > 0))); }
function isTool2Active(t) {
  if (!t) return false;
  if (t.userModified) return true;
  return (t.flowRate && t.flowRate !== 150) || (t.systemLength && t.systemLength !== 250) || (t.pipeMaterial && t.pipeMaterial !== 'carbon_steel') || (t.targetVelocity && t.targetVelocity !== 6.0) || (t.fluidType && t.fluidType !== 'water');
}
function isTool3Active(t) {
  if (!t) return false;
  if (t.userModified || (t.scheduleRows && t.scheduleRows.length > 0)) return true;
  return (t.roofArea && t.roofArea !== 10000) || (t.rainfallRate && t.rainfallRate !== 3.4) || (t.numDrains && t.numDrains !== 2);
}
function isTool4Active(t) {
  if (!t) return false;
  if (t.userModified) return true;
  return (t.currentDuctCFM && t.currentDuctCFM !== 2500) ||
         (t.currentDuctFriction && t.currentDuctFriction !== 0.08) ||
         (t.currentDuctVelocity && t.currentDuctVelocity !== 1200) ||
         (t.currentDuctX && t.currentDuctX !== 18) ||
         (t.currentDuctY && t.currentDuctY !== 16) ||
         (t.activeDuctMode && t.activeDuctMode !== 'friction') ||
         (!!t.isPlenumLimitLocked) ||
         (t.plenumLimitY && t.plenumLimitY !== 15) ||
         (t.activeTool4Tab && t.activeTool4Tab !== 'direct') ||
         (t.revDuctRoundD && t.revDuctRoundD !== 18) ||
         (t.revDuctX && t.revDuctX !== 18) ||
         (t.revDuctY && t.revDuctY !== 16) ||
         (t.revDuctMode && t.revDuctMode !== 'friction');
}
function isTool5Active(t) {
  if (!t) return false;
  if (t.userModified || (t.gasNetworkRows && t.gasNetworkRows.length > 0)) return true;
  return (t.loadValue && t.loadValue !== 500000) || (t.sizingLength && t.sizingLength !== 100) || (t.fuelType && t.fuelType !== 'natural_gas') || (t.material && t.material !== 'sch40_steel') || (t.pressureMode && t.pressureMode !== '0.5') || (t.allowableDrop && t.allowableDrop !== '0.5') || (t.loadUnit && t.loadUnit !== 'btu');
}

// ===================================================================
// MECHANICAL SYSTEM CALCULATIONS SUITE - SHARED CORE UTILITIES (v4.46)
// ===================================================================

const ACTIVE_SESSION_KEY = 'mech_suite_active_draft_v446';
const PROJECT_LIBRARY_KEY = 'mech_suite_project_library_v446';

// -------------------------------------------------------------------
// GOOGLE FIREBASE FIRESTORE CLOUD SYNC CONFIGURATION
// -------------------------------------------------------------------
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB6DwIsgHEqMNwV58vkB2pAccbe4jXF1ow",
  authDomain: "mechanical-suite-db.firebaseapp.com",
  projectId: "mechanical-suite-db",
  storageBucket: "mechanical-suite-db.firebasestorage.app",
  messagingSenderId: "83672983040",
  appId: "1:83672983040:web:efb06647bd7a9ee13c1ae5"
};

let firestoreDB = null;
let isFirestoreInitialized = false;

function initFirebaseFirestore() {
  if (isFirestoreInitialized) return;
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      firestoreDB = firebase.firestore();
      isFirestoreInitialized = true;
      updateCloudSyncBadge(true);
      setupFirestoreRealtimeListener();
    } else {
      updateCloudSyncBadge(false);
    }
  } catch (err) {
    console.warn("Firebase initialization skipped or failed:", err);
    updateCloudSyncBadge(false);
  }
}

function updateCloudSyncBadge(isConnected) {
  const syncBadge = document.getElementById('autoSyncBadge');
  if (syncBadge) {
    if (isConnected) {
      syncBadge.className = "text-[10px] font-semibold text-emerald-400 flex items-center gap-1";
      syncBadge.innerHTML = `<i class="fa-solid fa-cloud text-emerald-400"></i> Cloud Synced (Firestore)`;
      syncBadge.title = "Live real-time cross-device cloud synchronization is active via Google Firebase Firestore.";
    } else {
      syncBadge.className = "text-[10px] font-semibold text-slate-400 flex items-center gap-1";
      syncBadge.innerHTML = `<i class="fa-solid fa-hard-drive text-slate-400"></i> Local Storage Only`;
      syncBadge.title = "Operating in local browser storage mode.";
    }
  }
}

function setupFirestoreRealtimeListener() {
  if (!firestoreDB) return;
  firestoreDB.collection("mech_suite_projects").onSnapshot((snapshot) => {
    const cloudProjects = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      data._firestoreId = doc.id;
      cloudProjects.push(data);
    });

    if (cloudProjects.length > 0) {
      cloudProjects.sort((a, b) => new Date(b.metadata?.savedDate || b.metadata?.lastModified || 0) - new Date(a.metadata?.savedDate || a.metadata?.lastModified || 0));
      localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(cloudProjects));
      window.SHARED_PROJECT_LIBRARY = cloudProjects;
      renderProjectLibraryTable();
    } else if (window.SHARED_PROJECT_LIBRARY && window.SHARED_PROJECT_LIBRARY.length > 0) {
      seedInitialProjectsToFirestore();
    }
  }, (err) => {
    console.warn("Firestore listener error:", err);
    updateCloudSyncBadge(false);
  });
}

async function seedInitialProjectsToFirestore() {
  if (!firestoreDB || !window.SHARED_PROJECT_LIBRARY || window.SHARED_PROJECT_LIBRARY.length === 0) return;
  try {
    for (const proj of window.SHARED_PROJECT_LIBRARY) {
      const pName = proj.metadata?.projectName || 'Project';
      const docId = pName.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 100);
      await firestoreDB.collection("mech_suite_projects").doc(docId).set(proj);
    }
  } catch (e) {
    console.warn("Could not seed initial projects to Firestore:", e);
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = !html.classList.contains('light');
  const icon = document.getElementById('theme-toggle-icon');
  const text = document.getElementById('theme-toggle-text');
  
  if (isDark) {
    html.classList.add('light');
    if (icon) icon.className = 'fa-solid fa-moon text-indigo-400 text-sm';
    if (text) text.innerText = 'Dark';
    localStorage.setItem('ps_theme', 'light');
  } else {
    html.classList.remove('light');
    if (icon) icon.className = 'fa-solid fa-sun text-amber-400 text-sm';
    if (text) text.innerText = 'Light';
    localStorage.setItem('ps_theme', 'dark');
  }
}

function initTheme() {
  const saved = localStorage.getItem('ps_theme');
  const icon = document.getElementById('theme-toggle-icon');
  const text = document.getElementById('theme-toggle-text');
  if (saved === 'dark') {
    document.documentElement.classList.remove('light');
    if (icon) icon.className = 'fa-solid fa-sun text-amber-400 text-sm';
    if (text) text.innerText = 'Light';
  } else {
    document.documentElement.classList.add('light');
    if (icon) icon.className = 'fa-solid fa-moon text-indigo-400 text-sm';
    if (text) text.innerText = 'Dark';
  }
}

// -------------------------------------------------------------------
// REAL-TIME ACTIVE SESSION DRAFT SYNC (PRESERVES ALL UNLOADED TOOLS)
// -------------------------------------------------------------------
function saveActiveDraftState() {
  try {
    let state = {};
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) {
      try { state = JSON.parse(raw); } catch (e) { state = {}; }
    }

    if (!state.metadata) {
      state.metadata = { projectName: '', author: '' };
    }

    // Sync metadata from any active input on page
    const pName = document.getElementById('modalProjectName')?.value?.trim() || document.getElementById('projectNameInput')?.value?.trim();
    const pAuthor = document.getElementById('modalAuthor')?.value?.trim() || document.getElementById('projectAuthorInput')?.value?.trim();
    if (pName) state.metadata.projectName = pName;
    if (pAuthor) state.metadata.author = pAuthor;
    state.metadata.lastModified = new Date().toISOString();

    // Tool 1 (Plumbing Fixtures) - Update if loaded, else preserve
    if (typeof fixtureRows !== 'undefined' && Array.isArray(fixtureRows)) {
      state.tool1 = {
        userModified: window.tool1_modified || (typeof state.tool1 !== 'undefined' && state.tool1.userModified) || false,
        fixtureRows: fixtureRows,
        activeCode: typeof activeCode !== 'undefined' ? activeCode : 'IPC',
        activeSystem: typeof activeSystem !== 'undefined' ? activeSystem : 'valve',
        materialFamily: typeof activeMaterialFamily !== 'undefined' ? activeMaterialFamily : 'copper',
        materialType: typeof activeMaterialType !== 'undefined' ? activeMaterialType : 'type_l',
        drainType: typeof activeDrainType !== 'undefined' ? activeDrainType : 'horizontal',
        drainSlope: typeof activeDrainSlope !== 'undefined' ? activeDrainSlope : '1_4',
        continuousGPM: typeof continuousGPM !== 'undefined' ? continuousGPM : 0,
        customColdVelocity: typeof customColdVelocity !== 'undefined' ? customColdVelocity : null,
        customHotVelocity: typeof customHotVelocity !== 'undefined' ? customHotVelocity : null
      };
    }

    // Tool 2 (Pumping Economics) - Update if loaded, else preserve
    if (document.getElementById('flowRate')) {
      state.tool2 = {
        userModified: window.tool2_modified || isTool2Active(state.tool2) || (parseFloat(document.getElementById('flowRate')?.value || 150) !== 150),
        flowRate: parseFloat(document.getElementById('flowRate')?.value || 150),
        targetMode: typeof activeTool2TargetMode !== 'undefined' ? activeTool2TargetMode : 'velocity',
        targetVelocity: parseFloat(document.getElementById('targetVelocity')?.value || 6.0),
        targetFriction: parseFloat(document.getElementById('targetFriction')?.value || 4.0),
        pipeMaterial: document.getElementById('pipeMaterial')?.value || 'carbon_steel',
        pipeSchedule: document.getElementById('pipeSchedule')?.value || 'Schedule 40',
        pipeRoughness: document.getElementById('pipeRoughness')?.value || '140',
        fluidType: document.getElementById('fluidType')?.value || 'water',
        temperature: parseFloat(document.getElementById('temperature')?.value || 60),
        glycolPct: parseFloat(document.getElementById('glycolPct')?.value || 30),
        systemLength: parseFloat(document.getElementById('systemLength')?.value || 250),
        fittingAllowance: parseFloat(document.getElementById('fittingAllowance')?.value || 50),
        electricityRate: parseFloat(document.getElementById('electricityRate')?.value || 0.12),
        operatingHours: parseFloat(document.getElementById('operatingHours')?.value || 8760),
        systemEfficiency: parseFloat(document.getElementById('systemEfficiency')?.value || 80)
      };
    }

    // Tool 3 (Storm Drainage) - Update if loaded, else preserve
    if (document.getElementById('roofArea')) {
      state.tool3 = {
        userModified: window.tool3_modified || isTool3Active(state.tool3) || (parseFloat(document.getElementById('roofArea')?.value || 10000) !== 10000),
        citySelect: document.getElementById('citySelect')?.value || '3.4',
        rainfallRate: parseFloat(document.getElementById('rainfallRate')?.value || 3.4),
        qsPipeSlope: document.getElementById('qsPipeSlope')?.value || '0.125',
        qsPipeMaterial: document.getElementById('qsPipeMaterial')?.value || '0.009',
        roofArea: parseFloat(document.getElementById('roofArea')?.value || 10000),
        numDrains: parseInt(document.getElementById('numDrains')?.value || 2, 10),
        wallAreas: Array.from(document.querySelectorAll('.wall-area-input')).map(i => parseFloat(i.value) || 0),
        scheduleRows: typeof scheduleRows !== 'undefined' ? scheduleRows : []
      };
    }

    // Tool 4 (HVAC Ductulator) - Update if loaded, else preserve
    if (document.getElementById('ductInputCFM')) {
      state.tool4 = {
        userModified: window.tool4_modified || isTool4Active(state.tool4) || (typeof currentDuctCFM !== 'undefined' && currentDuctCFM !== 2500),
        activeDuctMode: typeof activeDuctMode !== 'undefined' ? activeDuctMode : 'friction',
        currentDuctCFM: typeof currentDuctCFM !== 'undefined' ? currentDuctCFM : 2500,
        currentDuctFriction: typeof currentDuctFriction !== 'undefined' ? currentDuctFriction : 0.08,
        currentDuctVelocity: typeof currentDuctVelocity !== 'undefined' ? currentDuctVelocity : 1200,
        currentDuctX: typeof currentDuctX !== 'undefined' ? currentDuctX : 18,
        currentDuctY: typeof currentDuctY !== 'undefined' ? currentDuctY : 16,
        isPlenumLimitLocked: typeof isPlenumLimitLocked !== 'undefined' ? isPlenumLimitLocked : false,
        plenumLimitY: typeof plenumLimitY !== 'undefined' ? plenumLimitY : 15,
        activeTool4Tab: typeof activeTool4Tab !== 'undefined' ? activeTool4Tab : 'direct',
        revDuctMode: typeof revDuctMode !== 'undefined' ? revDuctMode : 'friction',
        revDuctFriction: typeof revDuctFriction !== 'undefined' ? revDuctFriction : 0.08,
        revDuctVelocity: typeof revDuctVelocity !== 'undefined' ? revDuctVelocity : 1200,
        revDuctRoundD: typeof revDuctRoundD !== 'undefined' ? revDuctRoundD : 18,
        revDuctX: typeof revDuctX !== 'undefined' ? revDuctX : 18,
        revDuctY: typeof revDuctY !== 'undefined' ? revDuctY : 16
      };
    }

    // Tool 5 (Fuel Gas) - Update if loaded, else preserve
    if (document.getElementById('gasInputLoadValue')) {
      state.tool5 = {
        userModified: window.tool5_modified || isTool5Active(state.tool5) || (parseFloat(document.getElementById('gasInputLoadValue')?.value || 500000) !== 500000),
        fuelType: document.getElementById('gasFuelTypeSelect')?.value || 'natural_gas',
        material: document.getElementById('gasMaterialSelect')?.value || 'sch40_steel',
        pressureMode: document.getElementById('gasPressureModeSelect')?.value || '0.5',
        allowableDrop: document.getElementById('gasAllowableDropSelect')?.value || '0.5',
        loadUnit: typeof currentGasLoadUnit !== 'undefined' ? currentGasLoadUnit : 'btu',
        loadValue: parseFloat(document.getElementById('gasInputLoadValue')?.value || 500000),
        sizingLength: parseFloat(document.getElementById('gasInputLength')?.value || 100),
        fittingPct: parseFloat(document.getElementById('gasSliderFitting')?.value || 20),
        maxVelocity: parseFloat(document.getElementById('gasInputMaxVelocity')?.value || 30),
        fuelTypeLL: document.getElementById('gasFuelTypeSelectLL')?.value || 'natural_gas',
        materialLL: document.getElementById('gasMaterialSelectLL')?.value || 'sch40_steel',
        pressureModeLL: document.getElementById('gasPressureModeSelectLL')?.value || '0.5',
        allowableDropLL: document.getElementById('gasAllowableDropSelectLL')?.value || '0.5',
        sizingLengthLL: parseFloat(document.getElementById('gasInputLengthLL')?.value || 750),
        fittingPctLL: parseFloat(document.getElementById('gasSliderFittingLL')?.value || 20),
        applianceConnLengthLL: parseFloat(document.getElementById('gasInputConnLengthLL')?.value || 20),
        scheduleLoadUnit: typeof gasScheduleLoadUnit !== 'undefined' ? gasScheduleLoadUnit : 'mbh',
        gasNetworkRows: typeof gasNetworkRows !== 'undefined' ? gasNetworkRows : []
      };
    }

    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving active draft:", e);
  }
}

function loadActiveDraftState() {
  try {
    let raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) {
      const legacyDraftKeys = [
        'mech_suite_active_draft_v445',
        'mech_suite_active_draft_v444',
        'mech_suite_active_draft_v442',
        'mech_suite_active_draft_v441'
      ];
      for (const legacyKey of legacyDraftKeys) {
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw) {
          localStorage.setItem(ACTIVE_SESSION_KEY, legacyRaw);
          raw = legacyRaw;
          break;
        }
      }
    }
    if (!raw) return;
    const state = JSON.parse(raw);
    importProjectState(state);
  } catch (e) {
    console.error("Error loading active draft:", e);
  }
}

function resetActiveDraftToDefaults() {
  if (confirm("Are you sure you want to clear your current working draft and start a new clean project session?")) {
    window.tool1_modified = false;
    window.tool2_modified = false;
    window.tool3_modified = false;
    window.tool4_modified = false;
    window.tool5_modified = false;

    const draftKeys = [
      ACTIVE_SESSION_KEY,
      'mech_suite_active_draft_v445',
      'mech_suite_active_draft_v444',
      'mech_suite_active_draft_v442',
      'mech_suite_active_draft_v441',
      'mech_suite_active_draft_v440',
      'mech_suite_active_draft'
    ];
    draftKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });

    const nameElem = document.getElementById('projectNameInput');
    const authorElem = document.getElementById('projectAuthorInput');
    const modalName = document.getElementById('modalProjectName');
    const modalAuthor = document.getElementById('modalAuthor');

    if (nameElem) nameElem.value = 'Untitled Mechanical Project';
    if (authorElem) authorElem.value = '';
    if (modalName) modalName.value = 'Untitled Mechanical Project';
    if (modalAuthor) modalAuthor.value = '';

    window.location.reload();
  }
}

// -------------------------------------------------------------------
// IN-BROWSER PROJECT LIBRARY MANAGEMENT
// -------------------------------------------------------------------
function getSavedProjectsLibrary() {
  try {
    let raw = localStorage.getItem(PROJECT_LIBRARY_KEY);
    if (!raw) {
      const legacyKeys = [
        'mech_suite_project_library_v445',
        'mech_suite_project_library_v444',
        'mech_suite_project_library_v442',
        'mech_suite_project_library_v441'
      ];
      for (const legacyKey of legacyKeys) {
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw) {
          localStorage.setItem(PROJECT_LIBRARY_KEY, legacyRaw);
          raw = legacyRaw;
          break;
        }
      }
    }
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function saveActiveSessionToLibrary() {
  saveActiveDraftState();
  const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
  let activeState = {};
  if (raw) {
    try { activeState = JSON.parse(raw); } catch (e) { activeState = {}; }
  }

  const modalName = document.getElementById('modalProjectName')?.value?.trim();
  const dashName = document.getElementById('projectNameInput')?.value?.trim();
  const modalAuthor = document.getElementById('modalAuthor')?.value?.trim();
  const dashAuthor = document.getElementById('projectAuthorInput')?.value?.trim();

  const projName = modalName || dashName || activeState.metadata?.projectName || '';
  const projAuthor = modalAuthor || dashAuthor || activeState.metadata?.author || '';

  if (!projName || projName.toLowerCase() === 'untitled mechanical project') {
    showToast('Project Name Required', 'Please enter a valid Project Name before saving.', false);
    const nameElem = document.getElementById('modalProjectName') || document.getElementById('projectNameInput');
    if (nameElem) { nameElem.focus(); nameElem.classList.add('border-rose-500'); }
    return;
  }

  if (!projAuthor) {
    showToast('Author Required', 'Please enter the Author / Engineer name before saving.', false);
    const authorElem = document.getElementById('modalAuthor') || document.getElementById('projectAuthorInput');
    if (authorElem) { authorElem.focus(); authorElem.classList.add('border-rose-500'); }
    return;
  }

  if (document.getElementById('modalProjectName')) document.getElementById('modalProjectName').classList.remove('border-rose-500');
  if (document.getElementById('projectNameInput')) document.getElementById('projectNameInput').classList.remove('border-rose-500');
  if (document.getElementById('modalAuthor')) document.getElementById('modalAuthor').classList.remove('border-rose-500');
  if (document.getElementById('projectAuthorInput')) document.getElementById('projectAuthorInput').classList.remove('border-rose-500');

  if (!activeState.metadata) activeState.metadata = {};
  activeState.metadata.projectName = projName;
  activeState.metadata.author = projAuthor;
  activeState.metadata.savedDate = new Date().toISOString();

  let library = getSavedProjectsLibrary();
  const targetSelect = document.getElementById('saveSessionTargetSelect');
  const targetVal = targetSelect ? targetSelect.value : 'new';

  let docId = (projName || 'project').toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 100);

  if (targetVal !== 'new' && !isNaN(parseInt(targetVal, 10))) {
    const idx = parseInt(targetVal, 10);
    if (library[idx]) {
      const oldDocId = library[idx]._firestoreId || (library[idx].metadata?.projectName || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 100);
      if (oldDocId && oldDocId !== docId && firestoreDB) {
        try { firestoreDB.collection("mech_suite_projects").doc(oldDocId).delete(); } catch(e) {}
      }
      library[idx] = activeState;
      showToast('Session Overwritten', `Overwrote saved session "${projName}" in library.`);
    }
  } else {
    const existingIdx = library.findIndex(p => (p.metadata?.projectName || '').toLowerCase() === projName.toLowerCase());
    if (existingIdx >= 0) {
      library[existingIdx] = activeState;
      showToast('Library Updated', `Updated saved session "${projName}" in library.`);
    } else {
      library.unshift(activeState);
      showToast('Session Saved', `Saved "${projName}" to Project Library.`);
    }
  }

  localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(library));
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(activeState));
  window.SHARED_PROJECT_LIBRARY = library;
  renderProjectLibraryTable();

  // Save directly to Google Cloud Firestore across all devices
  if (firestoreDB) {
    try {
      activeState._firestoreId = docId;
      await firestoreDB.collection("mech_suite_projects").doc(docId).set(activeState);
      showToast('Cloud Synced', `Saved "${projName}" to Cloud Database across all devices!`);
      updateCloudSyncBadge(true);
    } catch (cloudErr) {
      console.warn("Error saving to Firestore:", cloudErr);
      showToast('Local Saved', `Saved locally. Cloud sync: ${cloudErr.message || 'Error'}`, false);
    }
  }
  
  await writeDirectToSharedFileHandle();
  closeSaveSessionModal();
}

function loadProjectFromLibrary(index) {
  const library = getSavedProjectsLibrary();
  if (!library[index]) return;
  const project = library[index];
  
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(project));
  importProjectState(project);
  showToast('Session Loaded', `Loaded "${project.metadata.projectName}" across all tools!`);
  renderProjectLibraryTable();
}

async function deleteProjectFromLibrary(index) {
  let library = getSavedProjectsLibrary();
  if (!library[index]) return;
  const proj = library[index];
  const name = proj.metadata?.projectName || 'Project';
  if (confirm(`Delete saved session "${name}" from the project library?

This will remove the session from the cloud database and your local browser.`)) {
    const docId = proj._firestoreId || (name.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 100));
    if (firestoreDB) {
      try {
        await firestoreDB.collection("mech_suite_projects").doc(docId).delete();
      } catch (cloudErr) {
        console.warn("Error deleting from Firestore:", cloudErr);
      }
    }
    library.splice(index, 1);
    localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(library));
    window.SHARED_PROJECT_LIBRARY = library;
    renderProjectLibraryTable();
    showToast('Session Deleted', `Removed "${name}" from library.`);
    await writeDirectToSharedFileHandle();
  }
}

function exportLibraryProjectAsJSON(index) {
  const library = getSavedProjectsLibrary();
  if (!library[index]) return;
  const project = library[index];
  const jsonStr = JSON.stringify(project, null, 2);
  const fileName = `${(project.metadata?.projectName || 'Project').replace(/[^a-z0-9_-]/gi, '_')}_${new Date().toISOString().slice(0,10)}.json`;

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('File Exported', `Downloaded ${fileName}`);
}

let currentEditLibraryIdx = -1;

function openEditSessionModal(index) {
  const library = getSavedProjectsLibrary();
  if (!library[index]) return;
  currentEditLibraryIdx = index;
  const project = library[index];

  const editNameInput = document.getElementById('editModalProjectName');
  const editAuthorInput = document.getElementById('editModalAuthor');
  if (editNameInput) editNameInput.value = project.metadata?.projectName || '';
  if (editAuthorInput) editAuthorInput.value = project.metadata?.author || '';

  const modal = document.getElementById('editSessionModal');
  if (modal) modal.classList.remove('hidden');
}

function closeEditSessionModal() {
  const modal = document.getElementById('editSessionModal');
  if (modal) modal.classList.add('hidden');
  currentEditLibraryIdx = -1;
}

async function saveEditedSessionDetails() {
  if (currentEditLibraryIdx < 0) return;
  let library = getSavedProjectsLibrary();
  if (!library[currentEditLibraryIdx]) return;

  const newName = document.getElementById('editModalProjectName')?.value?.trim();
  const newAuthor = document.getElementById('editModalAuthor')?.value?.trim();

  if (!newName || newName.toLowerCase() === 'untitled mechanical project') {
    showToast('Name Required', 'Please enter a valid Project Name.', false);
    return;
  }
  if (!newAuthor) {
    showToast('Author Required', 'Please enter the Author name.', false);
    return;
  }

  const oldDocId = library[currentEditLibraryIdx]._firestoreId || (library[currentEditLibraryIdx].metadata?.projectName || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 100);
  const newDocId = newName.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 100);

  if (!library[currentEditLibraryIdx].metadata) library[currentEditLibraryIdx].metadata = {};
  library[currentEditLibraryIdx].metadata.projectName = newName;
  library[currentEditLibraryIdx].metadata.author = newAuthor;
  library[currentEditLibraryIdx].metadata.lastModified = new Date().toISOString();
  library[currentEditLibraryIdx]._firestoreId = newDocId;

  const rawActive = localStorage.getItem(ACTIVE_SESSION_KEY);
  if (rawActive) {
    try {
      let activeState = JSON.parse(rawActive);
      if (activeState.metadata) {
        activeState.metadata.projectName = newName;
        activeState.metadata.author = newAuthor;
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(activeState));
        importProjectState(activeState);
      }
    } catch(e) {}
  }

  localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(library));
  window.SHARED_PROJECT_LIBRARY = library;
  showToast('Session Updated', `Updated details for "${newName}".`);
  renderProjectLibraryTable();

  // Update in Google Cloud Firestore
  if (firestoreDB) {
    try {
      if (oldDocId && oldDocId !== newDocId) {
        firestoreDB.collection("mech_suite_projects").doc(oldDocId).delete();
      }
      firestoreDB.collection("mech_suite_projects").doc(newDocId).set(library[currentEditLibraryIdx]);
      showToast('Cloud Updated', `Updated "${newName}" in Cloud Database!`);
    } catch (cloudErr) {
      console.warn("Error updating Firestore:", cloudErr);
    }
  }

  await writeDirectToSharedFileHandle();
  closeEditSessionModal();
}

function handleSaveSessionTargetChange(val) {
  const modalNameInput = document.getElementById('modalProjectName');
  const modalAuthorInput = document.getElementById('modalAuthor');
  const dashNameInput = document.getElementById('projectNameInput');
  const dashAuthorInput = document.getElementById('projectAuthorInput');
  const btnLoad = document.getElementById('btnModalLoadSession');

  if (val === 'new') {
    if (btnLoad) btnLoad.classList.add('hidden');
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    let activeState = {};
    if (raw) { try { activeState = JSON.parse(raw); } catch (e) {} }
    
    const pName = dashNameInput?.value?.trim() || activeState.metadata?.projectName || 'Untitled Mechanical Project';
    const pAuthor = dashAuthorInput?.value?.trim() || activeState.metadata?.author || '';

    if (modalNameInput) modalNameInput.value = pName;
    if (modalAuthorInput) modalAuthorInput.value = pAuthor;
  } else if (!isNaN(parseInt(val, 10))) {
    if (btnLoad) btnLoad.classList.remove('hidden');
    const idx = parseInt(val, 10);
    const library = getSavedProjectsLibrary();
    if (library[idx] && library[idx].metadata) {
      const targetName = library[idx].metadata.projectName || '';
      const targetAuthor = library[idx].metadata.author || '';

      if (modalNameInput) modalNameInput.value = targetName;
      if (modalAuthorInput) modalAuthorInput.value = targetAuthor;
      if (dashNameInput) dashNameInput.value = targetName;
      if (dashAuthorInput) dashAuthorInput.value = targetAuthor;
    }
  }
}

function loadSelectedSessionFromModal() {
  const targetSelect = document.getElementById('saveSessionTargetSelect');
  if (!targetSelect || targetSelect.value === 'new') return;
  const idx = parseInt(targetSelect.value, 10);
  if (isNaN(idx)) return;
  loadProjectFromLibrary(idx);
  closeSaveSessionModal();
}

function openSaveSessionModal() {
  saveActiveDraftState();
  const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
  let activeState = {};
  if (raw) {
    try { activeState = JSON.parse(raw); } catch (e) { activeState = {}; }
  }

  const pName = document.getElementById('projectNameInput')?.value?.trim() || activeState.metadata?.projectName || '';
  const pAuthor = document.getElementById('projectAuthorInput')?.value?.trim() || activeState.metadata?.author || '';

  const modalNameInput = document.getElementById('modalProjectName');
  const modalAuthorInput = document.getElementById('modalAuthor');
  if (modalNameInput) modalNameInput.value = pName;
  if (modalAuthorInput) modalAuthorInput.value = pAuthor;

  const select = document.getElementById('saveSessionTargetSelect');
  if (select) {
    select.innerHTML = '<option value="new">+ Save as New Project Session</option>';
    const library = getSavedProjectsLibrary();
    let matchedIdx = -1;

    library.forEach((proj, idx) => {
      const projName = proj.metadata?.projectName || `Session ${idx+1}`;
      const opt = document.createElement('option');
      opt.value = idx;
      opt.innerText = `[Overwrite] ${projName}`;
      if (pName && projName.toLowerCase().trim() === pName.toLowerCase().trim()) {
        matchedIdx = idx;
      }
      select.appendChild(opt);
    });

    select.onchange = function() { handleSaveSessionTargetChange(this.value); };

    if (matchedIdx >= 0) {
      select.value = matchedIdx;
      handleSaveSessionTargetChange(matchedIdx);
    } else {
      select.value = 'new';
      handleSaveSessionTargetChange('new');
    }
  }

  const modal = document.getElementById('saveSessionModal');
  if (modal) modal.classList.remove('hidden');
}

function closeSaveSessionModal() {
  const modal = document.getElementById('saveSessionModal');
  if (modal) modal.classList.add('hidden');
}

function exportActiveSessionAsJSON() {
  saveActiveDraftState();
  const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
  let state = {};
  if (raw) {
    try { state = JSON.parse(raw); } catch (e) { state = {}; }
  }
  const jsonStr = JSON.stringify(state, null, 2);
  const projName = (state.metadata?.projectName || 'Mechanical_Project').replace(/[^a-z0-9_-]/gi, '_');
  const fileName = `${projName}_${new Date().toISOString().slice(0,10)}.json`;

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('File Exported', `Downloaded ${fileName}`);
}

function renderProjectLibraryTable() {
  const tbody = document.getElementById('projectLibraryTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const library = getSavedProjectsLibrary();

  const authorSelect = document.getElementById('libraryAuthorFilter');
  if (authorSelect) {
    const currentSel = authorSelect.value || 'all';
    const authorsSet = new Set();
    library.forEach(p => {
      if (p.metadata?.author && p.metadata.author.trim()) {
        authorsSet.add(p.metadata.author.trim());
      }
    });

    authorSelect.innerHTML = '<option value="all">All Authors</option>';
    Array.from(authorsSet).sort().forEach(author => {
      const opt = document.createElement('option');
      opt.value = author;
      opt.innerText = `Author: ${author}`;
      authorSelect.appendChild(opt);
    });

    if (Array.from(authorsSet).includes(currentSel)) {
      authorSelect.value = currentSel;
    } else {
      authorSelect.value = 'all';
    }
  }

  if (library.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500 font-sans">No saved project sessions in browser library yet. Type a Project Name above and click "Save Session".</td></tr>`;
    return;
  }

  const searchQuery = (document.getElementById('librarySearchInput')?.value || '').toLowerCase().trim();
  const selectedAuthor = document.getElementById('libraryAuthorFilter')?.value || 'all';

  let filteredProjects = library.map((proj, origIdx) => ({ proj, origIdx })).filter(item => {
    const p = item.proj;
    const name = (p.metadata?.projectName || '').toLowerCase();
    const author = (p.metadata?.author || '').toLowerCase();

    const matchesSearch = !searchQuery || name.includes(searchQuery) || author.includes(searchQuery);
    const matchesAuthor = selectedAuthor === 'all' || (p.metadata?.author || '').trim().toLowerCase() === selectedAuthor.toLowerCase();

    return matchesSearch && matchesAuthor;
  });

  if (filteredProjects.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500 font-sans">No saved projects match your search/filter criteria.</td></tr>`;
    return;
  }

  const sortMode = document.getElementById('librarySortSelect')?.value || 'date_desc';

  filteredProjects.sort((a, b) => {
    const pA = a.proj;
    const pB = b.proj;

    if (sortMode === 'date_desc') {
      return new Date(pB.metadata?.savedDate || 0) - new Date(pA.metadata?.savedDate || 0);
    } else if (sortMode === 'date_asc') {
      return new Date(pA.metadata?.savedDate || 0) - new Date(pB.metadata?.savedDate || 0);
    } else if (sortMode === 'name_asc') {
      return (pA.metadata?.projectName || '').localeCompare(pB.metadata?.projectName || '');
    } else if (sortMode === 'author_asc') {
      return (pA.metadata?.author || '').localeCompare(pB.metadata?.author || '');
    } else if (sortMode === 'tools_desc') {
      const countA = (pA.tool1?.fixtureRows?.length > 0 ? 1 : 0) + (pA.tool2?.flowRate ? 1 : 0) + (pA.tool3?.roofArea ? 1 : 0) + (pA.tool4?.currentDuctCFM ? 1 : 0) + (pA.tool5?.loadValue ? 1 : 0);
      const countB = (pB.tool1?.fixtureRows?.length > 0 ? 1 : 0) + (pB.tool2?.flowRate ? 1 : 0) + (pB.tool3?.roofArea ? 1 : 0) + (pB.tool4?.currentDuctCFM ? 1 : 0) + (pB.tool5?.loadValue ? 1 : 0);
      return countB - countA;
    }
    return 0;
  });

  filteredProjects.forEach(item => {
    const proj = item.proj;
    const origIdx = item.origIdx;
    const name = proj.metadata?.projectName || 'Unnamed Project';
    const author = proj.metadata?.author || 'Not specified';
    const dateStr = proj.metadata?.savedDate ? new Date(proj.metadata.savedDate).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
    
    let iconsHtml = '';
    if (isTool1Active(proj.tool1)) {
      const rowCount = proj.tool1.fixtureRows?.length || 0;
      iconsHtml += `<span title="Plumbing Fixtures${rowCount > 0 ? ' (' + rowCount + ' rows)' : ''}" class="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20"><i class="fa-solid fa-faucet-drip text-xs"></i></span> `;
    }
    if (isTool2Active(proj.tool2)) {
      const gpm = proj.tool2.flowRate || 150;
      iconsHtml += `<span title="Pumping Economics (${gpm} GPM)" class="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20"><i class="fa-solid fa-chart-line text-xs"></i></span> `;
    }
    if (isTool3Active(proj.tool3)) {
      iconsHtml += `<span title="Storm Drainage" class="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20"><i class="fa-solid fa-cloud-showers-heavy text-xs"></i></span> `;
    }
    if (isTool4Active(proj.tool4)) {
      const cfm = proj.tool4.currentDuctCFM || 2500;
      iconsHtml += `<span title="HVAC Ductulator (${cfm} CFM)" class="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20"><i class="fa-solid fa-wind text-xs"></i></span> `;
    }
    if (isTool5Active(proj.tool5)) {
      iconsHtml += `<span title="Fuel Gas Pipe Sizer" class="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20"><i class="fa-solid fa-fire-flame-curved text-xs"></i></span> `;
    }

    if (!iconsHtml) {
      iconsHtml = `<span class="text-slate-500 text-[11px] font-sans">No active tools</span>`;
    }

    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-800/40 transition-colors";
    tr.innerHTML = `
      <td class="p-3 font-bold text-white font-sans">${name}</td>
      <td class="p-3 text-slate-300 font-sans">${author}</td>
      <td class="p-3 text-slate-400 mono text-[11px]">${dateStr}</td>
      <td class="p-3"><div class="flex items-center gap-1.5">${iconsHtml}</div></td>
      <td class="p-3 text-center flex items-center justify-center gap-2">
        <button onclick="loadProjectFromLibrary(${origIdx})" class="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1" title="Load this session across all tools">
          <i class="fa-solid fa-folder-open text-[10px]"></i> Load
        </button>
        <button onclick="openEditSessionModal(${origIdx})" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1" title="Edit Project Name & Author">
          <i class="fa-solid fa-pen-to-square text-[10px]"></i> Edit
        </button>
        <button onclick="exportLibraryProjectAsJSON(${origIdx})" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1" title="Download .json file">
          <i class="fa-solid fa-download text-[10px]"></i>
        </button>
        <button onclick="deleteProjectFromLibrary(${origIdx})" class="px-2 py-1 text-rose-400 hover:text-rose-300 rounded-lg text-xs font-bold transition" title="Delete Saved Session">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function showToast(title, message, isSuccess = true) {
  const toast = document.getElementById('toastNotification');
  const tTitle = document.getElementById('toastTitle');
  const tMsg = document.getElementById('toastMessage');
  const tIcon = document.getElementById('toastIcon');
  if (!toast) return;

  if (tTitle) tTitle.innerText = title;
  if (tMsg) tMsg.innerText = message;
  if (tIcon) {
    tIcon.className = isSuccess
      ? 'w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold'
      : 'w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold';
    tIcon.innerHTML = isSuccess ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
  }
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

function updateProjectTitleDisplay() {
  const val = document.getElementById('projectNameInput')?.value;
  const b = document.getElementById('sessionStatusBadge');
  if (b && val) b.innerHTML = `<i class="fa-solid fa-circle-check text-[10px]"></i> ${val}`;
  saveActiveDraftState();
}

function importProjectState(data) {
  if (!data) return;

  try {
    if (data.metadata) {
      if (data.metadata.projectName && document.getElementById('projectNameInput')) document.getElementById('projectNameInput').value = data.metadata.projectName;
      if (data.metadata.author && document.getElementById('projectAuthorInput')) document.getElementById('projectAuthorInput').value = data.metadata.author;
      updateProjectTitleDisplay();
    }

    if (data.tool1 && typeof calculateTool1 === 'function') {
      if (data.tool1.activeCode && typeof setCode === 'function') setCode(data.tool1.activeCode);
      if (data.tool1.activeSystem && typeof setSystem === 'function') setSystem(data.tool1.activeSystem);
      if (data.tool1.materialFamily && typeof onMaterialFamilyChange === 'function') {
        onMaterialFamilyChange(data.tool1.materialFamily);
        if (data.tool1.materialType && typeof setMaterialType === 'function') setMaterialType(data.tool1.materialType);
      }
      if (data.tool1.drainType && typeof setDrainType === 'function') setDrainType(data.tool1.drainType);
      if (data.tool1.drainSlope && typeof setDrainSlope === 'function') setDrainSlope(data.tool1.drainSlope);
      if (data.tool1.continuousGPM !== undefined) {
        continuousGPM = parseFloat(data.tool1.continuousGPM) || 0;
        const input = document.getElementById('continuous-gpm-input');
        if (input) input.value = continuousGPM;
      }
      if (data.tool1.customColdVelocity !== undefined) customColdVelocity = data.tool1.customColdVelocity;
      if (data.tool1.customHotVelocity !== undefined) customHotVelocity = data.tool1.customHotVelocity;

      if (Array.isArray(data.tool1.fixtureRows)) {
        fixtureRows = data.tool1.fixtureRows;
        rowCounter = fixtureRows.reduce((max, r) => Math.max(max, r.id || 0), 0) + 1;
      }
      if (typeof renderRows === 'function') renderRows();
      calculateTool1();
    }

    if (data.tool2 && typeof calculateSizingMatrix === 'function') {
      if (data.tool2.flowRate && document.getElementById('flowRate')) document.getElementById('flowRate').value = data.tool2.flowRate;
      if (data.tool2.targetMode && typeof setTool2TargetMode === 'function') setTool2TargetMode(data.tool2.targetMode);
      if (data.tool2.targetVelocity && document.getElementById('targetVelocity')) document.getElementById('targetVelocity').value = data.tool2.targetVelocity;
      if (data.tool2.targetFriction && document.getElementById('targetFriction')) document.getElementById('targetFriction').value = data.tool2.targetFriction;
      if (data.tool2.pipeMaterial && document.getElementById('pipeMaterial')) {
        document.getElementById('pipeMaterial').value = data.tool2.pipeMaterial;
        populateSchedules(data.tool2.pipeMaterial);
        updateRoughnessOptions();
      }
      if (data.tool2.pipeSchedule && document.getElementById('pipeSchedule')) document.getElementById('pipeSchedule').value = data.tool2.pipeSchedule;
      if (data.tool2.pipeRoughness && document.getElementById('pipeRoughness')) document.getElementById('pipeRoughness').value = data.tool2.pipeRoughness;
      if (data.tool2.fluidType && document.getElementById('fluidType')) {
        document.getElementById('fluidType').value = data.tool2.fluidType;
        handleFluidChange();
      }
      if (data.tool2.temperature && document.getElementById('temperature')) { document.getElementById('temperature').value = data.tool2.temperature; updateTemperatureLabel(); }
      if (data.tool2.glycolPct && document.getElementById('glycolPct')) { document.getElementById('glycolPct').value = data.tool2.glycolPct; updateGlycolLabel(); }
      if (data.tool2.systemLength && document.getElementById('systemLength')) { document.getElementById('systemLength').value = data.tool2.systemLength; }
      if (data.tool2.fittingAllowance && document.getElementById('fittingAllowance')) { document.getElementById('fittingAllowance').value = data.tool2.fittingAllowance; updateFittingLabel(); }
      if (data.tool2.electricityRate && document.getElementById('electricityRate')) { document.getElementById('electricityRate').value = data.tool2.electricityRate; }
      if (data.tool2.operatingHours && document.getElementById('operatingHours')) { document.getElementById('operatingHours').value = data.tool2.operatingHours; }
      if (data.tool2.systemEfficiency && document.getElementById('systemEfficiency')) { document.getElementById('systemEfficiency').value = data.tool2.systemEfficiency; }
      calculateSizingMatrix();
    }

    if (data.tool3 && typeof calculateQuickSize === 'function') {
      if (data.tool3.citySelect && document.getElementById('citySelect')) document.getElementById('citySelect').value = data.tool3.citySelect;
      if (data.tool3.rainfallRate && document.getElementById('rainfallRate')) document.getElementById('rainfallRate').value = data.tool3.rainfallRate;
      if (data.tool3.qsPipeSlope && typeof syncSlope === 'function') syncSlope(data.tool3.qsPipeSlope);
      if (data.tool3.qsPipeMaterial && typeof syncStormMaterial === 'function') syncStormMaterial(data.tool3.qsPipeMaterial);
      if (data.tool3.roofArea && document.getElementById('roofArea')) document.getElementById('roofArea').value = data.tool3.roofArea;
      if (data.tool3.numDrains) {
        const el = document.getElementById('numDrains');
        const valEl = document.getElementById('numDrainsVal');
        if (el) el.value = data.tool3.numDrains;
        if (valEl) valEl.innerText = data.tool3.numDrains;
      }
      if (Array.isArray(data.tool3.wallAreas)) {
        const wallInputs = document.querySelectorAll('.wall-area-input');
        data.tool3.wallAreas.forEach((val, idx) => { if (wallInputs[idx]) wallInputs[idx].value = val; });
      }
      if (Array.isArray(data.tool3.scheduleRows)) {
        scheduleRows = data.tool3.scheduleRows;
        if (typeof renderScheduleTable === 'function') renderScheduleTable();
      }
      calculateQuickSize();
      if (typeof updateScheduleCalculations === 'function') updateScheduleCalculations();
      if (typeof drawHydraulicCanvas === 'function') {
        drawHydraulicCanvas('QS');
        drawHydraulicCanvas('Sched');
      }
    }

    if (data.tool4 && typeof calculateDuctulator === 'function') {
      // 1. Restore Plenum Limit Settings
      if (typeof onPlenumLimitInput === 'function' && data.tool4.plenumLimitY !== undefined) {
        onPlenumLimitInput(data.tool4.plenumLimitY);
      }
      if (typeof togglePlenumLimit === 'function' && data.tool4.isPlenumLimitLocked !== undefined) {
        togglePlenumLimit(!!data.tool4.isPlenumLimitLocked);
      }

      // 2. Restore Direct Sizing Engine parameters
      if (data.tool4.activeDuctMode && typeof setDuctMode === 'function') {
        setDuctMode(data.tool4.activeDuctMode);
      }
      if (data.tool4.currentDuctCFM !== undefined) {
        currentDuctCFM = Math.max(10, Math.min(100000, parseInt(data.tool4.currentDuctCFM, 10) || 2500));
        const sCFM = document.getElementById('ductSliderCFM');
        const iCFM = document.getElementById('ductInputCFM');
        const dCFM = document.getElementById('ductDisplayCFM');
        if (sCFM) sCFM.value = Math.min(50000, currentDuctCFM);
        if (iCFM) iCFM.value = currentDuctCFM;
        if (dCFM) dCFM.innerText = currentDuctCFM.toLocaleString() + ' CFM';
      }
      if (data.tool4.currentDuctFriction !== undefined) {
        currentDuctFriction = parseFloat(data.tool4.currentDuctFriction) || 0.08;
        const sF = document.getElementById('ductSliderFriction');
        const iF = document.getElementById('ductInputFriction');
        const dF = document.getElementById('ductDisplayFriction');
        if (sF) sF.value = currentDuctFriction;
        if (iF) iF.value = currentDuctFriction.toFixed(2);
        if (dF) dF.innerText = currentDuctFriction.toFixed(2) + ' in. w.g.';
      }
      if (data.tool4.currentDuctVelocity !== undefined) {
        currentDuctVelocity = parseFloat(data.tool4.currentDuctVelocity) || 1200;
        const sV = document.getElementById('ductSliderVelocity');
        const iV = document.getElementById('ductInputVelocity');
        const dV = document.getElementById('ductDisplayVelocity');
        if (sV) sV.value = Math.min(4000, currentDuctVelocity);
        if (iV) iV.value = Math.round(currentDuctVelocity);
        if (dV) dV.innerText = Math.round(currentDuctVelocity).toLocaleString() + ' FPM';
      }
      if (data.tool4.currentDuctX !== undefined) {
        currentDuctX = parseInt(data.tool4.currentDuctX, 10) || 18;
        const sX = document.getElementById('ductSliderX');
        const iX = document.getElementById('ductInputX');
        const dX = document.getElementById('ductDisplayX');
        if (sX) sX.value = Math.min(120, currentDuctX);
        if (iX) iX.value = currentDuctX;
        if (dX) dX.innerText = currentDuctX + '"';
      }
      if (data.tool4.currentDuctY !== undefined) {
        currentDuctY = parseInt(data.tool4.currentDuctY, 10) || 16;
        const sY = document.getElementById('ductSliderY');
        const iY = document.getElementById('ductInputY');
        const dY = document.getElementById('ductDisplayY');
        if (sY) sY.value = Math.min(typeof plenumLimitY !== 'undefined' && isPlenumLimitLocked ? plenumLimitY : 120, currentDuctY);
        if (iY) iY.value = currentDuctY;
        if (dY) dY.innerText = currentDuctY + '"';
      }

      // Calculate direct engine without auto-overriding saved X and Y
      calculateDuctulator('applied_rec');

      // 3. Restore Reverse CFM Lookup Engine parameters
      if (data.tool4.revDuctMode && typeof setRevDuctMode === 'function') {
        setRevDuctMode(data.tool4.revDuctMode);
      }
      if (data.tool4.revDuctFriction !== undefined && typeof onRevDuctFrictionInput === 'function') {
        onRevDuctFrictionInput('program', data.tool4.revDuctFriction);
      }
      if (data.tool4.revDuctVelocity !== undefined && typeof onRevDuctVelocityInput === 'function') {
        onRevDuctVelocityInput('program', data.tool4.revDuctVelocity);
      }
      if (data.tool4.revDuctRoundD !== undefined) {
        revDuctRoundD = parseInt(data.tool4.revDuctRoundD, 10) || 18;
        const s = document.getElementById('revDuctSliderRound');
        const i = document.getElementById('revDuctInputRound');
        const d = document.getElementById('revDuctDisplayRound');
        if (s) s.value = revDuctRoundD;
        if (i) i.value = revDuctRoundD;
        if (d) d.innerText = revDuctRoundD + '"';
      }
      if (data.tool4.revDuctX !== undefined) {
        revDuctX = parseInt(data.tool4.revDuctX, 10) || 18;
        const s = document.getElementById('revDuctSliderX');
        const i = document.getElementById('revDuctInputX');
        const d = document.getElementById('revDuctDisplayX');
        if (s) s.value = revDuctX;
        if (i) i.value = revDuctX;
        if (d) d.innerText = revDuctX + '"';
      }
      if (data.tool4.revDuctY !== undefined) {
        revDuctY = parseInt(data.tool4.revDuctY, 10) || 16;
        const s = document.getElementById('revDuctSliderY');
        const i = document.getElementById('revDuctInputY');
        const d = document.getElementById('revDuctDisplayY');
        if (s) s.value = revDuctY;
        if (i) i.value = revDuctY;
        if (d) d.innerText = revDuctY + '"';
      }
      if (typeof calculateReverseDuctulator === 'function') {
        calculateReverseDuctulator('program');
      }

      // 4. Switch to the saved active subpage tab
      if (data.tool4.activeTool4Tab && typeof switchTool4Tab === 'function') {
        switchTool4Tab(data.tool4.activeTool4Tab);
      }

      // 5. Redraw canvases
      if (typeof drawDuctCanvas === 'function') drawDuctCanvas();
      if (typeof drawReverseDuctCanvas === 'function') drawReverseDuctCanvas();

      // 6. Keep tool4 internal drafts in sync with loaded session
      if (typeof savePlenumLimitDraft === 'function') savePlenumLimitDraft();
      if (typeof saveTool4ReverseDraft === 'function') saveTool4ReverseDraft();
    }

    if (data.tool5 && typeof calculateGasSizing === 'function') {
      if (data.tool5.fuelType && document.getElementById('gasFuelTypeSelect')) document.getElementById('gasFuelTypeSelect').value = data.tool5.fuelType;
      if (data.tool5.material && document.getElementById('gasMaterialSelect')) document.getElementById('gasMaterialSelect').value = data.tool5.material;
      if (data.tool5.pressureMode && document.getElementById('gasPressureModeSelect')) document.getElementById('gasPressureModeSelect').value = data.tool5.pressureMode;
      if (data.tool5.allowableDrop && document.getElementById('gasAllowableDropSelect')) document.getElementById('gasAllowableDropSelect').value = data.tool5.allowableDrop;
      if (data.tool5.loadUnit && typeof setGasLoadUnit === 'function') setGasLoadUnit(data.tool5.loadUnit);
      if (data.tool5.loadValue && document.getElementById('gasInputLoadValue')) document.getElementById('gasInputLoadValue').value = data.tool5.loadValue;
      if (data.tool5.sizingLength && typeof syncGasLength === 'function') syncGasLength('program', data.tool5.sizingLength);
      if (data.tool5.fittingPct && typeof syncGasFitting === 'function') syncGasFitting(data.tool5.fittingPct);
      if (data.tool5.maxVelocity && document.getElementById('gasInputMaxVelocity')) document.getElementById('gasInputMaxVelocity').value = data.tool5.maxVelocity;

      if (data.tool5.fuelTypeLL && document.getElementById('gasFuelTypeSelectLL')) document.getElementById('gasFuelTypeSelectLL').value = data.tool5.fuelTypeLL;
      if (data.tool5.materialLL && document.getElementById('gasMaterialSelectLL')) document.getElementById('gasMaterialSelectLL').value = data.tool5.materialLL;
      if (data.tool5.pressureModeLL && document.getElementById('gasPressureModeSelectLL')) document.getElementById('gasPressureModeSelectLL').value = data.tool5.pressureModeLL;
      if (data.tool5.allowableDropLL && document.getElementById('gasAllowableDropSelectLL')) document.getElementById('gasAllowableDropSelectLL').value = data.tool5.allowableDropLL;
      if (data.tool5.sizingLengthLL && typeof syncGasLengthLL === 'function') syncGasLengthLL('program', data.tool5.sizingLengthLL);
      if (data.tool5.fittingPctLL && typeof syncGasFittingLL === 'function') syncGasFittingLL(data.tool5.fittingPctLL);
      if (data.tool5.applianceConnLengthLL && typeof syncGasConnLengthLL === 'function') syncGasConnLengthLL('program', data.tool5.applianceConnLengthLL);
      if (data.tool5.scheduleLoadUnit && typeof setGasScheduleLoadUnit === 'function') setGasScheduleLoadUnit(data.tool5.scheduleLoadUnit);

      if (Array.isArray(data.tool5.gasNetworkRows)) {
        gasNetworkRows = data.tool5.gasNetworkRows;
        if (typeof renderGasScheduleTable === 'function') renderGasScheduleTable();
      }
      calculateGasSizing();
    }
  } catch (err) {
    console.error("Error restoring project state:", err);
  }
}

function setupDragAndDrop() {
  const dropZone = document.getElementById('dropZone');
  if (!dropZone) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('border-sky-500', 'bg-sky-950/30'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('border-sky-500', 'bg-sky-950/30'), false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          importProjectState(data);
          localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(data));
          showToast('Project Restored', `Restored ${data.metadata?.projectName || 'Project'}`);
          renderProjectLibraryTable();
        } catch (err) {
          showToast('Parse Error', 'Failed to parse JSON file', false);
        }
      };
      reader.readAsText(files[0]);
    }
  }, false);
}

// -------------------------------------------------------------------
// CORS-PROOF SHARED NETWORK DRIVE LIBRARY ENGINE
// -------------------------------------------------------------------
function loadSharedProjectLibraryFromScript() {
  if (window.SHARED_PROJECT_LIBRARY && Array.isArray(window.SHARED_PROJECT_LIBRARY)) {
    mergeSharedProjectsIntoLibrary(window.SHARED_PROJECT_LIBRARY);
  }
}

function mergeSharedProjectsIntoLibrary(sharedProjects) {
  let localLib = getSavedProjectsLibrary();
  let updated = false;

  sharedProjects.forEach(sp => {
    const spName = (sp.metadata?.projectName || '').trim().toLowerCase();
    if (!spName) return;

    const existingIdx = localLib.findIndex(lp => (lp.metadata?.projectName || '').trim().toLowerCase() === spName);
    if (existingIdx === -1) {
      localLib.unshift(sp);
      updated = true;
    } else {
      const localDate = new Date(localLib[existingIdx].metadata?.savedDate || 0).getTime();
      const sharedDate = new Date(sp.metadata?.savedDate || 0).getTime();
      if (sharedDate > localDate) {
        localLib[existingIdx] = sp;
        updated = true;
      }
    }
  });

  if (updated) {
    localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(localLib));
    renderProjectLibraryTable();
  }
}

async function exportSharedProjectLibraryFile() {
  if (window.sharedDriveFileHandle) {
    const success = await writeDirectToSharedFileHandle();
    if (success) return;
  }
  const library = getSavedProjectsLibrary();
  const pathHeader = window.SHARED_PROJECT_LIBRARY_PATH ? `window.SHARED_PROJECT_LIBRARY_PATH = ${JSON.stringify(window.SHARED_PROJECT_LIBRARY_PATH)};\n` : '';
  const fileContent = pathHeader + "window.SHARED_PROJECT_LIBRARY = " + JSON.stringify(library, null, 2) + ";\n";
  
  const blob = new Blob([fileContent], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'shared_project_library.js';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Shared Library Exported', 'Downloaded updated shared_project_library.js. Replace this file in your shared drive folder to share with all users!');
}

// -------------------------------------------------------------------
// 100% SERVERLESS SHARED DRIVE SYNC ENGINE (NATIVE CHROMIUM FILE SYSTEM API)
// -------------------------------------------------------------------
const DB_NAME = 'MechSuiteDB';
const STORE_NAME = 'FileHandles';
window.sharedDriveFileHandle = null;
window.hasSyncedSharedHandleThisSession = false;

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveFileHandleToDB(handle) {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, 'sharedLibraryHandle');
  } catch (e) {}
}

async function getFileHandleFromDB() {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get('sharedLibraryHandle');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

async function readAndImportFromSharedFileHandle(handle) {
  if (!handle) return 0;
  try {
    const file = await handle.getFile();
    let text = await file.text();
    text = text.trim();
    if (text.startsWith('window.SHARED_PROJECT_LIBRARY')) {
      text = text.substring(text.indexOf('=') + 1).trim();
      if (text.endsWith(';')) text = text.substring(0, text.length - 1).trim();
    }
    const projects = JSON.parse(text);
    if (Array.isArray(projects)) {
      window.SHARED_PROJECT_LIBRARY = projects;
      localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(projects));
      renderProjectLibraryTable();
      return projects.length;
    }
  } catch (e) {
    console.warn("Could not parse linked shared file:", e);
  }
  return 0;
}

async function writeDirectToSharedFileHandle() {
  const library = getSavedProjectsLibrary();
  window.SHARED_PROJECT_LIBRARY = library;

  if (!window.sharedDriveFileHandle) {
    try {
      const handle = await getFileHandleFromDB();
      if (handle) window.sharedDriveFileHandle = handle;
    } catch(e) {}
  }

  if (window.sharedDriveFileHandle) {
    try {
      let perm = await window.sharedDriveFileHandle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        perm = await window.sharedDriveFileHandle.requestPermission({ mode: 'readwrite' });
      }
      if (perm === 'granted') {
        const isJS = window.sharedDriveFileHandle.name.endsWith('.js');
        const pathHeader = window.SHARED_PROJECT_LIBRARY_PATH ? `window.SHARED_PROJECT_LIBRARY_PATH = ${JSON.stringify(window.SHARED_PROJECT_LIBRARY_PATH)};\n` : '';
        const fileContent = isJS 
          ? pathHeader + "window.SHARED_PROJECT_LIBRARY = " + JSON.stringify(library, null, 2) + ";\n"
          : JSON.stringify(library, null, 2);

        const writable = await window.sharedDriveFileHandle.createWritable();
        await writable.write(fileContent);
        await writable.close();
        showToast('Shared Drive Updated', `Successfully updated "${window.sharedDriveFileHandle.name}" on shared drive!`);
        updateLinkedFileUI(true);
        return true;
      }
    } catch (e) {
      console.warn("Direct write to existing handle failed:", e);
    }
  }

  return false;
}

async function linkSharedDriveLibraryFile() {
  if (!('showOpenFilePicker' in window)) {
    showToast('File System API Unsupported', 'Your browser does not support direct file linking. Use standard Save buttons.', false);
    return;
  }

  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'Shared Project Library File (shared_project_library.js)',
        accept: {
          'application/javascript': ['.js'],
          'application/json': ['.json']
        }
      }],
      multiple: false
    });

    if (handle) {
      window.sharedDriveFileHandle = handle;
      window.hasSyncedSharedHandleThisSession = true;
      await saveFileHandleToDB(handle);
      
      const importedCount = await readAndImportFromSharedFileHandle(handle);
      updateLinkedFileUI(true);
      
      showToast('Shared Drive Linked', `Linked to "${handle.name}"! Loaded ${importedCount} projects. All saves, edits, and deletions will auto-sync directly to this file.`);
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      showToast('Linking Error', 'Failed to link file.', false);
    }
  }
}

function linkSharedDriveFile() {
  return linkSharedDriveLibraryFile();
}

async function initSharedFileHandleOnPageLoad() {
  if (window.SHARED_PROJECT_LIBRARY && Array.isArray(window.SHARED_PROJECT_LIBRARY) && window.SHARED_PROJECT_LIBRARY.length > 0) {
    localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(window.SHARED_PROJECT_LIBRARY));
    renderProjectLibraryTable();
  }

  const handle = await getFileHandleFromDB();
  if (handle) {
    window.sharedDriveFileHandle = handle;
    updateLinkedFileUI(true);
    try {
      const perm = await handle.queryPermission({ mode: 'read' });
      if (perm === 'granted') {
        await readAndImportFromSharedFileHandle(handle);
      }
    } catch (e) {}
  } else {
    updateLinkedFileUI(false);
  }
}

function updateLinkedFileUI(isLinked) {
  const btn = document.getElementById('btnLinkSharedFile');
  const syncBadge = document.getElementById('autoSyncBadge');
  const indicator = document.getElementById('linkedFilePathIndicator');
  
  if (btn) {
    if (isLinked && window.sharedDriveFileHandle) {
      btn.className = "px-3.5 py-2 bg-emerald-800 text-emerald-200 border border-emerald-500 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-800/30";
      btn.innerHTML = `<i class="fa-solid fa-link-slash text-emerald-300"></i> Linked: ${window.sharedDriveFileHandle.name}`;
      btn.title = `Currently linked directly to "${window.sharedDriveFileHandle.name}". Click to select a different file.`;
      
      if (syncBadge) {
        syncBadge.className = "text-[10px] font-semibold text-emerald-400 flex items-center gap-1";
        syncBadge.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> Active Auto-Sync`;
      }
    } else {
      btn.className = "px-3.5 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-700/20";
      btn.innerHTML = `<i class="fa-solid fa-link text-white"></i> Link Shared Drive File`;
      btn.title = "Link directly to shared_project_library.js on your shared drive for automatic 1-click file overwriting";
      
      if (syncBadge && !firestoreDB) {
        syncBadge.className = "text-[10px] font-semibold text-slate-400 flex items-center gap-1";
        syncBadge.innerHTML = `<i class="fa-solid fa-link-slash text-slate-500"></i> Default Container`;
      }
    }
  }
  if (indicator) {
    indicator.innerHTML = '';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initFirebaseFirestore();
  initSharedFileHandleOnPageLoad();
});
