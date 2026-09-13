"""
WarrantyEase Claim Issue Taxonomy & Dynamic Questionnaire Data
Contains product category hierarchy, issue templates, dynamic follow-up diagnostic questions,
and tailored evidence requirements.
All cartoon emojis removed. Comprehensive coverage for Physical Devices, Health Insurance,
Motor Insurance, and General Insurance.
"""

# ─── 1. Product Categories & Subcategories ─────────────────────────────────────
CATEGORIES_SEED = [
    # Top-level parents
    ("home_appliances", "Home Appliances", None, "", 1),
    ("consumer_electronics", "Consumer Electronics", None, "", 2),
    ("personal_electronics", "Personal Electronics & Audio", None, "", 3),
    ("vehicles", "Vehicles & Mobility", None, "", 4),
    ("insurance_vault", "Insurance Policies", None, "", 5),
    ("cat_generic", "General Products & Equipment", None, "", 99),

    # Home Appliance Subcategories
    ("cat_washing_machine", "Washing Machine", "home_appliances", "", 1),
    ("cat_refrigerator", "Refrigerator", "home_appliances", "", 2),
    ("cat_ac", "Air Conditioner", "home_appliances", "", 3),
    ("cat_microwave", "Microwave Oven", "home_appliances", "", 4),
    ("cat_dishwasher", "Dishwasher", "home_appliances", "", 5),

    # Consumer Electronics Subcategories
    ("cat_smartphone", "Smartphone", "consumer_electronics", "", 1),
    ("cat_tv", "Television", "consumer_electronics", "", 2),
    ("cat_laptop", "Laptop & Computer", "consumer_electronics", "", 3),
    ("cat_tablet", "Tablet / iPad", "consumer_electronics", "", 4),
    ("cat_monitor", "Monitor & Display", "consumer_electronics", "", 5),

    # Personal Electronics Subcategories
    ("cat_audio", "Headphones & Audio", "personal_electronics", "", 1),
    ("cat_wearables", "Smartwatches & Wearables", "personal_electronics", "", 2),

    # Vehicles
    ("cat_car", "Car / Four Wheeler", "vehicles", "", 1),
    ("cat_motorcycle", "Two Wheeler / Motorcycle", "vehicles", "", 2),

    # Insurance Subcategories
    ("cat_ins_health", "Health Insurance", "insurance_vault", "", 1),
    ("cat_ins_motor", "Motor Insurance", "insurance_vault", "", 2),
    ("cat_ins_travel", "Travel Insurance", "insurance_vault", "", 3),
    ("cat_ins_property", "Property / Home Insurance", "insurance_vault", "", 4),
    ("cat_ins_general", "General Insurance", "insurance_vault", "", 5),
]

