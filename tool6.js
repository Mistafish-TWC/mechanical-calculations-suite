// ===================================================================
// TOOL 6: DUCT LOSS CALCULATOR / ESTIMATOR (LOREN COOK / SMACNA)
// Data structures and calculation engine based on the Loren Cook
// Cookbook Pocket Guide (Pages 49-76).
// ===================================================================

const DUCT_LOSS_DATA = {
  // Conversion factors from page 68
  // Base tables are calculated for 1350 FPM and 0.10" w.g. / 100 ft.
  conversionMatrix: [
    { v: 900,  dfl008: 0.56, dfl010: 0.44 },
    { v: 1000, dfl008: 0.69, dfl010: 0.55 },
    { v: 1100, dfl008: 0.83, dfl010: 0.66 },
    { v: 1200, dfl008: 0.99, dfl010: 0.79 },
    { v: 1300, dfl008: 1.16, dfl010: 0.93 },
    { v: 1350, dfl008: 1.25, dfl010: 1.00 }, // Baseline design reference
    { v: 1400, dfl008: 1.34, dfl010: 1.08 },
    { v: 1500, dfl008: 1.54, dfl010: 1.23 },
    { v: 1600, dfl008: 1.76, dfl010: 1.40 },
    { v: 1700, dfl008: 1.98, dfl010: 1.59 },
    { v: 1800, dfl008: 2.22, dfl010: 1.78 },
    { v: 1900, dfl008: 2.48, dfl010: 1.98 },
    { v: 2000, dfl008: 2.74, dfl010: 2.19 }
  ],

  // 1. Round Elbows (Page 54)
  roundElbows: {
    '1a_90_smooth': {
      name: '1a: 90° Smooth Radius Elbow',
      category: 'Round Elbows',
      image: '1a - 90° Smooth.jpeg',
      paramName: 'Radius / Diameter (R/D)',
      options: { '0.75': 37, '1.0': 25, '1.5+': 17 }
    },
    '1b_90_5piece': {
      name: '1b: 90° 5-Piece Elbow',
      category: 'Round Elbows',
      image: '1b - 90° 5-Piece.jpeg',
      paramName: 'Radius / Diameter (R/D)',
      options: { '0.75': 52, '1.0': 37, '1.5+': 27 }
    },
    '1c_90_3piece': {
      name: '1c: 90° 3-Piece Elbow',
      category: 'Round Elbows',
      image: '- 90° 3-Piece.jpeg',
      paramName: 'Radius / Diameter (R/D)',
      options: { '0.75': 61, '1.0': 48, '1.5+': 39 }
    },
    '1d_90_mitered': {
      name: '1d: 90° Mitered Elbow',
      category: 'Round Elbows',
      image: '- 90° Mitered.jpeg',
      paramName: 'Radius / Diameter (R/D)',
      options: { '1.0': 136 }
    },
    '1e_45_3piece': {
      name: '1e: 45° 3-Piece Elbow',
      category: 'Round Elbows',
      image: '- 45° 3-Piece.jpeg',
      paramName: 'Radius / Diameter (R/D)',
      options: { '0.75': 15, '1.0': 15, '1.5+': 15 }
    },
    '1f_45_2piece': {
      name: '1f: 45° 2-Piece Elbow',
      category: 'Round Elbows',
      image: '1f - 45° 2-Piece.jpeg',
      paramName: 'Radius / Diameter (R/D)',
      options: { '0.75': 20, '1.0': 20, '1.5+': 20 }
    }
  },

  // 2. Rectangular Mitered Elbows (Page 55)
  rectMitered: {
    '2a_vanes': {
      name: '2a: Rectangular Mitered Elbow (With Vanes)',
      category: 'Rectangular Mitered',
      image: '2a - Rec miter Elb with Vanes.jpeg',
      paramName: 'Height / Width (H/W)',
      options: { '0.25': 53, '1.0': 45, '4.0': 72 },
      hasAngleFactor: true
    },
    '2b_no_vanes': {
      name: '2b: Rectangular Mitered Elbow (Without Vanes)',
      category: 'Rectangular Mitered',
      image: '2b - Rec miter Elb without Vanes.jpeg',
      paramName: 'Height / Width (H/W)',
      options: { '0.25': 148, '1.0': 136, '4.0': 105 },
      hasAngleFactor: true
    },
    '2c_tee_double': {
      name: '2c: Tee (Double Elbow Equivalent)',
      category: 'Rectangular Mitered',
      image: '2c - Tee dbl elbow equiv.jpeg',
      paramName: 'Vane Configuration',
      options: { 'With Vanes (H/W=1)': 45, 'With Vanes (H/W=0.25)': 53, 'With Vanes (H/W=4)': 72, 'Without Vanes (H/W=1)': 136, 'Without Vanes (H/W=0.25)': 148, 'Without Vanes (H/W=4)': 105 },
      hasAngleFactor: false
    }
  },

  miteredAngleFactors: {
    '90': 1.0,
    '60': 0.78,
    '45': 0.60,
    '30': 0.45
  },

  // 3. Rectangular Radius Elbows (Page 56)
  rectRadius: {
    '3a_vanes': {
      name: '3a: Rectangular Radius Elbow (With Vanes)',
      category: 'Rectangular Radius',
      image: '3a - Rect Rad Elbow with Vanes.jpeg',
      paramName: 'Radius/Width (R/W) & Aspect (H/W)',
      options: {
        'R/W=0.25, H/W=0.25': 9,
        'R/W=0.25, H/W=1.0': 5,
        'R/W=0.25, H/W=4.0': 6,
        'R/W=0.50, H/W=0.25': 3,
        'R/W=0.50, H/W=1.0': 2,
        'R/W=0.50, H/W=4.0': 1
      }
    },
    '3b_no_vanes': {
      name: '3b: Rectangular Radius Elbow (Without Vanes)',
      category: 'Rectangular Radius',
      image: '3b - Rect Rad Elbow without Vanes.jpeg',
      paramName: 'Radius/Width (R/W) & Aspect (H/W)',
      options: {
        'R/W=0.50, H/W=0.25': 170,
        'R/W=0.50, H/W=1.0': 136,
        'R/W=0.50, H/W=4.0': 125,
        'R/W=1.00, H/W=0.25': 31,
        'R/W=1.00, H/W=1.0': 24,
        'R/W=1.00, H/W=4.0': 22,
        'R/W=2.00, H/W=0.25': 23,
        'R/W=2.00, H/W=1.0': 17,
        'R/W=2.00, H/W=4.0': 16
      }
    },
    '3c_wye_double': {
      name: '3c: Wye (Double Elbow Equivalent)',
      category: 'Rectangular Radius',
      image: '3c - Wye dbl Elb Equiv.jpeg',
      paramName: 'Vanes & Radius/Width (R/W)',
      options: {
        'With Vanes (R/W=0.25, H/W=0.25)': 9,
        'With Vanes (R/W=0.25, H/W=1.0)': 5,
        'With Vanes (R/W=0.25, H/W=4.0)': 6,
        'With Vanes (R/W=0.50, H/W=0.25)': 3,
        'With Vanes (R/W=0.50, H/W=1.0)': 2,
        'With Vanes (R/W=0.50, H/W=4.0)': 1,
        'Without Vanes (R/W=0.50, H/W=0.25)': 170,
        'Without Vanes (R/W=0.50, H/W=1.0)': 136,
        'Without Vanes (R/W=0.50, H/W=4.0)': 125,
        'Without Vanes (R/W=1.00, H/W=0.25)': 31,
        'Without Vanes (R/W=1.00, H/W=1.0)': 24,
        'Without Vanes (R/W=1.00, H/W=4.0)': 22,
        'Without Vanes (R/W=2.00, H/W=0.25)': 23,
        'Without Vanes (R/W=2.00, H/W=1.0)': 17,
        'Without Vanes (R/W=2.00, H/W=4.0)': 16
      }
    }
  },

  // 4. Converging Tee Rectangular Trunk (Pages 57-58)
  convergingTeeRect: {
    // Branch Paths (p. 57)
    '4a_rect_branch': {
      name: '4a: Converging Tee Rectangular Branch',
      category: 'Converging Tee Rect Trunk',
      image: '4a - Tee Rect Branch.jpeg',
      paramName: 'Trunk Velocity & Flow Ratio (Qb/Qt)',
      options: {
        'Vt < 1200, Qb/Qt=0.1': 0,
        'Vt < 1200, Qb/Qt=0.2': 3,
        'Vt < 1200, Qb/Qt=0.3': 10,
        'Vt < 1200, Qb/Qt=0.4': 37,
        'Vt < 1200, Qb/Qt=0.5': 117,
        'Vt < 1200, Qb/Qt=0.6': 125,
        'Vt < 1200, Qb/Qt=0.7': 244,
        'Vt < 1200, Qb/Qt=0.8': 333,
        'Vt < 1200, Qb/Qt=0.9': 475,
        'Vt >= 1200, Qb/Qt=0.1': 1,
        'Vt >= 1200, Qb/Qt=0.2': 8,
        'Vt >= 1200, Qb/Qt=0.3': 26,
        'Vt >= 1200, Qb/Qt=0.4': 76,
        'Vt >= 1200, Qb/Qt=0.5': 133,
        'Vt >= 1200, Qb/Qt=0.6': 189,
        'Vt >= 1200, Qb/Qt=0.7': 303,
        'Vt >= 1200, Qb/Qt=0.8': 382,
        'Vt >= 1200, Qb/Qt=0.9': 447
      }
    },
    '4b_rect_45_entry': {
      name: '4b: Converging Tee Rect Branch (45° Entry)',
      category: 'Converging Tee Rect Trunk',
      image: '4b - Tee Rect Branch 45°.jpeg',
      paramName: 'Trunk Velocity & Flow Ratio (Qb/Qt)',
      options: {
        'Vt < 1200, Qb/Qt=0.1': 0,
        'Vt < 1200, Qb/Qt=0.2': 8,
        'Vt < 1200, Qb/Qt=0.3': 16,
        'Vt < 1200, Qb/Qt=0.4': 32,
        'Vt < 1200, Qb/Qt=0.5': 62,
        'Vt < 1200, Qb/Qt=0.6': 117,
        'Vt < 1200, Qb/Qt=0.7': 170,
        'Vt < 1200, Qb/Qt=0.8': 219,
        'Vt < 1200, Qb/Qt=0.9': 284,
        'Vt >= 1200, Qb/Qt=0.1': 2,
        'Vt >= 1200, Qb/Qt=0.2': 10,
        'Vt >= 1200, Qb/Qt=0.3': 20,
        'Vt >= 1200, Qb/Qt=0.4': 39,
        'Vt >= 1200, Qb/Qt=0.5': 86,
        'Vt >= 1200, Qb/Qt=0.6': 130,
        'Vt >= 1200, Qb/Qt=0.7': 208,
        'Vt >= 1200, Qb/Qt=0.8': 228,
        'Vt >= 1200, Qb/Qt=0.9': 330
      }
    },
    '4c_round_branch': {
      name: '4c: Converging Tee Round Branch',
      category: 'Converging Tee Rect Trunk',
      image: '4c - Tee Round Branch.jpeg',
      paramName: 'Trunk Velocity & Flow Ratio (Qb/Qt)',
      options: {
        'Vt < 1200, Qb/Qt=0.1': 0,
        'Vt < 1200, Qb/Qt=0.2': 7,
        'Vt < 1200, Qb/Qt=0.3': 15,
        'Vt < 1200, Qb/Qt=0.4': 26,
        'Vt < 1200, Qb/Qt=0.5': 89,
        'Vt < 1200, Qb/Qt=0.6': 148,
        'Vt < 1200, Qb/Qt=0.7': 219,
        'Vt < 1200, Qb/Qt=0.8': 352,
        'Vt < 1200, Qb/Qt=0.9': 554,
        'Vt >= 1200, Qb/Qt=0.1': 2,
        'Vt >= 1200, Qb/Qt=0.2': 12,
        'Vt >= 1200, Qb/Qt=0.3': 26,
        'Vt >= 1200, Qb/Qt=0.4': 68,
        'Vt >= 1200, Qb/Qt=0.5': 144,
        'Vt >= 1200, Qb/Qt=0.6': 234,
        'Vt >= 1200, Qb/Qt=0.7': 312,
        'Vt >= 1200, Qb/Qt=0.8': 420,
        'Vt >= 1200, Qb/Qt=0.9': 560
      }
    },
    // Trunk Paths (p. 58)
    '4d_rect_trunk': {
      name: '4d: Converging Tee Rect Trunk Path',
      category: 'Converging Tee Rect Trunk',
      image: '4d - Tee Rect Branch.jpeg',
      paramName: 'Flow Ratio (Qb/Qt)',
      options: {
        'Qb/Qt = 0.1': 18,
        'Qb/Qt = 0.2': 31,
        'Qb/Qt = 0.3': 43,
        'Qb/Qt = 0.4': 52,
        'Qb/Qt = 0.5': 60,
        'Qb/Qt = 0.6': 65,
        'Qb/Qt = 0.7': 67,
        'Qb/Qt = 0.8': 68,
        'Qb/Qt = 0.9': 67
      }
    },
    '4e_rect_45_trunk': {
      name: '4e: Converging Tee Rect Trunk (45° Entry)',
      category: 'Converging Tee Rect Trunk',
      image: '4e - Tee Rect Branch 45°.jpeg',
      paramName: 'Flow Ratio (Qb/Qt)',
      options: {
        'Qb/Qt = 0.1': 18, 'Qb/Qt = 0.2': 31, 'Qb/Qt = 0.3': 43, 'Qb/Qt = 0.4': 52,
        'Qb/Qt = 0.5': 60, 'Qb/Qt = 0.6': 65, 'Qb/Qt = 0.7': 67, 'Qb/Qt = 0.8': 68, 'Qb/Qt = 0.9': 67
      }
    },
    '4f_round_trunk': {
      name: '4f: Converging Tee Rect Trunk (Round Branch)',
      category: 'Converging Tee Rect Trunk',
      image: '4f - Tee Round Branch.jpeg',
      paramName: 'Flow Ratio (Qb/Qt)',
      options: {
        'Qb/Qt = 0.1': 18, 'Qb/Qt = 0.2': 31, 'Qb/Qt = 0.3': 43, 'Qb/Qt = 0.4': 52,
        'Qb/Qt = 0.5': 60, 'Qb/Qt = 0.6': 65, 'Qb/Qt = 0.7': 67, 'Qb/Qt = 0.8': 68, 'Qb/Qt = 0.9': 67
      }
    }
  },

  // 5. Diverging Tee Rectangular Trunk (Pages 59-60)
  divergingTeeRect: {
    // Branch Paths (p. 59)
    '5a_rect_branch': {
      name: '5a: Diverging Tee Rectangular Branch',
      category: 'Diverging Tee Rect Trunk',
      image: '5a - Tee Rect Branch.jpeg',
      paramName: 'Velocity Ratio (Vb/Vt) & Flow (Qb/Qt)',
      options: {
        'Vb/Vt=0.2, Qb/Qt=0.1': 117,
        'Vb/Vt=0.4, Qb/Qt=0.1': 118,
        'Vb/Vt=0.4, Qb/Qt=0.2': 115,
        'Vb/Vt=0.6, Qb/Qt=0.1': 126,
        'Vb/Vt=0.6, Qb/Qt=0.2': 117,
        'Vb/Vt=0.6, Qb/Qt=0.3': 119,
        'Vb/Vt=0.8, Qb/Qt=0.1': 132,
        'Vb/Vt=0.8, Qb/Qt=0.2': 137,
        'Vb/Vt=0.8, Qb/Qt=0.3': 133,
        'Vb/Vt=0.8, Qb/Qt=0.4': 127,
        'Vb/Vt=1.0, Qb/Qt=0.1': 157,
        'Vb/Vt=1.0, Qb/Qt=0.2': 159,
        'Vb/Vt=1.0, Qb/Qt=0.3': 148,
        'Vb/Vt=1.0, Qb/Qt=0.4': 155,
        'Vb/Vt=1.0, Qb/Qt=0.5': 144
      }
    },
    '5b_rect_45_entry': {
      name: '5b: Diverging Tee Rect Branch (45° Entry)',
      category: 'Diverging Tee Rect Trunk',
      image: '5b - Tee Rect Branch 45°.jpeg',
      paramName: 'Velocity Ratio (Vb/Vt) & Flow (Qb/Qt)',
      options: {
        'Vb/Vt=0.2, Qb/Qt=0.1': 103,
        'Vb/Vt=0.4, Qb/Qt=0.1': 92,
        'Vb/Vt=0.4, Qb/Qt=0.2': 90,
        'Vb/Vt=0.6, Qb/Qt=0.1': 87,
        'Vb/Vt=0.6, Qb/Qt=0.2': 82,
        'Vb/Vt=0.6, Qb/Qt=0.3': 80,
        'Vb/Vt=0.8, Qb/Qt=0.1': 89,
        'Vb/Vt=0.8, Qb/Qt=0.2': 83,
        'Vb/Vt=0.8, Qb/Qt=0.3': 78,
        'Vb/Vt=0.8, Qb/Qt=0.4': 75,
        'Vb/Vt=1.0, Qb/Qt=0.1': 89,
        'Vb/Vt=1.0, Qb/Qt=0.2': 111,
        'Vb/Vt=1.0, Qb/Qt=0.3': 97,
        'Vb/Vt=1.0, Qb/Qt=0.4': 90,
        'Vb/Vt=1.0, Qb/Qt=0.5': 84
      }
    },
    '5c_round_branch': {
      name: '5c: Diverging Tee Round Branch',
      category: 'Diverging Tee Rect Trunk',
      image: '5c - Tee Round Branch.jpeg',
      paramName: 'Velocity Ratio (Vb/Vt) & Flow (Qb/Qt)',
      options: {
        'Vb/Vt=0.2, Qb/Qt=0.1': 114,
        'Vb/Vt=0.4, Qb/Qt=0.1': 115,
        'Vb/Vt=0.4, Qb/Qt=0.2': 122,
        'Vb/Vt=0.6, Qb/Qt=0.1': 130,
        'Vb/Vt=0.6, Qb/Qt=0.2': 125,
        'Vb/Vt=0.6, Qb/Qt=0.3': 123,
        'Vb/Vt=0.8, Qb/Qt=0.1': 134,
        'Vb/Vt=0.8, Qb/Qt=0.2': 149,
        'Vb/Vt=0.8, Qb/Qt=0.3': 127,
        'Vb/Vt=0.8, Qb/Qt=0.4': 128,
        'Vb/Vt=1.0, Qb/Qt=0.1': 148,
        'Vb/Vt=1.0, Qb/Qt=0.2': 157,
        'Vb/Vt=1.0, Qb/Qt=0.3': 136,
        'Vb/Vt=1.0, Qb/Qt=0.4': 140,
        'Vb/Vt=1.0, Qb/Qt=0.5': 143
      }
    },
    // Trunk Paths (p. 60)
    '5d_rect_trunk': {
      name: '5d: Diverging Tee Rect Trunk Path',
      category: 'Diverging Tee Rect Trunk',
      image: '5d - Tee Rect Branch.jpeg',
      paramName: 'Trunk Velocity / Flow Ratio (Vb/Vt or Qb/Qt)',
      options: {
        'Vb/Vt = 0.1 (Qb/Qt = 0.1)': 32,
        'Vb/Vt = 0.2 (Qb/Qt = 0.2)': 25,
        'Vb/Vt = 0.3 (Qb/Qt = 0.3)': 19,
        'Vb/Vt = 0.4 (Qb/Qt = 0.4)': 15,
        'Vb/Vt = 0.5 (Qb/Qt = 0.5)': 10,
        'Vb/Vt = 0.6 (Qb/Qt = 0.6)': 7,
        'Vb/Vt = 0.8 (Qb/Qt = 0.8)': 2,
        'Vb/Vt = 1.0 (Qb/Qt = 1.0)': 0
      }
    },
    '5e_rect_45_trunk': {
      name: '5e: Diverging Tee Rect Trunk (45° Entry)',
      category: 'Diverging Tee Rect Trunk',
      image: '5e - Tee Rect Branch 45°.jpeg',
      paramName: 'Trunk Velocity / Flow Ratio (Vb/Vt or Qb/Qt)',
      options: {
        'Vb/Vt = 0.1 (Qb/Qt = 0.1)': 32,
        'Vb/Vt = 0.2 (Qb/Qt = 0.2)': 25,
        'Vb/Vt = 0.3 (Qb/Qt = 0.3)': 19,
        'Vb/Vt = 0.4 (Qb/Qt = 0.4)': 15,
        'Vb/Vt = 0.5 (Qb/Qt = 0.5)': 10,
        'Vb/Vt = 0.6 (Qb/Qt = 0.6)': 7,
        'Vb/Vt = 0.8 (Qb/Qt = 0.8)': 2,
        'Vb/Vt = 1.0 (Qb/Qt = 1.0)': 0
      }
    },
    '5f_round_trunk': {
      name: '5f: Diverging Tee Rect Trunk (Round Branch)',
      category: 'Diverging Tee Rect Trunk',
      image: '5f - Tee Round Branch.jpeg',
      paramName: 'Trunk Velocity / Flow Ratio (Vb/Vt or Qb/Qt)',
      options: {
        'Vb/Vt = 0.1 (Qb/Qt = 0.1)': 32,
        'Vb/Vt = 0.2 (Qb/Qt = 0.2)': 25,
        'Vb/Vt = 0.3 (Qb/Qt = 0.3)': 19,
        'Vb/Vt = 0.4 (Qb/Qt = 0.4)': 15,
        'Vb/Vt = 0.5 (Qb/Qt = 0.5)': 10,
        'Vb/Vt = 0.6 (Qb/Qt = 0.6)': 7,
        'Vb/Vt = 0.8 (Qb/Qt = 0.8)': 2,
        'Vb/Vt = 1.0 (Qb/Qt = 1.0)': 0
      }
    }
  },

  // 6. Tee Round 90 Degree (Pages 61-62)
  teeRound90: {
    '6a_converging_branch': {
      name: '6a: Round Tee 90° Converging Branch',
      category: 'Tee Round 90°',
      image: '6a - Tee Round 90°.jpeg',
      paramName: 'Flow Ratio (Qb/Qt) & Area Ratio (Ab/At)',
      options: {
        'Qb/Qt=0.2, Ab/At=0.1': 432,
        'Qb/Qt=0.2, Ab/At=0.2': 82,
        'Qb/Qt=0.2, Ab/At=0.3': 19,
        'Qb/Qt=0.2, Ab/At=0.4': 17,
        'Qb/Qt=0.2, Ab/At=0.6': 15,
        'Qb/Qt=0.2, Ab/At=0.8': 13,
        'Qb/Qt=0.2, Ab/At=1.0': 12,
        'Qb/Qt=0.4, Ab/At=0.2': 489,
        'Qb/Qt=0.4, Ab/At=0.3': 239,
        'Qb/Qt=0.4, Ab/At=0.4': 107,
        'Qb/Qt=0.4, Ab/At=0.6': 61,
        'Qb/Qt=0.4, Ab/At=0.8': 45,
        'Qb/Qt=0.4, Ab/At=1.0': 36,
        'Qb/Qt=0.6, Ab/At=0.3': 534,
        'Qb/Qt=0.6, Ab/At=0.4': 182,
        'Qb/Qt=0.6, Ab/At=0.6': 105,
        'Qb/Qt=0.6, Ab/At=0.8': 78,
        'Qb/Qt=0.6, Ab/At=1.0': 65,
        'Qb/Qt=0.8, Ab/At=0.4': 307,
        'Qb/Qt=0.8, Ab/At=0.6': 170,
        'Qb/Qt=0.8, Ab/At=0.8': 125,
        'Qb/Qt=0.8, Ab/At=1.0': 98,
        'Qb/Qt=1.0, Ab/At=0.4': 454,
        'Qb/Qt=1.0, Ab/At=0.6': 239,
        'Qb/Qt=1.0, Ab/At=0.8': 159,
        'Qb/Qt=1.0, Ab/At=1.0': 125
      }
    },
    '6b_diverging_branch': {
      name: '6b: Round Tee 90° Diverging Branch',
      category: 'Tee Round 90°',
      image: '6b - Tee Round 90°.jpeg',
      paramName: 'Area Ratio (Ab/At) & Flow Ratio (Qb/Qt)',
      options: {
        'Ab/At=0.8, Qb/Qt=0.1': 89, 'Ab/At=0.8, Qb/Qt=0.2': 70, 'Ab/At=0.8, Qb/Qt=0.3': 56, 'Ab/At=0.8, Qb/Qt=0.4': 45, 'Ab/At=0.8, Qb/Qt=0.5': 39, 'Ab/At=0.8, Qb/Qt=0.6': 35, 'Ab/At=0.8, Qb/Qt=0.7': 36, 'Ab/At=0.8, Qb/Qt=0.8': 40, 'Ab/At=0.8, Qb/Qt=0.9': 45,
        'Ab/At=0.6, Qb/Qt=0.1': 84, 'Ab/At=0.6, Qb/Qt=0.2': 64, 'Ab/At=0.6, Qb/Qt=0.3': 50, 'Ab/At=0.6, Qb/Qt=0.4': 42, 'Ab/At=0.6, Qb/Qt=0.5': 40, 'Ab/At=0.6, Qb/Qt=0.6': 41, 'Ab/At=0.6, Qb/Qt=0.7': 49, 'Ab/At=0.6, Qb/Qt=0.8': 61, 'Ab/At=0.6, Qb/Qt=0.9': 77,
        'Ab/At=0.4, Qb/Qt=0.1': 75, 'Ab/At=0.4, Qb/Qt=0.2': 53, 'Ab/At=0.4, Qb/Qt=0.3': 45, 'Ab/At=0.4, Qb/Qt=0.4': 49, 'Ab/At=0.4, Qb/Qt=0.5': 61, 'Ab/At=0.4, Qb/Qt=0.6': 78, 'Ab/At=0.4, Qb/Qt=0.7': 108, 'Ab/At=0.4, Qb/Qt=0.8': 148, 'Ab/At=0.4, Qb/Qt=0.9': 193,
        'Ab/At=0.2, Qb/Qt=0.1': 64, 'Ab/At=0.2, Qb/Qt=0.2': 64, 'Ab/At=0.2, Qb/Qt=0.3': 114, 'Ab/At=0.2, Qb/Qt=0.4': 205
      }
    },
    '6c_converging_trunk': {
      name: '6c: Round Tee 90° Converging Trunk',
      category: 'Tee Round 90°',
      image: '6c - Tee Round 90°.jpeg',
      paramName: 'Converging Trunk Flow Ratio (Qb/Qt)',
      options: {
        'Qb/Qt = 0.1': 18, 'Qb/Qt = 0.2': 31, 'Qb/Qt = 0.3': 43, 'Qb/Qt = 0.4': 52,
        'Qb/Qt = 0.5': 60, 'Qb/Qt = 0.6': 65, 'Qb/Qt = 0.8': 68, 'Qb/Qt = 0.9': 67
      }
    },
    '6d_diverging_trunk': {
      name: '6d: Round Tee 90° Diverging Trunk',
      category: 'Tee Round 90°',
      image: '6d - Tee Round 90°.jpeg',
      paramName: 'Diverging Trunk Velocity Ratio (Vb/Vt)',
      options: {
        'Vb/Vt = 0.1': 32, 'Vb/Vt = 0.2': 25, 'Vb/Vt = 0.3': 19, 'Vb/Vt = 0.4': 15,
        'Vb/Vt = 0.5': 10, 'Vb/Vt = 0.6': 7, 'Vb/Vt = 0.8': 2, 'Vb/Vt = 1.0': 0
      }
    }
  },

  // 7. Diverging Tee Round Trunk (Pages 63-64)
  divergingTeeRound: {
    '7a_45_elbow': {
      name: '7a: Diverging Round Trunk w/ 45° Branch Elbow',
      category: 'Diverging Tee Round Trunk',
      image: '7a - Tee Round Trunk 45°.jpeg',
      paramName: 'Branch 45° Velocity Ratio (Vb/Vt)',
      options: { 'Vb/Vt = 0.2': 108, 'Vb/Vt = 0.4': 102, 'Vb/Vt = 0.6': 98, 'Vb/Vt = 0.8': 92, 'Vb/Vt = 1.0': 90 }
    },
    '7b_conical': {
      name: '7b: Diverging Round Trunk w/ Conical Branch',
      category: 'Diverging Tee Round Trunk',
      image: '7b - Tee Round Trunk Conical.jpeg',
      paramName: 'Branch Conical Velocity Ratio (Vb/Vt)',
      options: { 'Vb/Vt = 0.2': 97, 'Vb/Vt = 0.4': 84, 'Vb/Vt = 0.6': 70, 'Vb/Vt = 0.8': 59, 'Vb/Vt = 1.0': 48 }
    },
    '7c_90_elbow': {
      name: '7c: Diverging Round Trunk w/ 90° Branch Elbow',
      category: 'Diverging Tee Round Trunk',
      image: '7c - Tee Round Trunk 90°.jpeg',
      paramName: 'Branch 90° Velocity Ratio (Vb/Vt)',
      options: { 'Vb/Vt = 0.2': 117, 'Vb/Vt = 0.4': 123, 'Vb/Vt = 0.6': 134, 'Vb/Vt = 0.8': 151, 'Vb/Vt = 1.0': 177 }
    },
    '7d_rolled_45_trunk': {
      name: '7d: Rolled 45° Branch Round Trunk Path',
      category: 'Diverging Tee Round Trunk',
      image: '7d - Tee Round Trunk 45°.jpeg',
      paramName: 'Trunk Velocity Ratio (Vb/Vt)',
      options: { 'Vb/Vt = 0.1': 32, 'Vb/Vt = 0.2': 25, 'Vb/Vt = 0.3': 19, 'Vb/Vt = 0.4': 15, 'Vb/Vt = 0.5': 10, 'Vb/Vt = 0.6': 7, 'Vb/Vt = 0.8': 2, 'Vb/Vt = 1.0': 0 }
    },
    '7e_conical_trunk': {
      name: '7e: Conical Branch Round Trunk Path',
      category: 'Diverging Tee Round Trunk',
      image: '7e - Tee Round Trunk Conical.jpeg',
      paramName: 'Trunk Velocity Ratio (Vb/Vt)',
      options: { 'Vb/Vt = 0.1': 32, 'Vb/Vt = 0.2': 25, 'Vb/Vt = 0.3': 19, 'Vb/Vt = 0.4': 15, 'Vb/Vt = 0.5': 10, 'Vb/Vt = 0.6': 7, 'Vb/Vt = 0.8': 2, 'Vb/Vt = 1.0': 0 }
    },
    '7f_90_trunk': {
      name: '7f: 90° Branch Round Trunk Path',
      category: 'Diverging Tee Round Trunk',
      image: '7f - Tee Round Trunk 90°.jpeg',
      paramName: 'Trunk Velocity Ratio (Vb/Vt)',
      options: { 'Vb/Vt = 0.1': 32, 'Vb/Vt = 0.2': 25, 'Vb/Vt = 0.3': 19, 'Vb/Vt = 0.4': 15, 'Vb/Vt = 0.5': 10, 'Vb/Vt = 0.6': 7, 'Vb/Vt = 0.8': 2, 'Vb/Vt = 1.0': 0 }
    }
  },

  // 8. Wye Rectangular or Round / Pair Of Pants (Page 65)
  wye: {
    '8a_diverging': {
      name: '8a: Wye (Pair of Pants) Diverging',
      category: 'Wye (Pair of Pants)',
      image: '8a - Wye Pants.jpeg',
      paramName: 'Branch Angle & Velocity Ratio (Vb/Vt)',
      options: {
        '15° Angle, Vb/Vt=0.1': 92, '15° Angle, Vb/Vt=0.2': 70, '15° Angle, Vb/Vt=0.3': 58, '15° Angle, Vb/Vt=0.4': 43, '15° Angle, Vb/Vt=0.5': 32, '15° Angle, Vb/Vt=0.6': 23, '15° Angle, Vb/Vt=0.8': 12,
        '30° Angle, Vb/Vt=0.1': 95, '30° Angle, Vb/Vt=0.2': 78, '30° Angle, Vb/Vt=0.3': 64, '30° Angle, Vb/Vt=0.4': 50, '30° Angle, Vb/Vt=0.5': 39, '30° Angle, Vb/Vt=0.6': 32, '30° Angle, Vb/Vt=0.8': 22,
        '45° Angle, Vb/Vt=0.1': 99, '45° Angle, Vb/Vt=0.2': 84, '45° Angle, Vb/Vt=0.3': 72, '45° Angle, Vb/Vt=0.4': 61, '45° Angle, Vb/Vt=0.5': 51, '45° Angle, Vb/Vt=0.6': 43, '45° Angle, Vb/Vt=0.8': 33,
        '60° Angle, Vb/Vt=0.1': 102, '60° Angle, Vb/Vt=0.2': 93, '60° Angle, Vb/Vt=0.3': 90, '60° Angle, Vb/Vt=0.4': 75, '60° Angle, Vb/Vt=0.5': 67, '60° Angle, Vb/Vt=0.6': 60, '60° Angle, Vb/Vt=0.8': 49
      }
    },
    '8b_converging': {
      name: '8b: Wye (Pair of Pants) Converging',
      category: 'Wye (Pair of Pants)',
      image: '8b - Wye Pants.jpeg',
      paramName: 'Branch Angle & Flow Ratio (Qb/Qt)',
      options: {
        '15° Angle, Qb/Qt=0.1': 0, '15° Angle, Qb/Qt=0.2': 1, '15° Angle, Qb/Qt=0.3': 2, '15° Angle, Qb/Qt=0.4': 4, '15° Angle, Qb/Qt=0.5': 11, '15° Angle, Qb/Qt=0.6': 47, '15° Angle, Qb/Qt=0.8': 97,
        '30° Angle, Qb/Qt=0.1': 2, '30° Angle, Qb/Qt=0.2': 4, '30° Angle, Qb/Qt=0.3': 8, '30° Angle, Qb/Qt=0.4': 16, '30° Angle, Qb/Qt=0.5': 32, '30° Angle, Qb/Qt=0.6': 78, '30° Angle, Qb/Qt=0.8': 125,
        '45° Angle, Qb/Qt=0.1': 4, '45° Angle, Qb/Qt=0.2': 8, '45° Angle, Qb/Qt=0.3': 10, '45° Angle, Qb/Qt=0.4': 23, '45° Angle, Qb/Qt=0.5': 64, '45° Angle, Qb/Qt=0.6': 105, '45° Angle, Qb/Qt=0.8': 182
      }
    }
  },

  // 9. Transitions Expanding Flow (Pages 66-67)
  transitionsExpanding: {
    '9a_round_conical': {
      name: '9a: Round Conical Transition (Expanding)',
      category: 'Transitions (Expanding)',
      image: '9a - Trans Round.jpeg',
      paramName: 'Dimension Ratio (D₂/D₁) & Angle',
      options: {
        'A1/A2=2, 16°': 16, 'A1/A2=2, 20°': 22, 'A1/A2=2, 30°': 36, 'A1/A2=2, 45°': 37, 'A1/A2=2, 60°': 37, 'A1/A2=2, 90°': 36, 'A1/A2=2, 120°': 35, 'A1/A2=2, 180°': 34,
        'A1/A2=4, 16°': 26, 'A1/A2=4, 20°': 34, 'A1/A2=4, 30°': 52, 'A1/A2=4, 45°': 69, 'A1/A2=4, 60°': 77, 'A1/A2=4, 90°': 73, 'A1/A2=4, 120°': 72, 'A1/A2=4, 180°': 70,
        'A1/A2=6, 16°': 31, 'A1/A2=6, 20°': 37, 'A1/A2=6, 30°': 55, 'A1/A2=6, 45°': 75, 'A1/A2=6, 60°': 87, 'A1/A2=6, 90°': 84, 'A1/A2=6, 120°': 83, 'A1/A2=6, 180°': 82,
        'A1/A2=10, 16°': 33, 'A1/A2=10, 20°': 43, 'A1/A2=10, 30°': 67, 'A1/A2=10, 45°': 86, 'A1/A2=10, 60°': 91, 'A1/A2=10, 90°': 94, 'A1/A2=10, 120°': 95, 'A1/A2=10, 180°': 94,
        'A1/A2=16+, 16°': 35, 'A1/A2=16+, 20°': 43, 'A1/A2=16+, 30°': 68, 'A1/A2=16+, 45°': 95, 'A1/A2=16+, 60°': 100, 'A1/A2=16+, 90°': 100, 'A1/A2=16+, 120°': 100, 'A1/A2=16+, 180°': 100
      }
    },
    '9b_rect_to_rect': {
      name: '9b: Rectangular to Rectangular (Expanding)',
      category: 'Transitions (Expanding)',
      image: '9b - Trans Rect.jpeg',
      paramName: 'Dimension Ratio (W₂×L₂ / W₁×L₁) & Angle',
      options: {
        'A1/A2=2, 16°': 20, 'A1/A2=2, 20°': 25, 'A1/A2=2, 30°': 28, 'A1/A2=2, 45°': 33, 'A1/A2=2, 60°': 35, 'A1/A2=2, 90°': 36, 'A1/A2=2, 120°': 37, 'A1/A2=2, 180°': 34,
        'A1/A2=4, 16°': 41, 'A1/A2=4, 20°': 49, 'A1/A2=4, 30°': 57, 'A1/A2=4, 45°': 64, 'A1/A2=4, 60°': 69, 'A1/A2=4, 90°': 72, 'A1/A2=4, 120°': 72, 'A1/A2=4, 180°': 72,
        'A1/A2=6, 16°': 48, 'A1/A2=6, 20°': 53, 'A1/A2=6, 30°': 66, 'A1/A2=6, 45°': 77, 'A1/A2=6, 60°': 82, 'A1/A2=6, 90°': 86, 'A1/A2=6, 120°': 86, 'A1/A2=6, 180°': 85,
        'A1/A2=10, 16°': 48, 'A1/A2=10, 20°': 56, 'A1/A2=10, 30°': 67, 'A1/A2=10, 45°': 80, 'A1/A2=10, 60°': 91, 'A1/A2=10, 90°': 99, 'A1/A2=10, 120°': 97, 'A1/A2=10, 180°': 98
      }
    },
    '9c_round_to_rect': {
      name: '9c: Round to Rectangular (Expanding)',
      category: 'Transitions (Expanding)',
      image: '9c - Trans Round Rect.jpeg',
      paramName: 'Dimension Ratio (Round D₁ to Rect W₂×L₂) & Angle',
      options: {
        'A1/A2=2, 16°': 20, 'A1/A2=2, 20°': 25, 'A1/A2=2, 30°': 28, 'A1/A2=2, 45°': 33, 'A1/A2=2, 60°': 35, 'A1/A2=2, 90°': 36, 'A1/A2=2, 120°': 37, 'A1/A2=2, 180°': 34,
        'A1/A2=4, 16°': 41, 'A1/A2=4, 20°': 49, 'A1/A2=4, 30°': 57, 'A1/A2=4, 45°': 64, 'A1/A2=4, 60°': 69, 'A1/A2=4, 90°': 72, 'A1/A2=4, 120°': 72, 'A1/A2=4, 180°': 72,
        'A1/A2=6, 16°': 48, 'A1/A2=6, 20°': 53, 'A1/A2=6, 30°': 66, 'A1/A2=6, 45°': 77, 'A1/A2=6, 60°': 82, 'A1/A2=6, 90°': 86, 'A1/A2=6, 120°': 86, 'A1/A2=6, 180°': 85,
        'A1/A2=10, 16°': 48, 'A1/A2=10, 20°': 56, 'A1/A2=10, 30°': 67, 'A1/A2=10, 45°': 80, 'A1/A2=10, 60°': 91, 'A1/A2=10, 90°': 99, 'A1/A2=10, 120°': 97, 'A1/A2=10, 180°': 98
      }
    },
    '9d_rect_to_round': {
      name: '9d: Rectangular to Round (Expanding)',
      category: 'Transitions (Expanding)',
      image: '9d - Trans Rect Round.jpeg',
      paramName: 'Dimension Ratio (Rect W₁×L₁ to Round D₂) & Angle',
      options: {
        'A1/A2=2, 16°': 20, 'A1/A2=2, 20°': 25, 'A1/A2=2, 30°': 28, 'A1/A2=2, 45°': 33, 'A1/A2=2, 60°': 35, 'A1/A2=2, 90°': 36, 'A1/A2=2, 120°': 37, 'A1/A2=2, 180°': 34,
        'A1/A2=4, 16°': 41, 'A1/A2=4, 20°': 49, 'A1/A2=4, 30°': 57, 'A1/A2=4, 45°': 64, 'A1/A2=4, 60°': 69, 'A1/A2=4, 90°': 72, 'A1/A2=4, 120°': 72, 'A1/A2=4, 180°': 72,
        'A1/A2=6, 16°': 48, 'A1/A2=6, 20°': 53, 'A1/A2=6, 30°': 66, 'A1/A2=6, 45°': 77, 'A1/A2=6, 60°': 82, 'A1/A2=6, 90°': 86, 'A1/A2=6, 120°': 86, 'A1/A2=6, 180°': 85,
        'A1/A2=10, 16°': 48, 'A1/A2=10, 20°': 56, 'A1/A2=10, 30°': 67, 'A1/A2=10, 45°': 80, 'A1/A2=10, 60°': 91, 'A1/A2=10, 90°': 99, 'A1/A2=10, 120°': 97, 'A1/A2=10, 180°': 98
      }
    },
    '10a_rect_straight_sides': {
      name: '10a: Expanding Flow Rectangular Straight Sides',
      category: 'Transitions (Expanding)',
      image: '10a - Trans Rect Expand Straight.jpeg',
      paramName: 'Dimension Ratio (Width & Length) & Angle',
      options: {
        'A1/A2=2, 14°': 10, 'A1/A2=2, 20°': 14, 'A1/A2=2, 30°': 23, 'A1/A2=2, 45°': 39, 'A1/A2=2, 60°': 42, 'A1/A2=2, 90°': 43, 'A1/A2=2, 180°': 40,
        'A1/A2=4, 14°': 18, 'A1/A2=4, 20°': 28, 'A1/A2=4, 30°': 48, 'A1/A2=4, 45°': 68, 'A1/A2=4, 60°': 77, 'A1/A2=4, 90°': 80, 'A1/A2=4, 180°': 75,
        'A1/A2=6, 14°': 22, 'A1/A2=6, 20°': 34, 'A1/A2=6, 30°': 55, 'A1/A2=6, 45°': 74, 'A1/A2=6, 60°': 86, 'A1/A2=6, 90°': 94, 'A1/A2=6, 180°': 91
      }
    }
  },

  // 10. Transitions Contracting Flow (Page 67)
  transitionsContracting: {
    '10b_rect_contracting': {
      name: '10b: Contracting Flow (Rectangular)',
      category: 'Transitions (Contracting)',
      image: '10b - Trans Rect.jpeg',
      paramName: 'Dimension Ratio (Width & Length) & Angle',
      options: {
        'A1/A2=2, 10°': 6, 'A1/A2=2, 15-40°': 6, 'A1/A2=2, 50-60°': 7, 'A1/A2=2, 90°': 14, 'A1/A2=2, 120°': 20, 'A1/A2=2, 150°': 27, 'A1/A2=2, 180°': 30,
        'A1/A2=4, 10°': 6, 'A1/A2=4, 15-40°': 5, 'A1/A2=4, 50-60°': 8, 'A1/A2=4, 90°': 19, 'A1/A2=4, 120°': 31, 'A1/A2=4, 150°': 40, 'A1/A2=4, 180°': 47,
        'A1/A2=6, 10°': 6, 'A1/A2=6, 15-40°': 5, 'A1/A2=6, 50-60°': 8, 'A1/A2=6, 90°': 20, 'A1/A2=6, 120°': 32, 'A1/A2=6, 150°': 41, 'A1/A2=6, 180°': 48,
        'A1/A2=10, 10°': 6, 'A1/A2=10, 15-40°': 6, 'A1/A2=10, 50-60°': 9, 'A1/A2=10, 90°': 22, 'A1/A2=10, 120°': 33, 'A1/A2=10, 150°': 42, 'A1/A2=10, 180°': 49
      }
    },
    '10c_round_contracting': {
      name: '10c: Contracting Flow (Round)',
      category: 'Transitions (Contracting)',
      image: '10c - Trans Round.jpeg',
      paramName: 'Area Ratio (A1/A2) & Angle',
      options: {
        'A1/A2=2, 10°': 6, 'A1/A2=2, 15-40°': 6, 'A1/A2=2, 50-60°': 7, 'A1/A2=2, 90°': 14, 'A1/A2=2, 120°': 20, 'A1/A2=2, 150°': 27, 'A1/A2=2, 180°': 30,
        'A1/A2=4, 10°': 6, 'A1/A2=4, 15-40°': 5, 'A1/A2=4, 50-60°': 8, 'A1/A2=4, 90°': 19, 'A1/A2=4, 120°': 31, 'A1/A2=4, 150°': 40, 'A1/A2=4, 180°': 47,
        'A1/A2=6, 10°': 6, 'A1/A2=6, 15-40°': 5, 'A1/A2=6, 50-60°': 8, 'A1/A2=6, 90°': 20, 'A1/A2=6, 120°': 32, 'A1/A2=6, 150°': 41, 'A1/A2=6, 180°': 48,
        'A1/A2=10, 10°': 6, 'A1/A2=10, 15-40°': 6, 'A1/A2=10, 50-60°': 9, 'A1/A2=10, 90°': 22, 'A1/A2=10, 120°': 33, 'A1/A2=10, 150°': 42, 'A1/A2=10, 180°': 49
      }
    }
  },

  // 11. Presets & Flexible Duct (Page 50, 52)
  presetsSpecial: {
    'flex_elbow': {
      name: 'Flex Duct (5\' Smooth Radius Elbow)',
      category: 'Flex Duct / Presets',
      image: null,
      paramName: 'Specification',
      options: { '5 ft Smooth Radius Elbow to Diffuser/Inlet': 120 }
    },
    'flex_straight_run': {
      name: 'Flex Duct (Straight Run Equivalent)',
      category: 'Flex Duct / Presets',
      image: null,
      paramName: 'Length',
      options: { '5 ft flex run (1.5x straight loss)': 15, '10 ft flex run': 30, '15 ft flex run': 45 }
    },
    'custom_fitting': {
      name: 'Custom Fitting Equivalent Length',
      category: 'Custom Fitting',
      image: null,
      paramName: 'User Entry',
      options: { 'Custom Value': 0 }
    }
  }
};

