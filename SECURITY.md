# Security policy

SprintLab stores project data in the visitor's localStorage. It has no accounts, permissions system, payments, or hosted project database. An optional serverless story drafter sends the user's typed request and project context to the model provider; its key stays server-side. The deployed demo has no drafter. Do not enter secrets or sensitive personal data into demo fixtures or issue reports.

## Supported versions

Fixes target `main`. Backports and response-time commitments have not been agreed; see the [open delivery decisions](roadmap.md#critical-risks-and-decision-points).

## What to report

Secret exposure, unsafe imports, stored-content injection, loss or corruption of local data, or abuse of the optional model endpoint. Report exploitable weaknesses privately; never post keys, backups, personal data, or exploit details in a public issue.

## How to report

Use [GitHub private vulnerability reporting](https://github.com/kchan1028/sprintlab/security/advisories/new) **if enabled**. Its availability has not been verified by this change. If unavailable, do not disclose the vulnerability publicly; the owner must first establish a private reporting contact. This missing fallback is recorded in the [roadmap](roadmap.md#critical-risks-and-decision-points).

Include affected version/commit, reproduction steps using fake data, expected impact, and any safe workaround. Avoid attaching a real localStorage export.

## What happens next

The project owner coordinates triage, fixes, and disclosure. Acknowledgement targets and a private fallback contact are undecided. No audit or response guarantee is implied.

## Security requirements the product is held to

The [product quality requirements](PRODUCT.md#quality-requirements) own the security boundary. Implementation rules are in the [coding guide](docs/coding-guide.md#roles-privacy-secrets-and-audit-history).

- Only the repository module accesses localStorage; validate imported and persisted data. Destructive replacement and deletion require explicit confirmation.
- Keep the optional endpoint's key in server environment configuration. Never expose it through a browser-prefixed variable, logs, fixtures, or Git.
- Production drafting remains off until abuse protection is approved. An unauthenticated public endpoint is not safe merely because the key is server-side.
- Cloudflare header configuration exists in `public/_headers`; GitHub Pages does not apply that file. No CSP or encryption-at-rest claim is made.
