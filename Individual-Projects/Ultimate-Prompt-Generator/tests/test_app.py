"""Unit and Integration Tests for Ultimate Prompt Generator."""
import json
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from tools.prompt_compiler import ALL_SECTIONS, PRESETS, check_clarification_needs, compile_prompt


def test_compiler_presets():
    """Verify all predefined presets compile valid 17-section prompts."""
    for key, preset in PRESETS.items():
        res = compile_prompt(preset)
        assert res["status"] == "success", f"Failed preset {key}"
        assert res["metadata"]["sectionCount"] == 17, f"Expected 17 sections for {key}"
        assert res["metadata"]["wordCount"] > 800, f"Prompt too short for {key}"
        assert "## 1. Role & Expert Identity" in res["generatedPrompt"]
        assert "## 17. Initial Kick-Off Instruction" in res["generatedPrompt"]
    print("✅ test_compiler_presets passed!")


def test_section_filtering():
    """Verify selective section inclusion works properly."""
    sample = dict(PRESETS["qa_automation"])
    sample["activeSections"] = ["role_identity", "mission_objectives", "kickoff_step"]
    res = compile_prompt(sample)
    assert res["status"] == "success"
    assert res["metadata"]["sectionCount"] == 3
    assert "## 1. Role & Expert Identity" in res["generatedPrompt"]
    assert "## 2. Mission & Long-Term Objectives" in res["generatedPrompt"]
    assert "## 17. Initial Kick-Off Instruction" in res["generatedPrompt"]
    assert "## 5. Knowledge & Subject-Matter Coverage" not in res["generatedPrompt"]
    print("✅ test_section_filtering passed!")


def test_clarification_detection():
    """Verify clarification questions trigger when context is ambiguous."""
    short_request = {"topic": "AI", "techStack": [], "experienceLevel": ""}
    q = check_clarification_needs(short_request)
    assert q is not None
    assert "scope" in q.lower() or "topic" in q.lower()
    print("✅ test_clarification_detection passed!")


def test_flask_endpoints():
    """Test Flask web routes and JSON API responses."""
    client = app.test_client()

    # 1. Health endpoint
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    health_data = health_res.get_json()
    assert health_data["status"] == "healthy"
    assert "ollama" in health_data

    # 2. Presets endpoint
    presets_res = client.get("/api/presets")
    assert presets_res.status_code == 200
    presets_data = presets_res.get_json()
    assert "qa_automation" in presets_data

    # 3. Generate endpoint
    gen_payload = {
        "topic": "Automated Chaos Engineering for Kubernetes Clusters",
        "targetRole": "Principal SRE & Chaos Architect",
        "category": "Cloud & DevOps",
        "experienceLevel": "Advanced",
        "techStack": ["Chaos Mesh", "Kubernetes", "Go", "Prometheus"],
        "engine": "deterministic",
    }
    gen_res = client.post("/api/generate", json=gen_payload)
    assert gen_res.status_code == 200
    gen_data = gen_res.get_json()
    assert gen_data["status"] == "success"
    assert "Chaos Engineering" in gen_data["title"]
    assert gen_data["metadata"]["sectionCount"] == 17

    # 4. Download endpoint
    dl_payload = {
        "content": "# Test Prompt",
        "filename": "test_prompt.md",
        "format": "md",
    }
    dl_res = client.post("/api/download", json=dl_payload)
    assert dl_res.status_code == 200
    assert dl_res.data == b"# Test Prompt"

    # 5. Index page
    index_res = client.get("/")
    assert index_res.status_code == 200
    assert b"Ultimate Prompt Generator" in index_res.data

    print("✅ test_flask_endpoints passed!")


if __name__ == "__main__":
    test_compiler_presets()
    test_section_filtering()
    test_clarification_detection()
    test_flask_endpoints()
    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")

