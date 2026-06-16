#!/usr/bin/env python3
"""
Mobile-friendly web editor for the IggyPop site.
Run: python3 editor.py
Opens locally and (when cloudflared is installed) creates a public URL for editing anywhere.
"""

import ftplib
import argparse
import atexit
import cgi
import http.server
import io
import json
import os
import random
import re
import secrets
import shutil
import socket
import socketserver
import subprocess
import threading
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime
from pathlib import Path

PORT = int(os.environ.get('PORT', '3000'))
PROJECT_DIR = Path(__file__).parent.resolve()
SITE_ROOT = PROJECT_DIR.parent.resolve()
DEFAULT_FILE = 'Iggypop.html'
SITE_DOMAIN = 'iggypopm.com'
FORM_EMAIL = 'mlyoukilis@gmail.com'
FORM_SUBMIT_URL = f'https://formsubmit.co/ajax/{FORM_EMAIL}'
PROJECT_PREFIX = 'Iggypop 2'
PIN_FILE = PROJECT_DIR / '.editor-pin'
FTP_CONFIG_FILE = PROJECT_DIR / '.editor-ftp.json'
REMOTE_CONFIG_FILE = PROJECT_DIR / '.editor-remote.json'
MOBILE_UI = PROJECT_DIR / 'editor' / 'public' / 'mobile.html'
SESSIONS = set()
TUNNEL_URL_RE = re.compile(r'https://[a-z0-9-]+\.trycloudflare\.com', re.I)
LOCALTUNNEL_URL_RE = re.compile(r'https://[a-z0-9-]+\.loca\.lt', re.I)

ALLOWED_EXTENSIONS = {
    '.html', '.css', '.js', '.txt', '.md',
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.heic', '.heif',
}

_tunnel_process = None
_tunnel_url = None


def load_or_create_pin():
    env_pin = os.environ.get('EDITOR_PIN', '').strip()
    if env_pin:
        return env_pin
    if PIN_FILE.exists():
        return PIN_FILE.read_text(encoding='utf-8').strip()
    pin = str(random.randint(1000, 9999))
    PIN_FILE.write_text(pin, encoding='utf-8')
    return pin


PIN = load_or_create_pin()


def resolve_site_path(relative_path):
    rel = str(relative_path or '').replace('\\', '/').lstrip('/')
    if not rel:
        raise ValueError('missing path')

    if rel == DEFAULT_FILE:
        return SITE_ROOT / DEFAULT_FILE

    if rel.startswith(f'{PROJECT_PREFIX}/'):
        inner = rel[len(PROJECT_PREFIX) + 1:]
        safe_path = (PROJECT_DIR / inner).resolve()
        if not str(safe_path).startswith(str(PROJECT_DIR)):
            raise ValueError('invalid path')
        return safe_path

    safe_path = (PROJECT_DIR / rel).resolve()
    if not str(safe_path).startswith(str(PROJECT_DIR)):
        raise ValueError('invalid path')
    if safe_path.name.startswith('.'):
        raise ValueError('invalid path')
    return safe_path


def list_site_files():
    files = []
    main_file = SITE_ROOT / DEFAULT_FILE
    if main_file.exists():
        files.append(DEFAULT_FILE)

    for entry in PROJECT_DIR.iterdir():
        if not entry.is_file() or entry.name.startswith('.'):
            continue
        if entry.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue
        files.append(f'{PROJECT_PREFIX}/{entry.name}')

    return sorted(files)


def get_local_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(('8.8.8.8', 80))
            return s.getsockname()[0]
    except OSError:
        return 'localhost'


def get_local_hostname():
    return socket.gethostname().split('.')[0]


def get_stable_local_url(port):
    return f'http://{get_local_hostname()}.local:{port}'


