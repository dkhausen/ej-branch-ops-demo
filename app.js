/* Branch Operations Portal (demo).
   Deposit/wire status + case follow-up. All data fictitious.
   State persists in localStorage so agent actions are live. */

const DEP_KEY = "jdf_deposits_v1";
const CASE_KEY = "jdf_cases_v1";

const TEAM = [
  { name: "Jane Doe", role: "Branch Ops Associate" },
  { name: "Priya Raman", role: "Deposit Operations" },
  { name: "Marcus Lee", role: "Deposit Operations" },
  { name: "Dana Cole", role: "Branch Ops Associate" },
  { name: "Tom Becker", role: "Deposit Operations" }
];
const ASSIGN_OPTIONS = ["Unassigned", "Deposit Operations", ...TEAM.map(t => t.name)];

const DEP_STATUSES = ["Received", "Processing", "Completed", "Rejected / Returned"];
const CASE_STATUSES = ["Open", "In Progress", "Resolved"];
const CASE_TYPES = ["Deposit rejected / returned", "Modify deposit", "Cancel deposit", "Expedite request", "Other"];
const PRIORITIES = ["Standard", "High", "Urgent"];

const DEP_SEED = [
  { id: "WT-100248", client: "R. Delgado", account: "8842-01", method: "ACH", amount: 12500, date: "Jul 14, 2026", lastUpdated: "Jul 15, 2026", status: "Processing", assignee: "Priya Raman",
    timeline: "ACH deposit — clears within 2 business days. Expected available Jul 16, 2026.",
    notes: [{ author: "Priya Raman", date: "Jul 15, 2026", text: "In processing queue. On track for standard clearing." }] },
  { id: "WT-100311", client: "M. Okafor", account: "3391-07", method: "Check", amount: 4200, date: "Jul 9, 2026", lastUpdated: "Jul 11, 2026", status: "Completed", assignee: "Marcus Lee",
    timeline: "Funds posted and available. No further action needed.",
    notes: [{ author: "Marcus Lee", date: "Jul 11, 2026", text: "Cleared and posted to client account." }] },
  { id: "WT-100355", client: "Hartwell Family Trust", account: "5017-22", method: "Wire", amount: 85000, date: "Jul 16, 2026", lastUpdated: "Jul 16, 2026", status: "Received", assignee: "Unassigned",
    timeline: "Wire received today and queued for processing. Standard timeline applies.",
    notes: [{ author: "System", date: "Jul 16, 2026", text: "Incoming wire received. Awaiting review." }] },
  { id: "WT-100199", client: "J. Castellano", account: "2245-88", method: "Check (out-of-state)", amount: 1750, date: "Jul 8, 2026", lastUpdated: "Jul 15, 2026", status: "Rejected / Returned", assignee: "Deposit Operations",
    timeline: "Deposit rejected/returned. Per OPS-TXN-022, do not speculate on the reason — route to Deposit Operations.",
    notes: [{ author: "System", date: "Jul 10, 2026", text: "Deposit returned by receiving institution." }] },
  { id: "WT-100402", client: "P. Nguyen", account: "6620-13", method: "Check (out-of-state)", amount: 9300, date: "Jul 15, 2026", lastUpdated: "Jul 15, 2026", status: "Processing", assignee: "Dana Cole",
    timeline: "Out-of-state check — may take up to 5 business days to clear. Expected available by Jul 22, 2026.",
    notes: [{ author: "Dana Cole", date: "Jul 15, 2026", text: "Out-of-state check, extended clearing window." }] },
  { id: "WT-100418", client: "K. Alvarez", account: "7788-04", method: "Wire", amount: 150000, date: "Jul 16, 2026", lastUpdated: "Jul 16, 2026", status: "Received", assignee: "Unassigned",
    timeline: "Wire received today and queued for processing.",
    notes: [{ author: "System", date: "Jul 16, 2026", text: "Incoming wire received. Awaiting review." }] },
  { id: "WT-100377", client: "D. Whitfield", account: "4410-19", method: "ACH", amount: 3600, date: "Jul 11, 2026", lastUpdated: "Jul 12, 2026", status: "Completed", assignee: "Tom Becker",
    timeline: "Funds posted and available. No further action needed.",
    notes: [{ author: "Tom Becker", date: "Jul 12, 2026", text: "ACH cleared on schedule." }] },
  { id: "WT-100205", client: "S. Park", account: "9021-33", method: "Wire (international)", amount: 220000, date: "Jul 7, 2026", lastUpdated: "Jul 14, 2026", status: "Processing", assignee: "Priya Raman",
    timeline: "International wire — additional review in progress. Timeline may extend.",
    notes: [{ author: "Priya Raman", date: "Jul 14, 2026", text: "International wire under compliance review." }] }
];

