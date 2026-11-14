# Screen-reader check (VoiceOver, about 10 minutes)

Automated checks (axe) confirm names, roles and structure, but not how the app sounds. This script is for the owner to run before v1.0.0. Write down what you hear, especially anything confusing.

## Setup

1. `nvm use && npm run dev`, then open the URL in Safari (VoiceOver works best with Safari).
2. On **Your data**, choose **Add demo project**, then go back to **Projects**.
3. Turn on VoiceOver: **⌘ F5**. VO keys = **Control + Option**.

## Steps

| # | Do | Listen for |
|---|---|---|
| 1 | Press **VO + U**, open **Landmarks** | "Main", "Main navigation", "Breadcrumb" (on project pages) |
| 2 | Press **VO + U**, open **Headings** | SprintLab → Projects; on a project: project name → Sprints → Board → each column |
| 3 | Tab to **New project**, press Enter, Tab to **Create project**, press Enter with an empty name | "Name is required." read out with the Name field, and focus on it |
| 4 | Type a name and press Enter | Focus back on **New project** |
| 5 | Open **SprintLab (demo)**, Tab to a card's status control | "Status of …, Backlog, pop-up button" (or similar) |
| 6 | Change the status with the arrow keys and Enter | The card moves; focus stays on its status control |
| 7 | Tab to **Complete sprint** for Sprint 3, press Enter | The panel's question and the radio choices are read |
| 8 | Cancel, then open **Edit review and retro** on Sprint 2 | The field labels and hints are read |
| 9 | On **Your data**, choose **Add demo project** | "Added the demo project …" is read |

## Record

Add a short note to the v1.0.0 PR: date, macOS and Safari versions, which steps were fine, and what was confusing. Problems become issues.
