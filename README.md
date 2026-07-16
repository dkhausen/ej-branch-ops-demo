# John Doe Financial — Claims Portal (Demo)

A static, single-page mock of a **claims management portal**, built to demonstrate that an agent can do real work through **browser actions** — no backend API required. All data is fictitious; branding is a neutral placeholder ("John Doe Financial").

## Views

- **Claims Overview** — stat cards (Total Claims, In Review, Pending Attention, Value In Review) and a live **Active Claims** table with status filters. Click any row to open the claim.
- **Claim Detail** — Claim Details + Policy Information, plus a Management panel (**Status** and **Assigned To** dropdowns), **Approve / Deny** buttons, and an **Activity & Notes** feed you can post to.
- **Adjusters** — team roster with current open caseloads.

All changes (status, assignment, approve/deny, notes) persist in the browser via `localStorage`, so an agent's actions are reflected live across views.

## Demo script (browser actions)

1. Open **All Claims** → click claim `LF-2026-004812` (Harold Jensen).
2. Set **Assigned To** → *Jane Doe*, **Status** → *In Review*, or click **Approve**.
3. Add a note in **Activity & Notes**.
4. Return to the overview — the row reflects the new status/assignee, and stat counts update.

## Running locally

Fully static — open `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

To reset demo data, clear the site's `localStorage` (key `jdf_claims_v3`).

## Deployment

Published via GitHub Pages from `main` → https://dkhausen.github.io/ej-branch-ops-demo/
