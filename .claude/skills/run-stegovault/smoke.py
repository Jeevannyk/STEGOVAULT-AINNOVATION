#!/usr/bin/env python3
"""
Smoke test and API driver for StegoVault.

Usage:
  python .claude/skills/run-stegovault/smoke.py          # run all smoke tests
  python .claude/skills/run-stegovault/smoke.py encode   # test encode only
  python .claude/skills/run-stegovault/smoke.py decode   # test encode+decode
  python .claude/skills/run-stegovault/smoke.py analyze  # test ai analyze
  python .claude/skills/run-stegovault/smoke.py screenshot [output.png]
"""
import sys
import os
import json
import time
import urllib.request
import urllib.error
import subprocess
import tempfile
from pathlib import Path

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

REPO_ROOT = Path(__file__).parent.parent.parent.parent  # up from .claude/skills/run-stegovault


def wait_for_server(url, timeout=30):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=2)
            return True
        except urllib.error.HTTPError:
            return True  # server is up, just returned a non-200
        except Exception:
            time.sleep(1)
    return False


def multipart_post(url, fields=None, files=None):
    boundary = b"----StegoVaultBoundary"
    body = b""
    for name, value in (fields or {}).items():
        body += b"--" + boundary + b"\r\n"
        body += f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        body += value.encode() + b"\r\n"
    for name, (filename, data, ct) in (files or {}).items():
        if isinstance(data, (str, Path)):
            data = Path(data).read_bytes()
        body += b"--" + boundary + b"\r\n"
        body += f'Content-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'.encode()
        body += f"Content-Type: {ct}\r\n\r\n".encode()
        body += data + b"\r\n"
    body += b"--" + boundary + b"--\r\n"
    req = urllib.request.Request(url, data=body)
    req.add_header("Content-Type", f"multipart/form-data; boundary=----StegoVaultBoundary")
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.read()


def make_test_image(path, size=(100, 100), color=(100, 150, 200)):
    try:
        from PIL import Image
        img = Image.new("RGB", size, color=color)
        img.save(str(path))
    except ImportError:
        # Minimal PNG without Pillow
        import struct, zlib
        def png_chunk(name, data):
            c = struct.pack(">I", len(data)) + name + data
            return c + struct.pack(">I", zlib.crc32(name + data) & 0xFFFFFFFF)
        w, h = size
        raw = b""
        for _ in range(h):
            row = bytes([0] + list(color) * w)
            raw += row
        compressed = zlib.compress(raw)
        ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
        png = b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", compressed) + png_chunk(b"IEND", b"")
        Path(path).write_bytes(png)


def cmd_encode():
    print("Testing encode endpoint...")
    with tempfile.TemporaryDirectory() as td:
        carrier = Path(td) / "carrier.png"
        make_test_image(carrier)
        status, body = multipart_post(
            f"{BACKEND_URL}/api/encode/",
            fields={"secret": "test-secret-value", "password": "test-password-123"},
            files={"image": ("carrier.png", carrier.read_bytes(), "image/png")},
        )
        assert status == 200, f"encode returned {status}: {body[:200]}"
        assert body[:4] == b"\x89PNG", f"response is not a PNG: {body[:20]}"
        print(f"  PASS: encode returned {len(body)}-byte PNG")
        return body


def cmd_decode(stego_bytes=None):
    if stego_bytes is None:
        stego_bytes = cmd_encode()
    print("Testing decode endpoint...")
    status, body = multipart_post(
        f"{BACKEND_URL}/api/decode/",
        fields={"password": "test-password-123"},
        files={"image": ("stego.png", stego_bytes, "image/png")},
    )
    assert status == 200, f"decode returned {status}: {body[:200]}"
    data = json.loads(body)
    assert data.get("secret") == "test-secret-value", f"wrong secret: {data}"
    print(f"  PASS: decoded secret = {data['secret']!r}")


def cmd_analyze():
    print("Testing analyze endpoint...")
    with tempfile.TemporaryDirectory() as td:
        img1 = Path(td) / "img1.png"
        img2 = Path(td) / "img2.png"
        make_test_image(img1, color=(64, 128, 200))
        make_test_image(img2, color=(200, 64, 128))
        files = {}
        # urllib only supports one value per key; use list workaround
        boundary = b"----StegoVaultBoundary"
        body = b""
        for filename, data in [("img1.png", img1.read_bytes()), ("img2.png", img2.read_bytes())]:
            body += b"--" + boundary + b"\r\n"
            body += f'Content-Disposition: form-data; name="images"; filename="{filename}"\r\n'.encode()
            body += b"Content-Type: image/png\r\n\r\n"
            body += data + b"\r\n"
        body += b"--" + boundary + b"--\r\n"
        req = urllib.request.Request(f"{BACKEND_URL}/api/analyze/", data=body)
        req.add_header("Content-Type", "multipart/form-data; boundary=----StegoVaultBoundary")
        with urllib.request.urlopen(req) as resp:
            status, rbody = resp.status, resp.read()
        data = json.loads(rbody)
        assert "results" in data and "total" in data, f"unexpected response: {data}"
        print(f"  PASS: analyzed {data['total']} images, recommended={data.get('recommended', {}).get('filename')}")


def cmd_screenshot(outpath=None):
    if outpath is None:
        outpath = str(REPO_ROOT / "screenshot.png")
    print(f"Taking screenshot of {FRONTEND_URL} -> {outpath}")
    result = subprocess.run(
        [CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
         f"--screenshot={outpath}", "--window-size=1280,900", FRONTEND_URL],
        capture_output=True, text=True
    )
    if not Path(outpath).exists():
        print("FAIL: screenshot not created")
        print(result.stderr)
        sys.exit(1)
    size = Path(outpath).stat().st_size
    print(f"  PASS: {size} bytes -> {outpath}")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"
    extra = sys.argv[2] if len(sys.argv) > 2 else None

    if cmd != "screenshot":
        print(f"Checking backend at {BACKEND_URL}...")
        if not wait_for_server(BACKEND_URL, timeout=5):
            print("ERROR: backend not reachable. Start it first:")
            print("  cd backend && ./venv/Scripts/python.exe manage.py runserver --noreload")
            sys.exit(1)
        print("  OK: backend is up")

    if cmd == "encode":
        cmd_encode()
    elif cmd == "decode":
        cmd_decode()
    elif cmd == "analyze":
        cmd_analyze()
    elif cmd == "screenshot":
        cmd_screenshot(extra)
    else:
        stego = cmd_encode()
        cmd_decode(stego)
        cmd_analyze()
        print("\nAll smoke tests passed.")


if __name__ == "__main__":
    main()