def load_remote_config():
    if REMOTE_CONFIG_FILE.exists():
        try:
            return json.loads(REMOTE_CONFIG_FILE.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            pass

    subdomain = f'iggy-editor-{secrets.token_hex(4)}'
    config = {
        'subdomain': subdomain,
        'public_url': f'https://{subdomain}.loca.lt',
    }
    save_remote_config(config)
    return config


def save_remote_config(config):
    REMOTE_CONFIG_FILE.write_text(json.dumps(config, indent=2) + '\n', encoding='utf-8')


def find_npx():
    found = shutil.which('npx')
    if found:
        return found
    for candidate in (
        '/opt/homebrew/bin/npx',
        '/usr/local/bin/npx',
    ):
        if Path(candidate).exists():
            return candidate
    return None


def editor_node_modules_ready():
    return (PROJECT_DIR / 'editor' / 'node_modules' / 'localtunnel').exists()


def find_cloudflared():
    found = shutil.which('cloudflared')
    if found:
        return found
    for candidate in (
        '/opt/homebrew/bin/cloudflared',
        '/usr/local/bin/cloudflared',
    ):
        if Path(candidate).exists():
            return candidate
    return None


def stop_tunnel():
    global _tunnel_process
    if _tunnel_process and _tunnel_process.poll() is None:
        _tunnel_process.terminate()
        try:
            _tunnel_process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            _tunnel_process.kill()
    _tunnel_process = None


def start_tunnel_process(command, url_pattern):
    global _tunnel_process, _tunnel_url

    ready = threading.Event()

    def watch_output():
        global _tunnel_url
        if not _tunnel_process or not _tunnel_process.stdout:
            return
        for line in _tunnel_process.stdout:
            match = url_pattern.search(line)
            if match:
                _tunnel_url = match.group(0)
                ready.set()
                return

    _tunnel_process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        cwd=PROJECT_DIR / 'editor',
    )
    atexit.register(stop_tunnel)
    threading.Thread(target=watch_output, daemon=True).start()

    if not ready.wait(timeout=60):
        stop_tunnel()
        return None, None

    return _tunnel_process, _tunnel_url


def start_localtunnel(port, subdomain):
    npx = find_npx()
    if not npx or not editor_node_modules_ready():
        return None, None

    return start_tunnel_process(
        [npx, 'localtunnel', '--port', str(port), '--subdomain', subdomain],
        LOCALTUNNEL_URL_RE,
    )


def start_cloudflared_quick_tunnel(port):
    cloudflared = find_cloudflared()
    if not cloudflared:
        return None, None

    return start_tunnel_process(
        [cloudflared, 'tunnel', '--url', f'http://localhost:{port}'],
        TUNNEL_URL_RE,
    )


def start_tunnel(port):
    global _tunnel_url

    config = load_remote_config()
    subdomain = config.get('subdomain', '')
    saved_url = config.get('public_url', '')

    proc, url = start_localtunnel(port, subdomain)
    if url:
        config['public_url'] = url
        config['subdomain'] = subdomain
        save_remote_config(config)
        return proc, url

    proc, url = start_cloudflared_quick_tunnel(port)
    if url:
        return proc, url

    if saved_url:
        return None, saved_url

    return None, None


def tunnel_enabled_from_env():
    value = os.environ.get('EDITOR_TUNNEL', '1').strip().lower()
    return value not in {'0', 'false', 'no', 'off'}


def is_authorized(handler):
    auth = handler.headers.get('Authorization', '')
    token = auth[7:] if auth.startswith('Bearer ') else ''
    return token in SESSIONS


