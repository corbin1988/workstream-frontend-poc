import { useState, useEffect, useRef } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import WorkDrawer3 from "@/components/WorkDrawer3";

interface SelectedWorkItem {
  key: string;
  title: string;
  intent?: string;
  status: 'keep' | 'blocked';
  recent_changes?: string;
}

interface Message {
  role: 'system' | 'user';
  content: string;
}

interface ItemState {
  reviewed: boolean;
  messages: Message[];
}

const mockSelectedWorkItems: SelectedWorkItem[] = [
  {
    key: 'ABC-123',
    title: 'Add authentication endpoint for mobile clients',
    intent: 'Enable mobile app users to authenticate securely',
    status: 'keep',
  },
  {
    key: 'ABC-156',
    title: 'Fix dashboard loading performance',
    intent: 'Reduce initial page load time for analytics dashboard',
    status: 'keep',
  },
  {
    key: 'ABC-140',
    title: 'Refactor user permissions module',
    intent: 'Simplify permission logic and reduce technical debt',
    status: 'blocked',
  },
];

export default function WorkReview() {
  const [selectedWorkItems] = useState<SelectedWorkItem[]>(mockSelectedWorkItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentItem = selectedWorkItems[currentIndex];
  const isComplete = currentIndex >= selectedWorkItems.length;

  useEffect(() => {
    const initialStates: Record<string, ItemState> = {};
    selectedWorkItems.forEach(item => {
      initialStates[item.key] = {
        reviewed: false,
        messages: [
          {
            role: 'system',
            content: 'What did you accomplish yesterday with this item?',
          }
        ],
      };
    });
    setItemStates(initialStates);
  }, [selectedWorkItems]);

  useEffect(() => {
    if (!isComplete) {
      textareaRef.current?.focus();
    }
  }, [currentIndex, isComplete]);

  const handleSend = () => {
    if (!input.trim() || isComplete) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setItemStates(prev => ({
      ...prev,
      [currentItem.key]: {
        reviewed: true,
        messages: [...prev[currentItem.key].messages, userMessage],
      }
    }));

    selectedWorkItems[currentIndex].recent_changes = input.trim();

    setInput('');

    const nextIndex = currentIndex + 1;
    if (nextIndex < selectedWorkItems.length) {
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex(selectedWorkItems.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFinish = () => {
    console.log('Review complete. Data:', selectedWorkItems);
    alert('Review submitted! Check console for data.');
  };

  return (
    <>
      <WorkDrawer3 isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      
      <div className="bg-gray-50 dark:bg-gray-900 antialiased h-screen overflow-hidden p-4">
        <div className="flex h-full gap-4">
          <LeftSidebar 
            onRetrospectiveClick={() => {}} 
            onDailyReviewClick={() => setDrawerOpen(true)}
          />
          
          {/* Main Content - Two Column Layout */}
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 h-full overflow-hidden flex gap-4 px-4 py-4">
            {/* Left Column - Prompt + Input */}
            <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col overflow-hidden h-full">
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Daily Review Update Session
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Provide updates for each selected work item
                </p>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {isComplete ? (
                  <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
                    <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full mb-6">
                      <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      All items reviewed
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                      You have provided updates for all {selectedWorkItems.length} work items.
                    </p>
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Finish
                    </button>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Current Item Header */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                          {currentItem.key}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {currentItem.title}
                        </span>
                      </div>
                      {currentItem.intent && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {currentItem.intent}
                        </p>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="space-y-4">
                      {itemStates[currentItem.key]?.messages.map((message, idx) => (
                        <div key={idx} className="flex gap-3">
                          {message.role === 'system' ? (
                            <>
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {message.content}
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex-1" />
                              <div className="flex-1">
                                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                                U
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              {!isComplete && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex gap-2 items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-2">
                      <button
                        type="button"
                        className="flex-shrink-0 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <input
                        ref={textareaRef as any}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder=""
                        className="flex-1 bg-transparent border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                      />
                      <button
                        type="button"
                        className="flex-shrink-0 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="flex-shrink-0 p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar - Work Item Checklist */}
          <aside className="w-96 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col overflow-hidden h-full">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Work Items
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedWorkItems.filter(item => itemStates[item.key]?.reviewed).length} of {selectedWorkItems.length} reviewed
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedWorkItems.map((item, idx) => {
                    const state = itemStates[item.key];
                    const isReviewed = state?.reviewed || false;
                    const isCurrent = idx === currentIndex && !isComplete;

                    return (
                      <li
                        key={item.key}
                        className={`p-4 transition-colors ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                {item.key}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                              {item.title}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isReviewed
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {isReviewed ? 'Reviewed' : 'Not reviewed'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
