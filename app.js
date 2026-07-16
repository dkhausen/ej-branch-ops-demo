/* John Doe Financial — Claims management demo.
   All data fictitious. State persists in localStorage so agent actions are live. */

const STORE_KEY = "jdf_claims_v3";

const ADJUSTERS = [
  { name: "Jane Doe", role: "Senior Adjuster" },
  { name: "Linda Castillo", role: "Claims Adjuster" },
  { name: "Derek Okafor", role: "Claims Adjuster" },
  { name: "James Hargrove", role: "Claims Adjuster" },
  { name: "Sarah Mitchell", role: "Claims Adjuster" }
];

const SEED = [
  { id: "LF-2026-004703", claimant: "Diane Kowalski", type: "Annuity", status: "Pending", amount: 125000, submitted: "Jun 24, 2026", lastUpdated: "Jun 28, 2026", policy: "POL-29105-A", assignee: "Unassigned",
    notes: [{ author: "System", date: "Jun 24, 2026", text: "Claim submitted via online portal. Awaiting adjuster assignment." }] },
  { id: "LF-2026-004812", claimant: "Harold Jensen", type: "Other", status: "Pending", amount: 8200, submitted: "Jun 27, 2026", lastUpdated: "Jul 1, 2026", policy: "POL-31450-G", assignee: "Unassigned",
    notes: [{ author: "Jane Doe", date: "Jul 1, 2026", text: "Harold was injured in a workplace accident" }] },
  { id: "LF-2026-004796", claimant: "Angela Torres", type: "Disability", status: "Pending", amount: 48000, submitted: "Jun 22, 2026", lastUpdated: "Jun 30, 2026", policy: "POL-30877-D", assignee: "Linda Castillo",
    notes: [{ author: "Linda Castillo", date: "Jun 30, 2026", text: "Requested medical documentation from provider." }] },
  { id: "LF-2026-004751", claimant: "Marcus Greene", type: "Accident", status: "Approved", amount: 15750, submitted: "Jun 1, 2026", lastUpdated: "Jun 12, 2026", policy: "POL-28640-C", assignee: "Derek Okafor",
    notes: [{ author: "Derek Okafor", date: "Jun 12, 2026", text: "Documentation verified. Approved for payout." }] },
  { id: "LF-2026-004778", claimant: "Carmen Rivera", type: "Accident", status: "Denied", amount: 22500, submitted: "Jun 17, 2026", lastUpdated: "Jun 25, 2026", policy: "POL-30012-C", assignee: "James Hargrove",
    notes: [{ author: "James Hargrove", date: "Jun 25, 2026", text: "Incident falls outside policy coverage window." }] },
  { id: "LF-2026-004680", claimant: "Steven Park", type: "Life", status: "Denied", amount: 500000, submitted: "May 28, 2026", lastUpdated: "Jun 8, 2026", policy: "POL-27333-L", assignee: "Linda Castillo",
    notes: [{ author: "Linda Castillo", date: "Jun 8, 2026", text: "Policy lapsed prior to date of claim." }] },
  { id: "LF-2026-004821", claimant: "Robert Whitfield", type: "Life", status: "In Review", amount: 250000, submitted: "Jun 10, 2026", lastUpdated: "Jun 29, 2026", policy: "POL-31002-L", assignee: "Sarah Mitchell",
    notes: [{ author: "Sarah Mitchell", date: "Jun 29, 2026", text: "Beneficiary verification in progress." }] },
  { id: "LF-2026-004655", claimant: "Natalie Brooks", type: "Disability", status: "Closed", amount: 36000, submitted: "May 15, 2026", lastUpdated: "Jun 2, 2026", policy: "POL-26890-D", assignee: "Derek Okafor",
    notes: [{ author: "Derek Okafor", date: "Jun 2, 2026", text: "Claim paid and closed." }] }
];

const STATUSES = ["Pending", "In Review", "Approved", "Denied", "Closed"];

// ---- store ----
function loadClaims() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORE_KEY, JSON.stringify(SEED));
  return JSON.parse(JSON.stringify(SEED));
}
function saveClaims(claims) { localStorage.setItem(STORE_KEY, JSON.stringify(claims)); }
function getClaim(id) { return loadClaims().find(c => c.id === id); }
function updateClaim(id, patch) {
  const claims = loadClaims();
  const c = claims.find(x => x.id === id);
  if (!c) return;
  Object.assign(c, patch, { lastUpdated: todayLabel() });
  saveClaims(claims);
}