def send_json(handler, status, payload):
    body = json.dumps(payload).encode()
    handler.send_response(status)
    handler.send_header('Content-type', 'application/json')
    handler.send_header('Content-Length', str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def safe_upload_name(original):
    name = os.path.basename(original or 'photo.jpg').strip().replace(' ', '-')
    name = re.sub(r'[^\w.\-]', '', name)
    return name or 'photo.jpg'


def unique_upload_path(filename):
    dest = PROJECT_DIR / filename
    if not dest.exists():
        return dest
    stem = dest.stem
    suffix = dest.suffix
    stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    return PROJECT_DIR / f'{stem}-{stamp}{suffix}'


def convert_heic_to_jpeg(file_path):
    if file_path.suffix.lower() not in {'.heic', '.heif'}:
        return file_path
    jpg_path = file_path.with_suffix('.jpg')
    try:
        subprocess.run(
            ['sips', '-s', 'format', 'jpeg', str(file_path), '--out', str(jpg_path)],
            check=True,
            capture_output=True,
        )
        file_path.unlink(missing_ok=True)
        return jpg_path
    except (subprocess.CalledProcessError, FileNotFoundError):
        return file_path


def save_uploaded_bytes(data, original_name):
    filename = safe_upload_name(original_name)
    dest = unique_upload_path(filename)
    dest.write_bytes(data)
    dest = convert_heic_to_jpeg(dest)
    return f'{PROJECT_PREFIX}/{dest.name}'


def load_ftp_config():
    if not FTP_CONFIG_FILE.exists():
        return {}
    try:
        data = json.loads(FTP_CONFIG_FILE.read_text(encoding='utf-8'))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def save_ftp_config(data):
    FTP_CONFIG_FILE.write_text(json.dumps(data, indent=2), encoding='utf-8')


def ftp_config_summary():
    config = load_ftp_config()
    return {
        'configured': bool(config.get('host') and config.get('user') and config.get('password')),
        'host': config.get('host', ''),
        'user': config.get('user', ''),
        'remote_dir': config.get('remote_dir', 'public_html'),
        'port': int(config.get('port', 21) or 21),
    }


IMAGE_REF_RE = re.compile(
    r'''(?:src|href)=["'](?:Iggypop 2/)?(?:images/)?([^"']+\.(?:jpg|jpeg|png|gif|webp|svg))["']''',
    re.I,
)


def build_upload_package():
    upload_dir = PROJECT_DIR / 'website-upload'
    images_dir = upload_dir / 'images'
    shutil.rmtree(upload_dir, ignore_errors=True)
    images_dir.mkdir(parents=True)

    source = resolve_site_path(DEFAULT_FILE)
    content = source.read_text(encoding='utf-8', errors='replace')
    content = content.replace('Iggypop 2/', 'images/')
    (upload_dir / 'index.html').write_text(content, encoding='utf-8')

    copied = set()
    for match in IMAGE_REF_RE.finditer(content):
        filename = os.path.basename(match.group(1))
        if filename in copied:
            continue
        for candidate in (
            PROJECT_DIR / filename,
            PROJECT_DIR / 'images' / filename,
            PROJECT_DIR / 'uploads' / filename,
        ):
            if candidate.exists() and candidate.is_file():
                shutil.copy2(candidate, images_dir / filename)
                copied.add(filename)
                break

    return upload_dir


def ftp_go_web_root(ftp, preferred='public_html'):
    try:
        home = ftp.pwd()
    except ftplib.error_perm:
        home = '/'

    candidates = []
    for target in (preferred, 'public_html', 'www', 'htdocs', home, '.'):
        if target and target not in candidates:
            candidates.append(target)

    for target in candidates:
        try:
            ftp.cwd(home)
        except ftplib.error_perm:
            pass
        try:
            if target not in {home, '.'}:
                for part in [p for p in str(target).split('/') if p]:
                    ftp.cwd(part)
            return ftp.pwd()
        except ftplib.error_perm:
            continue

    raise ValueError(
        'Could not find your website folder on FTP. Try remote folder: public_html, www, htdocs, or leave blank.'
    )


def publish_via_ftp(config):
    upload_dir = build_upload_package()
    host = config.get('host', '').strip()
    user = config.get('user', '').strip()
    password = config.get('password', '')
    remote_dir = str(config.get('remote_dir', 'public_html')).strip()
    port = int(config.get('port', 21) or 21)

    if not host or not user or not password:
        raise ValueError('FTP password is missing. Open Publish, enter your password, and tap Save FTP settings first.')

    ftp = ftplib.FTP(timeout=90)
    try:
        ftp.connect(host, port)
        ftp.login(user, password)
        ftp.set_pasv(True)
        web_root = ftp_go_web_root(ftp, remote_dir or 'public_html')

        with open(upload_dir / 'index.html', 'rb') as handle:
            ftp.storbinary('STOR index.html', handle)

        try:
            ftp.mkd('images')
        except ftplib.error_perm:
            pass
        try:
            ftp.cwd('images')
        except ftplib.error_perm as e:
            raise ValueError(f'Could not upload images folder: {e}')
        uploaded_images = 0
        for image_path in sorted((upload_dir / 'images').iterdir()):
            if not image_path.is_file():
                continue
            with open(image_path, 'rb') as handle:
                ftp.storbinary(f'STOR {image_path.name}', handle)
            uploaded_images += 1
    except ftplib.error_perm as e:
        message = str(e)
        if '530' in message or 'Login incorrect' in message:
            raise ValueError('FTP login failed. Check username myoukilis and your FTP password in Network Solutions.')
        raise ValueError(f'FTP upload failed: {message}')
    finally:
        try:
            ftp.quit()
        except Exception:
            pass

    return {
        'ok': True,
        'images': uploaded_images,
        'remote_dir': web_root,
        'domain': SITE_DOMAIN,
    }


def is_public_site_host(handler):
    host = (handler.headers.get('Host') or '').split(':', 1)[0].lower()
    return host in {SITE_DOMAIN, f'www.{SITE_DOMAIN}'}


def forward_form_submission(payload):
    body = json.dumps({
        '_template': 'table',
        '_captcha': 'false',
        **payload,
    }).encode('utf-8')
    request = urllib.request.Request(
        FORM_SUBMIT_URL,
        data=body,
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Referer': f'https://{SITE_DOMAIN}/',
        },
        method='POST',
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode('utf-8'))


