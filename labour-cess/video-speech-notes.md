# Video speech notes — Labour CESS Tracking & Monitoring System

**Format:** Four-part client video  
**Audience:** KBOCWWB / Government of Karnataka  
**Running example:** ABC Commercial Complex, Bengaluru  
**Tone:** Formal government English. Short sentences. One idea per line.  
**Rule:** Say *potential exception* — never “fraud” or “confirmed leakage” unless the Board has decided after review.

---

## How to use

1. Read only the **SPEECH** blocks aloud.
2. Glance at **ON SCREEN** for the cut — do not read UI labels.
3. Pause on **[beat]** for the picture to land before the next sentence.
4. Keep names fixed (lexicon below). Do not invent product nicknames.

### Voiceover (attached to project)

Indian English audio is generated from **`scripts/voice-script.md`**.

Put slide cues **in the script** (never spoken):

| Marker | Meaning |
|--------|---------|
| `[[next]]` | Forward one beat |
| `[[prev]]` | Back one beat |
| `[[goto:gps/2]]` | Jump to scene + beat |
| `[[slide:gis]]` | Jump to scene, beat 0 |
| `[[beat:3]]` | Set beat on current scene |

Scene ids: `title` · `problem` · `assess` · `gps` · `gis` · `leak` · `command` · `core`

| Control | Action |
|---------|--------|
| Speaker / **V** | Play from this scene — slides follow script markers, then chain |
| **VO** / **B** | Full speech with auto-advance |
| Space / arrows while playing | Stops voice |

Regenerate audio **and** cue times together:

```bash
npm run voice
```

Output: `public/audio/*.mp3` + `public/audio/cues.json`

### Lexicon — one name only

| Term | Means |
|------|--------|
| **Labour CESS Tracking & Monitoring System** | Full official name of this application |
| **Central Platform** | Short form of the same application only |
| **Smart Middleware** | Linking layer — not a separate product for the whole app |
| **Labour CESS Portal** | Builder / agency collection channel — not the main app |
| **KSK** | Separate Board service platform |
| **The Board / KBOCWWB** | The institution — not software |
| **Worker welfare** | Purpose of CESS funds — not a system name |
| **Territory map (MIS & GIS)** | Board geography + responsibility + dashboards |
| **Field Mobile App** | GPS field capture channel |
| **Potential exception** | Correlated gap for authorised review |

Do **not** say “Board system”, “CESS portal”, or “Worker Welfare system” when you mean the Central Platform.

### Phrases to prefer

| Avoid | Prefer |
|-------|--------|
| Fraud / theft / leakage confirmed | Potential exception for authorised review |
| Division owns the cess | Territory hierarchy for responsibility |
| API / REST / middleware protocol | Department exchange · file transfer · message pass · periodic feed |
| Manual entry | Officer entry |
| We guarantee 100% collection | Better visibility, timeliness, and reconciliation |

---

## Full video arc (memorise)

| Part | Story | Approx. |
|------|--------|---------|
| 1 | Problem hook — many files, no Board file | 45–60 sec |
| 2 | Product intro — Central Platform + Smart Middleware | 50–70 sec |
| 3 | Workflow demo — intake → GPS → GIS → money → day-to-day | 3.5–5 min |
| 4 | Benefits recap + close | 45–60 sec |

**One sentence for the whole video**

> Today we walk one construction project — ABC Commercial Complex — from many office files into one Board-owned project view: intake, match and check, assessment, field evidence, territory map, potential exceptions, money trail, and day-to-day administration — in support of worker welfare in Karnataka.

---

# PART 1 — The problem hook

**ON SCREEN:** Many offices. Many files. One construction site in the middle. Empty gap where the Board’s file should be.

### SPEECH

Today, one construction work like ABC Commercial Complex sits in many places.

Building plan.  
Departments.  
Local bodies.  
Planning.  
Utilities.  
Builder returns.

Each office keeps its own file.

**[beat]**

For the Board, there is no common project file.

So demand is unclear.  
Money may reach late.  
Field check is hard.  
There is less for worker welfare.

**[beat]**

The chain is simple.  
Many files.  
Duplicates.  
Wrong details.  
Hard to see.  
Slow action.

That is the problem we solve.  
Not the CESS rate.  
The rate is law.

**Beat end line**  
The Board cannot govern what it cannot see as one record.

---

# PART 2 — Solution intro — the product

**ON SCREEN:** Product name + journey stamps: Sources → Smart Middleware → Central Platform → One project file · Field evidence · Territory map.

### SPEECH

We present the Labour CESS Tracking & Monitoring System.  
This is the Central Platform for the Board.

It brings many sources into one official project file.

**[beat]**

Smart Middleware is the linking layer.  
It accepts department exchange, file transfer, message pass, periodic feed, and officer entry.

Details arrive on the Central Platform.  
Same plot is matched.  
Conflicts are checked.  
One Project ID is created.

**[beat]**

