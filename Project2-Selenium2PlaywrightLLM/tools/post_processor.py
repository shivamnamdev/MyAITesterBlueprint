#!/usr/bin/env python3
"""
tools/post_processor.py
Phase 4: Stylize - Refines, formats, and cleans up converted Playwright TypeScript code.
"""

import os
import re
import sys

class TypeScriptPostProcessor:
    def __init__(self, code: str, file_type: str = "auto"):
        self.code = code
        self.file_type = file_type

    def process(self) -> str:
        code = self.code

        # 1. Clean markdown code fences if present
        code = re.sub(r'```(?:typescript|ts)?\s*', '', code)
        code = re.sub(r'```\s*$', '', code)

        # 2. Normalize and deduplicate Playwright imports
        code = self._clean_imports(code)

        # 3. Fix unhandled PropertyReader or helper calls by injecting fallback placeholders if missing
        code = self._ensure_helper_imports(code)

        # 4. Standardize spacing and indentation
        code = self._format_spacing(code)

        return code

    def _clean_imports(self, code: str) -> str:
        # Extract all @playwright/test imports
        pw_imports = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"]@playwright/test[\'"];', code)
        
        if pw_imports:
            # Consolidate imported symbols
            symbols = set()
            for imp in pw_imports:
                for s in imp.split(','):
                    s_clean = s.strip()
                    if s_clean:
                        symbols.add(s_clean)
            
            # Remove all old @playwright/test import lines
            code = re.sub(r'import\s+\{([^}]+)\}\s+from\s+[\'"]@playwright/test[\'"];?\n?', '', code)
            code = re.sub(r'import\s+\w+\s+from\s+[\'"]@playwright/test[\'"];?\n?', '', code)
            
            # Re-inject unified single import line at the top
            unified_import = f"import {{ {', '.join(sorted(symbols))} }} from '@playwright/test';\n\n"
            code = unified_import + code.lstrip()

        return code

    def _ensure_helper_imports(self, code: str) -> str:
        # If PropertyReader is used but not imported/defined, add dummy constant helper function
        if "PropertyReader" in code and "class PropertyReader" not in code and "import" not in code:
            helper_stub = """// Utility Helper Stub for Config Properties
const PropertyReader = {
  readKey: (key: string): string => process.env[key.toUpperCase()] || key
};\n\n"""
            code = helper_stub + code
        return code

    def _format_spacing(self, code: str) -> str:
        # Replace 3+ consecutive newlines with 2 newlines
        code = re.sub(r'\n{3,}', '\n\n', code)
        # Ensure ending newline
        if not code.endswith('\n'):
            code += '\n'
        return code

def process_directory(target_dir: str):
    print(f"✨ Stylizing and formatting TypeScript files in: {target_dir}")
    processed_count = 0
    for root, _, files in os.walk(target_dir):
        for f in files:
            if f.endswith(".ts"):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8") as file:
                    raw_content = file.read()
                
                processor = TypeScriptPostProcessor(raw_content)
                cleaned_content = processor.process()
                
                with open(filepath, "w", encoding="utf-8") as file:
                    file.write(cleaned_content)
                processed_count += 1
                print(f"  └─ Formatted: {os.path.relpath(filepath, target_dir)}")

    print(f"\n🎉 Successfully stylised {processed_count} TypeScript files!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if os.path.isdir(target):
            process_directory(target)
        elif os.path.isfile(target):
            with open(target, "r", encoding="utf-8") as f:
                content = f.read()
            processor = TypeScriptPostProcessor(content)
            result = processor.process()
            with open(target, "w", encoding="utf-8") as f:
                f.write(result)
            print(f"✨ Stylized single file: {target}")
    else:
        print("Usage: python3 post_processor.py <path_to_file_or_directory>")