const CASE_SEED = [
  { id: "CASE-2601", account: "2245-88", reference: "WT-100199", type: "Deposit rejected / returned", priority: "High", status: "Open", opened: "Jul 15, 2026", lastUpdated: "Jul 15, 2026", assignee: "Deposit Operations",
    notes: [{ author: "Jane Doe", date: "Jul 15, 2026", text: "Branch reported returned check on account 2245-88. Routed to Deposit Operations for investigation." }] },
  { id: "CASE-2602", account: "9021-33", reference: "WT-100205", type: "Expedite request", priority: "Urgent", status: "In Progress", opened: "Jul 14, 2026", lastUpdated: "Jul 15, 2026", assignee: "Priya Raman",
    notes: [{ author: "Priya Raman", date: "Jul 15, 2026", text: "Client requests same-day processing on international wire. Reviewing eligibility." }] },
  { id: "CASE-2603", account: "8842-01", reference: "WT-100248", type: "Modify deposit", priority: "Standard", status: "Open", opened: "Jul 16, 2026", lastUpdated: "Jul 16, 2026", assignee: "Unassigned",
    notes: [{ author: "Jane Doe", date: "Jul 16, 2026", text: "Branch asked to update the deposit amount before it clears." }] },
  { id: "CASE-2604", account: "4410-19", reference: "WT-100377", type: "Other", priority: "Standard", status: "Resolved", opened: "Jul 12, 2026", lastUpdated: "Jul 12, 2026", assignee: "Tom Becker",
    notes: [{ author: "Tom Becker", date: "Jul 12, 2026", text: "Duplicate inquiry — no action required. Resolved." }] }
];

// ---- store ----
function load(key, seed) {
  try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch (e) {}
  localStorage.setItem(key, JSON.stringify(seed));
  return JSON.parse(JSON.stringify(seed));
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
const loadDeposits = () => load(DEP_KEY, DEP_SEED);
const loadCases = () => load(CASE_KEY, CASE_SEED);
function updateRecord(key, id, patch) {
  const all = load(key, key === DEP_KEY ? DEP_SEED : CASE_SEED);
  const r = all.find(x => x.id === id);
  if (!r) return;
  Object.assign(r, patch, { lastUpdated: todayLabel() });
  save(key, all);
}
function addNote(key, id, text) {
  const all = load(key, key === DEP_KEY ? DEP_SEED : CASE_SEED);
  const r = all.find(x => x.id === id);
  if (!r) return;
  r.notes = r.notes.concat([{ author: "Jane Doe", date: todayLabel(), text }]);
  r.lastUpdated = todayLabel();
  save(key, all);
}

// ---- helpers ----
const view = document.getElementById("view");
const money = n => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const initials = name => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const badgeClass = status => "b-" + status.replace(/[^a-z0-9]/gi, "");
const todayLabel = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const setActiveNav = route => document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.route === route));

function statCard(label, value, iconPaths) {
  return `<div class="stat">
    <div class="stat-top"><span class="stat-label">${label}</span>
      <span class="stat-ic"><svg viewBox="0 0 24 24">${iconPaths}</svg></span></div>
    <div class="stat-value">${value}</div>
  </div>`;
}
function assigneeCell(name) {
  return name === "Unassigned"
    ? `<span class="italic">Unassigned</span>`
    : `<span class="assignee-cell"><span class="mini-avatar">${initials(name)}</span>${esc(name)}</span>`;
}
const ICON = {
  deposits: '<path d="M3 7h14l-3-3M21 17H7l3 3" stroke-linecap="round" stroke-linejoin="round"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/>',
  dollar: '<path d="M12 3v18"/><path d="M16 7.5c0-1.7-1.8-2.5-4-2.5s-4 .9-4 2.6c0 3.9 8 2 8 5.9 0 1.7-1.8 2.6-4 2.6s-4-.9-4-2.6"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
};

