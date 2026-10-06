#!/usr/bin/env python3
"""
tools/check_ollama.py
Handshake script for Phase 2: Link
Verifies local Ollama API availability and available models.
"""

import sys
import json
import urllib.request
import urllib.error

OLLAMA_HOST = "http://localhost:11434"

def check_ollama_status(host=OLLAMA_HOST):
    print(f"🔍 Testing connection to Ollama at {host}...")
    
    # 1. Check API tags / health
    tags_url = f"{host}/api/tags"
    try:
        req = urllib.request.Request(tags_url, headers={"User-Agent": "Antigravity/Phase2-Handshake"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                models = [m.get('name') for m in data.get('models', [])]
                print(f"✅ Ollama API is reachable at {host}")
                print(f"📦 Installed models ({len(models)}): {', '.join(models) if models else 'None found'}")
                return True, models
            else:
                print(f"❌ Ollama returned unexpected status code: {response.status}")
                return False, []
    except urllib.error.URLError as e:
        print(f"❌ Failed to connect to Ollama at {host}: {e.reason}")
        print("   Please ensure Ollama service is running (`ollama serve` or Ollama App).")
        return False, []
    except Exception as e:
        print(f"❌ Unexpected error connecting to Ollama: {e}")
        return False, []

def test_generate_handshake(host=OLLAMA_HOST, model="codellama"):
    print(f"\n🤝 Testing model generation handshake with model '{model}'...")
    generate_url = f"{host}/api/generate"
    payload = {
        "model": model,
        "prompt": "Respond with 'OK' if you can read this.",
        "stream": False
    }
    
    try:
        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            generate_url, 
            data=data_bytes, 
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status == 200:
                res_data = json.loads(response.read().decode('utf-8'))
                response_text = res_data.get('response', '').strip()
                print(f"✅ Model '{model}' handshake successful!")
                print(f"💬 Sample Response: {response_text}")
                return True
            else:
                print(f"❌ Generation request failed with status: {response.status}")
                return False
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error testing model '{model}': {e.code} - {e.reason}")
        try:
            err_body = e.read().decode('utf-8')
            print(f"   Error details: {err_body}")
        except Exception:
            pass
        return False
    except Exception as e:
        print(f"❌ Handshake generation failed for '{model}': {e}")
        return False

if __name__ == "__main__":
    is_up, models = check_ollama_status()
    if not is_up:
        sys.exit(1)
        
    target_model = "codellama"
    # Check if target model or matching name exists in installed models
    matched_models = [m for m in models if target_model in m]
    if matched_models:
        selected_model = matched_models[0]
    elif models:
        selected_model = models[0]
        print(f"⚠️ Model '{target_model}' not found in installed tags. Falling back to '{selected_model}'.")
    else:
        selected_model = target_model

    success = test_generate_handshake(model=selected_model)
    if success:
        print("\n🎉 Phase 2 Link Handshake PASSED!")
        sys.exit(0)
    else:
        print("\n⚠️ Phase 2 Link Handshake FAILED.")
        sys.exit(1)