# ─── 2. Issue Templates per Category (No Emojis) ──────────────────────────────
ISSUES_SEED = [
    # ─── Health Insurance ─────────────────────────────────────────
    ("health_cashless_preauth", "cat_ins_health", "Cashless Hospitalization (Pre-Authorization)", "", "Request planned or emergency cashless hospital admission approval through TPA network desk", "HIGH", 1),
    ("health_reimbursement", "cat_ins_health", "Hospital Reimbursement Claim (Post-Discharge)", "", "Claim refund for hospital bills, doctor fees, and treatments paid directly out-of-pocket", "HIGH", 2),
    ("health_daycare_procedure", "cat_ins_health", "Day Care Procedure / Surgery", "", "Treatments requiring hospital stay under 24 hours (e.g. Cataract, Dialysis, Chemo, Minor Surgery)", "MEDIUM", 3),
    ("health_pre_post_expenses", "cat_ins_health", "Pre & Post Hospitalization Medical Bills", "", "Medical expenses, diagnostic tests, and pharmacy bills incurred 30-60 days before or after admission", "MEDIUM", 4),
    ("health_accidental_emergency", "cat_ins_health", "Accidental Injury & Emergency Trauma Care", "", "Emergency hospital casualty care following road accidents, fractures, burns, or physical trauma", "CRITICAL", 5),
    ("health_critical_illness", "cat_ins_health", "Critical Illness Lump-Sum Benefit", "", "Lump-sum policy payout claim for diagnosed critical conditions (Cancer, Cardiac Arrest, Renal Failure, Stroke)", "HIGH", 6),
    ("health_other", "cat_ins_health", "Other Health Insurance Claim", "", "OPD consultation, diagnostic tests, ambulance fee, or other policy benefit", "MEDIUM", 7),
    ("health_not_sure", "cat_ins_health", "I'm not sure", "", "Describe medical incident, hospital stay, or treatment in your own words", "MEDIUM", 8),

    # ─── Motor Insurance ──────────────────────────────────────────
    ("motor_accident_collision", "cat_ins_motor", "Vehicle Collision & Accident Damage", "", "Damage from collision with another vehicle, divider, wall, or road object", "HIGH", 1),
    ("motor_body_dent_paint", "cat_ins_motor", "Bumper, Denting & Scratch Damage", "", "External body panel scratches, dents, fender damage, or parking mishaps", "MEDIUM", 2),
    ("motor_windshield_glass", "cat_ins_motor", "Windshield, Window & Mirror Damage", "", "Cracked or shattered front windshield, rear glass, side windows, or side-view mirrors", "MEDIUM", 3),
    ("motor_engine_hydro_lock", "cat_ins_motor", "Engine Trouble & Water Ingress (Hydro-Lock)", "", "Engine stalled in waterlogged road, flood water ingress, or sump damage (Engine Protect Add-on)", "CRITICAL", 4),
    ("motor_theft_total_loss", "cat_ins_motor", "Vehicle Theft / Total Loss", "", "Stolen vehicle, stolen catalytic converter/tires, or complete fire/submersion total loss", "CRITICAL", 5),
    ("motor_rsa_towing", "cat_ins_motor", "Roadside Assistance (RSA) & Towing", "", "Flat tire, dead battery jumpstart, vehicle lockout, or emergency breakdown towing", "HIGH", 6),
    ("motor_other", "cat_ins_motor", "Other Motor Insurance Claim", "", "Damage or policy claim not listed above", "MEDIUM", 7),
    ("motor_not_sure", "cat_ins_motor", "I'm not sure", "", "Describe accident or vehicle problem in your own words", "MEDIUM", 8),

    # ─── General Insurance Fallback ───────────────────────────────
    ("ins_gen_claim", "cat_ins_general", "Policy Claim / Loss Event", "", "File a claim for loss, damage, hospitalization, or covered policy incident", "HIGH", 1),
    ("ins_gen_reimbursement", "cat_ins_general", "Reimbursement Claim", "", "Claim refund for expenses paid directly out-of-pocket", "HIGH", 2),
    ("ins_gen_cashless", "cat_ins_general", "Cashless Settlement Request", "", "Request cashless settlement through authorized service network", "MEDIUM", 3),
    ("ins_gen_other", "cat_ins_general", "Other Insurance Claim", "", "Policy claim or inquiry not listed above", "MEDIUM", 4),
    ("ins_gen_not_sure", "cat_ins_general", "I'm not sure", "", "Describe policy incident in your own words", "MEDIUM", 5),

    # ─── Washing Machine ──────────────────────────────────────────
    ("wm_not_turning_on", "cat_washing_machine", "Machine not turning on", "", "Completely unresponsive, no power lights or sounds", "HIGH", 1),
    ("wm_not_filling", "cat_washing_machine", "Not filling with water", "", "Water does not enter the drum during cycle", "MEDIUM", 2),
    ("wm_not_draining", "cat_washing_machine", "Water not draining", "", "Drum remains filled with water, drain pump failed", "HIGH", 3),
    ("wm_not_spinning", "cat_washing_machine", "Not spinning", "", "Drum agitates but fails to spin at high speed", "MEDIUM", 4),
    ("wm_unusual_noise", "cat_washing_machine", "Making unusual noise", "", "Loud grinding, banging, squealing or metal noise", "MEDIUM", 5),
    ("wm_water_leakage", "cat_washing_machine", "Water leaking", "", "Water pooling on floor around machine during wash", "CRITICAL", 6),
    ("wm_not_heating", "cat_washing_machine", "Not heating water", "", "Heater failure during warm or sanitize wash cycle", "LOW", 7),
    ("wm_not_cleaning", "cat_washing_machine", "Not cleaning clothes properly", "", "Detergent not dispensing, clothes come out dirty", "LOW", 8),
    ("wm_door_lid", "cat_washing_machine", "Door / lid problem", "", "Door jammed, latch broken, or won't lock/unlock", "HIGH", 9),
    ("wm_display_error", "cat_washing_machine", "Display / error code", "", "Error code blinking on screen (e.g., 4E, 5E, dE, UE)", "MEDIUM", 10),
    ("wm_vibration", "cat_washing_machine", "Vibration / excessive shaking", "", "Machine walks across floor or shakes violently on spin", "MEDIUM", 11),
    ("wm_electrical", "cat_washing_machine", "Electrical / tripping problem", "", "Trips home circuit breaker, electrical burning odor", "CRITICAL", 12),
    ("wm_other", "cat_washing_machine", "Other problem", "", "Issue not listed above", "MEDIUM", 13),
    ("wm_not_sure", "cat_washing_machine", "I'm not sure", "", "Describe the problem in your own words", "MEDIUM", 14),

    # ─── Smartphone ───────────────────────────────────────────────
    ("phone_screen", "cat_smartphone", "Screen / display defect", "", "Cracked glass, black screen, lines, flickering, touch failure", "HIGH", 1),
    ("phone_battery", "cat_smartphone", "Battery draining rapidly", "", "Battery drops quickly, dies at 20-30%, swollen battery", "MEDIUM", 2),
    ("phone_charging", "cat_smartphone", "Charging problem", "", "Doesn't charge, slow charging, port loose, cable not recognized", "MEDIUM", 3),
    ("phone_camera", "cat_smartphone", "Camera issue", "", "Blurry lens, black viewfinder, camera app crashes, focus buzzing", "LOW", 4),
    ("phone_speaker_mic", "cat_smartphone", "Speaker / microphone", "", "No audio on calls, crackling sound, other party can't hear me", "MEDIUM", 5),
    ("phone_network", "cat_smartphone", "Network / connectivity", "", "No SIM detected, dropping cellular signal, mobile data fails", "MEDIUM", 6),
    ("phone_wifi", "cat_smartphone", "Wi-Fi / Bluetooth failure", "", "Cannot toggle Wi-Fi on, Bluetooth drops disconnects", "LOW", 7),
    ("phone_buttons", "cat_smartphone", "Buttons / physical controls", "", "Power button stuck, volume rocker unresponsive", "LOW", 8),
    ("phone_biometrics", "cat_smartphone", "Fingerprint / Face Unlock", "", "Scanner fails to register or recognize biometrics", "LOW", 9),
    ("phone_liquid", "cat_smartphone", "Water / liquid damage", "", "Liquid ingress, moisture detected warning on port", "CRITICAL", 10),
    ("phone_overheating", "cat_smartphone", "Excessive overheating", "", "Device becomes burning hot during light tasks", "HIGH", 11),
    ("phone_shutdown", "cat_smartphone", "Random restart / shutdown", "", "Phone restarts unexpectedly or stuck on boot loop logo", "HIGH", 12),
    ("phone_software", "cat_smartphone", "Software / performance lag", "", "Extreme freezing, apps constantly crashing", "LOW", 13),
    ("phone_other", "cat_smartphone", "Other phone issue", "", "Problem not listed above", "MEDIUM", 14),
    ("phone_not_sure", "cat_smartphone", "I'm not sure", "", "Describe the problem in your own words", "MEDIUM", 15),

    # ─── Television ───────────────────────────────────────────────
    ("tv_screen", "cat_tv", "Screen / display defect", "", "Cracked glass, distorted colors, dead pixels, patches", "HIGH", 1),
    ("tv_no_picture", "cat_tv", "No picture but sound works", "", "Backlight failure, screen is black but audio works", "HIGH", 2),
    ("tv_lines_flickering", "cat_tv", "Lines or flickering picture", "", "Horizontal/vertical lines across screen, flickering", "MEDIUM", 3),
    ("tv_sound", "cat_tv", "Sound / audio problem", "", "No sound, distorted audio, buzzing or crackling from speakers", "MEDIUM", 4),
    ("tv_power", "cat_tv", "Power / will not turn on", "", "Power LED off or blinking, TV unresponsive", "HIGH", 5),
    ("tv_hdmi", "cat_tv", "HDMI / input port problem", "", "No signal from set-top box, gaming console or PC", "LOW", 6),
    ("tv_remote", "cat_tv", "Remote control problem", "", "TV does not respond to remote or IR sensor failed", "LOW", 7),
    ("tv_wifi", "cat_tv", "Wi-Fi / network connection", "", "Cannot connect to home Wi-Fi or stream videos", "LOW", 8),
    ("tv_apps", "cat_tv", "Smart TV apps / software", "", "Apps freeze, TV restarts during streaming", "LOW", 9),
    ("tv_other", "cat_tv", "Other TV issue", "", "Other fault not listed above", "MEDIUM", 10),
    ("tv_not_sure", "cat_tv", "I'm not sure", "", "Describe the problem in your own words", "MEDIUM", 11),

    # ─── Refrigerator ─────────────────────────────────────────────
    ("fridge_not_cooling", "cat_refrigerator", "Not cooling / warm interior", "", "Neither compartment is cold, food spoiling", "CRITICAL", 1),
    ("fridge_insufficient", "cat_refrigerator", "Insufficient cooling", "", "Cooling is very weak or uneven", "HIGH", 2),
    ("fridge_freezing", "cat_refrigerator", "Freezing in fresh food area", "", "Vegetables and milk freezing solid in fridge compartment", "MEDIUM", 3),
    ("fridge_water_leakage", "cat_refrigerator", "Water leaking / pooling", "", "Water puddling under crisper or on kitchen floor", "HIGH", 4),
    ("fridge_ice_making", "cat_refrigerator", "Ice-maker not working", "", "No ice produced or dispenser jammed", "LOW", 5),
    ("fridge_door_seal", "cat_refrigerator", "Door / seal problem", "", "Door gasket torn or won't seal shut, condensation buildup", "MEDIUM", 6),
    ("fridge_noise", "cat_refrigerator", "Unusual compressor noise", "", "Loud buzzing, rattling or clicking sound from rear", "MEDIUM", 7),
    ("fridge_power", "cat_refrigerator", "Power / completely dead", "", "No interior lights, compressor silent, no power", "HIGH", 8),
    ("fridge_display", "cat_refrigerator", "Display / error code", "", "Error code blinking on door panel", "MEDIUM", 9),
    ("fridge_other", "cat_refrigerator", "Other refrigerator issue", "", "Issue not listed above", "MEDIUM", 10),
    ("fridge_not_sure", "cat_refrigerator", "I'm not sure", "", "Describe the problem in your own words", "MEDIUM", 11),

    # ─── Air Conditioner ──────────────────────────────────────────
    ("ac_not_cooling", "cat_ac", "Not cooling / warm air", "", "Blower runs but room does not cool down", "HIGH", 1),
    ("ac_weak_airflow", "cat_ac", "Weak airflow from indoor unit", "", "Air output is very low even at max fan speed", "MEDIUM", 2),
    ("ac_water_leak", "cat_ac", "Water leaking from indoor unit", "", "Water dripping inside room on wall or floor", "HIGH", 3),
    ("ac_ice", "cat_ac", "Ice formation on cooling coils", "", "Visible frost or ice buildup on indoor or outdoor pipes", "HIGH", 4),
    ("ac_noise", "cat_ac", "Unusual noise or vibration", "", "Rattling blower or loud vibration from outdoor compressor", "MEDIUM", 5),
    ("ac_power", "cat_ac", "Will not turn on / trips power", "", "Unit unresponsive or trips circuit breaker immediately", "CRITICAL", 6),
    ("ac_remote", "cat_ac", "Remote control unresponsive", "", "AC does not respond to remote commands", "LOW", 7),
    ("ac_error", "cat_ac", "Error code on display", "", "Error code flashing on indoor unit (e.g. E1, E4, F3)", "MEDIUM", 8),
    ("ac_other", "cat_ac", "Other AC issue", "", "Problem not listed above", "MEDIUM", 9),
    ("ac_not_sure", "cat_ac", "I'm not sure", "", "Describe the problem in your own words", "MEDIUM", 10),

    # ─── Laptop ───────────────────────────────────────────────────
    ("laptop_screen", "cat_laptop", "Screen / display defect", "", "Cracked screen, black screen, vertical lines, flickering", "HIGH", 1),
    ("laptop_battery", "cat_laptop", "Battery not holding charge", "", "Battery drains rapidly or shows service recommended", "MEDIUM", 2),
    ("laptop_charging", "cat_laptop", "Charging / power adapter issue", "", "Laptop does not charge when plugged in, loose jack", "HIGH", 3),
    ("laptop_keyboard", "cat_laptop", "Keyboard / trackpad problem", "", "Keys stuck or not registering, trackpad erratic", "MEDIUM", 4),
    ("laptop_overheating", "cat_laptop", "Overheating / fan noise", "", "Fans spinning at max speed constantly, thermal throttling", "MEDIUM", 5),
    ("laptop_performance", "cat_laptop", "Extreme freezing / crash", "", "Blue screen of death, boot failure, OS freeze", "HIGH", 6),
    ("laptop_ports", "cat_laptop", "USB / HDMI / port failure", "", "Ports do not recognize external monitors or drives", "LOW", 7),
    ("laptop_other", "cat_laptop", "Other laptop issue", "", "Issue not listed above", "MEDIUM", 8),
    ("laptop_not_sure", "cat_laptop", "I'm not sure", "", "Describe the problem in your own words", "MEDIUM", 9),

    # ─── Audio ────────────────────────────────────────────────────
    ("audio_one_side", "cat_audio", "One side not working", "", "Left or right earbud/earcup has zero audio", "HIGH", 1),
    ("audio_distortion", "cat_audio", "Distorted / crackling sound", "", "Audio buzzing, crackling, or cutting out", "MEDIUM", 2),
    ("audio_bluetooth", "cat_audio", "Bluetooth connection failure", "", "Cannot pair with devices, frequent disconnections", "MEDIUM", 3),
    ("audio_battery", "cat_audio", "Battery / charging case failure", "", "Case not charging earbuds, very short battery life", "HIGH", 4),
    ("audio_mic", "cat_audio", "Microphone not working", "", "Others cannot hear voice during phone calls", "LOW", 5),
    ("audio_other", "cat_audio", "Other audio problem", "", "Issue not listed above", "MEDIUM", 6),
    ("audio_not_sure", "cat_audio", "I'm not sure", "", "Describe the problem in your own words", "MEDIUM", 7),

    # ─── Generic Fallback for Physical Devices ────────────────────
    ("gen_not_turning_on", "cat_generic", "Device does not turn on", "", "No power, completely unresponsive", "HIGH", 1),
    ("gen_stops_working", "cat_generic", "Stops working during use", "", "Starts briefly then turns off or fails", "HIGH", 2),
    ("gen_physical_damage", "cat_generic", "Physical damage / broken part", "", "Broken part, cracked casing, loose hardware", "HIGH", 3),
    ("gen_performance", "cat_generic", "Performance / quality failure", "", "Substandard output, functional defect", "MEDIUM", 4),
    ("gen_power_charging", "cat_generic", "Power / charging failure", "", "Cord, battery, or power delivery defect", "MEDIUM", 5),
    ("gen_leakage", "cat_generic", "Liquid / water leakage", "", "Liquid leaking from product", "HIGH", 6),
    ("gen_noise", "cat_generic", "Unusual noise or vibration", "", "Grinding, loud vibration, or rattling", "MEDIUM", 7),
    ("gen_other", "cat_generic", "Other issue", "", "Problem not listed above", "MEDIUM", 8),
    ("gen_not_sure", "cat_generic", "I'm not sure", "", "Describe the problem in your own words", "MEDIUM", 9),
]

