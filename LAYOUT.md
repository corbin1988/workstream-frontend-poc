# Layout System Documentation

## Overview

The application uses a centralized layout system that provides consistent navigation and UI components across all pages. The main layout includes:

- **LeftSidebar**: Navigation menu with chat, activity feed, work review, and other features
- **WorkDrawer3**: Daily review drawer for triaging work items
- **Drawer**: Retrospective drawer (from RetroDrawer component)

## MainLayout Component

Located at `src/components/MainLayout.tsx`, this component wraps pages that need the standard application layout.

## How It Works

The `_app.tsx` file automatically applies `MainLayout` to all pages by default, with the following exceptions:

### Pages Without Layout (by route)
The following routes are automatically excluded from the layout:
- `/settings`
- `/login`
- `/signup`

### Opting Out of Layout (per page)

Individual pages can opt out of the layout by adding a static property:

```tsx
export default function MyPage() {
  return (
    <div>
      {/* Your page content without sidebar/drawers */}
    </div>
  );
}

// Opt out of the main layout
MyPage.useLayout = false;
```

### Examples

#### Page with Layout (default)
```tsx
// src/pages/index.tsx
export default function Home() {
  return (
    <>
      <main className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-900 lg:ml-64 xl:mr-96 px-2 sm:px-4 md:px-6 lg:px-8 pt-4 pb-20 space-y-2">
        {/* Your content */}
      </main>
      <RightSidebar />
    </>
  );
}
```

#### Page without Layout
```tsx
// src/pages/settings.tsx
export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Full-screen content without sidebar */}
    </div>
  );
}

Settings.useLayout = false;
```

## Styling Considerations

### Pages with Layout
When using the layout, add the `lg:ml-64` class to your main content to account for the sidebar width:

```tsx
<main className="flex-1 lg:ml-64">
  {/* Content */}
</main>
```

If you also use the right sidebar, add `xl:mr-96`:

```tsx
<main className="flex-1 lg:ml-64 xl:mr-96">
  {/* Content */}
</main>
```

### Pages without Layout
No special margin classes needed:

```tsx
<div className="min-h-screen">
  {/* Full-width content */}
</div>
```

## Drawer State Management

Both drawers (Retrospective and Daily Review) are managed at the layout level, so:
- State is preserved when navigating between pages
- Multiple pages can trigger the same drawers
- No need to duplicate drawer components in each page

## Adding New Pages

### Standard Page (with layout)
1. Create your page in `src/pages/`
2. Add appropriate margin classes (`lg:ml-64`) to account for the sidebar
3. No additional configuration needed - layout is applied automatically

### Special Page (without layout)
1. Create your page in `src/pages/`
2. Add `MyPage.useLayout = false;` at the bottom of the file
3. OR add the route to the `noLayoutPages` array in `_app.tsx`

## Benefits

✅ **DRY**: Sidebar and drawers defined once, used everywhere  
✅ **Consistent**: Same navigation experience across all pages  
✅ **Flexible**: Easy to opt out for special pages  
✅ **Maintainable**: Changes to sidebar/drawers automatically apply everywhere  
✅ **State Management**: Drawer state managed at layout level