// ---- helpers ----
const view = document.getElementById("view");
function money(n) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function initials(name) { return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(); }
function badgeClass(status) { return "b-" + status.replace(/\s+/g, ""); }
function todayLabel() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function setActiveNav(route) {
  document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.route === route));
}

// ---- Overview ----
let currentFilter = "All";
const FILTER_MAP = { All: null, Pending: "Pending", Review: "In Review", Apprv: "Approved", Denied: "Denied" };

function renderOverview() {
  setActiveNav(location.hash.includes("dashboard") ? "dashboard" : "claims");
  const claims = loadClaims();
  const total = claims.length;
  const inReview = claims.filter(c => c.status === "In Review").length;
  const pending = claims.filter(c => c.status === "Pending").length;
  const totalValue = claims.reduce((s, c) => s + c.amount, 0);

  view.innerHTML = `
    <h1 class="page-title">Claims Overview</h1>
    <p class="page-sub">Monitor and process pending life and disability claims.</p>

    <div class="stats">
      ${statCard("Total Claims", total, '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>')}
      ${statCard("In Review", inReview, '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}
      ${statCard("Pending Attention", pending, '<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/>')}
      ${statCard("Value In Review", money(totalValue), '<path d="M12 3v18"/><path d="M16 7.5c0-1.7-1.8-2.5-4-2.5s-4 .9-4 2.6c0 3.9 8 2 8 5.9 0 1.7-1.8 2.6-4 2.6s-4-.9-4-2.6"/>')}
    </div>

    <div class="card">
      <div class="claims-head">
        <h2>Active Claims</h2>
        <div class="filters">
          ${Object.keys(FILTER_MAP).map(f => `<button class="filter ${f === currentFilter ? "active" : ""}" data-filter="${f}">${f}</button>`).join("")}
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Claim #</th><th>Claimant</th><th>Type</th><th>Status</th><th>Amount</th><th>Submitted</th><th>Assignee</th>
          </tr></thead>
          <tbody id="claims-body"></tbody>
        </table>
      </div>
    </div>`;

  view.querySelectorAll(".filter").forEach(b => b.addEventListener("click", () => {
    currentFilter = b.dataset.filter;
    view.querySelectorAll(".filter").forEach(x => x.classList.toggle("active", x === b));
    renderRows();
  }));
  renderRows();
}

function statCard(label, value, iconPaths) {
  return `<div class="stat">
    <div class="stat-top">
      <span class="stat-label">${label}</span>
      <span class="stat-ic"><svg viewBox="0 0 24 24">${iconPaths}</svg></span>
    </div>
    <div class="stat-value">${value}</div>
  </div>`;
}

function renderRows() {
  const wanted = FILTER_MAP[currentFilter];
  const claims = loadClaims().filter(c => !wanted || c.status === wanted);
  const body = document.getElementById("claims-body");
  if (!claims.length) {
    body.innerHTML = `<tr><td colspan="7" class="muted" style="text-align:center;padding:28px;">No claims in this view.</td></tr>`;
    return;
  }
  body.innerHTML = claims.map(c => `
    <tr data-id="${c.id}">
      <td><span class="claim-id">${c.id}</span></td>
      <td>${esc(c.claimant)}</td>
      <td>${esc(c.type)}</td>
      <td><span class="badge ${badgeClass(c.status)}">${c.status}</span></td>
      <td>${money(c.amount)}</td>
      <td class="muted">${c.submitted}</td>
      <td>${c.assignee === "Unassigned"
        ? `<span class="italic">Unassigned</span>`
        : `<span class="assignee-cell"><span class="mini-avatar">${initials(c.assignee)}</span>${esc(c.assignee)}</span>`}</td>
    </tr>`).join("");
  body.querySelectorAll("tr[data-id]").forEach(tr =>
    tr.addEventListener("click", () => { location.hash = "#/claims/" + tr.dataset.id; }));
}