// -------------------------------------------------------------------
// STATE VARIABLES FOR TOOL 6
// -------------------------------------------------------------------
var activeTool6Tab = 'estimator';
var lastCalculatedSummary = null;
var chainedScheduleRows = [];
var chainedScheduleRowIdCounter = 1;
var editingDuctRowId = null;
var editingFittingRowId = null;
var fittingsRows = []; // Maintained in sync for legacy compatibility
var fittingRowIdCounter = 1;
var componentRows = [];
var componentRowIdCounter = 1;

// -------------------------------------------------------------------
// CONVERSION FACTOR INTERPOLATION & ANALYTICAL HELPER
// Derived from SMACNA Loss Coefficients & Loren Cook Table 68 Baseline:
// Base reference condition: V_ref = 1350 FPM, DFL_ref = 0.10" w.g. / 100 ft
// Analytical formula: F = (V / 1350)^2 * (0.10 / DFL)
// Replaces static table clamping with exact continuous fluid mechanics
// -------------------------------------------------------------------
function lookupConversionFactor(v, dfl) {
  const vel = Math.max(0, parseFloat(v) || 0);
  const friction = Math.max(0.001, parseFloat(dfl) || 0.08);
  if (vel <= 0) return 0;

  // Exact Loren Cook Table 68 analytical governing formula:
  const factor = Math.pow(vel / 1350, 2) * (0.10 / friction);
  return Math.round(factor * 100) / 100;
}

// -------------------------------------------------------------------
// FITTING REPOSITORY FLATTENING FOR EASY LOOKUP
// -------------------------------------------------------------------
function getAllFittingsMap() {
  const map = {};
  const groups = [
    DUCT_LOSS_DATA.roundElbows,
    DUCT_LOSS_DATA.rectMitered,
    DUCT_LOSS_DATA.rectRadius,
    DUCT_LOSS_DATA.convergingTeeRect,
    DUCT_LOSS_DATA.divergingTeeRect,
    DUCT_LOSS_DATA.teeRound90,
    DUCT_LOSS_DATA.divergingTeeRound,
    DUCT_LOSS_DATA.wye,
    DUCT_LOSS_DATA.transitionsExpanding,
    DUCT_LOSS_DATA.transitionsContracting,
    DUCT_LOSS_DATA.presetsSpecial
  ];

  groups.forEach(grp => {
    Object.keys(grp).forEach(k => {
      map[k] = grp[k];
    });
  });

  // Backwards compatibility and shorthand aliases for 10a, 10b, 10c
  if (DUCT_LOSS_DATA.transitionsExpanding['10a_rect_straight_sides']) {
    map['10a'] = DUCT_LOSS_DATA.transitionsExpanding['10a_rect_straight_sides'];
  }
  if (DUCT_LOSS_DATA.transitionsContracting['10b_rect_contracting']) {
    map['10b'] = DUCT_LOSS_DATA.transitionsContracting['10b_rect_contracting'];
    map['10b_10c_contracting'] = DUCT_LOSS_DATA.transitionsContracting['10b_rect_contracting'];
  }
  if (DUCT_LOSS_DATA.transitionsContracting['10c_round_contracting']) {
    map['10c'] = DUCT_LOSS_DATA.transitionsContracting['10c_round_contracting'];
    map['10c_round'] = DUCT_LOSS_DATA.transitionsContracting['10c_round_contracting'];
    map['10c_rect_straight_sides'] = DUCT_LOSS_DATA.transitionsContracting['10c_round_contracting'];
  }

  return map;
}

// -------------------------------------------------------------------
// FITTING IMAGE & LIGHTBOX HELPERS
// -------------------------------------------------------------------
function getFittingImagePath(imageName) {
  if (!imageName) return '';
  return 'Duct Fittings/' + imageName;
}

function lockBodyScroll() {
  document.body.classList.add('overflow-hidden');
}

function unlockBodyScroll() {
  // Check if any modal is still visible before restoring body scroll
  const openModals = document.querySelectorAll('#addFittingModal:not(.hidden), #firstDuctModal:not(.hidden), #saveSessionModal:not(.hidden), #editSessionModal:not(.hidden), #imageLightboxModal:not(.hidden)');
  if (!openModals || openModals.length === 0) {
    document.body.classList.remove('overflow-hidden');
  }
}

// ===================================================================
// FITTING AIRFLOW PATH & VECTOR OVERLAY SYSTEM
// Comprehensive definitions for All Fitting Types (Groups 1–11):
// - Red Block Arrows: Critical path TDL airflow
// - Grey Block Arrows: Tributary merge / continuing trunk flow
// - Engineering Port Subscripts: Qt, Vt, Qb, Vb, At, Ab, A1, A2
// - Red Fitting Badges: 4a, 4d, 5a, 6d, etc. matching Loren Cook Handbook
// ===================================================================

