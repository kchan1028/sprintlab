# Audit findings

Public-safe register of observed defects and readiness gaps. Requirements live in [PRODUCT.md](PRODUCT.md), status in [roadmap.md](roadmap.md), and security reports follow [SECURITY.md](SECURITY.md). This scaffold is not a security, accessibility, or production audit.

## Current audit

Documentation inventory performed 2026-11-17. Coverage: existing docs, source layout, package scripts, CI, and links. Runtime behavior and external settings were not reverified.

## How findings are recorded

Stable IDs use `AUD-` for observed defects and `GAP-` for readiness gaps. Severity is Critical for irreversible local-data loss or secret exposure; High for incorrect imports or sprint integrity with no workaround; Medium for incorrect behavior with a workaround; Low for cosmetic or maintenance issues. Record an owner, launch impact, and status: Open, Fixed (pending verification), Closed, Accepted risk (dated owner decision), or Invalidated.

### Closure rule

Close a finding only with independently reviewed evidence tied to a commit and scenario. A merged fix alone is Fixed (pending verification). Do not publish exploitable weakness details here.

## Observed defects

| ID | Finding | Severity | Launch impact | Owner | Status | Closure evidence |
|---|---|---|---|---|---|---|
| AUD-001 | Starting a planned sprint removes the focused Start button as its row moves above the board | Medium | Keyboard usability follow-up | Change author | Fixed (pending verification) | #51 fix and component/Chromium regressions; independent review required before closure |

## Documented readiness gaps

| ID | Gap | Severity | Launch impact | Owner | Status | Closure evidence |
|---|---|---|---|---|---|---|
| GAP-001 | No screen-reader pass recorded | Medium | Owner waived for existing release; revisit before stronger accessibility claims | Project owner | Open | [Release checklist](docs/release-checklist.md) records omission |
| GAP-002 | Successful real-key drafting unverified | Medium | Blocks claiming tested draft success, not core app use | Project owner | Open | [v1.1.0 limitations](docs/releases/v1.1.0.md) |
| GAP-003 | Production and non-Chromium behavior unverified | Medium | No production verification claim; local-only owner policy retained | Project owner | Open | [Test plan](docs/testing/test-plan.md#what-is-not-tested-known-gaps) |

## Not assessed

Security audit, model quality, production runtime, private reporting settings, real-device usability, and large-data performance. Automated link validation is not evidence of correctness in these areas.