// ================= DASHBOARD =================
function renderDashboard() {
  setActiveNav("dashboard");
  const deps = loadDeposits();
  const cases = loadCases();
  const processing = deps.filter(d => d.status === "Processing").length;
  const openCases = cases.filter(c => c.status !== "Resolved").length;
  const totalValue = deps.reduce((s, d) => s + d.amount, 0);

  view.innerHTML = `
    <h1 class="page-title">Branch Operations Support</h1>
    <p class="page-sub">Deposit &amp; wire status and case follow-up at a glance.</p>
    <div class="stats">
      ${statCard("Total Deposits", deps.length, ICON.deposits)}
      ${statCard("Processing", processing, ICON.clock)}
      ${statCard("Open Cases", openCases, ICON.folder)}
      ${statCard("Total Value", money(totalValue), ICON.dollar)}
    </div>

    <div class="card" style="margin-bottom:22px">
      <div class="claims-head"><h2>Recent Deposits</h2><a href="#/deposits" class="claim-id" style="font-size:13px;font-weight:600">View all &rarr;</a></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Reference #</th><th>Client / Account</th><th>Method</th><th>Status</th><th>Amount</th><th>Assignee</th></tr></thead>
          <tbody>${deps.slice(0, 5).map(depositRow).join("")}</tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="claims-head"><h2>Open Cases</h2><a href="#/cases" class="claim-id" style="font-size:13px;font-weight:600">View all &rarr;</a></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Case ID</th><th>Account</th><th>Type</th><th>Priority</th><th>Status</th><th>Assignee</th></tr></thead>
          <tbody>${cases.filter(c => c.status !== "Resolved").map(caseRow).join("")}</tbody>
        </table>
      </div>
    </div>`;
  wireRowClicks();
}

// ================= DEPOSITS LIST =================
let depFilter = "All";
const DEP_FILTER_MAP = { All: null, Received: "Received", Processing: "Processing", Completed: "Completed", Returned: "Rejected / Returned" };

function depositRow(d) {
  return `<tr data-nav="#/deposits/${d.id}">
    <td><span class="claim-id">${d.id}</span></td>
    <td>${esc(d.client)}<div class="muted" style="font-size:12px">${d.account}</div></td>
    <td>${esc(d.method)}</td>
    <td><span class="badge ${badgeClass(d.status)}">${d.status}</span></td>
    <td>${money(d.amount)}</td>
    <td>${assigneeCell(d.assignee)}</td>
  </tr>`;
}

function renderDeposits() {
  setActiveNav("deposits");
  view.innerHTML = `
    <h1 class="page-title">Deposits &amp; Wires</h1>
    <p class="page-sub">Check the status of client deposits, checks, and wire transfers.</p>
    <div class="card">
      <div class="claims-head">
        <h2>All Deposits</h2>
        <div class="filters">
          ${Object.keys(DEP_FILTER_MAP).map(f => `<button class="filter ${f === depFilter ? "active" : ""}" data-filter="${f}">${f}</button>`).join("")}
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Reference #</th><th>Client / Account</th><th>Method</th><th>Status</th><th>Amount</th><th>Deposit Date</th><th>Assignee</th></tr></thead>
          <tbody id="dep-body"></tbody>
        </table>
      </div>
    </div>`;
  view.querySelectorAll(".filter").forEach(b => b.addEventListener("click", () => {
    depFilter = b.dataset.filter;
    view.querySelectorAll(".filter").forEach(x => x.classList.toggle("active", x === b));
    renderDepRows();
  }));
  renderDepRows();
}
function renderDepRows() {
  const wanted = DEP_FILTER_MAP[depFilter];
  const deps = loadDeposits().filter(d => !wanted || d.status === wanted);
  const body = document.getElementById("dep-body");
  body.innerHTML = deps.length
    ? deps.map(d => `<tr data-nav="#/deposits/${d.id}">
        <td><span class="claim-id">${d.id}</span></td>
        <td>${esc(d.client)}<div class="muted" style="font-size:12px">${d.account}</div></td>
        <td>${esc(d.method)}</td>
        <td><span class="badge ${badgeClass(d.status)}">${d.status}</span></td>
        <td>${money(d.amount)}</td>
        <td class="muted">${d.date}</td>
        <td>${assigneeCell(d.assignee)}</td>
      </tr>`).join("")
    : `<tr><td colspan="7" class="muted" style="text-align:center;padding:28px;">No deposits in this view.</td></tr>`;
  wireRowClicks();
}

