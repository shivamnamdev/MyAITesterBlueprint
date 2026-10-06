#!/usr/bin/env python3
"""
app/server.py
Localhost Web App Server (Port 5000) for Selenium Java to Playwright TS Converter.
"""

import sys
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

# Add tools directory to python path
SYS_TOOLS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "tools"))
if SYS_TOOLS_DIR not in sys.path:
    sys.path.insert(0, SYS_TOOLS_DIR)

from check_ollama import check_ollama_status
from java_parser import JavaFileParser
from ollama_client import OllamaConverterClient
from post_processor import TypeScriptPostProcessor

PORT = 5000
HTML_FILE = os.path.join(os.path.dirname(__file__), "index.html")

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""
    daemon_threads = True
    allow_reuse_address = True

def find_available_port(start_port=5000):
    import socket
    for port in [5000, 5001, 8080, 8000]:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('', port))
                return port
            except OSError:
                continue
    return start_port

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            if os.path.exists(HTML_FILE):
                with open(HTML_FILE, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b"<h1>404: Index.html not found</h1>")
        elif self.path == "/api/status":
            is_up, models = check_ollama_status()
            payload = {
                "ollamaUp": is_up,
                "models": models,
                "defaultModel": "codellama:latest" if "codellama:latest" in models else (models[0] if models else "codellama:latest")
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/convert":
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body.decode('utf-8'))
                java_code = data.get("javaCode", "")
                model = data.get("model", "codellama:latest")

                if not java_code.strip():
                    self._send_json({"status": "error", "message": "Java code input cannot be empty"}, status=400)
                    return

                # 1. Structural Parse
                parser = JavaFileParser(java_code, is_filepath=False)
                metadata = parser.parse()

                # 2. Ollama Conversion
                client = OllamaConverterClient(model=model)
                raw_ts = client.convert_java_to_ts(metadata)

                # 3. Post-Process & Stylize
                processor = TypeScriptPostProcessor(raw_ts, file_type=metadata.get("fileType", "auto"))
                final_ts = processor.process()

                self._send_json({
                    "status": "success",
                    "tsCode": final_ts,
                    "metadata": {
                        "className": metadata.get("className"),
                        "fileType": metadata.get("fileType"),
                        "locatorsCount": len(metadata.get("locators", [])),
                        "methodsCount": len(metadata.get("methods", []))
                    }
                })
            except Exception as e:
                self._send_json({"status": "error", "message": str(e)}, status=500)
        else:
            self.send_response(404)
            self.end_headers()

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def log_message(self, format, *args):
        # Suppress noisy GET log outputs
        return

def run_server():
    port = find_available_port(5000)
    server_address = ('', port)
    httpd = ThreadedHTTPServer(server_address, RequestHandler)
    print(f"\n==================================================")
    print(f"🚀 Selenium to Playwright Web App Running!")
    print(f"🌐 Access URL: http://localhost:{port}")
    print(f"==================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping web server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
