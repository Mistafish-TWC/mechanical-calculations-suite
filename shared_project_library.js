window.SHARED_PROJECT_LIBRARY = [
  {
    "metadata": {
      "projectName": "123",
      "author": "123",
      "lastModified": "2026-08-28T19:29:47.914Z",
      "savedDate": "2026-08-28T19:29:47.914Z"
    },
    "tool2": {
      "userModified": true,
      "flowRate": 165,
      "targetMode": "velocity",
      "targetVelocity": 6,
      "targetFriction": 4,
      "pipeMaterial": "carbon_steel",
      "pipeSchedule": "Schedule 40",
      "pipeRoughness": "140",
      "fluidType": "water",
      "temperature": 60,
      "glycolPct": 30,
      "systemLength": 250,
      "fittingAllowance": 50,
      "electricityRate": 0.12,
      "operatingHours": 8760,
      "systemEfficiency": 80
    }
  },
  {
    "metadata": {
      "projectName": "Testing 123",
      "author": "Michael Salmon",
      "lastModified": "2026-08-31T12:23:02.901Z",
      "savedDate": "2026-08-26T18:18:11.618Z"
    },
    "tool5": {
      "userModified": true,
      "fuelType": "natural_gas",
      "material": "sch40_steel",
      "pressureMode": "0.5",
      "allowableDrop": "0.5",
      "loadUnit": "btu",
      "loadValue": 500000,
      "sizingLength": 100,
      "fittingPct": 20,
      "maxVelocity": 30,
      "fuelTypeLL": "natural_gas",
      "materialLL": "sch40_steel",
      "pressureModeLL": "0.5",
      "allowableDropLL": "0.5",
      "sizingLengthLL": 750,
      "fittingPctLL": 20,
      "applianceConnLengthLL": 20,
      "scheduleLoadUnit": "mbh",
      "gasNetworkRows": [
        {
          "id": "unit_a",
          "desc": "Unit A",
          "branch": "main",
          "loadVal": 100
        },
        {
          "id": "unit_b",
          "desc": "Unit B",
          "branch": "main",
          "loadVal": 100
        },
        {
          "id": "unit_c",
          "desc": "Unit C (Branch 1 End)",
          "branch": "branch_1",
          "loadVal": 100
        },
        {
          "id": "unit_d",
          "desc": "Unit D",
          "branch": "branch_1",
          "loadVal": 100
        },
        {
          "id": "unit_e",
          "desc": "Unit E",
          "branch": "branch_1",
          "loadVal": 200
        }
      ]
    },
    "tool1": {
      "userModified": false,
      "fixtureRows": [
        {
          "id": 1,
          "isCustom": false,
          "key": "lavatory",
          "qty": 16
        },
        {
          "id": 2,
          "isCustom": false,
          "key": "wc_valve",
          "qty": 9
        },
        {
          "id": 3,
          "isCustom": false,
          "key": "lavatory",
          "qty": 1
        }
      ],
      "activeCode": "UPC",
      "activeSystem": "valve",
      "materialFamily": "copper",
      "materialType": "type_l",
      "drainType": "horizontal",
      "drainSlope": "1_4",
      "continuousGPM": 0,
      "customColdVelocity": null,
      "customHotVelocity": null
    },
    "tool2": {
      "userModified": true,
      "flowRate": 50,
      "targetMode": "velocity",
      "targetVelocity": 6,
      "targetFriction": 4,
      "pipeMaterial": "carbon_steel",
      "pipeSchedule": "Schedule 40",
      "pipeRoughness": "140",
      "fluidType": "propylene",
      "temperature": 30,
      "glycolPct": 30,
      "systemLength": 250,
      "fittingAllowance": 50,
      "electricityRate": 0.12,
      "operatingHours": 8760,
      "systemEfficiency": 80
    },
    "tool3": {
      "userModified": true,
      "citySelect": "3.4",
      "rainfallRate": 3.4,
      "qsPipeSlope": "0.125",
      "qsPipeMaterial": "0.009",
      "roofArea": 25000,
      "numDrains": 6,
      "wallAreas": [
        0
      ],
      "scheduleRows": [
        {
          "id": "Zone A - Drain 1",
          "roofArea": 5000,
          "wallArea": 0
        },
        {
          "id": "Zone B - Drain 2",
          "roofArea": 5000,
          "wallArea": 0
        },
        {
          "id": "Zone C - Drain 3",
          "roofArea": 5000,
          "wallArea": 0
        },
        {
          "id": "Zone D - Drain 4",
          "roofArea": 5000,
          "wallArea": 0
        },
        {
          "id": "Zone E - Drain 5",
          "roofArea": 5000,
          "wallArea": 0
        }
      ]
    }
  },
  {
    "metadata": {
      "projectName": "OWL - Fixture Sizing 2",
      "author": "Michael Salmon",
      "lastModified": "2026-08-28T19:07:13.650Z",
      "savedDate": "2026-08-28T19:07:13.651Z"
    },
    "tool1": {
      "userModified": false,
      "fixtureRows": [
        {
          "id": 1,
          "isCustom": false,
          "key": "lavatory",
          "qty": 36
        },
        {
          "id": 2,
          "isCustom": false,
          "key": "wc_valve",
          "qty": 33
        },
        {
          "id": 3,
          "isCustom": false,
          "key": "bathtub_fill_heavy",
          "qty": 3
        },
        {
          "id": 4,
          "isCustom": false,
          "key": "service_sink",
          "qty": 1
        },
        {
          "id": 5,
          "isCustom": false,
          "key": "lavatory",
          "qty": 1
        }
      ],
      "activeCode": "IPC",
      "activeSystem": "valve",
      "materialFamily": "copper",
      "materialType": "type_l",
      "drainType": "horizontal",
      "drainSlope": "1_4",
      "continuousGPM": 0,
      "customColdVelocity": null,
      "customHotVelocity": null
    },
    "tool2": {
      "userModified": true,
      "flowRate": 1,
      "targetMode": "friction",
      "targetVelocity": 6,
      "targetFriction": 4,
      "pipeMaterial": "carbon_steel",
      "pipeSchedule": "Schedule 40",
      "pipeRoughness": "120",
      "fluidType": "water",
      "temperature": 60,
      "glycolPct": 30,
      "systemLength": 400,
      "fittingAllowance": 50,
      "electricityRate": 0.12,
      "operatingHours": 8760,
      "systemEfficiency": 80
    },
    "tool4": {
      "userModified": true,
      "activeDuctMode": "friction",
      "currentDuctCFM": 150,
      "currentDuctFriction": 0.08,
      "currentDuctVelocity": 547.5158729244642,
      "currentDuctX": 4,
      "currentDuctY": 12
    },
    "tool3": {
      "userModified": true,
      "citySelect": "3.4",
      "rainfallRate": 3.4,
      "qsPipeSlope": "0.125",
      "qsPipeMaterial": "0.009",
      "roofArea": 25000,
      "numDrains": 6,
      "wallAreas": [
        0
      ],
      "scheduleRows": [
        {
          "id": "Zone A - Drain 1",
          "roofArea": 5000,
          "wallArea": 0
        },
        {
          "id": "Zone B - Drain 2",
          "roofArea": 5000,
          "wallArea": 0
        }
      ]
    },
    "tool5": {
      "userModified": true,
      "fuelType": "natural_gas",
      "material": "sch40_steel",
      "pressureMode": "0.5",
      "allowableDrop": "0.5",
      "loadUnit": "btu",
      "loadValue": 500000,
      "sizingLength": 100,
      "fittingPct": 20,
      "maxVelocity": 30,
      "fuelTypeLL": "natural_gas",
      "materialLL": "sch40_steel",
      "pressureModeLL": "0.5",
      "allowableDropLL": "0.5",
      "sizingLengthLL": 300,
      "fittingPctLL": 20,
      "applianceConnLengthLL": 20,
      "scheduleLoadUnit": "mbh",
      "gasNetworkRows": [
        {
          "id": "unit_a",
          "desc": "Unit A (Longest Run)",
          "branch": "main",
          "loadVal": 100
        },
        {
          "id": "unit_b",
          "desc": "Unit B",
          "branch": "main",
          "loadVal": 250
        },
        {
          "id": "unit_c",
          "desc": "Unit C (Branch 1 End)",
          "branch": "branch_1",
          "loadVal": 300
        },
        {
          "id": "unit_d",
          "desc": "Unit D (Branch 1 Tap)",
          "branch": "branch_1",
          "loadVal": 50
        },
        {
          "id": "unit_e",
          "desc": "Unit E",
          "branch": "main",
          "loadVal": 170
        },
        {
          "id": "unit_f",
          "desc": "Unit F (Branch 2 End)",
          "branch": "branch_2",
          "loadVal": 80
        },
        {
          "id": "unit_g",
          "desc": "Unit G (Branch 2 Mid)",
          "branch": "branch_2",
          "loadVal": 450
        },
        {
          "id": "unit_h",
          "desc": "Unit H (Branch 2 Tap)",
          "branch": "branch_2",
          "loadVal": 150
        },
        {
          "id": "unit_i",
          "desc": "Unit I (Nearest Meter)",
          "branch": "main",
          "loadVal": 50
        }
      ]
    }
  },
  {
    "metadata": {
      "projectName": "my test",
      "author": "TO",
      "lastModified": "2026-08-24T20:19:51.149Z",
      "savedDate": "2026-08-24T20:19:51.149Z"
    },
    "tool1": {
      "userModified": false,
      "fixtureRows": [],
      "activeCode": "IPC",
      "activeSystem": "valve",
      "materialFamily": "copper",
      "materialType": "type_l",
      "drainType": "horizontal",
      "drainSlope": "1_4",
      "continuousGPM": 0,
      "customColdVelocity": null,
      "customHotVelocity": null
    },
    "tool2": {
      "userModified": false,
      "flowRate": 150,
      "targetMode": "velocity",
      "targetVelocity": 6,
      "targetFriction": 4,
      "pipeMaterial": "carbon_steel",
      "pipeSchedule": "Schedule 40",
      "pipeRoughness": "140",
      "fluidType": "water",
      "temperature": 60,
      "glycolPct": 30,
      "systemLength": 250,
      "fittingAllowance": 50,
      "electricityRate": 0.12,
      "operatingHours": 8760,
      "systemEfficiency": 80
    },
    "tool3": {
      "userModified": true,
      "citySelect": "3.4",
      "rainfallRate": 3.4,
      "qsPipeSlope": "0.125",
      "qsPipeMaterial": "0.009",
      "roofArea": 25000,
      "numDrains": 6,
      "wallAreas": [
        0
      ],
      "scheduleRows": [
        {
          "id": "Zone A - Drain 1",
          "roofArea": 5000,
          "wallArea": 0
        },
        {
          "id": "Zone B - Drain 2",
          "roofArea": 5000,
          "wallArea": 0
        }
      ]
    },
    "tool5": {
      "userModified": true,
      "fuelType": "natural_gas",
      "material": "sch40_steel",
      "pressureMode": "2.0",
      "allowableDrop": "1.0_psi",
      "loadUnit": "mbh",
      "loadValue": 250,
      "sizingLength": 255,
      "fittingPct": 20,
      "maxVelocity": 30,
      "fuelTypeLL": "natural_gas",
      "materialLL": "sch40_steel",
      "pressureModeLL": "0.5",
      "allowableDropLL": "1.0_psi",
      "sizingLengthLL": 263,
      "fittingPctLL": 20,
      "scheduleLoadUnit": "btuh",
      "gasNetworkRows": [
        {
          "desc": "Farthest Equipment Unit A",
          "loadVal": 150000
        },
        {
          "desc": "Upstream Appliance B",
          "loadVal": 200000
        },
        {
          "desc": "Upstream Appliance C",
          "loadVal": 150000
        },
        {
          "desc": "Upstream Appliance D",
          "loadVal": 150000
        }
      ]
    }
  },
  {
    "metadata": {
      "projectName": "OWL - Fixture Sizing",
      "author": "Michael Salmon",
      "lastModified": "2026-08-24T17:50:39.651Z",
      "savedDate": "2026-08-24T17:50:39.651Z"
    },
    "tool1": {
      "userModified": false,
      "fixtureRows": [
        {
          "id": 1,
          "isCustom": false,
          "key": "lavatory",
          "qty": 36
        },
        {
          "id": 2,
          "isCustom": false,
          "key": "wc_valve",
          "qty": 33
        },
        {
          "id": 3,
          "isCustom": false,
          "key": "bathtub_fill_heavy",
          "qty": 3
        },
        {
          "id": 4,
          "isCustom": false,
          "key": "service_sink",
          "qty": 1
        },
        {
          "id": 5,
          "isCustom": false,
          "key": "lavatory",
          "qty": 1
        }
      ],
      "activeCode": "IPC",
      "activeSystem": "valve",
      "materialFamily": "copper",
      "materialType": "type_l",
      "drainType": "horizontal",
      "drainSlope": "1_4",
      "continuousGPM": 0,
      "customColdVelocity": null,
      "customHotVelocity": null
    }
  }
];
