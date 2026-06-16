#!/bin/bash
cd "$(dirname "$0")"
UPLOAD_DIR="website-upload"
rm -rf "$UPLOAD_DIR"
mkdir -p "$UPLOAD_DIR/images"
cp "../Iggypop.html" "$UPLOAD_DIR/index.html"
sed -i '' 's|Iggypop 2/|images/|g' "$UPLOAD_DIR/index.html"
cp about-photo.jpg dams-photo.jpg "$UPLOAD_DIR/images/" 2>/dev/null
for f in *.jpg *.jpeg *.png *.gif; do
  [ -f "$f" ] && grep -q "$f" "$UPLOAD_DIR/index.html" 2>/dev/null && cp "$f" "$UPLOAD_DIR/images/"
done
open "$UPLOAD_DIR"
echo "Upload package ready in website-upload/"
