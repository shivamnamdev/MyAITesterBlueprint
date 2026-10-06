#!/usr/bin/env python3
"""
tools/converter_cli.py
CLI tool to convert Selenium Java single files or entire directory trees to Playwright TypeScript.
"""

import os
import sys
import argparse
import time
from java_parser import JavaFileParser
from ollama_client import OllamaConverterClient
from post_processor import TypeScriptPostProcessor

def convert_single_file(filepath: str, output_dir: str, client: OllamaConverterClient) -> dict:
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return {"status": "error", "file": filepath, "error": "File not found"}

    print(f"\n📄 Parsing Java source: {filepath}")
    parser = JavaFileParser(filepath)
    metadata = parser.parse()

    file_type = metadata.get("fileType")
    class_name = metadata.get("className") or os.path.splitext(os.path.basename(filepath))[0]

    # Organize output files by directory type
    if file_type == "page_object":
        target_subdir = os.path.join(output_dir, "pages")
        target_filename = f"{class_name}.ts"
    elif file_type == "test_class":
        target_subdir = os.path.join(output_dir, "tests")
        target_filename = f"{class_name}.spec.ts"
    else:
        target_subdir = os.path.join(output_dir, "utils")
        target_filename = f"{class_name}.ts"

    os.makedirs(target_subdir, exist_ok=True)
    target_filepath = os.path.join(target_subdir, target_filename)

    print(f"🤖 Invoking Ollama ({client.model}) for conversion...")
    try:
        raw_ts_code = client.convert_java_to_ts(metadata)
        
        # Phase 4: Stylize Post-Processing
        post_processor = TypeScriptPostProcessor(raw_ts_code, file_type=file_type)
        stylized_ts_code = post_processor.process()
        
        with open(target_filepath, "w", encoding="utf-8") as f:
            f.write(stylized_ts_code)

        print(f"✨ Successfully stylized & created Playwright TS file: {target_filepath}")
        return {
            "status": "converted",
            "source": filepath,
            "target": target_filepath,
            "fileType": file_type
        }
    except Exception as e:
        print(f"❌ Conversion failed for {filepath}: {e}")
        return {
            "status": "error",
            "source": filepath,
            "error": str(e)
        }

def convert_directory(source_dir: str, output_dir: str, client: OllamaConverterClient):
    print(f"📁 Scanning directory tree: {source_dir}")
    java_files = []
    for root, _, files in os.walk(source_dir):
        for f in files:
            if f.endswith(".java"):
                java_files.append(os.path.join(root, f))

    if not java_files:
        print(f"⚠️ No .java files found in {source_dir}")
        return

    print(f"🔍 Found {len(java_files)} Java files to convert.")
    results = []
    for idx, jf in enumerate(java_files, start=1):
        print(f"\n--- [{idx}/{len(java_files)}] Processing {os.path.basename(jf)} ---")
        res = convert_single_file(jf, output_dir, client)
        results.append(res)

    successful = [r for r in results if r["status"] == "converted"]
    failed = [r for r in results if r["status"] == "error"]

    print("\n" + "="*50)
    print("📊 CONVERSION SUMMARY")
    print(f"Total Files Scanned: {len(java_files)}")
    print(f"Successful Conversions: {len(successful)}")
    print(f"Failed Conversions: {len(failed)}")
    print("="*50)

def main():
    arg_parser = argparse.ArgumentParser(description="Selenium Java to Playwright TypeScript Converter (Ollama LLM)")
    arg_parser.add_argument("path", help="Path to a single .java file or directory containing Java source files")
    arg_parser.add_argument("--output", "-o", default="playwright_output", help="Target output directory (default: playwright_output)")
    arg_parser.add_argument("--model", "-m", default="codellama:latest", help="Ollama model name (default: codellama:latest)")
    arg_parser.add_argument("--host", default="http://localhost:11434", help="Ollama host URL (default: http://localhost:11434)")

    args = arg_parser.parse_args()

    client = OllamaConverterClient(host=args.host, model=args.model)

    if os.path.isfile(args.path):
        convert_single_file(args.path, args.output, client)
    elif os.path.isdir(args.path):
        convert_directory(args.path, args.output, client)
    else:
        print(f"❌ Invalid path: {args.path}")
        sys.exit(1)

if __name__ == "__main__":
    main()
