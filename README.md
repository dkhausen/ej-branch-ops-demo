# Branch Operations Support — Demo

A static, single-page mock of an internal **Branch Operations** tool, built to demonstrate that an agent can do real work through **browser actions** — no backend API required. Modeled on procedure **OPS-TXN-022 (Deposit Status Inquiry)**. All data is fictitious and the branding is intentionally generic.

## Views

- **Dashboard** — stat cards (Total Deposits, Processing, Open Cases, Total Value) plus recent deposits and open cases.
- **Deposits & Wires** — clickable list of deposits/checks/wires with status filters. Each opens a detail view with a **Status** dropdown (Received / Processing / Completed / Rejected-Returned), **Assigned To**, **Mark Completed** / **Route to Deposit Ops** actions, and an Activity & Notes feed.
- **Cases** — clickable list of follow-up cases with filters and a **+ New Case** form. Each case detail has Status (Open / In Progress / Resolved), Priority, Assigned To, **Mark Resolved** / **Escalate** actions, and notes.
- **Team** — branch/deposit ops staff with current open workload.

All changes persist in the browser via `localStorage`, so an agent's actions are reflected live across views. Data seeds fresh per visitor.

## Seeded deposits

| Reference | Client / Account | Method | Amount | Status |
|-----------|------------------|--------|--------|--------|
| `WT-100248` | R. Delgado / `8842-01` | ACH | $12,500.00 | Processing |
| `WT-100311` | M. Okafor / `3391-07` | Check | $4,200.00 | Completed |
| `WT-100355` | Hartwell Family Trust / `5017-22` | Wire | $85,000.00 | Received |
| `WT-100199` | J. Castellano / `2245-88` | Check (out-of-state) | $1,750.00 | Rejected / Returned |
| `WT-100402` | P. Nguyen / `6620-13` | Check (out-of-state) | $9,300.00 | Processing |
| `WT-100418` | K. Alvarez / `7788-04` | Wire | $150,000.00 | Received |
| `WT-100377` | D. Whitfield / `4410-19` | ACH | $3,600.00 | Completed |
| `WT-100205` | S. Park / `9021-33` | Wire (international) | $220,000.00 | Processing |

## Demo script (browser actions)

- **Status check:** Deposits & Wires → click `WT-100248` → read status/timeline → set **Status → Completed** or **Route to Deposit Ops**.
- **Open a case:** Cases → **+ New Case** → fill account `2245-88`, type *Deposit rejected / returned* → Create → then **Escalate** or add a note.

## Running locally

Fully static — open `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

Reset demo data by clearing the site's `localStorage` (keys `jdf_deposits_v1`, `jdf_cases_v1`).

## Deployment

Published via GitHub Pages from `main` → https://dkhausen.github.io/ej-branch-ops-demo/
