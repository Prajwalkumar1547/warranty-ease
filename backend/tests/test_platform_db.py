"""
Automated Test Suite for WarrantyEase Relational Database Platform Engine
Tests SQLite schema, foreign keys, protection records, claims (WE-XXXXXX),
claim events, status transitions, messaging, and admin metrics.
"""

import os
import sys
import unittest

# Ensure backend root is in sys.path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import database

class TestPlatformDatabase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        database.init_db()

    def test_admin_metrics(self):
        stats = database.get_admin_metrics()
        self.assertIn("total_users", stats)
        self.assertIn("total_protections", stats)
        self.assertIn("total_claims", stats)
        self.assertIn("total_companies", stats)
        self.assertGreaterEqual(stats["total_users"], 4)
        self.assertGreaterEqual(stats["total_companies"], 6)

    def test_protections_query(self):
        prots = database.get_all_protections()
        self.assertGreaterEqual(len(prots), 1)
        first = prots[0]
        self.assertIn("brand", first)
        self.assertIn("protection_type", first)
        self.assertIn("status", first)

    def test_add_and_delete_protection(self):
        new_prot = {
            "customer_id": "usr-cust-1",
            "type": "PRODUCT_WARRANTY",
            "protection_type": "Warranty",
            "brand": "Sony",
            "product_name": "Sony WH-1000XM5 Wireless Headphones",
            "category": "Audio",
            "purchase_date": "2026-05-10",
            "expiry_date": "2027-05-10",
            "warranty_duration_months": 12,
            "serial_number": "SONY-WH-998811",
            "price": 24990.0,
            "currency": "₹",
            "status": "Active"
        }
        saved = database.add_protection(new_prot)
        self.assertIsNotNone(saved)
        self.assertEqual(saved["brand"], "Sony")
        self.assertEqual(saved["price"], 24990.0)

        # Delete test
        deleted = database.delete_protection(saved["id"])
        self.assertTrue(deleted)
        after = database.get_protection_by_id(saved["id"])
        self.assertIsNone(after)

    def test_create_claim_and_timeline_events(self):
        claim_data = {
            "customer_id": "usr-cust-1",
            "brand": "boAt",
            "product_name": "Rockerz 550",
            "category": "Audio",
            "protection_type": "Warranty",
            "claim_type": "Warranty Claim",
            "issue_category": "Battery & Power Issue",
            "problem_description": "Battery not holding charge more than 10 minutes.",
            "preferred_resolution": "Replacement",
            "claimed_amount": 1999.0
        }
        claim = database.create_claim(claim_data)
        self.assertIsNotNone(claim)
        self.assertTrue(claim["id"].startswith("WE-"))
        self.assertEqual(claim["status"], "SUBMITTED")
        self.assertGreaterEqual(len(claim["events"]), 1)
        self.assertEqual(claim["events"][0]["new_status"], "SUBMITTED")

        # Test Status Transition to APPROVED
        updated = database.update_claim_status(
            claim["id"],
            "APPROVED",
            actor_name="boAt Service Lead",
            actor_role="company",
            notes="Replacement authorized under manufacturer warranty terms."
        )
        self.assertIsNotNone(updated)
        self.assertEqual(updated["status"], "APPROVED")
        # Check event audit log
        latest_event = updated["events"][-1]
        self.assertEqual(latest_event["old_status"], "SUBMITTED")
        self.assertEqual(latest_event["new_status"], "APPROVED")
        self.assertEqual(latest_event["actor_role"], "company")

    def test_claim_messaging(self):
        claims = database.get_all_claims()
        self.assertGreaterEqual(len(claims), 1)
        claim_id = claims[0]["id"]

        msg = database.add_claim_message(
            claim_id,
            sender_id="usr-cust-1",
            sender_name="Rahul Sharma",
            sender_role="customer",
            message="Can you confirm if courier pickup is scheduled for tomorrow?"
        )
        self.assertIsNotNone(msg)
        self.assertEqual(msg["claim_id"], claim_id)

        refreshed = database.get_claim_by_id(claim_id)
        msg_texts = [m["message"] for m in refreshed["messages"]]
        self.assertIn("Can you confirm if courier pickup is scheduled for tomorrow?", msg_texts)

    def test_companies_list(self):
        comps = database.get_companies()
        self.assertGreaterEqual(len(comps), 5)
        names = [c["name"] for c in comps]
        self.assertIn("boAt", names)
        self.assertIn("Samsung", names)
        self.assertIn("Apple", names)

    def test_notifications_list(self):
        notifs = database.get_notifications("usr-cust-1")
        self.assertGreaterEqual(len(notifs), 1)
        first = notifs[0]
        self.assertIn("title", first)
        self.assertIn("message", first)

if __name__ == "__main__":
    unittest.main(verbosity=2)