From that file, the Board can assign, assess, raise demand, collect, remit, and reconcile — with a full exchange record.

Field evidence attaches through the Field Mobile App — online or offline.  
The Territory map places the same project under Board responsibility — with officers, visits, and CESS status on one map.

This is not a brochure of features.  
It is one continuous administrative story for one project.

**Beat end line**  
Different sources become one Board-owned project view.

---

# PART 3 — Workflow demo

**Running thread:** ABC Commercial Complex throughout.  
**ON SCREEN once (key chain):**  
Construction → Project → Assessment → Demand → Collection → Remittance → Reconciliation → Analytics.

---

## A. Intake

**ON SCREEN:** Sources flow into Smart Middleware, then Central Platform.

### SPEECH

Six offices send details for the same ABC project into one inbox.

---

## B. Match and check

**ON SCREEN:** Name variants merge. Cost mismatch flagged for the officer.

### SPEECH

Same plot merges.  
Details that do not agree are shown for the officer.  
This is a potential exception — not confirmed leakage.

---

## C. One project file

**ON SCREEN:** Project ID stamp — e.g. CESS-2025-000123.

### SPEECH

One official file.  
Assessment starts here.

---

## D. Assignment → assessment → demand

**ON SCREEN:** Territory owner → case file → estimation → demand notice.

### SPEECH

Labour Inspector owns the area.  
Assessment and estimation sit on the same record.  
Demand notice goes on record — on the file, or on-spot where needed.

---

## E. Field Mobile App — GPS (full)

**ON SCREEN title path:** Field Mobile App · Key Issues · Works Offline · Online · On-spot Demand

---

### E1. App opens

**ON SCREEN:** Phone = Field Mobile App at ABC. Flow toward Central Platform.

### SPEECH

The Labour Inspector is on site at ABC.  
He works on the Field Mobile App — a proper mobile application for field capture.

---

### E2. Key issues

**ON SCREEN:** Four short stamps — Poor network · Did the Board get it? · Send errors must show · Evidence must stay on file.

### SPEECH

Field capture must answer four points.  
Network may be poor.  
The officer must know if the Board received it.  
Send errors must show.  
Evidence must stay on the project file.

---

### E3. Works offline — store on phone

**ON SCREEN:** Network unavailable. “Held offline.” Place, photos, notes saved on the device.

### SPEECH

When the network is weak, the app keeps capturing.  
Place, photos, and notes are stored on the phone.  
Nothing is lost.

---

### E4. Online · sync

**ON SCREEN:** Packets leave the phone → Central Platform. Same Project ID stamp.

### SPEECH

When the network returns, the capture syncs to the Central Platform.  
Same Project ID.  
Evidence is on the official file.

---

### E5. On-spot demand

**ON SCREEN:** Draft demand notice from the app. Same Project ID.

### SPEECH

Where needed, an on-spot demand can be drafted from the mobile app.  
Same rules.  
Same Project ID.  
Full exchange record.

**Step E end line**  
Field evidence reaches the Board file — online or offline.

---

## F. Territory map — GIS (full)

**ON SCREEN title path:** Field Location · Territory Map · Responsible Officers · Nearby Projects · Field Evidence and CESS · Territory Dashboard

**Say if asked (keep off main VO unless needed):**  
Territory map is not the same as GPS.  
GPS is field evidence on a visit.  
Territory map is Board geography and who is responsible.  
A map pin can come from approval, local body, address, or later from GPS — with a clear mark of where each detail came from.

---

### F1. Field location only

**ON SCREEN:** Single GPS pin at ABC. Key issues stamps.

### SPEECH

GPS told us where the inspector stood.  
That records the visit.  
It is not yet territory mapping.

Location alone is not enough.  
Territory coverage is unclear.  
No responsible officer is mapped.

---

### F2. Territory map

**ON SCREEN:** Hierarchy lights — Karnataka → East Zone → Bengaluru Urban → BBMP → ABC.

### SPEECH

The project is placed on the Board territory map.  
Karnataka. East Zone. Bengaluru Urban. BBMP. ABC.  
One clear path of responsibility.

---

### F3. Responsible officers

**ON SCREEN:** District in-charge and Labour Inspector on that path.

### SPEECH

Officers are mapped to this territory.  
Who acts is clear.

---

### F4. Nearby projects (optional — cut first if short)

**ON SCREEN:** Nearby sites for orientation.

### SPEECH

Nearby projects appear on the same map for orientation.

---

### F5. Field evidence and CESS

**ON SCREEN:** GPS visit trail + colour-coded CESS status on ABC.

### SPEECH

Field visits and CESS status sit on the same map.  
Assessment pending for ABC is visible at a glance.

---

### F6. Territory dashboard

**ON SCREEN:** Compact map + KPIs · status mix · officer follow-up queue.

### SPEECH

One Board dashboard shows many projects, field visits, and CESS status together.

**Step F end line**  
One map shows place, responsibility, field visits, and CESS status.