# ─── 3. Dynamic Follow-Up Questions per Issue ─────────────────────────────────
QUESTIONS_SEED = [
    # ─── Health Insurance → Cashless Hospitalization ──────────────
    ("q_h_cashless_status", "health_cashless_preauth", "What is the patient's current admission status?", "choice", '["Currently admitted in hospital", "Planned admission in next 48-72 hours", "Emergency admission in progress"]', 1, None, 1),
    ("q_h_cashless_hosp", "health_cashless_preauth", "Name of hospital, city, and date of admission:", "text", None, 1, None, 2),
    ("q_h_cashless_diag", "health_cashless_preauth", "Primary medical diagnosis or treatment reason:", "text", None, 1, None, 3),
    ("q_h_cashless_est", "health_cashless_preauth", "Estimated total hospital treatment cost (₹):", "text", None, 1, None, 4),
    ("q_h_cashless_tpa", "health_cashless_preauth", "Has the hospital TPA desk submitted pre-auth request?", "choice", '["Yes, awaiting insurer approval", "Yes, additional query raised by TPA", "Not submitted yet - requesting WarrantyEase assistance"]', 1, None, 5),

    # ─── Health Insurance → Hospital Reimbursement ────────────────
    ("q_h_reimb_status", "health_reimbursement", "Hospital discharge and settlement status:", "choice", '["Discharged - all hospital bills fully settled", "Discharged - interim claim", "Day-care procedure completed"]', 1, None, 1),
    ("q_h_reimb_hosp", "health_reimbursement", "Hospital name, city, and dates of admission & discharge:", "text", None, 1, None, 2),
    ("q_h_reimb_diag", "health_reimbursement", "Diagnosis / treatment description (e.g. Dengue, Surgery, Pneumonia):", "text", None, 1, None, 3),
    ("q_h_reimb_amount", "health_reimbursement", "Total amount claimed for reimbursement (₹):", "text", None, 1, None, 4),
    ("q_h_reimb_prior_cashless", "health_reimbursement", "Was cashless rejected or was this a non-network hospital?", "choice", '["Non-network hospital (direct reimbursement)", "Cashless request was denied by TPA", "Opted for direct reimbursement by choice"]', 1, None, 5),

    # ─── Health Insurance → Day Care Procedure ────────────────────
    ("q_h_daycare_type", "health_daycare_procedure", "What medical procedure was performed?", "choice", '["Cataract surgery / eye procedure", "Chemotherapy / radiation session", "Dialysis procedure", "Lithotripsy / kidney stone procedure", "Minor ENT or general surgical procedure"]', 1, None, 1),
    ("q_h_daycare_hosp", "health_daycare_procedure", "Name of day-care centre or hospital:", "text", None, 1, None, 2),
    ("q_h_daycare_cost", "health_daycare_procedure", "Total procedure and pharmacy cost (₹):", "text", None, 1, None, 3),

    # ─── Health Insurance → Pre/Post Medical Bills ────────────────
    ("q_h_prepost_timing", "health_pre_post_expenses", "Expense category window:", "choice", '["Pre-hospitalization (prior 30 days)", "Post-hospitalization (follow-up 60 days)", "Both pre and post hospitalization"]', 1, None, 1),
    ("q_h_prepost_claim_ref", "health_pre_post_expenses", "Linked main hospitalization claim or ticket ID:", "text", None, 1, None, 2),
    ("q_h_prepost_amount", "health_pre_post_expenses", "Total pharmacy and lab expense claimed (₹):", "text", None, 1, None, 3),

    # ─── Health Insurance → Accidental Injury ─────────────────────
    ("q_h_acc_cause", "health_accidental_emergency", "Nature of accidental trauma:", "choice", '["Road traffic accident", "Household fall or fracture", "Sports / outdoor injury", "Workplace accidental injury"]', 1, None, 1),
    ("q_h_acc_mlc", "health_accidental_emergency", "Was a Medico-Legal Case (MLC) or Police report recorded at hospital?", "choice", '["Yes, MLC recorded in casualty record", "No, treated as general emergency trauma", "Not applicable"]', 1, None, 2),

    # ─── Motor Insurance → Collision Damage ───────────────────────
    ("q_m_col_driveable", "motor_accident_collision", "Current vehicle condition:", "choice", '["Driveable (can drive to network garage)", "Stationary / Disabled (needs towing)", "Vehicle already at repair garage"]', 1, None, 1),
    ("q_m_col_datetime", "motor_accident_collision", "Date, approximate time, and city/area of collision:", "text", None, 1, None, 2),
    ("q_m_col_driver", "motor_accident_collision", "Who was driving at the time of the accident?", "choice", '["Policyholder", "Family member / named driver", "Commercial / hired driver"]', 1, None, 3),
    ("q_m_col_tp", "motor_accident_collision", "Was any third party or pedestrian involved?", "choice", '["No third party involved (single vehicle impact)", "Third-party vehicle damaged", "Third-party person injured (Police report filed)"]', 1, None, 4),

    # ─── Motor Insurance → Dent / Body Paint ──────────────────────
    ("q_m_dent_location", "motor_body_dent_paint", "Location of panel damage on vehicle:", "choice", '["Front bumper / grill", "Rear bumper / boot", "Side door panels / running board", "Bonnet / roof / quarter panel"]', 1, None, 1),
    ("q_m_dent_garage", "motor_body_dent_paint", "Preferred authorized brand dealership or network garage:", "text", None, 1, None, 2),

    # ─── Motor Insurance → Windshield / Glass ─────────────────────
    ("q_m_glass_part", "motor_windshield_glass", "Damaged glass component:", "choice", '["Front windshield glass", "Rear windshield glass", "Door window glass", "Side-view mirror assembly"]', 1, None, 1),
    ("q_m_glass_cause", "motor_windshield_glass", "Cause of breakage:", "choice", '["Flying stone / gravel on highway", "Falling branch / object", "Vandalism / break-in attempt", "Collision impact"]', 1, None, 2),

    # ─── Motor Insurance → Engine Hydro-Lock ──────────────────────
    ("q_m_hydro_status", "motor_engine_hydro_lock", "Engine status and water depth:", "choice", '["Engine stalled in waterlogged road and will not start", "Engine was turned off before entering water", "Oil sump punctured after undercarriage hit"]', 1, None, 1),
    ("q_m_hydro_restart", "motor_engine_hydro_lock", "Did you attempt to restart after the engine stalled in water?", "choice", '["No, did not attempt restart (avoided cranking)", "Attempted restart once", "Attempted restart multiple times"]', 1, None, 2),

    # ─── Motor Insurance → Roadside Assistance ────────────────────
    ("q_m_rsa_type", "motor_rsa_towing", "What assistance is immediately required?", "choice", '["Emergency towing to nearest garage", "Battery jumpstart", "Flat tire replacement with spare", "Locked out / key inside vehicle", "Emergency fuel delivery"]', 1, None, 1),
    ("q_m_rsa_loc", "motor_rsa_towing", "Current exact location, road name & landmark for towing dispatch:", "text", None, 1, None, 2),

    # ─── General Insurance ────────────────────────────────────────
    ("q_ins_gen_desc", "ins_gen_claim", "Describe the covered loss or claim incident in detail:", "text", None, 1, None, 1),
    ("q_ins_gen_amount", "ins_gen_claim", "Total estimated or claimed loss amount (₹):", "text", None, 1, None, 2),

    # ─── Washing Machine ──────────────────────────────────────────
    ("q_wm_drain_water", "wm_not_draining", "Is there any water remaining inside the drum?", "choice", '["Yes, drum is full or half full", "Yes, small puddle at bottom", "No, water slowly drained", "Not sure"]', 1, None, 1),
    ("q_wm_drain_code", "wm_not_draining", "Does the machine show an error code on the display?", "choice", '["Yes, an error code is displayed", "No error code shown", "Machine has no digital display"]', 1, None, 2),
    ("q_wm_drain_code_val", "wm_not_draining", "Enter error code displayed (e.g. 5E, 5C, OE, E2):", "text", None, 0, "show_if_code_yes", 3),
    ("q_wm_vib_stage", "wm_vibration", "When does excessive vibration happen?", "choice", '["During high-speed spin cycle only", "During normal agitation / wash", "Constantly throughout entire cycle"]', 1, None, 1),
    ("q_wm_vib_level", "wm_vibration", "Is the washing machine on a flat, level surface?", "choice", '["Yes, perfectly level", "Uneven floor / slightly tilted", "Machine moves or walks across floor"]', 1, None, 2),
    ("q_wm_vib_noise", "wm_vibration", "Does it make a loud banging or thumping sound?", "choice", '["Yes, loud metal or drum banging", "Just severe shaking, no banging", "High-pitched screeching sound"]', 1, None, 3),
    ("q_wm_leak_location", "wm_water_leakage", "Where does the water appear to be leaking from?", "choice", '["Front door / gasket seal", "Bottom underneath machine", "Back drain hose or water inlet hose", "Detergent dispenser drawer", "Not sure where it originates"]', 1, None, 1),
    ("q_wm_err_code", "wm_display_error", "What error code or symbol is showing on the screen?", "text", None, 1, None, 1),

    # ─── Smartphone ───────────────────────────────────────────────
    ("q_phone_chg_behavior", "phone_charging", "What happens when you connect the charger?", "choice", '["Doesn\'t charge at all (no icon)", "Charges very slowly (several hours)", "Charges intermittently (connects/disconnects)", "Shows charging icon but % doesn\'t increase", "Charger or phone gets unusually hot", "Charging cable feels loose in port"]', 1, None, 1),
    ("q_phone_screen_type", "phone_screen", "What is the screen problem?", "choice", '["Cracked outer glass", "Black screen / no display", "Vertical or horizontal colored lines", "Screen flickering / blinking", "Touch not registering / ghost touch", "Discolored patches / ink bleeding"]', 1, None, 1),

    # ─── Television ───────────────────────────────────────────────
    ("tv_screen_type", "tv_screen", "What is happening on the TV screen?", "choice", '["Completely black screen", "Horizontal or vertical colored lines", "Picture flickering", "No picture but sound plays normally", "Distorted colors / double image", "Physical crack / broken panel"]', 1, None, 1),

    # ─── Refrigerator ─────────────────────────────────────────────
    ("q_fridge_temp_areas", "fridge_not_cooling", "Which compartments are failing to cool?", "choice", '["Both fridge and freezer are warm", "Freezer is cold, but fridge compartment is warm", "Fridge is cold, but freezer is thawing"]', 1, None, 1),

    # ─── Air Conditioner ──────────────────────────────────────────
    ("q_ac_airflow", "ac_not_cooling", "What is the air blowing from the indoor unit?", "choice", '["Blowing room-temperature air (fan only)", "Very weak or no airflow at all", "Cools for 5-10 minutes then stops", "Blowing warm/hot air"]', 1, None, 1),

    # ─── Generic Fallback ─────────────────────────────────────────
    ("q_gen_start", "gen_not_turning_on", "When did the product stop turning on?", "choice", '["Today", "In the past 2-3 days", "Over a week ago", "Gradually became harder to start"]', 1, None, 1),
    ("q_gen_power_source", "gen_not_turning_on", "Have you verified the electrical outlet or battery?", "choice", '["Yes, outlet is working with other devices", "No, have not tested another outlet", "Battery was fully charged before failure"]', 1, None, 2),

    # ─── Universal Not Sure Questions ─────────────────────────────
    ("q_h_unsure_desc", "health_not_sure", "Please describe the medical incident, hospitalization, or treatment:", "text", None, 1, None, 1),
    ("q_m_unsure_desc", "motor_not_sure", "Please describe the vehicle accident or problem in your own words:", "text", None, 1, None, 1),
    ("q_wm_unsure_desc", "wm_not_sure", "Please describe what is happening with the washing machine:", "text", None, 1, None, 1),
    ("q_phone_unsure_desc", "phone_not_sure", "Please describe what is happening with the phone:", "text", None, 1, None, 1),
    ("q_tv_unsure_desc", "tv_not_sure", "Please describe what is happening with the TV:", "text", None, 1, None, 1),
    ("q_fridge_unsure_desc", "fridge_not_sure", "Please describe what is happening with the refrigerator:", "text", None, 1, None, 1),
    ("q_ac_unsure_desc", "ac_not_sure", "Please describe what is happening with the air conditioner:", "text", None, 1, None, 1),
    ("q_gen_unsure_desc", "gen_not_sure", "Please describe what is happening in your own words:", "text", None, 1, None, 1),
]

