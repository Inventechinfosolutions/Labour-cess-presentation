# Indian English video voiceover

**Source of truth:** [`scripts/voice-script.md`](../../scripts/voice-script.md)  
**Generate:** `npm run voice` → MP3s + `cues.json` (script markers → real audio times)

## Script markers (not spoken)

| Marker | Meaning |
|--------|---------|
| `[[next]]` | Forward one beat |
| `[[prev]]` | Back one beat |
| `[[goto:gps/2]]` | Jump to scene id + beat |
| `[[slide:gis]]` | Jump to scene, beat 0 |
| `[[beat:3]]` | Stay on current scene, set beat |

Scene ids: `title` · `problem` · `assess` · `gps` · `gis` · `leak` · `command` · `core`

## Files

| File | Role |
|------|------|
| `00-full-video-speech.mp3` | Full VO |
| `01-problem.mp3` … `04-benefits-close.mp3` | Segment tracks |
| `cues.json` | Timed `{ at, slide, beat }` from script markers |
| `manifest.json` | Track index |

## In the deck

- **Speaker** / **V** — play scene voice; slides follow `cues.json`
- **VO** / **B** — full speech with auto-advance

## Regenerate

```bash
pip3 install edge-tts   # once
npm run voice
```

Voice default: `en-IN-PrabhatNeural`. Edit `VOICE` in `scripts/generate-voice.py` for `en-IN-NeerjaNeural`.
