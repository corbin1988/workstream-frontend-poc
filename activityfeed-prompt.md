# Prompt for GitHub/Bitbucket Activity Feed

I'm building a **Work Activity Feed** component for a Next.js/TypeScript project that displays real-time Git activity from GitHub/Bitbucket webhooks.

## Context
This is part of a work tracking system focused on **observable engineering work** rather than self-reported status. The Activity Feed should surface Git events that indicate real progress and collaboration.

## Design Requirements

### Visual Style:
- Use Flowbite React components (Avatar, Badge, etc.)
- Match the existing design system used in `Feed5.tsx` - clean, Twitter-like card layout
- Dark mode support with Tailwind classes (`dark:`)
- Responsive design (mobile-first, with `sm:` and `lg:` breakpoints)
- Cards should have hover states and smooth transitions

### Team Filtering:
- Add a team filter component (similar to `TeamFilter.tsx` pattern)
- The feed should be sortable/filterable by team
- Pass `selectedTeam` prop to the feed component
- Filter activities based on repo ownership or team association

### Page Structure:
- Use `MainLayout` wrapper (includes `LeftSidebar` and `BottomNavigation2`)
- The page file is `/src/pages/activityfeed.tsx`
- Feed component should be in `/src/components/ActivityFeed.tsx`

## Webhook Events to Support

Model the activity feed around events that GitHub and Bitbucket webhooks can provide:

### Code Events:
- Push to branch (commits)
- Branch created/deleted
- PR opened/draft/ready for review
- PR updated (new commits pushed)
- PR review submitted (approved, changes requested, commented)
- PR review comments (inline code review)
- PR merged/closed
- Release created

### Collaboration Events:
- Issue comment
- PR comment (general discussion)
- PR assigned/unassigned
- PR labeled
- Reviewer requested

## Activity Card Design

Each activity card should show:

### 1. Header:
- Avatar with initials or user image
- Author name (bold)
- Timestamp (relative format: "2h ago", "Yesterday", "Jan 15")
- Event type icon

### 2. Event Description:
- Clear, human-readable event summary
- E.g., "pushed 3 commits to feature/api-endpoint"
- E.g., "requested review from @jsmith on PR #456"

### 3. Context (when applicable):
- For commits: show commit message(s), truncated
- For PRs: show PR title, number, base branch
- For reviews: show review state badge (Approved, Changes Requested)
- For comments: show comment excerpt (first 150 chars)

### 4. Metadata:
- Repository name (link to repo)
- Branch name (monospace font)
- PR number (if applicable)
- Team badge (for filtering)
- File change stats for pushes (+12 -5, 3 files)

### 5. Interactive Elements:
- External link icon to open GitHub/Bitbucket URL
- Expandable sections for commit details or long comments
- "View on GitHub" button

## Data Structure

Create mock data that represents webhook payload transformed into feed items:

```typescript
interface ActivityEvent {
  id: string;
  type: 'push' | 'pr_opened' | 'pr_merged' | 'pr_review' | 'pr_comment' | 'branch_created' | 'branch_deleted';
  timestamp: string;
  author: string;
  repo: string;
  team: string;
  
  // Conditional based on type
  branch?: string;
  commits?: {
    sha: string;
    message: string;
    files_changed: number;
    insertions: number;
    deletions: number;
  }[];
  
  pr?: {
    number: number;
    title: string;
    state: 'open' | 'merged' | 'closed';
    url: string;
    base: string;
    head: string;
  };
  
  review?: {
    state: 'approved' | 'changes_requested' | 'commented';
    body: string;
  };
  
  comment?: {
    body: string;
    url: string;
  };
}
```

## Key Behaviors

1. **Chronological Order:** Most recent events first
2. **Real-time Feel:** Use relative timestamps, fresh styling for recent events
3. **Contextual Grouping:** Consider grouping multiple commits from same push
4. **Smart Truncation:** Long commit messages and comments should truncate with "Show more"
5. **No Metrics:** Don't show productivity scores or velocity - just observable events
6. **Team Context:** Each event should clearly indicate which team/project it belongs to

## Inspiration from Work Review Cards

The Activity Feed should feel complementary to the Work Review feed (`Feed5.tsx`):
- Work Review = **state of in-progress work** (what's happening now)
- Activity Feed = **stream of events** (what just happened)

Both should use the same visual language and component patterns.

## Technical Notes

- Use the existing `mockWorkData.json` structure as reference for team/project data
- Create a new mock data file for activity events
- Component should accept `selectedTeam` prop for filtering
- Use Flowbite's `Avatar`, `Badge`, and layout utilities
- Maintain accessibility (aria-labels, semantic HTML)

Please implement the ActivityFeed component and activityfeed page following these specifications.