# ─── 4. Evidence Requirements per Issue ───────────────────────────────────────
EVIDENCE_SEED = [
    # ─── Health Insurance Evidence Requirements ───────────────────
    ("ev_h_cashless_form", "health_cashless_preauth", "TPA Pre-Authorization Request Form", "document", 1, "Completed pre-auth form issued and stamped by hospital TPA desk", 1),
    ("ev_h_cashless_card", "health_cashless_preauth", "Health Insurance Card & Government ID", "document", 1, "Photo of Star Health / insurer e-card and patient Aadhaar/PAN", 2),
    ("ev_h_cashless_note", "health_cashless_preauth", "Doctor Consultation Note & Admission Advice", "document", 1, "Doctor prescription detailing diagnosis and hospitalization necessity", 3),

    ("ev_h_reimb_discharge", "health_reimbursement", "Hospital Discharge Summary", "document", 1, "Complete discharge card signed by treating doctor showing admission & discharge dates", 1),
    ("ev_h_reimb_final_bill", "health_reimbursement", "Itemized Final Hospital Bill with Breakup", "invoice", 1, "Detailed original hospital bill with charges for bed, pharmacy, nursing, and surgery", 2),
    ("ev_h_reimb_receipts", "health_reimbursement", "Hospital Payment Receipts & Paid Stamp", "invoice", 1, "Original payment receipts with hospital official paid stamp", 3),
    ("ev_h_reimb_reports", "health_reimbursement", "Diagnostic Lab & Radiology Investigation Reports", "document", 1, "Blood tests, X-rays, CT/MRI, ultrasound, or biopsy reports supporting diagnosis", 4),
    ("ev_h_reimb_cheque", "health_reimbursement", "Cancelled Cheque for Direct NEFT Reimbursement", "document", 1, "Cancelled cheque or bank passbook copy showing account holder name & IFSC code", 5),

    ("ev_h_daycare_slip", "health_daycare_procedure", "Day Care Discharge Slip & Surgical Notes", "document", 1, "Discharge slip stating procedure performed and operation notes", 1),
    ("ev_h_daycare_bill", "health_daycare_procedure", "Itemized Treatment Bill & Receipts", "invoice", 1, "Detailed invoice and payment receipts", 2),

    ("ev_h_prepost_rx", "health_pre_post_expenses", "Doctor Follow-Up Prescriptions", "document", 1, "Prescription explicitly linking medications and tests to hospitalization", 1),
    ("ev_h_prepost_bills", "health_pre_post_expenses", "Itemized Pharmacy & Diagnostic Bills", "invoice", 1, "Original pharmacy cash memos with batch numbers and lab test receipts", 2),

    ("ev_h_acc_casualty", "health_accidental_emergency", "Casualty / Emergency Room Admission Record", "document", 1, "Emergency department clinical notes recorded at time of admission", 1),
    ("ev_h_acc_xray", "health_accidental_emergency", "X-Ray / Scan Reports & Bills", "document", 1, "Radiology reports confirming fracture, trauma, or injury", 2),

    # ─── Motor Insurance Evidence Requirements ────────────────────
    ("ev_m_col_photos", "motor_accident_collision", "Clear Photos of Vehicle Damage (4 sides & closeup)", "photo", 1, "Photos showing vehicle number plate, overall damage, and close-ups of damaged parts", 1),
    ("ev_m_col_dl", "motor_accident_collision", "Valid Driving License (DL) of Person Driving", "document", 1, "Front and back photo of valid driver's license at time of incident", 2),
    ("ev_m_col_rc", "motor_accident_collision", "Vehicle Registration Certificate (RC Book)", "document", 1, "Clear photo or digital copy of vehicle RC", 3),
    ("ev_m_col_policy", "motor_accident_collision", "Motor Insurance Policy Schedule", "document", 1, "Copy of active insurance policy document", 4),
    ("ev_m_col_fir", "motor_accident_collision", "Police FIR / GD Copy (If third-party involved)", "document", 0, "Mandatory if third-party vehicle damaged or bodily injury occurred", 5),

    ("ev_m_dent_photo", "motor_body_dent_paint", "Photos of Dents, Scratches and Body Panels", "photo", 1, "Clear photos showing damaged panels with vehicle registration plate visible", 1),
    ("ev_m_dent_dl_rc", "motor_body_dent_paint", "Driving License & Vehicle RC", "document", 1, "DL of driver and vehicle RC copy", 2),

    ("ev_m_glass_photo", "motor_windshield_glass", "Clear Photo of Cracked / Broken Glass with Brand Stamp", "photo", 1, "Photo showing crack pattern and manufacturer glass watermark / stamp", 1),
    ("ev_m_glass_rc", "motor_windshield_glass", "Vehicle Registration Certificate (RC)", "document", 1, "Copy of vehicle RC", 2),

    ("ev_m_hydro_photo", "motor_engine_hydro_lock", "Photo of Vehicle in Waterlogged Area & Engine Compartment", "photo", 1, "Photos documenting water level and engine bay state", 1),
    ("ev_m_hydro_report", "motor_engine_hydro_lock", "Workshop Technical Inspection Report", "document", 1, "Garage dismantle report confirming water ingress or oil sump fracture", 2),

    ("ev_m_rsa_loc_photo", "motor_rsa_towing", "Photo of Vehicle at Current Breakdown Location", "photo", 1, "Photo of vehicle showing surrounding street/landmark for tow driver", 1),

    # ─── Physical Devices Evidence Requirements ───────────────────
    ("ev_wm_drain_drum", "wm_not_draining", "Photo of drum showing standing water", "photo", 1, "Clear photo showing standing water inside drum or drain hose", 1),
    ("ev_wm_drain_serial", "wm_not_draining", "Photo of product serial number / model sticker", "serial_photo", 1, "Sticker usually located on inner door rim, back or side panel", 2),
    ("ev_wm_drain_invoice", "wm_not_draining", "Original purchase invoice", "invoice", 1, "Bill or digital invoice showing purchase date & dealer", 3),
    ("ev_wm_vib_photo", "wm_vibration", "Photo of machine and installation surface", "photo", 1, "Photo showing machine feet and leveling surface", 1),
    ("ev_wm_vib_serial", "wm_vibration", "Photo of product serial number / model sticker", "serial_photo", 1, "Sticker on door rim or back panel", 2),
    ("ev_wm_vib_invoice", "wm_vibration", "Original purchase invoice", "invoice", 1, "Bill or digital invoice", 3),
    ("ev_wm_leak_puddle", "wm_water_leakage", "Photo showing water leak / pool on floor", "photo", 1, "Clear photo showing water origin or puddle around machine", 1),
    ("ev_wm_err_display", "wm_display_error", "Photo of error code on display screen", "photo", 1, "Clear, legible photo showing the error digits/code on screen", 1),

    ("ev_phone_chg_port", "phone_charging", "Photo of phone charging port & cable", "photo", 1, "Close-up photo of charging port showing pins and cable tip", 1),
    ("ev_phone_chg_serial", "phone_charging", "Screenshot of About Phone / IMEI or box label", "serial_photo", 1, "Screenshot showing serial/IMEI or photo of box sticker", 2),
    ("ev_phone_chg_invoice", "phone_charging", "Original purchase invoice", "invoice", 1, "Store receipt or eCommerce tax invoice", 3),
    ("ev_phone_screen_photo", "phone_screen", "Photo of phone screen while turned on", "photo", 1, "Clear photo showing the screen defect, lines, or cracked area", 1),

    ("ev_tv_screen_photo", "tv_screen", "Photo of TV screen while powered on", "photo", 1, "Photo of screen displaying the lines, distortion, or black screen", 1),
    ("ev_fridge_temp_photo", "fridge_not_cooling", "Photo of interior compartment & temperature dials", "photo", 1, "Photo of fridge settings and interior", 1),
    ("ev_ac_indoor_photo", "ac_not_cooling", "Photo of indoor unit display & filters", "photo", 1, "Photo of indoor blower display", 1),

    # ─── Generic Fallback Evidence ────────────────────────────────
    ("ev_gen_photo", "gen_not_turning_on", "Photo of product and power connection", "photo", 1, "Overall photo of the product", 1),
    ("ev_gen_serial", "gen_not_turning_on", "Photo of serial number / model plate", "serial_photo", 1, "Serial number or rating plate", 2),
    ("ev_gen_invoice", "gen_not_turning_on", "Original purchase invoice", "invoice", 1, "Receipt or invoice", 3),
]

