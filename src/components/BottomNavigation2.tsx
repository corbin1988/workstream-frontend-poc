import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Avatar } from "flowbite-react";

interface BottomNavigation2Props {
    onRetrospectiveClick?: () => void;
    onDailyReviewClick?: () => void;
}

const sheet = {
  id: "workspace-sheet",
  tiles: [
    {
      key: "chat",
      label: "Chat",
      icon: "message-circle",
      href: "/chat",
      create: { label: "New Chat", icon: "plus", href: "/chat" },
      items: [
        { key: "new-chat", label: "New Chat", icon: "message-circle", href: "/chat" },
        { key: "recent", label: "Recent Chats", icon: "history", href: "/chat" },
        { key: "pinned", label: "Pinned", icon: "pin", href: "/chat?filter=pinned" },
      ],
    },

    {
      key: "documents",
      label: "Documents",
      icon: "file-text",
      href: "/documentation",
      create: { label: "New Doc", icon: "plus", href: "/documentation" },
      items: [
        { key: "browse", label: "Browse", icon: "folder", href: "/documentation" },
        { key: "recent", label: "Recent", icon: "clock", href: "/docs?sort=updated" },
        { key: "drafts", label: "Drafts", icon: "edit-3", href: "/docs?status=draft" },
        { key: "approved", label: "Approved", icon: "check-circle", href: "/docs?status=approved" },
      ],
    },

    {
      key: "retrospect-archive",
      label: "Retrospect Archive",
      icon: "archive",
      href: "/retrospect",
      create: { label: "New Summary", icon: "plus", href: "/retrospect/new" },
      items: [
        { key: "summaries", label: "Summaries", icon: "file-bar-chart", href: "/retrospect" },
        { key: "signoff", label: "Sign-off Queue", icon: "clipboard-check", href: "/retrospect/signoff" },
        { key: "by-team", label: "By Team", icon: "users", href: "/retrospect/teams" },
      ],
    },

    {
      key: "settings",
      label: "Settings",
      icon: "sliders",
      href: "/settings",
      create: { label: "Invite Member", icon: "user-plus", href: "/settings/members/invite" },
      items: [
        { key: "profile", label: "Profile", icon: "user", href: "/settings/profile" },
        { key: "workspace", label: "Workspace", icon: "layers", href: "/settings/workspace" },
        { key: "teams", label: "Teams", icon: "users", href: "/settings/teams" },
        { key: "members", label: "Members", icon: "users", href: "/settings/members" },
        { key: "integrations", label: "Integrations", icon: "plug", href: "/settings/integrations" },
      ],
    },
  ],
};

