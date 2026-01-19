import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import DarkModeToggle from "./DarkModeToggle";
import { Avatar, Button } from "flowbite-react";

interface LeftSidebarProps {
    onRetrospectiveClick: () => void;
    onDailyReviewClick: () => void;
}

export default function LeftSidebar({ onRetrospectiveClick, onDailyReviewClick }: LeftSidebarProps) {
    const router = useRouter();
    const [chatOpen, setChatOpen] = useState(router.pathname === '/chat');
    const [documentsOpen, setDocumentsOpen] = useState(router.pathname === '/documentation');
    const [gettingStartedOpen, setGettingStartedOpen] = useState(false);
    const [apiDocsOpen, setApiDocsOpen] = useState(false);

    useEffect(() => {
        if (router.pathname === '/chat') {
            setChatOpen(true);
        }
        if (router.pathname === '/documentation') {
            setDocumentsOpen(true);
        }
    }, [router.pathname]);
    return (
        <aside id="sidebar-double" className="hidden lg:flex fixed left-0 top-4 z-40 h-[calc(100vh-1rem)] w-64 bg-white dark:bg-gray-900" aria-label="Sidebar">
            <div className="flex flex-col w-full h-full overflow-y-auto">
                {/* Header/Logo Area */}
                <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex items-center space-x-3">
                        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 2h4a2 2 0 012 2v2h4a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h4V4a2 2 0 012-2zm0 2v2h4V4h-4zm-4 6v8h12v-8H6z" />
                        </svg>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Workstream</span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-2 space-y-0.5">
                    {/* Chat - Expandable */}
                    <div>
                        <button
                            onClick={() => setChatOpen(!chatOpen)}
                            className="flex items-center justify-between w-full px-6 py-3 text-base font-normal text-gray-900 dark:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Chat
                            </div>
                            <svg className={`w-5 h-5 text-gray-900 dark:text-gray-100 transition-transform duration-200 ${chatOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Chat Submenu */}
                        <div className={`overflow-hidden transition-all duration-200 ${chatOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="pl-8 space-y-0.5 mt-1">
                                {/* New Chat */}
                                <Link href="/chat" className={`flex items-center px-6 py-2.5 text-base ${
                                    router.pathname === '/chat'
                                        ? 'font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                                        : 'font-normal text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                } rounded-full transition-colors`}>
                                    <svg className="w-5 h-5 mr-4 text-gray-500 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Chat
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <Link href="/activityfeed" className={`flex items-center px-6 py-3 text-base ${
                        router.pathname === '/activityfeed' 
                            ? 'font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800' 
                            : 'font-normal text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                    } rounded-full transition-colors`}>
                        <svg className="w-6 h-6 mr-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Activity Feed
                    </Link>

                    {/* Work Review */}
                    <Link href="/" className={`flex items-center px-6 py-3 text-base ${
                        router.pathname === '/' 
                            ? 'font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800' 
                            : 'font-normal text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                    } rounded-full transition-colors`}>
                        <svg className="w-6 h-6 mr-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Work Review
                    </Link>

                    {/* Daily Review */}
                    <button onClick={onDailyReviewClick} className="flex items-center w-full px-6 py-3 text-base font-normal text-gray-900 dark:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <svg className="w-6 h-6 mr-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Daily Review
                    </button>

                    {/* Summary Archive */}
                    <Link href="/retrospective" className={`flex items-center px-6 py-3 text-base ${
                        router.pathname === '/retrospective' 
                            ? 'font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800' 
                            : 'font-normal text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                    } rounded-full transition-colors`}>
                        <svg className="w-6 h-6 mr-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        Retro Archive
                    </Link>

                    {/* Documents - Expandable */}
                    <div>
                        <button
                            onClick={() => setDocumentsOpen(!documentsOpen)}
                            className="flex items-center justify-between w-full px-6 py-3 text-base font-normal text-gray-900 dark:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Documents
                            </div>
                            <svg className={`w-5 h-5 text-gray-900 dark:text-gray-100 transition-transform duration-200 ${documentsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Documents Submenu */}
                        <div className={`overflow-hidden transition-all duration-200 ${documentsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="pl-8 space-y-0.5 mt-1">
                                {/* New Document */}
                                <Link href="/documentation" className={`flex items-center px-4 py-2.5 text-base ${
                                    router.pathname === '/documentation'
                                        ? 'font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                                        : 'font-normal text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                } rounded-full transition-colors whitespace-nowrap`}>
                                    <svg className="w-5 h-5 mr-3 flex-shrink-0 text-gray-500 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Document
                                </Link>
                            </div>
                            <div className="pl-6 space-y-0.5 mt-1">
                                {/* Getting Started - Expandable */}
                                <div>
                                    <button
                                        onClick={() => setGettingStartedOpen(!gettingStartedOpen)}
                                        className="flex items-center justify-between w-full px-4 py-2.5 text-base font-normal text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Getting Started
                                        </div>
                                        <svg className={`w-4 h-4 text-gray-700 dark:text-gray-300 transition-transform duration-200 ${gettingStartedOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* Getting Started Submenu */}
                                    <div className={`overflow-hidden transition-all duration-200 ${gettingStartedOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pl-6 space-y-0.5 mt-1">
                                            <a href="#" className="flex items-center px-4 py-2 text-sm font-normal text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Quick Start Guide
                                            </a>
                                            <a href="#" className="flex items-center px-4 py-2 text-sm font-normal text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                </svg>
                                                Configuration
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* API Documentation - Expandable */}
                                <div>
                                    <button
                                        onClick={() => setApiDocsOpen(!apiDocsOpen)}
                                        className="flex items-center justify-between w-full px-4 py-2.5 text-base font-normal text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                            API Documentation
                                        </div>
                                        <svg className={`w-4 h-4 text-gray-700 dark:text-gray-300 transition-transform duration-200 ${apiDocsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* API Documentation Submenu */}
                                    <div className={`overflow-hidden transition-all duration-200 ${apiDocsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pl-6 space-y-0.5 mt-1">
                                            <a href="#" className="flex items-center px-4 py-2 text-sm font-normal text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                                Authentication
                                            </a>
                                            <a href="#" className="flex items-center px-4 py-2 text-sm font-normal text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                </svg>
                                                Architecture
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Retrospective Button (big, pill-shaped like the Tweet button) */}
                    <div className="px-6 py-6">
                        <div className="flex justify-center">
                            <Button
                                onClick={onRetrospectiveClick}
                                className="w-72 -mx-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg py-6"
                                aria-label="Open retrospective"
                            >
                                Retrospective
                            </Button>
                        </div>
                    </div>
                </nav>

                {/* Bottom account row (avatar, name, handle, actions + dark mode) */}
                <div className="mt-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Avatar
                            img="https://i.pravatar.cc/150?img=20"
                            rounded
                            size="sm"
                        />
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold dark:text-white leading-tight">Maximillian Piras</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">@MaximillianNYC</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* <button aria-label="More" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
                                </svg>
                            </button> */}
                            {/* <span className="w-2 h-2 bg-blue-500 rounded-full hidden sm:inline-block" aria-hidden="true" /> */}
                            <DarkModeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}