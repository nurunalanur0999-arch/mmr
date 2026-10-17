from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser

ROOT = Path(__file__).resolve().parent

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

server = None
for port in range(8000, 8011):
    try:
        server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
        break
    except OSError:
        continue

if server is None:
    raise SystemExit("Could not find a free local port between 8000 and 8010.")

url = f"http://127.0.0.1:{server.server_address[1]}/index.html"
print("Bentley Outdoors website is running locally.")
print(f"Open: {url}")
print("Keep this window open while using the website. Press Ctrl+C to stop.")
threading.Timer(0.8, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nWebsite server stopped.")
finally:
    server.server_close()
