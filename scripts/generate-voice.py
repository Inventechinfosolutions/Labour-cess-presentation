#!/usr/bin/env python3
"""Generate Indian English VO MP3s + script-driven slide cues from voice-script.md.

Cue times are derived by synthesizing speech *between* markers as separate
chunks, measuring each chunk duration, then concatenating — so [[next]] /
[[goto:…]] land when that line is spoken, not on fixed timeouts.
"""

from __future__ import annotations

import asyncio
import json
import re
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

import edge_tts

VOICE = "en-IN-PrabhatNeural"
RATE = "-5%"
SILENCE_SEC = 0.8

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = Path(__file__).resolve().parent / "voice-script.md"
OUT_DIR = ROOT / "public" / "audio"

SCENES: list[tuple[str, int]] = [
    ("title", 1),
    ("problem", 6),
    ("assess", 6),
    ("gps", 5),
    ("gis", 6),
    ("leak", 6),
    ("command", 9),
    ("core", 9),
]
SCENE_INDEX = {sid: i for i, (sid, _) in enumerate(SCENES)}
SCENE_BEATS = {sid: beats for sid, beats in SCENES}

MARKER_RE = re.compile(
    r"\[\[\s*(next|prev|goto:([a-z0-9_-]+)(?:/(\d+))?|slide:([a-z0-9_-]+)|beat:(\d+))\s*\]\]",
    re.IGNORECASE,
)
SEGMENT_RE = re.compile(r"^##\s+segment:([a-z0-9_-]+)\s*$", re.IGNORECASE | re.MULTILINE)
START_RE = re.compile(r"^start:\s*([a-z0-9_-]+)(?:/(\d+))?\s*$", re.IGNORECASE | re.MULTILINE)


@dataclass
class RawMarker:
    kind: str
    scene_id: str | None = None
    beat: int | None = None


@dataclass
class ResolvedCue:
    at: float
    slide: int
    beat: int
    marker: str


def parse_segments(md: str) -> list[tuple[str, str, str]]:
    matches = list(SEGMENT_RE.finditer(md))
    if not matches:
        raise SystemExit(f"No ## segment:… headings found in {SCRIPT_PATH}")

    out: list[tuple[str, str, str]] = []
    for i, m in enumerate(matches):
        seg_id = m.group(1).lower()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(md)
        body = md[start:end].strip()
        body = re.sub(r"\n---+\s*$", "", body).strip()
        sm = START_RE.search(body)
        if sm:
            start_spec = sm.group(1).lower() + (f"/{sm.group(2)}" if sm.group(2) else "/0")
            body = (body[: sm.start()] + body[sm.end() :]).strip()
        else:
            start_spec = "title/0"
        out.append((seg_id, start_spec, body))
    return out


def parse_marker(m: re.Match[str]) -> RawMarker:
    raw = m.group(1).lower()
    if raw == "next":
        return RawMarker("next")
    if raw == "prev":
        return RawMarker("prev")
    if raw.startswith("goto:"):
        return RawMarker("goto", (m.group(2) or "").lower(), int(m.group(3) or 0))
    if raw.startswith("slide:"):
        return RawMarker("slide", (m.group(4) or "").lower(), 0)
    if raw.startswith("beat:"):
        return RawMarker("beat", None, int(m.group(5) or 0))
    raise SystemExit(f"Unknown marker: {raw}")


def split_body(body: str) -> tuple[list[str], list[RawMarker]]:
    """Split into text chunks between markers. len(chunks) == len(markers) + 1."""
    markers: list[RawMarker] = []
    chunks: list[str] = []
    pos = 0
    for m in MARKER_RE.finditer(body):
        chunks.append(body[pos : m.start()])
        markers.append(parse_marker(m))
        pos = m.end()
    chunks.append(body[pos:])
    return chunks, markers


def parse_start(spec: str) -> tuple[int, int]:
    sid, _, beat_s = spec.partition("/")
    sid = sid.lower()
    if sid not in SCENE_INDEX:
        raise SystemExit(f"Unknown scene id in start: {spec}")
    beat = max(0, min(SCENE_BEATS[sid] - 1, int(beat_s or 0)))
    return SCENE_INDEX[sid], beat


