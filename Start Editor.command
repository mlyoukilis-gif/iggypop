
#!/bin/bash
cd "$(dirname "$0")"
clear
echo "Starting IggyPop editor..."
echo ""

if ! command -v node >/dev/null 2>&1 && \
   [ ! -x /opt/homebrew/bin/node ] && \
   [ ! -x /usr/local/bin/node ]; then
  echo "Node.js is required for your permanent phone link."
  echo "Install it from https://nodejs.org"
  echo ""
else
  if [ ! -d "editor/node_modules/localtunnel" ]; then
    echo "Setting up your permanent phone link (one-time)..."
    (cd editor && npm install)
    echo ""
  fi
fi

python3 editor.py
