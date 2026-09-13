/**
 * WarrantyEase Client Claim Taxonomy & Offline Fallback Dataset
 * Mirror of the relational SQLite database taxonomy for seamless offline operation.
 * All cartoon emojis removed. Comprehensive coverage for Physical Devices, Health Insurance,
 * Motor Insurance, and General Insurance.
 */

export const TAXONOMY_CATEGORIES = [
  {
    id: 'home_appliances',
    name: 'Home Appliances',
    icon: '',
    subcategories: [
      { id: 'cat_washing_machine', name: 'Washing Machine', icon: '' },
      { id: 'cat_refrigerator', name: 'Refrigerator', icon: '' },
      { id: 'cat_ac', name: 'Air Conditioner', icon: '' },
      { id: 'cat_microwave', name: 'Microwave Oven', icon: '' },
      { id: 'cat_dishwasher', name: 'Dishwasher', icon: '' }
    ]
  },
  {
    id: 'consumer_electronics',
    name: 'Consumer Electronics',
    icon: '',
    subcategories: [
      { id: 'cat_smartphone', name: 'Smartphone', icon: '' },
      { id: 'cat_tv', name: 'Television', icon: '' },
      { id: 'cat_laptop', name: 'Laptop & Computer', icon: '' },
      { id: 'cat_tablet', name: 'Tablet / iPad', icon: '' },
      { id: 'cat_monitor', name: 'Monitor & Display', icon: '' }
    ]
  },
  {
    id: 'personal_electronics',
    name: 'Personal Electronics & Audio',
    icon: '',
    subcategories: [
      { id: 'cat_audio', name: 'Headphones & Audio', icon: '' },
      { id: 'cat_wearables', name: 'Smartwatches & Wearables', icon: '' }
    ]
  },
  {
    id: 'vehicles',
    name: 'Vehicles & Mobility',
    icon: '',
    subcategories: [
      { id: 'cat_car', name: 'Car / Four Wheeler', icon: '' },
      { id: 'cat_motorcycle', name: 'Two Wheeler / Motorcycle', icon: '' }
    ]
  },
  {
    id: 'insurance_vault',
    name: 'Insurance Policies',
    icon: '',
    subcategories: [
      { id: 'cat_ins_health', name: 'Health Insurance', icon: '' },
      { id: 'cat_ins_motor', name: 'Motor Insurance', icon: '' },
      { id: 'cat_ins_travel', name: 'Travel Insurance', icon: '' },
      { id: 'cat_ins_property', name: 'Property / Home Insurance', icon: '' },
      { id: 'cat_ins_general', name: 'General Insurance', icon: '' }
    ]
  },
  {
    id: 'cat_generic',
    name: 'General Products & Equipment',
    icon: '',
    subcategories: []
  }
];

