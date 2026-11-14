import { addDays } from './dates'
import type { Priority, Project, Sprint, Status, Timestamp, WorkItem, WorkItemType } from './types'

export const DEMO_PROJECT_NAME = 'SprintLab (demo)'

export interface DemoRecords {
  project: Project
  sprints: Sprint[]
  workItems: WorkItem[]
}

interface DemoItem {
  title: string
  type: WorkItemType
  priority: Priority
  status: Status
  sprint: 0 | 1 | 2 | 3 | null
  criteria: string[]
}

// Based on SprintLab's own backlog (GitHub issues #1–#17). Dates are illustrative.
const ITEMS: DemoItem[] = [
  { title: 'Repo foundations: templates, CONTRIBUTING, CLAUDE.md', type: 'story', priority: 'high', status: 'done', sprint: 0, criteria: ['Issue and PR templates appear on GitHub'] },
  { title: 'App scaffold and CI checks on pull requests', type: 'story', priority: 'high', status: 'done', sprint: 0, criteria: ['A PR with a failing test shows a failed check'] },
  { title: 'Projects: create, edit and list', type: 'story', priority: 'high', status: 'done', sprint: 0, criteria: ['An empty name shows an inline error', 'Projects persist after reload'] },
  { title: 'Board with five statuses', type: 'story', priority: 'high', status: 'done', sprint: 1, criteria: ['Status can be changed with the keyboard'] },
  { title: 'Sprints: create a sprint with a goal', type: 'story', priority: 'medium', status: 'done', sprint: 1, criteria: ['Only one active sprint per project'] },
  { title: 'New sprint defaulted to the previous sprint’s dates', type: 'bug', priority: 'medium', status: 'done', sprint: 1, criteria: ['A new sprint starts the day after the latest one ends'] },
  { title: 'Validation and error-state sweep', type: 'story', priority: 'high', status: 'done', sprint: 2, criteria: ['A failed save never loses input'] },
  { title: 'Accessibility pass', type: 'story', priority: 'high', status: 'review', sprint: 2, criteria: ['Focus returns after every form', 'axe finds no violations'] },
  { title: 'Data safety: delete, export and import', type: 'story', priority: 'medium', status: 'in_progress', sprint: 2, criteria: ['Invalid imports change nothing'] },
  { title: 'v1.0.0 release', type: 'story', priority: 'high', status: 'ready', sprint: 3, criteria: ['README has screenshots and setup steps'] },
  { title: 'Screen-reader check with VoiceOver', type: 'story', priority: 'medium', status: 'backlog', sprint: 3, criteria: ['Main flow works with VoiceOver'] },
  { title: 'AI story drafter (stretch)', type: 'story', priority: 'low', status: 'backlog', sprint: null, criteria: ['Drafts are reviewed before saving'] },
]

/**
 * Builds a demo project shaped like SprintLab's own development: two completed
 * sprints with review and retro, one active, one planned. New ids every time,
 * so it can be added next to real data without collisions.
 */
export function buildDemo(today: string, now: Timestamp, newId: () => string): DemoRecords {
  const project: Project = {
    id: newId(),
    name: DEMO_PROJECT_NAME,
    description: 'Demo data based on SprintLab’s own backlog. Dates are illustrative.',
    createdAt: now,
    updatedAt: now,
  }

  const sprint = (name: string, goal: string, offsetDays: number, state: Sprint['state'], notes?: Pick<Sprint, 'review' | 'retro'>): Sprint => ({
    id: newId(),
    projectId: project.id,
    name,
    goal,
    startDate: addDays(today, offsetDays),
    endDate: addDays(today, offsetDays + 6),
    state,
    review: notes?.review ?? '',
    retro: notes?.retro ?? { wentWell: '', toImprove: '', actions: '' },
  })

  const sprints = [
    sprint('Sprint 1', 'A deployed skeleton with CI and a working list of projects', -24, 'completed', {
      review: '7 of 7 issues shipped, including the stretch item.',
      retro: {
        wentWell: 'Checking current library versions first caught Node mismatches early.',
        toImprove: 'No sprint goal was written down at the start.',
        actions: 'Write the goal before the first issue starts.',
      },
    }),
    sprint('Sprint 2', 'Work moves across the board and into sprints', -17, 'completed', {
      review: 'Board, sprints, planning and completion shipped.',
      retro: {
        wentWell: 'Local browser checks found a date bug the tests missed.',
        toImprove: 'The goal still wasn’t agreed before starting.',
        actions: 'Agree the goal on the milestone first.',
      },
    }),
    sprint('Sprint 3', 'Keyboard-friendly, safe with data, clear about errors', -3, 'active'),
    sprint('Sprint 4', 'Release v1.0.0', 4, 'planned'),
  ]

  const workItems: WorkItem[] = ITEMS.map((item) => ({
    id: newId(),
    projectId: project.id,
    type: item.type,
    title: item.title,
    description: '',
    priority: item.priority,
    acceptanceCriteria: item.criteria,
    status: item.status,
    sprintId: item.sprint === null ? null : sprints[item.sprint].id,
    createdAt: now,
    updatedAt: now,
  }))

  return { project, sprints, workItems }
}
