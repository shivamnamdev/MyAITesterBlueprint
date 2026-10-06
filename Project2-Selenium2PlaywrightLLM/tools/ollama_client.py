#!/usr/bin/env python3
"""
tools/ollama_client.py
Local Ollama API client for converting Selenium Java to Playwright TypeScript.
"""

import json
import urllib.request
import urllib.error
import re

SYSTEM_PROMPT = """You are an expert Automation Architect specializing in converting Selenium Java test suites to Playwright TypeScript (@playwright/test).

STRICT RULES & CONVENTIONS:
1. Output ONLY valid TypeScript code adhering to @playwright/test standards.
2. For Page Objects:
   - Create export class with `readonly page: Page` and `readonly <locator>: Locator` fields.
   - Initialize locators in the constructor (`this.<element> = page.locator(...)`).
   - Convert methods to `async` methods returning Promises.
   - Use `await locator.fill(...)` for `sendKeys`, `await locator.click()` for `click`.
3. For Test Classes:
   - Import `test`, `expect` from `@playwright/test`.
   - Wrap tests in `test('name', async ({ page }) => { ... })`.
   - Convert assertions (JUnit/TestNG/AssertJ) to Playwright `expect(...)` assertions.
   - Convert `@BeforeMethod`/`@BeforeClass` to `test.beforeEach`/`test.beforeAll`.
4. Remove redundant `WebDriverWait`, `ExpectedConditions`, and `Thread.sleep` calls; rely on Playwright auto-waiting.
5. Do NOT include markdown explanations, intro text, or conversational commentary. Output ONLY the raw TypeScript code block.
"""

class OllamaConverterClient:
    def __init__(self, host="http://localhost:11434", model="codellama:latest"):
        self.host = host
        self.model = model

    def convert_java_to_ts(self, parsed_metadata: dict) -> str:
        prompt = self._build_prompt(parsed_metadata)
        
        url = f"{self.host}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": SYSTEM_PROMPT,
            "stream": False,
            "options": {
                "temperature": 0.1
            }
        }
        
        try:
            data_bytes = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(
                url, 
                data=data_bytes, 
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=120) as response:
                if response.status == 200:
                    res_data = json.loads(response.read().decode('utf-8'))
                    raw_text = res_data.get('response', '')
                    cleaned_ts = self._extract_clean_typescript(raw_text)
                    return cleaned_ts
                else:
                    raise RuntimeError(f"Ollama returned HTTP {response.status}")
        except Exception as e:
            print(f"❌ Error during Ollama conversion: {e}")
            raise

    def _build_prompt(self, meta: dict) -> str:
        locators_summary = json.dumps(meta.get("locators", []), indent=2)
        methods_summary = json.dumps(meta.get("methods", []), indent=2)
        
        prompt = f"""Convert the following Selenium Java code into Playwright TypeScript (@playwright/test).

File Type: {meta.get('fileType')}
Class Name: {meta.get('className')}
Super Class: {meta.get('superClass')}
Extracted Locators:
{locators_summary}

Extracted Methods:
{methods_summary}

Java Source Code:
```java
{meta.get('rawCode')}
```

Provide the full Playwright TypeScript implementation below:
"""
        return prompt

    def _extract_clean_typescript(self, text: str) -> str:
        # Match ```typescript ... ``` or ```ts ... ``` or ``` ... ```
        pattern = r'```(?:typescript|ts)?\s*(.*?)\s*```'
        matches = re.findall(pattern, text, re.DOTALL)
        if matches:
            return matches[0].strip()
        # Fallback if no markdown codeblock wrapper
        return text.strip()

if __name__ == "__main__":
    import sys
    from java_parser import JavaFileParser
    
    if len(sys.argv) > 1:
        parser = JavaFileParser(sys.argv[1])
        meta = parser.parse()
        client = OllamaConverterClient()
        print(f"⏳ Converting {meta['filename']} using Ollama ({client.model})...")
        ts_code = client.convert_java_to_ts(meta)
        print("\n--- Converted TypeScript ---")
        print(ts_code[:500] + "\n..." if len(ts_code) > 500 else ts_code)
    else:
        print("Usage: python3 ollama_client.py <path_to_java_file>")