// ================= DEPOSIT DETAIL =================
function renderDepositDetail(id) {
  setActiveNav("deposits");
  const d = loadDeposits().find(x => x.id === id);
  if (!d) return notFound("deposit", "#/deposits");
  const isCompleted = d.status === "Completed";
  const routed = d.assignee === "Deposit Operations";

  view.innerHTML = `
    <div class="detail-top">
      <div>
        <div class="detail-title-row">
          <a href="#/deposits" class="back-btn" title="Back">&larr;</a>
          <h1 class="detail-h1">Deposit ${d.id} <span class="badge ${badgeClass(d.status)}">${d.status}</span></h1>
        </div>
        <p class="detail-sub">Deposited on ${d.date} &middot; Procedure OPS-TXN-022</p>
      </div>
      <div class="detail-actions">
        <button class="btn btn-approve" id="btn-complete" ${isCompleted ? "disabled" : ""}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg> Mark Completed
        </button>
        <button class="btn btn-deny" id="btn-route" ${routed ? "disabled" : ""}>
          <svg viewBox="0 0 24 24"><path d="M4 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg> Route to Deposit Ops
        </button>
      </div>
    </div>

    <div class="detail-grid">
      <div class="stack">
        <div class="card card-pad">
          <h2 class="card-title"><svg viewBox="0 0 24 24">${ICON.deposits}</svg> Transaction Details</h2>
          <div class="kv-grid">
            <div><div class="kv-label">Client Name</div><div class="kv-value">${esc(d.client)}</div></div>
            <div><div class="kv-label">Amount</div><div class="kv-value">${money(d.amount)}</div></div>
            <div><div class="kv-label">Client Account</div><div class="kv-value">${esc(d.account)}</div></div>
            <div><div class="kv-label">Method</div><div class="kv-value">${esc(d.method)}</div></div>
            <div><div class="kv-label">Reference #</div><div class="kv-value">${d.id}</div></div>
            <div><div class="kv-label">Last Updated</div><div class="kv-value">${d.lastUpdated}</div></div>
          </div>
        </div>
        <div class="card card-pad">
          <h2 class="card-title">Processing Timeline</h2>
          <div class="placeholder-box">${esc(d.timeline)}</div>
        </div>
      </div>

      <div class="stack">
        <div class="card card-pad">
          <h2 class="card-title">Management</h2>
          <div class="field"><label for="sel-status">Status</label>
            <select id="sel-status">${DEP_STATUSES.map(s => `<option ${s === d.status ? "selected" : ""}>${s}</option>`).join("")}</select></div>
          <div class="field"><label for="sel-assignee">Assigned To</label>
            <select id="sel-assignee">${ASSIGN_OPTIONS.map(a => `<option ${a === d.assignee ? "selected" : ""}>${a}</option>`).join("")}</select></div>
        </div>
        <div class="card card-pad">
          <h2 class="card-title"><svg viewBox="0 0 24 24">${ICON.clock}</svg> Activity &amp; Notes</h2>
          <div id="notes-list">${renderNotes(d.notes)}</div>
          <div class="add-note">
            <div class="field"><textarea id="note-input" rows="3" placeholder="Add a note or update..."></textarea></div>
            <button class="btn btn-primary" id="btn-add-note">
              <svg viewBox="0 0 24 24"><path d="M4 12l16-7-7 16-2-7z"/></svg> Add Note
            </button>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("sel-status").addEventListener("change", e => { updateRecord(DEP_KEY, id, { status: e.target.value }); renderDepositDetail(id); });
  document.getElementById("sel-assignee").addEventListener("change", e => { updateRecord(DEP_KEY, id, { assignee: e.target.value }); renderDepositDetail(id); });
  document.getElementById("btn-complete").addEventListener("click", () => { if (isCompleted) return; updateRecord(DEP_KEY, id, { status: "Completed" }); addNote(DEP_KEY, id, "Marked completed by Jane Doe."); renderDepositDetail(id); });
  document.getElementById("btn-route").addEventListener("click", () => { if (routed) return; updateRecord(DEP_KEY, id, { assignee: "Deposit Operations" }); addNote(DEP_KEY, id, "Routed to Deposit Operations for follow-up."); renderDepositDetail(id); });
  bindAddNote(DEP_KEY, id, renderDepositDetail);
}

// ================= CASES LIST =================
let caseFilter = "All";
const CASE_FILTER_MAP = { All: null, Open: "Open", "In Progress": "In Progress", Resolved: "Resolved" };

function caseRow(c) {
  return `<tr data-nav="#/cases/${c.id}">
    <td><span class="claim-id">${c.id}</span></td>
    <td>${esc(c.account)}</td>
    <td>${esc(c.type)}</td>
    <td class="pri-${c.priority}">${c.priority}</td>
    <td><span class="badge ${badgeClass(c.status)}">${c.status}</span></td>
    <td>${assigneeCell(c.assignee)}</td>
  </tr>`;
}

function renderCases() {
  setActiveNav("cases");
  view.innerHTML = `
    <h1 class="page-title">Cases</h1>
    <p class="page-sub">Open and track follow-up cases for Deposit Operations.</p>
    <div class="card">
      <div class="claims-head">
        <h2>All Cases</h2>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <div class="filters">
            ${Object.keys(CASE_FILTER_MAP).map(f => `<button class="filter ${f === caseFilter ? "active" : ""}" data-filter="${f}">${f}</button>`).join("")}
          </div>
          <a href="#/cases/new" class="btn btn-primary btn-inline">+ New Case</a>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Case ID</th><th>Account</th><th>Type</th><th>Priority</th><th>Status</th><th>Opened</th><th>Assignee</th></tr></thead>
          <tbody id="case-body"></tbody>
        </table>
      </div>
    </div>`;
  view.querySelectorAll(".filter").forEach(b => b.addEventListener("click", () => {
    caseFilter = b.dataset.filter;
    view.querySelectorAll(".filter").forEach(x => x.classList.toggle("active", x === b));
    renderCaseRows();
  }));
  renderCaseRows();
}
function renderCaseRows() {
  const wanted = CASE_FILTER_MAP[caseFilter];
  const cases = loadCases().filter(c => !wanted || c.status === wanted);
  const body = document.getElementById("case-body");
  body.innerHTML = cases.length
    ? cases.map(c => `<tr data-nav="#/cases/${c.id}">
        <td><span class="claim-id">${c.id}</span></td>
        <td>${esc(c.account)}</td>
        <td>${esc(c.type)}</td>
        <td class="pri-${c.priority}">${c.priority}</td>
        <td><span class="badge ${badgeClass(c.status)}">${c.status}</span></td>
        <td class="muted">${c.opened}</td>
        <td>${assigneeCell(c.assignee)}</td>
      </tr>`).join("")
    : `<tr><td colspan="7" class="muted" style="text-align:center;padding:28px;">No cases in this view.</td></tr>`;
  wireRowClicks();
}

// ================= NEW CASE =================
function nextCaseId() {
  const cases = loadCases();
  const max = cases.reduce((m, c) => Math.max(m, parseInt(c.id.replace(/\D/g, ""), 10) || 0), 2600);
  return "CASE-" + (max + 1);
}
function renderNewCase() {
  setActiveNav("cases");
  view.innerHTML = `
    <div class="detail-title-row" style="margin-bottom:6px">
      <a href="#/cases" class="back-btn" title="Back">&larr;</a>
      <h1 class="detail-h1">New Case</h1>
    </div>
    <p class="page-sub" style="margin-left:54px">Open a follow-up case for Deposit Operations.</p>
    <div class="card card-pad form-view">
      <div class="field"><label for="nc-account">Client Account Number <span class="req">*</span></label>
        <input id="nc-account" placeholder="e.g. 8842-01" /></div>
      <div class="field"><label for="nc-ref">Related Reference Number</label>
        <input id="nc-ref" placeholder="e.g. WT-100248" /></div>
      <div class="field"><label for="nc-type">Case Type <span class="req">*</span></label>
        <select id="nc-type">${CASE_TYPES.map(t => `<option>${t}</option>`).join("")}</select></div>
      <div class="field"><label for="nc-priority">Priority</label>
        <select id="nc-priority">${PRIORITIES.map(p => `<option>${p}</option>`).join("")}</select></div>
      <div class="field"><label for="nc-notes">Notes for Deposit Operations</label>
        <textarea id="nc-notes" rows="3" placeholder="Describe the issue and any client-provided details..."></textarea></div>
      <div id="nc-error" class="muted" style="color:var(--red);margin-bottom:10px;display:none">Client account number is required.</div>
      <div class="form-actions">
        <button class="btn btn-primary" id="nc-create">Create Case</button>
        <a href="#/cases" class="btn">Cancel</a>
      </div>
    </div>`;
  document.getElementById("nc-create").addEventListener("click", () => {
    const account = document.getElementById("nc-account").value.trim();
    if (!account) { document.getElementById("nc-error").style.display = "block"; return; }
    const cases = loadCases();
    const id = nextCaseId();
    const notes = [];
    const noteText = document.getElementById("nc-notes").value.trim();
    if (noteText) notes.push({ author: "Jane Doe", date: todayLabel(), text: noteText });
    cases.unshift({
      id, account,
      reference: document.getElementById("nc-ref").value.trim() || "—",
      type: document.getElementById("nc-type").value,
      priority: document.getElementById("nc-priority").value,
      status: "Open", opened: todayLabel(), lastUpdated: todayLabel(),
      assignee: "Unassigned", notes
    });
    save(CASE_KEY, cases);
    location.hash = "#/cases/" + id;
  });
}

// ================= CASE DETAIL =================
function renderCaseDetail(id) {
  setActiveNav("cases");
  const c = loadCases().find(x => x.id === id);
  if (!c) return notFound("case", "#/cases");
  const resolved = c.status === "Resolved";
  const urgent = c.priority === "Urgent";

  view.innerHTML = `
    <div class="detail-top">
      <div>
        <div class="detail-title-row">
          <a href="#/cases" class="back-btn" title="Back">&larr;</a>
          <h1 class="detail-h1">${c.id} <span class="badge ${badgeClass(c.status)}">${c.status}</span></h1>
        </div>
        <p class="detail-sub">Opened on ${c.opened} &middot; ${esc(c.type)}</p>
      </div>
      <div class="detail-actions">
        <button class="btn btn-approve" id="btn-resolve" ${resolved ? "disabled" : ""}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg> Mark Resolved
        </button>
        <button class="btn btn-deny" id="btn-escalate" ${urgent ? "disabled" : ""}>
          <svg viewBox="0 0 24 24"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg> Escalate
        </button>
      </div>
    </div>

    <div class="detail-grid">
      <div class="stack">
        <div class="card card-pad">
          <h2 class="card-title"><svg viewBox="0 0 24 24">${ICON.folder}</svg> Case Details</h2>
          <div class="kv-grid">
            <div><div class="kv-label">Client Account</div><div class="kv-value">${esc(c.account)}</div></div>
            <div><div class="kv-label">Related Reference</div><div class="kv-value">${esc(c.reference)}</div></div>
            <div><div class="kv-label">Case Type</div><div class="kv-value">${esc(c.type)}</div></div>
            <div><div class="kv-label">Priority</div><div class="kv-value pri-${c.priority}">${c.priority}</div></div>
            <div><div class="kv-label">Opened</div><div class="kv-value">${c.opened}</div></div>
            <div><div class="kv-label">Last Updated</div><div class="kv-value">${c.lastUpdated}</div></div>
          </div>
        </div>
      </div>

      <div class="stack">
        <div class="card card-pad">
          <h2 class="card-title">Management</h2>
          <div class="field"><label for="sel-status">Status</label>
            <select id="sel-status">${CASE_STATUSES.map(s => `<option ${s === c.status ? "selected" : ""}>${s}</option>`).join("")}</select></div>
          <div class="field"><label for="sel-priority">Priority</label>
            <select id="sel-priority">${PRIORITIES.map(p => `<option ${p === c.priority ? "selected" : ""}>${p}</option>`).join("")}</select></div>
          <div class="field"><label for="sel-assignee">Assigned To</label>
            <select id="sel-assignee">${ASSIGN_OPTIONS.map(a => `<option ${a === c.assignee ? "selected" : ""}>${a}</option>`).join("")}</select></div>
        </div>
        <div class="card card-pad">
          <h2 class="card-title"><svg viewBox="0 0 24 24">${ICON.clock}</svg> Activity &amp; Notes</h2>
          <div id="notes-list">${renderNotes(c.notes)}</div>
          <div class="add-note">
            <div class="field"><textarea id="note-input" rows="3" placeholder="Add a note or update..."></textarea></div>
            <button class="btn btn-primary" id="btn-add-note">
              <svg viewBox="0 0 24 24"><path d="M4 12l16-7-7 16-2-7z"/></svg> Add Note
            </button>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("sel-status").addEventListener("change", e => { updateRecord(CASE_KEY, id, { status: e.target.value }); renderCaseDetail(id); });
  document.getElementById("sel-priority").addEventListener("change", e => { updateRecord(CASE_KEY, id, { priority: e.target.value }); renderCaseDetail(id); });
  document.getElementById("sel-assignee").addEventListener("change", e => { updateRecord(CASE_KEY, id, { assignee: e.target.value }); renderCaseDetail(id); });
  document.getElementById("btn-resolve").addEventListener("click", () => { if (resolved) return; updateRecord(CASE_KEY, id, { status: "Resolved" }); addNote(CASE_KEY, id, "Case marked resolved by Jane Doe."); renderCaseDetail(id); });
  document.getElementById("btn-escalate").addEventListener("click", () => { if (urgent) return; updateRecord(CASE_KEY, id, { priority: "Urgent" }); addNote(CASE_KEY, id, "Case escalated to Urgent priority."); renderCaseDetail(id); });
  bindAddNote(CASE_KEY, id, renderCaseDetail);
}