def serve_file(handler, file_path):
    data = file_path.read_bytes()
    content_type = 'text/html' if file_path.suffix.lower() == '.html' else 'application/octet-stream'
    handler.send_response(200)
    handler.send_header('Content-type', content_type)
    handler.send_header('Content-Length', str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


class EditorHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        try:
            request_line = str(args[0]) if args else ''
        except Exception:
            request_line = ''
        if '/api/' not in request_line:
            super().log_message(format, *args)

    def do_GET(self):
        path = urllib.parse.unquote(urllib.parse.urlparse(self.path).path)

        if path == '/api/auth/status':
            if is_authorized(self):
                return send_json(self, 200, {'ok': True})
            return send_json(self, 401, {'ok': False})

        if path == '/api/info':
            config = load_remote_config()
            return send_json(self, 200, {
                'publicUrl': _tunnel_url or config.get('public_url', ''),
                'localUrl': get_stable_local_url(PORT),
                'localIpUrl': f'http://{get_local_ip()}:{PORT}',
            })

        if path.startswith('/api/') and not is_authorized(self):
            return send_json(self, 401, {'error': 'Unauthorized'})

        if path == '/api/files':
            try:
                return send_json(self, 200, list_site_files())
            except Exception as e:
                return send_json(self, 500, {'error': str(e)})

        if path == '/api/publish/config':
            try:
                return send_json(self, 200, ftp_config_summary())
            except Exception as e:
                return send_json(self, 500, {'error': str(e)})

        if path.startswith('/api/file'):
            try:
                qs = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
                file_path = qs.get('path', [''])[0]
                safe_path = resolve_site_path(file_path)
                content = safe_path.read_text(encoding='utf-8', errors='replace')
                return send_json(self, 200, {'content': content})
            except ValueError as e:
                return send_json(self, 400, {'error': str(e)})
            except Exception as e:
                return send_json(self, 500, {'error': str(e)})

        if path.startswith('/preview'):
            try:
                qs = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
                file_name = qs.get('file', [DEFAULT_FILE])[0]
                safe_path = resolve_site_path(file_name)
                if not safe_path.exists() or not safe_path.is_file():
                    self.send_error(404, 'File not found')
                    return
                return serve_file(self, safe_path)
            except ValueError:
                self.send_error(400, 'invalid file')
                return
            except Exception as e:
                self.send_error(500, str(e))
                return

        if path in ('/', '/index.html'):
            if is_public_site_host(self):
                try:
                    safe_path = resolve_site_path(DEFAULT_FILE)
                    return serve_file(self, safe_path)
                except Exception as e:
                    self.send_error(500, str(e))
                    return
            try:
                html = MOBILE_UI.read_text(encoding='utf-8')
                body = html.encode('utf-8')
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            except Exception as e:
                self.send_error(500, str(e))
                return

        if path.startswith(f'/{PROJECT_PREFIX}/'):
            try:
                relative = path[len(PROJECT_PREFIX) + 2:]
                safe_path = resolve_site_path(f'{PROJECT_PREFIX}/{relative}')
                if safe_path.exists() and safe_path.is_file():
                    return serve_file(self, safe_path)
                self.send_error(404, 'File not found')
                return
            except ValueError:
                self.send_error(400, 'invalid file')
                return

        try:
            safe_path = resolve_site_path(path.lstrip('/'))
            if safe_path.exists() and safe_path.is_file():
                return serve_file(self, safe_path)
        except ValueError:
            pass

        self.send_error(404, 'File not found')

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        if path == '/api/auth':
            try:
                data = json.loads(body.decode())
                submitted = str(data.get('pin', '')).strip()
                if submitted != PIN:
                    return send_json(self, 401, {'error': 'Wrong PIN'})
                token = secrets.token_hex(24)
                SESSIONS.add(token)
                return send_json(self, 200, {'token': token})
            except Exception as e:
                return send_json(self, 500, {'error': str(e)})

        if path == '/api/public/form-submit':
            try:
                data = json.loads(body.decode())
                if not isinstance(data, dict):
                    return send_json(self, 400, {'success': 'false', 'message': 'Invalid form data'})
                result = forward_form_submission(data)
                return send_json(self, 200, result)
            except Exception as e:
                return send_json(self, 500, {'success': 'false', 'message': str(e)})

        if path.startswith('/api/') and not is_authorized(self):
            return send_json(self, 401, {'error': 'Unauthorized'})

        if path == '/api/file':
            try:
                data = json.loads(body.decode())
                file_path = data.get('path', '')
                content = data.get('content', '')
                safe_path = resolve_site_path(file_path)
                safe_path.write_text(content, encoding='utf-8')
                return send_json(self, 200, {'ok': True})
            except ValueError as e:
                return send_json(self, 400, {'error': str(e)})
            except Exception as e:
                return send_json(self, 500, {'error': str(e)})

        if path == '/api/upload':
            try:
                environ = {
                    'REQUEST_METHOD': 'POST',
                    'CONTENT_TYPE': self.headers.get('Content-Type', ''),
                    'CONTENT_LENGTH': str(content_length),
                }
                form = cgi.FieldStorage(
                    fp=io.BytesIO(body),
                    headers=self.headers,
                    environ=environ,
                )
                if 'file' not in form:
                    return send_json(self, 400, {'error': 'no file'})

                uploaded = form['file']
                data = uploaded.file.read()
                saved_as = save_uploaded_bytes(data, uploaded.filename)
                return send_json(self, 200, {
                    'ok': True,
                    'filename': saved_as,
                })
            except Exception as e:
                return send_json(self, 500, {'error': str(e)})

        if path == '/api/publish/config':
            try:
                data = json.loads(body.decode())
                existing = load_ftp_config()
                merged = {
                    'host': str(data.get('host', existing.get('host', ''))).strip(),
                    'user': str(data.get('user', existing.get('user', ''))).strip(),
                    'password': str(data.get('password') or existing.get('password', '')),
                    'remote_dir': str(data.get('remote_dir', existing.get('remote_dir', 'public_html'))).strip() or 'public_html',
                    'port': int(data.get('port', existing.get('port', 21)) or 21),
                }
                if not merged['host'] or not merged['user']:
                    return send_json(self, 400, {'error': 'FTP host and username are required'})
                if not merged['password']:
                    return send_json(self, 400, {'error': 'FTP password is required — enter it in the Publish screen'})
                save_ftp_config(merged)
                return send_json(self, 200, ftp_config_summary())
            except Exception as e:
                return send_json(self, 500, {'error': str(e)})

        if path == '/api/publish':
            try:
                payload = json.loads(body.decode() or '{}')
                config = load_ftp_config()
                if isinstance(payload, dict):
                    for key in ('host', 'user', 'password', 'remote_dir', 'port'):
                        if payload.get(key):
                            config[key] = payload[key]
                result = publish_via_ftp(config)
                if payload.get('password'):
                    save_ftp_config({
                        'host': config.get('host', ''),
                        'user': config.get('user', ''),
                        'password': config.get('password', ''),
                        'remote_dir': config.get('remote_dir', 'public_html'),
                        'port': int(config.get('port', 21) or 21),
                    })
                return send_json(self, 200, result)
            except ValueError as e:
                return send_json(self, 400, {'error': str(e)})
            except ftplib.all_errors as e:
                return send_json(self, 500, {'error': f'FTP upload failed: {e}'})
            except Exception as e:
                return send_json(self, 500, {'error': str(e)})

        self.send_error(404)


class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='IggyPop mobile website editor')
    parser.add_argument('--no-tunnel', action='store_true', help='Disable remote access tunnel')
    args = parser.parse_args()

    local_ip = get_local_ip()
    stable_local_url = get_stable_local_url(PORT)
    use_tunnel = tunnel_enabled_from_env() and not args.no_tunnel
    tunnel_proc = None
    tunnel_url = None
    remote_config = load_remote_config()

    if use_tunnel:
        print('Starting your permanent remote link...', flush=True)
        tunnel_proc, tunnel_url = start_tunnel(PORT)
        if not tunnel_url:
            print('Remote link unavailable — local access still works.', flush=True)
            if not editor_node_modules_ready():
                print('  Run once in Terminal:', flush=True)
                print('    cd "/Users/margaretyoukilis/Documents/Iggypop 2/editor" && npm install', flush=True)
            elif not find_npx():
                print('  Install Node.js for the permanent remote link:', flush=True)
                print('    https://nodejs.org', flush=True)
            print('', flush=True)
        elif not tunnel_proc:
            tunnel_url = remote_config.get('public_url', tunnel_url)

    try:
        with ThreadingHTTPServer(('0.0.0.0', PORT), EditorHandler) as httpd:
            print('', flush=True)
            print('📱 IggyPop Mobile Editor', flush=True)
            print('────────────────────────', flush=True)
            print(f'Site file:       {DEFAULT_FILE}', flush=True)
            print(f'On this Mac:     http://localhost:{PORT}', flush=True)
            print(f'On your phone:   {stable_local_url}  (same Wi‑Fi, bookmark this)', flush=True)
            print(f'                 http://{local_ip}:{PORT}  (backup if .local fails)', flush=True)
            if tunnel_url:
                print(f'From anywhere:   {tunnel_url}  (bookmark this — same every time)', flush=True)
            print(f'PIN:             {PIN}', flush=True)
            print('', flush=True)
            print('Keep this window open while editing.', flush=True)
            if tunnel_url:
                print('Bookmark the "From anywhere" link on your phone — it stays the same each time you start.', flush=True)
            else:
                print('Your browser should open automatically.', flush=True)
            print('', flush=True)
            if not tunnel_url:
                print('Phone not connecting?', flush=True)
                print('  • Try the .local link first, then the backup IP link', flush=True)
                print('  • Phone must use the same Wi‑Fi as this Mac', flush=True)
                print('  • Check Mac Settings → Privacy → Local Network → allow Terminal/Python', flush=True)
                print('', flush=True)
            print('Press Ctrl+C to stop.', flush=True)
            print('', flush=True)
            webbrowser.open(f'http://localhost:{PORT}')
            httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nShutdown.', flush=True)
    except OSError as e:
        print(f'Error: {e}', flush=True)
        print(f'Port {PORT} may be in use. Try: lsof -i :{PORT}', flush=True)
    finally:
        stop_tunnel()