def advance(slide: int, beat: int, delta: int) -> tuple[int, int]:
    if delta == 0:
        return slide, beat
    step = 1 if delta > 0 else -1
    for _ in range(abs(delta)):
        beats = SCENES[slide][1]
        if step > 0:
            if beat < beats - 1:
                beat += 1
            elif slide < len(SCENES) - 1:
                slide += 1
                beat = 0
        else:
            if beat > 0:
                beat -= 1
            elif slide > 0:
                slide -= 1
                beat = SCENES[slide][1] - 1
    return slide, beat


def resolve_markers(
    markers: list[RawMarker],
    start_slide: int,
    start_beat: int,
    times: list[float],
) -> list[ResolvedCue]:
    slide, beat = start_slide, start_beat
    cues: list[ResolvedCue] = [ResolvedCue(at=0.0, slide=slide, beat=beat, marker="start")]

    for i, mk in enumerate(markers):
        at = times[i] if i < len(times) else (times[-1] if times else 0.0)
        label = mk.kind
        if mk.kind == "next":
            slide, beat = advance(slide, beat, 1)
            label = "next"
        elif mk.kind == "prev":
            slide, beat = advance(slide, beat, -1)
            label = "prev"
        elif mk.kind in ("goto", "slide"):
            if not mk.scene_id or mk.scene_id not in SCENE_INDEX:
                raise SystemExit(f"Unknown scene in marker: {mk.scene_id}")
            slide = SCENE_INDEX[mk.scene_id]
            beat = max(0, min(SCENE_BEATS[mk.scene_id] - 1, mk.beat or 0))
            label = f"{mk.kind}:{mk.scene_id}/{beat}"
        elif mk.kind == "beat":
            beat = max(0, min(SCENES[slide][1] - 1, mk.beat or 0))
            label = f"beat:{beat}"

        if cues and cues[-1].slide == slide and cues[-1].beat == beat and abs(cues[-1].at - at) < 0.05:
            continue
        cues.append(ResolvedCue(at=round(at, 3), slide=slide, beat=beat, marker=label))

    return cues


async def synth_text(text: str, path: Path) -> None:
    communicate = edge_tts.Communicate(text.strip(), VOICE, rate=RATE)
    await communicate.save(str(path))


def ffprobe_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
    ).strip()
    return float(out)


def make_silence(path: Path, seconds: float = 0.15) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "anullsrc=r=24000:cl=mono",
            "-t",
            str(seconds),
            "-q:a",
            "9",
            "-acodec",
            "libmp3lame",
            str(path),
        ],
        check=True,
        capture_output=True,
    )


def concat_mp3s(parts: list[Path], out: Path) -> None:
    if len(parts) == 1:
        out.write_bytes(parts[0].read_bytes())
        return
    lst = out.parent / f"_{out.stem}_concat.txt"
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in parts), encoding="utf-8")
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(out)],
        check=True,
        capture_output=True,
    )
    lst.unlink(missing_ok=True)


async def build_segment_audio(
    chunks: list[str],
    markers: list[RawMarker],
    out_path: Path,
    work: Path,
) -> tuple[list[float], float]:
    """Synthesize chunks; marker i fires after chunks[0..i] have played."""
    gap = work / "_gap.mp3"
    make_silence(gap, 0.12)

    ordered: list[Path] = []
    marker_times: list[float] = []
    cum = 0.0

    for i, chunk in enumerate(chunks):
        text = chunk.strip()
        if text:
            part = work / f"part_{i:03d}.mp3"
            await synth_text(text, part)
            ordered.append(part)
            cum += ffprobe_duration(part)
        if i < len(markers):
            marker_times.append(round(cum, 3))
            if text and i + 1 < len(chunks) and chunks[i + 1].strip():
                ordered.append(gap)
                cum += 0.12

    if not ordered:
        make_silence(out_path, 0.3)
        return marker_times, 0.3

    concat_mp3s(ordered, out_path)
    return marker_times, ffprobe_duration(out_path)