// ================= TEAM =================
function renderTeam() {
  setActiveNav("team");
  const deps = loadDeposits();
  const cases = loadCases();
  view.innerHTML = `
    <h1 class="page-title">Team</h1>
    <p class="page-sub">Branch operations and deposit operations staff, with current open workload.</p>
    <div class="adj-grid">
      ${TEAM.map(t => {
        const load = deps.filter(d => d.assignee === t.name && d.status !== "Completed").length
                   + cases.filter(c => c.assignee === t.name && c.status !== "Resolved").length;
        return `<div class="card adj-card">
          <div class="avatar">${initials(t.name)}</div>
          <div><div class="adj-name">${esc(t.name)}</div><div class="adj-role">${esc(t.role)}</div></div>
          <div class="adj-count"><div class="n">${load}</div><div class="l">OPEN</div></div>
        </div>`;
      }).join("")}
    </div>`;
}

// ---- shared ----
function renderNotes(notes) {
  if (!notes || !notes.length) return `<div class="notes-empty">No activity yet.</div>`;
  return notes.map(n => `
    <div class="note">
      <div class="mini-avatar">${initials(n.author)}</div>
      <div class="note-body">
        <div class="note-meta"><span class="n-author">${esc(n.author)}</span><span class="n-date">${n.date}</span></div>
        <div class="note-bubble">${esc(n.text)}</div>
      </div>
    </div>`).join("");
}
function bindAddNote(key, id, rerender) {
  document.getElementById("btn-add-note").addEventListener("click", () => {
    const input = document.getElementById("note-input");
    const text = input.value.trim();
    if (!text) return;
    addNote(key, id, text);
    rerender(id);
  });
}
function wireRowClicks() {
  document.querySelectorAll("tr[data-nav]").forEach(tr =>
    tr.addEventListener("click", () => { location.hash = tr.dataset.nav; }));
}
function notFound(kind, back) {
  view.innerHTML = `<p style="padding:20px">That ${kind} was not found. <a href="${back}" class="claim-id">Go back</a></p>`;
}

// ---- Router ----
function router() {
  const hash = location.hash || "#/dashboard";
  const dep = hash.match(/^#\/deposits\/(.+)$/);
  if (dep) return renderDepositDetail(decodeURIComponent(dep[1]));
  if (hash === "#/cases/new") return renderNewCase();
  const cs = hash.match(/^#\/cases\/(.+)$/);
  if (cs) return renderCaseDetail(decodeURIComponent(cs[1]));
  if (hash.startsWith("#/deposits")) return renderDeposits();
  if (hash.startsWith("#/cases")) return renderCases();
  if (hash.startsWith("#/team")) return renderTeam();
  return renderDashboard();
}
window.addEventListener("hashchange", router);
if (!location.hash) location.hash = "#/dashboard";
router();
