# Low-fidelity sketches

Rough layouts for the main screens. These show structure and content, not visual design.

## 1. Projects list

```
┌──────────────────────────────────────────────┐
│ SprintLab                          Settings  │
├──────────────────────────────────────────────┤
│ Projects                     [+ New project] │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ SprintLab          12 items · Sprint 2    │ │
│ │ Bike calculator     4 items · no sprint   │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Empty state: "No projects yet."              │
│              [Create your first project]     │
└──────────────────────────────────────────────┘
```

## 2. Project board

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Projects / SprintLab        [Board] [Planning] [Sprints]       │
│ Sprint: [Sprint 2 ▾]  Type: [All ▾]                 [+ New item] │
├────────────┬────────────┬─────────────┬────────────┬─────────────┤
│ Backlog    │ Ready      │ In Progress │ Review     │ Done        │
│ ┌────────┐ │ ┌────────┐ │ ┌─────────┐ │            │ ┌─────────┐ │
│ │STORY H │ │ │BUG   M │ │ │STORY  M │ │  No items  │ │STORY  L │ │
│ │Export  │ │ │Empty   │ │ │Board    │ │            │ │Projects │ │
│ │[Move▾] │ │ │title.. │ │ │[Move▾]  │ │            │ │         │ │
│ └────────┘ │ └────────┘ │ └─────────┘ │            │ └─────────┘ │
└────────────┴────────────┴─────────────┴────────────┴─────────────┘
```

"Move" is a menu of statuses, so status changes work by keyboard. No drag-and-drop in v1.

## 3. Work item form (dialog)

```
┌─────────────── New work item ───────────────┐
│ Type:      (•) Story  ( ) Bug               │
│ Title*:    [______________________________] │
│            ⚠ Title is required              │
│ Priority:  [Medium ▾]                       │
│ Description:                                │
│ [__________________________________________]│
│ Acceptance criteria:                        │
│  1. [______________________________] [✕]    │
│  [+ Add criterion]                          │
│                         [Cancel]  [Save]    │
└─────────────────────────────────────────────┘
```

## 4. Sprint detail

```
┌──────────────────────────────────────────────┐
│ Sprint 2 · Nov 21 – Nov 28 · Active          │
│ Goal: [Board and sprint loop working_______] │
│                                              │
│ Items (5): 3 done · 2 not done               │
│                                              │
│ Review:  [______________________________]    │
│ Retro:   Went well  [___________________]    │
│          To improve [___________________]    │
│          Actions    [___________________]    │
│                                              │
│                          [Complete sprint]   │
│ → asks: move 2 unfinished items to           │
│   ( ) Backlog  ( ) Next sprint               │
└──────────────────────────────────────────────┘
```