export const ISSUES_BY_CATEGORY = {
  // ─── Health Insurance ─────────────────────────────────────────
  cat_ins_health: [
    { id: 'health_cashless_preauth', name: 'Cashless Hospitalization (Pre-Authorization)', icon: '', description: 'Request planned or emergency cashless hospital admission approval through TPA network desk', severity: 'HIGH' },
    { id: 'health_reimbursement', name: 'Hospital Reimbursement Claim (Post-Discharge)', icon: '', description: 'Claim refund for hospital bills, doctor fees, and treatments paid directly out-of-pocket', severity: 'HIGH' },
    { id: 'health_daycare_procedure', name: 'Day Care Procedure / Surgery', icon: '', description: 'Treatments requiring hospital stay under 24 hours (e.g. Cataract, Dialysis, Chemo, Minor Surgery)', severity: 'MEDIUM' },
    { id: 'health_pre_post_expenses', name: 'Pre & Post Hospitalization Medical Bills', icon: '', description: 'Medical expenses, diagnostic tests, and pharmacy bills incurred 30-60 days before or after admission', severity: 'MEDIUM' },
    { id: 'health_accidental_emergency', name: 'Accidental Injury & Emergency Trauma Care', icon: '', description: 'Emergency hospital casualty care following road accidents, fractures, burns, or physical trauma', severity: 'CRITICAL' },
    { id: 'health_critical_illness', name: 'Critical Illness Lump-Sum Benefit', icon: '', description: 'Lump-sum policy payout claim for diagnosed critical conditions (Cancer, Cardiac Arrest, Renal Failure, Stroke)', severity: 'HIGH' },
    { id: 'health_other', name: 'Other Health Insurance Claim', icon: '', description: 'OPD consultation, diagnostic tests, ambulance fee, or other policy benefit', severity: 'MEDIUM' },
    { id: 'health_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe medical incident, hospital stay, or treatment in your own words', severity: 'MEDIUM' }
  ],

  // ─── Motor Insurance ──────────────────────────────────────────
  cat_ins_motor: [
    { id: 'motor_accident_collision', name: 'Vehicle Collision & Accident Damage', icon: '', description: 'Damage from collision with another vehicle, divider, wall, or road object', severity: 'HIGH' },
    { id: 'motor_body_dent_paint', name: 'Bumper, Denting & Scratch Damage', icon: '', description: 'External body panel scratches, dents, fender damage, or parking mishaps', severity: 'MEDIUM' },
    { id: 'motor_windshield_glass', name: 'Windshield, Window & Mirror Damage', icon: '', description: 'Cracked or shattered front windshield, rear glass, side windows, or side-view mirrors', severity: 'MEDIUM' },
    { id: 'motor_engine_hydro_lock', name: 'Engine Trouble & Water Ingress (Hydro-Lock)', icon: '', description: 'Engine stalled in waterlogged road, flood water ingress, or sump damage (Engine Protect Add-on)', severity: 'CRITICAL' },
    { id: 'motor_theft_total_loss', name: 'Vehicle Theft / Total Loss', icon: '', description: 'Stolen vehicle, stolen catalytic converter/tires, or complete fire/submersion total loss', severity: 'CRITICAL' },
    { id: 'motor_rsa_towing', name: 'Roadside Assistance (RSA) & Towing', icon: '', description: 'Flat tire, dead battery jumpstart, vehicle lockout, or emergency breakdown towing', severity: 'HIGH' },
    { id: 'motor_other', name: 'Other Motor Insurance Claim', icon: '', description: 'Damage or policy claim not listed above', severity: 'MEDIUM' },
    { id: 'motor_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe accident or vehicle problem in your own words', severity: 'MEDIUM' }
  ],

  // ─── General Insurance Fallback ───────────────────────────────
  cat_ins_general: [
    { id: 'ins_gen_claim', name: 'Policy Claim / Loss Event', icon: '', description: 'File a claim for loss, damage, hospitalization, or covered policy incident', severity: 'HIGH' },
    { id: 'ins_gen_reimbursement', name: 'Reimbursement Claim', icon: '', description: 'Claim refund for expenses paid directly out-of-pocket', severity: 'HIGH' },
    { id: 'ins_gen_cashless', name: 'Cashless Settlement Request', icon: '', description: 'Request cashless settlement through authorized service network', severity: 'MEDIUM' },
    { id: 'ins_gen_other', name: 'Other Insurance Claim', icon: '', description: 'Policy claim or inquiry not listed above', severity: 'MEDIUM' },
    { id: 'ins_gen_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe policy incident in your own words', severity: 'MEDIUM' }
  ],

  // ─── Washing Machine ──────────────────────────────────────────
  cat_washing_machine: [
    { id: 'wm_not_turning_on', name: 'Machine not turning on', icon: '', description: 'Completely unresponsive, no power lights or sounds', severity: 'HIGH' },
    { id: 'wm_not_filling', name: 'Not filling with water', icon: '', description: 'Water does not enter the drum during cycle', severity: 'MEDIUM' },
    { id: 'wm_not_draining', name: 'Water not draining', icon: '', description: 'Drum remains filled with water, drain pump failed', severity: 'HIGH' },
    { id: 'wm_not_spinning', name: 'Not spinning', icon: '', description: 'Drum agitates but fails to spin at high speed', severity: 'MEDIUM' },
    { id: 'wm_unusual_noise', name: 'Making unusual noise', icon: '', description: 'Loud grinding, banging, squealing or metal noise', severity: 'MEDIUM' },
    { id: 'wm_water_leakage', name: 'Water leaking', icon: '', description: 'Water pooling on floor around machine during wash', severity: 'CRITICAL' },
    { id: 'wm_not_heating', name: 'Not heating water', icon: '', description: 'Heater failure during warm or sanitize wash cycle', severity: 'LOW' },
    { id: 'wm_not_cleaning', name: 'Not cleaning clothes properly', icon: '', description: 'Detergent not dispensing, clothes come out dirty', severity: 'LOW' },
    { id: 'wm_door_lid', name: 'Door / lid problem', icon: '', description: 'Door jammed, latch broken, or won\'t lock/unlock', severity: 'HIGH' },
    { id: 'wm_display_error', name: 'Display / error code', icon: '', description: 'Error code blinking on screen (e.g., 4E, 5E, dE, UE)', severity: 'MEDIUM' },
    { id: 'wm_vibration', name: 'Vibration / excessive shaking', icon: '', description: 'Machine walks across floor or shakes violently on spin', severity: 'MEDIUM' },
    { id: 'wm_electrical', name: 'Electrical / tripping problem', icon: '', description: 'Trips home circuit breaker, electrical burning odor', severity: 'CRITICAL' },
    { id: 'wm_other', name: 'Other problem', icon: '', description: 'Issue not listed above', severity: 'MEDIUM' },
    { id: 'wm_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe the problem in your own words', severity: 'MEDIUM' }
  ],

  // ─── Smartphone ───────────────────────────────────────────────
  cat_smartphone: [
    { id: 'phone_screen', name: 'Screen / display defect', icon: '', description: 'Cracked glass, black screen, lines, flickering, touch failure', severity: 'HIGH' },
    { id: 'phone_battery', name: 'Battery draining rapidly', icon: '', description: 'Battery drops quickly, dies at 20-30%, swollen battery', severity: 'MEDIUM' },
    { id: 'phone_charging', name: 'Charging problem', icon: '', description: 'Doesn\'t charge, slow charging, port loose, cable not recognized', severity: 'MEDIUM' },
    { id: 'phone_camera', name: 'Camera issue', icon: '', description: 'Blurry lens, black viewfinder, camera app crashes, focus buzzing', severity: 'LOW' },
    { id: 'phone_speaker_mic', name: 'Speaker / microphone', icon: '', description: 'No audio on calls, crackling sound, other party can\'t hear me', severity: 'MEDIUM' },
    { id: 'phone_network', name: 'Network / connectivity', icon: '', description: 'No SIM detected, dropping cellular signal, mobile data fails', severity: 'MEDIUM' },
    { id: 'phone_wifi', name: 'Wi-Fi / Bluetooth failure', icon: '', description: 'Cannot toggle Wi-Fi on, Bluetooth drops disconnects', severity: 'LOW' },
    { id: 'phone_buttons', name: 'Buttons / physical controls', icon: '', description: 'Power button stuck, volume rocker unresponsive', severity: 'LOW' },
    { id: 'phone_biometrics', name: 'Fingerprint / Face Unlock', icon: '', description: 'Scanner fails to register or recognize biometrics', severity: 'LOW' },
    { id: 'phone_liquid', name: 'Water / liquid damage', icon: '', description: 'Liquid ingress, moisture detected warning on port', severity: 'CRITICAL' },
    { id: 'phone_overheating', name: 'Excessive overheating', icon: '', description: 'Device becomes burning hot during light tasks', severity: 'HIGH' },
    { id: 'phone_shutdown', name: 'Random restart / shutdown', icon: '', description: 'Phone restarts unexpectedly or stuck on boot loop logo', severity: 'HIGH' },
    { id: 'phone_software', name: 'Software / performance lag', icon: '', description: 'Extreme freezing, apps constantly crashing', severity: 'LOW' },
    { id: 'phone_other', name: 'Other phone issue', icon: '', description: 'Problem not listed above', severity: 'MEDIUM' },
    { id: 'phone_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe the problem in your own words', severity: 'MEDIUM' }
  ],

  // ─── Television ───────────────────────────────────────────────
  cat_tv: [
    { id: 'tv_screen', name: 'Screen / display defect', icon: '', description: 'Cracked glass, distorted colors, dead pixels, patches', severity: 'HIGH' },
    { id: 'tv_no_picture', name: 'No picture but sound works', icon: '', description: 'Backlight failure, screen is black but audio works', severity: 'HIGH' },
    { id: 'tv_lines_flickering', name: 'Lines or flickering picture', icon: '', description: 'Horizontal/vertical lines across screen, flickering', severity: 'MEDIUM' },
    { id: 'tv_sound', name: 'Sound / audio problem', icon: '', description: 'No sound, distorted audio, buzzing or crackling from speakers', severity: 'MEDIUM' },
    { id: 'tv_power', name: 'Power / will not turn on', icon: '', description: 'Power LED off or blinking, TV unresponsive', severity: 'HIGH' },
    { id: 'tv_hdmi', name: 'HDMI / input port problem', icon: '', description: 'No signal from set-top box, gaming console or PC', severity: 'LOW' },
    { id: 'tv_remote', name: 'Remote control problem', icon: '', description: 'TV does not respond to remote or IR sensor failed', severity: 'LOW' },
    { id: 'tv_wifi', name: 'Wi-Fi / network connection', icon: '', description: 'Cannot connect to home Wi-Fi or stream videos', severity: 'LOW' },
    { id: 'tv_apps', name: 'Smart TV apps / software', icon: '', description: 'Apps freeze, TV restarts during streaming', severity: 'LOW' },
    { id: 'tv_other', name: 'Other TV issue', icon: '', description: 'Other fault not listed above', severity: 'MEDIUM' },
    { id: 'tv_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe the problem in your own words', severity: 'MEDIUM' }
  ],

  // ─── Refrigerator ─────────────────────────────────────────────
  cat_refrigerator: [
    { id: 'fridge_not_cooling', name: 'Not cooling / warm interior', icon: '', description: 'Neither compartment is cold, food spoiling', severity: 'CRITICAL' },
    { id: 'fridge_insufficient', name: 'Insufficient cooling', icon: '', description: 'Cooling is very weak or uneven', severity: 'HIGH' },
    { id: 'fridge_freezing', name: 'Freezing in fresh food area', icon: '', description: 'Vegetables and milk freezing solid in fridge compartment', severity: 'MEDIUM' },
    { id: 'fridge_water_leakage', name: 'Water leaking / pooling', icon: '', description: 'Water puddling under crisper or on kitchen floor', severity: 'HIGH' },
    { id: 'fridge_ice_making', name: 'Ice-maker not working', icon: '', description: 'No ice produced or dispenser jammed', severity: 'LOW' },
    { id: 'fridge_door_seal', name: 'Door / seal problem', icon: '', description: 'Door gasket torn or won\'t seal shut, condensation buildup', severity: 'MEDIUM' },
    { id: 'fridge_noise', name: 'Unusual compressor noise', icon: '', description: 'Loud buzzing, rattling or clicking sound from rear', severity: 'MEDIUM' },
    { id: 'fridge_power', name: 'Power / completely dead', icon: '', description: 'No interior lights, compressor silent, no power', severity: 'HIGH' },
    { id: 'fridge_display', name: 'Display / error code', icon: '', description: 'Error code blinking on door panel', severity: 'MEDIUM' },
    { id: 'fridge_other', name: 'Other refrigerator issue', icon: '', description: 'Issue not listed above', severity: 'MEDIUM' },
    { id: 'fridge_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe the problem in your own words', severity: 'MEDIUM' }
  ],

  // ─── Air Conditioner ──────────────────────────────────────────
  cat_ac: [
    { id: 'ac_not_cooling', name: 'Not cooling / warm air', icon: '', description: 'Blower runs but room does not cool down', severity: 'HIGH' },
    { id: 'ac_weak_airflow', name: 'Weak airflow from indoor unit', icon: '', description: 'Air output is very low even at max fan speed', severity: 'MEDIUM' },
    { id: 'ac_water_leak', name: 'Water leaking from indoor unit', icon: '', description: 'Water dripping inside room on wall or floor', severity: 'HIGH' },
    { id: 'ac_ice', name: 'Ice formation on cooling coils', icon: '', description: 'Visible frost or ice buildup on indoor or outdoor pipes', severity: 'HIGH' },
    { id: 'ac_noise', name: 'Unusual noise or vibration', icon: '', description: 'Rattling blower or loud vibration from outdoor compressor', severity: 'MEDIUM' },
    { id: 'ac_power', name: 'Will not turn on / trips power', icon: '', description: 'Unit unresponsive or trips circuit breaker immediately', severity: 'CRITICAL' },
    { id: 'ac_remote', name: 'Remote control unresponsive', icon: '', description: 'AC does not respond to remote commands', severity: 'LOW' },
    { id: 'ac_error', name: 'Error code on display', icon: '', description: 'Error code flashing on indoor unit (e.g. E1, E4, F3)', severity: 'MEDIUM' },
    { id: 'ac_other', name: 'Other AC issue', icon: '', description: 'Problem not listed above', severity: 'MEDIUM' },
    { id: 'ac_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe the problem in your own words', severity: 'MEDIUM' }
  ],

  // ─── Laptop ───────────────────────────────────────────────────
  cat_laptop: [
    { id: 'laptop_screen', name: 'Screen / display defect', icon: '', description: 'Cracked screen, black screen, vertical lines, flickering', severity: 'HIGH' },
    { id: 'laptop_battery', name: 'Battery not holding charge', icon: '', description: 'Battery drains rapidly or shows service recommended', severity: 'MEDIUM' },
    { id: 'laptop_charging', name: 'Charging / power adapter issue', icon: '', description: 'Laptop does not charge when plugged in, loose jack', severity: 'HIGH' },
    { id: 'laptop_keyboard', name: 'Keyboard / trackpad problem', icon: '', description: 'Keys stuck or not registering, trackpad erratic', severity: 'MEDIUM' },
    { id: 'laptop_overheating', name: 'Overheating / fan noise', icon: '', description: 'Fans spinning at max speed constantly, thermal throttling', severity: 'MEDIUM' },
    { id: 'laptop_performance', name: 'Extreme freezing / crash', icon: '', description: 'Blue screen of death, boot failure, OS freeze', severity: 'HIGH' },
    { id: 'laptop_ports', name: 'USB / HDMI / port failure', icon: '', description: 'Ports do not recognize external monitors or drives', severity: 'LOW' },
    { id: 'laptop_other', name: 'Other laptop issue', icon: '', description: 'Issue not listed above', severity: 'MEDIUM' },
    { id: 'laptop_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe the problem in your own words', severity: 'MEDIUM' }
  ],

  // ─── Audio ────────────────────────────────────────────────────
  cat_audio: [
    { id: 'audio_one_side', name: 'One side not working', icon: '', description: 'Left or right earbud/earcup has zero audio', severity: 'HIGH' },
    { id: 'audio_distortion', name: 'Distorted / crackling sound', icon: '', description: 'Audio buzzing, crackling, or cutting out', severity: 'MEDIUM' },
    { id: 'audio_bluetooth', name: 'Bluetooth connection failure', icon: '', description: 'Cannot pair with devices, frequent disconnections', severity: 'MEDIUM' },
    { id: 'audio_battery', name: 'Battery / charging case failure', icon: '', description: 'Case not charging earbuds, very short battery life', severity: 'HIGH' },
    { id: 'audio_mic', name: 'Microphone not working', icon: '', description: 'Others cannot hear voice during phone calls', severity: 'LOW' },
    { id: 'audio_other', name: 'Other audio problem', icon: '', description: 'Issue not listed above', severity: 'MEDIUM' },
    { id: 'audio_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe the problem in your own words', severity: 'MEDIUM' }
  ],

  // ─── Generic Fallback for Physical Devices ────────────────────
  cat_generic: [
    { id: 'gen_not_turning_on', name: 'Device does not turn on', icon: '', description: 'No power, completely unresponsive', severity: 'HIGH' },
    { id: 'gen_stops_working', name: 'Stops working during use', icon: '', description: 'Starts briefly then turns off or fails', severity: 'HIGH' },
    { id: 'gen_physical_damage', name: 'Physical damage / broken part', icon: '', description: 'Broken part, cracked casing, loose hardware', severity: 'HIGH' },
    { id: 'gen_performance', name: 'Performance / quality failure', icon: '', description: 'Substandard output, functional defect', severity: 'MEDIUM' },
    { id: 'gen_power_charging', name: 'Power / charging failure', icon: '', description: 'Cord, battery, or power delivery defect', severity: 'MEDIUM' },
    { id: 'gen_leakage', name: 'Liquid / water leakage', icon: '', description: 'Liquid leaking from product', severity: 'HIGH' },
    { id: 'gen_noise', name: 'Unusual noise or vibration', icon: '', description: 'Grinding, loud vibration, or rattling', severity: 'MEDIUM' },
    { id: 'gen_other', name: 'Other issue', icon: '', description: 'Problem not listed above', severity: 'MEDIUM' },
    { id: 'gen_not_sure', name: 'I\'m not sure', icon: '', description: 'Describe the problem in your own words', severity: 'MEDIUM' }
  ]
};