const FITTING_AIRFLOW_DEFINITIONS = {
  // 1. ROUND ELBOWS (1a-1f)
  '1a_90_smooth': {
    code: '1a', flowType: 'elbow',
    name: '1a: Smooth Radius 90° Elbow',
    description: '90° Smooth Radius Elbow: Bottom Inlet (Qt) → Upper Outlet (Vt)',
    arrows: [
      { tipX: 36, tipY: 82, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 88, tipY: 26, angleDeg: 345, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    curve: 'M 36,80 A 38 38 0 0 1 76,28',
    labels: [
      { x: 20, y: 92, text: 'Qt', sub: 't' },
      { x: 48, y: 92, text: 'D' },
      { x: 92, y: 40, text: 'Vt', sub: 't' }
    ]
  },
  '1b_90_5piece': {
    code: '1b', flowType: 'elbow',
    name: '1b: 5-Piece 90° Elbow',
    description: '90° 5-Piece Elbow: Bottom Inlet (Qt) → Upper Outlet (Vt)',
    arrows: [
      { tipX: 36, tipY: 82, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 88, tipY: 26, angleDeg: 345, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    curve: 'M 36,80 A 38 38 0 0 1 76,28',
    labels: [
      { x: 20, y: 92, text: 'Qt', sub: 't' },
      { x: 48, y: 92, text: 'D' },
      { x: 92, y: 40, text: 'Vt', sub: 't' }
    ]
  },
  '1c_90_3piece': {
    code: '1c', flowType: 'elbow',
    name: '1c: 3-Piece 90° Elbow',
    description: '90° 3-Piece Elbow: Bottom Inlet (Qt) → Upper Outlet (Vt)',
    arrows: [
      { tipX: 36, tipY: 82, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 88, tipY: 26, angleDeg: 345, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    curve: 'M 36,80 A 38 38 0 0 1 76,28',
    labels: [
      { x: 20, y: 92, text: 'Qt', sub: 't' },
      { x: 48, y: 92, text: 'D' },
      { x: 92, y: 40, text: 'Vt', sub: 't' }
    ]
  },
  '1d_90_mitered': {
    code: '1d', flowType: 'elbow',
    name: '1d: Mitered 90° Elbow',
    description: '90° Mitered Elbow: Bottom Inlet (Qt) → Upper Outlet (Vt)',
    arrows: [
      { tipX: 36, tipY: 82, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 88, tipY: 26, angleDeg: 345, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    curve: 'M 36,80 L 36,36 L 76,28',
    labels: [
      { x: 20, y: 92, text: 'Qt', sub: 't' },
      { x: 48, y: 92, text: 'D' },
      { x: 92, y: 40, text: 'Vt', sub: 't' }
    ]
  },
  '1e_45_3piece': {
    code: '1e', flowType: 'elbow',
    name: '1e: 3-Piece 45° Elbow',
    description: '45° 3-Piece Elbow: Bottom Inlet (Qt) → 45° Outlet (Vt)',
    arrows: [
      { tipX: 36, tipY: 82, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 76, tipY: 22, angleDeg: 315, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    curve: 'M 36,80 Q 36,52 68,26',
    labels: [
      { x: 20, y: 92, text: 'Qt', sub: 't' },
      { x: 86, y: 36, text: 'Vt', sub: 't' }
    ]
  },
  '1f_45_2piece': {
    code: '1f', flowType: 'elbow',
    name: '1f: 2-Piece 45° Elbow',
    description: '45° 2-Piece Elbow: Bottom Inlet (Qt) → 45° Outlet (Vt)',
    arrows: [
      { tipX: 36, tipY: 82, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 76, tipY: 22, angleDeg: 315, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    curve: 'M 36,80 Q 36,52 68,26',
    labels: [
      { x: 20, y: 92, text: 'Qt', sub: 't' },
      { x: 86, y: 36, text: 'Vt', sub: 't' }
    ]
  },

  // 2. RECTANGULAR MITERED ELBOWS (2a-2c)
  '2a_vanes': {
    code: '2a', flowType: 'elbow',
    name: '2a: Rect Mitered with Vanes',
    description: '90° Rect Mitered (With Vanes): Bottom Inlet (Qt) → Right Outlet (Vt)',
    arrows: [
      { tipX: 30, tipY: 76, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 90, tipY: 48, angleDeg: 350, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    labels: [
      { x: 16, y: 86, text: 'Qt', sub: 't' },
      { x: 42, y: 86, text: 'W×H' },
      { x: 94, y: 64, text: 'Vt', sub: 't' }
    ]
  },
  '2b_no_vanes': {
    code: '2b', flowType: 'elbow',
    name: '2b: Rect Mitered without Vanes',
    description: '90° Rect Mitered (Without Vanes): Bottom Inlet (Qt) → Right Outlet (Vt)',
    arrows: [
      { tipX: 30, tipY: 76, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 90, tipY: 48, angleDeg: 350, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    labels: [
      { x: 16, y: 86, text: 'Qt', sub: 't' },
      { x: 42, y: 86, text: 'W×H' },
      { x: 94, y: 64, text: 'Vt', sub: 't' }
    ]
  },
  '2c_tee_double': {
    code: '2c', flowType: 'split',
    name: '2c: Tee Double Elbow Equivalent',
    description: 'Double Miter Split: Bottom Trunk Inlet (Qt) → Dual Opposing Elbows',
    arrows: [
      { tipX: 48, tipY: 78, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 12, tipY: 38, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 88, tipY: 38, angleDeg: 340, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 58, y: 86, text: 'Qt', sub: 't' },
      { x: 12, y: 54, text: 'Qb1', sub: 'b1' },
      { x: 88, y: 54, text: 'Qb2', sub: 'b2' }
    ]
  },

  // 3. RECTANGULAR RADIUS ELBOWS (3a-3c)
  '3a_vanes': {
    code: '3a', flowType: 'elbow',
    name: '3a: Rect Radius with Vanes',
    description: '90° Rect Radius (With Vanes): Right Inlet (Qt) → Bottom-Left Outlet (Vt)',
    arrows: [
      { tipX: 74, tipY: 46, angleDeg: 205, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 24, tipY: 84, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    curve: 'M 74,46 Q 38,48 24,84',
    labels: [
      { x: 88, y: 38, text: 'Qt', sub: 't' },
      { x: 14, y: 88, text: 'Vt', sub: 't' }
    ]
  },
  '3b_no_vanes': {
    code: '3b', flowType: 'elbow',
    name: '3b: Rect Radius without Vanes',
    description: '90° Rect Radius (Without Vanes): Right Inlet (Qt) → Bottom-Left Outlet (Vt)',
    arrows: [
      { tipX: 74, tipY: 46, angleDeg: 205, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 24, tipY: 84, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    curve: 'M 74,46 Q 38,48 24,84',
    labels: [
      { x: 88, y: 38, text: 'Qt', sub: 't' },
      { x: 14, y: 88, text: 'Vt', sub: 't' }
    ]
  },
  '3c_wye_double': {
    code: '3c', flowType: 'split',
    name: '3c: Wye Double Elbow Equivalent',
    description: 'Double Radius Split: Trunk Inlet (Qt) → Dual Radius Branches',
    arrows: [
      { tipX: 50, tipY: 80, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 14, tipY: 35, angleDeg: 210, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 86, tipY: 35, angleDeg: 330, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 60, y: 88, text: 'Qt', sub: 't' },
      { x: 14, y: 50, text: 'Qb1', sub: 'b1' },
      { x: 86, y: 50, text: 'Qb2', sub: 'b2' }
    ]
  },

  // 4. CONVERGING RECTANGULAR TEES (4a-4f) - RETURN FLOWS
  '4a_rect_branch': {
    code: '4a', flowType: 'return',
    name: '4a: Converging Tee Rect Branch',
    description: 'Return Flow: Branch Inlet (Qb) → Merged Trunk Outlet (Qt)',
    arrows: [
      { tipX: 30.5, tipY: 60.5, angleDeg: 325, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 7.5, tipY: 22, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 84, tipY: 73, angleDeg: 195, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 23, y: 78, text: 'Qb', sub: 'b' },
      { x: 24, y: 15, text: 'Qt', sub: 't' },
      { x: 14, y: 35, text: 'Vt', sub: 't' }
    ]
  },
  '4b_rect_45_entry': {
    code: '4b', flowType: 'return',
    name: '4b: Converging Tee Rect 45° Branch',
    description: 'Return Flow: 45° Branch Inlet (Qb) → Merged Trunk Outlet (Qt)',
    arrows: [
      { tipX: 30.5, tipY: 60.5, angleDeg: 325, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 7.5, tipY: 22, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 84, tipY: 73, angleDeg: 195, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 23, y: 78, text: 'Qb', sub: 'b' },
      { x: 24, y: 15, text: 'Qt', sub: 't' },
      { x: 14, y: 35, text: 'Vt', sub: 't' }
    ]
  },
  '4c_round_branch': {
    code: '4c', flowType: 'return',
    name: '4c: Converging Tee Round Branch',
    description: 'Return Flow: Round Branch Inlet (Qb) → Merged Trunk Outlet (Qt)',
    arrows: [
      { tipX: 30.5, tipY: 60.5, angleDeg: 325, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 7.5, tipY: 22, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 84, tipY: 73, angleDeg: 195, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 23, y: 78, text: 'Qb', sub: 'b' },
      { x: 24, y: 15, text: 'Qt', sub: 't' },
      { x: 14, y: 35, text: 'Vt', sub: 't' }
    ]
  },
  '4d_rect_trunk': {
    code: '4d', flowType: 'return',
    name: '4d: Converging Tee Rect Trunk',
    description: 'Return Flow: Trunk Through-Flow (Qt) with Merging Branch (Qb)',
    arrows: [
      { tipX: 84, tipY: 73, angleDeg: 195, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 7.5, tipY: 22, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 30.5, tipY: 60.5, angleDeg: 325, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 23, y: 78, text: 'Qb', sub: 'b' },
      { x: 24, y: 15, text: 'Qt', sub: 't' },
      { x: 14, y: 35, text: 'Vt', sub: 't' }
    ]
  },
  '4e_rect_45_trunk': {
    code: '4e', flowType: 'return',
    name: '4e: Converging Tee Rect 45° Trunk',
    description: 'Return Flow: Trunk Through-Flow (Qt) with Merging 45° Branch (Qb)',
    arrows: [
      { tipX: 84, tipY: 73, angleDeg: 195, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 7.5, tipY: 22, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 30.5, tipY: 60.5, angleDeg: 325, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 23, y: 78, text: 'Qb', sub: 'b' },
      { x: 24, y: 15, text: 'Qt', sub: 't' },
      { x: 14, y: 35, text: 'Vt', sub: 't' }
    ]
  },
  '4f_round_trunk': {
    code: '4f', flowType: 'return',
    name: '4f: Converging Tee Round Trunk',
    description: 'Return Flow: Trunk Through-Flow (Qt) with Merging Round Branch (Qb)',
    arrows: [
      { tipX: 84, tipY: 73, angleDeg: 195, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 7.5, tipY: 22, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 30.5, tipY: 60.5, angleDeg: 325, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 23, y: 78, text: 'Qb', sub: 'b' },
      { x: 24, y: 15, text: 'Qt', sub: 't' },
      { x: 14, y: 35, text: 'Vt', sub: 't' }
    ]
  },

  // 5. DIVERGING RECTANGULAR TEES (5a-5f) - SUPPLY FLOWS
  '5a_rect_branch': {
    code: '5a', flowType: 'supply',
    name: '5a: Diverging Tee Rect Branch',
    description: 'Supply Flow: Trunk Supply (Qt) → Branch Takeoff (Qb)',
    arrows: [
      { tipX: 24, tipY: 28, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 16.5, tipY: 70.5, angleDeg: 145, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 96, tipY: 76, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 26, y: 14, text: 'Qt', sub: 't' },
      { x: 14, y: 34, text: 'Vt', sub: 't' },
      { x: 28, y: 76, text: 'Vb', sub: 'b' },
      { x: 18, y: 85, text: 'Qb', sub: 'b' }
    ]
  },
  '5b_rect_45_entry': {
    code: '5b', flowType: 'supply',
    name: '5b: Diverging Tee Rect 45° Branch',
    description: 'Supply Flow: Trunk Supply (Qt) → 45° Branch Takeoff (Qb)',
    arrows: [
      { tipX: 24, tipY: 28, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 16.5, tipY: 70.5, angleDeg: 145, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 96, tipY: 76, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 26, y: 14, text: 'Qt', sub: 't' },
      { x: 14, y: 34, text: 'Vt', sub: 't' },
      { x: 28, y: 76, text: 'Vb', sub: 'b' },
      { x: 18, y: 85, text: 'Qb', sub: 'b' }
    ]
  },
  '5c_round_branch': {
    code: '5c', flowType: 'supply',
    name: '5c: Diverging Tee Round Branch',
    description: 'Supply Flow: Trunk Supply (Qt) → Round Branch Takeoff (Qb)',
    arrows: [
      { tipX: 24, tipY: 28, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 16.5, tipY: 70.5, angleDeg: 145, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 96, tipY: 76, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 26, y: 14, text: 'Qt', sub: 't' },
      { x: 14, y: 34, text: 'Vt', sub: 't' },
      { x: 28, y: 76, text: 'Vb', sub: 'b' },
      { x: 18, y: 85, text: 'Qb', sub: 'b' }
    ]
  },
  '5d_rect_trunk': {
    code: '5d', flowType: 'supply',
    name: '5d: Diverging Tee Rect Trunk',
    description: 'Supply Flow: Trunk Through-Flow (Qt) continuing past Branch (Qb)',
    arrows: [
      { tipX: 24, tipY: 28, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 96, tipY: 76, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 16.5, tipY: 70.5, angleDeg: 145, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 26, y: 14, text: 'Qt', sub: 't' },
      { x: 14, y: 34, text: 'Vt', sub: 't' },
      { x: 28, y: 76, text: 'Vb', sub: 'b' },
      { x: 18, y: 85, text: 'Qb', sub: 'b' }
    ]
  },
  '5e_rect_45_trunk': {
    code: '5e', flowType: 'supply',
    name: '5e: Diverging Tee Rect 45° Trunk',
    description: 'Supply Flow: Trunk Through-Flow (Qt) continuing past 45° Branch (Qb)',
    arrows: [
      { tipX: 24, tipY: 28, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 96, tipY: 76, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 16.5, tipY: 70.5, angleDeg: 145, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 26, y: 14, text: 'Qt', sub: 't' },
      { x: 14, y: 34, text: 'Vt', sub: 't' },
      { x: 28, y: 76, text: 'Vb', sub: 'b' },
      { x: 18, y: 85, text: 'Qb', sub: 'b' }
    ]
  },
  '5f_round_trunk': {
    code: '5f', flowType: 'supply',
    name: '5f: Diverging Tee Round Trunk',
    description: 'Supply Flow: Trunk Through-Flow (Qt) continuing past Round Branch (Qb)',
    arrows: [
      { tipX: 24, tipY: 28, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 96, tipY: 76, angleDeg: 25, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 16.5, tipY: 70.5, angleDeg: 145, length: 17, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 26, y: 14, text: 'Qt', sub: 't' },
      { x: 14, y: 34, text: 'Vt', sub: 't' },
      { x: 28, y: 76, text: 'Vb', sub: 'b' },
      { x: 18, y: 85, text: 'Qb', sub: 'b' }
    ]
  },

  // 6. ROUND TEES 90° (6a-6d)
  '6a_converging_branch': {
    code: '6a', flowType: 'return',
    name: '6a: Round Tee 90° Converging Branch',
    description: 'Return Flow: Top Branch Inlet (Qb) → Left Trunk Outlet (Qt)',
    arrows: [
      { tipX: 52, tipY: 26, angleDeg: 90, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 8, tipY: 56, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 78, tipY: 72, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 36, y: 18, text: 'Ab', sub: 'b' },
      { x: 68, y: 18, text: 'Qb', sub: 'b' },
      { x: 20, y: 44, text: 'At', sub: 't' },
      { x: 18, y: 72, text: 'Qt', sub: 't' }
    ]
  },
  '6b_diverging_branch': {
    code: '6b', flowType: 'supply',
    name: '6b: Round Tee 90° Diverging Branch',
    description: 'Supply Flow: Right Trunk Inlet (Qt) → Top Branch Outlet (Qb)',
    arrows: [
      { tipX: 78, tipY: 72, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 52, tipY: 8, angleDeg: 270, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 8, tipY: 56, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 88, y: 62, text: 'At', sub: 't' },
      { x: 86, y: 88, text: 'Qt', sub: 't' },
      { x: 36, y: 18, text: 'Ab', sub: 'b' },
      { x: 68, y: 18, text: 'Qb', sub: 'b' }
    ]
  },
  '6c_converging_trunk': {
    code: '6c', flowType: 'return',
    name: '6c: Round Tee 90° Converging Trunk',
    description: 'Return Flow: Trunk Through-Flow (Qt) with Merging Top Branch (Qb)',
    arrows: [
      { tipX: 78, tipY: 72, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 8, tipY: 56, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 52, tipY: 26, angleDeg: 90, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 88, y: 62, text: 'At', sub: 't' },
      { x: 86, y: 88, text: 'Qt', sub: 't' },
      { x: 36, y: 18, text: 'Ab', sub: 'b' },
      { x: 68, y: 18, text: 'Qb', sub: 'b' }
    ]
  },
  '6d_diverging_trunk': {
    code: '6d', flowType: 'supply',
    name: '6d: Round Tee 90° Diverging Trunk',
    description: 'Supply Flow: Trunk Through-Flow (Qt) continuing past Branch (Qb)',
    arrows: [
      { tipX: 78, tipY: 72, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 8, tipY: 56, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 52, tipY: 8, angleDeg: 270, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 88, y: 62, text: 'At', sub: 't' },
      { x: 86, y: 88, text: 'Qt', sub: 't' },
      { x: 36, y: 18, text: 'Ab', sub: 'b' },
      { x: 68, y: 18, text: 'Qb', sub: 'b' }
    ]
  },

  // 7. DIVERGING TEE ROUND TRUNK (7a-7f)
  '7a_45_elbow': {
    code: '7a', flowType: 'supply',
    name: '7a: Round Trunk w/ 45° Branch Elbow',
    description: 'Supply Flow: Trunk Supply (Qt) → 45° Branch Elbow Takeoff (Qb)',
    arrows: [
      { tipX: 78, tipY: 72, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 66, tipY: 10, angleDeg: 305, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 8, tipY: 56, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 88, y: 62, text: 'Qt', sub: 't' },
      { x: 86, y: 88, text: 'Vt', sub: 't' },
      { x: 68, y: 22, text: 'Qb', sub: 'b' },
      { x: 36, y: 22, text: 'Vb', sub: 'b' }
    ]
  },
  '7b_conical': {
    code: '7b', flowType: 'supply',
    name: '7b: Round Trunk w/ Conical Branch',
    description: 'Supply Flow: Trunk Supply (Qt) → Conical Branch Takeoff (Qb)',
    arrows: [
      { tipX: 78, tipY: 72, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 52, tipY: 8, angleDeg: 270, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 8, tipY: 56, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 88, y: 62, text: 'Qt', sub: 't' },
      { x: 86, y: 88, text: 'Vt', sub: 't' },
      { x: 68, y: 18, text: 'Qb', sub: 'b' },
      { x: 36, y: 18, text: 'Vb', sub: 'b' }
    ]
  },
  '7c_90_elbow': {
    code: '7c', flowType: 'supply',
    name: '7c: Round Trunk w/ 90° Branch Elbow',
    description: 'Supply Flow: Trunk Supply (Qt) → 90° Branch Elbow Takeoff (Qb)',
    arrows: [
      { tipX: 78, tipY: 72, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 52, tipY: 8, angleDeg: 270, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'critical' },
      { tipX: 8, tipY: 56, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'secondary' }
    ],
    labels: [
      { x: 88, y: 62, text: 'Qt', sub: 't' },
      { x: 86, y: 88, text: 'Vt', sub: 't' },
      { x: 68, y: 18, text: 'Qb', sub: 'b' },
      { x: 36, y: 18, text: 'Vb', sub: 'b' }
    ]
  },
  '7d_rolled_45_trunk': {
    code: '7d', flowType: 'supply',
    name: '7d: Rolled 45° Branch Round Trunk',
    description: 'Supply Flow: Trunk Through-Flow (Qt) continuing past 45° Takeoff (Qb)',
    arrows: [
      { tipX: 78, tipY: 72, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 8, tipY: 56, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 66, tipY: 10, angleDeg: 305, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 88, y: 62, text: 'Qt', sub: 't' },
      { x: 86, y: 88, text: 'Vt', sub: 't' },
      { x: 68, y: 22, text: 'Qb', sub: 'b' },
      { x: 36, y: 22, text: 'Vb', sub: 'b' }
    ]
  },
  '7e_conical_trunk': {
    code: '7e', flowType: 'supply',
    name: '7e: Conical Branch Round Trunk',
    description: 'Supply Flow: Trunk Through-Flow (Qt) continuing past Conical Takeoff (Qb)',
    arrows: [
      { tipX: 78, tipY: 72, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 8, tipY: 56, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 52, tipY: 8, angleDeg: 270, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 88, y: 62, text: 'Qt', sub: 't' },
      { x: 86, y: 88, text: 'Vt', sub: 't' },
      { x: 68, y: 18, text: 'Qb', sub: 'b' },
      { x: 36, y: 18, text: 'Vb', sub: 'b' }
    ]
  },
  '7f_90_trunk': {
    code: '7f', flowType: 'supply',
    name: '7f: 90° Branch Round Trunk',
    description: 'Supply Flow: Trunk Through-Flow (Qt) continuing past 90° Takeoff (Qb)',
    arrows: [
      { tipX: 78, tipY: 72, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 8, tipY: 56, angleDeg: 200, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 52, tipY: 8, angleDeg: 270, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 88, y: 62, text: 'Qt', sub: 't' },
      { x: 86, y: 88, text: 'Vt', sub: 't' },
      { x: 68, y: 18, text: 'Qb', sub: 'b' },
      { x: 36, y: 18, text: 'Vb', sub: 'b' }
    ]
  },

  // 8. WYE PAIR OF PANTS (8a-8b)
  '8a_diverging': {
    code: '8a', flowType: 'supply',
    name: '8a: Wye Diverging',
    description: 'Supply Flow: Trunk Supply (Qt) → Critical Branch Leg (Qb1)',
    arrows: [
      { tipX: 74, tipY: 58, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 12, tipY: 46, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 38, tipY: 18, angleDeg: 215, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 88, y: 70, text: 'Qt', sub: 't' },
      { x: 86, y: 50, text: 'Vt', sub: 't' },
      { x: 14, y: 62, text: 'Qb1', sub: 'b1' },
      { x: 14, y: 34, text: 'Vb1', sub: 'b1' },
      { x: 42, y: 10, text: 'Qb2', sub: 'b2' }
    ]
  },
  '8b_converging': {
    code: '8b', flowType: 'return',
    name: '8b: Wye Converging',
    description: 'Return Flow: Critical Branch Leg (Qb1) → Merged Trunk Outlet (Qt)',
    arrows: [
      { tipX: 26, tipY: 56, angleDeg: 35, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 94, tipY: 68, angleDeg: 35, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 52, tipY: 28, angleDeg: 35, length: 16, headWidth: 13, shaftWidth: 6.5, type: 'secondary' }
    ],
    labels: [
      { x: 14, y: 62, text: 'Qb1', sub: 'b1' },
      { x: 14, y: 34, text: 'Vb1', sub: 'b1' },
      { x: 88, y: 76, text: 'Qt', sub: 't' },
      { x: 86, y: 54, text: 'Vt', sub: 't' },
      { x: 42, y: 10, text: 'Qb2', sub: 'b2' }
    ]
  },

  // 9. TRANSITIONS EXPANDING (9a-9d, 10a)
  '9a_round_conical': {
    code: '9a', flowType: 'expanding',
    name: '9a: Round Conical Transition (Expanding)',
    description: 'Expanding Flow: Small Inlet (A₁, D₁) → Expanded Outlet (A₂, D₂)',
    arrows: [
      { tipX: 74, tipY: 62, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 12, tipY: 28, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    labels: [
      { x: 86, y: 74, text: 'A1', sub: '1' },
      { x: 84, y: 52, text: 'V1', sub: '1' },
      { x: 22, y: 18, text: 'A2', sub: '2' },
      { x: 10, y: 40, text: 'V2', sub: '2' }
    ]
  },
  '9b_rect_to_rect': {
    code: '9b', flowType: 'expanding',
    name: '9b: Rectangular to Rectangular (Expanding)',
    description: 'Expanding Flow: Small Inlet (A₁, W₁×H₁) → Expanded Outlet (A₂, W₂×H₂)',
    arrows: [
      { tipX: 74, tipY: 62, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 12, tipY: 28, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    labels: [
      { x: 86, y: 74, text: 'A1', sub: '1' },
      { x: 84, y: 52, text: 'V1', sub: '1' },
      { x: 22, y: 18, text: 'A2', sub: '2' },
      { x: 10, y: 40, text: 'V2', sub: '2' }
    ]
  },
  '9c_round_to_rect': {
    code: '9c', flowType: 'expanding',
    name: '9c: Round to Rectangular (Expanding)',
    description: 'Expanding Flow: Round Inlet (A₁, D₁) → Expanded Rect Outlet (A₂, W₂×H₂)',
    arrows: [
      { tipX: 74, tipY: 62, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 12, tipY: 28, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    labels: [
      { x: 86, y: 74, text: 'A1', sub: '1' },
      { x: 84, y: 52, text: 'V1', sub: '1' },
      { x: 22, y: 18, text: 'A2', sub: '2' },
      { x: 10, y: 40, text: 'V2', sub: '2' }
    ]
  },
  '9d_rect_to_round': {
    code: '9d', flowType: 'expanding',
    name: '9d: Rectangular to Round (Expanding)',
    description: 'Expanding Flow: Rect Inlet (A₁, W₁×H₁) → Expanded Round Outlet (A₂, D₂)',
    arrows: [
      { tipX: 74, tipY: 62, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 12, tipY: 28, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    labels: [
      { x: 86, y: 74, text: 'A1', sub: '1' },
      { x: 84, y: 52, text: 'V1', sub: '1' },
      { x: 22, y: 18, text: 'A2', sub: '2' },
      { x: 10, y: 40, text: 'V2', sub: '2' }
    ]
  },
  '10a_rect_straight_sides': {
    code: '10a', flowType: 'expanding',
    name: '10a: Expanding Rect Straight Sides',
    description: 'Expanding Flow: Small Inlet (A₁) → Straight-Sided Expanded Outlet (A₂)',
    arrows: [
      { tipX: 74, tipY: 62, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 12, tipY: 28, angleDeg: 215, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    labels: [
      { x: 86, y: 74, text: 'A1', sub: '1' },
      { x: 84, y: 52, text: 'V1', sub: '1' },
      { x: 22, y: 18, text: 'A2', sub: '2' },
      { x: 10, y: 40, text: 'V2', sub: '2' }
    ]
  },

  // 10. TRANSITIONS CONTRACTING (10b-10c)
  '10b_rect_contracting': {
    code: '10b', flowType: 'contracting',
    name: '10b: Contracting Flow (Rectangular)',
    description: 'Contracting Flow: Large Upstream Duct (A₁) → Reduced Downstream Duct (A₂)',
    arrows: [
      { tipX: 28, tipY: 38, angleDeg: 35, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 92, tipY: 76, angleDeg: 35, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    labels: [
      { x: 22, y: 18, text: 'A1', sub: '1' },
      { x: 10, y: 40, text: 'V1', sub: '1' },
      { x: 86, y: 74, text: 'A2', sub: '2' },
      { x: 84, y: 52, text: 'V2', sub: '2' }
    ]
  },
  '10c_round_contracting': {
    code: '10c', flowType: 'contracting',
    name: '10c: Contracting Flow (Round)',
    description: 'Contracting Flow: Large Upstream Duct (A₁) → Reduced Downstream Duct (A₂)',
    arrows: [
      { tipX: 28, tipY: 38, angleDeg: 35, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 92, tipY: 76, angleDeg: 35, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    labels: [
      { x: 22, y: 18, text: 'A1', sub: '1' },
      { x: 10, y: 40, text: 'V1', sub: '1' },
      { x: 86, y: 74, text: 'A2', sub: '2' },
      { x: 84, y: 52, text: 'V2', sub: '2' }
    ]
  },

  // 11. PRESETS / FLEX DUCT
  'flex_elbow': {
    code: 'Flex', flowType: 'elbow',
    name: 'Flex Duct (5\' Radius Elbow)',
    description: 'Flexible Duct Drop: Inlet → 90° Radius Sweep Outlet',
    arrows: [
      { tipX: 35, tipY: 78, angleDeg: 270, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' },
      { tipX: 88, tipY: 32, angleDeg: 350, length: 18, headWidth: 14, shaftWidth: 7, type: 'critical' }
    ],
    curve: 'M 35,78 Q 35,32 88,32',
    labels: [
      { x: 24, y: 90, text: 'Inlet' },
      { x: 92, y: 48, text: 'Outlet' }
    ]
  }
};

// Aliases for transitions and backwards compatibility
FITTING_AIRFLOW_DEFINITIONS['10a'] = FITTING_AIRFLOW_DEFINITIONS['10a_rect_straight_sides'];
FITTING_AIRFLOW_DEFINITIONS['10b'] = FITTING_AIRFLOW_DEFINITIONS['10b_rect_contracting'];
FITTING_AIRFLOW_DEFINITIONS['10c'] = FITTING_AIRFLOW_DEFINITIONS['10c_round_contracting'];
FITTING_AIRFLOW_DEFINITIONS['10c_round'] = FITTING_AIRFLOW_DEFINITIONS['10c_round_contracting'];
FITTING_AIRFLOW_DEFINITIONS['10c_rect_straight_sides'] = FITTING_AIRFLOW_DEFINITIONS['10c_round_contracting'];

function normalizeFittingKey(key) {
  if (!key) return '';
  let k = String(key).trim();
  if (k === '10a') return '10a_rect_straight_sides';
  if (k === '10b' || k === '10b_10c_contracting') return '10b_rect_contracting';
  if (k === '10c' || k === '10c_round' || k === '10c_rect_straight_sides') return '10c_round_contracting';
  return k;
}

function getFittingAirflowDef(key) {
  const normKey = normalizeFittingKey(key);
  return FITTING_AIRFLOW_DEFINITIONS[normKey] || null;
}

function findFittingKeyByImageSrc(src) {
  if (!src) return null;
  const decoded = decodeURI(src);
  const map = getAllFittingsMap();
  for (const k in map) {
    if (map[k] && map[k].image && (decoded.includes(map[k].image) || src.includes(map[k].image))) {
      return k;
    }
  }
  return null;
}

// Drawing mathematical SVG primitives
function drawBlockArrow(tipX, tipY, angleDeg, length = 18, headWidth = 14, shaftWidth = 7, color = '#DC2626') {
  const rad = (angleDeg * Math.PI) / 180.0;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const headLen = length * 0.52;
  const hw2 = headWidth / 2.0;
  const sw2 = shaftWidth / 2.0;

  const tip = `${tipX.toFixed(1)},${tipY.toFixed(1)}`;
  const barb1 = `${(tipX - headLen * cos - hw2 * sin).toFixed(1)},${(tipY - headLen * sin + hw2 * cos).toFixed(1)}`;
  const neck1 = `${(tipX - headLen * cos - sw2 * sin).toFixed(1)},${(tipY - headLen * sin + sw2 * cos).toFixed(1)}`;
  const base1 = `${(tipX - length * cos - sw2 * sin).toFixed(1)},${(tipY - length * sin + sw2 * cos).toFixed(1)}`;
  const base2 = `${(tipX - length * cos + sw2 * sin).toFixed(1)},${(tipY - length * sin - sw2 * cos).toFixed(1)}`;
  const neck2 = `${(tipX - headLen * cos + sw2 * sin).toFixed(1)},${(tipY - headLen * sin - sw2 * cos).toFixed(1)}`;
  const barb2 = `${(tipX - headLen * cos + hw2 * sin).toFixed(1)},${(tipY - headLen * sin - hw2 * cos).toFixed(1)}`;

  const stroke = (color === '#DC2626') ? '#7F1D1D' : '#475569';
  return `<polygon points="${tip} ${barb1} ${neck1} ${base1} ${base2} ${neck2} ${barb2}" fill="${color}" stroke="${stroke}" stroke-width="0.8" stroke-linejoin="round" filter="url(#airflowDropShadow)"/>`;
}

function drawPortLabel(x, y, text, subText = null, anchor = 'middle') {
  let content = text;
  if (subText && text.includes(subText)) {
    const mainText = text.replace(subText, '');
    content = `${mainText}<tspan baseline-shift="sub" font-size="75%">${subText}</tspan>`;
  }
  return `<text x="${x}" y="${y}" font-family="system-ui, -apple-system, sans-serif" font-size="7.5" font-weight="700" fill="#0F172A" stroke="#FFFFFF" stroke-width="2.2" paint-order="stroke fill" stroke-linejoin="round" text-anchor="${anchor}">${content}</text>`;
}

function drawFittingBadge(code, x = 76, y = 8, w = 18, h = 18) {
  return `
    <g class="airflow-badge">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="#DC2626" filter="url(#airflowDropShadow)"/>
      <text x="${x + w / 2}" y="${y + h / 2 + 3.2}" font-family="system-ui, -apple-system, sans-serif" font-size="9.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">${code}</text>
    </g>
  `;
}

function getFittingAirflowSvg(typeKey, options = {}) {
  const normKey = normalizeFittingKey(typeKey);
  const def = FITTING_AIRFLOW_DEFINITIONS[normKey];
  if (!def) return '';

  const showBadge = options.showBadge !== false;
  const showLabels = options.showLabels !== false && !options.isThumbnail;
  const isThumbnail = !!options.isThumbnail;

  let elements = [];

  // 1. Centerline sweep curve if present
  if (def.curve && !isThumbnail) {
    elements.push(`<path d="${def.curve}" fill="none" stroke="#DC2626" stroke-width="2" stroke-dasharray="3,3" stroke-linecap="round" opacity="0.45"/>`);
  }

  // 2. Flow Arrows
  if (def.arrows && Array.isArray(def.arrows)) {
    def.arrows.forEach(arr => {
      const isCrit = (arr.type === 'critical');
      const color = isCrit ? '#DC2626' : '#9CA3AF';
      const len = isThumbnail ? (arr.length * 1.1) : arr.length;
      const hw = isThumbnail ? (arr.headWidth * 1.15) : arr.headWidth;
      const sw = isThumbnail ? (arr.shaftWidth * 1.15) : arr.shaftWidth;
      elements.push(drawBlockArrow(arr.tipX, arr.tipY, arr.angleDeg, len, hw, sw, color));
    });
  }

  // 3. Port Labels
  if (showLabels && def.labels && Array.isArray(def.labels)) {
    def.labels.forEach(lbl => {
      elements.push(drawPortLabel(lbl.x, lbl.y, lbl.text, lbl.sub, lbl.anchor || 'middle'));
    });
  }

  // 4. Fitting Badge
  if (showBadge && def.code) {
    if (isThumbnail) {
      elements.push(drawFittingBadge(def.code, 68, 4, 28, 18));
    } else {
      elements.push(drawFittingBadge(def.code, 76, 8, 18, 18));
    }
  }

  return `
    <svg viewBox="0 0 100 100" class="airflow-overlay-svg w-full h-full pointer-events-none select-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="airflowDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.5" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      ${elements.join('\n      ')}
    </svg>
  `;
}

// Global overlay state and interactive controller
window.airflowOverlayEnabled = (localStorage.getItem('tool6_airflow_overlay') !== '0');
window.activeLightboxTypeKey = null;

function toggleAirflowOverlay() {
  window.airflowOverlayEnabled = !window.airflowOverlayEnabled;
  try {
    localStorage.setItem('tool6_airflow_overlay', window.airflowOverlayEnabled ? '1' : '0');
  } catch (e) {}
  refreshAirflowOverlays();
}

function refreshAirflowOverlays() {
  const isEnabled = window.airflowOverlayEnabled;

  // 1. Update toggle button text & classes
  const statuses = [
    document.getElementById('modalFlowToggleStatus'),
    document.getElementById('lightboxFlowToggleStatus'),
    document.getElementById('galleryFlowToggleStatus')
  ];
  statuses.forEach(st => {
    if (st) {
      st.textContent = isEnabled ? 'ON' : 'OFF';
      st.className = isEnabled ? 'text-emerald-400 font-bold' : 'text-slate-400 font-bold';
    }
  });

  const lbBtnIcon = document.querySelector('#lightboxFlowOverlayToggleBtn i');
  if (lbBtnIcon) {
    lbBtnIcon.className = isEnabled ? 'fa-solid fa-toggle-on text-emerald-400' : 'fa-solid fa-toggle-off text-slate-500';
  }

  // 2. Refresh Modal Preview Overlay
  const modalType = document.getElementById('modalFittingType')?.value;
  const modalContainer = document.getElementById('modalFittingOverlayContainer');
  if (modalContainer) {
    if (isEnabled && modalType && modalType !== 'custom_fitting') {
      modalContainer.innerHTML = getFittingAirflowSvg(modalType, { showBadge: true, showLabels: true });
      modalContainer.classList.remove('hidden');
    } else {
      modalContainer.innerHTML = '';
      modalContainer.classList.add('hidden');
    }
  }

  // 3. Refresh Lightbox Overlay
  updateLightboxOverlayContent();

  // 4. Refresh Gallery Card Overlays
  renderGalleryAirflowOverlays();
}

function updateLightboxOverlayContent() {
  const lbContainer = document.getElementById('lightboxOverlayContainer');
  const lbBadge = document.getElementById('lightboxFlowPathBadge');
  const typeKey = window.activeLightboxTypeKey;

  if (!typeKey || typeKey === 'custom_fitting') {
    if (lbContainer) { lbContainer.innerHTML = ''; lbContainer.classList.add('hidden'); }
    if (lbBadge) lbBadge.textContent = '';
    return;
  }

  const def = getFittingAirflowDef(typeKey);
  if (lbBadge && def) {
    lbBadge.textContent = def.description || '';
  }

  if (lbContainer) {
    if (window.airflowOverlayEnabled && def) {
      lbContainer.innerHTML = getFittingAirflowSvg(typeKey, { showBadge: true, showLabels: true });
      lbContainer.classList.remove('hidden');
      syncLightboxOverlayDimensions();
    } else {
      lbContainer.innerHTML = '';
      lbContainer.classList.add('hidden');
    }
  }
}

function syncLightboxOverlayDimensions() {
  const img = document.getElementById('lightboxModalImg');
  const container = document.getElementById('lightboxOverlayContainer');
  if (img && container) {
    const w = img.clientWidth;
    const h = img.clientHeight;
    if (w > 0 && h > 0) {
      container.style.width = w + 'px';
      container.style.height = h + 'px';
      container.style.left = img.offsetLeft + 'px';
      container.style.top = img.offsetTop + 'px';
    }
  }
}

function renderGalleryAirflowOverlays() {
  const cards = document.querySelectorAll('.fitting-gallery-card');
  cards.forEach(card => {
    const oc = card.getAttribute('onclick') || '';
    const m = oc.match(/openAddFittingModal\(\s*['"]([^'"]+)['"]/);
    if (!m) return;
    const typeKey = m[1];
    const imgContainer = card.querySelector('.img-container');
    if (!imgContainer) return;

    let overlay = imgContainer.querySelector('.gallery-airflow-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'gallery-airflow-overlay absolute inset-0 pointer-events-none flex items-center justify-center z-10';
      imgContainer.appendChild(overlay);
    }

    if (window.airflowOverlayEnabled) {
      overlay.innerHTML = getFittingAirflowSvg(typeKey, { showBadge: true, showLabels: false, isThumbnail: true });
      overlay.classList.remove('hidden');
    } else {
      overlay.innerHTML = '';
      overlay.classList.add('hidden');
    }
  });
}

function openImageLightbox(src, title, typeKey = null) {
  const modal = document.getElementById('imageLightboxModal');
  const img = document.getElementById('lightboxModalImg');
  const titleEl = document.getElementById('lightboxModalTitle');
  if (!modal || !img) return;

  window.activeLightboxTypeKey = typeKey || findFittingKeyByImageSrc(src) || document.getElementById('modalFittingType')?.value || null;

  img.src = src;
  if (titleEl) titleEl.textContent = title || 'Fitting Diagram';

  updateLightboxOverlayContent();

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  lockBodyScroll();

  img.onload = () => {
    syncLightboxOverlayDimensions();
  };
  setTimeout(syncLightboxOverlayDimensions, 50);
}

function closeImageLightbox() {
  const modal = document.getElementById('imageLightboxModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  unlockBodyScroll();
}

// -------------------------------------------------------------------
// TAB SWITCHER
// -------------------------------------------------------------------
function switchTool6Tab(tabId) {
  activeTool6Tab = tabId;
  const tabs = ['estimator', 'library', 'reference'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const view = document.getElementById(`view-subtab-${t}`);
    if (btn) {
      if (t === tabId) {
        btn.className = "px-4 py-2.5 rounded-xl font-bold transition-all shadow-md bg-rose-600 text-white flex items-center gap-2 active-tab";
      } else {
        btn.className = "px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all flex items-center gap-2";
      }
    }
    if (view) {
      if (t === tabId) {
        view.classList.remove('hidden');
      } else {
        view.classList.add('hidden');
      }
    }
  });

  if (tabId === 'estimator') {
    calculateDuctLoss();
    renderFittingsTable();
  } else if (tabId === 'library') {
    renderGalleryAirflowOverlays();
  }

  if (typeof saveActiveDraftState === 'function') {
    saveActiveDraftState();
  }
}

// ===================================================================
// TOOL 6: LINEAR & CHAINED CRITICAL PATH CALCULATION ENGINE
// Progressive duct & fitting schedule with airflow & dimension cascading
// ===================================================================

// Fluid mechanics formulas (ASHRAE / Huebscher / Loren Cook)
function calcHuebscherDe(w, h) {
  if (!w || !h || w <= 0 || h <= 0) return 0;
  return 1.30 * Math.pow(w * h, 0.625) / Math.pow(w + h, 0.25);
}

function calcDuctArea(w, h, shape = 'rect', dia = 0) {
  if (shape === 'round' || (!w && !h && dia > 0)) {
    const d = dia || w || 12;
    return (Math.PI * Math.pow(d, 2)) / 576.0;
  }
  const width = Math.max(1, w || 18);
  const height = Math.max(1, h || 12);
  return (width * height) / 144.0;
}

function calcDuctVelocity(cfm, area) {
  if (!area || area <= 0) return 0;
  return cfm / area;
}

function calcVelocityPressure(vel) {
  if (!vel || vel <= 0) return 0;
  return Math.pow(vel / 4005, 2);
}

function calcStraightDuctFrictionRate(cfm, de) {
  if (!cfm || cfm <= 0 || !de || de <= 0) return 0.08;
  return (0.10913 * Math.pow(cfm, 1.9)) / Math.pow(de, 5.02);
}

// Calibration constant linking Loren Cook Base EL to SMACNA Loss Coefficient C:
// Baseline: V_ref = 1350 FPM, DFL_ref = 0.10" w.g./100 ft
// K_ref = 100 * (Pv_ref / DFL_ref) = 100 * (1350 / 4005)^2 / 0.10 = 113.62706...
// C = Base EL / 113.627
// Fitting Loss ΔP = C * Pv = (Base EL / 113.627) * Pv
const COOK_SMACNA_REF_CONSTANT = 100 * Math.pow(1350 / 4005, 2) / 0.10; // ~113.627

function calcFittingStaticLoss(baseEL, vel, pv) {
  if (!baseEL || baseEL <= 0 || !pv || pv <= 0) return 0;
  return (baseEL / COOK_SMACNA_REF_CONSTANT) * pv;
}

function interpolatePiecewise1D(pts, x) {
  if (!pts || pts.length === 0) return 0;
  if (x <= pts[0][0]) return pts[0][1];
  if (x >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if (x >= x0 && x <= x1) {
      if (Math.abs(x1 - x0) < 1e-6) return y0;
      const frac = (x - x0) / (x1 - x0);
      return y0 + frac * (y1 - y0);
    }
  }
  return pts[pts.length - 1][1];
}

function calcContinuousFittingEL(typeKey, inputs, angle = '90') {
  const map = getAllFittingsMap();
  const def = map[typeKey];
  if (!def && typeKey !== 'custom_fitting') {
    return { el: 10, exactEL: 10, trueRatio: 1.0, ratioLabel: '—', feedback: 'Standard fitting', lossDP: 0, lossC: 0.1 };
  }

  const { w = 20, h = 12, dia = 14, r = 14, qt = 1200, qb = 400, vt = 1000, vb = 1000, a1 = 144, a2 = 144, transAngle = '30', isVanes = true } = inputs || {};
  let exactEL = 20;
  let ratioVal = 1.0;
  let ratioLabel = '';
  let feedback = '';

  // 1. Group 2: Rectangular Mitered Elbows (2a, 2b, 2c)
  if (typeKey.startsWith('2')) {
    const dimW = Math.max(1, parseFloat(w) || 20);
    const dimH = Math.max(1, parseFloat(h) || 12);
    ratioVal = dimH / dimW;
    ratioLabel = `H/W: ${ratioVal.toFixed(2)}`;

    const hasVanes = (typeKey === '2a_vanes') || (typeKey === '2c_tee_double' && isVanes);
    const pts = hasVanes
      ? [[0.25, 53], [1.00, 45], [4.00, 72]]
      : [[0.25, 148], [1.00, 136], [4.00, 105]];

    exactEL = interpolatePiecewise1D(pts, ratioVal);
    if (ratioVal < 0.25) {
      const slope = (pts[1][1] - pts[0][1]) / (pts[1][0] - pts[0][0]);
      exactEL = Math.max(10, pts[0][1] + slope * (ratioVal - 0.25));
    } else if (ratioVal > 4.0) {
      const slope = (pts[2][1] - pts[1][1]) / (pts[2][0] - pts[1][0]);
      exactEL = Math.max(10, pts[2][1] + slope * (ratioVal - 4.0));
    }

    if (DUCT_LOSS_DATA.miteredAngleFactors && DUCT_LOSS_DATA.miteredAngleFactors[angle]) {
      exactEL *= DUCT_LOSS_DATA.miteredAngleFactors[angle];
    }
    feedback = `Aspect Ratio H/W: <strong>${ratioVal.toFixed(2)}</strong> (${hasVanes ? 'With Vanes' : 'No Vanes'}, ${angle}°)`;
  }
  // 2. Group 1: Round Elbows (1a-1f)
  else if (/^1[a-f]/i.test(typeKey) && !typeKey.startsWith('10')) {
    const dimD = Math.max(1, parseFloat(dia || w) || 14);
    const dimR = Math.max(1, parseFloat(r) || (1.5 * dimD));
    ratioVal = dimR / dimD;
    ratioLabel = `R/D: ${ratioVal.toFixed(2)}`;

    let pts = [[0.75, 37], [1.00, 25], [1.50, 17]];
    if (typeKey === '1b_90_5piece') pts = [[0.75, 52], [1.00, 37], [1.50, 27]];
    else if (typeKey === '1c_90_3piece') pts = [[0.75, 61], [1.00, 48], [1.50, 39]];
    else if (typeKey === '1d_90_mitered') pts = [[1.00, 136]];
    else if (typeKey === '1e_45_3piece') pts = [[0.75, 15], [1.00, 15], [1.50, 15]];
    else if (typeKey === '1f_45_2piece') pts = [[0.75, 20], [1.00, 20], [1.50, 20]];

    exactEL = interpolatePiecewise1D(pts, ratioVal);
    feedback = `Radius Ratio R/D: <strong>${ratioVal.toFixed(2)}</strong>`;
  }
  // 3. Group 3: Rectangular Radius Elbows (3a, 3b, 3c)
  else if (typeKey.startsWith('3')) {
    const dimW = Math.max(1, parseFloat(w) || 20);
    const dimH = Math.max(1, parseFloat(h) || 12);
    const dimR = Math.max(1, parseFloat(r) || dimW);
    const rw = dimR / dimW;
    const hw = dimH / dimW;
    ratioVal = hw;
    ratioLabel = `R/W: ${rw.toFixed(2)}, H/W: ${hw.toFixed(2)}`;

    const hasVanes = (typeKey === '3a_vanes') || (typeKey === '3c_wye_double' && isVanes);
    if (hasVanes) {
      const elAt025 = interpolatePiecewise1D([[0.25, 9], [1.0, 5], [4.0, 6]], hw);
      const elAt050 = interpolatePiecewise1D([[0.25, 3], [1.0, 2], [4.0, 1]], hw);
      exactEL = interpolatePiecewise1D([[0.25, elAt025], [0.50, elAt050]], rw);
    } else {
      const elAt05 = interpolatePiecewise1D([[0.25, 170], [1.0, 136], [4.0, 125]], hw);
      const elAt10 = interpolatePiecewise1D([[0.25, 31], [1.0, 24], [4.0, 22]], hw);
      const elAt20 = interpolatePiecewise1D([[0.25, 23], [1.0, 17], [4.0, 16]], hw);
      exactEL = interpolatePiecewise1D([[0.50, elAt05], [1.00, elAt10], [2.00, elAt20]], rw);
    }
    feedback = `Radius R/W: <strong>${rw.toFixed(2)}</strong> | Aspect H/W: <strong>${hw.toFixed(2)}</strong>`;
  }
  // 4. Group 5: Diverging Tees Rect Trunk (5a - 5f)
  else if (typeKey.startsWith('5')) {
    const totQ = Math.max(1, parseFloat(qt) || 1200);
    const brQ = Math.max(0, parseFloat(qb) || 400);
    const qRatio = Math.min(1.0, brQ / totQ);
    const vRatio = (vt > 0 && vb > 0) ? Math.min(2.0, vb / vt) : 1.0;

    if (typeKey === '5d_rect_trunk' || typeKey === '5e_rect_45_trunk' || typeKey === '5f_round_trunk') {
      ratioVal = qRatio;
      ratioLabel = `Qb/Qt: ${qRatio.toFixed(3)}`;
      const pts = [[0.1, 32], [0.2, 25], [0.3, 19], [0.4, 15], [0.5, 10], [0.6, 7], [0.8, 2], [1.0, 0]];
      exactEL = interpolatePiecewise1D(pts, qRatio);
      feedback = `Trunk Path &bull; Flow Ratio Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qRatio.toFixed(3)}</strong>`;
    } else {
      ratioVal = qRatio;
      ratioLabel = `Vb/Vt: ${vRatio.toFixed(2)}, Qb/Qt: ${qRatio.toFixed(3)}`;
      let pts = [[0.1, 157], [0.2, 159], [0.3, 148], [0.4, 155], [0.5, 144]];
      if (typeKey === '5b_rect_45_entry') pts = [[0.1, 89], [0.2, 111], [0.3, 97], [0.4, 90], [0.5, 84]];
      else if (typeKey === '5c_round_branch') pts = [[0.1, 148], [0.2, 157], [0.3, 136], [0.4, 140], [0.5, 143]];
      exactEL = interpolatePiecewise1D(pts, qRatio);
      feedback = `Branch Path &bull; V<sub>b</sub>/V<sub>t</sub>: <strong>${vRatio.toFixed(2)}</strong> | Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qRatio.toFixed(3)}</strong>`;
    }
  }
  // 5. Group 4: Converging Tees Rect Trunk (4a - 4f)
  else if (typeKey.startsWith('4')) {
    const totQ = Math.max(1, parseFloat(qt) || 1200);
    const brQ = Math.max(0, parseFloat(qb) || 400);
    const qRatio = Math.min(1.0, brQ / totQ);
    ratioVal = qRatio;

    if (typeKey === '4d_rect_trunk' || typeKey === '4e_rect_45_trunk' || typeKey === '4f_round_trunk') {
      ratioLabel = `Qb/Qt: ${qRatio.toFixed(3)}`;
      const pts = [[0.1, 18], [0.2, 31], [0.3, 43], [0.4, 52], [0.5, 60], [0.6, 65], [0.7, 67], [0.8, 68], [0.9, 67]];
      exactEL = interpolatePiecewise1D(pts, qRatio);
      feedback = `Trunk Path &bull; Flow Ratio Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qRatio.toFixed(3)}</strong>`;
    } else {
      ratioLabel = `Qb/Qt: ${qRatio.toFixed(3)}`;
      let pts = [[0.1, 1], [0.2, 8], [0.3, 26], [0.4, 76], [0.5, 133], [0.6, 189], [0.7, 303], [0.8, 382], [0.9, 447]];
      if (typeKey === '4b_rect_45_entry') pts = [[0.1, 2], [0.2, 10], [0.3, 20], [0.4, 39], [0.5, 86], [0.6, 130], [0.7, 208], [0.8, 228], [0.9, 330]];
      else if (typeKey === '4c_round_branch') pts = [[0.1, 2], [0.2, 12], [0.3, 26], [0.4, 68], [0.5, 144], [0.6, 234], [0.7, 312], [0.8, 420], [0.9, 560]];
      exactEL = interpolatePiecewise1D(pts, qRatio);
      feedback = `Branch Path &bull; Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qRatio.toFixed(3)}</strong>`;
    }
  }
  // 6. Group 6 & 7: Round Tees (6a-6d, 7a-7f)
  else if (typeKey.startsWith('6') || typeKey.startsWith('7')) {
    const totQ = Math.max(1, parseFloat(qt) || 1200);
    const brQ = Math.max(0, parseFloat(qb) || 400);
    const qRatio = Math.min(1.0, brQ / totQ);
    ratioVal = qRatio;
    ratioLabel = `Qb/Qt: ${qRatio.toFixed(3)}`;
    if (typeKey === '6c_converging_trunk' || typeKey === '6d_diverging_trunk') {
      const pts = [[0.1, 35], [0.2, 30], [0.3, 25], [0.4, 20], [0.5, 15], [0.7, 8], [1.0, 0]];
      exactEL = interpolatePiecewise1D(pts, qRatio);
    } else {
      const pts = [[0.1, 40], [0.2, 55], [0.3, 70], [0.5, 95], [0.7, 120], [1.0, 150]];
      exactEL = interpolatePiecewise1D(pts, qRatio);
    }
    feedback = `Round Tee &bull; Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qRatio.toFixed(3)}</strong>`;
  }
  // 7. Group 8: Wyes (Pair of Pants)
  else if (typeKey.startsWith('8')) {
    const totQ = Math.max(1, parseFloat(qt) || 1200);
    const brQ = Math.max(0, parseFloat(qb) || 400);
    const qRatio = Math.min(1.0, brQ / totQ);
    ratioVal = qRatio;
    ratioLabel = `Qb/Qt: ${qRatio.toFixed(3)}`;
    const pts = [[0.1, 15], [0.2, 22], [0.3, 30], [0.5, 45], [0.7, 60], [1.0, 80]];
    exactEL = interpolatePiecewise1D(pts, qRatio);
    feedback = `Wye Fitting &bull; Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qRatio.toFixed(3)}</strong>`;
  }
  // 8. Group 9 & 10: Transitions
  else if (isTransitionFitting(typeKey)) {
    const areaUp = Math.max(1, parseFloat(a1) || 144);
    const areaDn = Math.max(1, parseFloat(a2) || 144);
    const ar = Math.max(areaUp, areaDn) / Math.min(areaUp, areaDn);
    ratioVal = ar;
    const lookup = lookupTransitionParamAndEL(typeKey, areaUp, areaDn, transAngle || '30');
    if (lookup && lookup.el !== undefined) {
      exactEL = lookup.el;
      ratioLabel = lookup.paramKey || `A1/A2: ${ar.toFixed(2)}`;
    } else {
      ratioLabel = `A1/A2: ${ar.toFixed(2)}`;
      const pts = [[1.0, 0], [1.5, 4], [2.0, 7], [3.0, 12], [4.0, 18]];
      exactEL = interpolatePiecewise1D(pts, ar);
    }
    feedback = `Transition &bull; Area Ratio: <strong>${ar.toFixed(2)}:1</strong> (&theta;=${transAngle}&deg;)`;
  }
  // 9. Custom Fitting
  else if (typeKey === 'custom_fitting') {
    exactEL = Math.max(0, parseFloat(inputs?.customEL) || 20);
    ratioVal = 1.0;
    ratioLabel = 'Custom';
    feedback = `Custom Fitting: ${exactEL}' EL`;
  } else {
    exactEL = 20;
    ratioVal = 1.0;
    ratioLabel = '—';
    feedback = 'Standard Fitting';
  }

  const lossC = exactEL / COOK_SMACNA_REF_CONSTANT;
  const pv = calcVelocityPressure(vt || 1000);
  const lossDP = lossC * pv;

  return {
    el: Math.round(exactEL * 10) / 10,
    exactEL: exactEL,
    trueRatio: ratioVal,
    ratioLabel: ratioLabel,
    feedback: feedback,
    lossDP: lossDP,
    lossC: lossC
  };
}

function getCurrentDownstreamCFM() {
  if (chainedScheduleRows.length === 0) {
    const modalInitCFM = parseFloat(document.getElementById('modalInitialCFM')?.value);
    if (!isNaN(modalInitCFM) && modalInitCFM > 0) return modalInitCFM;
    return Math.max(10, parseFloat(document.getElementById('ductLossCFM')?.value) || 1200);
  }
  const last = chainedScheduleRows[chainedScheduleRows.length - 1];
  return last.leavingCFM !== undefined ? last.leavingCFM : (last.enteringCFM || 1200);
}

function getTransitionGeometry(typeKey) {
  if (!typeKey) return { upstream: 'rect', downstream: 'rect', isExpand: true };
  const k = String(typeKey).toLowerCase();
  if (k === '9a_round_conical' || k === '9a') {
    return { upstream: 'round', downstream: 'round', isExpand: true };
  }
  if (k === '10c_round_contracting' || k === '10c' || k === '10c_round') {
    return { upstream: 'round', downstream: 'round', isExpand: false };
  }
  if (k === '9c_round_to_rect' || k === '9c') {
    return { upstream: 'round', downstream: 'rect', isExpand: true };
  }
  if (k === '9d_rect_to_round' || k === '9d') {
    return { upstream: 'rect', downstream: 'round', isExpand: true };
  }
  // 10a, 10b, 9b are strictly Rectangular-to-Rectangular
  if (k.startsWith('10') || k.startsWith('9b')) {
    return { upstream: 'rect', downstream: 'rect', isExpand: k.startsWith('9') || k.startsWith('10a') };
  }
  return { upstream: 'rect', downstream: 'rect', isExpand: true };
}

// -------------------------------------------------------------------
// FITTING CLASSIFICATION & GEOMETRY HELPERS
// -------------------------------------------------------------------
function isTeeFitting(key) {
  if (!key) return false;
  if (key === '2c_tee_double') return false; // 2c is a mitered double elbow equivalent, not a takeoff tee
  return key.startsWith('4') || key.startsWith('5') || key.startsWith('6') || key.startsWith('7');
}

function isBranchTakeoffFitting(key) {
  if (!key) return false;
  const k = String(key).toLowerCase();
  return k.startsWith('5a') || k.startsWith('5b') || k.startsWith('5c') ||
         k === '6b' || k.startsWith('6b_') ||
         k.startsWith('7a') || k.startsWith('7b') || k.startsWith('7c');
}

function getTeeBranchShape(key) {
  if (!key) return 'round';
  const k = String(key).toLowerCase();
  // Rectangular branch takeoffs
  if (k.startsWith('5a') || k.startsWith('5b') || k.startsWith('4a') || k.startsWith('4b') || k.startsWith('4d') || k.startsWith('4e') || k.startsWith('5d') || k.startsWith('5e')) {
    return 'rect';
  }
  // Round branch takeoffs (5c, 6b, 7a-7c, 6a, 6c, 6d, 7d-7f, 4c, 4f, 5f)
  return 'round';
}

function isTransitionFitting(key) {
  if (!key) return false;
  return key.includes('trans') || key.startsWith('9') || key.startsWith('10');
}

function isRoundFitting(key) {
  if (!key) return false;
  const k = String(key).toLowerCase();
  if (k === '10c_round_contracting' || k === '10c' || k === '10c_round') return true;
  if (k.startsWith('10')) return false; // 10a, 10b are rectangular transitions
  return (/^1[a-f]/i.test(k)) || k.startsWith('6') || k.startsWith('7') || k === '9a_round_conical' || k.includes('flex');
}

function isRectFitting(key) {
  if (!key) return false;
  const k = String(key).toLowerCase();
  if (k === '10c_round_contracting' || k === '10c' || k === '10c_round') return false;
  return k.startsWith('2') || k.startsWith('3') || k.startsWith('4') || k.startsWith('5') || k.startsWith('10') || k === '9b_rect_to_rect';
}

function getFittingEnteringShape(key) {
  if (!key || key === 'custom_fitting') return null;
  if (isTransitionFitting(key)) {
    const geom = getTransitionGeometry(key);
    return geom.upstream || 'rect';
  }
  if (isRoundFitting(key)) return 'round';
  if (isRectFitting(key)) return 'rect';
  return null;
}

function getRowEnteringShape(row) {
  if (!row) return null;
  if (row.type === 'straight_duct') return row.shape || 'rect';
  if (row.type === 'transition') {
    const geom = getTransitionGeometry(row.fittingKey);
    return geom.upstream || row.shape || 'rect';
  }
  if (row.type === 'flex_drop') return 'round';
  if (row.type === 'custom_fitting') return null;
  if (isRoundFitting(row.fittingKey)) return 'round';
  if (isRectFitting(row.fittingKey)) return 'rect';
  return row.shape || null;
}

function getRowLeavingShape(row) {
  if (!row) return null;
  if (row.type === 'transition') {
    return row.leavingShape || 'rect';
  }
  if (row.type === 'tee_branch' && (row.teeContinuation === 'branch' || isBranchTakeoffFitting(row.fittingKey))) {
    const bShape = row.branchShape || getTeeBranchShape(row.fittingKey);
    if (bShape === 'round' || (row.branchDia && !row.branchHeight)) return 'round';
    if (bShape === 'rect' || row.branchWidth) return 'rect';
    return 'round';
  }
  if (row.type === 'flex_drop') return 'round';
  return row.shape || 'rect';
}

function getCurrentDownstreamDims() {
  if (chainedScheduleRows.length === 0) {
    const initShape = document.getElementById('modalInitialShape')?.value || 'rect';
    if (initShape === 'round') {
      const d = parseFloat(document.getElementById('modalInitialDia')?.value) || 14;
      return { w: d, h: d, shape: 'round', dia: d };
    }
    const w = parseFloat(document.getElementById('modalInitialWidth')?.value) || 18;
    const h = parseFloat(document.getElementById('modalInitialHeight')?.value) || 12;
    const de = Math.round(calcHuebscherDe(w, h) * 10) / 10;
    return { w: w, h: h, shape: 'rect', dia: de || 14 };
  }
  const last = chainedScheduleRows[chainedScheduleRows.length - 1];
  if (last.type === 'transition') {
    if (last.leavingShape === 'round' || (last.leavingDia && !last.leavingHeight)) {
      const d = parseFloat(last.leavingDia) || parseFloat(last.leavingWidth) || 14;
      return { w: d, h: d, shape: 'round', dia: d };
    }
    const w = parseFloat(last.leavingWidth) || 18;
    const h = parseFloat(last.leavingHeight) || 12;
    const de = Math.round(calcHuebscherDe(w, h) * 10) / 10;
    return { w: w, h: h, shape: 'rect', dia: de || 14 };
  }
  if (last.type === 'tee_branch' && (last.teeContinuation === 'branch' || isBranchTakeoffFitting(last.fittingKey))) {
    const bShape = last.branchShape || getTeeBranchShape(last.fittingKey);
    if (bShape === 'round' || (last.branchDia && !last.branchHeight)) {
      const d = parseFloat(last.branchDia) || parseFloat(last.branchWidth) || parseFloat(last.branchHeight) || 12;
      return { w: d, h: d, shape: 'round', dia: d };
    }
    const w = parseFloat(last.branchWidth) || last.width || 18;
    const h = parseFloat(last.branchHeight) || last.height || 12;
    const de = Math.round(calcHuebscherDe(w, h) * 10) / 10 || 14;
    return { w: w, h: h, shape: 'rect', dia: de || 14 };
  }
  if (last.shape === 'round') {
    const d = parseFloat(last.dia) || parseFloat(last.width) || 14;
    return { w: d, h: d, shape: 'round', dia: d };
  }
  const w = parseFloat(last.width) || 18;
  const h = parseFloat(last.height) || 12;
  const de = Math.round(calcHuebscherDe(w, h) * 10) / 10;
  return { w: w, h: h, shape: 'rect', dia: de || 14 };
}

function isDefaultStraightDuctName(name) {
  if (!name) return true;
  const trimmed = name.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'straight duct' || trimmed.toLowerCase() === 'component') {
    return true;
  }
  return /^Straight Duct(\s*\(.*\))?$/i.test(trimmed);
}

function isDefaultTransitionName(name) {
  if (!name) return true;
  const trimmed = name.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'transition' || trimmed.toLowerCase() === 'component') {
    return true;
  }
  return /^(9[a-d]|10[a-c])[:\s].*?(\(.*?\))?$/i.test(trimmed) || /^Transition(\s*\(.*\))?$/i.test(trimmed);
}

// -------------------------------------------------------------------
// TRANSITION CATALOG EQUIVALENT LENGTH & PARAMETER LOOKUP HELPER
// -------------------------------------------------------------------
function lookupTransitionParamAndEL(fittingKey, a1, a2, angleStr = '30') {
  const map = getAllFittingsMap();
  const def = (fittingKey && map[fittingKey]) ? map[fittingKey] : null;
  if (!def || !def.options) {
    return { paramKey: null, el: 6 };
  }

  const optKeys = Object.keys(def.options);
  if (optKeys.length === 0) return { paramKey: null, el: 6 };

  const area1 = Math.max(1, parseFloat(a1) || 144);
  const area2 = Math.max(1, parseFloat(a2) || 144);
  const ratio = Math.max(area1, area2) / Math.min(area1, area2);

  const cleanAngle = angleStr ? angleStr.toString().trim() : '30';
  let angleAlias = cleanAngle;
  if ((fittingKey.startsWith('10b') || fittingKey.startsWith('10c')) && (cleanAngle === '30' || cleanAngle === '30°')) {
    angleAlias = '15-40°';
  }

  let candidateKeys = optKeys.filter(k => k.includes(angleAlias));
  if (candidateKeys.length === 0) {
    const numAngle = cleanAngle.match(/\d+/);
    if (numAngle) {
      candidateKeys = optKeys.filter(k => k.includes(numAngle[0]));
    }
  }
  if (candidateKeys.length === 0) {
    candidateKeys = optKeys;
  }

  let bestKey = candidateKeys[0];
  let minDiff = Infinity;

  for (const k of candidateKeys) {
    const match = k.match(/A1\/A2\s*=\s*([0-9.]+)/i);
    if (!match) continue;
    const optVal = parseFloat(match[1]);
    const diff = Math.abs(ratio - optVal);
    if (diff < minDiff) {
      minDiff = diff;
      bestKey = k;
    }
  }

  return {
    paramKey: bestKey,
    el: def.options[bestKey] !== undefined ? def.options[bestKey] : 6
  };
}

// -------------------------------------------------------------------
// CHAINED SCHEDULE FORWARD PROPAGATION ENGINE
// -------------------------------------------------------------------
function propagateChainedSchedule() {
  const initialCFM = Math.max(10, parseFloat(document.getElementById('ductLossCFM')?.value) || 1200);

  let currentCFM = initialCFM;
  let currentWidth = 18;
  let currentHeight = 12;
  let currentShape = 'rect';
  let currentDia = 14;

  if (chainedScheduleRows.length > 0) {
    const first = chainedScheduleRows[0];
    if (first.shape === 'round') {
      currentShape = 'round';
      currentDia = parseFloat(first.dia) || parseFloat(first.width) || 14;
      currentWidth = currentDia;
      currentHeight = currentDia;
    } else {
      currentShape = 'rect';
      currentWidth = parseFloat(first.width) || 18;
      currentHeight = parseFloat(first.height) || 12;
      currentDia = Math.round(calcHuebscherDe(currentWidth, currentHeight) * 10) / 10 || 14;
    }
  }

  let cumLength = 0;
  let cumLossDP = 0;

  let supplyTDL = 0;
  let returnTDL = 0;
  let supplyTEL = 0;
  let returnTEL = 0;

  let firstTrunkVelocity = null;
  let weightedFrictionSum = 0;
  let totalStraightFt = 0;

  chainedScheduleRows.forEach((row, idx) => {
    // 1. Assign Entering Flow
    if (row.overrideCFM && row.customCFM !== undefined) {
      row.enteringCFM = row.customCFM;
    } else {
      row.enteringCFM = currentCFM;
    }

    // 2. Assign Dimensions
    if (idx === 0) {
      if (row.shape === 'round') {
        const dia = Math.max(2, parseFloat(row.dia) || parseFloat(row.width) || 14);
        row.dia = dia;
        row.width = dia;
        row.height = dia;
        row.shape = 'round';
        currentDia = dia;
        currentWidth = dia;
        currentHeight = dia;
        currentShape = 'round';
      } else {
        currentWidth = Math.max(2, parseFloat(row.width) || 18);
        currentHeight = Math.max(2, parseFloat(row.height) || 12);
        currentShape = 'rect';
        currentDia = Math.round(calcHuebscherDe(currentWidth, currentHeight) * 10) / 10 || 14;
        row.width = currentWidth;
        row.height = currentHeight;
        row.shape = 'rect';
        row.dia = currentDia;
      }
      if (row.type === 'straight_duct') {
        if (!row.hasCustomName || isDefaultStraightDuctName(row.name)) {
          const dimLabel = (row.shape === 'round') ? `Ø ${row.dia}"` : `${row.width}" × ${row.height}"`;
          row.name = `Straight Duct (${dimLabel})`;
        }
      }
    } else if (row.type === 'straight_duct') {
      row.shape = currentShape;
      row.width = currentWidth;
      row.height = currentHeight;
      row.dia = currentDia;

      if (!row.hasCustomName || isDefaultStraightDuctName(row.name)) {
        const dimLabel = (row.shape === 'round') ? `Ø ${row.dia}"` : `${row.width}" × ${row.height}"`;
        row.name = `Straight Duct (${dimLabel})`;
      }
    } else if (row.type === 'transition') {
      const geom = getTransitionGeometry(row.fittingKey);

      if (geom.upstream === 'round') {
        row.shape = 'round';
        row.dia = (currentShape === 'round') ? currentDia : (Math.round(calcHuebscherDe(currentWidth, currentHeight) * 10) / 10 || 14);
        row.width = row.dia;
        row.height = row.dia;
      } else {
        row.shape = 'rect';
        row.width = (currentShape === 'rect') ? currentWidth : (currentDia || 18);
        row.height = (currentShape === 'rect') ? currentHeight : (currentDia ? Math.round(currentDia * 0.75) : 12);
        row.dia = (currentShape === 'rect') ? (Math.round(calcHuebscherDe(row.width, row.height) * 10) / 10 || 14) : currentDia;
      }

      if (row.leavingShape === 'round' || geom.downstream === 'round') {
        row.leavingShape = 'round';
        row.leavingDia = Math.max(2, parseFloat(row.leavingDia) || parseFloat(row.leavingWidth) || 14);
        row.leavingWidth = row.leavingDia;
        row.leavingHeight = row.leavingDia;
      } else {
        row.leavingShape = 'rect';
        row.leavingWidth = Math.max(2, parseFloat(row.leavingWidth) || currentWidth);
        row.leavingHeight = Math.max(2, parseFloat(row.leavingHeight) || currentHeight);
        row.leavingDia = Math.round(calcHuebscherDe(row.leavingWidth, row.leavingHeight) * 10) / 10 || 14;
      }
    } else if (row.type === 'tee_branch') {
      row.shape = currentShape;
      row.width = currentWidth;
      row.height = currentHeight;
      row.dia = currentDia;
    } else {
      if (isRoundFitting(row.fittingKey)) {
        row.shape = 'round';
        if (row.dia && row.hasCustomDia) {
          currentDia = row.dia;
        } else {
          row.dia = (currentShape === 'round') ? currentDia : (Math.round(calcHuebscherDe(currentWidth, currentHeight) * 10) / 10 || 14);
        }
        row.width = row.dia;
        row.height = row.dia;
      } else if (isRectFitting(row.fittingKey)) {
        row.shape = 'rect';
        if (row.width && row.height && row.hasCustomDims) {
          currentWidth = row.width;
          currentHeight = row.height;
          currentDia = Math.round(calcHuebscherDe(currentWidth, currentHeight) * 10) / 10 || 14;
        } else {
          row.width = (currentShape === 'rect') ? currentWidth : (currentDia || 18);
          row.height = (currentShape === 'rect') ? currentHeight : (currentDia ? Math.round(currentDia * 0.75) : 12);
          row.dia = currentDia;
        }
      } else {
        row.shape = currentShape;
        row.width = currentWidth;
        row.height = currentHeight;
        row.dia = currentDia;
      }
    }

    // 3. Fluid Mechanics Calculations
    row.area = calcDuctArea(row.width, row.height, row.shape, row.dia);
    row.de = (row.shape === 'round') ? (row.dia || row.width) : calcHuebscherDe(row.width, row.height);
    row.velocity = calcDuctVelocity(row.enteringCFM, row.area);
    row.pv = calcVelocityPressure(row.velocity);

    if (firstTrunkVelocity === null && row.velocity > 0) {
      firstTrunkVelocity = row.velocity;
    }

    // 4. Calculate Static Loss (ΔP) & Equivalent Length (EL)
    if (row.type === 'straight_duct') {
      row.length = Math.max(0, parseFloat(row.length) || 0);
      row.frictionRate = calcStraightDuctFrictionRate(row.enteringCFM, row.de);
      row.lossDP = (row.length / 100.0) * row.frictionRate;
      row.baseEL = row.length;
      totalStraightFt += row.length;
      weightedFrictionSum += (row.frictionRate * row.length);

      if (row.path === 'return') {
        returnTDL += row.length;
      } else {
        supplyTDL += row.length;
      }
      row.leavingCFM = row.enteringCFM;
    } else if (row.type === 'tee_branch') {
      const isBranchCont = (row.teeContinuation === 'branch' || isBranchTakeoffFitting(row.fittingKey));
      row.teeContinuation = isBranchCont ? 'branch' : 'trunk';
      const branchQ = Math.max(0, parseFloat(row.branchCFM) || 0);

      if (isBranchCont) {
        row.leavingCFM = branchQ;
        const branchShape = getTeeBranchShape(row.fittingKey);
        row.branchShape = branchShape;
        if (branchShape === 'round') {
          const bDia = Math.max(2, parseFloat(row.branchDia) || parseFloat(row.branchWidth) || parseFloat(row.branchHeight) || 12);
          row.branchDia = bDia;
          row.branchWidth = bDia;
          row.branchHeight = bDia;
          currentDia = bDia;
          currentWidth = bDia;
          currentHeight = bDia;
          currentShape = 'round';
        } else {
          const bW = Math.max(2, parseFloat(row.branchWidth) || 16);
          const bH = Math.max(2, parseFloat(row.branchHeight) || 10);
          row.branchWidth = bW;
          row.branchHeight = bH;
          currentWidth = bW;
          currentHeight = bH;
          currentShape = 'rect';
          currentDia = Math.round(calcHuebscherDe(bW, bH) * 10) / 10 || 14;
          row.branchDia = currentDia;
        }
      } else {
        if (row.path === 'return') {
          row.leavingCFM = row.enteringCFM + branchQ;
        } else {
          row.leavingCFM = Math.max(0, row.enteringCFM - branchQ);
        }
      }
      if (!row.isCustomEL && row.fittingKey) {
        const map = getAllFittingsMap();
        const def = map[row.fittingKey];
        if (def && row.fittingKey !== 'custom_fitting') {
          const branchShape = getTeeBranchShape(row.fittingKey);
          let bArea = 0;
          if (branchShape === 'round') {
            const bDia = parseFloat(row.branchDia) || parseFloat(row.branchWidth) || 12;
            bArea = (Math.PI * Math.pow(bDia, 2)) / 576.0;
          } else {
            const bW = parseFloat(row.branchWidth) || row.width || 16;
            const bH = parseFloat(row.branchHeight) || row.height || 10;
            bArea = (bW * bH) / 144.0;
          }
          const vb = (branchQ > 0 && bArea > 0) ? (branchQ / bArea) : row.velocity;
          const rInputs = {
            w: row.width,
            h: row.height,
            dia: row.dia,
            r: row.radius || row.width,
            qt: row.enteringCFM,
            qb: branchQ,
            vt: row.velocity,
            vb: vb,
            a1: row.area * 144,
            a2: bArea * 144,
            transAngle: row.transAngle || '30',
            isVanes: row.isVanes !== false
          };
          const dyn = calcContinuousFittingEL(row.fittingKey, rInputs, row.angle || '90');
          if (dyn && !isNaN(dyn.el)) {
            row.baseEL = dyn.el;
            if (dyn.ratioLabel) row.paramKey = dyn.ratioLabel;
          }
        }
      }
      row.baseEL = Math.max(0, parseFloat(row.baseEL) || 0);
      row.lossDP = calcFittingStaticLoss(row.baseEL, row.velocity, row.pv);

      if (row.path === 'return') {
        returnTEL += row.baseEL;
      } else {
        supplyTEL += row.baseEL;
      }
    } else if (row.type === 'transition') {
      if (row.leavingShape === 'round') {
        row.leavingArea = calcDuctArea(row.leavingDia, row.leavingDia, 'round', row.leavingDia);
      } else {
        row.leavingArea = calcDuctArea(row.leavingWidth, row.leavingHeight, 'rect');
      }
      row.leavingVelocity = calcDuctVelocity(row.enteringCFM, row.leavingArea);
      row.leavingPv = calcVelocityPressure(row.leavingVelocity);

      const map = getAllFittingsMap();
      const def = (row.fittingKey && map[row.fittingKey]) ? map[row.fittingKey] : null;
      if (def && def.options) {
        const lookup = lookupTransitionParamAndEL(row.fittingKey, row.area * 144, row.leavingArea * 144, row.transAngle || '30');
        row.baseEL = lookup.el;
        if (lookup.paramKey) row.paramKey = lookup.paramKey;
      } else {
        row.baseEL = Math.max(0, parseFloat(row.baseEL) || 6);
      }

      row.lossDP = calcFittingStaticLoss(row.baseEL, row.velocity, row.pv);

      if (row.path === 'return') {
        returnTEL += row.baseEL;
      } else {
        supplyTEL += row.baseEL;
      }
      row.leavingCFM = row.enteringCFM;

      if (!row.hasCustomName || isDefaultTransitionName(row.name)) {
        const enterStr = (row.shape === 'round') ? `Ø ${row.dia}"` : `${row.width}" × ${row.height}"`;
        const leaveStr = (row.leavingShape === 'round') ? `Ø ${row.leavingDia}"` : `${row.leavingWidth}" × ${row.leavingHeight}"`;
        const baseName = def ? def.name.replace(/\s*\(.*?\)$/, '') : (row.fittingKey || 'Transition');
        row.name = `${baseName} (${enterStr} → ${leaveStr})`;
      }

      if (row.leavingShape === 'round') {
        currentShape = 'round';
        currentDia = row.leavingDia;
        currentWidth = row.leavingDia;
        currentHeight = row.leavingDia;
      } else {
        currentShape = 'rect';
        currentWidth = row.leavingWidth;
        currentHeight = row.leavingHeight;
        currentDia = row.leavingDia || (Math.round(calcHuebscherDe(currentWidth, currentHeight) * 10) / 10 || 14);
      }
    } else {
      if (!row.isCustomEL && row.fittingKey && row.type !== 'transition' && row.type !== 'straight_duct') {
        const map = getAllFittingsMap();
        const def = map[row.fittingKey];
        if (def && row.fittingKey !== 'custom_fitting') {
          const rInputs = {
            w: row.width,
            h: row.height,
            dia: row.dia,
            r: row.radius || (row.shape === 'round' ? (row.dia * 1.5) : row.width),
            qt: row.enteringCFM,
            qb: row.branchCFM || 0,
            vt: row.velocity,
            vb: row.velocity,
            a1: row.area * 144,
            a2: (row.leavingArea || row.area) * 144,
            transAngle: row.transAngle || '30',
            isVanes: row.isVanes !== false
          };
          const dyn = calcContinuousFittingEL(row.fittingKey, rInputs, row.angle || '90');
          if (dyn && !isNaN(dyn.el)) {
            row.baseEL = dyn.el;
            if (dyn.ratioLabel) row.paramKey = dyn.ratioLabel;
          }
        }
      }
      row.baseEL = Math.max(0, parseFloat(row.baseEL) || 0);
      row.lossDP = calcFittingStaticLoss(row.baseEL, row.velocity, row.pv);

      if (row.path === 'return') {
        returnTEL += row.baseEL;
      } else {
        supplyTEL += row.baseEL;
      }
      row.leavingCFM = row.enteringCFM;
    }

    // 5. Cumulative Progression
    const itemLen = (row.type === 'straight_duct') ? row.length : row.baseEL;
    cumLength += itemLen;
    cumLossDP += row.lossDP;

    row.cumLength = cumLength;
    row.cumLossDP = cumLossDP;

    currentCFM = row.leavingCFM;
  });

  // Calculate In-Line HVAC Components
  let totalComponentLoss = 0;
  componentRows.forEach(c => {
    const qty = Math.max(0, parseFloat(c.qty) || 0);
    const dp = Math.max(0, parseFloat(c.dp) || 0);
    totalComponentLoss += (qty * dp);
  });

  const totalESP = cumLossDP + totalComponentLoss;
  let initialDFL = 0.08;
  if (chainedScheduleRows.length > 0 && chainedScheduleRows[0].initialTargetFriction) {
    initialDFL = parseFloat(chainedScheduleRows[0].initialTargetFriction) || 0.08;
  }
  const avgDFL = totalStraightFt > 0 ? (weightedFrictionSum / totalStraightFt) : (firstTrunkVelocity ? (calcStraightDuctFrictionRate(initialCFM, chainedScheduleRows[0]?.de || 14) || initialDFL) : initialDFL);
  const systemVel = firstTrunkVelocity || (chainedScheduleRows.length > 0 && chainedScheduleRows[0].initialTargetVel ? parseFloat(chainedScheduleRows[0].initialTargetVel) : 800);

  return {
    totalCFM: initialCFM,
    supplyTDL,
    returnTDL,
    totalTDL: supplyTDL + returnTDL,
    supplyTEL,
    returnTEL,
    totalTEL: supplyTEL + returnTEL,
    totalLength: cumLength,
    totalDuctLoss: cumLossDP,
    totalComponentLoss,
    totalESP,
    systemVel,
    avgDFL
  };
}

// -------------------------------------------------------------------
// MAIN CALCULATION ENGINE
// -------------------------------------------------------------------
function calculateDuctLoss() {
  const summary = propagateChainedSchedule();
  lastCalculatedSummary = summary;

  const tdlSupplyInput = document.getElementById('tdlSupply');
  const tdlReturnInput = document.getElementById('tdlReturn');

  if (tdlSupplyInput && chainedScheduleRows.some(r => r.type === 'straight_duct' && r.path === 'supply')) {
    tdlSupplyInput.value = Math.round(summary.supplyTDL);
  }
  if (tdlReturnInput && chainedScheduleRows.some(r => r.type === 'straight_duct' && r.path === 'return')) {
    tdlReturnInput.value = Math.round(summary.returnTDL);
  }

  // Velocity Pressure of primary trunk
  const trunkVp = calcVelocityPressure(summary.systemVel);

  // Conversion factor lookup from Loren Cook matrix
  const conversionFactor = lookupConversionFactor(summary.systemVel, summary.avgDFL);

  // Update Dynamic Criteria Readouts
  setDisplayText('metricCalculatedVelocity', `${Math.round(summary.systemVel).toLocaleString()} FPM`);
  setDisplayText('metricCalculatedDFL', `${summary.avgDFL.toFixed(3)}" / 100'`);

  // Update Summary Metrics
  const hasDucts = chainedScheduleRows.length > 0;
  setDisplayText('metricTDLTotal', `${summary.totalTDL.toFixed(1)}'`);
  setDisplayText('metricTDLTotalSummary', `${summary.totalTDL.toFixed(1)}'`);
  setDisplayText('metricTELBase', `${Math.round(summary.totalTEL)}'`);
  setDisplayText('metricSummaryVelocity', hasDucts ? `${Math.round(summary.systemVel)} FPM` : `0 FPM`);
  setDisplayText('metricConversionFactor', `${conversionFactor.toFixed(2)}x`);
  setDisplayText('metricTotalEquivLength', `${Math.round(summary.totalLength)}'`);

  setDisplayText('metricDuctLoss', `${summary.totalDuctLoss.toFixed(3)}" w.g.`);
  setDisplayText('metricDuctLossApprox', `${summary.totalDuctLoss.toFixed(3)}"`);
  setDisplayText('metricComponentLoss', `${summary.totalComponentLoss.toFixed(2)}"`);
  setDisplayText('metricTotalESP', `${summary.totalESP.toFixed(2)}" w.g.`);
  setDisplayText('metricVelocityPressure', hasDucts ? `Pv: ${trunkVp.toFixed(4)}"` : `Pv: 0.0000"`);

  // Update Table Header Indicators
  setDisplayText('tableHeaderTDL', `${summary.totalTDL.toFixed(1)}'`);
  setDisplayText('tableHeaderTEL', `${Math.round(summary.totalTEL)}'`);
  setDisplayText('tableHeaderDuctLoss', `${summary.totalDuctLoss.toFixed(3)}"`);

  // Update badge in header if exists
  const factorBadge = document.getElementById('conversionFactorBadge');
  if (factorBadge) {
    factorBadge.innerText = `Factor: ${conversionFactor.toFixed(2)} @ ${Math.round(summary.systemVel)} FPM`;
  }

  // Update Critical Path Run Totals row in table footer
  updateFittingsTableFooter(summary);

  // Calculate Loren Cook Handbook TEL Check (Page 68 macro method)
  // Formula: [ (TDL + BaseTEL * ConversionFactor) / 100 ] * avgDFL + totalComponentLoss
  const cookAdjustedTEL = summary.totalTEL * conversionFactor;
  const cookTotalEquivFt = summary.totalTDL + cookAdjustedTEL;
  const cookDuctLoss = (cookTotalEquivFt / 100.0) * summary.avgDFL;
  const hasScheduleOrComponents = (summary.totalLength > 0 || summary.totalComponentLoss > 0);
  const cookTotalESP = hasScheduleOrComponents ? (cookDuctLoss + summary.totalComponentLoss) : 0;

  setDisplayText('metricCookTELCheck', `${cookTotalESP.toFixed(2)}" w.g.`);
  const cookCheckEl = document.getElementById('metricCookTELCheck');
  if (cookCheckEl) {
    cookCheckEl.title = `LC Handbook Estimate: ((${summary.totalTDL.toFixed(1)}' TDL + (${Math.round(summary.totalTEL)}' Base TEL × ${conversionFactor.toFixed(2)} factor)) / 100 × ${summary.avgDFL.toFixed(3)}") + ${summary.totalComponentLoss.toFixed(2)}" comp = ${cookTotalESP.toFixed(3)}" w.g.`;
  }

  const deltaBadge = document.getElementById('metricCookTELDeltaBadge');
  if (deltaBadge) {
    if (summary.totalESP > 0.0001 && cookTotalESP > 0.0001) {
      const diff = cookTotalESP - summary.totalESP;
      const pct = (diff / summary.totalESP) * 100;
      const absPct = Math.abs(pct);
      if (absPct < 0.5) {
        deltaBadge.textContent = '0% Margin';
        deltaBadge.className = 'text-[9.5px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700';
        deltaBadge.title = 'Loren Cook handbook estimate aligns within 0.5% of chained schedule';
      } else if (pct > 0) {
        const pctFormatted = absPct < 10 ? pct.toFixed(1) : Math.round(pct);
        deltaBadge.textContent = `+${pctFormatted}% Margin`;
        deltaBadge.className = 'text-[9.5px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
        deltaBadge.title = `Handbook estimate is +${pctFormatted}% higher than chained schedule (conservative design margin)`;
      } else {
        const pctFormatted = absPct < 10 ? pct.toFixed(1) : Math.round(pct);
        deltaBadge.textContent = `${pctFormatted}% Margin`;
        deltaBadge.className = 'text-[9.5px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30';
        deltaBadge.title = `Handbook estimate is ${pctFormatted}% lower than chained schedule`;
      }
    } else {
      deltaBadge.textContent = '0% Margin';
      deltaBadge.className = 'text-[9.5px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700';
      deltaBadge.title = 'No active schedule items or external static pressure entered';
    }
  }

  // Mirror into fittingsRows for backward compatibility
  fittingsRows = chainedScheduleRows.filter(r => r.type !== 'straight_duct').map(r => ({
    id: r.id,
    path: r.path,
    fittingKey: r.fittingKey || 'custom_fitting',
    paramKey: r.paramKey || 'default',
    angle: r.angle || '90',
    qty: 1,
    baseEL: r.baseEL,
    rowTotal: r.baseEL,
    customName: r.name
  }));
}

function setDisplayText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

// -------------------------------------------------------------------
// CRITICAL PATH RUN TOTALS TABLE FOOTER
// -------------------------------------------------------------------
function updateFittingsTableFooter(summary) {
  const tfoot = document.getElementById('fittingsTableFooter');
  if (!tfoot) return;
  if (!chainedScheduleRows || chainedScheduleRows.length === 0) {
    tfoot.innerHTML = '';
    return;
  }
  if (!summary) {
    summary = propagateChainedSchedule();
  }
  tfoot.innerHTML = `
    <tr class="bg-slate-900/95 border-t-2 border-slate-700">
      <td colspan="3" class="p-3 text-left font-bold text-slate-200">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-calculator text-rose-500"></i>
          <span>CRITICAL PATH RUN TOTALS</span>
        </div>
      </td>
      <td class="p-3 text-center font-mono font-bold text-white text-xs">
        ${Math.round(summary.totalCFM)} CFM
      </td>
      <td class="p-3 text-center text-[10px] text-slate-400 font-sans">
        Schedule Run
      </td>
      <td class="p-3 text-center font-mono text-emerald-400 text-xs">
        Avg: ${Math.round(summary.systemVel)} FPM
      </td>
      <td class="p-3 text-right font-mono font-bold text-sky-400 text-xs leading-tight">
        ${summary.totalTDL.toFixed(1)}' TDL<br>
        <span class="text-rose-400 font-normal text-[10px]">${Math.round(summary.totalTEL)}' TEL</span>
      </td>
      <td class="p-3 text-right font-mono font-bold text-rose-300 text-xs">
        ${summary.totalDuctLoss.toFixed(3)}"
      </td>
      <td class="p-3 text-right font-mono font-black text-white text-xs">
        ${Math.round(summary.totalLength)}'
      </td>
      <td class="p-3 text-right font-mono font-black text-rose-400 text-sm">
        ${summary.totalESP.toFixed(3)}" ESP
      </td>
      <td class="p-3 text-center">
        <button type="button" onclick="clearAllChainedSchedule()" class="btn-clear text-[10px] px-2 py-0.5 rounded" title="Clear all schedule items">Clear</button>
      </td>
    </tr>
  `;
}

// -------------------------------------------------------------------
// CHAINED CRITICAL PATH SCHEDULE TABLE MANAGEMENT
// -------------------------------------------------------------------
function renderFittingsTable(cachedSummary) {
  const tbody = document.getElementById('fittingsTableBody');
  const tfoot = document.getElementById('fittingsTableFooter');
  if (!tbody) return;

  tbody.innerHTML = '';
  const map = getAllFittingsMap();

  if (chainedScheduleRows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="p-6 text-center text-slate-400 font-sans text-xs">
          <i class="fa-solid fa-route text-slate-600 text-2xl mb-2 block"></i>
          No duct sections or fittings added to the critical path run yet.<br>
          <div class="mt-3 flex items-center justify-center gap-2">
            <button type="button" onclick="quickAddStraightDuct()" class="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition shadow-md shadow-sky-600/20 flex items-center gap-1.5">
              <i class="fa-solid fa-arrows-left-right"></i> + Straight Duct
            </button>
            <button type="button" onclick="toggleAddFittingDropdown(event)" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-md shadow-rose-600/20 flex items-center gap-1.5">
              <i class="fa-solid fa-plus"></i> + Add Fitting
            </button>
          </div>
        </td>
      </tr>
    `;
    updateFittingsTableFooter(null);
    calculateDuctLoss();
    return;
  }

  // Ensure fresh propagation so all row fluid mechanics and cumulative totals are current
  const summary = cachedSummary || propagateChainedSchedule();
  lastCalculatedSummary = summary;

  chainedScheduleRows.forEach((row, idx) => {
    const fittingDef = (row.fittingKey && map[row.fittingKey]) ? map[row.fittingKey] : null;
    const isStraight = (row.type === 'straight_duct');
    const isTee = (row.type === 'tee_branch');
    const isTrans = (row.type === 'transition');
    const isFlex = (row.type === 'flex_drop');
    const isCustom = (row.type === 'custom_fitting');

    // Check for aerodynamic shape mismatch with preceding schedule item
    let shapeMismatchHtml = '';
    if (idx > 0) {
      const prevRow = chainedScheduleRows[idx - 1];
      const prevLeavingShape = getRowLeavingShape(prevRow);
      const curEnteringShape = getRowEnteringShape(row);
      if (prevLeavingShape && curEnteringShape && prevLeavingShape !== curEnteringShape) {
        const isR2Rd = (prevLeavingShape === 'rect' && curEnteringShape === 'round');
        const label = isR2Rd ? 'Needs Transition (Rect → Round)' : 'Needs Transition (Round → Rect)';
        const hint = isR2Rd
          ? 'Preceding duct section is Rectangular while this fitting is Round. Consider inserting a Rect-to-Round transition fitting (such as Fitting 9d) between these items.'
          : 'Preceding duct section is Round while this fitting is Rectangular. Consider inserting a Round-to-Rect transition fitting (such as Fitting 9c) between these items.';
        shapeMismatchHtml = `
          <div class="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-semibold cursor-help shadow-sm" title="${hint}">
            <i class="fa-solid fa-triangle-exclamation text-amber-400 text-[10px]"></i>
            <span>${label}</span>
          </div>
        `;
      }
    }

    // 1. Icon / Diagram Thumbnail
    let thumbHtml = '';
    if (fittingDef && fittingDef.image) {
      const imgSrc = getFittingImagePath(fittingDef.image);
      const safeTitle = (row.name || fittingDef.name).replace(/"/g, '&quot;').replace(/'/g, "\\'");
      thumbHtml = `
        <button type="button" onclick="openImageLightbox('${imgSrc}', '${safeTitle}', '${row.fittingKey || ''}')"
          class="fitting-thumb-btn flex-shrink-0 w-[44px] h-[44px] rounded-lg border border-slate-700 hover:border-rose-500 overflow-hidden bg-slate-900 p-0.5 transition shadow-sm group cursor-pointer"
          title="Click to view full 3D diagram">
          <img src="${imgSrc}" alt="${safeTitle}" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200" loading="lazy">
        </button>
      `;
    } else if (isStraight) {
      thumbHtml = `
        <div onclick="openEditRowModal(${row.id})" class="flex-shrink-0 w-[44px] h-[44px] rounded-lg border border-sky-500/40 bg-sky-500/10 flex items-center justify-center text-sky-400 text-lg shadow-sm cursor-pointer hover:border-sky-400 transition" title="Click to edit straight duct">
          <i class="fa-solid fa-arrows-left-right"></i>
        </div>
      `;
    } else if (isTee) {
      thumbHtml = `
        <div onclick="openEditRowModal(${row.id})" class="flex-shrink-0 w-[44px] h-[44px] rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 text-lg shadow-sm cursor-pointer hover:border-amber-400 transition" title="Click to edit tee / branch">
          <i class="fa-solid fa-code-branch"></i>
        </div>
      `;
    } else if (isTrans) {
      thumbHtml = `
        <div onclick="openEditRowModal(${row.id})" class="flex-shrink-0 w-[44px] h-[44px] rounded-lg border border-purple-500/40 bg-purple-500/10 flex items-center justify-center text-purple-400 text-lg shadow-sm cursor-pointer hover:border-purple-400 transition" title="Click to edit transition">
          <i class="fa-solid fa-right-left"></i>
        </div>
      `;
    } else if (isFlex) {
      thumbHtml = `
        <div onclick="openEditRowModal(${row.id})" class="flex-shrink-0 w-[44px] h-[44px] rounded-lg border border-teal-500/40 bg-teal-500/10 flex items-center justify-center text-teal-400 text-lg shadow-sm cursor-pointer hover:border-teal-400 transition" title="Click to edit flex duct">
          <i class="fa-solid fa-wave-square"></i>
        </div>
      `;
    } else {
      thumbHtml = `
        <div onclick="openEditRowModal(${row.id})" class="flex-shrink-0 w-[44px] h-[44px] rounded-lg border border-rose-500/40 bg-rose-500/10 flex items-center justify-center text-rose-400 text-lg shadow-sm cursor-pointer hover:border-rose-400 transition" title="Click to edit custom fitting">
          <i class="fa-solid fa-wrench"></i>
        </div>
      `;
    }

    // 2. Flow Cell HTML
    let flowCellHtml = '';
    if (isTee) {
      const isBranchContinuation = (row.teeContinuation === 'branch' || isBranchTakeoffFitting(row.fittingKey));
      flowCellHtml = `
        <div class="text-center font-mono">
          <div class="font-bold ${isBranchContinuation ? 'text-slate-300' : 'text-white'} text-xs">${Math.round(row.enteringCFM)} <span class="text-[9px] font-normal text-slate-400">Trk</span></div>
          <div class="flex items-center justify-center gap-1 my-0.5">
            <span class="text-[10px] text-amber-400 font-semibold">${isBranchContinuation ? '&rarr;' : '-'}</span>
            <input type="number" min="0" step="10" value="${row.branchCFM || 0}" onchange="updateChainedBranchCFM(${row.id}, this.value)"
              class="schedule-field-input w-14 text-center bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[11px] font-bold text-amber-300 mono outline-none focus:border-rose-500" title="Branch Takeoff Airflow">
            <span class="text-[9px] text-amber-400 font-sans">Br</span>
          </div>
          <div class="text-[10px] font-bold ${isBranchContinuation ? 'text-amber-400' : 'text-emerald-400'}">
            &rarr; ${Math.round(row.leavingCFM)} CFM ${isBranchContinuation ? '<span class="text-[9px] font-normal text-amber-300">(Br Path)</span>' : ''}
          </div>
        </div>
      `;
    } else {
      flowCellHtml = `
        <div class="text-center font-mono">
          <span class="font-bold text-white text-xs">${Math.round(row.enteringCFM)}</span>
          <span class="text-[10px] text-slate-400 block font-sans">CFM</span>
        </div>
      `;
    }

    // 3. Dimensions Cell HTML
    let dimsCellHtml = '';
    if (isStraight) {
      if (row.shape === 'round') {
        dimsCellHtml = `
          <div class="flex items-center justify-center gap-1 font-mono">
            <span class="text-sky-400 text-[10px] font-bold">&Oslash;</span>
            <input type="number" min="2" max="120" step="0.5" value="${row.dia || row.width || 14}" onchange="updateChainedDims(${row.id}, this.value, this.value)"
              class="schedule-field-input w-14 text-center bg-slate-900 border border-slate-700 rounded p-1 text-xs font-bold text-sky-300 mono outline-none focus:border-rose-500" title="Duct Diameter (in)">
          </div>
        `;
      } else {
        dimsCellHtml = `
          <div class="flex items-center justify-center gap-1 font-mono">
            <input type="number" min="2" max="120" value="${row.width}" onchange="updateChainedDims(${row.id}, this.value, ${row.height})"
              class="schedule-field-input w-11 text-center bg-slate-900 border border-slate-700 rounded p-1 text-xs font-bold text-white mono outline-none focus:border-rose-500" title="Duct Width (in)">
            <span class="text-slate-400 text-[11px]">&times;</span>
            <input type="number" min="2" max="120" value="${row.height}" onchange="updateChainedDims(${row.id}, ${row.width}, this.value)"
              class="schedule-field-input w-11 text-center bg-slate-900 border border-slate-700 rounded p-1 text-xs font-bold text-white mono outline-none focus:border-rose-500" title="Duct Length/Height (in)">
          </div>
        `;
      }
    } else if (isTrans) {
      const enterText = (row.shape === 'round') ? `&Oslash; ${row.dia || row.width}&quot;` : `${row.width}&quot;&times;${row.height}&quot;`;
      let leavingInputsHtml = '';
      if (row.leavingShape === 'round') {
        leavingInputsHtml = `
          <div class="flex items-center justify-center gap-1 mt-0.5">
            <span class="text-sky-400 text-[10px] font-bold">&Oslash;</span>
            <input type="number" min="2" max="120" step="0.5" value="${row.leavingDia || row.leavingWidth || 14}" onchange="updateChainedLeavingDia(${row.id}, this.value)"
              class="schedule-field-input w-14 text-center bg-slate-900 border border-slate-700 rounded p-0.5 text-xs font-bold text-sky-300 mono outline-none focus:border-rose-500" title="Leaving Diameter (in)">
          </div>
        `;
      } else {
        leavingInputsHtml = `
          <div class="flex items-center justify-center gap-1 mt-0.5">
            <input type="number" min="2" max="120" step="0.5" value="${row.leavingWidth || 16}" onchange="updateChainedLeavingDims(${row.id}, this.value, ${row.leavingHeight || 10})"
              class="schedule-field-input w-11 text-center bg-slate-900 border border-slate-700 rounded p-0.5 text-xs font-bold text-purple-300 mono outline-none focus:border-rose-500" title="Leaving Width (in)">
            <span class="text-slate-400 text-[10px]">&times;</span>
            <input type="number" min="2" max="120" step="0.5" value="${row.leavingHeight || 10}" onchange="updateChainedLeavingDims(${row.id}, ${row.leavingWidth || 16}, this.value)"
              class="schedule-field-input w-11 text-center bg-slate-900 border border-slate-700 rounded p-0.5 text-xs font-bold text-purple-300 mono outline-none focus:border-rose-500" title="Leaving Length (in)">
          </div>
        `;
      }
      dimsCellHtml = `
        <div class="text-center font-mono">
          <span class="text-[10px] text-slate-400">${enterText} &rarr;</span>
          ${leavingInputsHtml}
        </div>
      `;
    } else if (isTee) {
      const isBranchContinuation = (row.teeContinuation === 'branch' || isBranchTakeoffFitting(row.fittingKey));
      const enterText = (row.shape === 'round') ? `&Oslash; ${row.dia || row.width}&quot;` : `${row.width}&quot;&times;${row.height}&quot;`;
      if (isBranchContinuation) {
        const bShape = row.branchShape || getTeeBranchShape(row.fittingKey);
        let branchInputsHtml = '';
        if (bShape === 'round') {
          const bDia = parseFloat(row.branchDia) || parseFloat(row.branchWidth) || 12;
          branchInputsHtml = `
            <div class="flex items-center justify-center gap-1 mt-0.5">
              <span class="text-amber-400 text-[10px] font-bold">&Oslash;</span>
              <input type="number" min="2" max="120" step="0.5" value="${bDia}" onchange="updateChainedBranchDia(${row.id}, this.value)"
                class="schedule-field-input w-12 text-center bg-slate-900 border border-slate-700 rounded p-0.5 text-xs font-bold text-amber-300 mono outline-none focus:border-rose-500" title="Branch Takeoff Diameter (in)">
              <span class="text-[9px] text-amber-400 font-sans">Br</span>
            </div>
          `;
        } else {
          const bW = parseFloat(row.branchWidth) || 16;
          const bH = parseFloat(row.branchHeight) || 10;
          branchInputsHtml = `
            <div class="flex items-center justify-center gap-1 mt-0.5">
              <input type="number" min="2" max="120" step="0.5" value="${bW}" onchange="updateChainedBranchDims(${row.id}, this.value, ${bH})"
                class="schedule-field-input w-10 text-center bg-slate-900 border border-slate-700 rounded p-0.5 text-xs font-bold text-amber-300 mono outline-none focus:border-rose-500" title="Branch Takeoff Width (in)">
              <span class="text-slate-400 text-[10px]">&times;</span>
              <input type="number" min="2" max="120" step="0.5" value="${bH}" onchange="updateChainedBranchDims(${row.id}, ${bW}, this.value)"
                class="schedule-field-input w-10 text-center bg-slate-900 border border-slate-700 rounded p-0.5 text-xs font-bold text-amber-300 mono outline-none focus:border-rose-500" title="Branch Takeoff Height (in)">
              <span class="text-[9px] text-amber-400 font-sans">Br</span>
            </div>
          `;
        }
        dimsCellHtml = `
          <div class="text-center font-mono">
            <span class="text-[10px] text-slate-400 font-sans">${enterText} <span class="text-[9px] text-slate-500">(Trk)</span> &rarr;</span>
            ${branchInputsHtml}
          </div>
        `;
      } else {
        dimsCellHtml = `
          <div class="text-center font-mono font-bold text-slate-200 text-xs">
            ${enterText}
          </div>
        `;
      }
    } else {
      const dimLabel = (row.shape === 'round') ? `&Oslash; ${row.dia || row.width}&quot;` : `${row.width}&quot; &times; ${row.height}&quot;`;
      dimsCellHtml = `
        <div class="text-center font-mono font-bold text-slate-200 text-xs">
          ${dimLabel}
        </div>
      `;
    }

    // 4. Length / EL Cell HTML (Locked for standard fittings; editable for straight duct & custom fittings)
    let lenCellHtml = '';
    if (isStraight) {
      lenCellHtml = `
        <div class="flex items-center justify-end gap-1">
          <input type="number" min="0" step="1" value="${row.length}" onchange="updateChainedLength(${row.id}, this.value)"
            class="schedule-field-input w-14 text-right bg-slate-900 border border-slate-700 rounded p-1 text-xs font-bold text-sky-400 mono outline-none focus:border-rose-500" title="Straight Duct Length (ft)">
          <span class="text-slate-400 text-[10px] font-mono">ft</span>
        </div>
      `;
    } else if (isCustom) {
      lenCellHtml = `
        <div class="flex items-center justify-end gap-1">
          <input type="number" min="0" step="1" value="${row.baseEL}" onchange="updateChainedBaseEL(${row.id}, this.value)"
            class="schedule-field-input w-14 text-right bg-slate-900 border border-slate-700 rounded p-1 text-xs font-bold text-amber-300 mono outline-none focus:border-rose-500" title="Custom Fitting Equivalent Length (ft)">
          <span class="text-slate-400 text-[10px] font-mono">ft</span>
        </div>
      `;
    } else {
      lenCellHtml = `
        <div class="flex items-center justify-end gap-1.5 font-mono text-xs font-bold text-rose-300" title="Locked: Derived from SMACNA / Loren Cook fitting tables">
          <span>${row.baseEL}'</span>
          <i class="fa-solid fa-lock text-[9px] text-slate-500" title="Locked Table EL"></i>
        </div>
      `;
    }

    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-800/40 transition-colors border-b border-slate-800/60";
    tr.innerHTML = `
      <!-- 1. SEQUENCE & REORDER -->
      <td class="p-2.5 text-center">
        <div class="flex items-center justify-center gap-1">
          <span class="font-bold text-slate-300 font-mono text-xs">${idx + 1}</span>
          <div class="flex flex-col">
            <button type="button" onclick="moveChainedRow(${row.id}, -1)" class="text-slate-500 hover:text-white text-[9px] p-0.5" title="Move Up"><i class="fa-solid fa-chevron-up"></i></button>
            <button type="button" onclick="moveChainedRow(${row.id}, 1)" class="text-slate-500 hover:text-white text-[9px] p-0.5" title="Move Down"><i class="fa-solid fa-chevron-down"></i></button>
          </div>
        </div>
      </td>

      <!-- 2. PATH -->
      <td class="p-2.5">
        <select onchange="updateChainedPath(${row.id}, this.value)" class="fitting-path-select bg-slate-900 border border-slate-700 rounded-lg p-1 text-[11px] font-bold ${row.path === 'return' ? 'path-return text-cyan-400' : 'path-supply text-rose-400'}">
          <option value="supply" ${row.path === 'supply' ? 'selected' : ''}>Supply</option>
          <option value="return" ${row.path === 'return' ? 'selected' : ''}>Return</option>
        </select>
      </td>

      <!-- 3. COMPONENT & DESCRIPTION (Clickable to Edit) -->
      <td class="p-2.5 font-semibold text-white font-sans text-xs">
        <div class="flex items-center gap-2.5">
          ${thumbHtml}
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="badge-fitting-cat p-1 rounded text-[9px] font-mono leading-none">${isStraight ? 'Duct' : (fittingDef?.category || 'Fitting')}</span>
              ${isStraight ? `
                <button type="button" onclick="openEditRowModal(${row.id})" class="text-left font-semibold text-sky-300 hover:text-sky-200 transition flex items-center gap-1.5 group/name truncate max-w-[200px]" title="Click to edit straight duct dimensions">
                  <span class="truncate">${row.name}</span>
                  <i class="fa-solid fa-pen-to-square text-[10px] text-slate-500 group-hover/name:text-sky-400"></i>
                </button>
              ` : (isCustom ? `
                <input type="text" value="${(row.name || 'Custom Fitting').replace(/"/g, '&quot;')}" onchange="updateChainedName(${row.id}, this.value)"
                  class="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-semibold text-amber-300 outline-none focus:border-rose-500 max-w-[170px]" title="Click to rename item inline">
                <button type="button" onclick="openEditRowModal(${row.id})" class="text-slate-500 hover:text-amber-400 text-[10px] p-0.5" title="Edit custom fitting parameters">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
              ` : `
                <button type="button" onclick="openEditRowModal(${row.id})" class="text-left font-semibold text-white hover:text-rose-300 transition flex items-center gap-1.5 group/name truncate max-w-[200px]" title="Click to edit fitting configuration">
                  <span class="truncate">${row.name}</span>
                  <i class="fa-solid fa-pen-to-square text-[10px] text-slate-500 group-hover/name:text-rose-400"></i>
                </button>
              `)}
            </div>
            ${row.paramKey ? `<span class="text-[10px] text-slate-400 truncate block mt-0.5">${row.paramKey}</span>` : ''}
            ${shapeMismatchHtml}
          </div>
        </div>
      </td>

      <!-- 4. AIRFLOW (CFM) -->
      <td class="p-2.5 text-center">
        ${flowCellHtml}
      </td>

      <!-- 5. DUCT SIZE -->
      <td class="p-2.5 text-center">
        ${dimsCellHtml}
      </td>

      <!-- 6. VELOCITY & PV -->
      <td class="p-2.5 text-center">
        <div class="text-center font-mono">
          <div class="font-bold text-emerald-400 text-xs">${Math.round(row.velocity || 0)} FPM</div>
          <div class="text-[10px] text-slate-400">${(row.pv || 0).toFixed(4)}&quot; P<sub>v</sub></div>
        </div>
      </td>

      <!-- 7. LENGTH / EL -->
      <td class="p-2.5 text-right">
        ${lenCellHtml}
      </td>

      <!-- 8. STATIC LOSS (ΔP) -->
      <td class="p-2.5 text-right font-mono text-xs font-bold text-slate-200">
        ${(row.lossDP || 0).toFixed(3)}&quot;
      </td>

      <!-- 9. CUMULATIVE LENGTH -->
      <td class="p-2.5 text-right font-mono text-xs text-slate-300 font-semibold">
        ${Math.round(row.cumLength || 0)}'
      </td>

      <!-- 10. CUMULATIVE LOSS (ΔP) -->
      <td class="p-2.5 text-right font-mono font-black text-rose-400 text-xs sm:text-sm cum-loss-cell">
        ${(row.cumLossDP || 0).toFixed(3)}&quot;
      </td>

      <!-- 11. ACTIONS -->
      <td class="p-2.5 text-center">
        <div class="flex items-center justify-center gap-1">
          <button type="button" onclick="openEditRowModal(${row.id})" class="p-1 text-slate-400 hover:text-sky-400 rounded hover:bg-slate-800 transition" title="Edit component parameters">
            <i class="fa-solid fa-pen-to-square text-xs"></i>
          </button>
          <button type="button" onclick="duplicateChainedRow(${row.id})" class="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition" title="Duplicate item in chain">
            <i class="fa-solid fa-copy text-xs"></i>
          </button>
          <button type="button" onclick="deleteChainedRow(${row.id})" class="btn-delete-row p-1 rounded transition" title="Delete item">
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Render Table Footer (Totals Summary Row)
  updateFittingsTableFooter(summary);
}

// -------------------------------------------------------------------
// UNIVERSAL ROW EDIT DISPATCHER
// -------------------------------------------------------------------
function openEditRowModal(id) {
  const row = chainedScheduleRows.find(r => r.id === id);
  if (!row) return;
  if (row.type === 'straight_duct') {
    openEditDuctModal(row);
  } else {
    openEditFittingModal(row);
  }
}

// -------------------------------------------------------------------
// STRAIGHT DUCT CONFIGURATION & EDIT MODAL
// -------------------------------------------------------------------
function openFirstDuctModal() {
  const modal = document.getElementById('firstDuctModal');
  if (!modal) return;

  editingDuctRowId = null;

  const titleEl = document.getElementById('firstDuctModalTitle');
  const subtitleEl = document.getElementById('firstDuctModalSubtitle');
  const submitBtnText = document.getElementById('btnFirstDuctSubmitText');
  const submitBtnIcon = document.getElementById('btnFirstDuctSubmitIcon');
  if (titleEl) titleEl.textContent = 'Configure Initial Duct Section';
  if (subtitleEl) subtitleEl.textContent = 'Select whether your starting duct section leaving the equipment is rectangular or round, and enter its initial dimensions. Downstream schedule components will cascade from this section.';
  if (submitBtnText) submitBtnText.textContent = 'Add Initial Duct';
  if (submitBtnIcon) submitBtnIcon.className = 'fa-solid fa-plus';

  setFirstDuctShape('rect');

  const widthIn = document.getElementById('firstDuctWidth');
  const heightIn = document.getElementById('firstDuctHeight');
  const diaIn = document.getElementById('firstDuctDia');
  const lengthIn = document.getElementById('firstDuctLength');
  const nameIn = document.getElementById('firstDuctName');
  const pathIn = document.getElementById('firstDuctPath');
  const cfmIn = document.getElementById('firstDuctCFM');

  if (cfmIn) cfmIn.value = document.getElementById('ductLossCFM')?.value || 1200;
  if (widthIn) widthIn.value = 18;
  if (heightIn) heightIn.value = 12;
  if (diaIn) diaIn.value = 14;
  if (lengthIn) lengthIn.value = 20;
  if (nameIn) nameIn.value = '';
  if (pathIn) pathIn.value = 'supply';

  updateFirstDuctModalReadout();

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  lockBodyScroll();
  setTimeout(() => {
    if (widthIn) {
      widthIn.focus();
      if (typeof widthIn.select === 'function') widthIn.select();
    }
  }, 100);
}

function openEditDuctModal(row) {
  const modal = document.getElementById('firstDuctModal');
  if (!modal) return;

  editingDuctRowId = row.id;

  const rowIdx = chainedScheduleRows.findIndex(r => r.id === row.id);
  const titleEl = document.getElementById('firstDuctModalTitle');
  const subtitleEl = document.getElementById('firstDuctModalSubtitle');
  const submitBtnText = document.getElementById('btnFirstDuctSubmitText');
  const submitBtnIcon = document.getElementById('btnFirstDuctSubmitIcon');

  if (titleEl) titleEl.textContent = `Edit Straight Duct (Row #${rowIdx + 1})`;
  if (subtitleEl) subtitleEl.textContent = 'Update the cross-section dimensions, length, path, or label of this straight duct section. Downstream fittings will dynamically adapt.';
  if (submitBtnText) submitBtnText.textContent = 'Save Changes';
  if (submitBtnIcon) submitBtnIcon.className = 'fa-solid fa-floppy-disk';

  setFirstDuctShape(row.shape || 'rect');

  const widthIn = document.getElementById('firstDuctWidth');
  const heightIn = document.getElementById('firstDuctHeight');
  const diaIn = document.getElementById('firstDuctDia');
  const lengthIn = document.getElementById('firstDuctLength');
  const nameIn = document.getElementById('firstDuctName');
  const pathIn = document.getElementById('firstDuctPath');
  const cfmIn = document.getElementById('firstDuctCFM');

  if (cfmIn) cfmIn.value = document.getElementById('ductLossCFM')?.value || 1200;
  if (widthIn) widthIn.value = row.width || 18;
  if (heightIn) heightIn.value = row.height || 12;
  if (diaIn) diaIn.value = row.dia || row.width || 14;
  if (lengthIn) lengthIn.value = row.length || 20;
  if (nameIn) nameIn.value = row.hasCustomName ? row.name : '';
  if (pathIn) pathIn.value = row.path || 'supply';

  updateFirstDuctModalReadout();

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  lockBodyScroll();
}

function closeFirstDuctModal() {
  const modal = document.getElementById('firstDuctModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  unlockBodyScroll();
  editingDuctRowId = null;

  const titleEl = document.getElementById('firstDuctModalTitle');
  const subtitleEl = document.getElementById('firstDuctModalSubtitle');
  const submitBtnText = document.getElementById('btnFirstDuctSubmitText');
  const submitBtnIcon = document.getElementById('btnFirstDuctSubmitIcon');
  if (titleEl) titleEl.textContent = 'Configure Initial Duct Section';
  if (subtitleEl) subtitleEl.textContent = 'Select whether your starting duct section leaving the equipment is rectangular or round, and enter its initial dimensions. Downstream schedule components will cascade from this section.';
  if (submitBtnText) submitBtnText.textContent = 'Add Initial Duct';
  if (submitBtnIcon) submitBtnIcon.className = 'fa-solid fa-plus';
}

function setFirstDuctShape(shape) {
  const btnRect = document.getElementById('btnFirstDuctRect');
  const btnRound = document.getElementById('btnFirstDuctRound');
  const rectFields = document.getElementById('firstDuctRectFields');
  const roundFields = document.getElementById('firstDuctRoundFields');
  const shapeHidden = document.getElementById('firstDuctShape');

  if (shapeHidden) shapeHidden.value = shape;

  if (shape === 'round') {
    if (btnRect) {
      btnRect.className = "p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-400 font-bold flex items-center justify-center gap-2 transition hover:border-slate-600 hover:text-slate-200";
      const icon = btnRect.querySelector('i');
      if (icon) icon.className = "fa-solid fa-square text-slate-400 text-sm";
    }
    if (btnRound) {
      btnRound.className = "p-3 rounded-xl border-2 border-sky-500 bg-sky-500/15 text-white font-bold flex items-center justify-center gap-2 transition shadow-sm";
      const icon = btnRound.querySelector('i');
      if (icon) icon.className = "fa-solid fa-circle-notch text-sky-400 text-sm";
    }
    if (rectFields) rectFields.classList.add('hidden');
    if (roundFields) roundFields.classList.remove('hidden');
    const diaIn = document.getElementById('firstDuctDia');
    if (diaIn) setTimeout(() => { diaIn.focus(); if (typeof diaIn.select === 'function') diaIn.select(); }, 50);
  } else {
    if (btnRect) {
      btnRect.className = "p-3 rounded-xl border-2 border-sky-500 bg-sky-500/15 text-white font-bold flex items-center justify-center gap-2 transition shadow-sm";
      const icon = btnRect.querySelector('i');
      if (icon) icon.className = "fa-solid fa-square text-sky-400 text-sm";
    }
    if (btnRound) {
      btnRound.className = "p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-400 font-bold flex items-center justify-center gap-2 transition hover:border-slate-600 hover:text-slate-200";
      const icon = btnRound.querySelector('i');
      if (icon) icon.className = "fa-solid fa-circle-notch text-slate-400 text-sm";
    }
    if (rectFields) rectFields.classList.remove('hidden');
    if (roundFields) roundFields.classList.add('hidden');
    const widthIn = document.getElementById('firstDuctWidth');
    if (widthIn) setTimeout(() => { widthIn.focus(); if (typeof widthIn.select === 'function') widthIn.select(); }, 50);
  }
  updateFirstDuctModalReadout();
}

function updateFirstDuctModalReadout() {
  const velEl = document.getElementById('firstDuctCalcVel');
  const dflEl = document.getElementById('firstDuctCalcDFL');
  if (!velEl && !dflEl) return;

  const shape = document.getElementById('firstDuctShape')?.value || 'rect';
  const w = Math.max(2, parseFloat(document.getElementById('firstDuctWidth')?.value) || 18);
  const h = Math.max(2, parseFloat(document.getElementById('firstDuctHeight')?.value) || 12);
  const dia = Math.max(2, parseFloat(document.getElementById('firstDuctDia')?.value) || 14);
  const cfm = Math.max(10, parseFloat(document.getElementById('firstDuctCFM')?.value) || parseFloat(document.getElementById('ductLossCFM')?.value) || 1200);

  const area = calcDuctArea(w, h, shape, dia);
  const de = (shape === 'round') ? dia : calcHuebscherDe(w, h);
  const vel = calcDuctVelocity(cfm, area);
  const friction = calcStraightDuctFrictionRate(cfm, de);

  if (velEl) velEl.textContent = `${Math.round(vel).toLocaleString()} FPM`;
  if (dflEl) dflEl.textContent = `${friction.toFixed(3)}" / 100'`;
}

function syncPrecedingTransitionAndRow0(rowIdx, w, h, shape, dia) {
  if (rowIdx < 0) return;
  // If this straight duct is after a transition, sync with preceding transition's leaving dimensions
  for (let i = rowIdx - 1; i >= 0; i--) {
    const prev = chainedScheduleRows[i];
    if (prev && prev.type === 'transition') {
      if (shape === 'round') {
        prev.leavingDia = dia;
        prev.leavingWidth = dia;
        prev.leavingHeight = dia;
        prev.leavingShape = 'round';
      } else {
        prev.leavingWidth = w;
        prev.leavingHeight = h;
        prev.leavingShape = 'rect';
      }
      break;
    }
  }

  // If in segment 0 (before any transition), sync row 0 if row 0 is not this row
  let hasTransitionBefore = false;
  for (let i = 0; i < rowIdx; i++) {
    if (chainedScheduleRows[i] && chainedScheduleRows[i].type === 'transition') {
      hasTransitionBefore = true;
      break;
    }
  }
  if (!hasTransitionBefore && rowIdx > 0 && chainedScheduleRows[0]) {
    const r0 = chainedScheduleRows[0];
    r0.width = w;
    r0.height = h;
    r0.shape = shape;
    r0.dia = dia;
  }
}

function commitFirstDuctModal() {
  const shape = document.getElementById('firstDuctShape')?.value || 'rect';
  const path = document.getElementById('firstDuctPath')?.value || 'supply';
  const length = Math.max(1, parseFloat(document.getElementById('firstDuctLength')?.value) || 20);
  const customName = document.getElementById('firstDuctName')?.value.trim();

  let w = 18;
  let h = 12;
  let dia = 14;

  if (shape === 'round') {
    dia = Math.max(2, parseFloat(document.getElementById('firstDuctDia')?.value) || 14);
    w = dia;
    h = dia;
  } else {
    w = Math.max(2, parseFloat(document.getElementById('firstDuctWidth')?.value) || 18);
    h = Math.max(2, parseFloat(document.getElementById('firstDuctHeight')?.value) || 12);
    dia = Math.round(calcHuebscherDe(w, h) * 10) / 10 || 14;
  }

  const dimLabel = (shape === 'round') ? `Ø ${dia}"` : `${w}" × ${h}"`;
  const defaultName = `Straight Duct (${dimLabel})`;

  if (editingDuctRowId !== null) {
    const row = chainedScheduleRows.find(r => r.id === editingDuctRowId);
    if (row) {
      row.shape = shape;
      row.path = path;
      row.length = length;
      row.width = w;
      row.height = h;
      row.dia = dia;
      row.baseEL = length;
      row.hasCustomName = !!customName;
      row.name = customName || defaultName;

      const rowIdx = chainedScheduleRows.findIndex(r => r.id === row.id);
      syncPrecedingTransitionAndRow0(rowIdx, w, h, shape, dia);

      if (rowIdx === 0) {
        const enteredCFM = Math.max(10, parseFloat(document.getElementById('firstDuctCFM')?.value) || 0);
        if (enteredCFM > 0) {
          const mainCFMEl = document.getElementById('ductLossCFM');
          if (mainCFMEl) mainCFMEl.value = enteredCFM;
        }
      }
    }
    closeFirstDuctModal();
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof showToast === 'function') {
      showToast('Duct Section Updated', `Updated straight duct section (${dimLabel}).`);
    }
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
    return;
  }

  const enteredCFM = Math.max(10, parseFloat(document.getElementById('firstDuctCFM')?.value) || 0);
  if (enteredCFM > 0) {
    const mainCFMEl = document.getElementById('ductLossCFM');
    if (mainCFMEl) mainCFMEl.value = enteredCFM;
  }

  const newRow = {
    id: chainedScheduleRowIdCounter++,
    type: 'straight_duct',
    path: path,
    name: customName || defaultName,
    hasCustomName: !!customName,
    length: length,
    shape: shape,
    width: w,
    height: h,
    dia: dia,
    baseEL: length
  };

  chainedScheduleRows.push(newRow);
  closeFirstDuctModal();
  calculateDuctLoss();
  renderFittingsTable();

  if (typeof showToast === 'function') {
    showToast('Initial Duct Added', `Added ${length}' of ${dimLabel} duct to ${path === 'return' ? 'Return' : 'Supply'}.`);
  }
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

// -------------------------------------------------------------------
// QUICK ROW ADDITION HELPERS
// -------------------------------------------------------------------
function quickAddStraightDuct() {
  if (chainedScheduleRows.length === 0) {
    openFirstDuctModal();
    return;
  }

  const currentDims = getCurrentDownstreamDims();
  const currentPath = (chainedScheduleRows.length > 0) ? chainedScheduleRows[chainedScheduleRows.length - 1].path : 'supply';
  const dimLabel = (currentDims.shape === 'round') ? `Ø ${currentDims.dia || currentDims.w}"` : `${currentDims.w}" × ${currentDims.h}"`;
  
  const newRow = {
    id: chainedScheduleRowIdCounter++,
    type: 'straight_duct',
    path: currentPath,
    name: `Straight Duct (${dimLabel})`,
    hasCustomName: false,
    length: 20,
    width: currentDims.w,
    height: currentDims.h,
    shape: currentDims.shape || 'rect',
    dia: currentDims.dia || currentDims.w,
    baseEL: 20
  };

  chainedScheduleRows.push(newRow);
  calculateDuctLoss();
  renderFittingsTable();
  if (typeof showToast === 'function') {
    showToast('Straight Duct Added', `Added 20' of ${dimLabel} straight duct to critical path.`);
  }
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function quickAddFlexDrop() {
  const newRow = {
    id: chainedScheduleRowIdCounter++,
    type: 'flex_drop',
    path: 'supply',
    name: '5 ft Smooth Radius Flex Elbow Drop',
    fittingKey: 'flex_elbow',
    paramKey: '5 ft Smooth Radius Elbow to Diffuser/Inlet',
    angle: '90',
    baseEL: 120
  };

  chainedScheduleRows.push(newRow);
  calculateDuctLoss();
  renderFittingsTable();
  if (typeof showToast === 'function') {
    showToast('Flex Drop Added', 'Added 5 ft smooth radius flex elbow drop (120\' EL).');
  }
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function addFittingRow(fittingKey, path = 'supply', defaultParam = null, qty = 1, angle = '90', customName = null, customEL = null, branchCFM = null, leavingWidth = null, leavingHeight = null, leavingDia = null, leavingShape = null, teeContinuation = 'trunk', branchWidth = null, branchHeight = null, transAngle = '30', initialCriteria = null, extraGeometry = null) {
  const map = getAllFittingsMap();
  const def = map[fittingKey] || DUCT_LOSS_DATA.presetsSpecial.custom_fitting;
  
  let paramKey = (extraGeometry && extraGeometry.ratioLabel) ? extraGeometry.ratioLabel : defaultParam;
  let baseEL = 0;

  if (customEL !== null && !isNaN(customEL)) {
    baseEL = customEL;
  } else if (extraGeometry && extraGeometry.calculatedEL !== null && extraGeometry.calculatedEL !== undefined && !isNaN(extraGeometry.calculatedEL)) {
    baseEL = extraGeometry.calculatedEL;
  } else if (def && def.options) {
    const keys = Object.keys(def.options);
    if (!paramKey || !def.options[paramKey]) {
      paramKey = keys[0];
    }
    baseEL = def.options[paramKey] || 0;
    if (def.hasAngleFactor && angle && DUCT_LOSS_DATA.miteredAngleFactors && DUCT_LOSS_DATA.miteredAngleFactors[angle]) {
      baseEL = Math.round(baseEL * DUCT_LOSS_DATA.miteredAngleFactors[angle]);
    }
  }

  const isCustom = (fittingKey === 'custom_fitting');
  const isTee = isTeeFitting(fittingKey);
  const isTrans = isTransitionFitting(fittingKey);
  const isFlex = fittingKey.includes('flex');

  let rowType = 'fitting';
  if (isTee) rowType = 'tee_branch';
  else if (isTrans) rowType = 'transition';
  else if (isFlex) rowType = 'flex_drop';
  else if (isCustom) rowType = 'custom_fitting';

  const currentDims = initialCriteria ? initialCriteria : getCurrentDownstreamDims();

  let fittingShape = (extraGeometry && extraGeometry.shape) ? extraGeometry.shape : (currentDims.shape || 'rect');
  let fittingW = (extraGeometry && extraGeometry.width) ? extraGeometry.width : currentDims.w;
  let fittingH = (extraGeometry && extraGeometry.height) ? extraGeometry.height : currentDims.h;
  let fittingDia = (extraGeometry && extraGeometry.dia) ? extraGeometry.dia : (currentDims.dia || 14);
  let fittingRadius = (extraGeometry && extraGeometry.radius) ? extraGeometry.radius : null;

  if (!extraGeometry) {
    if (isTrans) {
      const geom = getTransitionGeometry(fittingKey);
      if (geom.upstream === 'rect') {
        fittingShape = 'rect';
        fittingW = (currentDims.shape === 'rect' && currentDims.w) ? currentDims.w : 18;
        fittingH = (currentDims.shape === 'rect' && currentDims.h) ? currentDims.h : 12;
        fittingDia = Math.round(calcHuebscherDe(fittingW, fittingH) * 10) / 10 || 14;
      } else {
        fittingShape = 'round';
        fittingDia = (currentDims.shape === 'round' && currentDims.dia) ? currentDims.dia : 14;
        fittingW = fittingDia;
        fittingH = fittingDia;
      }
    } else if (isRoundFitting(fittingKey)) {
      fittingShape = 'round';
      if (currentDims.shape === 'rect') {
        const de = Math.round(calcHuebscherDe(currentDims.w, currentDims.h) * 10) / 10;
        fittingDia = de || currentDims.dia || 14;
        fittingW = fittingDia;
        fittingH = fittingDia;
      }
    } else if (isRectFitting(fittingKey)) {
      fittingShape = 'rect';
      if (currentDims.shape === 'round') {
        fittingW = currentDims.dia || 18;
        fittingH = currentDims.dia ? Math.round(currentDims.dia * 0.75) : 12;
      }
    }
  }

  for (let q = 0; q < qty; q++) {
    const newRow = {
      id: chainedScheduleRowIdCounter++,
      type: rowType,
      path: path,
      name: customName || (def ? def.name : fittingKey),
      fittingKey: fittingKey,
      paramKey: paramKey,
      angle: angle || '90',
      baseEL: baseEL,
      width: fittingW,
      height: fittingH,
      shape: fittingShape,
      dia: fittingDia,
      radius: fittingRadius,
      isVanes: (extraGeometry && extraGeometry.isVanes !== undefined) ? extraGeometry.isVanes : true,
      hasCustomDia: !!(extraGeometry && extraGeometry.dia),
      hasCustomDims: !!(extraGeometry && (extraGeometry.width || extraGeometry.height)),
      customName: customName || null
    };

    if (initialCriteria) {
      newRow.initialTargetVel = initialCriteria.targetVel;
      newRow.initialTargetFriction = initialCriteria.targetDFL;
    }

    if (isTee) {
      const curCFM = getCurrentDownstreamCFM();
      newRow.branchCFM = (branchCFM !== null && !isNaN(branchCFM)) ? branchCFM : Math.min(400, Math.round(curCFM * 0.33));
      const isBranchCont = isBranchTakeoffFitting(fittingKey) || (teeContinuation === 'branch');
      newRow.teeContinuation = isBranchCont ? 'branch' : (teeContinuation || 'trunk');
      const bShape = getTeeBranchShape(fittingKey);
      newRow.branchShape = bShape;

      if (bShape === 'round') {
        const d = (extraGeometry && extraGeometry.branchDia) ? extraGeometry.branchDia : (parseFloat(branchDia) || parseFloat(branchWidth) || parseFloat(branchHeight) || ((currentDims.shape === 'round') ? currentDims.dia : 12));
        newRow.branchDia = d;
        newRow.branchWidth = d;
        newRow.branchHeight = d;
      } else {
        newRow.branchWidth = (extraGeometry && extraGeometry.branchWidth) ? extraGeometry.branchWidth : (parseFloat(branchWidth) || Math.max(2, currentDims.w - 4) || 16);
        newRow.branchHeight = (extraGeometry && extraGeometry.branchHeight) ? extraGeometry.branchHeight : (parseFloat(branchHeight) || currentDims.h || 10);
        newRow.branchDia = Math.round(calcHuebscherDe(newRow.branchWidth, newRow.branchHeight) * 10) / 10 || 14;
      }
    }
    if (isTrans) {
      const geom = getTransitionGeometry(fittingKey);
      newRow.leavingShape = leavingShape || geom.downstream || 'rect';
      newRow.transAngle = transAngle || '30';
      if (newRow.leavingShape === 'round') {
        newRow.leavingDia = (leavingDia !== null && !isNaN(leavingDia)) ? leavingDia : ((currentDims.shape === 'round') ? (currentDims.dia || 14) : 14);
        newRow.leavingWidth = newRow.leavingDia;
        newRow.leavingHeight = newRow.leavingDia;
      } else {
        newRow.leavingWidth = (leavingWidth !== null && !isNaN(leavingWidth)) ? leavingWidth : Math.max(2, currentDims.w - 2);
        newRow.leavingHeight = (leavingHeight !== null && !isNaN(leavingHeight)) ? leavingHeight : Math.max(2, currentDims.h - 2);
        newRow.leavingDia = null;
      }
    }

    chainedScheduleRows.push(newRow);
  }

  window.tool6_modified = true;
  calculateDuctLoss();
  renderFittingsTable();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function updateChainedLength(id, val) {
  const row = chainedScheduleRows.find(r => r.id === id);
  if (row) {
    row.length = Math.max(0, parseFloat(val) || 0);
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function updateChainedDims(id, w, h) {
  const rowIdx = chainedScheduleRows.findIndex(r => r.id === id);
  if (rowIdx < 0) return;
  const row = chainedScheduleRows[rowIdx];
  const newW = Math.max(2, parseFloat(w) || 18);
  const newH = Math.max(2, parseFloat(h) || 12);
  row.width = newW;
  row.height = newH;
  if (row.shape === 'round') {
    row.dia = newW;
    row.height = newW;
  } else {
    row.dia = Math.round(calcHuebscherDe(newW, newH) * 10) / 10 || 14;
  }

  syncPrecedingTransitionAndRow0(rowIdx, row.width, row.height, row.shape, row.dia);

  calculateDuctLoss();
  renderFittingsTable();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function updateChainedBranchCFM(id, val) {
  const row = chainedScheduleRows.find(r => r.id === id);
  if (row) {
    row.branchCFM = Math.max(0, parseFloat(val) || 0);
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function updateChainedBranchDia(id, dia) {
  const row = chainedScheduleRows.find(r => r.id === id);
  if (row) {
    const d = Math.max(2, parseFloat(dia) || 12);
    row.branchDia = d;
    row.branchWidth = d;
    row.branchHeight = d;
    row.branchShape = 'round';
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function updateChainedBranchDims(id, w, h) {
  const row = chainedScheduleRows.find(r => r.id === id);
  if (row) {
    row.branchWidth = Math.max(2, parseFloat(w) || 16);
    row.branchHeight = Math.max(2, parseFloat(h) || 10);
    row.branchDia = Math.round(calcHuebscherDe(row.branchWidth, row.branchHeight) * 10) / 10 || 14;
    row.branchShape = 'rect';
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function updateChainedLeavingDims(id, w2, h2) {
  const row = chainedScheduleRows.find(r => r.id === id);
  if (row) {
    row.leavingWidth = Math.max(2, parseFloat(w2) || 16);
    row.leavingHeight = Math.max(2, parseFloat(h2) || 10);
    row.leavingShape = 'rect';
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function updateChainedLeavingDia(id, dia) {
  const row = chainedScheduleRows.find(r => r.id === id);
  if (row) {
    row.leavingDia = Math.max(2, parseFloat(dia) || 14);
    row.leavingWidth = row.leavingDia;
    row.leavingHeight = row.leavingDia;
    row.leavingShape = 'round';
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function updateChainedBaseEL(id, val) {
  const row = chainedScheduleRows.find(r => r.id === id);
  if (row) {
    row.baseEL = Math.max(0, parseFloat(val) || 0);
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function updateChainedPath(id, path) {
  const row = chainedScheduleRows.find(r => r.id === id);
  if (row) {
    row.path = path;
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function updateChainedName(id, name) {
  const row = chainedScheduleRows.find(r => r.id === id);
  if (row) {
    const trimmed = (name && name.trim()) ? name.trim() : '';
    if (trimmed === '' || trimmed.toLowerCase() === 'straight duct') {
      row.hasCustomName = false;
      if (row.type === 'straight_duct') {
        const dimLabel = (row.shape === 'round') ? `Ø ${row.dia || row.width}"` : `${row.width}" × ${row.height}"`;
        row.name = `Straight Duct (${dimLabel})`;
      } else {
        row.name = 'Component';
      }
    } else {
      row.hasCustomName = !isDefaultStraightDuctName(trimmed);
      row.name = trimmed;
    }
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
    renderFittingsTable();
  }
}

function moveChainedRow(id, dir) {
  const idx = chainedScheduleRows.findIndex(r => r.id === id);
  if (idx < 0) return;
  const targetIdx = idx + dir;
  if (targetIdx < 0 || targetIdx >= chainedScheduleRows.length) return;

  const temp = chainedScheduleRows[idx];
  chainedScheduleRows[idx] = chainedScheduleRows[targetIdx];
  chainedScheduleRows[targetIdx] = temp;
  window.tool6_modified = true;

  calculateDuctLoss();
  renderFittingsTable();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function duplicateChainedRow(id) {
  const idx = chainedScheduleRows.findIndex(r => r.id === id);
  if (idx < 0) return;
  const dup = JSON.parse(JSON.stringify(chainedScheduleRows[idx]));
  dup.id = chainedScheduleRowIdCounter++;
  chainedScheduleRows.splice(idx + 1, 0, dup);
  window.tool6_modified = true;

  calculateDuctLoss();
  renderFittingsTable();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function deleteChainedRow(id) {
  chainedScheduleRows = chainedScheduleRows.filter(r => r.id !== id);
  window.tool6_modified = true;
  calculateDuctLoss();
  renderFittingsTable();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function clearAllChainedSchedule() {
  if (confirm("Clear all items from the chained critical path schedule?")) {
    chainedScheduleRows = [];
    chainedScheduleRowIdCounter = 1;
    if (Array.isArray(componentRows)) {
      componentRows = [];
      componentRowIdCounter = 1;
    }
    window.tool6_modified = true;
    renderComponentsTable();
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

// -------------------------------------------------------------------
// COMPONENT PRESSURE DROPS TABLE MANAGEMENT
// -------------------------------------------------------------------
function renderComponentsTable() {
  const tbody = document.getElementById('componentsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (componentRows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="p-4 text-center text-slate-400 font-sans text-xs">
          No component losses entered. Click <strong>+ Add Component</strong> to include diffusers, grilles, or filters.
        </td>
      </tr>
    `;
    calculateDuctLoss();
    return;
  }

  componentRows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-800/40 transition-colors border-b border-slate-800/60";
    tr.innerHTML = `
      <td class="p-2.5">
        <input type="text" value="${row.name}" onchange="updateComponentName(${row.id}, this.value)"
          class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs font-bold text-white outline-none focus:border-rose-500">
      </td>
      <td class="p-2.5 text-center">
        <input type="number" min="0" max="50" step="1" value="${row.qty}" onchange="updateComponentQty(${row.id}, this.value)"
          class="w-16 text-center bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs font-bold text-white mono outline-none focus:border-rose-500">
      </td>
      <td class="p-2.5 text-center">
        <input type="number" min="0" max="5" step="0.01" value="${row.dp}" onchange="updateComponentDP(${row.id}, this.value)"
          class="component-dp-input w-20 text-center bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs font-bold text-rose-400 mono outline-none focus:border-rose-500">
      </td>
      <td class="p-2.5 text-right font-mono text-xs font-bold component-subtotal-val text-slate-200">
        ${(row.qty * row.dp).toFixed(2)}"
      </td>
      <td class="p-2.5 text-center">
        <button type="button" onclick="deleteComponentRow(${row.id})" class="btn-delete-row p-1.5 rounded" title="Delete component">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  calculateDuctLoss();
}

function addComponentRow(name = 'Inline Device', qty = 1, dp = 0.10) {
  componentRows.push({
    id: componentRowIdCounter++,
    name: name,
    qty: qty,
    dp: dp
  });
  renderComponentsTable();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

function updateComponentName(id, name) {
  const c = componentRows.find(r => r.id === id);
  if (c) {
    c.name = name;
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function updateComponentQty(id, qty) {
  const c = componentRows.find(r => r.id === id);
  if (c) {
    const parsed = parseInt(qty, 10);
    c.qty = isNaN(parsed) ? 0 : Math.max(0, parsed);
    renderComponentsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function updateComponentDP(id, dp) {
  const c = componentRows.find(r => r.id === id);
  if (c) {
    c.dp = Math.max(0, parseFloat(dp) || 0);
    renderComponentsTable();
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
  }
}

function deleteComponentRow(id) {
  componentRows = componentRows.filter(r => r.id !== id);
  renderComponentsTable();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

// -------------------------------------------------------------------
// 1-CLICK WORKED EXAMPLE LOADERS
// -------------------------------------------------------------------

// 1. Engineering Department Chained Example (3-Ton RTU 1200 -> 800 CFM)
function loadEngineeringChainedExample() {
  document.getElementById('ductLossCFM').value = 1200;

  chainedScheduleRowIdCounter = 1;
  chainedScheduleRows = [
    // 1. Straight Duct: 4' section of 18x12 leaves bottom of RTU
    {
      id: chainedScheduleRowIdCounter++,
      type: 'straight_duct',
      path: 'supply',
      name: 'Straight Duct (RTU Discharge Drop)',
      length: 4,
      width: 18,
      height: 12,
      shape: 'rect',
      baseEL: 4
    },
    // 2. Rectangular Mitered Elbow (With Vanes): turns horizontal
    {
      id: chainedScheduleRowIdCounter++,
      type: 'fitting',
      path: 'supply',
      name: '2a: Rect Mitered Elbow (With Vanes)',
      fittingKey: '2a_vanes',
      paramKey: '1.0',
      angle: '90',
      baseEL: 45
    },
    // 3. Straight Duct: 20' of 18x12 main trunk
    {
      id: chainedScheduleRowIdCounter++,
      type: 'straight_duct',
      path: 'supply',
      name: 'Straight Duct (Main Trunk Section 1)',
      length: 20,
      width: 18,
      height: 12,
      shape: 'rect',
      baseEL: 20
    },
    // 4. Diverging Tee Round Branch: 1200 CFM in, 400 CFM branch -> 800 CFM trunk
    {
      id: chainedScheduleRowIdCounter++,
      type: 'tee_branch',
      path: 'supply',
      name: '5f: Diverging Tee Round Branch (Trunk Path)',
      fittingKey: '5f_round_trunk',
      paramKey: 'Vb/Vt = 0.3 (Qb/Qt = 0.3)',
      angle: '90',
      branchCFM: 400,
      baseEL: 19
    },
    // 5. Contracting Flow (Rectangular) Transition: 18x12 -> 16x10 @ 800 CFM
    {
      id: chainedScheduleRowIdCounter++,
      type: 'transition',
      path: 'supply',
      name: '10b: Contracting Transition (18x12 → 16x10)',
      fittingKey: '10b_rect_contracting',
      paramKey: 'A1/A2=2, 30°',
      angle: '30',
      leavingWidth: 16,
      leavingHeight: 10,
      baseEL: 18
    },
    // 6. Straight Duct: 20' of 16x10 reduced trunk @ 800 CFM
    {
      id: chainedScheduleRowIdCounter++,
      type: 'straight_duct',
      path: 'supply',
      name: 'Straight Duct (Reduced Trunk Section 2)',
      length: 20,
      width: 16,
      height: 10,
      shape: 'rect',
      baseEL: 20
    },
    // 7. Rectangular Radius Elbow (With Vanes): turns to diffuser
    {
      id: chainedScheduleRowIdCounter++,
      type: 'fitting',
      path: 'supply',
      name: '3a: Rect Radius Elbow (With Vanes)',
      fittingKey: '3a_vanes',
      paramKey: 'R/W=0.50, H/W=1.0',
      angle: '90',
      baseEL: 2
    },
    // 8. 5 ft Smooth Radius Flex Elbow Drop
    {
      id: chainedScheduleRowIdCounter++,
      type: 'flex_drop',
      path: 'supply',
      name: '5 ft Smooth Radius Flex Elbow Drop',
      fittingKey: 'flex_elbow',
      paramKey: '5 ft Smooth Radius Elbow to Diffuser/Inlet',
      angle: '90',
      baseEL: 120
    }
  ];

  componentRowIdCounter = 1;
  componentRows = [
    { id: componentRowIdCounter++, name: 'Supply Terminal Diffuser', qty: 1, dp: 0.10 }
  ];

  calculateDuctLoss();
  renderFittingsTable();
  renderComponentsTable();
  if (typeof showToast === 'function') {
    showToast('Example Loaded', 'Loaded Engineering Chained Run (3-Ton RTU 1200 → 800 CFM).');
  }
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

// 2. Loren Cook Guide Page 52 Worked Example
function loadLorenCookRTUExample() {
  document.getElementById('ductLossCFM').value = 1200;

  chainedScheduleRowIdCounter = 1;
  chainedScheduleRows = [
    // Supply Run Straight Duct
    { id: chainedScheduleRowIdCounter++, type: 'straight_duct', path: 'supply', name: 'Supply Main Straight Duct', length: 55, width: 18, height: 12, shape: 'rect', baseEL: 55 },
    // Supply Fittings
    { id: chainedScheduleRowIdCounter++, type: 'fitting', path: 'supply', name: '2a: Rect Mitered Elbow (With Vanes)', fittingKey: '2a_vanes', paramKey: '1.0', angle: '90', baseEL: 45 },
    { id: chainedScheduleRowIdCounter++, type: 'tee_branch', path: 'supply', name: '5f: Diverging Tee Round Trunk (Branch 1)', fittingKey: '5f_round_trunk', paramKey: 'Vb/Vt = 0.3 (Qb/Qt = 0.3)', angle: '90', branchCFM: 360, baseEL: 19 },
    { id: chainedScheduleRowIdCounter++, type: 'tee_branch', path: 'supply', name: '5f: Diverging Tee Round Trunk (Branch 2)', fittingKey: '5f_round_trunk', paramKey: 'Vb/Vt = 0.5 (Qb/Qt = 0.5)', angle: '90', branchCFM: 400, baseEL: 10 },
    { id: chainedScheduleRowIdCounter++, type: 'tee_branch', path: 'supply', name: '5f: Diverging Tee Round Trunk (Branch 3)', fittingKey: '5f_round_trunk', paramKey: 'Vb/Vt = 1.0 (Qb/Qt = 1.0)', angle: '90', branchCFM: 440, baseEL: 0 },
    { id: chainedScheduleRowIdCounter++, type: 'flex_drop', path: 'supply', name: '5 ft Smooth Radius Flex Elbow Drop', fittingKey: 'flex_elbow', paramKey: '5 ft Smooth Radius Elbow to Diffuser/Inlet', angle: '90', baseEL: 120 },

    // Return Run Straight Duct
    { id: chainedScheduleRowIdCounter++, type: 'straight_duct', path: 'return', name: 'Return Main Straight Duct', length: 48, width: 18, height: 12, shape: 'rect', baseEL: 48 },
    // Return Fittings
    { id: chainedScheduleRowIdCounter++, type: 'flex_drop', path: 'return', name: 'Flex Elbow (Return Intake)', fittingKey: 'flex_elbow', paramKey: '5 ft Smooth Radius Elbow to Diffuser/Inlet', angle: '90', baseEL: 120 },
    { id: chainedScheduleRowIdCounter++, type: 'fitting', path: 'return', name: '1a: 90° Smooth Radius Elbow', fittingKey: '1a_90_smooth', paramKey: '1.0', angle: '90', baseEL: 25 },
    { id: chainedScheduleRowIdCounter++, type: 'transition', path: 'return', name: '9c: Round to Rect Transition', fittingKey: '9c_round_to_rect', paramKey: 'A1/A2=2, 90°', angle: '90', leavingWidth: 18, leavingHeight: 12, baseEL: 36 },
    { id: chainedScheduleRowIdCounter++, type: 'tee_branch', path: 'return', name: '4d: Converging Tee Rect Trunk (Branch 1)', fittingKey: '4d_rect_trunk', paramKey: 'Qb/Qt = 0.5', angle: '90', branchCFM: 600, baseEL: 60 },
    { id: chainedScheduleRowIdCounter++, type: 'tee_branch', path: 'return', name: '4d: Converging Tee Rect Trunk (Branch 2)', fittingKey: '4d_rect_trunk', paramKey: 'Qb/Qt = 0.3', angle: '90', branchCFM: 360, baseEL: 43 },
    { id: chainedScheduleRowIdCounter++, type: 'fitting', path: 'return', name: '2a: Rect Mitered Elbow (With Vanes)', fittingKey: '2a_vanes', paramKey: '1.0', angle: '90', baseEL: 45 }
  ];

  componentRowIdCounter = 1;
  componentRows = [
    { id: componentRowIdCounter++, name: 'Supply Diffuser', qty: 1, dp: 0.10 },
    { id: componentRowIdCounter++, name: 'Return Grille / Diffuser', qty: 1, dp: 0.10 },
    { id: componentRowIdCounter++, name: 'Air Filter', qty: 1, dp: 0.10 }
  ];

  calculateDuctLoss();
  renderFittingsTable();
  renderComponentsTable();
  if (typeof showToast === 'function') {
    showToast('Example Loaded', 'Loaded Loren Cook 3-Ton RTU Worked Example (Pages 51-52).');
  }
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

// -------------------------------------------------------------------
// QUICK ADD MODAL / PICKER FOR FITTINGS
// -------------------------------------------------------------------
function findCategoryForFittingKey(fittingKey) {
  if (!fittingKey) return 'roundElbows';
  const k = String(fittingKey).toLowerCase();
  if (k === '10a' || k.startsWith('10a')) return 'transitionsExpanding';
  if (k === '10b' || k.startsWith('10b') || k === '10c' || k.startsWith('10c')) return 'transitionsContracting';
  if (k.startsWith('9')) return 'transitionsExpanding';

  const categoryKeys = [
    'roundElbows',
    'rectMitered',
    'rectRadius',
    'convergingTeeRect',
    'divergingTeeRect',
    'teeRound90',
    'divergingTeeRound',
    'wye',
    'transitionsExpanding',
    'transitionsContracting',
    'presetsSpecial'
  ];
  for (const cat of categoryKeys) {
    if (DUCT_LOSS_DATA[cat] && DUCT_LOSS_DATA[cat][fittingKey]) {
      return cat;
    }
  }
  return 'roundElbows';
}

// -------------------------------------------------------------------
// QUICK ADD DROPDOWN PICKER FOR FITTINGS & CUSTOM FITTINGS
// -------------------------------------------------------------------
function toggleAddFittingDropdown(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('addFittingDropdownMenu');
  const chevron = document.getElementById('addFittingChevron');
  if (!menu) return;
  const isHidden = menu.classList.contains('hidden');
  if (isHidden) {
    menu.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
    const search = document.getElementById('addFittingSearchInput');
    if (search) {
      search.value = '';
      filterAddFittingDropdown('');
      setTimeout(() => search.focus(), 50);
    }
  } else {
    menu.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }
}

function closeAddFittingDropdown() {
  const menu = document.getElementById('addFittingDropdownMenu');
  const chevron = document.getElementById('addFittingChevron');
  if (menu) menu.classList.add('hidden');
  if (chevron) chevron.classList.remove('rotate-180');
}

function selectFittingFromDropdown(key) {
  closeAddFittingDropdown();
  openAddFittingModal(key);
}

function filterAddFittingDropdown(query) {
  const q = (query || '').toLowerCase().trim();
  const groups = document.querySelectorAll('.dropdown-category-group');
  groups.forEach(group => {
    const items = group.querySelectorAll('.dropdown-fitting-item');
    let groupHasMatch = false;
    items.forEach(item => {
      const name = item.getAttribute('data-name') || '';
      const key = item.getAttribute('data-key') || '';
      if (!q || name.includes(q) || key.includes(q)) {
        item.classList.remove('hidden');
        groupHasMatch = true;
      } else {
        item.classList.add('hidden');
      }
    });
    if (groupHasMatch) {
      group.classList.remove('hidden');
    } else {
      group.classList.add('hidden');
    }
  });
}

function populateAddFittingDropdown() {
  const container = document.getElementById('addFittingDropdownItems');
  if (!container) return;

  const categories = [
    { key: 'roundElbows', label: '1. Round Elbows (1a-1f)', icon: 'fa-circle-notch' },
    { key: 'rectMitered', label: '2. Rectangular Mitered Elbows (2a-2c)', icon: 'fa-square' },
    { key: 'rectRadius', label: '3. Rectangular Radius Elbows (3a-3c)', icon: 'fa-vector-square' },
    { key: 'convergingTeeRect', label: '4. Converging Tee Rect Trunk (4a-4f)', icon: 'fa-compress' },
    { key: 'divergingTeeRect', label: '5. Diverging Tee Rect Trunk (5a-5f)', icon: 'fa-expand' },
    { key: 'teeRound90', label: '6. Tee Round 90° (6a-6d)', icon: 'fa-arrows-split-up-and-left' },
    { key: 'divergingTeeRound', label: '7. Diverging Tee Round Trunk (7a-7f)', icon: 'fa-turn-up' },
    { key: 'wye', label: '8. Wye Pair of Pants (8a-8b)', icon: 'fa-code-branch' },
    { key: 'transitionsExpanding', label: '9. Transitions Expanding (9a-9d, 10a)', icon: 'fa-maximize' },
    { key: 'transitionsContracting', label: '10. Transitions Contracting (10b-10c)', icon: 'fa-minimize' },
    { key: 'presetsSpecial', label: '11. Flex Duct & Presets', icon: 'fa-grip-lines' }
  ];

  let html = '';
  categories.forEach(cat => {
    const grp = DUCT_LOSS_DATA[cat.key];
    if (!grp) return;
    const fittingKeys = Object.keys(grp).filter(k => k !== 'custom_fitting');
    if (fittingKeys.length === 0) return;

    html += `
      <div class="dropdown-category-group" data-category="${cat.key}">
        <div class="dropdown-category-header text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 rounded bg-slate-800/60 mb-1 flex items-center gap-1.5">
          <i class="fa-solid ${cat.icon} text-rose-400 text-[9px]"></i> ${cat.label}
        </div>
        <div class="space-y-0.5">
    `;

    fittingKeys.forEach(k => {
      const def = grp[k];
      const matchPrefix = k.match(/^(\d+[a-z]?)/i);
      const badge = matchPrefix ? matchPrefix[1].toUpperCase() : '';
      html += `
        <button type="button" onclick="selectFittingFromDropdown('${k}')" data-name="${def.name.toLowerCase()}" data-key="${k.toLowerCase()}"
          class="dropdown-fitting-item w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-600/15 hover:text-rose-300 text-slate-200 text-xs flex items-center justify-between transition group">
          <span class="truncate flex items-center gap-1.5">
            ${badge ? `<span class="badge-fitting-cat px-1.5 py-0.2 rounded text-[9px] font-mono">${badge}</span>` : ''}
            <span class="truncate font-medium">${def.name}</span>
          </span>
          <i class="fa-solid fa-chevron-right text-[9px] text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-1"></i>
        </button>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function onModalInitialShapeChange() {
  const shape = document.getElementById('modalInitialShape')?.value || 'rect';
  const rectCol = document.getElementById('modalInitialRectDimsCol');
  const roundCol = document.getElementById('modalInitialRoundDimsCol');
  if (shape === 'round') {
    if (rectCol) rectCol.classList.add('hidden');
    if (roundCol) roundCol.classList.remove('hidden');
  } else {
    if (rectCol) rectCol.classList.remove('hidden');
    if (roundCol) roundCol.classList.add('hidden');
  }
  updateModalInitialCriteriaReadout();
  updateModalFittingAerodynamics();
}

function updateModalInitialCriteriaReadout() {
  const velEl = document.getElementById('modalInitialCalcVel');
  const dflEl = document.getElementById('modalInitialCalcDFL');
  if (!velEl && !dflEl) return;

  const shape = document.getElementById('modalInitialShape')?.value || 'rect';
  const w = Math.max(2, parseFloat(document.getElementById('modalInitialWidth')?.value) || 18);
  const h = Math.max(2, parseFloat(document.getElementById('modalInitialHeight')?.value) || 12);
  const dia = Math.max(2, parseFloat(document.getElementById('modalInitialDia')?.value) || 14);
  const cfm = Math.max(10, parseFloat(document.getElementById('modalInitialCFM')?.value) || parseFloat(document.getElementById('ductLossCFM')?.value) || 1200);

  const area = calcDuctArea(w, h, shape, dia);
  const de = (shape === 'round') ? dia : calcHuebscherDe(w, h);
  const vel = calcDuctVelocity(cfm, area);
  const friction = calcStraightDuctFrictionRate(cfm, de);

  if (velEl) velEl.textContent = `${Math.round(vel).toLocaleString()} FPM`;
  if (dflEl) dflEl.textContent = `${friction.toFixed(3)}" / 100'`;

  // Sync to geometry controls if starting schedule with fitting
  if (chainedScheduleRows.length === 0) {
    if (shape === 'round') {
      const rDia = document.getElementById('modalRoundDia');
      if (rDia && parseFloat(rDia.value) !== dia) {
        rDia.value = dia;
        const rRad = document.getElementById('modalRoundRadius');
        if (rRad && (!rRad.value || parseFloat(rRad.value) === 21)) {
          rRad.value = Math.round(dia * 1.5 * 10) / 10;
        }
      }
    } else {
      const elbW = document.getElementById('modalElbowWidth');
      const elbH = document.getElementById('modalElbowHeight');
      if (elbW && parseFloat(elbW.value) !== w) elbW.value = w;
      if (elbH && parseFloat(elbH.value) !== h) elbH.value = h;
    }
  }
  updateModalFittingAerodynamics();
}

function openAddFittingModal(preselectedKey = null, defaultPath = null) {
  const modal = document.getElementById('addFittingModal');
  if (!modal) return;

  try {
    editingFittingRowId = null;

    const titleEl = document.getElementById('addFittingModalTitle');
    const submitBtnText = document.getElementById('btnAddFittingSubmitText');
    const submitBtnIcon = document.getElementById('btnAddFittingSubmitIcon');
    if (titleEl) titleEl.textContent = 'Add Fitting to Schedule';
    if (submitBtnText) submitBtnText.textContent = 'Add to Schedule';
    if (submitBtnIcon) submitBtnIcon.className = 'fa-solid fa-plus';

    const isScheduleEmpty = (chainedScheduleRows.length === 0);
    const initSection = document.getElementById('modalInitialCriteriaSection');
    const upstreamBanner = document.getElementById('modalUpstreamBanner');

    let effectiveKey = preselectedKey || '1a_90_smooth';
    if (effectiveKey === '10a') effectiveKey = '10a_rect_straight_sides';
    if (effectiveKey === '10b') effectiveKey = '10b_rect_contracting';
    if (effectiveKey === '10c' || effectiveKey === '10c_rect_straight_sides') effectiveKey = '10c_round_contracting';

    if (isScheduleEmpty) {
      if (initSection) {
        initSection.classList.remove('hidden');
        const initialCFMEl = document.getElementById('modalInitialCFM');
        if (initialCFMEl) {
          initialCFMEl.value = document.getElementById('ductLossCFM')?.value || 1200;
        }
        const initShapeEl = document.getElementById('modalInitialShape');
        if (initShapeEl) {
          initShapeEl.value = isRoundFitting(effectiveKey) ? 'round' : 'rect';
        }
        onModalInitialShapeChange();
      }
      if (upstreamBanner) upstreamBanner.classList.add('hidden');
    } else {
      if (initSection) initSection.classList.add('hidden');
      if (upstreamBanner) {
        upstreamBanner.classList.remove('hidden');
        const curDims = getCurrentDownstreamDims();
        const curCFM = getCurrentDownstreamCFM();
        const area = calcDuctArea(curDims.w, curDims.h, curDims.shape, curDims.dia);
        const de = (curDims.shape === 'round') ? curDims.dia : calcHuebscherDe(curDims.w, curDims.h);
        const vel = calcDuctVelocity(curCFM, area);
        const dfl = calcStraightDuctFrictionRate(curCFM, de);

        const dimsText = document.getElementById('modalUpstreamDimsText');
        const velText = document.getElementById('modalUpstreamVelText');
        const dflText = document.getElementById('modalUpstreamDFLText');
        if (dimsText) dimsText.textContent = `${curDims.shape === 'round' ? 'Ø ' + curDims.dia + '" Round' : curDims.w + '" × ' + curDims.h + '" Rect'} (${Math.round(curCFM).toLocaleString()} CFM)`;
        if (velText) velText.textContent = `${Math.round(vel).toLocaleString()} FPM`;
        if (dflText) dflText.textContent = `${dfl.toFixed(3)}" / 100'`;

        // Pre-populate fitting geometry inputs
        const elbW = document.getElementById('modalElbowWidth');
        const elbH = document.getElementById('modalElbowHeight');
        const rDia = document.getElementById('modalRoundDia');
        const rRad = document.getElementById('modalRoundRadius');
        const rrW = document.getElementById('modalRectRadiusW');
        const rrH = document.getElementById('modalRectRadiusH');
        const rrR = document.getElementById('modalRectRadiusR');

        if (elbW) elbW.value = curDims.w || 20;
        if (elbH) elbH.value = curDims.h || 12;
        if (rDia) rDia.value = (curDims.shape === 'round') ? (curDims.dia || 14) : Math.round(calcHuebscherDe(curDims.w, curDims.h) * 10) / 10;
        if (rRad) rRad.value = Math.round((parseFloat(rDia?.value) || 14) * 1.5 * 10) / 10;
        if (rrW) rrW.value = curDims.w || 20;
        if (rrH) rrH.value = curDims.h || 12;
        if (rrR) rrR.value = curDims.w || 20;

        const brCFM = document.getElementById('modalBranchCFM');
        if (brCFM && (!brCFM.value || brCFM.value === '')) {
          brCFM.value = Math.round(curCFM * 0.3) || 400;
        }
      }
    }

    if ((effectiveKey.startsWith('10a') || effectiveKey.startsWith('10b')) && isScheduleEmpty) {
      const initShapeEl = document.getElementById('modalInitialShape');
      if (initShapeEl) initShapeEl.value = 'rect';
      onModalInitialShapeChange();
    } else if (effectiveKey.startsWith('10c') && isScheduleEmpty) {
      const initShapeEl = document.getElementById('modalInitialShape');
      if (initShapeEl) initShapeEl.value = 'round';
      onModalInitialShapeChange();
    }

    const catKey = (effectiveKey === 'custom_fitting') ? 'presetsSpecial' : findCategoryForFittingKey(effectiveKey);

    const catEl = document.getElementById('modalFittingCategory');
    const typeEl = document.getElementById('modalFittingType');
    if (catEl && catEl.tagName === 'SELECT') {
      if (catEl.options.length === 0) {
        populateAddFittingCategorySelect();
      }
      catEl.value = catKey;
      const grp = DUCT_LOSS_DATA[catKey] || {};
      if (typeEl && typeEl.tagName === 'SELECT') {
        typeEl.innerHTML = Object.keys(grp).map(k => {
          return `<option value="${k}">${grp[k].name}</option>`;
        }).join('');
        typeEl.value = effectiveKey;
      }
    } else {
      if (catEl) catEl.value = catKey;
      if (typeEl) typeEl.value = effectiveKey;
    }

    // Set default path if provided, or default intelligently: inherit from last schedule item if available
    const pathSelect = document.getElementById('modalFittingPath');
    if (pathSelect) {
      if (defaultPath) {
        pathSelect.value = defaultPath;
      } else if (chainedScheduleRows.length > 0) {
        pathSelect.value = chainedScheduleRows[chainedScheduleRows.length - 1].path || 'supply';
      } else if (preselectedKey) {
        if (preselectedKey.startsWith('4') || preselectedKey.startsWith('6a') || preselectedKey.startsWith('6c') || preselectedKey.startsWith('8b')) {
          pathSelect.value = 'return';
        } else {
          pathSelect.value = 'supply';
        }
      } else {
        pathSelect.value = 'supply';
      }
    }

    // Reset quantity to 1
    const qtyInput = document.getElementById('modalFittingQty');
    if (qtyInput) {
      qtyInput.value = 1;
    }

    // Reset angle to 90
    const angleSelect = document.getElementById('modalFittingAngle');
    if (angleSelect) {
      angleSelect.value = '90';
    }

    onModalTypeChange();
  } catch (err) {
    console.error('Error opening add fitting modal:', err);
  } finally {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lockBodyScroll();
  }
}

function openEditFittingModal(row) {
  const modal = document.getElementById('addFittingModal');
  if (!modal) return;

  try {
    editingFittingRowId = row.id;

    const rowIdx = chainedScheduleRows.findIndex(r => r.id === row.id);
    const titleEl = document.getElementById('addFittingModalTitle');
    const submitBtnText = document.getElementById('btnAddFittingSubmitText');
    const submitBtnIcon = document.getElementById('btnAddFittingSubmitIcon');
    if (titleEl) titleEl.textContent = `Edit Fitting: ${row.name || 'Fitting'} (Row #${rowIdx + 1})`;
    if (submitBtnText) submitBtnText.textContent = 'Save Changes';
    if (submitBtnIcon) submitBtnIcon.className = 'fa-solid fa-floppy-disk';

    // Hide initial criteria section in edit mode
    document.getElementById('modalInitialCriteriaSection')?.classList.add('hidden');

    const fittingKey = row.fittingKey || 'custom_fitting';
    const isCustom = (row.type === 'custom_fitting' || fittingKey === 'custom_fitting');
    const catKey = isCustom ? 'presetsSpecial' : findCategoryForFittingKey(fittingKey);

    const catEl = document.getElementById('modalFittingCategory');
    const typeEl = document.getElementById('modalFittingType');
    if (catEl && catEl.tagName === 'SELECT') {
      if (catEl.options.length === 0) {
        populateAddFittingCategorySelect();
      }
      catEl.value = catKey;
      const grp = DUCT_LOSS_DATA[catKey] || {};
      if (typeEl && typeEl.tagName === 'SELECT') {
        typeEl.innerHTML = Object.keys(grp).map(k => {
          return `<option value="${k}">${grp[k].name}</option>`;
        }).join('');
        typeEl.value = fittingKey;
      }
    } else {
      if (catEl) catEl.value = catKey;
      if (typeEl) typeEl.value = fittingKey;
    }

    const pathSelect = document.getElementById('modalFittingPath');
    if (pathSelect) pathSelect.value = row.path || 'supply';

    const qtyInput = document.getElementById('modalFittingQty');
    if (qtyInput) qtyInput.value = 1;

    const angleSelect = document.getElementById('modalFittingAngle');
    if (angleSelect) angleSelect.value = row.angle || '90';

    onModalTypeChange();

    // Populate geometry fields from saved row
    if (isRoundFitting(fittingKey)) {
      const rDia = document.getElementById('modalRoundDia');
      const rRad = document.getElementById('modalRoundRadius');
      if (rDia) rDia.value = row.dia || row.width || 14;
      if (rRad) rRad.value = row.radius || ((row.dia || row.width || 14) * 1.5);
    } else if (fittingKey.startsWith('3')) {
      const rrW = document.getElementById('modalRectRadiusW');
      const rrH = document.getElementById('modalRectRadiusH');
      const rrR = document.getElementById('modalRectRadiusR');
      if (rrW) rrW.value = row.width || 20;
      if (rrH) rrH.value = row.height || 12;
      if (rrR) rrR.value = row.radius || row.width || 20;
      const vSelect = document.getElementById('modalFittingVanesSelect');
      if (vSelect && row.isVanes !== undefined) vSelect.value = row.isVanes ? 'with_vanes' : 'without_vanes';
    } else if (isRectFitting(fittingKey)) {
      const elbW = document.getElementById('modalElbowWidth');
      const elbH = document.getElementById('modalElbowHeight');
      if (elbW) elbW.value = row.width || 20;
      if (elbH) elbH.value = row.height || 12;
      const vSelect = document.getElementById('modalFittingVanesSelect');
      if (vSelect && row.isVanes !== undefined) vSelect.value = row.isVanes ? 'with_vanes' : 'without_vanes';
    }

    // Pre-populate parameter key
    const paramSelect = document.getElementById('modalFittingParam');
    if (paramSelect && row.paramKey) {
      paramSelect.value = row.paramKey;
    }

    if (isCustom) {
      const customNameInput = document.getElementById('modalCustomName');
      const customELInput = document.getElementById('modalCustomEL');
      if (customNameInput) customNameInput.value = row.name || '';
      if (customELInput) customELInput.value = row.baseEL || 0;
    }

    if (row.type === 'tee_branch' || isTeeFitting(fittingKey)) {
      const branchInput = document.getElementById('modalBranchCFM');
      if (branchInput) branchInput.value = row.branchCFM || 0;
      const contSelect = document.getElementById('modalTeePathContinuation');
      if (contSelect) contSelect.value = isBranchTakeoffFitting(fittingKey) ? 'branch' : (row.teeContinuation || 'trunk');
      const bW = document.getElementById('modalTeeBranchWidth');
      const bH = document.getElementById('modalTeeBranchHeight');
      if (bW && row.branchWidth) bW.value = row.branchWidth;
      if (bH && row.branchHeight) bH.value = row.branchHeight;
      const bDia = document.getElementById('modalTeeBranchDia');
      if (bDia) {
        if (row.branchDia) bDia.value = row.branchDia;
        else if (row.branchWidth) bDia.value = row.branchWidth;
      }
      updateModalTeeFlowReadout();
      onModalTeeBranchDimsInput();
    }

    if (row.type === 'transition' || isTransitionFitting(fittingKey)) {
      const wInput = document.getElementById('modalLeavingWidth');
      const hInput = document.getElementById('modalLeavingHeight');
      const diaInput = document.getElementById('modalLeavingDia');
      const angleSelect = document.getElementById('modalTransitionAngleSelect');
      if (wInput && row.leavingWidth) wInput.value = row.leavingWidth;
      if (hInput && row.leavingHeight) hInput.value = row.leavingHeight;
      if (diaInput && row.leavingDia) diaInput.value = row.leavingDia;
      if (angleSelect && row.transAngle) angleSelect.value = row.transAngle;
      updateModalTransitionCalculations();
    }

    updateModalFittingAerodynamics();
    updateModalEquivalentHint();
  } catch (err) {
    console.error('Error opening edit fitting modal:', err);
  } finally {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lockBodyScroll();
  }
}

function closeAddFittingModal() {
  const modal = document.getElementById('addFittingModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  unlockBodyScroll();
  editingFittingRowId = null;

  const titleEl = document.getElementById('addFittingModalTitle');
  const submitBtnText = document.getElementById('btnAddFittingSubmitText');
  const submitBtnIcon = document.getElementById('btnAddFittingSubmitIcon');
  if (titleEl) titleEl.textContent = 'Add Fitting to Schedule';
  if (submitBtnText) submitBtnText.textContent = 'Add to Schedule';
  if (submitBtnIcon) submitBtnIcon.className = 'fa-solid fa-plus';

  const mismatchBanner = document.getElementById('modalShapeMismatchBanner');
  if (mismatchBanner) mismatchBanner.classList.add('hidden');
}

function populateAddFittingCategorySelect() {
  const catSelect = document.getElementById('modalFittingCategory');
  if (!catSelect || catSelect.tagName !== 'SELECT') return;

  const categories = [
    { key: 'roundElbows', label: '1. Round Elbows (1a-1f)' },
    { key: 'rectMitered', label: '2. Rectangular Mitered Elbows (2a-2c)' },
    { key: 'rectRadius', label: '3. Rectangular Radius Elbows (3a-3c)' },
    { key: 'convergingTeeRect', label: '4. Converging Tee Rect Trunk (4a-4f)' },
    { key: 'divergingTeeRect', label: '5. Diverging Tee Rect Trunk (5a-5f)' },
    { key: 'teeRound90', label: '6. Tee Round 90° (6a-6d)' },
    { key: 'divergingTeeRound', label: '7. Diverging Tee Round Trunk (7a-7f)' },
    { key: 'wye', label: '8. Wye Pair of Pants (8a-8b)' },
    { key: 'transitionsExpanding', label: '9. Transitions Expanding (9a-9d, 10a)' },
    { key: 'transitionsContracting', label: '10. Transitions Contracting (10b-10c)' },
    { key: 'presetsSpecial', label: '11. Flex Duct & Presets' }
  ];

  catSelect.innerHTML = categories.map(c => `<option value="${c.key}">${c.label}</option>`).join('');
  onModalCategoryChange();
}

function onModalCategoryChange() {
  const catSelect = document.getElementById('modalFittingCategory');
  const typeSelect = document.getElementById('modalFittingType');
  if (!catSelect || !typeSelect || catSelect.tagName !== 'SELECT') return;

  const catKey = catSelect.value;
  const grp = DUCT_LOSS_DATA[catKey] || {};

  typeSelect.innerHTML = Object.keys(grp).map(k => {
    return `<option value="${k}">${grp[k].name}</option>`;
  }).join('');

  onModalTypeChange();
}

function populateTransitionAngleSelect(fittingKey, selectedAngle = null) {
  const angleSelect = document.getElementById('modalTransitionAngleSelect');
  if (!angleSelect) return;

  const isContracting = fittingKey.startsWith('10b') || fittingKey.startsWith('10c');
  let angles = [];

  if (isContracting) {
    angles = [
      { val: '10°', text: '10° Angle (Gradual)' },
      { val: '15-40°', text: '15°–40° (Standard 30°)' },
      { val: '50-60°', text: '50°–60° Angle' },
      { val: '90°', text: '90° Angle' },
      { val: '120°', text: '120° Angle' },
      { val: '150°', text: '150° Angle' },
      { val: '180°', text: '180° (Abrupt Collar / Flat)' }
    ];
  } else if (fittingKey.startsWith('10a')) {
    angles = [
      { val: '14°', text: '14° Angle (Gradual)' },
      { val: '20°', text: '20° Angle' },
      { val: '30°', text: '30° (Standard)' },
      { val: '45°', text: '45° Angle' },
      { val: '60°', text: '60° Angle' },
      { val: '90°', text: '90° Angle' },
      { val: '180°', text: '180° (Abrupt)' }
    ];
  } else {
    // 9a, 9b, 9c, 9d
    angles = [
      { val: '16°', text: '16° Angle (Gradual)' },
      { val: '20°', text: '20° Angle' },
      { val: '30°', text: '30° (Standard)' },
      { val: '45°', text: '45° Angle' },
      { val: '60°', text: '60° Angle' },
      { val: '90°', text: '90° Angle' },
      { val: '120°', text: '120° Angle' },
      { val: '180°', text: '180° (Abrupt)' }
    ];
  }

  angleSelect.innerHTML = angles.map(a => `<option value="${a.val}">${a.text}</option>`).join('');

  if (selectedAngle) {
    const match = angles.find(a => a.val === selectedAngle || selectedAngle.includes(a.val) || a.val.includes(selectedAngle));
    if (match) angleSelect.value = match.val;
  } else {
    angleSelect.value = isContracting ? '15-40°' : '30°';
  }
}

function onModalTransitionAngleChange() {
  updateModalTransitionCalculations();
}

function updateModalTransitionCalculations() {
  const typeKey = document.getElementById('modalFittingType')?.value || '';
  if (!typeKey.includes('trans') && !typeKey.startsWith('9') && !typeKey.startsWith('10')) return;

  const currentDims = getCurrentDownstreamDims();
  const currentCFM = getCurrentDownstreamCFM();
  const geom = getTransitionGeometry(typeKey);

  let a1 = 0;
  let a2 = 0;
  if (geom.upstream === 'round') {
    const d1 = (currentDims.shape === 'round') ? (currentDims.dia || currentDims.w) : 14;
    a1 = (Math.PI * Math.pow(d1, 2)) / 4.0;
  } else {
    a1 = currentDims.w * currentDims.h;
  }

  if (geom.downstream === 'round') {
    const d2 = parseFloat(document.getElementById('modalLeavingDia')?.value) || 12;
    a2 = (Math.PI * Math.pow(d2, 2)) / 4.0;
  } else {
    const w2 = parseFloat(document.getElementById('modalLeavingWidth')?.value) || currentDims.w;
    const h2 = parseFloat(document.getElementById('modalLeavingHeight')?.value) || currentDims.h;
    a2 = w2 * h2;
  }

  const ratio = (a1 > 0 && a2 > 0) ? (Math.max(a1, a2) / Math.min(a1, a2)) : 1.0;
  const ratioReadout = document.getElementById('modalTransRatioReadout');
  if (ratioReadout) {
    ratioReadout.textContent = `Area Ratio: ${ratio.toFixed(2)}:1 (A₁: ${Math.round(a1)} in², A₂: ${Math.round(a2)} in²)`;
  }

  const selectedAngle = document.getElementById('modalTransitionAngleSelect')?.value || (geom.isExpand ? '30°' : '15-40°');
  const match = lookupTransitionParamAndEL(typeKey, a1, a2, selectedAngle);

  const paramSelect = document.getElementById('modalFittingParam');
  if (paramSelect && match.paramKey) {
    paramSelect.value = match.paramKey;
  }

  updateModalEquivalentHint();
}

function onModalTeeBranchDimsInput() {
  try {
    const branchCFM = parseFloat(document.getElementById('modalBranchCFM')?.value) || 0;
    const typeKey = document.getElementById('modalFittingType')?.value || '';
    const bShape = getTeeBranchShape(typeKey);
    const readout = document.getElementById('modalTeeVbReadout');

    const curDims = getCurrentDownstreamDims();
    const enteringCFM = getCurrentDownstreamCFM();
    const trunkArea = calcDuctArea(curDims.w, curDims.h, curDims.shape, curDims.dia);
    const vt = trunkArea > 0 ? (enteringCFM / trunkArea) * 144 : 1000;

    let branchArea = 0;
    let vb = vt;

    if (bShape === 'round') {
      const bDia = parseFloat(document.getElementById('modalTeeBranchDia')?.value);
      if (!isNaN(bDia) && bDia > 0) {
        branchArea = (Math.PI * Math.pow(bDia, 2)) / 4.0;
        if (branchCFM > 0) vb = (branchCFM / branchArea) * 144;
      }
    } else {
      const bW = parseFloat(document.getElementById('modalTeeBranchWidth')?.value);
      const bH = parseFloat(document.getElementById('modalTeeBranchHeight')?.value);
      if (!isNaN(bW) && bW > 0 && !isNaN(bH) && bH > 0) {
        branchArea = bW * bH;
        if (branchCFM > 0) vb = (branchCFM / branchArea) * 144;
      }
    }

    if (branchArea > 0 && branchCFM > 0) {
      const vRatio = vt > 0 ? (vb / vt) : 1.0;
      if (readout) {
        readout.textContent = `Vb: ${Math.round(vb)} FPM (${vRatio.toFixed(2)}x Vt)`;
      }

      const calcVb = document.getElementById('calcInputVb');
      const calcVt = document.getElementById('calcInputVt');
      if (calcVb) calcVb.value = Math.round(vb);
      if (calcVt) calcVt.value = Math.round(vt);

      const map = getAllFittingsMap();
      const def = map[typeKey];
      if (def && def.options) {
        const best = findBestModalOption(typeKey, Object.keys(def.options), {
          qt: enteringCFM,
          qb: branchCFM,
          vt: vt,
          vb: vb,
          area1: trunkArea * 144,
          area2: branchArea
        });
        if (best && best.key) {
          const paramSelect = document.getElementById('modalFittingParam');
          if (paramSelect) paramSelect.value = best.key;
          updateModalEquivalentHint();
        }
      }
    } else if (branchCFM > 0) {
      if (readout) {
        readout.textContent = `Vb ≈ Vt (${Math.round(vt)} FPM)`;
      }
      const map = getAllFittingsMap();
      const def = map[typeKey];
      if (def && def.options) {
        const best = findBestModalOption(typeKey, Object.keys(def.options), {
          qt: enteringCFM,
          qb: branchCFM,
          vt: vt,
          vb: vt,
          area1: trunkArea * 144,
          area2: (trunkArea * 144) * (branchCFM / Math.max(1, enteringCFM))
        });
        if (best && best.key) {
          const paramSelect = document.getElementById('modalFittingParam');
          if (paramSelect) paramSelect.value = best.key;
          updateModalEquivalentHint();
        }
      }
    } else {
      if (readout) readout.textContent = `Vb: — FPM`;
    }
  } catch (err) {
    console.warn('onModalTeeBranchDimsInput warning:', err);
  }
}

function onModalTypeChange() {
  const typeEl = document.getElementById('modalFittingType');
  const catEl = document.getElementById('modalFittingCategory');
  const titleEl = document.getElementById('addFittingModalTitle');
  const geomControls = document.getElementById('modalGeometryControls');
  const customFields = document.getElementById('modalCustomFittingFields');
  const rectElbowRow = document.getElementById('modalRectElbowRow');
  const roundElbowRow = document.getElementById('modalRoundElbowRow');
  const rectRadiusRow = document.getElementById('modalRectRadiusRow');
  const angleRow = document.getElementById('modalFittingAngleRow');
  const vaneRow = document.getElementById('modalFittingVaneRow');
  const teeBranchRow = document.getElementById('modalTeeBranchRow');
  const transitionRow = document.getElementById('modalTransitionRow');
  if (!typeEl) return;

  const typeKey = typeEl.value;
  const isCustom = (typeKey === 'custom_fitting');
  const catKey = isCustom ? 'presetsSpecial' : (catEl ? catEl.value : findCategoryForFittingKey(typeKey));
  const def = (DUCT_LOSS_DATA[catKey] && DUCT_LOSS_DATA[catKey][typeKey]) ? DUCT_LOSS_DATA[catKey][typeKey] : null;

  const isTee = isTeeFitting(typeKey);
  const isTrans = isTransitionFitting(typeKey);

  if (isCustom) {
    if (geomControls) geomControls.classList.add('hidden');
    if (customFields) customFields.classList.remove('hidden');
    if (titleEl) titleEl.textContent = editingFittingRowId ? 'Edit Custom Fitting' : 'Add Custom Fitting to Schedule';
    const customNameInput = document.getElementById('modalCustomName');
    const customELInput = document.getElementById('modalCustomEL');
    const customCInput = document.getElementById('modalCustomCoefC');
    if (!editingFittingRowId) {
      if (customNameInput) customNameInput.value = '';
      if (customELInput) customELInput.value = '';
      if (customCInput) customCInput.value = '';
    }
    if (teeBranchRow) teeBranchRow.classList.add('hidden');
    if (transitionRow) transitionRow.classList.add('hidden');
  } else {
    if (geomControls) geomControls.classList.remove('hidden');
    if (customFields) customFields.classList.add('hidden');
    if (titleEl && def) {
      titleEl.textContent = editingFittingRowId ? `Edit: ${def.name || 'Fitting'}` : `Add to Schedule: ${def.name || 'Fitting'}`;
    }

    // Configure geometry specific rows
    if (rectElbowRow) {
      if (typeKey.startsWith('2')) rectElbowRow.classList.remove('hidden');
      else rectElbowRow.classList.add('hidden');
    }
    if (roundElbowRow) {
      if (/^1[a-f]/i.test(typeKey) && !typeKey.startsWith('10')) roundElbowRow.classList.remove('hidden');
      else roundElbowRow.classList.add('hidden');
    }
    if (rectRadiusRow) {
      if (typeKey.startsWith('3')) rectRadiusRow.classList.remove('hidden');
      else rectRadiusRow.classList.add('hidden');
    }
    if (angleRow) {
      if (def && def.hasAngleFactor) angleRow.classList.remove('hidden');
      else angleRow.classList.add('hidden');
    }
    if (vaneRow) {
      if (typeKey === '2c_tee_double' || typeKey === '3c_wye_double') vaneRow.classList.remove('hidden');
      else vaneRow.classList.add('hidden');
    }

    if (teeBranchRow) {
      if (isTee) {
        teeBranchRow.classList.remove('hidden');
        const enteringCFM = getCurrentDownstreamCFM();
        const branchInput = document.getElementById('modalBranchCFM');
        if (branchInput && (!branchInput.value || branchInput.value === '')) {
          branchInput.value = Math.min(400, Math.round(enteringCFM * 0.33));
        }

        const isBranchTakeoff = isBranchTakeoffFitting(typeKey);
        const contSelect = document.getElementById('modalTeePathContinuation');
        const noticeBadge = document.getElementById('modalTeeBranchNoticeBadge');
        if (isBranchTakeoff) {
          if (contSelect) contSelect.value = 'branch';
          if (noticeBadge) noticeBadge.classList.remove('hidden');
        } else {
          if (contSelect && !editingFittingRowId) contSelect.value = 'trunk';
          if (noticeBadge) noticeBadge.classList.add('hidden');
        }

        const bShape = getTeeBranchShape(typeKey);
        const rectCol = document.getElementById('modalTeeBranchRectCol');
        const roundCol = document.getElementById('modalTeeBranchRoundCol');
        const curDims = getCurrentDownstreamDims();

        if (bShape === 'round') {
          if (roundCol) roundCol.classList.remove('hidden');
          if (rectCol) rectCol.classList.add('hidden');
          const bDiaInput = document.getElementById('modalTeeBranchDia');
          if (bDiaInput && (!bDiaInput.value || bDiaInput.value === '')) {
            bDiaInput.value = (curDims.shape === 'round') ? Math.max(4, Math.round(curDims.dia * 0.75)) : Math.max(4, Math.round((curDims.w || 14) * 0.6));
          }
        } else {
          if (roundCol) roundCol.classList.add('hidden');
          if (rectCol) rectCol.classList.remove('hidden');
          const bWInput = document.getElementById('modalTeeBranchWidth');
          const bHInput = document.getElementById('modalTeeBranchHeight');
          if (bWInput && (!bWInput.value || bWInput.value === '')) {
            bWInput.value = Math.max(4, Math.round((curDims.w || 18) * 0.75));
          }
          if (bHInput && (!bHInput.value || bHInput.value === '')) {
            bHInput.value = curDims.h || 10;
          }
        }

        updateModalTeeFlowReadout();
        onModalTeeBranchDimsInput();
      } else {
        teeBranchRow.classList.add('hidden');
      }
    }

    if (transitionRow) {
      if (isTrans) {
        transitionRow.classList.remove('hidden');
        if (roundElbowRow) roundElbowRow.classList.add('hidden');
        if (rectElbowRow) rectElbowRow.classList.add('hidden');
        if (rectRadiusRow) rectRadiusRow.classList.add('hidden');

        const currentDims = getCurrentDownstreamDims();
        const currentCFM = getCurrentDownstreamCFM();
        const geom = getTransitionGeometry(typeKey);

        const readout = document.getElementById('modalTransEnteringReadout');
        if (readout) {
          if (geom.upstream === 'round') {
            const d = (currentDims.shape === 'round') ? (currentDims.dia || currentDims.w) : 14;
            readout.textContent = `Entering: ${Math.round(currentCFM)} CFM | Ø ${d}" (Round)`;
          } else {
            const w = (currentDims.shape === 'rect' && currentDims.w) ? currentDims.w : 18;
            const h = (currentDims.shape === 'rect' && currentDims.h) ? currentDims.h : 12;
            readout.textContent = `Entering: ${Math.round(currentCFM)} CFM | ${w}" × ${h}" (Rect)`;
          }
        }

        const rectCol = document.getElementById('modalTransLeavingRectCol');
        const roundCol = document.getElementById('modalTransLeavingRoundCol');
        const wInput = document.getElementById('modalLeavingWidth');
        const hInput = document.getElementById('modalLeavingHeight');
        const diaInput = document.getElementById('modalLeavingDia');

        if (geom.downstream === 'round') {
          if (roundCol) roundCol.classList.remove('hidden');
          if (rectCol) rectCol.classList.add('hidden');
          if (diaInput && (!diaInput.value || diaInput.value === '')) {
            const baseD = (geom.upstream === 'round' && currentDims.shape === 'round') ? (currentDims.dia || currentDims.w) : 14;
            diaInput.value = geom.isExpand ? Math.round(baseD * 1.4) : Math.max(4, Math.round(baseD * 0.7));
          }
        } else {
          if (roundCol) roundCol.classList.add('hidden');
          if (rectCol) rectCol.classList.remove('hidden');
          if (wInput && (!wInput.value || wInput.value === '')) {
            wInput.value = geom.isExpand ? Math.min(120, currentDims.w + 4) : Math.max(2, currentDims.w - 4);
          }
          if (hInput && (!hInput.value || hInput.value === '')) {
            hInput.value = geom.isExpand ? Math.min(120, currentDims.h + 2) : currentDims.h;
          }
        }

        populateTransitionAngleSelect(typeKey);
        updateModalTransitionCalculations();
      } else {
        transitionRow.classList.add('hidden');
      }
    }
  }

  // Update Modal Fitting Image Preview Card & live aerodynamics
  updateModalFittingImagePreview(def, typeKey);
  updateModalFittingAerodynamics();
  updateModalShapeMismatchWarning();
}

function updateModalShapeMismatchWarning() {
  const banner = document.getElementById('modalShapeMismatchBanner');
  if (!banner) return;

  const typeEl = document.getElementById('modalFittingType');
  if (!typeEl) {
    banner.classList.add('hidden');
    return;
  }
  const typeKey = typeEl.value;

  // Determine preceding ductwork leaving shape
  let prevShape = null;
  let prevDesc = '';
  if (editingFittingRowId !== null) {
    const rowIdx = chainedScheduleRows.findIndex(r => r.id === editingFittingRowId);
    if (rowIdx > 0) {
      const prevRow = chainedScheduleRows[rowIdx - 1];
      prevShape = getRowLeavingShape(prevRow);
      if (prevShape === 'round') {
        const d = prevRow.leavingDia || prevRow.dia || prevRow.width || 14;
        prevDesc = `Ø ${d}" Round`;
      } else {
        const w = prevRow.leavingWidth || prevRow.width || 18;
        const h = prevRow.leavingHeight || prevRow.height || 12;
        prevDesc = `${w}" × ${h}" Rect`;
      }
    }
  } else if (chainedScheduleRows.length > 0) {
    const prevRow = chainedScheduleRows[chainedScheduleRows.length - 1];
    prevShape = getRowLeavingShape(prevRow);
    const curDims = getCurrentDownstreamDims();
    if (prevShape === 'round') {
      const d = curDims.dia || curDims.w || 14;
      prevDesc = `Ø ${d}" Round`;
    } else {
      const w = curDims.w || 18;
      const h = curDims.h || 12;
      prevDesc = `${w}" × ${h}" Rect`;
    }
  }

  // If schedule is empty or this is the first fitting, no mismatch
  if (!prevShape) {
    banner.classList.add('hidden');
    return;
  }

  const enteringShape = getFittingEnteringShape(typeKey);
  if (!enteringShape) {
    banner.classList.add('hidden');
    return;
  }

  if (prevShape !== enteringShape) {
    const isRectToRound = (prevShape === 'rect' && enteringShape === 'round');
    const titleEl = document.getElementById('modalShapeMismatchTitle');
    const textEl = document.getElementById('modalShapeMismatchText');
    const btnText = document.getElementById('modalBtnQuickAddTransitionText');

    if (titleEl) {
      titleEl.textContent = isRectToRound
        ? 'Shape Mismatch: Rectangular → Round Transition Recommended'
        : 'Shape Mismatch: Round → Rectangular Transition Recommended';
    }

    if (textEl) {
      if (isRectToRound) {
        textEl.innerHTML = `Preceding ductwork is <strong>Rectangular</strong> (${prevDesc}), but the selected fitting is <strong>Round</strong>. To maintain aerodynamic continuity and standard construction, consider inserting a <strong>Rectangular-to-Round transition fitting (such as Fitting 9d)</strong> before this fitting.`;
      } else {
        textEl.innerHTML = `Preceding ductwork is <strong>Round</strong> (${prevDesc}), but the selected fitting is <strong>Rectangular</strong>. To maintain aerodynamic continuity and standard construction, consider inserting a <strong>Round-to-Rectangular transition fitting (such as Fitting 9c)</strong> before this fitting.`;
      }
    }

    if (btnText) {
      btnText.textContent = isRectToRound ? 'Switch to 9d (Rect → Round)' : 'Switch to 9c (Round → Rect)';
    }

    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

function quickSelectTransitionFitting() {
  const typeEl = document.getElementById('modalFittingType');
  const catEl = document.getElementById('modalFittingCategory');
  if (!typeEl || !catEl) return;

  let prevShape = 'rect';
  if (editingFittingRowId !== null) {
    const rowIdx = chainedScheduleRows.findIndex(r => r.id === editingFittingRowId);
    if (rowIdx > 0) {
      prevShape = getRowLeavingShape(chainedScheduleRows[rowIdx - 1]) || 'rect';
    }
  } else if (chainedScheduleRows.length > 0) {
    prevShape = getRowLeavingShape(chainedScheduleRows[chainedScheduleRows.length - 1]) || 'rect';
  }

  const targetCategory = 'transitionsExpanding';
  const targetFitting = (prevShape === 'rect') ? '9d_rect_to_round' : '9c_round_to_rect';

  catEl.value = targetCategory;
  const grp = DUCT_LOSS_DATA[targetCategory] || {};
  typeEl.innerHTML = Object.keys(grp).map(k => `<option value="${k}">${grp[k].name}</option>`).join('');
  typeEl.value = targetFitting;

  onModalTypeChange();

  if (typeof showToast === 'function') {
    const name = (targetFitting === '9d_rect_to_round') ? '9d: Rectangular to Round' : '9c: Round to Rectangular';
    showToast('Transition Selected', `Switched fitting to ${name}. Configure leaving dimensions below.`);
  }
}

function updateModalFittingAerodynamics() {
  const typeEl = document.getElementById('modalFittingType');
  if (!typeEl) return;
  const typeKey = typeEl.value;
  const angle = document.getElementById('modalFittingAngle')?.value || '90';
  const isVanes = (document.getElementById('modalFittingVanesSelect')?.value !== 'without_vanes');

  const curDims = getCurrentDownstreamDims();
  const curCFM = getCurrentDownstreamCFM();

  let inputs = {
    w: parseFloat(document.getElementById('modalElbowWidth')?.value) || curDims.w,
    h: parseFloat(document.getElementById('modalElbowHeight')?.value) || curDims.h,
    dia: parseFloat(document.getElementById('modalRoundDia')?.value) || curDims.dia,
    r: parseFloat(document.getElementById('modalRoundRadius')?.value) || (parseFloat(document.getElementById('modalRoundDia')?.value) * 1.5) || 21,
    qt: curCFM,
    qb: parseFloat(document.getElementById('modalBranchCFM')?.value) || 400,
    vt: 1000,
    vb: 1000,
    a1: 144,
    a2: 144,
    transAngle: document.getElementById('modalTransitionAngleSelect')?.value || '30',
    isVanes: isVanes,
    customEL: parseFloat(document.getElementById('modalCustomEL')?.value) || 20
  };

  if (typeKey.startsWith('3')) {
    inputs.w = parseFloat(document.getElementById('modalRectRadiusW')?.value) || curDims.w;
    inputs.h = parseFloat(document.getElementById('modalRectRadiusH')?.value) || curDims.h;
    inputs.r = parseFloat(document.getElementById('modalRectRadiusR')?.value) || inputs.w;
  }

  const upstreamArea = calcDuctArea(curDims.w, curDims.h, curDims.shape, curDims.dia);
  let enteringArea = upstreamArea;
  if (isRoundFitting(typeKey)) {
    enteringArea = calcDuctArea(inputs.dia, inputs.dia, 'round', inputs.dia);
  } else if (isRectFitting(typeKey) && !isTeeFitting(typeKey)) {
    enteringArea = calcDuctArea(inputs.w, inputs.h, 'rect');
  }
  inputs.vt = calcDuctVelocity(curCFM, enteringArea) || 1000;

  if (isTeeFitting(typeKey)) {
    const bShape = getTeeBranchShape(typeKey);
    let bArea = 0;
    if (bShape === 'round') {
      const bDia = parseFloat(document.getElementById('modalTeeBranchDia')?.value);
      if (!isNaN(bDia) && bDia > 0) {
        bArea = (Math.PI * Math.pow(bDia, 2)) / 4.0;
      }
    } else {
      const bW = parseFloat(document.getElementById('modalTeeBranchWidth')?.value);
      const bH = parseFloat(document.getElementById('modalTeeBranchHeight')?.value);
      if (!isNaN(bW) && bW > 0 && !isNaN(bH) && bH > 0) {
        bArea = bW * bH;
      }
    }
    if (bArea > 0 && inputs.qb > 0) {
      inputs.vb = calcDuctVelocity(inputs.qb, bArea / 144.0);
      inputs.a2 = bArea;
    } else {
      inputs.vb = inputs.vt;
      inputs.a2 = (upstreamArea * 144) * (inputs.qb / Math.max(1, inputs.qt));
    }
  }

  if (isTransitionFitting(typeKey)) {
    inputs.a1 = upstreamArea * 144;
    const geom = getTransitionGeometry(typeKey);
    let dnArea = 144;
    if (geom.downstream === 'round') {
      const d = parseFloat(document.getElementById('modalLeavingDia')?.value) || 12;
      dnArea = Math.PI * Math.pow(d / 2, 2);
    } else {
      const lw = parseFloat(document.getElementById('modalLeavingWidth')?.value) || 14;
      const lh = parseFloat(document.getElementById('modalLeavingHeight')?.value) || 12;
      dnArea = lw * lh;
    }
    inputs.a2 = dnArea;
  }

  const result = calcContinuousFittingEL(typeKey, inputs, angle);

  const paramInput = document.getElementById('modalFittingParam');
  if (paramInput) paramInput.value = result.ratioLabel || '—';

  const ratioBadge = document.getElementById('modalTrueRatioBadge');
  const elDisplay = document.getElementById('modalTrueELDisplay');
  const lossDisplay = document.getElementById('modalTrueLossDisplay');
  const hintEl = document.getElementById('modalFittingEquivalentHint');
  const qtyInput = document.getElementById('modalFittingQty');
  const qty = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);

  if (ratioBadge) ratioBadge.textContent = result.ratioLabel || '—';
  if (elDisplay) elDisplay.textContent = `${result.el}' EL`;
  if (lossDisplay) lossDisplay.textContent = `${result.lossDP.toFixed(3)}" w.g.`;
  if (hintEl) hintEl.textContent = `Unit EL: ${result.el}' | Qty: ${qty} | Total: ${(result.el * qty).toFixed(1)}' Equivalent Length`;

  const orientBadge = document.getElementById('modalElbowOrientationBadge');
  if (orientBadge && typeKey.startsWith('2')) {
    const dimW = inputs.w;
    const dimH = inputs.h;
    const isHard = (dimW >= dimH);
    orientBadge.innerHTML = `${isHard ? 'Hard Bend (turns across ' + dimW + '" width)' : 'Easy Bend (turns across ' + dimW + '" width)'} &bull; Aspect H/W = ${(dimH / dimW).toFixed(2)}`;
  }

  const cascadeNote = document.getElementById('modalLeavingCascadeNote');
  if (cascadeNote) {
    if (isTeeFitting(typeKey)) {
      const isBr = isBranchTakeoffFitting(typeKey) || (document.getElementById('modalTeePathContinuation')?.value === 'branch');
      const bShape = getTeeBranchShape(typeKey);
      let branchDimsStr = '';
      if (bShape === 'round') {
        const bDia = parseFloat(document.getElementById('modalTeeBranchDia')?.value) || 12;
        branchDimsStr = `Ø ${bDia}" Round`;
      } else {
        const bW = parseFloat(document.getElementById('modalTeeBranchWidth')?.value) || 16;
        const bH = parseFloat(document.getElementById('modalTeeBranchHeight')?.value) || 10;
        branchDimsStr = `${bW}" × ${bH}" Rect`;
      }
      const leavingQ = isBr ? inputs.qb : Math.max(0, curCFM - inputs.qb);
      const leavingArea = isBr ? (inputs.vb > 0 ? (inputs.qb / inputs.vb) * 144 : upstreamArea) : upstreamArea;
      const leavingVel = leavingArea > 0 ? (leavingQ / leavingArea) * 144 : 800;
      const pathLabel = isBr ? `Leaving Branch Takeoff (${branchDimsStr})` : `Leaving Trunk`;
      cascadeNote.innerHTML = `<i class="fa-solid fa-arrow-right"></i> ${pathLabel}: <strong>${Math.round(leavingQ)} CFM</strong> (${Math.round(leavingVel)} FPM) &bull; Cascades downstream`;
    } else if (isTransitionFitting(typeKey)) {
      const geom = getTransitionGeometry(typeKey);
      let dnArea = 144;
      let dnDimsStr = '';
      if (geom.downstream === 'round') {
        const d = parseFloat(document.getElementById('modalLeavingDia')?.value) || 12;
        dnArea = Math.PI * Math.pow(d / 2, 2);
        dnDimsStr = `Ø ${d}" Round`;
      } else {
        const lw = parseFloat(document.getElementById('modalLeavingWidth')?.value) || 14;
        const lh = parseFloat(document.getElementById('modalLeavingHeight')?.value) || 12;
        dnArea = lw * lh;
        dnDimsStr = `${lw}" × ${lh}" Rect`;
      }
      const leavingVel = dnArea > 0 ? (curCFM / (dnArea / 144)) : 800;
      cascadeNote.innerHTML = `<i class="fa-solid fa-arrow-right"></i> Exiting: <strong>${Math.round(curCFM)} CFM</strong> &bull; ${dnDimsStr} (${Math.round(leavingVel)} FPM) &bull; Cascades downstream`;
    } else {
      cascadeNote.innerHTML = `<i class="fa-solid fa-arrow-right"></i> Continuing: <strong>${Math.round(curCFM)} CFM</strong> @ ${Math.round(inputs.vt)} FPM &bull; Downstream ductwork inherits these conditions`;
    }
  }

  window.activeModalFittingResult = result;
  return result;
}

function onFittingGeometryInput() {
  const isScheduleEmpty = (chainedScheduleRows.length === 0);
  if (isScheduleEmpty) {
    const typeKey = document.getElementById('modalFittingType')?.value || '';
    if (isRoundFitting(typeKey)) {
      const rDia = document.getElementById('modalRoundDia')?.value;
      const initDia = document.getElementById('modalInitialDia');
      if (initDia && rDia) initDia.value = rDia;
    } else if (isRectFitting(typeKey)) {
      const wVal = document.getElementById('modalElbowWidth')?.value || document.getElementById('modalRectRadiusW')?.value;
      const hVal = document.getElementById('modalElbowHeight')?.value || document.getElementById('modalRectRadiusH')?.value;
      const initW = document.getElementById('modalInitialWidth');
      const initH = document.getElementById('modalInitialHeight');
      if (initW && wVal) initW.value = wVal;
      if (initH && hVal) initH.value = hVal;
    }
    updateModalInitialCriteriaReadout();
  }
  updateModalFittingAerodynamics();
  updateModalEquivalentHint();
}

function swapElbowOrientation() {
  const typeEl = document.getElementById('modalFittingType');
  const typeKey = typeEl ? typeEl.value : '';

  if (typeKey.startsWith('3')) {
    const wEl = document.getElementById('modalRectRadiusW');
    const hEl = document.getElementById('modalRectRadiusH');
    if (wEl && hEl) {
      const tmp = wEl.value;
      wEl.value = hEl.value;
      hEl.value = tmp;
    }
  } else {
    const wEl = document.getElementById('modalElbowWidth');
    const hEl = document.getElementById('modalElbowHeight');
    if (wEl && hEl) {
      const tmp = wEl.value;
      wEl.value = hEl.value;
      hEl.value = tmp;
    }
  }
  updateModalFittingAerodynamics();
}

function updateModalTeeFlowReadout() {
  const enteringCFM = getCurrentDownstreamCFM();
  const branchCFM = parseFloat(document.getElementById('modalBranchCFM')?.value) || 0;
  const typeKey = document.getElementById('modalFittingType')?.value || '';
  const isBranchCont = (document.getElementById('modalTeePathContinuation')?.value === 'branch') || isBranchTakeoffFitting(typeKey);
  const leavingCFM = isBranchCont ? branchCFM : Math.max(0, enteringCFM - branchCFM);
  const readout = document.getElementById('modalTeeFlowReadout');
  if (readout) {
    readout.textContent = isBranchCont ? `Leaving Branch: ${Math.round(leavingCFM)} CFM` : `Leaving Trunk: ${Math.round(leavingCFM)} CFM`;
  }
}

function onModalBranchCFMInput() {
  updateModalTeeFlowReadout();
  onModalTeeBranchDimsInput();
  const branchInput = document.getElementById('modalBranchCFM');
  const calcQb = document.getElementById('calcInputQb');
  const calcQt = document.getElementById('calcInputQt');
  if (branchInput && calcQb && !calcQb.value) {
    calcQb.value = branchInput.value;
    const enteringCFM = getCurrentDownstreamCFM();
    if (calcQt && !calcQt.value) calcQt.value = enteringCFM;
    onModalCalculatorInput();
  }
}

function onModalTransitionInput() {
  const typeKey = document.getElementById('modalFittingType')?.value || '';
  const geom = getTransitionGeometry(typeKey);

  if (geom.downstream === 'round') {
    const d2 = parseFloat(document.getElementById('modalLeavingDia')?.value);
    const inD2 = document.getElementById('calcInputTransD2');
    if (inD2 && !isNaN(d2)) inD2.value = d2;
  } else {
    const w2 = parseFloat(document.getElementById('modalLeavingWidth')?.value);
    const l2 = parseFloat(document.getElementById('modalLeavingHeight')?.value);
    const inW2 = document.getElementById('calcInputTransW2');
    const inL2 = document.getElementById('calcInputTransL2');
    if (inW2 && !isNaN(w2)) inW2.value = w2;
    if (inL2 && !isNaN(l2)) inL2.value = l2;
  }
  updateModalTransitionCalculations();
  onModalCalculatorInput();
}

function applyCustomLossCoefficient(cVal) {
  const c = parseFloat(cVal);
  const elInput = document.getElementById('modalCustomEL');
  if (!elInput) return;
  if (!isNaN(c) && c >= 0) {
    const el = Math.round(c * 114);
    elInput.value = el;
  } else if (!cVal) {
    elInput.value = '';
  }
  updateModalEquivalentHint();
}

// -------------------------------------------------------------------
// MODAL VARIABLE CALCULATOR (RATIO & NEAREST OPTION ENGINE)
// -------------------------------------------------------------------
function renderModalCalculator(def, typeKey) {
  const calcSection = document.getElementById('modalCalculatorSection');
  if (!calcSection) return;

  // Reset calculator inputs on fitting type change
  clearModalCalculator();

  // Hide calculator for presets, flex duct, custom fittings, or fittings without multiple options
  if (!def || !def.options || Object.keys(def.options).length <= 1 || typeKey === 'custom_fitting' || typeKey === 'flex_elbow') {
    calcSection.classList.add('hidden');
    return;
  }
  calcSection.classList.remove('hidden');

  const rowFlow = document.getElementById('calcRowFlow');
  const rowVelocity = document.getElementById('calcRowVelocity');
  const colVb = document.getElementById('calcColVb');
  const labelVt = document.getElementById('calcLabelVt');
  const rowDimensions = document.getElementById('calcRowDimensions');
  const colDimR = document.getElementById('calcColDimR');
  const colDimW = document.getElementById('calcColDimW');
  const colDimH = document.getElementById('calcColDimH');
  const labelDimW = document.getElementById('calcLabelDimW');
  const rowArea = document.getElementById('calcRowArea');
  const labelArea1 = document.getElementById('calcLabelArea1');
  const labelArea2 = document.getElementById('calcLabelArea2');
  const rowTransDims = document.getElementById('calcRowTransitionDims');

  // Reset row visibility and labels to defaults
  if (rowFlow) rowFlow.classList.add('hidden');
  if (rowVelocity) rowVelocity.classList.add('hidden');
  if (colVb) colVb.classList.remove('hidden');
  if (labelVt) labelVt.innerHTML = 'Trunk Velocity (V<sub>t</sub>, FPM)';
  if (rowDimensions) rowDimensions.classList.add('hidden');
  if (colDimR) colDimR.classList.remove('hidden');
  if (colDimW) colDimW.classList.remove('hidden');
  if (colDimH) colDimH.classList.remove('hidden');
  if (labelDimW) labelDimW.textContent = 'Width W (in)';
  if (rowArea) rowArea.classList.add('hidden');
  if (rowTransDims) rowTransDims.classList.add('hidden');
  if (labelArea1) labelArea1.innerHTML = 'Trunk Area A<sub>t</sub> (sq in)';
  if (labelArea2) labelArea2.innerHTML = 'Branch Area A<sub>b</sub> (sq in)';

  // Configure visible inputs based on fitting category & key
  if (/^1[a-f]/i.test(typeKey) && !typeKey.startsWith('10')) {
    // 1a-1f Round Elbows: Radius R and Diameter D
    if (rowDimensions) rowDimensions.classList.remove('hidden');
    if (colDimH) colDimH.classList.add('hidden');
    if (labelDimW) labelDimW.textContent = 'Diameter D (in)';
  } else if (typeKey.startsWith('2')) {
    // 2a-2c Rect Mitered Elbows: Width W and Height H
    if (rowDimensions) rowDimensions.classList.remove('hidden');
    if (colDimR) colDimR.classList.add('hidden');
    if (labelDimW) labelDimW.textContent = 'Width W (in)';
  } else if (typeKey.startsWith('3')) {
    // 3a-3c Rect Radius Elbows: Radius R, Width W, Height H
    if (rowDimensions) rowDimensions.classList.remove('hidden');
    if (labelDimW) labelDimW.textContent = 'Width W (in)';
  } else if (typeKey.startsWith('4a') || typeKey.startsWith('4b') || typeKey.startsWith('4c')) {
    // 4a-4c Converging Rect Branch: Flow (Qt, Qb) & Trunk Velocity (Vt)
    if (rowFlow) rowFlow.classList.remove('hidden');
    if (rowVelocity) rowVelocity.classList.remove('hidden');
    if (colVb) colVb.classList.add('hidden');
  } else if (typeKey.startsWith('4d') || typeKey.startsWith('4e') || typeKey.startsWith('4f')) {
    // 4d-4f Converging Rect Trunk: Flow (Qt, Qb)
    if (rowFlow) rowFlow.classList.remove('hidden');
  } else if (typeKey.startsWith('5a') || typeKey.startsWith('5b') || typeKey.startsWith('5c')) {
    // 5a-5c Diverging Rect Branch: Flow (Qt, Qb) & Velocity (Vt, Vb)
    if (rowFlow) rowFlow.classList.remove('hidden');
    if (rowVelocity) rowVelocity.classList.remove('hidden');
  } else if (typeKey.startsWith('5d') || typeKey.startsWith('5e') || typeKey.startsWith('5f')) {
    // 5d-5f Diverging Rect Trunk: Velocity or Flow
    if (rowFlow) rowFlow.classList.remove('hidden');
    if (rowVelocity) rowVelocity.classList.remove('hidden');
  } else if (typeKey === '6a_converging_branch' || typeKey === '6b_diverging_branch') {
    // 6a, 6b Round Tee 90 Branch: Flow (Qt, Qb) & Area (At, Ab)
    if (rowFlow) rowFlow.classList.remove('hidden');
    if (rowArea) rowArea.classList.remove('hidden');
    if (labelArea1) labelArea1.innerHTML = 'Trunk Area A<sub>t</sub> (sq in)';
    if (labelArea2) labelArea2.innerHTML = 'Branch Area A<sub>b</sub> (sq in)';
  } else if (typeKey === '6c_converging_trunk') {
    // 6c Converging Trunk: Flow (Qt, Qb)
    if (rowFlow) rowFlow.classList.remove('hidden');
  } else if (typeKey === '6d_diverging_trunk' || typeKey.startsWith('7')) {
    // 6d, 7a-7f Round Diverging: Velocity (Vt, Vb)
    if (rowVelocity) rowVelocity.classList.remove('hidden');
  } else if (typeKey === '8a_diverging') {
    // 8a Wye Diverging: Velocity (Vt, Vb)
    if (rowVelocity) rowVelocity.classList.remove('hidden');
  } else if (typeKey === '8b_converging') {
    // 8b Wye Converging: Flow (Qt, Qb)
    if (rowFlow) rowFlow.classList.remove('hidden');
  } else if (typeKey.startsWith('9') || typeKey.startsWith('10')) {
    // 9a-9d, 10a-10c Transitions: Physical Dimensions (Diameter for Round, Length & Width for Rect)
    if (rowTransDims) rowTransDims.classList.remove('hidden');

    const geom = getTransitionGeometry(typeKey);
    const colD1 = document.getElementById('calcColTransD1');
    const colRect1 = document.getElementById('calcColTransRect1');
    const colD2 = document.getElementById('calcColTransD2');
    const colRect2 = document.getElementById('calcColTransRect2');
    const badge1 = document.getElementById('calcTransUpstreamShapeBadge');
    const badge2 = document.getElementById('calcTransDownstreamShapeBadge');

    if (geom.upstream === 'round') {
      if (colD1) colD1.classList.remove('hidden');
      if (colRect1) colRect1.classList.add('hidden');
      if (badge1) { badge1.textContent = 'Round (Dia)'; badge1.className = 'text-[9px] px-1.5 py-0.2 rounded bg-sky-900/60 text-sky-300 font-mono'; }
    } else {
      if (colD1) colD1.classList.add('hidden');
      if (colRect1) colRect1.classList.remove('hidden');
      if (badge1) { badge1.textContent = 'Rect (W×L)'; badge1.className = 'text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono'; }
    }

    if (geom.downstream === 'round') {
      if (colD2) colD2.classList.remove('hidden');
      if (colRect2) colRect2.classList.add('hidden');
      if (badge2) { badge2.textContent = 'Round (Dia)'; badge2.className = 'text-[9px] px-1.5 py-0.2 rounded bg-sky-900/60 text-sky-300 font-mono'; }
    } else {
      if (colD2) colD2.classList.add('hidden');
      if (colRect2) colRect2.classList.remove('hidden');
      if (badge2) { badge2.textContent = 'Rect (W×L)'; badge2.className = 'text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono'; }
    }

    // Pre-populate entering dimensions from current downstream schedule duct
    const curDims = getCurrentDownstreamDims();
    const inD1 = document.getElementById('calcInputTransD1');
    const inW1 = document.getElementById('calcInputTransW1');
    const inL1 = document.getElementById('calcInputTransL1');

    if (geom.upstream === 'round') {
      if (inD1 && !inD1.value) inD1.value = (curDims.shape === 'round') ? (curDims.dia || curDims.w) : 14;
    } else {
      if (inW1 && !inW1.value) inW1.value = curDims.w || 18;
      if (inL1 && !inL1.value) inL1.value = curDims.h || 12;
    }

    // Pre-populate downstream dimensions if leaving fields have values
    const inD2 = document.getElementById('calcInputTransD2');
    const inW2 = document.getElementById('calcInputTransW2');
    const inL2 = document.getElementById('calcInputTransL2');
    const modalLeavingDia = document.getElementById('modalLeavingDia')?.value;
    const modalLeavingW = document.getElementById('modalLeavingWidth')?.value;
    const modalLeavingH = document.getElementById('modalLeavingHeight')?.value;

    if (geom.downstream === 'round') {
      if (inD2 && !inD2.value && modalLeavingDia) inD2.value = modalLeavingDia;
    } else {
      if (inW2 && !inW2.value && modalLeavingW) inW2.value = modalLeavingW;
      if (inL2 && !inL2.value && modalLeavingH) inL2.value = modalLeavingH;
    }
  }
}

function clearModalCalculator() {
  const ids = [
    'calcInputQt', 'calcInputQb',
    'calcInputVt', 'calcInputVb',
    'calcInputDimR', 'calcInputDimW', 'calcInputDimH',
    'calcInputArea1', 'calcInputArea2',
    'calcInputTransD1', 'calcInputTransW1', 'calcInputTransL1',
    'calcInputTransD2', 'calcInputTransW2', 'calcInputTransL2'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const a1Readout = document.getElementById('calcTransArea1Readout');
  const a2Readout = document.getElementById('calcTransArea2Readout');
  if (a1Readout) a1Readout.textContent = 'Area A₁: — sq in';
  if (a2Readout) a2Readout.textContent = 'Area A₂: — sq in';

  const fb = document.getElementById('calcFeedbackContainer');
  if (fb) fb.classList.add('hidden');
}

function onModalCalculatorInput() {
  const typeEl = document.getElementById('modalFittingType');
  const catEl = document.getElementById('modalFittingCategory');
  const paramSelect = document.getElementById('modalFittingParam');
  if (!typeEl || !paramSelect) return;

  const catKey = catEl ? catEl.value : findCategoryForFittingKey(typeEl.value);
  const typeKey = typeEl.value;
  const def = (DUCT_LOSS_DATA[catKey] && DUCT_LOSS_DATA[catKey][typeKey]) ? DUCT_LOSS_DATA[catKey][typeKey] : null;
  if (!def || !def.options) return;

  const inputs = {
    qt: parseFloat(document.getElementById('calcInputQt')?.value),
    qb: parseFloat(document.getElementById('calcInputQb')?.value),
    vt: parseFloat(document.getElementById('calcInputVt')?.value),
    vb: parseFloat(document.getElementById('calcInputVb')?.value),
    dimR: parseFloat(document.getElementById('calcInputDimR')?.value),
    dimW: parseFloat(document.getElementById('calcInputDimW')?.value),
    dimH: parseFloat(document.getElementById('calcInputDimH')?.value),
    area1: parseFloat(document.getElementById('calcInputArea1')?.value),
    area2: parseFloat(document.getElementById('calcInputArea2')?.value),
    transD1: parseFloat(document.getElementById('calcInputTransD1')?.value),
    transW1: parseFloat(document.getElementById('calcInputTransW1')?.value),
    transL1: parseFloat(document.getElementById('calcInputTransL1')?.value),
    transD2: parseFloat(document.getElementById('calcInputTransD2')?.value),
    transW2: parseFloat(document.getElementById('calcInputTransW2')?.value),
    transL2: parseFloat(document.getElementById('calcInputTransL2')?.value)
  };

  const matchResult = findClosestFittingOption(def, typeKey, inputs);

  const fb = document.getElementById('calcFeedbackContainer');
  const readout = document.getElementById('calcRatiosReadout');
  const matchText = document.getElementById('calcAutoMatchText');

  if (!matchResult || !matchResult.key) {
    if (fb) fb.classList.add('hidden');
    return;
  }

  // Auto-select in dropdown
  if (paramSelect.value !== matchResult.key) {
    paramSelect.value = matchResult.key;
    onModalParamChange();
  }

  if (fb && readout) {
    fb.classList.remove('hidden');
    readout.innerHTML = matchResult.feedback;
    if (matchText) {
      const el = def.options[matchResult.key];
      matchText.textContent = `Auto-selected: ${matchResult.key} (${el}' EL)`;
    }
  }
}

function findClosestFittingOption(def, typeKey, inputs) {
  if (!def || !def.options) return null;
  const optKeys = Object.keys(def.options);
  if (optKeys.length === 0) return null;
  if (optKeys.length === 1) return { key: optKeys[0], feedback: '' };

  const { qt, qb, vt, vb, dimR, dimW, dimH, area1, area2 } = inputs;

  // 1. Group 5a, 5b, 5c: Diverging Rect Branch ('Vb/Vt=X, Qb/Qt=Y')
  if (typeKey.startsWith('5a') || typeKey.startsWith('5b') || typeKey.startsWith('5c')) {
    const hasQ = (!isNaN(qt) && qt > 0 && !isNaN(qb) && qb >= 0);
    const hasV = (!isNaN(vt) && vt > 0 && !isNaN(vb) && vb >= 0);
    if (!hasQ && !hasV) return null;

    const qRatio = hasQ ? (qb / qt) : null;
    const vRatio = hasV ? (vb / vt) : null;

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      const match = key.match(/Vb\/Vt\s*=\s*([0-9.]+),\s*Qb\/Qt\s*=\s*([0-9.]+)/i);
      if (!match) continue;
      const optV = parseFloat(match[1]);
      const optQ = parseFloat(match[2]);

      let diff = 0;
      if (vRatio !== null && qRatio !== null) {
        diff = Math.pow(vRatio - optV, 2) + Math.pow(qRatio - optQ, 2);
      } else if (qRatio !== null) {
        diff = Math.abs(qRatio - optQ);
      } else {
        diff = Math.abs(vRatio - optV);
      }

      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }

    const vStr = vRatio !== null ? vRatio.toFixed(2) : '—';
    const qStr = qRatio !== null ? qRatio.toFixed(3) : '—';
    const feedback = `V<sub>b</sub>/V<sub>t</sub>: <strong>${vStr}</strong> | Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qStr}</strong>`;
    return { key: bestKey, feedback };
  }

  // 2. Group 4a, 4b, 4c: Converging Rect Branch ('Vt < 1200, Qb/Qt=X' or 'Vt >= 1200, Qb/Qt=X')
  if (typeKey.startsWith('4a') || typeKey.startsWith('4b') || typeKey.startsWith('4c')) {
    const hasQ = (!isNaN(qt) && qt > 0 && !isNaN(qb) && qb >= 0);
    const hasV = (!isNaN(vt) && vt > 0);
    if (!hasQ && !hasV) return null;

    const qRatio = hasQ ? (qb / qt) : 0.5;
    const isHighV = hasV ? (vt >= 1200) : false;
    const vPrefix = isHighV ? 'Vt >= 1200' : 'Vt < 1200';

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      if (!key.startsWith(vPrefix)) continue;
      const match = key.match(/Qb\/Qt\s*=\s*([0-9.]+)/i);
      if (!match) continue;
      const optQ = parseFloat(match[1]);
      const diff = Math.abs(qRatio - optQ);
      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }

    const qStr = hasQ ? qRatio.toFixed(3) : '—';
    const vStr = hasV ? `${Math.round(vt)} FPM (${vPrefix})` : vPrefix;
    const feedback = `Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qStr}</strong> | V<sub>t</sub>: <strong>${vStr}</strong>`;
    return { key: bestKey, feedback };
  }

  // 3. Group 4d, 4e, 4f, 6c: Converging Trunk Paths ('Qb/Qt = X')
  if (typeKey.startsWith('4d') || typeKey.startsWith('4e') || typeKey.startsWith('4f') || typeKey === '6c_converging_trunk') {
    const hasQ = (!isNaN(qt) && qt > 0 && !isNaN(qb) && qb >= 0);
    if (!hasQ) return null;
    const qRatio = qb / qt;

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      const match = key.match(/Qb\/Qt\s*=?\s*([0-9.]+)/i);
      if (!match) continue;
      const optQ = parseFloat(match[1]);
      const diff = Math.abs(qRatio - optQ);
      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }

    const feedback = `Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qRatio.toFixed(3)}</strong>`;
    return { key: bestKey, feedback };
  }

  // 4. Group 5d, 5e, 5f: Diverging Rect Trunk Paths ('Vb/Vt = X (Qb/Qt = X)')
  if (typeKey.startsWith('5d') || typeKey.startsWith('5e') || typeKey.startsWith('5f')) {
    const hasV = (!isNaN(vt) && vt > 0 && !isNaN(vb) && vb >= 0);
    const hasQ = (!isNaN(qt) && qt > 0 && !isNaN(qb) && qb >= 0);
    if (!hasV && !hasQ) return null;

    const ratio = hasV ? (vb / vt) : (qb / qt);
    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      const match = key.match(/Vb\/Vt\s*=\s*([0-9.]+)/i);
      if (!match) continue;
      const optVal = parseFloat(match[1]);
      const diff = Math.abs(ratio - optVal);
      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }

    const label = hasV ? 'V<sub>b</sub>/V<sub>t</sub>' : 'Q<sub>b</sub>/Q<sub>t</sub>';
    const feedback = `${label}: <strong>${ratio.toFixed(2)}</strong>`;
    return { key: bestKey, feedback };
  }

  // 5. Group 6a: Round Tee 90° Converging Branch ('Qb/Qt=X, Ab/At=Y')
  if (typeKey === '6a_converging_branch') {
    const hasQ = (!isNaN(qt) && qt > 0 && !isNaN(qb) && qb >= 0);
    const hasA = (!isNaN(area1) && area1 > 0 && !isNaN(area2) && area2 >= 0); // area1 = At, area2 = Ab
    if (!hasQ && !hasA) return null;

    const qRatio = hasQ ? (qb / qt) : null;
    const aRatio = hasA ? (area2 / area1) : null;

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      const match = key.match(/Qb\/Qt\s*=\s*([0-9.]+),\s*Ab\/At\s*=\s*([0-9.]+)/i);
      if (!match) continue;
      const optQ = parseFloat(match[1]);
      const optA = parseFloat(match[2]);

      let diff = 0;
      if (qRatio !== null && aRatio !== null) {
        diff = Math.pow(qRatio - optQ, 2) + Math.pow(aRatio - optA, 2);
      } else if (qRatio !== null) {
        diff = Math.abs(qRatio - optQ);
      } else {
        diff = Math.abs(aRatio - optA);
      }

      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }

    const qStr = qRatio !== null ? qRatio.toFixed(2) : '—';
    const aStr = aRatio !== null ? aRatio.toFixed(2) : '—';
    const feedback = `Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qStr}</strong> | A<sub>b</sub>/A<sub>t</sub>: <strong>${aStr}</strong>`;
    return { key: bestKey, feedback };
  }

  // 6. Group 6b: Round Tee 90° Diverging Branch ('Ab/At=X, Qb/Qt=Y')
  if (typeKey === '6b_diverging_branch') {
    const hasQ = (!isNaN(qt) && qt > 0 && !isNaN(qb) && qb >= 0);
    const hasA = (!isNaN(area1) && area1 > 0 && !isNaN(area2) && area2 >= 0); // area1 = At, area2 = Ab
    if (!hasQ && !hasA) return null;

    const qRatio = hasQ ? (qb / qt) : null;
    const aRatio = hasA ? (area2 / area1) : null;

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      const match = key.match(/Ab\/At\s*=\s*([0-9.]+),\s*Qb\/Qt\s*=\s*([0-9.]+)/i);
      if (!match) continue;
      const optA = parseFloat(match[1]);
      const optQ = parseFloat(match[2]);

      let diff = 0;
      if (qRatio !== null && aRatio !== null) {
        diff = Math.pow(qRatio - optQ, 2) + Math.pow(aRatio - optA, 2);
      } else if (qRatio !== null) {
        diff = Math.abs(qRatio - optQ);
      } else {
        diff = Math.abs(aRatio - optA);
      }

      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }

    const qStr = qRatio !== null ? qRatio.toFixed(2) : '—';
    const aStr = aRatio !== null ? aRatio.toFixed(2) : '—';
    const feedback = `A<sub>b</sub>/A<sub>t</sub>: <strong>${aStr}</strong> | Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qStr}</strong>`;
    return { key: bestKey, feedback };
  }

  // 7. Group 6d, 7a-7f: Diverging Velocity Ratio ('Vb/Vt = X' or 'Vb/Vt=X')
  if (typeKey === '6d_diverging_trunk' || typeKey.startsWith('7')) {
    const hasV = (!isNaN(vt) && vt > 0 && !isNaN(vb) && vb >= 0);
    if (!hasV) return null;
    const vRatio = vb / vt;

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      const match = key.match(/Vb\/Vt\s*=?\s*([0-9.]+)/i);
      if (!match) continue;
      const optV = parseFloat(match[1]);
      const diff = Math.abs(vRatio - optV);
      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }

    const feedback = `V<sub>b</sub>/V<sub>t</sub>: <strong>${vRatio.toFixed(2)}</strong>`;
    return { key: bestKey, feedback };
  }

  // 8. Group 8a, 8b: Wye (Pair of Pants)
  if (typeKey === '8a_diverging') {
    const hasV = (!isNaN(vt) && vt > 0 && !isNaN(vb) && vb >= 0);
    if (!hasV) return null;
    const vRatio = vb / vt;

    const currentParam = document.getElementById('modalFittingParam')?.value || '';
    const angleMatch = currentParam.match(/^(\d+°\s*Angle)/);
    const activeAngle = angleMatch ? angleMatch[1] : null;

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      if (activeAngle && !key.startsWith(activeAngle)) continue;
      const match = key.match(/Vb\/Vt\s*=\s*([0-9.]+)/i);
      if (!match) continue;
      const optV = parseFloat(match[1]);
      const diff = Math.abs(vRatio - optV);
      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }
    const feedback = `V<sub>b</sub>/V<sub>t</sub>: <strong>${vRatio.toFixed(2)}</strong>`;
    return { key: bestKey, feedback };
  }

  if (typeKey === '8b_converging') {
    const hasQ = (!isNaN(qt) && qt > 0 && !isNaN(qb) && qb >= 0);
    if (!hasQ) return null;
    const qRatio = qb / qt;

    const currentParam = document.getElementById('modalFittingParam')?.value || '';
    const angleMatch = currentParam.match(/^(\d+°\s*Angle)/);
    const activeAngle = angleMatch ? angleMatch[1] : null;

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      if (activeAngle && !key.startsWith(activeAngle)) continue;
      const match = key.match(/Qb\/Qt\s*=\s*([0-9.]+)/i);
      if (!match) continue;
      const optQ = parseFloat(match[1]);
      const diff = Math.abs(qRatio - optQ);
      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }
    const feedback = `Q<sub>b</sub>/Q<sub>t</sub>: <strong>${qRatio.toFixed(3)}</strong>`;
    return { key: bestKey, feedback };
  }

  // 9. Group 1: Round Elbows (R/D)
  if (/^1[a-f]/i.test(typeKey) && !typeKey.startsWith('10')) {
    const hasR = (!isNaN(dimR) && dimR > 0);
    const hasD = (!isNaN(dimW) && dimW > 0); // dimW is used as Diameter D
    if (!hasR || !hasD) return null;
    const rd = dimR / dimW;

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      const numVal = parseFloat(key.replace('+', ''));
      const diff = Math.abs(rd - numVal);
      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }
    const feedback = `Radius/Diameter (R/D): <strong>${rd.toFixed(2)}</strong>`;
    return { key: bestKey, feedback };
  }

  // 10. Group 2: Rectangular Mitered Elbows (H/W)
  if (typeKey.startsWith('2')) {
    const hasH = (!isNaN(dimH) && dimH > 0);
    const hasW = (!isNaN(dimW) && dimW > 0);
    if (!hasH || !hasW) return null;
    const hw = dimH / dimW;

    const currentParam = document.getElementById('modalFittingParam')?.value || '';
    const isWithout = currentParam.includes('Without Vanes');
    const targetVanes = isWithout ? 'Without Vanes' : 'With Vanes';

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      let numVal = NaN;
      if (typeKey === '2c_tee_double') {
        if (!key.includes(targetVanes)) continue;
        const match = key.match(/H\/W\s*=\s*([0-9.]+)/i);
        if (match) numVal = parseFloat(match[1]);
      } else {
        numVal = parseFloat(key);
      }
      if (isNaN(numVal)) continue;

      const diff = Math.abs(hw - numVal);
      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }
    const feedback = `Height/Width (H/W): <strong>${hw.toFixed(2)}</strong>`;
    return { key: bestKey, feedback };
  }

  // 11. Group 3: Rectangular Radius Elbows (R/W & H/W)
  if (typeKey.startsWith('3')) {
    const hasW = (!isNaN(dimW) && dimW > 0);
    const hasR = (!isNaN(dimR) && dimR > 0);
    const hasH = (!isNaN(dimH) && dimH > 0);
    if (!hasW || (!hasR && !hasH)) return null;

    const rw = hasR ? (dimR / dimW) : null;
    const hw = hasH ? (dimH / dimW) : null;

    const currentParam = document.getElementById('modalFittingParam')?.value || '';
    const isWithVanes = currentParam.startsWith('With Vanes');
    const isWithoutVanes = currentParam.startsWith('Without Vanes');

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      if (typeKey === '3c_wye_double') {
        if (isWithVanes && !key.startsWith('With Vanes')) continue;
        if (isWithoutVanes && !key.startsWith('Without Vanes')) continue;
      }
      const matchR = key.match(/R\/W\s*=\s*([0-9.]+)/i);
      const matchH = key.match(/H\/W\s*=\s*([0-9.]+)/i);
      if (!matchR || !matchH) continue;
      const optRW = parseFloat(matchR[1]);
      const optHW = parseFloat(matchH[1]);

      let diff = 0;
      if (rw !== null && hw !== null) {
        diff = Math.pow(rw - optRW, 2) + Math.pow(hw - optHW, 2);
      } else if (rw !== null) {
        diff = Math.abs(rw - optRW);
      } else {
        diff = Math.abs(hw - optHW);
      }

      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }

    const rwStr = rw !== null ? rw.toFixed(2) : '—';
    const hwStr = hw !== null ? hw.toFixed(2) : '—';
    const feedback = `R/W: <strong>${rwStr}</strong> | H/W: <strong>${hwStr}</strong>`;
    return { key: bestKey, feedback };
  }

  // 12. Group 9 & 10: Transitions (Dimensions: Diameter for Round, Length & Width for Rect)
  if (typeKey.startsWith('9') || typeKey.startsWith('10')) {
    const geom = getTransitionGeometry(typeKey);
    let calcA1 = null;
    let calcA2 = null;
    let dims1Label = '';
    let dims2Label = '';

    // Calculate Upstream Area A1
    if (geom.upstream === 'round') {
      const d1 = inputs.transD1;
      if (!isNaN(d1) && d1 > 0) {
        calcA1 = (Math.PI * Math.pow(d1, 2)) / 4.0;
        dims1Label = `&Oslash; ${d1}"`;
      }
    } else {
      const w1 = inputs.transW1;
      const l1 = inputs.transL1;
      if (!isNaN(w1) && w1 > 0 && !isNaN(l1) && l1 > 0) {
        calcA1 = w1 * l1;
        dims1Label = `${w1}"×${l1}"`;
      }
    }

    // Calculate Downstream Area A2
    if (geom.downstream === 'round') {
      const d2 = inputs.transD2;
      if (!isNaN(d2) && d2 > 0) {
        calcA2 = (Math.PI * Math.pow(d2, 2)) / 4.0;
        dims2Label = `&Oslash; ${d2}"`;
      }
    } else {
      const w2 = inputs.transW2;
      const l2 = inputs.transL2;
      if (!isNaN(w2) && w2 > 0 && !isNaN(l2) && l2 > 0) {
        calcA2 = w2 * l2;
        dims2Label = `${w2}"×${l2}"`;
      }
    }

    // Update live area readouts under inputs
    const readoutA1 = document.getElementById('calcTransArea1Readout');
    const readoutA2 = document.getElementById('calcTransArea2Readout');
    if (readoutA1) readoutA1.innerHTML = calcA1 ? `Calculated A₁: <strong>${calcA1.toFixed(1)}</strong> sq in` : 'Area A₁: — sq in';
    if (readoutA2) readoutA2.innerHTML = calcA2 ? `Calculated A₂: <strong>${calcA2.toFixed(1)}</strong> sq in` : 'Area A₂: — sq in';

    // Also sync downstream dimension inputs into modal transition row
    if (geom.downstream === 'round') {
      const modalDia = document.getElementById('modalLeavingDia');
      if (modalDia && !isNaN(inputs.transD2) && inputs.transD2 > 0 && modalDia.value != inputs.transD2) {
        modalDia.value = inputs.transD2;
      }
    } else {
      const modalW = document.getElementById('modalLeavingWidth');
      const modalH = document.getElementById('modalLeavingHeight');
      if (modalW && !isNaN(inputs.transW2) && inputs.transW2 > 0 && modalW.value != inputs.transW2) modalW.value = inputs.transW2;
      if (modalH && !isNaN(inputs.transL2) && inputs.transL2 > 0 && modalH.value != inputs.transL2) modalH.value = inputs.transL2;
    }

    if (!calcA1 || !calcA2 || calcA1 <= 0 || calcA2 <= 0) return null;

    const ratio = Math.max(calcA1, calcA2) / Math.min(calcA1, calcA2);

    const currentParam = document.getElementById('modalFittingParam')?.value || '';
    const angleMatch = currentParam.match(/,\s*([0-9°\-]+)$/);
    const activeAngle = angleMatch ? angleMatch[1] : null;

    let bestKey = null;
    let minDiff = Infinity;

    for (const key of optKeys) {
      if (activeAngle && !key.endsWith(activeAngle)) continue;
      const match = key.match(/A1\/A2\s*=\s*([0-9.]+)/i);
      if (!match) continue;
      const optVal = parseFloat(match[1]);
      const diff = Math.abs(ratio - optVal);
      if (diff < minDiff) {
        minDiff = diff;
        bestKey = key;
      }
    }

    const feedback = `Dims: <strong>${dims1Label} &rarr; ${dims2Label}</strong> | Ratio: <strong>${ratio.toFixed(2)}:1</strong> (A₁: ${Math.round(calcA1)} in², A₂: ${Math.round(calcA2)} in²)`;
    return { key: bestKey, feedback };
  }

  return null;
}

function findBestModalOption(typeKey, optKeys, inputs) {
  try {
    const map = getAllFittingsMap();
    const def = map[typeKey];
    if (!def) return null;
    return findClosestFittingOption(def, typeKey, inputs);
  } catch (err) {
    console.warn('findBestModalOption warning:', err);
    return null;
  }
}

function updateModalFittingImagePreview(def, typeKey = null) {
  const previewCard = document.getElementById('modalFittingPreviewCard');
  const previewImg = document.getElementById('modalFittingPreviewImg');
  const previewName = document.getElementById('modalFittingPreviewName');
  const previewCat = document.getElementById('modalFittingPreviewCat');
  const previewBox = previewCard ? previewCard.querySelector('.preview-box') : null;
  const overlayContainer = document.getElementById('modalFittingOverlayContainer');
  const flowPathBadge = document.getElementById('modalFittingFlowPathBadge');
  const flowPathText = document.getElementById('modalFittingFlowPathText');
  const toggleStatus = document.getElementById('modalFlowToggleStatus');
  if (!previewCard) return;

  if (toggleStatus) {
    toggleStatus.textContent = window.airflowOverlayEnabled ? 'ON' : 'OFF';
    toggleStatus.className = window.airflowOverlayEnabled ? 'text-emerald-400 font-bold' : 'text-slate-400 font-bold';
  }

  const currentType = typeKey || document.getElementById('modalFittingType')?.value;

  if (currentType === 'custom_fitting') {
    if (previewImg) previewImg.classList.add('hidden');
    if (overlayContainer) { overlayContainer.innerHTML = ''; overlayContainer.classList.add('hidden'); }
    if (flowPathBadge) flowPathBadge.classList.add('hidden');
    let customIcon = document.getElementById('modalCustomWrenchIcon');
    if (!customIcon && previewBox) {
      customIcon = document.createElement('div');
      customIcon.id = 'modalCustomWrenchIcon';
      customIcon.className = 'w-full h-full flex items-center justify-center text-amber-400 text-3xl';
      customIcon.innerHTML = '<i class="fa-solid fa-wrench"></i>';
      previewBox.appendChild(customIcon);
    }
    if (customIcon) customIcon.classList.remove('hidden');
    if (previewName) previewName.textContent = 'User-Defined Custom Fitting';
    if (previewCat) previewCat.textContent = 'Custom Fitting';
    previewCard.classList.remove('hidden');
    previewCard.classList.add('flex');
    return;
  }

  // Remove custom icon if present
  const customIcon = document.getElementById('modalCustomWrenchIcon');
  if (customIcon) customIcon.classList.add('hidden');
  if (previewImg) previewImg.classList.remove('hidden');

  // Update Flow Path description badge
  const flowDef = getFittingAirflowDef(currentType);
  if (flowPathBadge && flowPathText && flowDef) {
    flowPathText.textContent = flowDef.description;
    flowPathBadge.classList.remove('hidden');
  } else if (flowPathBadge) {
    flowPathBadge.classList.add('hidden');
  }

  if (def && def.image) {
    const rawPath = getFittingImagePath(def.image);
    previewImg.onerror = function() {
      if (typeof handleFittingImgError === 'function') {
        handleFittingImgError(this);
      } else if (!this.dataset.retried) {
        this.dataset.retried = '1';
        try {
          const enc = encodeURI(rawPath);
          if (enc !== rawPath) { this.src = enc; return; }
        } catch(e) {}
      }
    };
    previewImg.dataset.retryCount = '0';
    previewImg.src = rawPath;
    previewImg.alt = def.name || 'Fitting Diagram';
    if (previewName) previewName.textContent = def.name || '';
    if (previewCat) previewCat.textContent = def.category || '';

    // Render Overlay
    if (overlayContainer) {
      if (window.airflowOverlayEnabled) {
        overlayContainer.innerHTML = getFittingAirflowSvg(currentType, { showBadge: true, showLabels: true });
        overlayContainer.classList.remove('hidden');
      } else {
        overlayContainer.innerHTML = '';
        overlayContainer.classList.add('hidden');
      }
    }

    previewCard.classList.remove('hidden');
    previewCard.classList.add('flex');
  } else {
    if (overlayContainer) { overlayContainer.innerHTML = ''; overlayContainer.classList.add('hidden'); }
    previewCard.classList.add('hidden');
    previewCard.classList.remove('flex');
  }
}

function adjustModalQty(delta) {
  const qtyInput = document.getElementById('modalFittingQty');
  if (!qtyInput) return;
  let val = parseInt(qtyInput.value, 10) || 1;
  val = Math.max(1, Math.min(50, val + delta));
  qtyInput.value = val;
  updateModalEquivalentHint();
}

function onModalParamChange() {
  updateModalFittingAerodynamics();
  updateModalEquivalentHint();
}

function updateModalEquivalentHint() {
  const typeSelect = document.getElementById('modalFittingType');
  const catSelect = document.getElementById('modalFittingCategory');
  const paramSelect = document.getElementById('modalFittingParam');
  const angleSelect = document.getElementById('modalFittingAngle');
  const qtyInput = document.getElementById('modalFittingQty');
  const hintEl = document.getElementById('modalFittingEquivalentHint');
  if (!hintEl || !typeSelect) return;

  const typeKey = typeSelect.value;
  const isCustom = (typeKey === 'custom_fitting');

  let baseEL = 0;
  if (isCustom) {
    const customElInput = document.getElementById('modalCustomEL');
    baseEL = Math.max(0, parseFloat(customElInput?.value) || 0);
  } else if (window.activeModalFittingResult && window.activeModalFittingResult.el !== undefined && !isNaN(window.activeModalFittingResult.el)) {
    baseEL = window.activeModalFittingResult.el;
  } else {
    const catKey = catSelect ? catSelect.value : findCategoryForFittingKey(typeKey);
    const def = (DUCT_LOSS_DATA[catKey] && DUCT_LOSS_DATA[catKey][typeKey]) ? DUCT_LOSS_DATA[catKey][typeKey] : null;

    if (!def || !def.options) {
      hintEl.textContent = '';
      return;
    }

    const optKey = paramSelect ? paramSelect.value : Object.keys(def.options)[0];
    baseEL = def.options[optKey] !== undefined ? def.options[optKey] : 0;
    
    if (def.hasAngleFactor && angleSelect && DUCT_LOSS_DATA.miteredAngleFactors) {
      const factor = DUCT_LOSS_DATA.miteredAngleFactors[angleSelect.value] || 1.0;
      baseEL = Math.round(baseEL * factor);
    }
  }

  const qty = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);
  const total = (baseEL * qty).toFixed(1).replace(/\.0$/, '');
  hintEl.textContent = `Unit EL: ${baseEL}' | Qty: ${qty} | Total: ${total}' Equivalent Length`;
}

function commitAddFittingFromModal() {
  const typeSelect = document.getElementById('modalFittingType');
  const paramSelect = document.getElementById('modalFittingParam');
  const pathSelect = document.getElementById('modalFittingPath');
  const qtyInput = document.getElementById('modalFittingQty');
  const angleSelect = document.getElementById('modalFittingAngle');

  const fittingKey = typeSelect ? typeSelect.value : '1a_90_smooth';
  const path = pathSelect ? pathSelect.value : 'supply';
  const qty = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);
  const angle = angleSelect ? angleSelect.value : '90';

  let paramKey = paramSelect ? paramSelect.value : null;
  let customName = null;
  let customEL = null;

  if (fittingKey === 'custom_fitting') {
    const nameInput = document.getElementById('modalCustomName');
    const elInput = document.getElementById('modalCustomEL');
    customName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Custom Fitting';
    customEL = Math.max(0, parseFloat(elInput?.value) || 0);
    paramKey = `${customEL}' EL`;
  }

  let branchCFM = null;
  const branchCFMInput = document.getElementById('modalBranchCFM');
  if (branchCFMInput && branchCFMInput.value !== '' && !isNaN(parseFloat(branchCFMInput.value))) {
    branchCFM = parseFloat(branchCFMInput.value);
  }

  const isBranchTakeoff = isBranchTakeoffFitting(fittingKey);
  const teeContinuation = isBranchTakeoff ? 'branch' : (document.getElementById('modalTeePathContinuation')?.value || 'trunk');
  const bShape = getTeeBranchShape(fittingKey);
  let branchWidth = null;
  let branchHeight = null;
  let branchDia = null;

  if (bShape === 'round') {
    branchDia = parseFloat(document.getElementById('modalTeeBranchDia')?.value) || parseFloat(document.getElementById('modalTeeBranchHeight')?.value) || null;
    branchWidth = branchDia;
    branchHeight = branchDia;
  } else {
    branchWidth = parseFloat(document.getElementById('modalTeeBranchWidth')?.value) || null;
    branchHeight = parseFloat(document.getElementById('modalTeeBranchHeight')?.value) || null;
    if (branchWidth && branchHeight) {
      branchDia = Math.round(calcHuebscherDe(branchWidth, branchHeight) * 10) / 10 || 14;
    }
  }

  let leavingWidth = null;
  let leavingHeight = null;
  const leavingWidthInput = document.getElementById('modalLeavingWidth');
  const leavingHeightInput = document.getElementById('modalLeavingHeight');
  if (leavingWidthInput && leavingWidthInput.value !== '' && !isNaN(parseFloat(leavingWidthInput.value))) {
    leavingWidth = parseFloat(leavingWidthInput.value);
  }
  if (leavingHeightInput && leavingHeightInput.value !== '' && !isNaN(parseFloat(leavingHeightInput.value))) {
    leavingHeight = parseFloat(leavingHeightInput.value);
  }

  let leavingDia = null;
  const leavingDiaInput = document.getElementById('modalLeavingDia');
  if (leavingDiaInput && leavingDiaInput.value !== '' && !isNaN(parseFloat(leavingDiaInput.value))) {
    leavingDia = parseFloat(leavingDiaInput.value);
  }

  const isTrans = isTransitionFitting(fittingKey);
  let leavingShape = 'rect';
  const transAngle = document.getElementById('modalTransitionAngleSelect')?.value || '30';

  if (isTrans) {
    const geom = getTransitionGeometry(fittingKey);
    leavingShape = geom.downstream;
  }

  // Ensure latest aerodynamics calculation is run and capture geometry
  const aeroResult = (typeof updateModalFittingAerodynamics === 'function') ? updateModalFittingAerodynamics() : null;

  let shape = isRoundFitting(fittingKey) ? 'round' : 'rect';
  let dia = null;
  let radius = null;
  let width = null;
  let height = null;
  let isVanes = true;

  if (isTrans) {
    const geom = getTransitionGeometry(fittingKey);
    if (geom.upstream === 'round') {
      const curDims = getCurrentDownstreamDims();
      dia = (curDims.shape === 'round' && curDims.dia) ? curDims.dia : (parseFloat(document.getElementById('modalInitialDia')?.value) || 14);
      width = dia;
      height = dia;
      shape = 'round';
    } else {
      const curDims = getCurrentDownstreamDims();
      width = curDims.w || 18;
      height = curDims.h || 12;
      dia = Math.round(calcHuebscherDe(width, height) * 10) / 10;
      shape = 'rect';
    }
  } else if (isRoundFitting(fittingKey)) {
    dia = parseFloat(document.getElementById('modalRoundDia')?.value) || null;
    radius = parseFloat(document.getElementById('modalRoundRadius')?.value) || null;
  } else if (fittingKey.startsWith('3')) {
    width = parseFloat(document.getElementById('modalRectRadiusW')?.value) || null;
    height = parseFloat(document.getElementById('modalRectRadiusH')?.value) || null;
    radius = parseFloat(document.getElementById('modalRectRadiusR')?.value) || null;
  } else if (fittingKey.startsWith('2')) {
    width = parseFloat(document.getElementById('modalElbowWidth')?.value) || null;
    height = parseFloat(document.getElementById('modalElbowHeight')?.value) || null;
    isVanes = (document.getElementById('modalFittingVanesSelect')?.value !== 'without_vanes');
  }

  const extraGeometry = {
    calculatedEL: (aeroResult && aeroResult.el !== undefined && aeroResult.el !== null) ? aeroResult.el : null,
    ratioLabel: (aeroResult && aeroResult.ratioLabel) ? aeroResult.ratioLabel : paramKey,
    shape: shape,
    dia: dia,
    radius: radius,
    width: width,
    height: height,
    isVanes: isVanes,
    branchDia: branchDia,
    branchWidth: branchWidth,
    branchHeight: branchHeight,
    branchShape: bShape
  };

  if (fittingKey !== 'custom_fitting' && aeroResult && aeroResult.ratioLabel) {
    paramKey = aeroResult.ratioLabel;
  }

  // Check if we are in EDIT MODE
  if (editingFittingRowId !== null) {
    const row = chainedScheduleRows.find(r => r.id === editingFittingRowId);
    if (row) {
      const map = getAllFittingsMap();
      const def = map[fittingKey];
      const isCustom = (fittingKey === 'custom_fitting');
      const isTee = isTeeFitting(fittingKey);
      const isFlex = fittingKey.includes('flex');

      row.fittingKey = fittingKey;
      row.path = path;
      row.paramKey = paramKey;
      row.angle = angle;
      row.name = customName || (def ? def.name : fittingKey);
      row.customName = customName || null;
      row.type = isCustom ? 'custom_fitting' : (isTee ? 'tee_branch' : (isTrans ? 'transition' : (isFlex ? 'flex_drop' : 'fitting')));

      if (isCustom) {
        row.baseEL = customEL;
      } else if (aeroResult && aeroResult.el !== null && aeroResult.el !== undefined && !isNaN(aeroResult.el)) {
        row.baseEL = aeroResult.el;
      } else if (def && def.options && def.options[paramKey] !== undefined) {
        row.baseEL = def.options[paramKey];
        if (def.hasAngleFactor && angle && DUCT_LOSS_DATA.miteredAngleFactors && DUCT_LOSS_DATA.miteredAngleFactors[angle]) {
          row.baseEL = Math.round(row.baseEL * DUCT_LOSS_DATA.miteredAngleFactors[angle]);
        }
      }

      row.shape = shape;
      if (dia) {
        row.dia = dia;
        row.hasCustomDia = true;
      }
      if (radius !== null) row.radius = radius;
      if (width) {
        row.width = width;
        row.hasCustomDims = true;
      }
      if (height) {
        row.height = height;
        row.hasCustomDims = true;
      }
      row.isVanes = isVanes;

      if (isTee) {
        row.branchCFM = branchCFM;
        row.teeContinuation = isBranchTakeoff ? 'branch' : teeContinuation;
        row.branchShape = bShape;
        row.branchWidth = branchWidth;
        row.branchHeight = branchHeight;
        row.branchDia = branchDia;
      }

      if (isTrans) {
        row.leavingWidth = leavingWidth;
        row.leavingHeight = leavingHeight;
        row.leavingDia = leavingDia;
        row.leavingShape = leavingShape;
        row.transAngle = transAngle;
      }
    }
    closeAddFittingModal();
    calculateDuctLoss();
    renderFittingsTable();
    if (typeof showToast === 'function') {
      showToast('Fitting Updated', `Saved changes to ${row?.name || 'fitting'}.`);
    }
    if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
    return;
  }

  // Check if starting the schedule with a fitting
  let initialCriteria = null;
  if (chainedScheduleRows.length === 0) {
    let initShape = document.getElementById('modalInitialShape')?.value || (isRoundFitting(fittingKey) ? 'round' : 'rect');
    let initW = Math.max(2, parseFloat(document.getElementById('modalInitialWidth')?.value) || 18);
    let initH = Math.max(2, parseFloat(document.getElementById('modalInitialHeight')?.value) || 12);
    let initDia = Math.max(2, parseFloat(document.getElementById('modalInitialDia')?.value) || 14);

    if (dia) {
      initDia = dia;
      if (isRoundFitting(fittingKey)) initShape = 'round';
    }
    if (width) initW = width;
    if (height) initH = height;

    const initialCFM = Math.max(10, parseFloat(document.getElementById('modalInitialCFM')?.value) || parseFloat(document.getElementById('ductLossCFM')?.value) || 1200);
    const mainCFMEl = document.getElementById('ductLossCFM');
    if (mainCFMEl) mainCFMEl.value = initialCFM;

    const area = calcDuctArea(initW, initH, initShape, initDia);
    const de = (initShape === 'round') ? initDia : calcHuebscherDe(initW, initH);
    const initVel = calcDuctVelocity(initialCFM, area);
    const initDFL = calcStraightDuctFrictionRate(initialCFM, de);

    initialCriteria = {
      shape: initShape,
      w: (initShape === 'round') ? initDia : initW,
      h: (initShape === 'round') ? initDia : initH,
      dia: initDia,
      targetVel: initVel,
      targetDFL: initDFL
    };
  }

  // Check for aerodynamic shape mismatch with preceding item
  let mismatchWarning = null;
  if (chainedScheduleRows.length > 0 && editingFittingRowId === null) {
    const prevRow = chainedScheduleRows[chainedScheduleRows.length - 1];
    const prevShape = getRowLeavingShape(prevRow);
    const enteringShape = getFittingEnteringShape(fittingKey);
    if (prevShape && enteringShape && prevShape !== enteringShape) {
      mismatchWarning = { prevShape, enteringShape };
    }
  }

  addFittingRow(
    fittingKey, path, paramKey, qty, angle, customName, customEL,
    branchCFM, leavingWidth, leavingHeight, leavingDia, leavingShape,
    teeContinuation, branchWidth, branchHeight, transAngle, initialCriteria,
    extraGeometry
  );

  closeAddFittingModal();

  const map = getAllFittingsMap();
  const def = map[fittingKey];
  const fittingName = customName || (def ? def.name : fittingKey);
  const pathLabel = path === 'return' ? 'Return Path' : 'Supply Path';

  if (typeof showToast === 'function') {
    if (mismatchWarning) {
      const fromLabel = (mismatchWarning.prevShape === 'rect') ? 'Rectangular' : 'Round';
      const toLabel = (mismatchWarning.enteringShape === 'rect') ? 'Rectangular' : 'Round';
      const transName = (mismatchWarning.prevShape === 'rect') ? 'Fitting 9d (Rect → Round)' : 'Fitting 9c (Round → Rect)';
      showToast(
        'Fitting Added (Transition Needed)',
        `Added ${qty}x ${fittingName}. Preceding ductwork is ${fromLabel} while this fitting is ${toLabel}. Remember to insert a transition (${transName}).`,
        'warning'
      );
    } else {
      showToast('Added to Schedule', `Added ${qty}x ${fittingName} to ${pathLabel}.`);
    }
  }
}

function onTotalCFMChange() {
  calculateDuctLoss();
  renderFittingsTable();
  if (typeof saveActiveDraftState === 'function') saveActiveDraftState();
}

// Global click listener to close Add Fitting dropdown when clicking outside
document.addEventListener('click', (e) => {
  const container = document.getElementById('addFittingDropdownContainer');
  if (container && !container.contains(e.target)) {
    closeAddFittingDropdown();
  }
});

// -------------------------------------------------------------------
// SEQUENTIAL TAB KEY NAVIGATION FOR SCHEDULE VARIABLES
// -------------------------------------------------------------------
function handleScheduleFieldKeydown(e) {
  if (e.key !== 'Tab' && e.key !== 'Enter') return;
  const target = e.target;
  if (!target || !target.classList.contains('schedule-field-input')) return;

  e.preventDefault();

  const tbody = document.getElementById('fittingsTableBody');
  if (!tbody) return;
  const allInputs = Array.from(tbody.querySelectorAll('.schedule-field-input'));
  const currIdx = allInputs.indexOf(target);
  if (currIdx === -1) return;

  const total = allInputs.length;
  if (total === 0) return;

  const isBackwards = e.shiftKey;
  const targetIdx = isBackwards ? (currIdx - 1 + total) % total : (currIdx + 1) % total;

  // Check if user changed the input value; if so, trigger change event to re-render calculations
  const hasChanged = (target.value !== target.defaultValue);
  if (hasChanged) {
    target.dispatchEvent(new Event('change'));
  }

  setTimeout(() => {
    const updatedInputs = Array.from(tbody.querySelectorAll('.schedule-field-input'));
    if (updatedInputs.length > 0) {
      const clampedIdx = Math.min(updatedInputs.length - 1, Math.max(0, targetIdx));
      const nextInput = updatedInputs[clampedIdx];
      if (nextInput) {
        nextInput.focus();
        if (typeof nextInput.select === 'function') {
          nextInput.select();
        }
      }
    }
  }, hasChanged ? 25 : 0);
}

// Global delegated keydown handler for schedule inputs
document.addEventListener('keydown', (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('schedule-field-input')) {
    handleScheduleFieldKeydown(e);
  }
});

// -------------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  populateAddFittingCategorySelect();
  populateAddFittingDropdown();

  // Render clean schedule or restore draft
  renderFittingsTable();
  renderComponentsTable();
  calculateDuctLoss();

  // Render Airflow Path overlays on catalog gallery and refresh overlay state
  renderGalleryAirflowOverlays();
  refreshAirflowOverlays();

  window.addEventListener('resize', () => {
    syncLightboxOverlayDimensions();
  });
});
