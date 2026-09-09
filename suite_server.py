from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import json
import os
import time
import urllib.parse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORT = 8080

def resolve_target_file(client_file_path=None):
    if client_file_path and isinstance(client_file_path, str):
        clean_p = os.path.normpath(client_file_path)
        if clean_p.endswith('.js'):
            return clean_p
        elif os.path.isdir(clean_p):
            return os.path.join(clean_p, "shared_project_library.js")
    
    candidates = [
        os.path.join(BASE_DIR, "shared_project_library.js"),
        os.path.join(os.path.dirname(BASE_DIR), "shared_project_library.js")
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return os.path.join(BASE_DIR, "shared_project_library.js")

class SuiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        if self.path.endswith('.js') or self.path.endswith('.html') or '/api/' in self.path:
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, *')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_GET(self):
        if '/api/get-library' in self.path:
            try:
                parsed_url = urllib.parse.urlparse(self.path)
                params = urllib.parse.parse_qs(parsed_url.query)
                client_path = params.get('clientFilePath', [None])[0]
                
                target_file = resolve_target_file(client_path)
                library_data = []
                if os.path.exists(target_file):
                    with open(target_file, 'r', encoding='utf-8') as f:
                        text = f.read().strip()
                    if text.startswith('window.SHARED_PROJECT_LIBRARY'):
                        text = text[text.find('=') + 1:].strip()
                        if text.endswith(';'):
                            text = text[:-1].strip()
                    try:
                        library_data = json.loads(text)
                    except Exception:
                        library_data = []
                
                resp_bytes = json.dumps({
                    "success": True, 
                    "library": library_data, 
                    "modifiedTime": time.ctime(),
                    "file": target_file
                }).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(resp_bytes)))
                self.end_headers()
                self.wfile.write(resp_bytes)
                return
            except Exception as e:
                err_bytes = json.dumps({"success": False, "error": str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_bytes)))
                self.end_headers()
                self.wfile.write(err_bytes)
                return
        
        super().do_GET()

    def do_POST(self):
        if '/api/save-library' in self.path:
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                payload = json.loads(body.decode('utf-8'))
                
                library = payload.get('library', payload) if isinstance(payload, dict) else payload
                client_file_path = payload.get('clientFilePath', '') if isinstance(payload, dict) else ''
                
                file_content = "window.SHARED_PROJECT_LIBRARY = " + json.dumps(library, indent=2) + ";\n"
                
                targets = []
                if client_file_path and isinstance(client_file_path, str):
                    clean_target = resolve_target_file(client_file_path)
                    targets.append(clean_target)
                
                targets.extend([
                    os.path.join(BASE_DIR, "shared_project_library.js"),
                    os.path.join(os.path.dirname(BASE_DIR), "shared_project_library.js")
                ])
                
                seen = set()
                written = []
                for target_file in targets:
                    norm_t = os.path.normpath(target_file)
                    if norm_t not in seen:
                        seen.add(norm_t)
                        parent_d = os.path.dirname(norm_t)
                        if parent_d and os.path.exists(parent_d):
                            try:
                                with open(norm_t, "w", encoding="utf-8") as f:
                                    f.write(file_content)
                                    f.flush()
                                    os.fsync(f.fileno())
                                written.append(norm_t)
                            except Exception as write_err:
                                print(f"Error writing to {norm_t}: {write_err}")
                
                resp_obj = {
                    "success": True,
                    "count": len(library),
                    "modifiedTime": time.ctime(),
                    "writtenFiles": written
                }
                resp_bytes = json.dumps(resp_obj).encode('utf-8')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(resp_bytes)))
                self.end_headers()
                self.wfile.write(resp_bytes)
                print(f"[{time.ctime()}] Saved {len(library)} projects to {len(written)} targets: {written}")
                return
            except Exception as e:
                err_bytes = json.dumps({"success": False, "error": str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_bytes)))
                self.end_headers()
                self.wfile.write(err_bytes)
                return
        
        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    print(f"Starting Suite Server on port {PORT} from {BASE_DIR}...")
    server = ThreadingHTTPServer(('0.0.0.0', PORT), SuiteHandler)
    server.serve_forever()