# ─── 5. NLP / Symptom Matching Keywords (For "I'm not sure" classification) ───
NLP_SYMPTOM_MAP = {
    # Health Insurance
    "health_cashless_preauth": ["cashless", "pre-auth", "preauth", "pre authorization", "admit", "admission", "admitted", "planned admission", "tpa", "hospitalization", "inpatient", "room rent"],
    "health_reimbursement": ["reimburse", "reimbursement", "discharged", "hospital bill", "medical bill", "settled", "paid bill", "claim money back", "refund", "discharge summary"],
    "health_daycare_procedure": ["cataract", "dialysis", "chemo", "chemotherapy", "radiation", "day care", "daycare", "same day", "minor surgery", "eye surgery", "lithotripsy"],
    "health_pre_post_expenses": ["pharmacy", "medicine", "diagnostic", "blood test", "follow up", "post hospital", "pre hospital", "consultation", "lab test"],
    "health_accidental_emergency": ["accident", "injury", "fracture", "casualty", "emergency", "trauma", "fall", "road accident", "wound", "stitches"],
    "health_critical_illness": ["cancer", "heart attack", "cardiac", "kidney failure", "renal", "stroke", "paralysis", "transplant", "tumor", "critical illness"],

    # Motor Insurance
    "motor_accident_collision": ["collision", "accident", "crash", "hit", "smashed", "head on", "divider", "damaged front", "rear end", "impact"],
    "motor_body_dent_paint": ["dent", "dented", "scratch", "scratched", "bumper", "fender", "body damage", "paint", "door dent"],
    "motor_windshield_glass": ["windshield", "glass", "cracked glass", "broken glass", "mirror", "window broken", "stone hit", "rear glass"],
    "motor_engine_hydro_lock": ["hydro", "hydro-lock", "water in engine", "flood", "stalled in water", "waterlogged", "sump", "oil leak"],
    "motor_theft_total_loss": ["theft", "stolen", "burglary", "keys stolen", "untraced", "total loss", "fire", "burnt"],
    "motor_rsa_towing": ["towing", "tow", "breakdown", "flat tire", "puncture", "jumpstart", "dead battery", "lockout", "fuel"],

    # Washing Machine
    "wm_vibration": ["shake", "shaking", "vibrat", "vibration", "unbalanced", "jumping", "unsteady", "wobble", "shuffles", "walks"],
    "wm_not_draining": ["drain", "draining", "water inside", "standing water", "pump", "empty", "emptying", "5e", "oe", "e2", "soggy", "not empty"],
    "wm_water_leakage": ["leak", "leaking", "spill", "water on floor", "puddle", "dripping", "overflow", "wet floor", "gasket"],
    "wm_not_spinning": ["spin", "spinning", "drum stuck", "drum not turning", "rotate", "rotating", "agitat", "cycle stuck"],
    "wm_unusual_noise": ["noise", "loud", "sound", "grinding", "squeaking", "rattling", "bang", "banging", "screech", "thumping"],
    "wm_not_turning_on": ["power", "turn on", "dead", "won't start", "no power", "black display", "unresponsive"],
    "wm_display_error": ["error code", "display", "blinking", "flashing", "error", "code", "4e", "5e", "ue", "de", "le", "digits"],
    "wm_door_lid": ["door", "lid", "lock", "latch", "jammed", "stuck door", "won't open", "won't close", "door handle"],
    "wm_not_cleaning": ["clean", "cleaning", "dirty", "stain", "soap", "detergent", "smell", "odor", "residue"],
    "wm_not_heating": ["heat", "heating", "cold water", "temperature", "hot water", "heater"],

    # Smartphone
    "phone_charging": ["charge", "charging", "charger", "cable", "port", "usb-c", "lightning", "loose port", "slow charge", "not charging"],
    "phone_battery": ["battery", "drain", "draining", "dying", "battery life", "backup", "swollen", "shut down at 30", "dies fast"],
    "phone_screen": ["screen", "display", "cracked", "glass", "lines", "flicker", "black screen", "touch", "unresponsive", "green line", "dead pixel"],
    "phone_camera": ["camera", "blurry", "focus", "lens", "viewfinder", "shaking camera", "photo dark"],
    "phone_speaker_mic": ["speaker", "microphone", "mic", "earpiece", "cannot hear", "crackling", "silent", "sound low", "call volume"],
    "phone_liquid": ["water", "liquid", "dropped in water", "spill", "moisture", "rain", "corrosion"],
    "phone_overheating": ["hot", "overheating", "burning hot", "heats up", "thermal"],

    # Television
    "tv_screen": ["screen", "cracked", "broken", "lines", "colors", "pixel", "display"],
    "tv_no_picture": ["no picture", "black screen", "sound works", "hear audio", "blank screen", "backlight"],
    "tv_lines_flickering": ["lines", "horizontal line", "vertical line", "flicker", "flickering", "strobing"],
    "tv_sound": ["sound", "audio", "speaker", "buzzing", "no sound", "distorted sound"],
    "tv_power": ["power", "won't turn on", "blinking light", "standby light", "dead tv", "red light blinking"],

    # Refrigerator
    "fridge_not_cooling": ["not cooling", "warm", "cooling", "spoiling", "food warm", "defrost", "compressor"],
    "fridge_freezing": ["freezing", "ice", "frozen milk", "frozen vegetables", "too cold"],
    "fridge_water_leakage": ["leak", "leaking", "water under", "puddle", "crisper water"],
    "fridge_noise": ["noise", "loud", "buzzing", "clicking", "rattling", "humming"],

    # Air Conditioner
    "ac_not_cooling": ["not cooling", "warm air", "hot air", "no cooling", "compressor off", "room warm"],
    "ac_water_leak": ["leak", "leaking", "dripping", "water dripping", "indoor leak"],
    "ac_ice": ["ice", "frost", "frozen coil", "ice on pipe"],
    "ac_noise": ["noise", "rattling", "vibrating", "loud outdoor unit"],
}
