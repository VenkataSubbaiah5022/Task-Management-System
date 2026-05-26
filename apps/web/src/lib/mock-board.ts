import type { ActivityItem, KanbanColumn } from "@tms/shared";

export const DEMO_BOARD_ID = "demo-product-launch";

export const demoColumns: KanbanColumn[] = [
  {
    id: "col-backlog",
    title: "Backlog",
    order: 0,
    tasks: [
      {
        id: "t-1",
        title: "Define MVP scope",
        description: "Align stakeholders on v1 boundaries.",
        priority: "HIGH",
        order: 0,
        assignee: { id: "u-1", name: "Alex Rivera", imageUrl: null },
      },
      {
        id: "t-2",
        title: "Competitive audit",
        description: null,
        priority: "MEDIUM",
        order: 1,
        assignee: null,
      },
    ],
  },
  {
    id: "col-progress",
    title: "In Progress",
    order: 1,
    tasks: [
      {
        id: "t-3",
        title: "Kanban drag-and-drop",
        description: "dnd-kit with optimistic updates.",
        priority: "URGENT",
        order: 0,
        assignee: { id: "u-2", name: "Jordan Lee", imageUrl: null },
      },
      {
        id: "t-4",
        title: "JWT + role guards",
        description: "Owner/Admin/Member permissions.",
        priority: "HIGH",
        order: 1,
        assignee: { id: "u-1", name: "Alex Rivera", imageUrl: null },
      },
    ],
  },
  {
    id: "col-review",
    title: "Review",
    order: 2,
    tasks: [
      {
        id: "t-5",
        title: "Activity feed UI",
        description: null,
        priority: "MEDIUM",
        order: 0,
        assignee: { id: "u-3", name: "Sam Patel", imageUrl: null },
      },
    ],
  },
  {
    id: "col-done",
    title: "Done",
    order: 3,
    tasks: [
      {
        id: "t-6",
        title: "Monorepo scaffold",
        description: "Turborepo + Next.js on Vercel.",
        priority: "LOW",
        order: 0,
        assignee: { id: "u-2", name: "Jordan Lee", imageUrl: null },
      },
    ],
  },
];

export const demoActivities: ActivityItem[] = [
  {
    id: "a-1",
    type: "TASK_MOVED",
    message: "moved Kanban drag-and-drop to In Progress",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    actor: { name: "Jordan Lee", imageUrl: null },
  },
  {
    id: "a-2",
    type: "TASK_CREATED",
    message: "created JWT + role guards",
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    actor: { name: "Alex Rivera", imageUrl: null },
  },
  {
    id: "a-3",
    type: "MEMBER_JOINED",
    message: "joined the workspace",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    actor: { name: "Sam Patel", imageUrl: null },
  },
];
