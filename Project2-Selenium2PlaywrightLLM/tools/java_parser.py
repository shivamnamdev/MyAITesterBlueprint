#!/usr/bin/env python3
"""
tools/java_parser.py
Extracts structural metadata from Java source files (Page Objects, Tests, Utilities).
"""

import re
import os

class JavaFileParser:
    def __init__(self, filepath_or_code: str, is_filepath=True):
        if is_filepath:
            self.filepath = filepath_or_code
            with open(filepath_or_code, 'r', encoding='utf-8') as f:
                self.code = f.read()
        else:
            self.filepath = ""
            self.code = filepath_or_code

    def parse(self) -> dict:
        package = self._extract_package()
        imports = self._extract_imports()
        class_name, super_class = self._extract_class_info()
        locators = self._extract_locators()
        methods = self._extract_methods()
        annotations = self._extract_annotations()
        file_type = self._determine_file_type(locators, annotations)

        return {
            "filepath": self.filepath,
            "filename": os.path.basename(self.filepath) if self.filepath else "",
            "package": package,
            "imports": imports,
            "className": class_name,
            "superClass": super_class,
            "fileType": file_type,
            "locators": locators,
            "methods": methods,
            "annotations": annotations,
            "rawCode": self.code
        }

    def _extract_package(self) -> str:
        match = re.search(r'package\s+([\w\.]+);', self.code)
        return match.group(1) if match else ""

    def _extract_imports(self) -> list:
        return re.findall(r'import\s+([\w\.\*]+);', self.code)

    def _extract_class_info(self) -> tuple:
        match = re.search(r'public\s+class\s+(\w+)(?:\s+extends\s+(\w+))?', self.code)
        if match:
            return match.group(1), match.group(2) or ""
        return "", ""

    def _extract_locators(self) -> list:
        # Pattern matching By username = By.id("..."); or By password = By.xpath("...");
        pattern = r'By\s+(\w+)\s*=\s*By\.(\w+)\(([^)]+)\);'
        matches = re.findall(pattern, self.code)
        locators = []
        for name, strategy, val in matches:
            val_clean = val.strip().strip('"').strip("'")
            locators.append({
                "name": name,
                "strategy": strategy,
                "value": val_clean
            })
        return locators

    def _extract_methods(self) -> list:
        # Simple extraction of method names
        pattern = r'(public|protected|private)\s+([\w<>\[\]]+)\s+(\w+)\s*\(([^)]*)\)'
        matches = re.findall(pattern, self.code)
        methods = []
        for visibility, ret_type, name, params in matches:
            if name != self._extract_class_info()[0]:  # Skip constructor
                methods.append({
                    "visibility": visibility,
                    "returnType": ret_type,
                    "name": name,
                    "params": params
                })
        return methods

    def _extract_annotations(self) -> list:
        return list(set(re.findall(r'@(\w+)', self.code)))

    def _determine_file_type(self, locators: list, annotations: list) -> str:
        if "Test" in annotations or any(a in annotations for a in ["BeforeMethod", "BeforeClass", "BeforeEach", "BeforeAll"]):
            return "test_class"
        elif locators or "Page" in self._extract_class_info()[0] or "POM" in self._extract_class_info()[0] or "PF" in self._extract_class_info()[0]:
            return "page_object"
        else:
            return "utility"

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        parser = JavaFileParser(sys.argv[1])
        res = parser.parse()
        print(f"Parsed {res['filename']} ({res['fileType']}): Class {res['className']}, {len(res['locators'])} locators, {len(res['methods'])} methods.")
    else:
        print("Usage: python3 java_parser.py <path_to_java_file>")
