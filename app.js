/* Branch Operations Support — demo tool.
   All data is fictitious. Deposits are seeded below; cases persist in localStorage. */

// ---- Seeded mock deposits ----
const DEPOSITS = [
  {
    account: "8842-01", reference: "WT-100248", client: "R. Delgado",
    method: "ACH", amount: "$12,500.00", date: "2026-07-14",
    status: "Processing", statusClass: "st-processing",
    note: "ACH deposits clear within 2 business days. Expected available 2026-07-16."
  },
  {
    account: "3391-07", reference: "WT-100311", client: "M. Okafor",
    method: "Check", amount: "$4,200.00", date: "2026-07-09",
    status: "Completed", statusClass: "st-completed",
    note: "Funds posted and available. No further action needed."
  },
  {
    account: "5017-22", reference: "WT-100355", client: "The Hartwell Trust",
    method: "Wire", amount: "$85,000.00", date: "2026-07-16",
    status: "Received", statusClass: "st-received",
    note: "Wire received today and queued for processing. Standard timeline applies."
  },
  {
    account: "2245-88", reference: "WT-100199", client: "J. Castellano",
    method: "Check (out-of-state)", amount: "$1,750.00", date: "2026-07-08",
    status: "Rejected / Returned", statusClass: "st-rejected",
    route: true,
    note: "This deposit was rejected/returned. Per OPS-TXN-022, do not speculate on the reason — route to Deposit Operations."
  },
  {
    account: "6620-13", reference: "WT-100402", client: "P. Nguyen",
    method: "Check (out-of-state)", amount: "$9,300.00", date: "2026-07-15",
    status: "Processing", statusClass: "st-processing",
    note: "Out-of-state checks may take up to 5 business days to clear. Expected available by 2026-07-22."
  }
];

// ---- Tabs ----
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".panel").forEach(p => {
      p.classList.remove("active");
      p.hidden = true;
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    const panel = document.getElementById(tab.dataset.panel);
    panel.classList.add("active");
    panel.hidden = false;
  });
});

// ---- Deposit lookup ----
const lookupForm = document.getElementById("lookup-form");
const lookupResult = document.getElementById("lookup-result");

lookupForm.addEventListener("submit", e => {
  e.preventDefault();
  const account = document.getElementById("lk-account").value.trim().toLowerCase();
  const ref = document.getElementById("lk-ref").value.trim().toLowerCase();

  if (!account && !ref) {
    renderNotFound("Enter an account number and/or a reference number to search.");
    return;
  }

  const match = DEPOSITS.find(d => {
    const accMatch = account ? d.account.toLowerCase() === account : true;
    const refMatch = ref ? d.reference.toLowerCase() === ref : true;
    // require at least one provided field to actually match a record
    const accProvidedMatch = account && d.account.toLowerCase() === account;
    const refProvidedMatch = ref && d.reference.toLowerCase() === ref;
    return accMatch && refMatch && (accProvidedMatch || refProvidedMatch);
  });

  if (!match) {
    renderNotFound(`No deposit found for account <strong>${escapeHtml(document.getElementById("lk-account").value.trim() || "—")}</strong> / reference <strong>${escapeHtml(document.getElementById("lk-ref").value.trim() || "—")}</strong>.`);
    return;
  }

  renderDeposit(match);
});

document.getElementById("lk-clear").addEventListener("click", () => {
  lookupForm.reset();
  lookupResult.innerHTML = "";
});

