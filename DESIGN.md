# Design system: SprintLab

Status: incumbent implementation documented from `src/index.css` on 2026-11-17. The #49 refinements preserve the incumbent identity while adding an active-work hierarchy and appearance preferences. No redesign or reference brand has been selected. Product constraints live in [PRODUCT.md](PRODUCT.md).

## Overview

A task-focused browser interface with a centered application shell, project lists, native forms, sprint sections, and a five-column board. Clear labels, visible focus, and readable errors support the existing keyboard workflow. Existing screenshots are in [README.md](README.md).

## Colors

Semantic custom properties use CSS `light-dark()` with `color-scheme`. Explicit light/dark choices set the scheme; System leaves both schemes available so OS/browser changes apply automatically. Native form controls follow the same scheme.

| Role | Light | Dark |
|---|---|---|
| Text / surface | `#1f2328` / `#ffffff` | `#e6edf3` / `#111820` |
| Muted text | `#59636e` | `#aebdcd` |
| Border / control border | `#d0d7de` / `#8c959f` | `#3b4959` / `#7a8b9f` |
| Link, focus, primary surface | `#0969da` | `#8fc5ff` |
| Primary text | `#ffffff` | `#111820` |
| Column surface | `#f6f8fa` | `#1a2430` |
| Error text / surface | `#b42330` / `#fff5f5` | `#ffaba8` / `#351b23` |
| Active / success | `#1a7f37` | `#8cdba1` |
| Completed | `#6639ba` | `#c8aeff` |

State badges keep textual meaning. Destructive buttons use white on `#b42330` in both appearances. Focus, selection, caret, and scrollbars use the semantic palette. This is an implementation record, not a full accessibility certification.

## Typography

System UI stack: `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, sans-serif. Base line height is 1.5. Item metadata uses 0.875rem; card titles use 0.9375rem; project titles use 1rem. Forms inherit the surrounding font.

## Layout and components

The `.app` shell has an 80rem maximum width, with 2rem/1.5rem vertical/horizontal padding and 1rem phone padding. Semantic spacing tokens use quarter-rem increments. Lists use separators; cards and panels retain 4px/6px corners and thin borders.

The active goal leads, then the board, upcoming sprints, completed-history disclosure, and quieter project management. Board columns change from five to two at 1200px and one at 700px. At phone widths, empty columns are omitted when work exists; populated-column jump links aid navigation. Empty boards retain the Backlog prompt. All statuses remain available through native item controls.

Buttons, selects, text inputs, and summaries have at least 44px height. Primary actions use the accent fill, secondary controls use bordered surfaces, and destructive confirmation stays explicit. Status is always visible; assignment, description, and criteria use a native details disclosure. Keyboard focus uses a 2px outline with 2px offset. Do not visually reorder DOM controls or hide the focus-return target.

Preserve native labelled controls, confirmation panels, save/recovery errors, and focus behavior. Read the current CSS and components before modifying them; this file is a summary of their baseline.

## Reference material

The owner imported Awesome Design references in a local ignored `design-md/` folder and confirmed code-first design. No library brand is active. References may inspire a separately authorized design change; they do not replace the incumbent system automatically.
