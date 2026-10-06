# Voice script — Labour CESS Tracking & Monitoring

**Source of truth for TTS + slide sync.** Edit here, then run `npm run voice`.

Markers are **never spoken**. They are stripped before Edge TTS and timed from word boundaries.


| Marker           | Meaning                                            |
| ---------------- | -------------------------------------------------- |
| `[[next]]`       | Forward one beat (then next scene if at last beat) |
| `[[prev]]`       | Back one beat (then previous scene if at beat 0)   |
| `[[goto:gps/2]]` | Jump to scene id + beat                            |
| `[[slide:gis]]`  | Jump to scene, beat 0                              |
| `[[beat:3]]`     | Stay on current scene, set beat                    |


Scene ids: `title` · `problem` · `assess` · `gps` · `gis` · `leak` · `command` · `core`

Segments below must keep their `## segment:…` headings.

---



## segment:01-problem

start: problem/0

[[goto:problem/0]]
Today, one construction work like ABC Commercial Complex sits in many places.

Building plan. Departments. Local bodies. Planning. Utilities. Builder returns.

Each office keeps its own file.

For the Board, there is no common project file.

So demand is unclear. Money may reach late. Field check is hard. There is less for worker welfare.

The chain is simple. Many files. Duplicates. Wrong details. Hard to see. Slow action.

That is the problem we solve. Not the CESS rate. The rate is law.

The Board cannot govern what it cannot see as one record.

---



## segment:02-product

start: title/0

[[goto:title/0]]
We present the Labour CESS Tracking and Monitoring System. This is the Central Platform for the Board.

It brings many sources into one official project file.

[[goto:problem/0]]
First, the problem we solve.

Today, one construction work like ABC Commercial Complex sits in many places.

Building plan. Departments. Local bodies. Planning. Utilities. Builder returns.

Each office keeps its own file.

For the Board, there is no common project file.

So demand is unclear. Money may reach late. Field check is hard. There is less for worker welfare.

The chain is simple. Many files. Duplicates. Wrong details. Hard to see. Slow action.

That is the problem we solve. Not the CESS rate. The rate is law.

The Board cannot govern what it cannot see as one record.

[[goto:problem/1]]
Smart Middleware is the linking layer. It accepts department exchange, file transfer, message pass, periodic feed, and officer entry.

[[goto:problem/2]]
Match and validation. Same plot is matched. Name variants are brought together for the same work. Conflicts are checked. Details that do not agree are shown for the officer.

[[next]]
Process into one format.
Office details become one clear Board form.
Same meaning. Same fields. Ready for the Board file.

[[next]]
One project file.
One Project ID. The Board file begins to form.
Sources are on file. Details are checked. Ready for later work.

[[next]]
The Central Platform is the Board place that holds this one project file.
Key message: Different sources become one official project file on the Central Platform.
Smart Middleware. Match. Process. One project file. Central Platform.
From here, the Board can assess CESS on this file.

---



## segment:03a-assess

start: assess/0

[[goto:assess/0]]
From many files, we now have one official Board file.

One site. One Board file.

Assessment starts here — on the Central Platform.

From submission to assessment, everything stays in one place.

Key issues we must leave behind: starts from many files; unclear who owns the work; hard to see pending cases; treated as a one-off step.

[[next]]
Next: Assignment.

We assign the project to the responsible officer by territory.

District in-charge lists the work.

The Labour Inspector takes ownership for this area.

Workflow runs with the file — not as a separate system.

fffff[[next]] Next: Assessment.

The officer works on the same digital project file.

Not a new folder. Not a parallel sheet.

Same Project ID. Same Board record.

[[next]]
Next: Estimation.

Verified quantities stay on the same Board record.

What is measured sits with the same project file.

Ready for demand.

[[next]]
Next: Demand notice.

A formal demand notice is raised on the project file.

On record, or on the spot after site confirmation.

Same Project ID. Same Board file.

[[next]]
Next: Status.

Pending work, payment, remittance and matching — by territory.

Assessed. Pending. Delayed. Action required.

When the builder pays, that payment alone is not the full close.