---

## G. Potential exceptions

**ON SCREEN:** Compare → flag → assign follow-up. Source stamps: OK / gap / pending.

### SPEECH

We correlate several streams for the same projects.  
External project information. CESS registration. Assessment. GPS evidence. Collection. Remittance. Map context.

Gaps are correlated.  
Alert. Assign. Follow up. Close.

This is a potential exception for authorised review — not confirmed leakage.  
The Board decides after review.

---

## H. Money trail

**ON SCREEN:** Demand → payment → collection → remittance → DCB / matching accounts.

### SPEECH

Now we close the money trail on the same project view.

What is owed.  
What was paid.  
What reached the Board.

Match the three.  
Demand. Collection. Remittance. Reconciliation.

Gaps become potential exceptions.

---

## I. Day-to-day

**ON SCREEN:** Access · appeals · portal · remittance at source · KSK — around the same project view.

### SPEECH

Day to day, the Department works around the same project view.  
Roles and access.  
Documents and appeals.  
Finance and alerts.  
Labour CESS Portal and remittance at source where configured.  
KSK as a linked Board service platform.

**Key chain — say once**  
Construction. Project. Assessment. Demand. Collection. Remittance. Reconciliation. Analytics.

---

# PART 4 — Benefits recap — value delivered

**ON SCREEN:** Seven short stamps (no card grid):  
One Project · One Unified View · Connected Data · Field Evidence · Spatial Context · CESS Intelligence · Actionable Governance.

### SPEECH

What the Board receives.

One project file instead of scattered office copies.  
Clear ownership by territory — who acts, and when.  
Assessment and demand on the same authenticated record.  
Field evidence with location — stored on the phone when offline, synced when online. On-spot demand where needed.  
Map view of projects, officers, field visits, and CESS status.  
Potential exceptions with a proper follow-up path.  
Full money trail — Demand, Collection, Remittance, Reconciliation.  
Audit-ready record of who changed what, and when.

---

### Closing

The Board does not need more disconnected systems.

It needs one authenticated project view — with territory responsibility, field evidence, financial matching, and a workflow that turns potential exceptions into resolved, auditable outcomes — in support of statutory CESS administration and worker welfare in Karnataka.

Thank you.  
We are ready for questions.

---

## Short cut version (if runtime is tight)

Keep Parts 1, 2, and 4 in full.  
In Part 3, keep only:

1. Intake → Match → One file  
2. Assignment → Demand  
3. GPS: Offline store → Sync → On-spot demand  
4. GIS: Location → Territory → Officers → Evidence and CESS → Dashboard  
5. Money trail  
6. Key chain once  

Drop: Nearby projects (F4), long exceptions cases, day-to-day detail.

**Suggested cut runtime:** ~3.5–4 minutes total.

---

## Pocket answers (off camera / Q&A)

| If they ask | Say |
|-------------|-----|
| Is Case C leakage? | No. It is a potential exception for authorised review. Registration may be delayed or elsewhere. The workflow exists to find out. |
| Territory map vs GPS? | GPS is field evidence on a visit. Territory map is Board geography and who is responsible. |
| Can demand be raised on the spot? | Yes, after site confirmation. It still follows demand rules and a full exchange record. |
| What if send fails offline? | Capture stays on the phone. Waiting and needs-attention states are visible. Nothing is silently overwritten. |
| Does the map replace assessment? | No. The map places the project and officers. Assessment stays on the Central Platform. |
| What is KSK? | Karmika Seva Kendra — a separate Board service platform. |
| Will every agency link on day one? | No. Periodic transfer or officer entry continues where needed. |
| Who wins when costs conflict? | Conflicts are shown for authorised officers to settle. |

---

## Timing guide

| Block | Approx. |
|-------|---------|
| Part 1 · Problem | 45–60 sec |
| Part 2 · Product | 50–70 sec |
| Part 3A–D · Intake to demand | 40–50 sec |
| Part 3E · GPS Field App | 45–60 sec |
| Part 3F · Territory GIS | 50–70 sec |
| Part 3G–I · Exceptions · money · day-to-day | 50–70 sec |
| Part 4 · Benefits + close | 45–60 sec |
| **Full video** | **≈ 6–8 min** |
| **Short cut** | **≈ 3.5–4 min** |

---

## Do not read aloud on camera

- Module codes (M01, M08, F05, and so on) unless someone asks “is this in the tender?”  
- Sample rupee amounts as Board statistics — treat on-screen figures as story examples only.  
- “Fraud”, “theft”, or “confirmed leakage”.  
- IT jargon: API, REST, connector, middleware protocol, audit trail (prefer: full exchange record / keep where each detail came from).

---

*Aligned to the live deck (`speaker-notes.md`, scenes 1–7) and `.cursor/rules/cess-presenter-deck.mdc`. Illustrative figures on screen are for storytelling — do not treat them as Board statistics unless separately validated.*
