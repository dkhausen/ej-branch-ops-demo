# Branch Operations Support — Demo

A static, single-page mock of an internal Edward Jones **Branch Operations Support** tool, built to demonstrate that an agent can perform real work through **browser actions** — no backend API required.

Modeled on procedure **OPS-TXN-022 (Deposit Status Inquiry)**. All data is fictitious.

## What it does

- **Deposit Status Inquiry** — look up a deposit by account number + reference and read back status, method, amount, and timeline.
- **Case Management** — open a case for Deposit Operations and advance its status. Cases persist in the browser via `localStorage`.

## Seeded deposits (for the demo)

| Account   | Reference   | Method                 | Amount     | Status              |
|-----------|-------------|------------------------|------------|---------------------|
| `8842-01` | `WT-100248` | ACH                    | $12,500.00 | Processing          |
| `3391-07` | `WT-100311` | Check                  | $4,200.00  | Completed           |
| `5017-22` | `WT-100355` | Wire                   | $85,000.00 | Received            |
| `2245-88` | `WT-100199` | Check (out-of-state)   | $1,750.00  | Rejected / Returned |
| `6620-13` | `WT-100402` | Check (out-of-state)   | $9,300.00  | Processing          |

Look up a deposit with the account number, the reference number, or both.

## Running locally

It's fully static — open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Deployment

Published via GitHub Pages from the `main` branch.