export const QUESTIONS_BY_ISSUE = {
  health_cashless_preauth: [
    { id: 'q_h_cashless_status', question: 'What is the patient\'s current admission status?', type: 'choice', options: ['Currently admitted in hospital', 'Planned admission in next 48-72 hours', 'Emergency admission in progress'], required: true },
    { id: 'q_h_cashless_hosp', question: 'Name of hospital, city, and date of admission:', type: 'text', required: true },
    { id: 'q_h_cashless_diag', question: 'Primary medical diagnosis or treatment reason:', type: 'text', required: true },
    { id: 'q_h_cashless_est', question: 'Estimated total hospital treatment cost (₹):', type: 'text', required: true },
    { id: 'q_h_cashless_tpa', question: 'Has the hospital TPA desk submitted pre-auth request?', type: 'choice', options: ['Yes, awaiting insurer approval', 'Yes, additional query raised by TPA', 'Not submitted yet - requesting WarrantyEase assistance'], required: true }
  ],

  health_reimbursement: [
    { id: 'q_h_reimb_status', question: 'Hospital discharge and settlement status:', type: 'choice', options: ['Discharged - all hospital bills fully settled', 'Discharged - interim claim', 'Day-care procedure completed'], required: true },
    { id: 'q_h_reimb_hosp', question: 'Hospital name, city, and dates of admission & discharge:', type: 'text', required: true },
    { id: 'q_h_reimb_diag', question: 'Diagnosis / treatment description (e.g. Dengue, Surgery, Pneumonia):', type: 'text', required: true },
    { id: 'q_h_reimb_amount', question: 'Total amount claimed for reimbursement (₹):', type: 'text', required: true },
    { id: 'q_h_reimb_prior_cashless', question: 'Was cashless rejected or was this a non-network hospital?', type: 'choice', options: ['Non-network hospital (direct reimbursement)', 'Cashless request was denied by TPA', 'Opted for direct reimbursement by choice'], required: true }
  ],

  health_daycare_procedure: [
    { id: 'q_h_daycare_type', question: 'What medical procedure was performed?', type: 'choice', options: ['Cataract surgery / eye procedure', 'Chemotherapy / radiation session', 'Dialysis procedure', 'Lithotripsy / kidney stone procedure', 'Minor ENT or general surgical procedure'], required: true },
    { id: 'q_h_daycare_hosp', question: 'Name of day-care centre or hospital:', type: 'text', required: true },
    { id: 'q_h_daycare_cost', question: 'Total procedure and pharmacy cost (₹):', type: 'text', required: true }
  ],

  motor_accident_collision: [
    { id: 'q_m_col_driveable', question: 'Current vehicle condition:', type: 'choice', options: ['Driveable (can drive to network garage)', 'Stationary / Disabled (needs towing)', 'Vehicle already at repair garage'], required: true },
    { id: 'q_m_col_datetime', question: 'Date, approximate time, and city/area of collision:', type: 'text', required: true },
    { id: 'q_m_col_driver', question: 'Who was driving at the time of the accident?', type: 'choice', options: ['Policyholder', 'Family member / named driver', 'Commercial / hired driver'], required: true },
    { id: 'q_m_col_tp', question: 'Was any third party or pedestrian involved?', type: 'choice', options: ['No third party involved (single vehicle impact)', 'Third-party vehicle damaged', 'Third-party person injured (Police report filed)'], required: true }
  ],

  motor_body_dent_paint: [
    { id: 'q_m_dent_location', question: 'Location of panel damage on vehicle:', type: 'choice', options: ['Front bumper / grill', 'Rear bumper / boot', 'Side door panels / running board', 'Bonnet / roof / quarter panel'], required: true },
    { id: 'q_m_dent_garage', question: 'Preferred authorized brand dealership or network garage:', type: 'text', required: true }
  ],

  motor_rsa_towing: [
    { id: 'q_m_rsa_type', question: 'What assistance is immediately required?', type: 'choice', options: ['Emergency towing to nearest garage', 'Battery jumpstart', 'Flat tire replacement with spare', 'Locked out / key inside vehicle', 'Emergency fuel delivery'], required: true },
    { id: 'q_m_rsa_loc', question: 'Current exact location, road name & landmark for towing dispatch:', type: 'text', required: true }
  ],

  wm_not_draining: [
    { id: 'q_wm_drain_water', question: 'Is there any water remaining inside the drum?', type: 'choice', options: ['Yes, drum is full or half full', 'Yes, small puddle at bottom', 'No, water slowly drained', 'Not sure'], required: true },
    { id: 'q_wm_drain_code', question: 'Does the machine show an error code on the display?', type: 'choice', options: ['Yes, an error code is displayed', 'No error code shown', 'Machine has no digital display'], required: true }
  ],

  wm_vibration: [
    { id: 'q_wm_vib_stage', question: 'When does excessive vibration happen?', type: 'choice', options: ['During high-speed spin cycle only', 'During normal agitation / wash', 'Constantly throughout entire cycle'], required: true },
    { id: 'q_wm_vib_level', question: 'Is the washing machine on a flat, level surface?', type: 'choice', options: ['Yes, perfectly level', 'Uneven floor / slightly tilted', 'Machine moves or walks across floor'], required: true }
  ],

  phone_charging: [
    { id: 'q_phone_chg_behavior', question: 'What happens when you connect the charger?', type: 'choice', options: ['Doesn\'t charge at all (no icon)', 'Charges very slowly', 'Charges intermittently', 'Port feels loose'], required: true }
  ],

  tv_screen: [
    { id: 'q_tv_screen_type', question: 'What is happening on the TV screen?', type: 'choice', options: ['Completely black screen', 'Horizontal or vertical colored lines', 'Picture flickering', 'Physical crack / broken panel'], required: true }
  ],

  fridge_not_cooling: [
    { id: 'q_fridge_temp_areas', question: 'Which compartments are failing to cool?', type: 'choice', options: ['Both fridge and freezer are warm', 'Freezer is cold, but fridge compartment is warm', 'Fridge is cold, but freezer is thawing'], required: true }
  ],

  ac_not_cooling: [
    { id: 'q_ac_airflow', question: 'What is the air blowing from the indoor unit?', type: 'choice', options: ['Blowing room-temperature air (fan only)', 'Very weak or no airflow at all', 'Blowing warm/hot air'], required: true }
  ]
};

