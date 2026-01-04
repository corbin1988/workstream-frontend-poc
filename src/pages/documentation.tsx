import LeftSidebar from "@/components/LeftSidebar";
import { Drawer } from "flowbite-react";
import { useState } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";

export default function Documentation() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            <div className="bg-gray-50 dark:bg-gray-900 antialiased h-screen overflow-hidden p-4">
                <div className="flex h-full gap-4">
                    <LeftSidebar onRetrospectiveClick={() => setDrawerOpen(true)} />

                    <main className="flex-1 bg-white dark:bg-gray-800 h-full rounded-lg shadow-lg flex flex-col overflow-hidden">
                        <MarkdownEditor />
                    </main>
                </div>
            </div>
        </>
    );
}