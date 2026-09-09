# Mechanical System Calculations Suite (Commercial Engineering Edition)
[![Version](https://img.shields.io/badge/Version-v4.46-0284c7.svg)](file:///c:/Users/michael.salmon/OneDrive%20-%20The%20Waldinger%20Corporation%20waldinger.com/Desktop/AI%20App%20Working%20Folder/Mechanical_Suite_Dashboard.html)
[![Platform](https://img.shields.io/badge/Platform-GitHub%20Pages%20%7C%20Local-10b981.svg)](https://pages.github.com/)
[![License](https://img.shields.io/badge/License-Internal%20Commercial%20Use-64748b.svg)](#)

A browser-based calculation, sizing, and hydraulic modeling platform designed specifically for commercial mechanical estimators and design engineers. 

The application runs with **zero external dependencies** and requires no build pipeline. It can be hosted on **GitHub Pages**, deployed to a shared network drive, or run locally from any modern web browser.

---

## 🚀 Live Demo / Web Access

Once deployed via GitHub Pages, your live web portal is accessible at:
```text
https://<your-github-username>.github.io/<your-repository-name>/
```

---

## 🛠️ Calculation Modules Overview

| Tool | Module | Governing Standard | Sizing & Engineering Scope |
|:---:|---|---|---|
| **1** | **[Plumbing Fixture Unit Calculator](tool1_plumbing_fixtures.html)** | IPC / UPC | WSFU & DFU Hunter's Curve demand estimation, water supply pipe sizing (Copper Type K/L/M, Stainless Steel, CPVC, PEX), continuous GPM adders, and vertical stack / horizontal drainage tables. |
| **2** | **[Hydronic Pumping Economics](tool2_pumping_economics.html)** | ASHRAE / HI / Crane 410 | Pipe sizing matrix up to 24" across 9 material families (Carbon Steel, Stainless, Copper, PVC/CPVC, HDPE, PP, PEX, Cast Iron). Full Hazen-Williams and Darcy-Weisbach / Colebrook-White friction models with temperature-dependent glycol viscosity curves and lifecycle annual electrical pumping cost optimizations. |
| **3** | **[Storm Drainage & Manning Channel Inspector](tool3_storm_drainage.html)** | IPC Chapter 11 / Manning | Roof drainage area flow rate solver, vertical leaders, horizontal mains at 4 slopes (1/16", 1/8", 1/4", 1/2"), multi-zone drain scheduler, and real-time interactive HTML5 canvas open-channel flow inspector. |
| **4** | **[HVAC Ductulator & Acoustic Inspector](tool4_hvac_ductulator.html)** | ASHRAE / Huebscher | Equal friction and velocity air duct solver with Huebscher rectangular equivalence ($D_e$), plenum height constraint locking, aspect ratio warning indicators, and acoustic Noise Criteria (NC) spectrum estimation. |
| **5** | **[Fuel Gas Pipe Sizing Calculator](tool5_fuel_gas.html)** | NFPA 54 / IFGC | Low-pressure ($\le 0.5$ psi Spitzglass) and elevated-pressure ($> 0.5$ to 10 psi Weymouth) gas sizing for Natural Gas, Propane, Butane, and Diesel. Includes multi-appliance Longest Length Method branch tree scheduling and interactive canvas schematics. |

---

## 💡 Architecture & Key Features

- **Zero-Build Vanilla Architecture:** Pure HTML5, CSS (Tailwind CSS CDN + custom high-contrast engine), FontAwesome 6 icons, Google Fonts (Inter & JetBrains Mono), and vanilla ES6 JavaScript. No Node.js, Webpack, or npm dependencies required.
- **Dual-Theme High Contrast:** Seamless switching between Dark Glassmorphic Theme and High-Contrast Field Light Theme for tablets, jobsite trailers, and direct printing.
- **Multi-Tier Persistence:**
  - **Auto-Sync Working Draft:** Changes persist instantly to browser `localStorage` across page navigation.
  - **Browser Session Library:** Save, label, overwrite, search, and recall complete project sessions.
  - **Direct-to-Disk / Shared Drive Sync:** Serverless file handle linking via Chromium File System Access API directly to `shared_project_library.js`.
  - **Portable JSON Backup:** 1-click import/export of complete project sessions.

---

## 💻 Local Preview & Offline Usage

This suite runs completely client-side without any server:
1. **Direct File Open:** Double-click [`Mechanical_Suite_Dashboard.html`](Mechanical_Suite_Dashboard.html) or [`index.html`](index.html) in any web browser.
2. **Local Preview Server:** Double-click [`LAUNCH_LOCAL_SERVER.bat`](LAUNCH_LOCAL_SERVER.bat) or run `powershell -File start_server.ps1` to start a local preview on `http://localhost:8080/`.

---

## 📖 Developer & Engineering Guidelines

When adjusting calculations or introducing new features to any module, follow the authoritative standard in:
👉 **[`IMPLEMENTATION_GUIDELINES.md`](IMPLEMENTATION_GUIDELINES.md)**

This document details:
- The **6-Point State Synchronization Protocol** required for any new input field or parameter.
- The **Dual-Theme Rule** for dark/light styling.
- Mathematical safety limits and boundary clamping rules.
- Step-by-step playbooks for adding materials, schedules, and new calculation tools.

---

## 📄 License & Attribution

Internal Engineering Application — The Waldinger Corporation. All rights reserved.
