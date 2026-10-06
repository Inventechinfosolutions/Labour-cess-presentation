# Labour CESS Tracking & Monitoring — Speaker Story Notes

**Audience:** Government of Karnataka / KBOCWWB evaluation or stakeholder walkthrough  
**Deck:** Live presenter scenes (Title → Scenes 1–8) · Space / click advances beats  
**Running example:** ABC Commercial Complex, Bengaluru (East Zone → Bengaluru Urban → BBMP)  
**Tone:** Formal, departmental. Prefer *potential exception* — never say “fraud” or “confirmed leakage” unless the Board has decided after review.

<style>
/* Presenter script — distinct from guidance / RFP / Q&A */
.speak {
  font-family: Georgia, "Palatino Linotype", Palatino, "Book Antiqua", "Times New Roman", serif;
  font-size: 1.08em;
  line-height: 1.65;
  color: #071433;
  background: #eef8f9;
  border-left: 5px solid #0e9aa7;
  padding: 14px 18px;
  margin: 10px 0 16px;
  border-radius: 0 10px 10px 0;
}
.speak strong { color: #0a3d42; }
.cue {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.92em;
  color: #0e7480;
  font-weight: 700;
}
</style>

> **Read aloud = teal box + Georgia serif.** Space cues inside the box use monospace teal. RFP / Q&A / On screen stay in the normal font — do not read those aloud.

---

## How to use these notes

1. Read only the **Story** boxes aloud (Georgia serif + teal bar). Paraphrase if needed — do not read RFP / Q&A aloud.
2. Advance the deck with **Space** when you see **⟶ Space**.
3. Glance at **On screen** only if you lose your place — do not read every UI label.
4. Use **RFP anchor** if someone asks “is this in the tender?”
5. Use **If they ask** only when a question comes.

**One sentence for the whole presentation**

> Today we walk one construction project — ABC Commercial Complex — from fragmented departmental records into a single Board-owned platform: intake, authenticated project record, assessment workflow, GPS evidence, territory GIS, correlation for potential exceptions, demand–collection–remittance–reconciliation, and the departmental operating model around that common view — aligned to the RFP lifecycle and modules.

**Controls (say once at the start if needed)**

- Space / click = next beat · arrows = navigate · F = fullscreen · Key issues buttons open risk context (optional).

### Lexicon — use one name for the application

| Term | Use for |
|------|---------|
| **Labour CESS Tracking & Monitoring System** | The application in this RFP (full name) |
| **Central Platform** | Short form of the same application only |
| **Labour CESS Portal** | Builder / contractor / collecting-agency channel (not the main application) |
| **KSK** | Karmika Seva Kendra — separate Board service platform |
| **LCDRS** | Remittance at source |
| **The Board / KBOCWWB** | The institution — not software |
| **Worker welfare** | Purpose of CESS funds — not a system name |

Do **not** say “Board system”, “CESS portal”, or “Worker Welfare system” when you mean the Central Platform.

**Deck design rule (always apply):** `.cursor/rules/cess-presenter-deck.mdc` — formal GoK language, short sentences, common-man terms (no IT jargon on slides), visualization-first, purposeful animation (Motion + beats).

---

## Overall story arc (memorise this)

| Scene | Story beat | RFP modules (main) |
|------|------------|--------------------|
| Title | Who we are serving and what the platform covers | Overall SOW |
| 1 Gap → File | **Problem then first solution** — many files → Smart Middleware → one Project ID | Domain / M01 · M06, M14, Annexures A/B |
| 2 Assess | Assignment → estimation → demand → status · Workflow system-wide | M03, F05, M02 |
| 3 GPS | Field evidence online/offline + on-spot demand | M08 |
| 4 GIS | Territory + officers + field visits + CESS status on one map | M02, F02, M08, M01 |
| 5 Leakage | Correlate → potential exception → workflow | M01, M10, M15, F05 |
| 6 Command | Demand → payment → remittance → DCB → intel | M01, M13, M11, KSK/LCDRS |
| 7 Core | Operating model + close | F01–F05, M04, M09, M11 |

---

# Title — Opening

**⟶ Scene opens**

### Story — <span style="font-family:Georgia,serif;color:#0e9aa7;">read aloud</span>

<div class="speak" markdown="1">

Good morning / afternoon.

We are presenting for the **Government of Karnataka**, **Labour Department**, and the **Karnataka Building And Other Construction Workers Welfare Board**.

Under the Building and Other Construction Workers’ Welfare Cess Act, eligible construction works attract Labour CESS. That CESS funds welfare for registered construction workers. The Board must be able to see projects, raise demand, collect, remit, and reconcile — with audit-ready trails.

What we will walk through is not a brochure of features. It is **one continuous administrative story**: how a construction project becomes visible to the Board, how assessment and field evidence attach to that project, how territory and GIS give responsibility, how gaps become *potential exceptions* for authorised follow-up, and how finance closes as **Demand · Collection · Remittance · Reconciliation** — with KSK, portal, and LCDRS in the external ecosystem.

The four pillars on screen — registered workers, construction projects, statutory compliance, and welfare delivery — are why this platform exists.

<p class="cue">**⟶ Space** → Scene 1</p>

</div>

### RFP anchor

Legal mandate and end-to-end lifecycle in the SOW: registry → computation → demand → collection → remittance → reconciliation (DCB) → interest/compliance → appeals → analytics.

### If they ask

- *“Is this a product pitch?”* — No. This is a walkthrough of the Board’s CESS administration journey as required by the RFP, using one illustrative project.

---

# Scene 1 — From Many Files to One Project File

**Absolute title on screen:** short beat titles — Problem Statement · Smart Middleware · Central Platform · Match · Check · One Project File  
**Supporting line:** one or two short government sentences under the title.  
**On screen:** Problem canvas first · then Sources → Smart Middleware → Central Platform → Match → Check · One file · Watch-for · 56-apps badge

| Beat | Space shows |
|------|-------------|
| 0 | Problem — many files · gap · what goes wrong · key message |
| 1 | First solution — Smart Middleware (sources still visible) |
| 2 | Central Platform receiving |
| 3 | Match |
| 4 | Check |
| 5 | One project file · solution key message |
| 6 | Next → assessment |

### Story — <span style="font-family:Georgia,serif;color:#0e9aa7;">read aloud</span>

<div class="speak" markdown="1">

We begin with the **present position**.

Take ABC Commercial Complex. The same work may sit in many places — building plan, departments, ULBs, planning, utilities, builders. Each office keeps its own file.

In the centre you see the **gap**: there is **no common project file** for the Board.

<p class="cue">**⟶ Space** — Key message.</p>

So demand is not clear. Money may reach the Board late. There is less for worker welfare. Field check is hard.

The chain is simple: Many files → Duplicates → Wrong details → Hard to see → Slow action.

That is the problem we solve. Not the CESS rate. The rate is law.

<p class="cue">**⟶ Space** — **First solution.** Smart Middleware (M06). We will build this linking layer.</p>

Different sources still sit on the left. The middleware works with many ways of sending details: direct link, department exchange, file transfer, message pass, periodic feed, and officer entry.

<p class="cue">**⟶ Space** — **Central Platform:** six offices send details for **the same** ABC project into one inbox. Packets arrive from all sides. Still separate — Match comes next.</p>
<p class="cue">**⟶ Space** — **Match:** different names side by side. Same plot → merge. Nearby XYZ Towers rejected (different plot). Name variants → place hints → officer merges.</p>
<p class="cue">**⟶ Space** — **Check:** side-by-side compare. Building plan 1,25,000 sq ft vs builder return 98,000 — **fail**, potential exception. Other checks may still pass. Compare → flag → officer.</p>
<p class="cue">**⟶ Space** — **One project file** — one Project ID. Key message.</p>

Key message: Different sources → Smart Middleware → Central Platform → Match → Check → One project file.

Do not read sample costs. This slide shows the **journey**, not live data.

<p class="cue">**⟶ Space** → Scene 2 — CESS assessment on this file.</p>

</div>

### Optional — Key issues (problem phase)

Only if you have time: multiple records of the same project; duplicate/conflicting data; field verification constraints; delayed remittance and interest loss; old CESS dues from past years not tracked year-wise; shortfall affecting welfare.

### Watch for (solution phase)

Different names for the same work; details that do not agree; scans hard to search; unclear who changed what.

### RFP anchor

Domain gaps · M06 Smart Middleware · M14 · M01 · M04/M05 · M12 · Annexures A & B · 7,000+ GPs. Estimated collection often cited as only **30–40%** of eligible cess — use carefully as context, not as a promise of a specific uplift percentage unless approved.

### If they ask

- *“What is demand assessment?”* — Knowing which projects exist, what cost applies, and therefore what CESS is owed — before collection.
- *“Is remittance always 30 days?”* — Speak of “prescribed remittance period” if you want to stay exact.
- *“Will every agency link on day one?”* — No. Periodic transfer or officer entry continues where needed.
- *“Who wins when costs conflict?”* — Conflicts are shown for authorised officers to settle.
- *“What is KSK?”* — Karmika Seva Kendra — separate Board service platform.

---

# Scene 2 — From Project File to CESS Assessment

**Absolute title on screen:** short beat titles — One Project File · Assignment · Assessment · Estimation · Demand Notice · Status  
**Supporting line:** one short government sentence under the title.  
**On screen:** Central Platform desk · ABC site · assessment case file · key message synced to beat · **beat 1: Key issues (plain words)** · last beat Next GPS

### Beats (Space)

| # | Story step | Note |
|---|------------|------|
| 0 | Unified project record | On file · **Key issues on screen** |
| 1 | Assignment | Territory ownership · workflow path lights up |
| 2 | Assessment | Officer works the file |
| 3 | Estimation | Verified quantities |
| 4 | Demand notice | Formal notice on record / on-spot |
| 5 | Status | Territory view · payment · remittance · matching → GPS |

**Workflow is not a numbered story step.** It is shown system-wide (F05): stages · who acts · SLA · inbox — at any of the steps above, and elsewhere in the application.

### Story — <span style="font-family:Georgia,serif;color:#0e9aa7;">read aloud</span>

<div class="speak" markdown="1">

Now the officer works **from the unified record**, not from dispersed files.

<p class="cue">**⟶ Space** — Unified project record on file.  
**Key issues** (plain words): Starts from many files · Unclear who owns the work · Hard to see pending cases · Treated as a one-off step.</p>

<p class="cue">**⟶ Space** — **Assignment** under Territory (MIS & GIS). District in-charge lists; Labour Inspector R. Kumar · East Zone · Bengaluru Urban · AST-2025-014.  </p>

Call out the **Workflow · system-wide** rail: F05 is not “after estimation” — it moves assignment, review, demand, appeals, exceptions and more.

<p class="cue">**⟶ Space** — **Assessment** against the digital project file.  </p>

<p class="cue">**⟶ Space** — **Estimation** — verified quantities on the same record.  </p>

<p class="cue">**⟶ Space** — **Demand notice** — DN-2025-00412 · ₹12L · on-record or on-spot.  </p>

<p class="cue">**⟶ Space** — **Status**. Assessed, pending, delayed and action-required — plus payment, remittance and matching — territory-wise.</p>

Key message: Unified project record → Assignment → Assessment → Estimation → Demand notice → Status.  
**Workflow (F05) runs across every stage.**

Bridge out: assessment is not confined to the office. Much of the evidence is captured in the field.

<p class="cue">**⟶ Space** → Scene 3</p>

</div>

### RFP anchor

M03 back-office assessment · F05 workflow & SLA · M02 territory-wise dashboards · district in-charge / labour inspector roles · demand generation after calculation.

### If they ask

- *“Is East Zone the statutory owner of CESS?”* — No. Territory is the **administrative/MIS hierarchy** for responsibility and dashboards. CESS obligation follows the Act and project eligibility; territory mapping is how the Board assigns and monitors work.
- *“What is action mapping?”* — Each workflow stage maps to who acts and what action is required before the next stage — configurable via the workflow engine (F05).

---

# Scene 3 — GPS-enabled field capture and location evidence

**Absolute title on screen:** Field Mobile App · Key Issues · Works Offline · Online · Happy Path · On-spot Demand  
**Supporting line:** one short government sentence under the title.  
**On screen:** Proper **CESS Field App** phone · flow → Central Platform · **beat 1: Key issues (in app + footer)**  

| Beat | Space shows |
|------|-------------|
| 0 | Field mobile app opens |
| 1 | **Key issues** |
| 2 | Works offline |
| 3 | **Online · happy path** — all captures reached |
| 4 | On-spot demand |

### Story — <span style="font-family:Georgia,serif;color:#0e9aa7;">read aloud</span>

<div class="speak" markdown="1">

The Labour Inspector is on site at ABC. He works on the **CESS Field App** — a proper mobile application for field capture.

<p class="cue">**⟶ Space** — **Key issues:** Poor network · Unclear if Board got it · Send errors must show · Evidence must stay on file.</p>

Capture must work **online or offline**.

<p class="cue">**⟶ Space** — **Works offline.** The mobile app keeps the capture on the phone.</p>
<p class="cue">**⟶ Space** — **Online · happy path.** Network is good. Every capture reaches the Board file. Same Project ID.</p>
<p class="cue">**⟶ Space** — **On-spot demand notice** drafted from the mobile app. Same Project ID.</p>

On the survey phone, the inspector records the interior area and the interior level: Basic, Standard or Premium.

On the estimate phone, structure and interiors are valued separately. Here interiors were not declared. The app still adds them.

Key message: Structure is declared. Interiors are often missed. We capture both.

<p class="cue">**⟶ Space** → Scene 4 — territory map (GIS).</p>

</div>

### RFP anchor

M08 GPS-enabled assessment · offline session · geo-tagging · spoofing controls · territory validation of coordinates · feeds verification status back to M01.

### If they ask

- *“Can demand be raised on the spot?”* — Yes, after site confirmation; it still follows demand rules, approval where configured, and a full exchange record.
- *“What if send fails?”* — Waiting and needs-attention states are visible; conflicts are handled under controlled rules — not silent overwrite.
- *“Builders do not tell us the interior cost. How is it valued?”* — The inspector records the interior area and level. The Board's rate table gives the value. At completion, a final check confirms it. Any difference is raised as a demand.
- *“Are tenant fit-outs covered?”* — The app can record them. Whether CESS applies is for the Board's legal view.

---

# Scene 4 — Territory map: location, responsibility, field evidence, and CESS

**Absolute title on screen:** Field Location · Territory Map · Responsible Officers · Nearby Projects · Field Evidence and CESS · Territory Dashboard  
**Supporting line:** one short government sentence under the title.  
**On screen:** Map (progressive) · meaning plaque · Key issues on beat 0 · GPS visits + CESS status · compact map + professional dashboard · Key message  

| Beat | Space shows |
|------|-------------|
| 0 | Field location only · key issues |
| 1 | **Territory map** (hierarchical mapping) |
| 2 | Responsible officers |
| 3 | Nearby projects (orientation) |
| 4 | **GPS field assessment** + **CESS information** on the same map |
| 5 | **Territory dashboard** — smaller map · many projects · KPIs · follow-ups |

### Story — <span style="font-family:Georgia,serif;color:#0e9aa7;">read aloud</span>

<div class="speak" markdown="1">

GPS told us **where** the inspector stood. The **Territory map (MIS & GIS)** must answer: **which Board territory**, **who is responsible**, and then show **field visits** and **CESS status** on the same map.

<p class="cue">**⟶ Space** — **Field location** only. This records where the visit was. It is not yet territory mapping.  
**Key issues:** Location alone is not enough · Territory coverage is unclear · No responsible officer is mapped.</p>
<p class="cue">**⟶ Space** — **Territory map:** Karnataka → East Zone → Bengaluru Urban → BBMP → ABC.</p>
<p class="cue">**⟶ Space** — **Responsible officers:** District in-charge and Labour Inspector on that territory path.</p>
<p class="cue">**⟶ Space** — **Nearby projects** for orientation.</p>
<p class="cue">**⟶ Space** — **Field evidence and CESS:** three GPS visits · ABC Assessment pending · colour-coded CESS status on the map.</p>
<p class="cue">**⟶ Space** — **Territory dashboard:** live KPIs · status mix · officer follow-up queue · field visits · smaller map with all projects.</p>
<p class="cue">**⟶ Space** → Scene 5 — when project records do not match.</p>

</div>

### RFP anchor

M02 Territory MIS & GIS · map overlays and status colouring · F02 post/territory-scoped access · M08 field points · M01 lifecycle status · district in-charge / labour inspector roles.

### If they ask

- *“Does the territory map replace assessment?”* — No. It places the project and maps officers; assessment stays on the Central Platform modules.
- *“Where is approval / building plan?”* — Available as further map detail; this scene proves location, territory, officer, field visits, and CESS status.
- *“Without GPS or CESS registration, how do map details enter?”* — See pocket answer below (also Scene 5).

**Pocket answer — GIS before GPS / registration**

Do not defend a hard sequence “Registration → GPS → then GIS.” The RFP story is **intake with validation states**, not a single locked gate.

1. **Territory map ≠ GPS.** GPS is *field evidence* on a visit. The territory map (MIS & GIS) is *where the project sits in the Board territory hierarchy* and *who is responsible*. A pin can come from approval / ULB / planning, address, or later from GPS — with a clear mark of where each detail came from.
2. **External project information can exist before CESS registration.** That is why Scene 5 Case C exists: approval visible, registration not visible → **potential exception**, not a finished project.
3. **Workflow gates what you may do — not whether a draft may exist.** Incomplete → hold and flag OK; full CESS actions wait until checks pass.
4. **One line for the room:** *“We allow area context into the Central Platform as provisional, marked data. We do not allow CESS actions that need registration or field check until those checks are complete.”*

---

# Scene 5 — Compare project records · potential exceptions

**On screen:** Beat titles · source stamps + map (left) · project desk dashboard (right) · officer path footer on cases B–E

| Beat | Stage | On-screen title |
|------|--------|-----------------|
| 0 | Compare thesis | Compare Project Records |
| 1 | Case A | Records Match |
| 2 | Case B | Payment Pending |
| 3 | Case C | Registration Missing |
| 4 | Case D | Assessment Pending |
| 5 | Case E | Remittance Late |

### Story — <span style="font-family:Georgia,serif;color:#0e9aa7;">read aloud</span>

<div class="speak" markdown="1">

This is the most sensitive scene. Speak slowly.

We correlate several streams for the same geography and projects: external project information, CESS registration, assessment, GPS evidence, collection, remittance, and GIS context.

Watch the **left rail** — source stamps light as OK, gap or pending for each case. Only **five** case projects are on the map. That is the correlation, not a map colour alone.

<p class="cue">**⟶ Space** through cases. Contrast them:</p>

- **A — Expected lifecycle:** registered → assessment completed → CESS paid. This is the baseline.  
- **B — Assessment done, payment pending:** potential exception for review — workflow strip appears.  
- **C — Approval without CESS registration:** potential exception — **not** an automatic declaration that leakage has occurred.  
- **D — Registered, assessment pending:** follow-up.  
- **E — Deducted, remittance overdue beyond 30 days:** deduction may exist, but remittance or project-wise breakup is overdue — interest and reconciliation risk.

Use the phrase **potential exception for review** every time. The Board decides after authorised review.

<p class="cue">**⟶ Space** → Scene 6</p>

</div>

### RFP anchor

M01 compliance / defaulters · M10 decision support · M15 alerts · F05 escalation · remittance delay / interest · never auto-confirm “leakage.”

### If they ask

- *“So is C leakage?”* — No. It is a correlated gap that requires authorised review. Registration may be delayed, mis-mapped, or elsewhere — the workflow exists to find out.
- *“Who gets the alert?”* — Mapped user by territory and designation; SLA escalation along the post manager chain if configured.
- *“How is GIS in the system if registration / GPS is incomplete?”* — Provisional spatial context (from approval/ULB/address) can sit on a stub record with flags. Lifecycle actions that need registration or field GPS stay blocked until validation passes — see Scene 4 pocket answer.

### Closure slide · first beat — Interior Cost Not Declared

**On screen:** The exception list has a row for Skyline Offices · BBMP · Interior Cost Not Declared · ₹ 3,75,000.

<div class="speak" markdown="1">

Some projects declare only the structure cost. The interior cost is left out.

The Central Platform lists this as a potential exception. The officer checks the site and adds the interior value.

The CESS on the difference is raised as a demand. It then follows the same six steps.

</div>

### Closure slide · second beat — Old CESS Dues Management

**On screen:** Agency × year grid of unremitted CESS (left) · BDA dues statement (right) · the same six closure steps, worded for old dues.

<div class="speak" markdown="1">

<p class="cue">**⟶ Space** — Old dues.</p>

Many departments hold CESS from past years. It was never remitted to the Board.

When we move the old records, these dues come with them. Each agency's dues are shown year by year.

Darker cells are older dues. Green cells are years with nothing pending.

Take BDA. A year-wise statement goes to the agency. The agency confirms or disputes each year.

Interest is shown as indicative only. It follows the rules and the Board's decision.

The same steps apply: detect, notify, assign, resolve, verify and close.

Key message: Old records → Opening balance → Agency confirms → Recover → Close.

</div>

### Watch for

- Say **potential dues** until the agency confirms. Never call them leakage.
- Do not read the sample amounts as Board figures. They are illustrative.

### If they ask

- *“Are these figures final?”* — No. They are as per earlier records. Each agency confirms them first.
- *“Is interest charged automatically?”* — No. Interest is indicative. It follows the rules and the Board's decision.
- *“What if an agency disputes a year?”* — The year stays open with the agency's reply and papers. An authorised officer settles it.
- *“When is this data moved?”* — During delivery, with the Accounts module (Milestone 3). Old records and old dues are moved in with opening balances.

---

# Scene 6 — From construction activity to CESS intelligence and DCB

**On screen:** Left sequence · Center stage · Right detail — all three advance together

### Beats (Space)

| # | Left sequence | Center | Right |
|---|---------------|--------|-------|
| 0 | Opening | Foundations (dim) · Scenes 2–5 labels | Opening |
| 1 | Foundations ready | Smart Middleware · one project file · assignment · assessment · estimation | Recap Scenes 1–2 |
| 2 | Demand | Demand card | Demand · ABC |
| 3 | Payment | Payment card | Payment · ABC |
| 4 | Collection | Payment + Collection | Collection · ABC |
| 5 | Remittance & matching | + Remittance + Reconciliation | Starts on Remittance (click Recon) |
| 6 | Full money trail | All cards + live DCB tiles | Live DCB view |
| 7 | External systems | KSK · systems · LCDRS · health | External systems |
| 8 | CESS intelligence | Analytics chips + key chain | Key message |

### Story — <span style="font-family:Georgia,serif;color:#0e9aa7;">read aloud</span>

<div class="speak" markdown="1">

Now we close the **money trail** on the same project view.

Foundations we already built: Smart Middleware, match and validation, process into one project file on the Central Platform, then assignment, assessment and estimation.

<p class="cue">**⟶ Space** — Foundations ready.</p>

<p class="cue">**⟶ Space** — **Demand** — What CESS is expected? Example: Demand ₹18.4 L on ABC.</p>

<p class="cue">**⟶ Space** — **Payment** — What was paid on this project? Part-payment example: ₹12.1 L recorded.</p>

<p class="cue">**⟶ Space** — **Collection** — What did the department receive against demand? Collected ₹12.1 L, balance pending. Payment and collection can diverge — both must be on the project.</p>

<p class="cue">**⟶ Space** — **Remittance & matching** — Remit to the Board within 30 days with project-wise breakup. Match demand vs collection vs remittance → **DCB**. Gaps become potential exceptions.</p>

<p class="cue">**⟶ Space** — **Full money trail** — live DCB tiles on screen. Mismatch or remittance beyond 30 days may become a potential exception.</p>

<p class="cue">**⟶ Space** — **External systems:** KSK; e-Proc, Khajane 2.0, treasury, GST and agency connectors; portal / **LCDRS**; connector health.</p>

<p class="cue">**⟶ Space** — **CESS intelligence:** territory, project, time, assessment/collection/remittance status, DCB/overdue, early warning (DSS).</p>

Key chain: Construction → Project → Assessment → Demand → Collection → Remittance → Reconciliation → Analytics.

<p class="cue">**⟶ Space** → Scene 7 — how the Department uses this day to day.</p>

</div>

### RFP anchor

M01 lifecycle · M13 payment · remittance tracking · auto/manual reconciliation · interest on delay · M11 portal · LCDRS concept · M14/M06 integrations · M10 analytics.

### Explain LCDRS in one breath if asked

> LCDRS is Labour Cess Deduction, Collection and Remittance at Source — where configured, deduction at the point of project payment is linked to Board receipt, reducing delay and lump-sum opacity.

### If they ask

- *“Does payment equal remittance?”* — No. Payment/collection and remittance to the Board can diverge; reconciliation exists to close that gap.
- *“Who does manual reconciliation?”* — Finance officer under M01/M03, with justification logged to audit.
- *“Where do old unpaid dues sit?”* — In the Finance module as old dues brought forward. They are tracked agency-wise and year-wise, like current dues.

---

# Scene 7 — Departmental operating model around the common project view

**On screen:** Five zones around the hub · audit trail · exception path

### Story — <span style="font-family:Georgia,serif;color:#0e9aa7;">read aloud</span>

<div class="speak" markdown="1">

The last scene answers: **how does the Department live with this every day?**

<p class="cue">**⟶ Space** through five zones around the common project view:</p>

1. **Governance & Control** — Role-based access, organisational hierarchy, territory responsibility, permissions by designation, Territory MIS & GIS, department · territory · user. (F01, F02, M02)  
2. **Other Supporting Modules** — DMS, E-Office, inward/outward, **appeals**, grievances, exception resolution, meetings. (M04, M07, M09, F05)  
3. **Finance & CESS Operations** — Demand, collection, remittance within 30 days, interest on delay, reconciliation, accounts/DCB. (M01, M13)  
4. **Communication & Compliance** — Alert → Assignment → Follow-up → Resolution. (M15)  
5. **External Ecosystem** — Labour CESS Portal, cash counter/QR, LCDRS, KSK, Khajane 2.0 (treasury), K-RERA, BBMP and BDA plan approvals, e-Swathu and Panchatantra. (M11, M14, M06)

<p class="cue">**⟶ Space** — Audit trail: who created or changed a project, who assessed, who raised demand, who recorded payment, who uploaded a document, what changed over time. Auditors need this for AG/CAG readiness (F04).</p>

<p class="cue">**⟶ Space** — Exception path again: Alert → Assignment → Follow-up → Resolution — governance, not a dashboard toy.</p>

Closing line (memorise):

> The Board does not need more disconnected systems. It needs one authenticated project view, with territory responsibility, field evidence, financial reconciliation, and a workflow that turns potential exceptions into resolved, auditable outcomes — in support of statutory CESS administration and worker welfare in Karnataka.

Thank the committee. Offer to take questions or demonstrate a specific module path (assessment, GPS offline, remittance overdue, appeal).

</div>

### RFP anchor

Operating model spans foundation modules F01–F05 and domain M01–M15; Scene 7 is the “day in the life” map, not a new scope invent.

### If they ask

- *“Where are appeals?”* — Document & Office Workflow zone and M09; external users via portal; decisions can trigger recalculation in M01.  
- *“Source code ownership?”* — Custom-built for KBOCWWB; Board owns source, database, and data; SDC hosting with DR (per SOW) — if that is part of your bid narrative.  
- *“What should we demo live?”* — Prefer: create/match a project → assign → GPS offline sync → status on territory dashboard → remittance overdue potential exception → DCB view.

---

# Risks and Their Mitigation (just before Thank You)

**Absolute title on screen:** Risks & Their Mitigation — Each Risk · A Clear Plan · A Named Owner  
**On screen:** Four themes on the left · one risk board in the centre (risk · impact → shield → mitigation · owner) · "Risk Cover" ring on the right, filling 10 segments · key message in the footer.

| Beat | Space shows |
|------|-------------|
| 0 | Agencies & Links — 3 risks |
| 1 | Rules & Data — 2 risks |
| 2 | People & Maps — 3 risks |
| 3 | Safety & Continuity — 2 risks · key message |

### Story — <span style="font-family:Georgia,serif;color:#0e9aa7;">read aloud</span>

<div class="speak" markdown="1">

Before we close, we show the risks that can slow this work. Each risk has a plan and an owner.

<p class="cue">**⟶ Space** — **Agencies & Links.**</p>

Some agencies may not report or link. A Government order makes reporting mandatory. Agency scorecards and escalation follow.

Some agency systems are not ready. We link through common platforms. A periodic file transfer works in the meantime.

KSK link access may be delayed. We ask for the link details in Month 1. Our build does not wait.

<p class="cue">**⟶ Space** — **Rules & Data.**</p>

CESS rules must be signed in the SRS. Rates and slabs stay changeable by the Board.

Duplicate projects are matched by location, plan number and GSTIN. An officer reviews the exceptions.

<p class="cue">**⟶ Space** — **People & Maps.**</p>

Officers get Kannada and English screens and an offline mobile app. About 2,000 users are trained. A helpdesk sits on site.

Map layers are requested from KSRSAC and Bhuvan in Month 1. GPS field points fill the gaps.

Each key role has a named backup.

<p class="cue">**⟶ Space** — **Safety & Continuity.**</p>

A disaster recovery site runs at KSDC. Data loss stays under one hour. Service returns within four hours.

Aadhaar is kept only where permitted. Data is encrypted. A CERT-In audit is done before go-live.

Key message: Every risk has a plan and a named owner.

<p class="cue">**⟶ Space** → Thank You.</p>

</div>

### Watch for

- Say **"CESS may go uncollected"**, not leakage.
- "RFP 12.7" tags mark the risks the RFP itself lists.

### If they ask

- *“Why is the Board an owner?”* — Some steps need the Board: the Government order, KSK access, rule sign-off and map layer requests.
- *“What do 1 hour and 4 hours mean?”* — At most one hour of data can be lost. Service comes back within four hours.
- *“Who tracks these risks?”* — CMS keeps the risk list and reports it in each progress review.

---

## Quick glossary (keep in your pocket)

| Term | Plain meaning |
|------|----------------|
| **KBOCWWB** | Karnataka Building & Other Construction Workers Welfare Board |
| **CESS** | Labour welfare cess on eligible construction (baseline 1% of cost under the Act) |
| **Project ID** | Unique project code on the Central Platform for one construction work (e.g. CESS-2025-000123) |
| **Official project file** | The Board’s single project record that sources, assessment, GPS and finance attach to |
| **DCB** | Demand–Collection–Balance |
| **LCDRS** | Deduction / collection / remittance at source (where configured) |
| **KSK** | Karmika Seva Kendra platform |
| **Territory (MIS & GIS)** | Hierarchical geography + dashboards + entity mapping (M02) |
| **Potential exception** | Correlated gap for authorised review — not confirmed leakage |
| **F05** | Workflow & SLA engine (stages, action mapping, escalation) |
| **Annexure A/B** | Named agencies/apps listed for integration in the RFP |

---

## Timing suggestion (≈ 25–35 minutes)

| Block | Minutes | Scenes |
|-------|---------|--------|
| Open + problem | 4–5 | Title, 1 |
| Assess + GPS | 5–6 | 2, 3 |
| Territory map (GIS) | 4–5 | 4 |
| Exceptions | 5–6 | 5 |
| Finance + operating model + close | 6–8 | 6, 7 |
| Risks and mitigation | 2–3 | Risks (before Thank You) |
| Buffer / questions | rest | — |

If short on time: keep full story on Scenes 1, 3, 4, 5, 6, 7; accelerate where needed.

---

## Phrases to avoid / prefer

| Avoid | Prefer |
|-------|--------|
| Fraud / theft / leakage confirmed | Potential exception for authorised review |
| Division owns the cess | Territory hierarchy for responsibility and MIS |
| We guarantee 100% collection | Improve visibility, timeliness, and reconciliation |
| AI will auto-punish | Decision support surfaces patterns for officers |
| One API for all GPs | Hybrid: API, middleware, connector, and manual |

---

*Aligned to the live deck in this repo and to RFP/SOW understanding in the KBOCWWB design requirements (domain knowledge + modules M01–M15 / F01–F05). Illustrative figures on screen (₹ amounts, KPI counts) are for storytelling — do not treat them as Board statistics unless separately validated.*