export default function BottomNavigation2({ onRetrospectiveClick, onDailyReviewClick }: BottomNavigation2Props) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTile, setSelectedTile] = useState(sheet.tiles[0]);
    const handleClose = () => setIsOpen(false);

    // Icon mapping
    const getIcon = (iconName: string) => {
        const icons: { [key: string]: React.ReactElement } = {
            "message-circle": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            ),
            "file-text": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            ),
            "archive": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            ),
            "sliders": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            ),
            "plus": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            ),
            "history": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            ),
            "pin": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            ),
            "folder": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            ),
            "clock": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            ),
            "edit-3": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            ),
            "check-circle": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ),
            "file-bar-chart": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            ),
            "clipboard-check": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            ),
            "users": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            ),
            "user": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            ),
            "layers": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            ),
            "plug": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            ),
            "user-plus": (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            ),
        };
        return icons[iconName] || icons["file-text"];
    };

    return (
        <>
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-600 lg:hidden">
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
                <Link
                    href="/"
                    className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-700 group ${
                        router.pathname === '/' ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                >
                    <svg 
                        className={`w-6 h-6 mb-1 ${
                            router.pathname === '/'
                                ? 'text-blue-600 dark:text-blue-500'
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
                        }`}
                        aria-hidden="true" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            stroke="currentColor" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                    </svg>
                    <span className={`text-sm ${
                        router.pathname === '/'
                            ? 'text-blue-600 dark:text-blue-500 font-semibold'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
                    }`}>Review</span>
                </Link>
                <button 
                    type="button" 
                    className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                    <svg 
                        className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" 
                        aria-hidden="true" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            stroke="currentColor" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Activity</span>
                </button>
                <button 
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                    <svg 
                        className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" 
                        aria-hidden="true" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            stroke="currentColor" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"
                        />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Hub</span>
                </button>
                <button
                    type="button"
                    onClick={onDailyReviewClick}
                    className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-700 group ${
                        router.pathname === '/workreview' ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                >
                    <svg 
                        className={`w-6 h-6 mb-1 ${
                            router.pathname === '/workreview'
                                ? 'text-blue-600 dark:text-blue-500'
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
                        }`}
                        aria-hidden="true" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            stroke="currentColor" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <span className={`text-sm ${
                        router.pathname === '/workreview'
                            ? 'text-blue-600 dark:text-blue-500 font-semibold'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
                    }`}>Daily</span>
                </button>
                <Link
                    href="/settings"
                    className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-700 group ${
                        router.pathname === '/settings' ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                >
                    <div className="mb-1">
                        <Avatar
                            img="https://i.pravatar.cc/150?img=20"
                            rounded
                            size="xs"
                        />
                    </div>
                    <span className={`text-sm ${
                        router.pathname === '/settings'
                            ? 'text-blue-600 dark:text-blue-500 font-semibold'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
                    }`}>Profile</span>
                </Link>
            </div>
        </div>

        {/* Bottom Sheet Drawer */}
        {isOpen && (
            <>
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm lg:hidden"
                    onClick={handleClose}
                    aria-hidden="true"
                />

                {/* Bottom Sheet */}
                <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl transition-transform lg:hidden ${
                    isOpen ? 'translate-y-0' : 'translate-y-full'
                }`}>
                    <div className="pb-4 max-h-[80vh] overflow-y-auto">
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        </div>

                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-4 gap-3 px-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                            {sheet.tiles.map((tile) => (
                                <button 
                                    key={tile.key}
                                    onClick={() => setSelectedTile(tile)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                                        selectedTile.key === tile.key 
                                            ? 'bg-blue-100 dark:bg-blue-900/40' 
                                            : 'bg-gray-100 dark:bg-gray-700'
                                    }`}
                                >
                                    <svg className={`w-6 h-6 mb-2 ${
                                        selectedTile.key === tile.key
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {getIcon(tile.icon)}
                                    </svg>
                                    <span className={`text-xs font-medium text-center ${
                                        selectedTile.key === tile.key
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}>{tile.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Menu Items from Sidebar */}
                        <div className="px-4 py-4 space-y-1">
                            {/* Create Action (if exists) */}
                            {selectedTile.create && (
                                selectedTile.key === 'retrospect-archive' ? (
                                    <button
                                        onClick={() => {
                                            handleClose();
                                            onRetrospectiveClick?.();
                                        }}
                                        className="flex items-center w-full px-4 py-3 text-left rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {getIcon(selectedTile.create.icon)}
                                        </svg>
                                        <div className="flex-1">
                                            <div className="font-semibold text-blue-600 dark:text-blue-400">{selectedTile.create.label}</div>
                                            <div className="text-xs text-blue-500 dark:text-blue-500">Quick action</div>
                                        </div>
                                    </button>
                                ) : (
                                    <Link
                                        href={selectedTile.create.href}
                                        onClick={handleClose}
                                        className="flex items-center w-full px-4 py-3 text-left rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {getIcon(selectedTile.create.icon)}
                                        </svg>
                                        <div className="flex-1">
                                            <div className="font-semibold text-blue-600 dark:text-blue-400">{selectedTile.create.label}</div>
                                            <div className="text-xs text-blue-500 dark:text-blue-500">Quick action</div>
                                        </div>
                                    </Link>
                                )
                            )}

                            {/* Regular Menu Items */}
                            {selectedTile.items.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    onClick={handleClose}
                                    className="flex items-center w-full px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-3 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {getIcon(item.icon)}
                                    </svg>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">{item.label}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.href}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        )}
        </>
    )
}