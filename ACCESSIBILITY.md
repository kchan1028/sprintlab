# Accessibility

## Target

Preserve keyboard-operable core workflows, labelled controls, visible focus, usable error messages, and layouts usable on a phone. A formal WCAG conformance target is an [open product decision](PRODUCT.md#open-decisions); no conformance is claimed here.

## How accessibility will be checked

1. Run the relevant axe-based component checks and check the changed flow in a real browser. jsdom cannot measure contrast.
2. Complete the changed flow with the keyboard, checking visible focus and status-change focus handling.
3. Before claiming screen-reader verification, follow the [screen-reader script](docs/screen-reader-check.md) with VoiceOver or NVDA and record the commit and result.
4. Before claiming real-device coverage, check core flows on a real phone and with enlarged text. Desktop viewport emulation is a separate check.

## Results

Existing automated and local-browser evidence is recorded in [the testing record](docs/testing/test-plan.md) and [release checklist](docs/release-checklist.md). No new runtime checks were performed for this documentation change.

## Known limitations

The VoiceOver check was skipped for v1.0.0 and remains unperformed in v1.1.0. Browser automation covers Chromium. Full keyboard behavior in native selects needs a real interaction check. No real-device or full WCAG audit is asserted. Gaps are tracked in [AUDIT.md](AUDIT.md).

## Report a barrier

Open a public-safe bug report with the screen, action, browser, assistive technology or text setting, expected behavior, and actual result. Omit project contents and personal data. Label availability is an owner decision, so a missing accessibility label must not prevent a report.