export const EVIDENCE_BY_ISSUE = {
  health_cashless_preauth: [
    { id: 'ev_h_cashless_form', title: 'TPA Pre-Authorization Request Form', type: 'document', is_required: true, description: 'Completed pre-auth form issued and stamped by hospital TPA desk' },
    { id: 'ev_h_cashless_card', title: 'Health Insurance Card & Government ID', type: 'document', is_required: true, description: 'Photo of Star Health / insurer e-card and patient Aadhaar/PAN' },
    { id: 'ev_h_cashless_note', title: 'Doctor Consultation Note & Admission Advice', type: 'document', is_required: true, description: 'Doctor prescription detailing diagnosis and hospitalization necessity' }
  ],

  health_reimbursement: [
    { id: 'ev_h_reimb_discharge', title: 'Hospital Discharge Summary', type: 'document', is_required: true, description: 'Complete discharge card signed by treating doctor showing admission & discharge dates' },
    { id: 'ev_h_reimb_final_bill', title: 'Itemized Final Hospital Bill with Breakup', type: 'invoice', is_required: true, description: 'Detailed original hospital bill with charges for bed, pharmacy, nursing, and surgery' },
    { id: 'ev_h_reimb_receipts', title: 'Hospital Payment Receipts & Paid Stamp', type: 'invoice', is_required: true, description: 'Original payment receipts with hospital official paid stamp' },
    { id: 'ev_h_reimb_reports', title: 'Diagnostic Lab & Radiology Investigation Reports', type: 'document', is_required: true, description: 'Blood tests, X-rays, CT/MRI, ultrasound, or biopsy reports supporting diagnosis' },
    { id: 'ev_h_reimb_cheque', title: 'Cancelled Cheque for Direct NEFT Reimbursement', type: 'document', is_required: true, description: 'Cancelled cheque or bank passbook copy showing account holder name & IFSC code' }
  ],

  motor_accident_collision: [
    { id: 'ev_m_col_photos', title: 'Clear Photos of Vehicle Damage (4 sides & closeup)', type: 'photo', is_required: true, description: 'Photos showing vehicle number plate, overall damage, and close-ups of damaged parts' },
    { id: 'ev_m_col_dl', title: 'Valid Driving License (DL) of Person Driving', type: 'document', is_required: true, description: 'Front and back photo of valid driver\'s license at time of incident' },
    { id: 'ev_m_col_rc', title: 'Vehicle Registration Certificate (RC Book)', type: 'document', is_required: true, description: 'Clear photo or digital copy of vehicle RC' },
    { id: 'ev_m_col_policy', title: 'Motor Insurance Policy Schedule', type: 'document', is_required: true, description: 'Copy of active insurance policy document' }
  ],

  wm_not_draining: [
    { id: 'ev_wm_drain_drum', title: 'Photo of drum showing standing water', type: 'photo', is_required: true, description: 'Clear photo showing standing water inside drum or drain hose' },
    { id: 'ev_wm_drain_serial', title: 'Photo of product serial number / model sticker', type: 'serial_photo', is_required: true, description: 'Sticker usually located on inner door rim, back or side panel' },
    { id: 'ev_wm_drain_invoice', title: 'Original purchase invoice', type: 'invoice', is_required: true, description: 'Bill or digital invoice showing purchase date & dealer' }
  ],

  phone_charging: [
    { id: 'ev_phone_chg_port', title: 'Photo of phone charging port & cable', type: 'photo', is_required: true, description: 'Close-up photo of charging port showing pins and cable tip' },
    { id: 'ev_phone_chg_serial', title: 'Screenshot of About Phone / IMEI or box label', type: 'serial_photo', is_required: true, description: 'Screenshot showing serial/IMEI or photo of box sticker' },
    { id: 'ev_phone_chg_invoice', title: 'Original purchase invoice', type: 'invoice', is_required: true, description: 'Store receipt or eCommerce tax invoice' }
  ],

  tv_screen: [
    { id: 'ev_tv_screen_photo', title: 'Photo of TV screen while powered on', type: 'photo', is_required: true, description: 'Photo of screen displaying the lines, distortion, or black screen' },
    { id: 'ev_tv_screen_serial', title: 'Photo of rear panel model & serial number sticker', type: 'serial_photo', is_required: true, description: 'Sticker on TV back panel' },
    { id: 'ev_tv_screen_invoice', title: 'Original purchase invoice', type: 'invoice', is_required: true, description: 'Purchase bill' }
  ]
};

