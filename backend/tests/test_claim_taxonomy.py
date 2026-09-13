"""
Unit tests for WarrantyEase Product-Aware Claim Issue Taxonomy & NLP Classification
Verifies:
- Product category hierarchy
- Level 1 / Level 2 / Level 3 resolution
- Category-specific issues (e.g. Washing machine has NOT DRAINING, VIBRATION, NO BATTERY/SCREEN)
- Dynamic follow-up questions and tailored evidence checklist
- NLP symptom matching to controlled taxonomy without inventing arbitrary categories
"""

import os
import sys
import unittest

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import database

class TestClaimTaxonomy(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        database.init_db()

    def test_taxonomy_categories_hierarchy(self):
        cats = database.get_taxonomy_categories()
        self.assertGreaterEqual(len(cats), 4)
        cat_ids = [c["id"] for c in cats]
        self.assertIn("home_appliances", cat_ids)
        self.assertIn("consumer_electronics", cat_ids)

        # Check Home Appliances has washing machine
        ha = next(c for c in cats if c["id"] == "home_appliances")
        sub_ids = [s["id"] for s in ha.get("subcategories", [])]
        self.assertIn("cat_washing_machine", sub_ids)
        self.assertIn("cat_refrigerator", sub_ids)
        self.assertIn("cat_ac", sub_ids)

    def test_resolve_product_category_washing_machine(self):
        # Washing machine products
        cid1 = database.resolve_product_category("Home Appliances", "Samsung 8kg Front Load AI Washing Machine", "WW80T504DAX1TL")
        self.assertEqual(cid1, "cat_washing_machine")

        cid2 = database.resolve_product_category("Appliances", "LG Inverter TurboWash Washer", "FHM1408BDW")
        self.assertEqual(cid2, "cat_washing_machine")

    def test_resolve_product_category_other_products(self):
        # Phone
        self.assertEqual(database.resolve_product_category("Electronics", "iPhone 15 Pro Max"), "cat_smartphone")
        # TV
        self.assertEqual(database.resolve_product_category("Television", "Sony Bravia 55 Inch 4K OLED"), "cat_tv")
        # Refrigerator
        self.assertEqual(database.resolve_product_category("Appliances", "Whirlpool Double Door Refrigerator"), "cat_refrigerator")
        # AC
        self.assertEqual(database.resolve_product_category("Appliances", "Daikin 1.5 Ton Inverter AC"), "cat_ac")
        # Laptop
        self.assertEqual(database.resolve_product_category("Computers", "Apple MacBook Pro M3"), "cat_laptop")
        # Audio
        self.assertEqual(database.resolve_product_category("Audio", "boAt Rockerz 550"), "cat_audio")
        # Unknown -> Level 3 Fallback
        self.assertEqual(database.resolve_product_category("Tools", "Heavy Duty Hydraulic Jack"), "cat_generic")

    def test_washing_machine_issues_not_generic_phone(self):
        issues = database.get_issues_for_category("cat_washing_machine")
        issue_ids = [i["id"] for i in issues]
        
        # Must contain washing machine issues
        self.assertIn("wm_not_draining", issue_ids)
        self.assertIn("wm_vibration", issue_ids)
        self.assertIn("wm_water_leakage", issue_ids)
        self.assertIn("wm_not_spinning", issue_ids)
        self.assertIn("wm_not_turning_on", issue_ids)
        self.assertIn("wm_display_error", issue_ids)
        self.assertIn("wm_not_sure", issue_ids)

        # Must NOT contain phone/screen issues!
        self.assertNotIn("phone_battery", issue_ids)
        self.assertNotIn("phone_charging", issue_ids)
        self.assertNotIn("phone_screen", issue_ids)

    def test_dynamic_questions_and_evidence_for_drain_issue(self):
        res = database.get_questions_for_issue("wm_not_draining")
        self.assertIn("questions", res)
        self.assertIn("evidence_requirements", res)
        
        questions = res["questions"]
        q_texts = [q["question"] for q in questions]
        self.assertTrue(any("water remaining" in q.lower() for q in q_texts))
        self.assertTrue(any("error code" in q.lower() for q in q_texts))

        evidence = res["evidence_requirements"]
        ev_titles = [e["title"] for e in evidence]
        self.assertTrue(any("standing water" in e.lower() or "drum" in e.lower() for e in ev_titles))
        self.assertTrue(any("serial" in e.lower() for e in ev_titles))
        self.assertTrue(any("invoice" in e.lower() for e in ev_titles))

    def test_nlp_issue_classification_controlled(self):
        # 1. Shaking during spin
        res1 = database.classify_issue_nlp("cat_washing_machine", "My washing machine shakes violently and vibrates loudly when spinning.")
        self.assertEqual(res1["matched_issue_id"], "wm_vibration")
        self.assertGreater(res1["confidence"], 0.6)

        # 2. Water leaking on floor
        res2 = database.classify_issue_nlp("cat_washing_machine", "There is a puddle of water leaking underneath the washing machine during wash.")
        self.assertEqual(res2["matched_issue_id"], "wm_water_leakage")

        # 3. Water not draining
        res3 = database.classify_issue_nlp("cat_washing_machine", "Drum has standing water and is not draining the water out.")
        self.assertEqual(res3["matched_issue_id"], "wm_not_draining")

        # 4. Phone charging problem
        res4 = database.classify_issue_nlp("cat_smartphone", "My phone won't charge when plugged into the USB-C cable.")
        self.assertEqual(res4["matched_issue_id"], "phone_charging")

    def test_health_insurance_resolution_and_issues(self):
        # User reported case: Star Health Insurance with random/short product name "fgdg"
        cid = database.resolve_product_category(
            category_name="Insurance",
            product_name="fgdg",
            model="fgdg",
            brand="Star Health Insurance",
            protection_type="Insurance"
        )
        self.assertEqual(cid, "cat_ins_health")

        issues = database.get_issues_for_category("cat_ins_health")
        issue_ids = [i["id"] for i in issues]
        self.assertIn("health_cashless_preauth", issue_ids)
        self.assertIn("health_reimbursement", issue_ids)
        self.assertIn("health_daycare_procedure", issue_ids)
        self.assertIn("health_pre_post_expenses", issue_ids)

        # Ensure NO appliance or hardware options appear for Health Insurance!
        self.assertNotIn("gen_power_charging", issue_ids)
        self.assertNotIn("gen_leakage", issue_ids)
        self.assertNotIn("wm_not_spinning", issue_ids)

        # Check diagnostic questions for reimbursement
        res = database.get_questions_for_issue("health_reimbursement")
        q_texts = [q["question"] for q in res["questions"]]
        self.assertTrue(any("discharge" in q.lower() or "hospital" in q.lower() for q in q_texts))

        ev_titles = [e["title"] for e in res["evidence_requirements"]]
        self.assertTrue(any("discharge summary" in e.lower() for e in ev_titles))
        self.assertTrue(any("hospital bill" in e.lower() for e in ev_titles))

    def test_motor_insurance_resolution_and_issues(self):
        cid = database.resolve_product_category(
            category_name="Insurance",
            product_name="Tata Nexon EV",
            model="Creative Plus",
            brand="Tata AIG Motor Insurance",
            protection_type="Insurance"
        )
        self.assertEqual(cid, "cat_ins_motor")

        issues = database.get_issues_for_category("cat_ins_motor")
        issue_ids = [i["id"] for i in issues]
        self.assertIn("motor_accident_collision", issue_ids)
        self.assertIn("motor_body_dent_paint", issue_ids)
        self.assertIn("motor_windshield_glass", issue_ids)
        self.assertIn("motor_engine_hydro_lock", issue_ids)

    def test_no_emojis_in_taxonomy(self):
        full = database.get_full_admin_taxonomy()
        all_issues = [item for sublist in full["issues_by_category"].values() for item in sublist]
        for issue in all_issues:
            # Check icon is empty string
            self.assertEqual(issue.get("icon", ""), "", f"Issue {issue['id']} has an emoji icon: {issue.get('icon')}")
            # Check name has no common emojis
            for emoji_char in ["⚡", "💧", "🛑", "🔨", "📉", "🔌", "🔊", "❓", "🧑‍💻", "🤷", "🌀", "❄️", "📱", "📺"]:
                self.assertNotIn(emoji_char, issue["name"], f"Issue {issue['id']} contains emoji {emoji_char}")

    def test_admin_full_taxonomy(self):
        full = database.get_full_admin_taxonomy()
        self.assertIn("categories", full)
        self.assertIn("issues_by_category", full)
        self.assertGreater(full["total_categories"], 0)
        self.assertGreater(full["total_issues"], 0)
        self.assertGreater(full["total_questions"], 0)
        self.assertGreater(full["total_evidence_rules"], 0)

if __name__ == "__main__":
    unittest.main()
