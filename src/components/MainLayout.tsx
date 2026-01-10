import { useState, ReactNode } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import WorkDrawer3 from "@/components/WorkDrawer3";
import Drawer from "@/components/Drawer";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [workDrawerOpen, setWorkDrawerOpen] = useState(false);

  return (
    <>
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <WorkDrawer3 isOpen={workDrawerOpen} onClose={() => setWorkDrawerOpen(false)} />

      <div className="bg-gray-50 dark:bg-gray-900 antialiased min-h-screen overflow-y-auto overscroll-none">
        <div className="flex min-h-screen">
          <LeftSidebar
            onRetrospectiveClick={() => setDrawerOpen(true)}
            onDailyReviewClick={() => setWorkDrawerOpen(true)}
          />

          {children}
        </div>
      </div>
    </>
  );
}
