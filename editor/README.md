# IggyPop Site Editor

Edit your website from your phone — at home or anywhere.

## Quick start

Double-click **Start Editor.command** in the Iggypop 2 folder, or run:

```bash
cd "/Users/margaretyoukilis/Documents/Iggypop 2"
python3 editor.py
```

The terminal shows:

- **On this Mac** — open in your browser
- **On your phone** — `http://Your-Mac-Name.local:3000` (same every time on Wi‑Fi)
- **From anywhere** — `https://iggy-editor-xxxx.loca.lt` (same every time, bookmark it)
- **PIN** — enter this once to unlock the editor

Press `Ctrl+C` to stop.

## Edit from anywhere (recommended)

1. Double-click **Start Editor.command** (installs the permanent link on first run).
2. Bookmark the **From anywhere** URL shown in Terminal — it stays the same every time.
3. Open that bookmark on your phone from any network.
4. Enter the **PIN** shown in Terminal.
5. Edit and tap **Save** when done.

## Edit on the same Wi‑Fi

1. Start the editor on your Mac.
2. On your phone, connect to the **same Wi‑Fi**.
3. Open the **On your phone** URL (e.g. `http://192.168.1.42:3000`).
4. Enter the PIN and edit.

### Tips

- Use **☰** to switch files, **📷 Photos** to upload images, **+ Box** to add galleries and text.
- Tap **Code** (top bar) for raw HTML, then **Preview** to return to the visual editor.

## Security

- A random PIN is created on first run (stored in `.editor-pin`).
- Set your own PIN: `EDITOR_PIN=847291 python3 editor.py`
- The anywhere link is public — only share it with people you trust, and stop the editor when finished.
- Disable remote access: `python3 editor.py --no-tunnel` or `EDITOR_TUNNEL=0 python3 editor.py`

## Alternative (Node.js)

```bash
cd "/Users/margaretyoukilis/Documents/Iggypop 2/editor"
npm install
npm start
```

Node version supports local Wi‑Fi only. Use the Python editor for anywhere access.

## Notes

- Edits save directly to `Iggypop.html` and images in the `Iggypop 2` folder — keep backups.
- Your Mac must stay awake and running the editor while you work remotely.