function renderDeposit(d) {
  const routeBlock = d.route
    ? `<div class="route-note">⚠ ${escapeHtml(d.note)}</div>`
    : `<div class="timeline-note">${escapeHtml(d.note)}</div>`;
  lookupResult.innerHTML = `
    <div class="card status-card">
      <div class="sc-top">
        <h2>Deposit ${escapeHtml(d.reference)}</h2>
        <span class="status-badge ${d.statusClass}">${escapeHtml(d.status)}</span>
      </div>
      <div class="detail-grid">
        <div><div class="dg-label">Client Account</div><div class="dg-value">${escapeHtml(d.account)}</div></div>
        <div><div class="dg-label">Client</div><div class="dg-value">${escapeHtml(d.client)}</div></div>
        <div><div class="dg-label">Method</div><div class="dg-value">${escapeHtml(d.method)}</div></div>
        <div><div class="dg-label">Amount</div><div class="dg-value">${escapeHtml(d.amount)}</div></div>
        <div><div class="dg-label">Deposit Date</div><div class="dg-value">${escapeHtml(d.date)}</div></div>
        <div><div class="dg-label">Reference #</div><div class="dg-value">${escapeHtml(d.reference)}</div></div>
      </div>
      ${routeBlock}
    </div>`;
}

function renderNotFound(msg) {
  lookupResult.innerHTML = `<div class="card not-found">${msg}</div>`;
}

// ---- Case management ----
const CASE_KEY = "ej_bos_cases_v1";
const caseForm = document.getElementById("case-form");
const caseTbody = document.getElementById("case-tbody");
const caseCount = document.getElementById("case-count");
const caseToast = document.getElementById("case-toast");

function loadCases() {
  try { return JSON.parse(localStorage.getItem(CASE_KEY)) || []; }
  catch { return []; }
}
function saveCases(cases) {
  localStorage.setItem(CASE_KEY, JSON.stringify(cases));
}
function nextCaseId(cases) {
  const n = cases.length + 1;
  return "CASE-" + String(2600 + n).padStart(4, "0");
}

caseForm.addEventListener("submit", e => {
  e.preventDefault();
  const cases = loadCases();
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  const newCase = {
    id: nextCaseId(cases),
    account: document.getElementById("cs-account").value.trim(),
    reference: document.getElementById("cs-ref").value.trim() || "—",
    type: document.getElementById("cs-type").value,
    priority: document.getElementById("cs-priority").value,
    notes: document.getElementById("cs-notes").value.trim(),
    status: "Open",
    opened: now
  };
  cases.unshift(newCase);
  saveCases(cases);
  renderCases();
  caseForm.reset();
  showToast(`✓ ${newCase.id} created and routed to Deposit Operations.`);
});

function renderCases() {
  const cases = loadCases();
  caseCount.textContent = cases.length;
  if (cases.length === 0) {
    caseTbody.innerHTML = `<tr class="empty-row"><td colspan="7">No cases yet. Create one above.</td></tr>`;
    return;
  }
  caseTbody.innerHTML = cases.map(c => {
    const statusPill = c.status === "Resolved" ? "pill-resolved"
      : c.status === "In Progress" ? "pill-progress" : "pill-open";
    const priClass = (c.priority === "Urgent" || c.priority === "High") ? `pri-${c.priority}` : "";
    return `<tr>
      <td class="case-id">${escapeHtml(c.id)}</td>
      <td>${escapeHtml(c.account)}</td>
      <td>${escapeHtml(c.type)}</td>
      <td class="${priClass}">${escapeHtml(c.priority)}</td>
      <td><span class="pill ${statusPill}">${escapeHtml(c.status)}</span></td>
      <td>${escapeHtml(c.opened)}</td>
      <td><button class="btn btn-ghost btn-sm" data-advance="${escapeHtml(c.id)}">Advance status</button></td>
    </tr>`;
  }).join("");
}

// Advance a case status: Open -> In Progress -> Resolved
caseTbody.addEventListener("click", e => {
  const btn = e.target.closest("[data-advance]");
  if (!btn) return;
  const id = btn.dataset.advance;
  const cases = loadCases();
  const c = cases.find(x => x.id === id);
  if (!c) return;
  c.status = c.status === "Open" ? "In Progress" : c.status === "In Progress" ? "Resolved" : "Resolved";
  saveCases(cases);
  renderCases();
  showToast(`✓ ${id} updated to "${c.status}".`);
});

function showToast(msg) {
  caseToast.textContent = msg;
  caseToast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { caseToast.hidden = true; }, 4000);
}

// ---- utils ----
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}

// init
renderCases();
