"""Unit and Integration Tests for Mindset Builder Agent."""
import os
import sys
import unittest

# Ensure project directory is in python search path
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from app import app
from tools.domain_analyzer import analyze_domain
from tools.analogy_engine import generate_analogies_for_domain
from tools.curriculum_generator import generate_curriculum
from tools.orchestrator import (
    initialize_mindset_session,
    select_analogy_and_build_curriculum,
    handle_socratic_chat,
    export_mindset_dossier_markdown
)


class TestMindsetBuilderAgent(unittest.TestCase):
    """Test suite for Mindset Builder Agent."""

    def setUp(self):
        self.client = app.test_client()

    def test_domain_analyzer_qa(self):
        """Test domain analyzer parses QA field correctly."""
        intel = analyze_domain("I need QA mindset")
        self.assertIn("Quality Assurance", intel["domain"])
        self.assertGreaterEqual(len(intel["first_principles"]), 2)
        self.assertGreaterEqual(len(intel["syllabi_and_standards"]), 2)
        self.assertIn("novice", intel["expert_vs_novice_mindset"])
        self.assertIn("expert", intel["expert_vs_novice_mindset"])
        self.assertGreaterEqual(len(intel["core_cognitive_heuristics"]), 3)

    def test_domain_analyzer_arbitrary_field(self):
        """Test domain analyzer handles arbitrary unknown field gracefully."""
        intel = analyze_domain("Neurosurgeon")
        self.assertIn("Neurosurgeon", intel["domain"])
        self.assertTrue(len(intel["first_principles"]) > 0)
        self.assertTrue(len(intel["syllabi_and_standards"]) > 0)

    def test_analogy_engine_tri_tier(self):
        """Test 3 analogies are generated with proper cognitive tiers and mappings."""
        intel = analyze_domain("QA Engineer")
        anas = generate_analogies_for_domain(intel)

        self.assertIn("easy", anas)
        self.assertIn("medium", anas)
        self.assertIn("hard", anas)

        # Verify Doctor analogy for QA
        self.assertIn("Doctor", anas["easy"]["title"])
        self.assertGreaterEqual(len(anas["easy"]["mapping"]), 3)
        self.assertIn("Airport", anas["medium"]["title"])
        self.assertIn("Popper", anas["hard"]["title"])

    def test_curriculum_generator_5_chapters(self):
        """Test curriculum generates 5 structured chapters with scenario drills."""
        intel = analyze_domain("QA Engineer")
        anas = generate_analogies_for_domain(intel)
        curriculum = generate_curriculum(intel, anas["easy"])

        self.assertEqual(len(curriculum), 5)
        for ch in curriculum:
            self.assertIn("chapter_id", ch)
            self.assertIn("title", ch)
            self.assertIn("analogy_immersion", ch)
            self.assertIn("golden_axiom", ch)
            self.assertIn("scenario_drill", ch)
            drill = ch["scenario_drill"]
            self.assertIn("situation", drill)
            self.assertGreaterEqual(len(drill["options"]), 2)

    def test_orchestrator_dossier_export(self):
        """Test Markdown dossier formatting."""
        session = initialize_mindset_session("DevOps")
        curr_session = select_analogy_and_build_curriculum(session["domain_intel"], "easy")
        md = export_mindset_dossier_markdown(
            session["domain_intel"],
            curr_session["selected_analogy"],
            curr_session["curriculum"]
        )
        self.assertIn("# 🧠 Master Mindset Blueprint: DevOps", md)
        self.assertIn("First Principles", md)
        self.assertIn("Scenario Drill", md)

    def test_flask_endpoints(self):
        """Test Flask web endpoints."""
        # 1. Health check
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)

        # 2. Main page
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"MINDSET.AI", res.data)
        self.assertIn(b"neural-canvas", res.data)

        # 3. Analyze domain endpoint
        res = self.client.post("/api/domain/analyze", json={"domain": "QA Mindset"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("domain_intel", data)
        self.assertIn("analogies", data)

        # 4. Build curriculum endpoint
        res = self.client.post("/api/curriculum/build", json={
            "domain_intel": data["domain_intel"],
            "analogy_key": "easy"
        })
        self.assertEqual(res.status_code, 200)
        curric_data = res.get_json()
        self.assertEqual(len(curric_data["curriculum"]), 5)

        # 5. Socratic chat endpoint
        res = self.client.post("/api/chat", json={
            "domain_intel": data["domain_intel"],
            "selected_analogy": curric_data["selected_analogy"],
            "message": "How do I diagnose a flaky test like a doctor?"
        })
        self.assertEqual(res.status_code, 200)
        chat_data = res.get_json()
        self.assertEqual(chat_data["status"], "success")
        self.assertTrue(len(chat_data["reply"]) > 20)

        # 6. Export endpoint
        res = self.client.post("/api/export", json={
            "domain_intel": data["domain_intel"],
            "selected_analogy": curric_data["selected_analogy"],
            "curriculum": curric_data["curriculum"]
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("Content-Type"), "text/markdown; charset=utf-8")


if __name__ == "__main__":
    unittest.main()

