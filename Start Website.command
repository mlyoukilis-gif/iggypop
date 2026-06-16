#!/bin/bash
cd "$(dirname "$0")"

echo "Starting IggyPop website at iggypopm.com..."
echo ""

if ! grep -q "iggypopm.com" /etc/hosts 2>/dev/null; then
  echo "Adding iggypopm.com to this Mac (your password may be required)..."
  echo "127.0.0.1 iggypopm.com www.iggypopm.com" | sudo tee -a /etc/hosts >/dev/null
  echo ""
fi

if lsof -i :3000 >/dev/null 2>&1; then
  echo "Restarting server with iggypopm.com settings..."
  lsof -ti :3000 | xargs kill 2>/dev/null
  sleep 1
fi

python3 editor.py &
sleep 3

open "http://iggypopm.com:3000/"
echo ""
echo "Website:  http://iggypopm.com:3000/"
echo "Editor:   http://localhost:3000"
echo ""
echo "Keep this window open while the site is running."