The amount must be remitted to the Board, then matched against demand and collection.

Only when remittance and matching agree is the payment confirmed on the Board file.

Key message: One official file. Same Project ID at every step.

One project file. Assignment. Assessment. Estimation. Demand notice. Status.

Much of the evidence still comes from the field. That is next.

---



## segment:03b-gps-field-app

start: gps/0

[[goto:gps/0]]
Assessment is not only desk work.

The Labour Inspector opens the Field Mobile App at ABC.

Phone. Capture. Board file.

Field phone to capture to Central Platform.

Same Project ID. Same construction site.

[[next]]
Key issues the field mobile app must support on site.

Poor network on site.

Unclear if the Board got it.

Send errors must show.

Evidence must stay on the Board file.

Capture must work online or offline.

[[next]]
Next: Works offline.

The mobile app keeps capturing when the network is weak.

Capture on phone. Held offline. Send later.

Nothing is lost on site.

When the network returns, the capture moves to the Board file.

[[next]]
Next: Online. Happy path.

Network is good.

Every capture reaches the Board file.

Online. All reached. Board file.

Same Project ID. Same ABC Commercial Complex.

[[next]]
Next: On-spot demand.

An on-spot demand can be drafted from the mobile app.

On-site capture. On-spot demand. Central Platform.

Same Project ID. Same Board file.

Field evidence is now on record. Next we place it on the territory map.

---



## segment:03c-gis-territory-map

start: gis/0

[[goto:gis/0]]
GPS told us where the inspector stood.

The field visit recorded a location. That is only the first step.

Key issues: Location alone is not enough. Territory coverage is unclear. No responsible officer is mapped.

A pin is not yet a Board territory map.

[[next]]
Next: Territory map.

The project is placed on the Board territory map.

Karnataka. East Zone. Bengaluru Urban. BBMP. ABC.

Now we know which Board territory this work sits in.

[[next]]
Next: Responsible officers.

Officers are mapped to this territory path.

District in-charge for Bengaluru Urban.

Labour Inspector for BBMP and assigned projects.

Field visit, estimation, and GPS record sit with the right officer.

[[next]]
Next: Nearby projects.

Roads and nearby projects appear on the same map.

This gives orientation around ABC.

Same territory. Same view. Clearer context.

[[next]]
Next: Field evidence and CESS.

GPS visits and CESS status sit on the same map.

Three field visits on record.

ABC assessment pending.

Colour-coded CESS status shows what needs action.

[[next]]
Next: Territory dashboard.

One Board dashboard — many projects, field visits, and CESS status together.

Live counts. Status mix. Officer follow-up queue.

Key message: GPS shows the place. Territory shows path and officer. Territory dashboard watches all projects.

When project records do not match, that is next.

---



## segment:03d-compare-records

start: leak/0

[[goto:leak/0]]
Now we compare project records.

Put every detail for one project side by side.

External information. CESS registration. Assessment. Field evidence. Payment. Remittance.

Five projects on the map. This is correlation — not a colour alone.

Key issues: Only showing on a map is not enough. Do not call it leakage too soon. An officer must be in charge. A closing note must stay on the file.

Compare. Flag. Follow-up.

[[next]]
Project A. Normal path.

Records match.

Registered. Assessed. CESS paid.

This is the baseline.

This is what a complete project file looks like.

[[next]]
Project B. Follow-up.

Payment pending.

Assessment is done. Payment has not arrived.

This is a potential exception for review.

Workflow assigns follow-up to the responsible officer.

[[next]]
Project C. Needs review.

Registration missing.

Approval is seen. CESS registration is not.

This is a potential exception for review.

It is not an automatic declaration that leakage has occurred.

The Board decides after authorised review.

[[next]]
Project D. Follow-up.

Assessment pending.

The project is registered. Assessment is still open.

This needs officer follow-up on the same Board file.

Potential exception for review until assessment is closed.

[[next]]
Project E. Follow-up.

Remittance late.

CESS may be deducted. Remittance to the Board is overdue.

Deduction alone is not the close.

Remittance must reach the Board and be matched.

This is a potential exception for review — interest and reconciliation risk.

