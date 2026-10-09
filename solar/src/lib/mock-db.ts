import type {
  User, Opportunity, Project, Notification, Role,
  ProjectStatus, MilestoneStatus, DocStatus
} from "./types";
import { generateOpportunityReference } from "./opportunity-reference";
import { buildIppUploadChecklist } from "./opportunity-ipp-checklist";

const KEY = "pmis_db_v2";
  const SESSION_KEY = "pmis_session_v1";
  
  interface DB {
    users: User[];
    opportunities: Opportunity[];
    projects: Project[];
    notifications: Notification[];
  }
  
  function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }
  
  function daysFromNow(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }
  
  function seed(): DB {
    const users: User[] = [
      { id: "u_ipp", name: "Ravi Kumar", email: "ipp@demo.com", password: "demo", role: "ipp", org: "GreenPower Pvt Ltd" },
      { id: "u_wind", name: "Meera Iyer", email: "windtech@demo.com", password: "demo", role: "ipp", org: "WindTech Ltd" },
      { id: "u_off", name: "Anita Sharma", email: "officer@demo.com", password: "demo", role: "officer", org: "Dept. of Renewables" },
      { id: "u_apr", name: "Dr. Mehta", email: "approver@demo.com", password: "demo", role: "approver", org: "Senior Authority" },
      { id: "u_adm", name: "Sunita Rao", email: "admin@demo.com", password: "demo", role: "admin", org: "Dept. Admin" },
      { id: "u_mgt", name: "Vikram Singh", email: "management@demo.com", password: "demo", role: "management", org: "Ministry" },
    ];
  
    const opportunitiesBase: Opportunity[] = [
      {
        id: "opp_1", code: "RE-SOL-2026-01", name: "Rajasthan Solar Park Phase II",
        type: "Solar", capacityMW: 500, state: "Rajasthan", district: "Jaisalmer",
        locationAddress: "Nodal office: MNRE state facilitation desk, Jaipur (demo)",
        locationType: "Fixed",
        fixedSiteAddress: "Bhadla Solar Park cluster, Phase II parcels SP-12–SP-18, NH-125 corridor, Jaisalmer district.",
        startDate: daysFromNow(-15),         endDate: daysFromNow(45), status: "Published",
        expectedCommissioningDate: daysFromNow(380),
        publishedBy: "Sunita Rao (Admin)",
        description: "Large-scale solar PV opportunity for IPPs with department-provided land near Jaisalmer.",
        landSource: "Department Provided",
        departmentFixedLocationSummary: "Jaisalmer · Rajasthan",
        documents: [
          { name: "Company Registration", mandatory: true },
          { name: "Technical Capability", mandatory: true },
          { name: "Financial Statements (3 yrs)", mandatory: true },
          { name: "Past Project Experience", mandatory: false },
          { name: "EPC Partner Agreement", mandatory: false },
        ],
        eligibility: [
          { criterion: "Minimum net worth", mandatory: true },
          { criterion: "Solar EPC track record (≥50 MW commissioned)", mandatory: true },
          { criterion: "Land control or binding intent", mandatory: false },
        ],
        termsAndConditions: [
          { term: "The applicant must comply with all applicable central and state laws, regulations, and guidelines governing renewable energy projects.", mandatory: true },
          { term: "The applicant shall not sublet, transfer, or assign the scheme benefits to any third party without prior written approval from the nodal authority.", mandatory: true },
          { term: "All documents submitted as part of the application must be authentic. Any misrepresentation will result in immediate disqualification and may attract legal action.", mandatory: true },
          { term: "The applicant agrees to commission the project within the timeline specified in the scheme guidelines, failing which penalties as prescribed shall apply.", mandatory: true },
          { term: "The applicant acknowledges that the nodal authority reserves the right to amend, suspend, or cancel the scheme at any time, subject to due notice.", mandatory: false },
        ],
      },
      {
        id: "opp_2", code: "RE-WIN-2026-02", name: "Tamil Nadu Coastal Wind",
        type: "Wind", capacityMW: 250, state: "Tamil Nadu", district: "Tirunelveli",
        locationAddress: "Coastal belt eligible zone: Radhapuram–Kanyakumari corridor (applicant to confirm site within 25 km of coast).",
        locationType: "Flexible",
        startDate: daysFromNow(-5), endDate: daysFromNow(20), status: "Published",
        expectedCommissioningDate: daysFromNow(400),
        publishedBy: "Sunita Rao (Admin)",
        description: "Onshore wind opportunity along the Tamil Nadu coast.",
        landSource: "IPP Provided",
        documents: [
          { name: "Company Registration", mandatory: true },
          { name: "Wind Resource Assessment", mandatory: true },
          { name: "Land Title Deed", mandatory: true },
          { name: "Environmental Clearance", mandatory: true },
        ],
        termsAndConditions: [
          { term: "The applicant must comply with all applicable central and state laws, regulations, and guidelines governing renewable energy projects.", mandatory: true },
          { term: "The applicant shall not sublet, transfer, or assign the scheme benefits to any third party without prior written approval from the nodal authority.", mandatory: true },
          { term: "All documents submitted as part of the application must be authentic. Any misrepresentation will result in immediate disqualification and may attract legal action.", mandatory: true },
          { term: "The applicant agrees to commission the project within the timeline specified in the scheme guidelines, failing which penalties as prescribed shall apply.", mandatory: true },
          { term: "The applicant acknowledges that the nodal authority reserves the right to amend, suspend, or cancel the scheme at any time, subject to due notice.", mandatory: false },
        ],
      },
      {
        id: "opp_3", code: "RE-HYB-2026-03", name: "Gujarat Solar-Wind Hybrid",
        type: "Hybrid", capacityMW: 400, state: "Gujarat", district: "Kutch",
        startDate: daysFromNow(0), endDate: daysFromNow(60), status: "Published",
        expectedCommissioningDate: daysFromNow(420),
        publishedBy: "Sunita Rao (Admin)",
        description: "Hybrid renewable opportunity combining solar and wind generation.",
        landSource: "Department Provided",
        documents: [
          { name: "Company Registration", mandatory: true },
          { name: "Technical Capability", mandatory: true },
          { name: "Financial Statements", mandatory: true },
          { name: "Hybrid Plant Experience", mandatory: false },
        ],
        termsAndConditions: [
          { term: "The applicant must comply with all applicable central and state laws, regulations, and guidelines governing renewable energy projects.", mandatory: true },
          { term: "The applicant shall not sublet, transfer, or assign the scheme benefits to any third party without prior written approval from the nodal authority.", mandatory: true },
          { term: "All documents submitted as part of the application must be authentic. Any misrepresentation will result in immediate disqualification and may attract legal action.", mandatory: true },
          { term: "The applicant agrees to commission the project within the timeline specified in the scheme guidelines, failing which penalties as prescribed shall apply.", mandatory: true },
          { term: "The applicant acknowledges that the nodal authority reserves the right to amend, suspend, or cancel the scheme at any time, subject to due notice.", mandatory: false },
        ],
      },
      {
        id: "opp_4", code: "RE-SOL-2026-04", name: "Karnataka Rooftop Solar Cluster",
        type: "Solar", capacityMW: 100, state: "Karnataka", district: "Bengaluru Urban",
        startDate: daysFromNow(-30), endDate: daysFromNow(10), status: "Published",
        expectedCommissioningDate: daysFromNow(200),
        publishedBy: "Sunita Rao (Admin)",
        description: "Distributed rooftop solar across commercial buildings.",
        landSource: "IPP Provided",
        documents: [
          { name: "Company Registration", mandatory: true },
          { name: "Rooftop MoU Sample", mandatory: true },
        ],
        termsAndConditions: [
          { term: "The applicant must comply with all applicable central and state laws, regulations, and guidelines governing renewable energy projects.", mandatory: true },
          { term: "The applicant shall not sublet, transfer, or assign the scheme benefits to any third party without prior written approval from the nodal authority.", mandatory: true },
          { term: "All documents submitted as part of the application must be authentic. Any misrepresentation will result in immediate disqualification and may attract legal action.", mandatory: true },
          { term: "The applicant agrees to commission the project within the timeline specified in the scheme guidelines, failing which penalties as prescribed shall apply.", mandatory: true },
          { term: "The applicant acknowledges that the nodal authority reserves the right to amend, suspend, or cancel the scheme at any time, subject to due notice.", mandatory: false },
        ],
      },
    ];
    const opportunities: Opportunity[] = [];
    for (const o of opportunitiesBase) {
      opportunities.push({
        ...o,
        referenceCode:
          o.status === "Published" ? generateOpportunityReference(o.name, o.type, opportunities) : undefined,
      });
    }
  
    const baseDocs = (names: { name: string; mandatory: boolean }[], allUploaded = false) =>
      names.map((n, i) => ({
        id: uid("doc"),
        name: n.name,
        status: (allUploaded ? "Verified" : i < 2 ? "Uploaded" : "Missing") as DocStatus,
        uploadedAt: i < 2 || allUploaded ? daysFromNow(-3) : undefined,
      }));
  
    const baseMilestones = (): { name: string; offset: number }[] => [
      { name: "Land Acquisition Complete", offset: 30 },
      { name: "PPA Signing", offset: 60 },
      { name: "Equipment Procurement", offset: 90 },
      { name: "Installation 50%", offset: 150 },
      { name: "Commissioning", offset: 210 },
    ];
  
    const buildMilestones = (status: ProjectStatus) =>
      baseMilestones().map((m, i) => ({
        id: uid("ms"),
        name: m.name,
        sequence: i + 1,
        dueDate: daysFromNow(m.offset),
        progress: status === "In Execution" && i === 0 ? 60 : status === "In Execution" && i === 1 ? 20 : 0,
        status: (status === "In Execution" && i === 0
          ? "In Progress"
          : status === "In Execution" && i === 1
          ? "In Progress"
          : "Not Started") as MilestoneStatus,
      }));
  
    const projects: Project[] = [
      {
        id: "prj_1",
        name: "GreenPower Solar 50 MW",
        ippId: "u_ipp", ippName: "Ravi Kumar",
        opportunityId: "opp_1", opportunityName: "Rajasthan Solar Park Phase II",
        type: "Solar", capacityMW: 50, state: "Rajasthan", district: "Jaisalmer",
        status: "Under Review", stage: "Officer Review",
        slaStatus: "On Track", slaDueDate: daysFromNow(5),
        submittedAt: daysFromNow(-3), lastUpdated: daysFromNow(-1),
        assignedOfficer: "Anita Sharma",
        documents: baseDocs(opportunities[0].documents),
        milestones: buildMilestones("Under Review"),
        queries: [],
        workflow: [
          { name: "Application Submitted", role: "ipp", status: "completed", assignee: "Ravi Kumar", completedAt: daysFromNow(-3) },
          { name: "Officer Review", role: "officer", status: "current", assignee: "Anita Sharma" },
          { name: "Final Approval", role: "approver", status: "pending" },
        ],
        activity: [
          { id: uid("act"), user: "Ravi Kumar", role: "ipp", action: "Submitted application", timestamp: daysFromNow(-3) },
          { id: uid("act"), user: "Anita Sharma", role: "officer", action: "Started review", timestamp: daysFromNow(-2) },
        ],
      },
      {
        id: "prj_7",
        name: "WindTech Parcels 100 MW",
        ippId: "u_wind",
        ippName: "Meera Iyer",
        opportunityId: "opp_1",
        opportunityName: "Rajasthan Solar Park Phase II",
        type: "Solar",
        capacityMW: 100,
        state: "Rajasthan",
        district: "Jaisalmer",
        status: "Submitted",
        stage: "Pending officer evaluation",
        slaStatus: "On Track",
        slaDueDate: daysFromNow(6),
        submittedAt: daysFromNow(-1),
        lastUpdated: daysFromNow(-1),
        documents: baseDocs(opportunities[0].documents),
        milestones: buildMilestones("Submitted"),
        queries: [],
        workflow: [
          { name: "Application Submitted", role: "ipp", status: "completed", assignee: "Meera Iyer", completedAt: daysFromNow(-1) },
          { name: "Officer Review", role: "officer", status: "current" },
          { name: "Final Approval", role: "approver", status: "pending" },
        ],
        activity: [
          { id: uid("act"), user: "Meera Iyer", role: "ipp", action: "Submitted application", timestamp: daysFromNow(-1) },
        ],
      },
      {
        id: "prj_2",
        name: "GreenPower Wind 25 MW",
        ippId: "u_ipp", ippName: "Ravi Kumar",
        opportunityId: "opp_2", opportunityName: "Tamil Nadu Coastal Wind",
        type: "Wind", capacityMW: 25, state: "Tamil Nadu", district: "Tirunelveli",
        status: "Query Raised", stage: "Awaiting IPP Response",
        slaStatus: "At Risk", slaDueDate: daysFromNow(2),
        submittedAt: daysFromNow(-7), lastUpdated: daysFromNow(-1),
        assignedOfficer: "Anita Sharma",
        documents: baseDocs(opportunities[1].documents),
        milestones: buildMilestones("Query Raised"),
        queries: [
          {
            id: uid("q"),
            message: "Please provide updated wind resource assessment for the past 2 years and the executed land title deed.",
            raisedBy: "Anita Sharma",
            raisedAt: daysFromNow(-1),
            status: "Open",
          },
        ],
        workflow: [
          { name: "Application Submitted", role: "ipp", status: "completed", assignee: "Ravi Kumar", completedAt: daysFromNow(-7) },
          { name: "Officer Review", role: "officer", status: "current", assignee: "Anita Sharma" },
          { name: "Final Approval", role: "approver", status: "pending" },
        ],
        activity: [
          { id: uid("act"), user: "Ravi Kumar", role: "ipp", action: "Submitted application", timestamp: daysFromNow(-7) },
          { id: uid("act"), user: "Anita Sharma", role: "officer", action: "Raised query on documents", timestamp: daysFromNow(-1) },
        ],
      },
      {
        id: "prj_3",
        name: "SunEdison Hybrid 80 MW",
        ippId: "u_other_1", ippName: "Priya Nair",
        opportunityId: "opp_3", opportunityName: "Gujarat Solar-Wind Hybrid",
        type: "Hybrid", capacityMW: 80, state: "Gujarat", district: "Kutch",
        status: "Submitted", stage: "Pending Officer Assignment",
        slaStatus: "On Track", slaDueDate: daysFromNow(7),
        submittedAt: daysFromNow(-1), lastUpdated: daysFromNow(-1),
        documents: baseDocs(opportunities[2].documents),
        milestones: buildMilestones("Submitted"),
        queries: [],
        workflow: [
          { name: "Application Submitted", role: "ipp", status: "completed", assignee: "Priya Nair", completedAt: daysFromNow(-1) },
          { name: "Officer Review", role: "officer", status: "current" },
          { name: "Final Approval", role: "approver", status: "pending" },
        ],
        activity: [
          { id: uid("act"), user: "Priya Nair", role: "ipp", action: "Submitted application", timestamp: daysFromNow(-1) },
        ],
      },
      {
        id: "prj_4",
        name: "BlueWave Wind 30 MW",
        ippId: "u_other_2", ippName: "Karthik Reddy",
        opportunityId: "opp_2", opportunityName: "Tamil Nadu Coastal Wind",
        type: "Wind", capacityMW: 30, state: "Tamil Nadu", district: "Tirunelveli",
        status: "Under Review", stage: "Pending Final Approval",
        slaStatus: "Breached", slaDueDate: daysFromNow(-2),
        submittedAt: daysFromNow(-12), lastUpdated: daysFromNow(-2),
        assignedOfficer: "Anita Sharma",
        documents: baseDocs(opportunities[1].documents, true),
        milestones: buildMilestones("Under Review"),
        queries: [],
        workflow: [
          { name: "Application Submitted", role: "ipp", status: "completed", assignee: "Karthik Reddy", completedAt: daysFromNow(-12) },
          { name: "Officer Review", role: "officer", status: "completed", assignee: "Anita Sharma", completedAt: daysFromNow(-2) },
          { name: "Final Approval", role: "approver", status: "current", assignee: "Dr. Mehta" },
        ],
        activity: [
          { id: uid("act"), user: "Karthik Reddy", role: "ipp", action: "Submitted application", timestamp: daysFromNow(-12) },
          { id: uid("act"), user: "Anita Sharma", role: "officer", action: "Forwarded for approval", timestamp: daysFromNow(-2) },
        ],
      },
      {
        id: "prj_5",
        name: "GreenPower Rooftop 5 MW",
        ippId: "u_ipp", ippName: "Ravi Kumar",
        opportunityId: "opp_4", opportunityName: "Karnataka Rooftop Solar Cluster",
        type: "Solar", capacityMW: 5, state: "Karnataka", district: "Bengaluru Urban",
        status: "In Execution", stage: "Execution",
        slaStatus: "On Track", slaDueDate: daysFromNow(180),
        submittedAt: daysFromNow(-60), lastUpdated: daysFromNow(-5),
        assignedOfficer: "Anita Sharma",
        documents: baseDocs(opportunities[3].documents, true),
        milestones: buildMilestones("In Execution"),
        queries: [],
        workflow: [
          { name: "Application Submitted", role: "ipp", status: "completed", assignee: "Ravi Kumar", completedAt: daysFromNow(-60) },
          { name: "Officer Review", role: "officer", status: "completed", assignee: "Anita Sharma", completedAt: daysFromNow(-50) },
          { name: "Final Approval", role: "approver", status: "completed", assignee: "Dr. Mehta", completedAt: daysFromNow(-45) },
          { name: "Execution", role: "ipp", status: "current", assignee: "Ravi Kumar" },
        ],
        activity: [
          { id: uid("act"), user: "Ravi Kumar", role: "ipp", action: "Submitted application", timestamp: daysFromNow(-60) },
          { id: uid("act"), user: "Dr. Mehta", role: "approver", action: "Approved project", timestamp: daysFromNow(-45) },
          { id: uid("act"), user: "Ravi Kumar", role: "ipp", action: "Updated milestone progress", timestamp: daysFromNow(-5) },
        ],
      },
      {
        id: "prj_6",
        name: "GreenPower Draft Application",
        ippId: "u_ipp", ippName: "Ravi Kumar",
        opportunityId: "opp_3", opportunityName: "Gujarat Solar-Wind Hybrid",
        type: "Hybrid", capacityMW: 40, state: "Gujarat", district: "Kutch",
        status: "Draft", stage: "Draft",
        slaStatus: "On Track", slaDueDate: daysFromNow(30),
        lastUpdated: daysFromNow(0),
        documents: baseDocs(opportunities[2].documents),
        milestones: [],
        queries: [],
        workflow: [
          { name: "Draft", role: "ipp", status: "current", assignee: "Ravi Kumar" },
        ],
        activity: [
          { id: uid("act"), user: "Ravi Kumar", role: "ipp", action: "Created draft", timestamp: daysFromNow(0) },
        ],
      },
      {
        id: "prj_8",
        name: "GreenPower Rooftop Phase 2 — 10 MW",
        ippId: "u_ipp", ippName: "Ravi Kumar",
        opportunityId: "opp_4", opportunityName: "Karnataka Rooftop Solar Cluster",
        type: "Solar", capacityMW: 10, state: "Karnataka", district: "Bengaluru Urban",
        status: "Ready for Commissioning", stage: "Ready for Commissioning",
        slaStatus: "On Track", slaDueDate: daysFromNow(30),
        submittedAt: daysFromNow(-90), lastUpdated: daysFromNow(-1),
        assignedOfficer: "Anita Sharma",
        documents: baseDocs(opportunities[3].documents, true),
        milestones: (() => {
          const defs = [
            { name: "Site setup", days: -90 },
            { name: "Equipment installation", days: -60 },
            { name: "Testing & commissioning", days: -20 },
          ];
          return defs.map((m, i) => {
            const id = uid("ms");
            return {
              id,
              name: m.name,
              sequence: i + 1,
              dueDate: daysFromNow(m.days),
              progress: 100,
              status: "Completed" as MilestoneStatus,
              proofs: [
                { id: `${id}_p1`, label: "Site photos / evidence", status: "Uploaded" as DocStatus, uploadedAt: daysFromNow(m.days + 5) },
                { id: `${id}_p2`, label: "Installation proof", status: "Uploaded" as DocStatus, uploadedAt: daysFromNow(m.days + 5) },
                { id: `${id}_p3`, label: "Reports / certificates", status: "Uploaded" as DocStatus, uploadedAt: daysFromNow(m.days + 5) },
              ],
            };
          });
        })(),
        queries: [],
        workflow: [
          { name: "Application Submitted", role: "ipp", status: "completed", assignee: "Ravi Kumar", completedAt: daysFromNow(-90) },
          { name: "Officer Review", role: "officer", status: "completed", assignee: "Anita Sharma", completedAt: daysFromNow(-80) },
          { name: "Final Approval", role: "approver", status: "completed", assignee: "Dr. Mehta", completedAt: daysFromNow(-75) },
          { name: "Execution", role: "ipp", status: "completed", assignee: "Ravi Kumar", completedAt: daysFromNow(-1) },
        ],
        activity: [
          { id: uid("act"), user: "Ravi Kumar", role: "ipp", action: "Submitted application", timestamp: daysFromNow(-90) },
          { id: uid("act"), user: "Dr. Mehta", role: "approver", action: "Granted final approval — project moved to execution", timestamp: daysFromNow(-75) },
          { id: uid("act"), user: "PMIS", role: "admin", action: "All milestones verified — project set to Ready for Commissioning", timestamp: daysFromNow(-1) },
        ],
      },

    ];
  
    const notifications: Notification[] = [
      { id: uid("n"), userId: "u_ipp", title: "Query raised", message: "Officer raised a query on GreenPower Wind 25 MW", type: "warning", read: false, createdAt: daysFromNow(-1), link: "/ipp/projects/prj_2" },
      { id: uid("n"), userId: "u_ipp", title: "SLA approaching", message: "Response due in 2 days for project GreenPower Wind 25 MW", type: "warning", read: false, createdAt: daysFromNow(0) },
      { id: uid("n"), userId: "u_ipp", title: "New opportunity", message: "Gujarat Solar-Wind Hybrid is now open", type: "info", read: true, createdAt: daysFromNow(-2) },
      { id: uid("n"), userId: "u_off", title: "New application", message: "SunEdison Hybrid 80 MW submitted for review", type: "info", read: false, createdAt: daysFromNow(-1) },
      { id: uid("n"), userId: "u_off", title: "SLA breached", message: "BlueWave Wind 30 MW SLA exceeded", type: "error", read: false, createdAt: daysFromNow(-2) },
      { id: uid("n"), userId: "u_apr", title: "Pending approval", message: "BlueWave Wind 30 MW awaiting your decision", type: "warning", read: false, createdAt: daysFromNow(-2) },
    ];
  
    return { users, opportunities, projects, notifications };
  }
  
  let cache: DB | null = null;
  
  function read(): DB {
    if (cache) return cache;
    if (typeof window === "undefined") {
      cache = seed();
      return cache;
    }
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      cache = seed();
      localStorage.setItem(KEY, JSON.stringify(cache));
      return cache;
    }
    try {
      cache = JSON.parse(raw) as DB;
      return cache;
    } catch {
      cache = seed();
      localStorage.setItem(KEY, JSON.stringify(cache));
      return cache;
    }
  }
  
  function write(db: DB) {
    cache = db;
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(db));
      window.dispatchEvent(new Event("pmis:db-changed"));
    }
  }
  
  export const db = {
    reset() {
      cache = seed();
      if (typeof window !== "undefined") {
        localStorage.setItem(KEY, JSON.stringify(cache));
        window.dispatchEvent(new Event("pmis:db-changed"));
      }
    },
    // Users
    listUsers: () => read().users,
    findUserByEmail: (email: string) => read().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    findUserById: (id: string) => read().users.find((u) => u.id === id),
    registerUser: (input: Omit<User, "id">) => {
      const d = read();
      if (d.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
        throw new Error("Email already registered");
      }
      const u: User = { ...input, id: uid("u") };
      write({ ...d, users: [...d.users, u] });
      return u;
    },
    // Opportunities
    listOpportunities: () => read().opportunities,
    getOpportunity: (id: string) => read().opportunities.find((o) => o.id === id),
    saveOpportunity: (o: Opportunity) => {
      const d = read();
      const rest = d.opportunities.filter((x) => x.id !== o.id);
      write({ ...d, opportunities: [...rest, o] });
    },
    // Projects
    listProjects: (filter?: { ippId?: string; status?: ProjectStatus | ProjectStatus[]; assignedOfficer?: string }) => {
      let p = read().projects;
      if (filter?.ippId) p = p.filter((x) => x.ippId === filter.ippId);
      if (filter?.status) {
        const arr = Array.isArray(filter.status) ? filter.status : [filter.status];
        p = p.filter((x) => arr.includes(x.status));
      }
      return [...p].sort((a, b) => {
        const tb = new Date(b.lastUpdated).getTime();
        const ta = new Date(a.lastUpdated).getTime();
        if (tb !== ta) return tb - ta;
        return b.id.localeCompare(a.id);
      });
    },
    getProject: (id: string) => read().projects.find((p) => p.id === id),
    saveProject: (p: Project) => {
      const d = read();
      const exists = d.projects.some((x) => x.id === p.id);
      write({ ...d, projects: exists ? d.projects.map((x) => (x.id === p.id ? p : x)) : [...d.projects, p] });
    },
    createProject: (input: Partial<Project> & { name: string; ippId: string; ippName: string; opportunityId: string }) => {
      const opp = db.getOpportunity(input.opportunityId);
      const p: Project = {
        id: uid("prj"),
        name: input.name,
        ippId: input.ippId,
        ippName: input.ippName,
        opportunityId: input.opportunityId,
        opportunityName: opp?.name ?? "Unknown",
        type: input.type ?? opp?.type ?? "Solar",
        capacityMW: input.capacityMW ?? 0,
        state: input.state ?? opp?.state ?? "",
        district: input.district ?? opp?.district ?? "",
        status: "Draft",
        stage: "Draft",
        slaStatus: "On Track",
        slaDueDate: daysFromNow(30),
        lastUpdated: new Date().toISOString(),
        documents: buildIppUploadChecklist(opp ?? ({} as Opportunity)).map((row) => ({
          id: uid("doc"),
          name: row.name,
          status: "Missing" as DocStatus,
          ippUploadSource: row.fromEligibility ? ("eligibility" as const) : ("scheme" as const),
          ippMandatory: row.mandatory,
        })),
        milestones: [],
        queries: [],
        workflow: [{ name: "Draft", role: "ipp", status: "current", assignee: input.ippName }],
        activity: [{ id: uid("act"), user: input.ippName, role: "ipp", action: "Created draft project", timestamp: new Date().toISOString() }],
      };
      db.saveProject(p);
      return p;
    },
    // Notifications
    listNotifications: (userId: string) => read().notifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    pushNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => {
      const d = read();
      const full: Notification = { ...n, id: uid("n"), createdAt: new Date().toISOString(), read: false };
      write({ ...d, notifications: [full, ...d.notifications] });
    },
    markNotificationRead: (id: string) => {
      const d = read();
      write({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
    },
  };
  
  // Session
  export const session = {
    get: (): User | null => {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      try { return JSON.parse(raw) as User; } catch { return null; }
    },
    set: (u: User | null) => {
      if (typeof window === "undefined") return;
      if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      else localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new Event("pmis:session-changed"));
    },
    login: (email: string, password: string): User => {
      const u = db.findUserByEmail(email);
      if (!u || u.password !== password) throw new Error("Invalid email or password");
      session.set(u);
      return u;
    },
    loginAs: (role: Role): User => {
      const map: Record<Role, string> = {
        ipp: "ipp@demo.com", officer: "officer@demo.com", approver: "approver@demo.com", admin: "admin@demo.com", management: "management@demo.com",
      };
      const u = db.findUserByEmail(map[role]);
      if (!u) throw new Error("Demo user missing");
      session.set(u);
      return u;
    },
    logout: () => session.set(null),
  };
  
  export function uidLib() { return uid(); }
  