#!/usr/bin/env python3
"""Static file server for the built SPA (dist/) with single-page-app history fallback.

Any request path that does not resolve to a real file and has no file extension
is served index.html, so client-side routes (/map, /schedule, ...) work on hard
navigation and refresh. Binds 127.0.0.1 by default — meant to sit behind the
Cloudflare tunnel (see deployment section of README).

Usage: python3 scripts/serve_dist.py [--root dist] [--port 4173] [--host 127.0.0.1]
"""
import argparse
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class SPAHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        # Normalize: strip query string; map to file under root.
        path = self.translate_path(self.path)
        if not os.path.exists(path):
            # No extension -> treat as client-side route: fall back to index.html.
            if "." not in os.path.basename(self.path.split("?", 1)[0]):
                self.path = "/index.html"
        return super().send_head()

    def end_headers(self):
        # Assets are content-hashed by Vite; cache them hard, never cache index.html.
        if self.path.startswith("/index.html") or self.path == "/":
            self.send_header("Cache-Control", "no-cache")
        else:
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        super().end_headers()

    def log_message(self, fmt, *args):  # quieter logs
        pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="dist")
    ap.add_argument("--port", type=int, default=4173)
    ap.add_argument("--host", default="127.0.0.1")
    args = ap.parse_args()
    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        raise SystemExit(f"dist root not found: {root} (run `npm run build` first)")
    handler = partial(SPAHandler, directory=root)
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"serving {root} at http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