Next we close the full money trail on the project view.

---



## segment:03e-money-trail

start: command/0

[[goto:command/0]]
From construction to the CESS money trail.

One project: foundations, then money trail, then linked systems, then intelligence.

Start with what the project already holds.

Then attach demand through reconciliation.

[[next]]
Foundations are ready.

Smart Middleware. Match and validation. One project file on the Central Platform.

Assignment. Assessment. Estimation.

The Board file is ready for the money trail.

[[next]]
Next: Demand.

What CESS is expected from this project?

Example on ABC: Demand eighteen point four lakh.

Demand sits on the same Project ID.

[[next]]
Next: Payment.

The builder pays against the demand.

Example: Part-payment twelve point one lakh recorded.

Payment alone is not the full close.

Remittance and matching still follow.

[[next]]
Next: Collection.

What has the department received against demand?

Collected twelve point one lakh. Balance pending.

Payment and collection can differ.

Both must stay on the same project file.

[[next]]
Next: Remittance and matching.

Remit to the Board within thirty days, with project-wise breakup.

Then match demand against collection against remittance.

That matching is DCB — Demand, Collection, Balance.

Only when remittance is matched is payment confirmed on the Board file.

Gaps become potential exceptions for review.

[[next]]
Full money trail on one project view.

Demand. Collection. Remitted. Overdue beyond thirty days.

Live DCB tiles show what matches and what does not.

Mismatch or late remittance may become a potential exception for review.

[[next]]
External systems feed this project view.

KSK. e-Proc. Khajane. Treasury and agency links.

Labour CESS Portal. Remittance at source where configured.

Linked systems keep the Board file current.

[[next]]
Last: CESS intelligence.

From transactions to decision support.

Territory. Project. Time. Assessment, collection and remittance status.

DCB and overdue. Early warning for officers.

Key chain: Construction. Project. Assessment. Demand. Collection. Remittance. Reconciliation. Analytics.

Next: how the Department uses this day to day.

---



## segment:04-operating-close

start: core/0

[[goto:core/0]]
How does the Department live with this every day?

Access. Appeals. KSK. Portal. Remittance at source.

Zones, audit, loop and pillars orbit one common project view.

One Central Platform. One Board file. One operating model.

[[next]]
Governance and Control.

Who can see and act — roles, area and permissions.

Role-based access. Organisation hierarchy. Territory responsibility.

Permissions by designation. Territory maps.

Department, territory and user — clear ownership.

[[next]]
Document and office workflow.

Documents, E-Office and appeals on the same file.

Inward and outward. Grievances. Closing exceptions. Meetings.

Office work stays attached to the project — not in a separate pile.

[[next]]
Finance and CESS operations.

What is owed, collected and remitted.

Demand. Collection. Remittance within thirty days.

Interest on delay. Matching accounts. DCB.

Builder payment, then remittance, then matching — only then confirmed on the Board file.

[[next]]
Communication and compliance.

Alert. Assign. Follow up. Close.

Plus appeals, grievances and decision support.

Potential exceptions become governed follow-up — not a dashboard toy.

[[next]]
External ecosystem.

Labour CESS Portal. Cash counter and QR.

Remittance at source where configured.

KSK links. Links to other government systems.

Outside channels feed the same Board file.

[[next]]
Audit trail and action.

Who created or changed a project. Who assessed. Who raised demand.

Who recorded payment. Who uploaded a document. What changed over time.

Then again: Alert. Assign. Follow up. Close.

Auditors need this full exchange record.

[[next]]
Complete operating loop.

Capture. Validate. Consolidate. Assess.

Locate. Map. Monitor. Detect. Act. Audit. Report.

One connected departmental platform around one project view.

[[next]]
Closing pillars.

One Project. One Unified View. Connected Data.

Field Evidence. Spatial Context. CESS Intelligence. Actionable Governance.

The Board does not need more disconnected systems.

It needs one authenticated project view — with territory responsibility, field evidence, financial reconciliation, and a workflow that turns potential exceptions into resolved, auditable outcomes.

In support of statutory CESS administration and worker welfare in Karnataka.