// ---- Detail ----
function renderDetail(id) {
  setActiveNav("claims");
  const c = getClaim(id);
  if (!c) { view.innerHTML = `<p>Claim not found. <a href="#/claims" class="claim-id">Back to claims</a></p>`; return; }
  const decided = c.status === "Approved" || c.status === "Denied";

  view.innerHTML = `
    <div class="detail-top">
      <div>
        <div class="detail-title-row">
          <a href="#/claims" class="back-btn" title="Back">&larr;</a>
          <h1 class="detail-h1">Claim ${c.id} <span class="badge ${badgeClass(c.status)}">${c.status}</span></h1>
        </div>
        <p class="detail-sub">Submitted on ${c.submitted}</p>
      </div>
      <div class="detail-actions">
        <button class="btn btn-approve" id="btn-approve" ${decided ? "disabled" : ""}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg> Approve
        </button>
        <button class="btn btn-deny" id="btn-deny" ${decided ? "disabled" : ""}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg> Deny
        </button>
      </div>
    </div>

    <div class="detail-grid">
      <div class="stack">
        <div class="card card-pad">
          <h2 class="card-title"><svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg> Claim Details</h2>
          <div class="kv-grid">
            <div><div class="kv-label">Claimant Name</div><div class="kv-value">${esc(c.claimant)}</div></div>
            <div><div class="kv-label">Claim Amount</div><div class="kv-value">${money(c.amount)}</div></div>
            <div><div class="kv-label">Claim Type</div><div class="kv-value">${esc(c.type)}</div></div>
            <div><div class="kv-label">Policy Number</div><div class="kv-value">${esc(c.policy)}</div></div>
            <div><div class="kv-label">Last Updated</div><div class="kv-value">${c.lastUpdated}</div></div>
          </div>
        </div>
        <div class="card card-pad">
          <h2 class="card-title">Policy Information</h2>
          <div class="placeholder-box">Additional policy details and historical documents would appear here in the full system integration.</div>
        </div>
      </div>

      <div class="stack">
        <div class="card card-pad">
          <h2 class="card-title">Management</h2>
          <div class="field">
            <label for="sel-status">Status</label>
            <select id="sel-status">
              ${STATUSES.map(s => `<option ${s === c.status ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="sel-assignee">Assigned To</label>
            <select id="sel-assignee">
              <option ${c.assignee === "Unassigned" ? "selected" : ""}>Unassigned</option>
              ${ADJUSTERS.map(a => `<option ${a.name === c.assignee ? "selected" : ""}>${a.name}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="card card-pad">
          <h2 class="card-title"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Activity &amp; Notes</h2>
          <div id="notes-list">${renderNotes(c.notes)}</div>
          <div class="add-note">
            <div class="field">
              <textarea id="note-input" rows="3" placeholder="Add a note or update..."></textarea>
            </div>
            <button class="btn btn-primary" id="btn-add-note">
              <svg viewBox="0 0 24 24"><path d="M4 12l16-7-7 16-2-7z"/></svg> Add Note
            </button>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("sel-status").addEventListener("change", e => {
    updateClaim(id, { status: e.target.value }); renderDetail(id);
  });
  document.getElementById("sel-assignee").addEventListener("change", e => {
    updateClaim(id, { assignee: e.target.value }); renderDetail(id);
  });
  document.getElementById("btn-approve").addEventListener("click", () => {
    if (decided) return; updateClaim(id, { status: "Approved" }); renderDetail(id);
  });
  document.getElementById("btn-deny").addEventListener("click", () => {
    if (decided) return; updateClaim(id, { status: "Denied" }); renderDetail(id);
  });
  document.getElementById("btn-add-note").addEventListener("click", () => {
    const input = document.getElementById("note-input");
    const text = input.value.trim();
    if (!text) return;
    const claim = getClaim(id);
    const notes = claim.notes.concat([{ author: "Jane Doe", date: todayLabel(), text }]);
    updateClaim(id, { notes });
    renderDetail(id);
  });
}

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

// ---- Adjusters ----
function renderAdjusters() {
  setActiveNav("adjusters");
  const claims = loadClaims();
  view.innerHTML = `
    <h1 class="page-title">Adjusters</h1>
    <p class="page-sub">Claims team and current caseloads.</p>
    <div class="adj-grid">
      ${ADJUSTERS.map(a => {
        const load = claims.filter(c => c.assignee === a.name && c.status !== "Closed").length;
        return `<div class="card adj-card">
          <div class="avatar">${initials(a.name)}</div>
          <div>
            <div class="adj-name">${esc(a.name)}</div>
            <div class="adj-role">${esc(a.role)}</div>
          </div>
          <div class="adj-count"><div class="n">${load}</div><div class="l">OPEN</div></div>
        </div>`;
      }).join("")}
    </div>`;
}

// ---- Router ----
function router() {
  const hash = location.hash || "#/claims";
  const detailMatch = hash.match(/^#\/claims\/(.+)$/);
  if (detailMatch) return renderDetail(decodeURIComponent(detailMatch[1]));
  if (hash.startsWith("#/adjusters")) return renderAdjusters();
  return renderOverview();
}
window.addEventListener("hashchange", router);
if (!location.hash) location.hash = "#/claims";
router();