// Client-side category resolver helper
export function resolveClientProductCategory(category, productName, model, brand, protectionType) {
  const text = ` ${category || ''} ${productName || ''} ${model || ''} ${brand || ''} ${protectionType || ''} `.toLowerCase();

  // 1. Insurance Indicators & Brand matching
  const isInsurance = (
    /\b(insurance|policy|mediclaim|tpa|cashless)\b/.test(text) ||
    /\b(star health|care health|niva bupa|max bupa|religare|hdfc ergo|icici lombard|tata aig|bajaj allianz|godigit|iffco tokio|united india|oriental insurance|new india assurance|national insurance|\blic\b|sbi general|kotak general|cholamandalam)\b/.test(text)
  );

  if (isInsurance) {
    if (/\b(health|medical|mediclaim|hospital|hospitalization|patient|care health|star health|niva bupa|max bupa|religare|medi assist)\b/.test(text)) {
      return 'cat_ins_health';
    }
    if (/\b(motor|car|vehicle|auto|bike|two wheeler|scooter|four wheeler|traffic|chassis|engine)\b/.test(text)) {
      return 'cat_ins_motor';
    }
    if (/\b(travel|flight|trip|baggage|overseas|visa)\b/.test(text)) {
      return 'cat_ins_travel';
    }
    if (/\b(home|property|building|burglary|structure|fire)\b/.test(text)) {
      return 'cat_ins_property';
    }
    if (/\b(star health|care health|niva bupa|max bupa|religare)\b/.test(text)) {
      return 'cat_ins_health';
    }
    return 'cat_ins_general';
  }

  // 2. Hardware / Appliance Categories
  if (/\b(washing machine|washer|front load|top load|laundry|dryer)\b/.test(text)) return 'cat_washing_machine';
  if (/\b(refrigerator|fridge|freezer)\b/.test(text)) return 'cat_refrigerator';
  if (/\b(air conditioner|split ac|window ac|inverter ac|\bac\b)\b/.test(text)) return 'cat_ac';
  if (/\b(microwave|oven|otg)\b/.test(text)) return 'cat_microwave';
  if (/\b(dishwasher)\b/.test(text)) return 'cat_dishwasher';
  if (/\b(laptop|notebook|macbook|thinkpad|ideapad|chromebook)\b/.test(text) || (text.includes('computer') && !text.includes('desktop'))) return 'cat_laptop';
  if (/\b(phone|mobile|smartphone|iphone|galaxy s|galaxy z|oneplus|redmi|xiaomi|pixel)\b/.test(text)) return 'cat_smartphone';
  if (/\b(tv|television|oled|qled|smart tv|bravia)\b/.test(text)) return 'cat_tv';
  if (/\b(tablet|ipad|galaxy tab)\b/.test(text)) return 'cat_tablet';
  if (/\b(monitor|display panel)\b/.test(text)) return 'cat_monitor';
  if (/\b(headphone|earbud|earphone|audio|airpod|rockerz|tws|speaker|soundbar)\b/.test(text)) return 'cat_audio';
  if (/\b(watch|smartwatch|wearable|fitness band)\b/.test(text)) return 'cat_wearables';
  if (/\b(car|four wheeler|automobile)\b/.test(text)) return 'cat_car';
  if (/\b(bike|motorcycle|scooter|two wheeler)\b/.test(text)) return 'cat_motorcycle';

  return 'cat_generic';
}
