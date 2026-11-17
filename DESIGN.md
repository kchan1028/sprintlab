# Design system: SprintLab

Status: incumbent implementation documented from `src/index.css` on 2026-11-17. This records the built baseline; no redesign or reference brand has been selected. Product constraints live in [PRODUCT.md](PRODUCT.md).

## Overview

A task-focused browser interface with a centered application shell, project lists, native forms, sprint sections, and a five-column board. Clear labels, visible focus, and readable errors support the existing keyboard workflow. Existing screenshots are in [README.md](README.md).

## Colors

| Role | Existing CSS value |
|---|---|
| Main text / background | `#1f2328` / `#ffffff` |
| Muted text | `#59636e` |
| Borders / input borders | `#d0d7de` / `#8c959f` |
| Link and focus | `#0969da` |
| Column surface | `#f6f8fa` |
| Error | `#cf222e` |
| Success / active sprint | `#1a7f37` |
| Completed sprint | `#6639ba` |

State badges also carry text; color is not their only meaning. These are observed values, not a new contrast certification.

## Typography

System UI stack: `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, sans-serif. Base line height is 1.5. Item metadata uses 0.875rem; card titles use 0.9375rem; project titles use 1rem. Forms inherit the surrounding font.

## Layout and components

The `.app` shell has a 64rem maximum width and 2rem/1rem vertical/horizontal padding. Lists use separators; cards and panels use 4px or 6px corners with thin borders. The board uses five equal columns and switches to one column at 900px. Sprint summaries stack below 600px. Action groups wrap. Keyboard focus uses a 2px outline with 2px offset.

Preserve native labelled controls, confirmation panels, save/recovery errors, and focus behavior. Read the current CSS and components before modifying them; this file is a summary of their baseline.

## Reference material

The owner imported Awesome Design references in a local ignored `design-md/` folder and confirmed code-first design. No library brand is active. References may inspire a separately authorized design change; they do not replace the incumbent system automatically.