async def main() -> None:
    if not SCRIPT_PATH.exists():
        raise SystemExit(f"Missing {SCRIPT_PATH}")

    segments = parse_segments(SCRIPT_PATH.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Voice: {VOICE}  Rate: {RATE}")
    print(f"Script: {SCRIPT_PATH}")
    print(f"Output: {OUT_DIR}\n")

    tracks_cues: dict[str, list[dict]] = {}
    durations: dict[str, float] = {}
    paths: list[Path] = []

    with tempfile.TemporaryDirectory(prefix="cess-voice-") as tmp:
        tmp_path = Path(tmp)

        for seg_id, start_spec, body in segments:
            start_slide, start_beat = parse_start(start_spec)
            chunks, markers = split_body(body)
            speakable = "".join(chunks).strip()
            if not speakable and not markers:
                raise SystemExit(f"Segment {seg_id} is empty")

            work = tmp_path / seg_id
            work.mkdir()
            out = OUT_DIR / f"{seg_id}.mp3"
            print(f"  … {seg_id} ({len(markers)} markers, {len([c for c in chunks if c.strip()])} clips)")
            times, dur = await build_segment_audio(chunks, markers, out, work)
            cues = resolve_markers(markers, start_slide, start_beat, times)
            durations[seg_id] = dur
            tracks_cues[seg_id] = [
                {"at": c.at, "slide": c.slide, "beat": c.beat, "marker": c.marker} for c in cues
            ]
            paths.append(out)
            print(f"  ✓ {out.name}  ({dur:.1f}s, {len(cues)} cues)")
            for c in cues:
                print(f"      {c.at:6.2f}s  slide={c.slide} beat={c.beat}  {c.marker}")

    silence = OUT_DIR / "_silence.mp3"
    make_silence(silence, SILENCE_SEC)

    concat_list = OUT_DIR / "_concat.txt"
    lines: list[str] = []
    for i, p in enumerate(paths):
        lines.append(f"file '{p.name}'")
        if i < len(paths) - 1:
            lines.append(f"file '{silence.name}'")
    concat_list.write_text("\n".join(lines) + "\n", encoding="utf-8")

    full = OUT_DIR / "00-full-video-speech.mp3"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_list),
            "-c",
            "copy",
            str(full),
        ],
        check=True,
        capture_output=True,
        cwd=str(OUT_DIR),
    )
    full_dur = ffprobe_duration(full)
    print(f"\n  ✓ {full.name} ({full_dur:.1f}s)")

    silence.unlink(missing_ok=True)
    concat_list.unlink(missing_ok=True)

    full_cues: list[dict] = []
    offset = 0.0
    for seg_id, _, _ in segments:
        for c in tracks_cues[seg_id]:
            full_cues.append(
                {
                    "at": round(offset + float(c["at"]), 3),
                    "slide": c["slide"],
                    "beat": c["beat"],
                    "marker": c["marker"],
                    "segment": seg_id,
                }
            )
        offset += durations[seg_id] + SILENCE_SEC

    tracks_cues["00-full-video-speech"] = full_cues
    durations["00-full-video-speech"] = full_dur

    chain = [{"id": seg_id, "startSlide": parse_start(start_spec)[0]} for seg_id, start_spec, _ in segments]

    (OUT_DIR / "cues.json").write_text(
        json.dumps(
            {
                "voice": VOICE,
                "locale": "en-IN",
                "rate": RATE,
                "source": "scripts/voice-script.md",
                "silence": SILENCE_SEC,
                "scenes": [{"id": sid, "beats": beats} for sid, beats in SCENES],
                "chain": chain,
                "durations": durations,
                "tracks": tracks_cues,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print("  ✓ cues.json")

    entries = [
        {
            "id": "00-full-video-speech",
            "file": "/audio/00-full-video-speech.mp3",
            "title": "Full Video Speech",
            "duration": durations["00-full-video-speech"],
        }
    ]
    for seg_id, _, _ in segments:
        entries.append(
            {
                "id": seg_id,
                "file": f"/audio/{seg_id}.mp3",
                "title": seg_id.replace("-", " ").title(),
                "duration": durations[seg_id],
            }
        )

    (OUT_DIR / "manifest.json").write_text(
        json.dumps(
            {
                "voice": VOICE,
                "locale": "en-IN",
                "rate": RATE,
                "source": "scripts/voice-script.md",
                "tracks": entries,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print("  ✓ manifest.json")
    print("\nDone.")


if __name__ == "__main__":
    asyncio.run(main())
